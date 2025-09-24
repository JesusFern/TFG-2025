// Script to fetch exercise video URLs from wger API and map them to our seed slugs
// Usage: node scripts/wgerSyncVideos.js

import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_PATH = path.resolve(__dirname, '../src/seeders/training/seedEjercicios.ts');
const OUTPUT_DIR = path.resolve(__dirname, './output');
const OUTPUT_OK = path.join(OUTPUT_DIR, 'wger_videos.json');
const OUTPUT_MISSING = path.join(OUTPUT_DIR, 'wger_videos_missing.json');

const WGER_BASE = 'https://wger.de/api/v2';
const LANGUAGE = 'es'; // prefer Spanish names
const WGER_USERNAME = process.env.WGER_USERNAME;
const WGER_PASSWORD = process.env.WGER_PASSWORD;

/**
 * Extracts [{ slug, nombre }] from the seed file using a lightweight regex approach.
 */
function extractExercisesFromSeed(seedContent) {
  const entries = [];
  // Use a safer approach to extract exercise blocks
  const exerciseBlocks = seedContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
  
  for (const block of exerciseBlocks) {
    // Extract nombre and slug using safer regex
    const nombreMatch = block.match(/nombre:\s*'([^']+)'/);
    const slugMatch = block.match(/slug:\s*'([^']+)'/);
    
    if (nombreMatch && slugMatch) {
      const nombre = nombreMatch[1].trim();
      const slug = slugMatch[1].trim();
      entries.push({ slug, nombre });
    }
  }
  return entries;
}

let accessToken = null;

async function getAuthToken() {
  if (accessToken) return accessToken;
  
  // Try the correct endpoint for JWT tokens
  const response = await fetch(`${WGER_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: WGER_USERNAME,
      password: WGER_PASSWORD
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authenticate: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  accessToken = data.access;
  console.log(`✓ Autenticación exitosa`);
  return accessToken;
}

async function fetchJson(url, useAuth = false) {
  const headers = { Accept: 'application/json' };
  
  if (useAuth) {
    const token = await getAuthToken();
    headers.Authorization = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '') // Remove accents
    .replaceAll(/[^\w\s]/g, '') // Remove special chars
    .replaceAll(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Cache for all exercises to avoid repeated API calls
let allExercisesCache = null;

async function getAllExercises() {
  if (allExercisesCache) return allExercisesCache;
  
  console.log(`    Descargando todos los ejercicios en español...`);
  const allExercises = [];
  let nextUrl = `${WGER_BASE}/exercise-translation/?language=${LANGUAGE}&limit=100`;
  
  while (nextUrl) {
    try {
      const data = await fetchJson(nextUrl);
      if (Array.isArray(data.results)) {
        allExercises.push(...data.results);
        console.log(`    Descargados ${allExercises.length} ejercicios...`);
      }
      nextUrl = data.next;
    } catch (err) {
      console.log(`    Error descargando ejercicios: ${err.message}`);
      break;
    }
  }
  
  allExercisesCache = allExercises;
  console.log(`    Total ejercicios descargados: ${allExercises.length}`);
  return allExercises;
}

function findBestMatch(exercises, searchTerm) {
  const normalizedSearch = normalizeText(searchTerm);
  
  // Try different matching strategies
  const strategies = [
    // Exact match (case-insensitive)
    (ex) => normalizeText(ex.name) === normalizedSearch,
    // Contains match
    (ex) => normalizeText(ex.name).includes(normalizedSearch),
    // Reverse contains match
    (ex) => normalizedSearch.includes(normalizeText(ex.name)),
    // Word-by-word match
    (ex) => {
      const exWords = normalizeText(ex.name).split(' ');
      const searchWords = normalizedSearch.split(' ');
      return searchWords.every(word => exWords.some(exWord => exWord.includes(word) || word.includes(exWord)));
    },
    // Partial word match
    (ex) => {
      const exWords = normalizeText(ex.name).split(' ');
      const searchWords = normalizedSearch.split(' ');
      return searchWords.some(word => exWords.some(exWord => exWord.includes(word) || word.includes(exWord)));
    }
  ];
  
  for (const strategy of strategies) {
    const matches = exercises.filter(strategy);
    if (matches.length > 0) {
      return matches[0];
    }
  }
  
  return null;
}

async function findExerciseIdByName(nombre) {
  console.log(`  Buscando: "${nombre}"`);
  
  try {
    const allExercises = await getAllExercises();
    
    // Try different search terms
    const searchTerms = [
      nombre,
      normalizeText(nombre),
      // Common Spanish variations
      nombre.replace('Press', 'Prensa'),
      nombre.replace('Flexiones', 'Push-ups'),
      nombre.replace('Dominadas', 'Pull-ups'),
      nombre.replace('Sentadilla', 'Squat'),
      nombre.replace('Peso muerto', 'Deadlift'),
      nombre.replace('Curl', 'Curls'),
      nombre.replace('Tríceps', 'Triceps'),
      nombre.replace('Bíceps', 'Biceps'),
      // Remove common words
      nombre.replaceAll(/\b(de|con|en|del|la|el|las|los)\b/g, '').trim(),
      // First word only
      nombre.split(' ')[0],
      // Last word only
      nombre.split(' ').slice(-1)[0]
    ].filter(Boolean);
    
    for (const term of searchTerms) {
      console.log(`    Probando término: "${term}"`);
      const match = findBestMatch(allExercises, term);
      
      if (match) {
        console.log(`    ✓ Encontrado: "${match.name}" (ID: ${match.exercise})`);
        return match.exercise;
      }
    }
    
    console.log(`    ✗ No encontrado`);
    return null;
    
  } catch (err) {
    console.log(`    Error en búsqueda: ${err.message}`);
    return null;
  }
}

async function fetchFirstVideoByExerciseId(exerciseId) {
  const url = `${WGER_BASE}/video/?exercise=${exerciseId}`;
  
  // Try with auth first, then without auth as fallback
  let data;
  try {
    data = await fetchJson(url, true); // Use auth for videos
  } catch {
    console.log(`    Auth falló, intentando sin autenticación...`);
    data = await fetchJson(url, false); // Try without auth
  }
  
  console.log(`    Videos encontrados: ${data.results?.length || 0}`);
  
  if (Array.isArray(data.results) && data.results.length > 0) {
    // Show available videos
    data.results.forEach((v, i) => {
      console.log(`      ${i + 1}. ${v.video} (${v.duration}s, ${v.width}x${v.height})`);
    });
    
    // Prefer main videos, then YouTube links, then first available
    const main = data.results.find((v) => v.is_main === true);
    const yt = data.results.find((v) => typeof v.video === 'string' && v.video.includes('youtube'));
    const chosen = main || yt || data.results[0];
    console.log(`    ✓ Seleccionado: ${chosen.video}`);
    return chosen.video;
  }
  return null;
}

async function main() {
  if (!fs.existsSync(SEED_PATH)) {
    console.error(`Seed file not found at ${SEED_PATH}`);
    process.exit(1);
  }

  const seedContent = fs.readFileSync(SEED_PATH, 'utf-8');
  const exercises = extractExercisesFromSeed(seedContent);
  if (exercises.length === 0) {
    console.error('No se encontraron ejercicios en el seeder.');
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const ok = {};
  const missing = {};

  console.log(`Procesando ${exercises.length} ejercicios contra la API de wger...`);
  console.log(`Autenticando con usuario: ${WGER_USERNAME}`);

  // Try to authenticate first
  try {
    await getAuthToken();
  } catch (err) {
    console.log(`⚠️  Autenticación falló: ${err.message}`);
    console.log(`Continuando sin autenticación (algunos videos pueden no estar disponibles)...`);
  }

  // Simple rate limiter to be polite (500ms between requests)
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const { slug, nombre } of exercises) {
    try {
      const exerciseId = await findExerciseIdByName(nombre);
      await delay(500);
      if (!exerciseId) {
        missing[slug] = { nombre, reason: 'exercise_not_found' };
        continue;
      }
      const videoUrl = await fetchFirstVideoByExerciseId(exerciseId);
      await delay(500);
      if (videoUrl) {
        ok[slug] = { nombre, videoUrl };
      } else {
        missing[slug] = { nombre, reason: 'no_video' };
      }
      console.log(`• ${nombre} (${slug}) -> ${videoUrl || 'sin video'}`);
      console.log(''); // Empty line for readability
    } catch (err) {
      missing[slug] = { nombre, reason: String(err && err.message ? err.message : err) };
      console.error(`Error con '${nombre}' (${slug}):`, err.message || err);
      console.log(''); // Empty line for readability
      // short pause after error
      await delay(500);
    }
  }

  fs.writeFileSync(OUTPUT_OK, JSON.stringify(ok, null, 2), 'utf-8');
  fs.writeFileSync(OUTPUT_MISSING, JSON.stringify(missing, null, 2), 'utf-8');

  console.log(`\nListo. Guardado:`);
  console.log(`  ✓ ${OUTPUT_OK}`);
  console.log(`  ✓ ${OUTPUT_MISSING}`);

  // Auto-update the seeder with found videos
  if (Object.keys(ok).length > 0) {
    console.log(`\n🔄 Actualizando seeder con ${Object.keys(ok).length} videos encontrados...`);
    await updateSeederWithVideos(ok);
  }

  console.log(`\nSiguiente paso sugerido:`);
  console.log(`  - Revisa el seeder actualizado`);
  console.log(`  - Ejecuta 'npm run seed' para actualizar la base de datos`);
}

async function updateSeederWithVideos(videos) {
  try {
    const seederContent = fs.readFileSync(SEED_PATH, 'utf-8');
    let updatedContent = seederContent;
    
    for (const [slug, { videoUrl }] of Object.entries(videos)) {
      // Find the exercise in the seeder and update its videoDemostrativo
      const exerciseRegex = new RegExp(
        `(\\{[\\s\\S]*?slug:\\s*['"]${slug}['"][\\s\\S]*?videoDemostrativo:\\s*['"])[^'"]*(['"][\\s\\S]*?\\})`,
        'g'
      );
      
      const replacement = `$1${videoUrl}$2`;
      const newContent = updatedContent.replace(exerciseRegex, replacement);
      
      if (newContent !== updatedContent) {
        updatedContent = newContent;
        console.log(`  ✓ Actualizado: ${slug} -> ${videoUrl}`);
      } else {
        console.log(`  ⚠️  No se pudo actualizar: ${slug} (patrón no encontrado)`);
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(SEED_PATH, updatedContent, 'utf-8');
    console.log(`  ✅ Seeder actualizado exitosamente`);
    
  } catch (err) {
    console.error(`  ❌ Error actualizando seeder: ${err.message}`);
  }
}

// Ensure fetch is available (Node 18+). If not, fallback to node-fetch.
(async () => {
  if (typeof fetch === 'undefined') {
    const nodeFetch = (await import('node-fetch')).default;
    globalThis.fetch = nodeFetch;
  }
  await main();
})();



import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_PATH = path.resolve(__dirname, '../src/seeders/training/seedEjercicios.ts');
const VIDEOS_JSON = path.resolve(__dirname, './output/wger_videos.json');

// Read the videos that were found
const videosFound = JSON.parse(fs.readFileSync(VIDEOS_JSON, 'utf-8'));
const videoSlugs = new Set(Object.keys(videosFound));

console.log(`Videos encontrados para ${videoSlugs.size} ejercicios:`);
Object.entries(videosFound).forEach(([slug, { videoUrl }]) => {
  console.log(`  ✓ ${slug} -> ${videoUrl}`);
});

// Read the seeder file
let seederContent = fs.readFileSync(SEED_PATH, 'utf-8');

// Count exercises with and without videos
let exercisesWithVideos = 0;
let exercisesWithoutVideos = 0;

// Process each exercise in the seeder using a safer approach
function parseExerciseBlocks(content) {
  const blocks = [];
  let currentBlock = '';
  let braceCount = 0;
  let inBlock = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '{') {
      if (braceCount === 0) {
        inBlock = true;
        currentBlock = '';
      }
      braceCount++;
    }
    
    if (inBlock) {
      currentBlock += char;
    }
    
    if (char === '}') {
      braceCount--;
      if (braceCount === 0 && inBlock) {
        blocks.push(currentBlock);
        currentBlock = '';
        inBlock = false;
      }
    }
  }
  
  return blocks;
}

function extractSlugFromBlock(block) {
  const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/);
  return slugMatch ? slugMatch[1] : null;
}

function removeVideoField(block) {
  // Remove videoDemostrativo field using a simple string replacement
  return block.replace(/,?\s*videoDemostrativo:\s*['"][^'"]*['"]/, '');
}

// Parse exercise blocks safely
const exerciseBlocks = parseExerciseBlocks(seederContent);

// Process each block
let updatedContent = seederContent;
for (const block of exerciseBlocks) {
  const slug = extractSlugFromBlock(block);
  if (!slug) continue;
  
  if (videoSlugs.has(slug)) {
    // Keep the video for exercises that have videos
    exercisesWithVideos++;
  } else {
    // Remove videoDemostrativo field for exercises without videos
    exercisesWithoutVideos++;
    const updatedBlock = removeVideoField(block);
    updatedContent = updatedContent.replace(block, updatedBlock);
  }
}

seederContent = updatedContent;

// Write the updated content back
fs.writeFileSync(SEED_PATH, seederContent, 'utf-8');

console.log(`\n✅ Seeder actualizado:`);
console.log(`  - Ejercicios con videos: ${exercisesWithVideos}`);
console.log(`  - Ejercicios sin videos (campo removido): ${exercisesWithoutVideos}`);
console.log(`  - Total procesados: ${exercisesWithVideos + exercisesWithoutVideos}`);

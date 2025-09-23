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

// Process each exercise in the seeder
seederContent = seederContent.replace(
  /(\{[^}]*?slug:\s*['"]([^'"]+)['"][^}]*?videoDemostrativo:\s*['"][^'"]*['"][^}]*?\})/g,
  (match, fullMatch, slug) => {
    if (videoSlugs.has(slug)) {
      // Keep the video for exercises that have videos
      exercisesWithVideos++;
      return match;
    } else {
      // Remove videoDemostrativo field for exercises without videos
      exercisesWithoutVideos++;
      return match.replace(/,?\s*videoDemostrativo:\s*['"][^'"]*['"]/, '');
    }
  }
);

// Write the updated content back
fs.writeFileSync(SEED_PATH, seederContent, 'utf-8');

console.log(`\n✅ Seeder actualizado:`);
console.log(`  - Ejercicios con videos: ${exercisesWithVideos}`);
console.log(`  - Ejercicios sin videos (campo removido): ${exercisesWithoutVideos}`);
console.log(`  - Total procesados: ${exercisesWithVideos + exercisesWithoutVideos}`);

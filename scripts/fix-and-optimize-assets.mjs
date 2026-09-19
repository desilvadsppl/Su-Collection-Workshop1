import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const imagesDir = path.join(publicDir, 'images');
const oldSocialDir = path.join(publicDir, 'social media card images');
const newSocialDir = path.join(publicDir, 'social-media-card-images');

console.log('=== Su Collection Asset Fix & Optimization ===');

// 1. Fix social media card images folder (remove spaces)
if (fs.existsSync(oldSocialDir)) {
  if (!fs.existsSync(newSocialDir)) {
    fs.mkdirSync(newSocialDir, { recursive: true });
  }
  const files = fs.readdirSync(oldSocialDir);
  for (const file of files) {
    const src = path.join(oldSocialDir, file);
    const dest = path.join(newSocialDir, file);
    fs.copyFileSync(src, dest);
    console.log(`[Copied] ${file} -> social-media-card-images/${file}`);
    
    // Also create lowercase version for Linux case-insensitivity
    const lowerDest = path.join(newSocialDir, file.toLowerCase());
    if (lowerDest !== dest && !fs.existsSync(lowerDest)) {
      fs.copyFileSync(src, lowerDest);
      console.log(`[Alias] ${file} -> social-media-card-images/${file.toLowerCase()}`);
    }
  }
}

// 2. Fix landing_meet _swarna.png space bug
const badMeetFile = path.join(imagesDir, 'landing_meet _swarna.png');
const cleanMeetFile = path.join(imagesDir, 'landing_meet_swarna.png');
if (fs.existsSync(badMeetFile)) {
  fs.copyFileSync(badMeetFile, cleanMeetFile);
  console.log('[Fixed] landing_meet _swarna.png -> landing_meet_swarna.png');
}

// 3. Create lowercase aliases in public/images for Linux hosting compatibility
if (fs.existsSync(imagesDir)) {
  const imgFiles = fs.readdirSync(imagesDir);
  for (const file of imgFiles) {
    const lower = file.toLowerCase();
    if (lower !== file) {
      const src = path.join(imagesDir, file);
      const dest = path.join(imagesDir, lower);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        console.log(`[Alias] images/${file} -> images/${lower}`);
      }
    }
  }
}

// 4. Try sharp optimization if available
async function tryCompressWithSharp() {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;
    console.log('\nSharp detected! Compressing heavy images...');

    async function optimizeFolder(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) continue;
        
        const ext = path.extname(file).toLowerCase();
        // Only optimize files > 300KB
        if (stat.size > 300 * 1024 && (ext === '.png' || ext === '.jpg' || ext === '.jpeg')) {
          const originalSizeKB = Math.round(stat.size / 1024);
          const tempPath = fullPath + '.tmp';
          
          try {
            if (ext === '.png') {
              await sharp(fullPath)
                .resize({ width: 1600, withoutEnlargement: true })
                .png({ quality: 80, compressionLevel: 9, palette: true })
                .toFile(tempPath);
            } else {
              await sharp(fullPath)
                .resize({ width: 1600, withoutEnlargement: true })
                .jpeg({ quality: 80, mozjpeg: true })
                .toFile(tempPath);
            }
            
            const newStat = fs.statSync(tempPath);
            const newSizeKB = Math.round(newStat.size / 1024);
            if (newStat.size < stat.size) {
              fs.unlinkSync(fullPath);
              fs.renameSync(tempPath, fullPath);
              console.log(`[Optimized] ${file}: ${originalSizeKB}KB -> ${newSizeKB}KB (-${Math.round((1 - newStat.size / stat.size) * 100)}%)`);
            } else {
              fs.unlinkSync(tempPath);
            }
          } catch (err) {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            console.warn(`[Skip] Could not compress ${file}:`, err.message);
          }
        }
      }
    }

    await optimizeFolder(imagesDir);
    if (fs.existsSync(newSocialDir)) {
      await optimizeFolder(newSocialDir);
    }
    console.log('Image compression finished successfully!');
  } catch (e) {
    console.log('\nNote: "sharp" is not currently installed.');
    console.log('To compress raw images from 2MB down to ~150KB, you can run:');
    console.log('  npm install -D sharp');
    console.log('  node scripts/fix-and-optimize-assets.mjs');
  }
}

tryCompressWithSharp().then(() => {
  console.log('\nAsset preparation complete.');
});

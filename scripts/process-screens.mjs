// Builds web copies of the screenshots listed in assets/screenshots/manifest.json.
// Desktop: 1440 px wide. Phone and native: 720 px wide. Aspect ratios are kept; nothing is cropped.
import { readFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const manifest = JSON.parse(await readFile('assets/screenshots/manifest.json', 'utf8'));
await mkdir('public/images/screens', { recursive: true });
for (const s of manifest.screens) {
  const width = s.kind === 'desktop' ? 1440 : 720;
  const info = await sharp(`assets/screenshots/originals/${s.original}`)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`public/images/screens/${s.id}.webp`);
  console.log(`${s.id}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`);
}

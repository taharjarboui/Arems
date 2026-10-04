// Convertit les médias listés dans scripts/media-manifest.json (produit par migrate-from-sql.mjs) :
//   - images → WebP, 1600 px de large au plus (400 px pour les logos de partenaires) ;
//   - sons → MP3 mono 96 kbit/s.
// Les fichiers sources restent dans ../arems-main ; seuls les fichiers convertis entrent dans le dépôt.
// Affiche aussi les médias de l'ancien site qui ne sont pas repris.
// Usage : npm run media
import { readFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const root = fileURLToPath(new URL('..', import.meta.url));
const legacy = join(root, '../arems-main');
const manifest = JSON.parse(readFileSync(join(root, 'scripts/media-manifest.json'), 'utf8'));

let total = 0;
for (const { kind, from, to } of manifest) {
  const src = join(legacy, from);
  const dest = join(root, to);
  mkdirSync(dirname(dest), { recursive: true });
  if (kind === 'image') {
    const width = to.includes('/partenaires/') ? 400 : 1600;
    await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
  } else {
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', src, '-ac', '1', '-b:a', '96k', dest]);
  }
  total += statSync(dest).size;
}
console.log(`${manifest.length} médias convertis (${(total / 1024 / 1024).toFixed(1)} Mo).`);

// Médias de l'ancien site non repris
const used = new Set(manifest.map((m) => basename(m.from)));
for (const dir of ['public/images', 'public/sons']) {
  const path = join(legacy, dir);
  if (!existsSync(path)) continue;
  const unused = readdirSync(path).filter((f) => !used.has(f) && !f.startsWith('.'));
  if (unused.length) console.log(`\nNon repris (${dir}, ${unused.length}) : ${unused.join(', ')}`);
}

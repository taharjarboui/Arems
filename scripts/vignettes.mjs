// Génère une vignette de 800 px (`<nom>-800.webp`) à côté de chaque photo de public/images/
// (espèces, sites, sentiers, actions), pour les listes et les cartes de fiches.
// Lancé avant chaque build ; ne régénère que les vignettes absentes ou plus anciennes que leur photo.
// Usage : npm run vignettes
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const images = fileURLToPath(new URL('../public/images', import.meta.url));
let count = 0;
for (const dir of ['especes', 'sites', 'sentiers', 'actions']) {
  const path = join(images, dir);
  if (!existsSync(path)) continue;
  for (const file of readdirSync(path)) {
    if (!file.endsWith('.webp') || file.endsWith('-800.webp')) continue;
    const src = join(path, file);
    const dest = src.replace(/\.webp$/, '-800.webp');
    if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) continue;
    await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 75 }).toFile(dest);
    count++;
  }
}
console.log(`Vignettes : ${count} générée(s).`);

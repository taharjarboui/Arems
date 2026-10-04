// Génère les icônes et l'image de partage à partir du logo et de la photo d'accueil :
//   public/images/logo-180.webp (en-tête), public/images/favicon-32.png, public/images/apple-touch-icon.png (180 px),
//   public/images/og-default.jpg (1200 × 630, image affichée quand une page est partagée).
// À relancer quand le logo ou la photo change : npm run icones
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const logo = `${root}public/images/logo.png`;
const photo = `${root}public/images/especes/flamant-rose.webp`;
const bleu = '#1d3fa8'; // primaire, src/styles/global.css

// Le logo est un rectangle bleu : on le centre sur un carré du même bleu.
for (const [size, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']]) {
  const inner = await sharp(logo).resize({ width: Math.round(size * 0.92), height: Math.round(size * 0.92), fit: 'inside' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bleu } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(`${root}public/images/${name}`);
}

// Logo léger pour l'en-tête et le pied de page (affiché à 44–90 px de haut, 2x pour les écrans haute densité).
await sharp(logo).resize({ height: 180 }).webp({ quality: 85 }).toFile(`${root}public/images/logo-180.webp`);

const badge = await sharp(logo).resize({ width: 300 }).toBuffer();
await sharp(photo)
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .composite([{ input: badge, left: 48, top: 48 }])
  .jpeg({ quality: 82 })
  .toFile(`${root}public/images/og-default.jpg`);

console.log('Icônes et image de partage générées.');

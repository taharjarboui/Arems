// Après `astro build` : installe scripts/protection/middleware.js comme middleware Vercel
// devant toutes les requêtes (pages statiques, images, sons compris), si la protection est active
// dans src/config/protection.json. Voir le commentaire en tête de middleware.js.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const { protection } = JSON.parse(readFileSync(join(root, 'src/config/protection.json'), 'utf8'));
const output = join(root, '.vercel/output');

if (!protection) {
  console.log('Protection par mot de passe : désactivée (src/config/protection.json).');
  process.exit(0);
}
if (!existsSync(join(output, 'config.json'))) {
  console.error('Protection : .vercel/output/config.json introuvable. Lancer `astro build` d’abord.');
  process.exit(1);
}

const fn = join(output, 'functions/_protection.func');
mkdirSync(fn, { recursive: true });
copyFileSync(join(root, 'scripts/protection/middleware.js'), join(fn, 'index.js'));
writeFileSync(join(fn, '.vc-config.json'), JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2));

const config = JSON.parse(readFileSync(join(output, 'config.json'), 'utf8'));
config.routes = config.routes.filter((r) => r.middlewarePath !== '_protection');
config.routes.unshift({ src: '/(.*)', middlewarePath: '_protection', continue: true, override: true });
writeFileSync(join(output, 'config.json'), JSON.stringify(config, null, 2));

console.log('Protection par mot de passe : active. Variable SITE_PASSWORD requise sur Vercel.');

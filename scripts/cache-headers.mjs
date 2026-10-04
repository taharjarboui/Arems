// Après `astro build` : ajoute une durée de cache aux images et aux sons servis par Vercel
// (par défaut, Vercel les fait revalider à chaque visite). Une semaine, puis revalidation.
// Tant que le site est protégé par mot de passe, le cache est « private » : seul le navigateur
// du visiteur connecté garde les fichiers, aucun cache partagé.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { protection } = JSON.parse(readFileSync(join(root, 'src/config/protection.json'), 'utf8'));
const configPath = join(root, '.vercel/output/config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const route = {
  src: '^/(images|sons)/(.*)$',
  headers: { 'cache-control': `${protection ? 'private' : 'public'}, max-age=604800, stale-while-revalidate=86400` },
  continue: true,
};
config.routes = config.routes.filter((r) => r.src !== route.src);
// Juste avant le service des fichiers statiques.
config.routes.splice(config.routes.findIndex((r) => r.handle === 'filesystem'), 0, route);
writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`Cache des images et des sons : ${route.headers['cache-control']}.`);

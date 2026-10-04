// Vérifie le comportement du middleware de protection en simulant des requêtes (Node 20+).
// Usage : npm run test:protection
import assert from 'node:assert/strict';
import middleware from './middleware.js';

process.env.SITE_PASSWORD = 'essai-local';
const base = 'https://memoires-sousse.org';
const get = (path, headers = {}) => middleware(new Request(base + path, { headers }));
const post = (path, fields) => middleware(new Request(base + path, { method: 'POST', body: new URLSearchParams(fields) }));
const isNext = (r) => r.headers.get('x-middleware-next') === '1';

// Public
assert.ok(isNext(await get('/bientot/')), 'page d’attente publique');
assert.ok(isNext(await get('/_astro/app.css')), 'CSS public');
assert.ok(isNext(await get('/images/logo.png')), 'logo public');
assert.ok(isNext(await get('/images/logo-180.webp')), 'logo léger public');
assert.match(await (await get('/robots.txt')).text(), /Disallow: \//, 'robots.txt interdit l’indexation');
assert.equal((await get('/acces')).status, 200, 'formulaire accessible');

// Protégé sans cookie
for (const path of ['/', '/fr/', '/fr/biodiversite/flamant-rose/', '/images/especes/flamant-rose.webp', '/sons/heron-cendre.mp3', '/sitemap-index.xml']) {
  const r = await get(path);
  assert.equal(r.status, 302, `${path} redirigé`);
  assert.equal(r.headers.get('location'), '/bientot/', `${path} → /bientot/`);
}
assert.equal((await post('/api/contact', { nom: 'x' })).status, 401, 'POST protégé');

// Mauvais mot de passe
const ko = await post('/acces', { 'mot-de-passe': 'faux', suite: '/fr/' });
assert.equal(ko.status, 401);
assert.match(await ko.text(), /Mot de passe incorrect/);

// Bon mot de passe → cookie, redirection vers la page demandée (jamais vers un autre site)
const ok = await post('/acces', { 'mot-de-passe': 'essai-local', suite: '/fr/actions/' });
assert.equal(ok.status, 303);
assert.equal(ok.headers.get('location'), '/fr/actions/');
const cookie = ok.headers.get('set-cookie').split(';')[0];
assert.match(ok.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
assert.equal((await post('/acces', { 'mot-de-passe': 'essai-local', suite: '//evil.example' })).headers.get('location'), '/fr/');

// Avec le cookie, tout passe
for (const path of ['/', '/fr/', '/images/especes/flamant-rose.webp']) assert.ok(isNext(await get(path, { cookie })), `${path} accessible connecté`);
assert.equal((await get('/fr/', { cookie: 'arems_acces=falsifie' })).status, 302, 'cookie falsifié refusé');

// Sans SITE_PASSWORD, personne n'entre
delete process.env.SITE_PASSWORD;
assert.equal((await get('/fr/', { cookie })).status, 302, 'fermé sans variable');
assert.equal((await post('/acces', { 'mot-de-passe': '' })).status, 401);

console.log('Protection : tous les tests passent.');

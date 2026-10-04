// Protection du site par mot de passe, tant que le contenu n'est pas validé (droits des photos, textes).
//
// Ce fichier est une fonction « middleware » Vercel (runtime edge, API Web standard uniquement).
// scripts/protection/install.mjs la place devant TOUTES les requêtes après `astro build`,
// y compris les pages statiques, les images et les sons, que le middleware d'Astro ne voit pas.
//
// Comportement :
//   - publics : /bientot/ (page d'attente), /acces (formulaire), le logo, les fichiers /_astro/ (CSS, JS, polices) ;
//   - /robots.txt interdit l'indexation ;
//   - tout le reste exige le cookie posé par /acces ; sinon, renvoi vers /bientot/ ;
//   - /sortie efface le cookie.
// Le mot de passe est lu dans la variable d'environnement Vercel SITE_PASSWORD.
// Sans cette variable, personne ne peut entrer (la protection échoue fermée).

const COOKIE = 'arems_acces';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours
const PUBLIC_EXACT = new Set(['/bientot', '/bientot/', '/images/logo.png', '/images/logo-180.webp', '/images/favicon-32.png', '/favicon.ico']);
const PUBLIC_PREFIXES = ['/_astro/'];

const next = () => new Response(null, { headers: { 'x-middleware-next': '1', 'x-robots-tag': 'noindex' } });
const redirect = (url, status = 302, headers = {}) => new Response(null, { status, headers: { location: url, ...headers } });

/** Jeton du cookie : empreinte du mot de passe. Changer le mot de passe déconnecte tout le monde. */
async function jeton(password) {
  const data = new TextEncoder().encode(`arems-acces:${password}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function cookies(request) {
  return Object.fromEntries((request.headers.get('cookie') ?? '').split(';').map((c) => {
    const i = c.indexOf('=');
    return [c.slice(0, i).trim(), c.slice(i + 1).trim()];
  }));
}

/** N'accepte qu'une adresse interne au site comme destination après connexion. */
const destination = (value) => (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/fr/');

const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function pageAcces(suite, erreur) {
  // Page autonome (aucune ressource protégée). Couleurs : tokens « Bleu AREMS » de src/styles/global.css.
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Accès réservé · AREMS</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#eef2fa;color:#0f1b3d;font:16px/1.5 system-ui,sans-serif;padding:16px}
  main{width:100%;max-width:360px;background:#fff;border-top:6px solid #1d3fa8;border-radius:6px;padding:28px}
  h1{font-size:1.4rem;margin:0 0 6px} p{margin:0 0 18px;color:#3c4a6b}
  label{display:block;font-weight:600;margin-bottom:6px}
  input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #d4dcef;border-radius:4px;font:inherit}
  input:focus{outline:3px solid #1d3fa8;outline-offset:1px}
  button{margin-top:16px;width:100%;padding:11px;border:0;border-radius:4px;background:#ffd21a;color:#0f1b3d;font:600 1rem system-ui,sans-serif;cursor:pointer}
  .erreur{color:#b42318;font-weight:600;margin:12px 0 0}
</style></head>
<body><main>
<h1>Accès réservé</h1>
<p>Le site est en préparation. Saisissez le mot de passe communiqué par l’association.</p>
<form method="post" action="/acces">
  <input type="hidden" name="suite" value="${escape(destination(suite))}">
  <label for="mot-de-passe">Mot de passe</label>
  <input id="mot-de-passe" name="mot-de-passe" type="password" autocomplete="current-password" required autofocus>
  ${erreur ? '<p class="erreur" role="alert">Mot de passe incorrect.</p>' : ''}
  <button type="submit">Entrer</button>
</form>
</main></body></html>`;
  return new Response(html, { status: erreur ? 401 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const password = globalThis.process?.env?.SITE_PASSWORD;

  if (path === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  if (path === '/acces' || path === '/acces/') {
    if (request.method !== 'POST') return pageAcces(url.searchParams.get('suite'), false);
    const form = await request.formData().catch(() => new FormData());
    const essai = form.get('mot-de-passe');
    if (password && typeof essai === 'string' && (await jeton(essai)) === (await jeton(password))) {
      return redirect(destination(form.get('suite')), 303, {
        'set-cookie': `${COOKIE}=${await jeton(password)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
      });
    }
    await new Promise((r) => setTimeout(r, 600)); // ralentit les essais en série
    return pageAcces(form.get('suite'), true);
  }

  if (path === '/sortie') {
    return redirect('/bientot/', 302, { 'set-cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` });
  }

  if (PUBLIC_EXACT.has(path) || PUBLIC_PREFIXES.some((p) => path.startsWith(p))) return next();

  if (password && cookies(request)[COOKIE] === (await jeton(password))) return next();

  // Visiteur non connecté : on ne révèle rien du contenu.
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Accès réservé', { status: 401 });
  return redirect('/bientot/');
}

// Liste tout ce qui reste à compléter avant que le contenu soit définitif :
//   - fiches et pages marquées `aCompleter: true` (avec le commentaire qui suit, s'il y en a un) ;
//   - mentions « (à confirmer) » dans le contenu ;
//   - partenaires marqués `aCompleter: true` ;
//   - fichiers de coordonnées au statut `provisoire` ;
//   - champs vides de src/config/association.ts.
// Usage : npm run todo
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const rel = (p) => relative(root, p);

function walk(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return walk(p, ext);
    return p.endsWith(ext) ? [p] : [];
  });
}

const sections = [];
const add = (title, items) => { if (items.length) sections.push({ title, items }); };

// Fiches et pages
const marked = [];
const confirm = [];
for (const file of walk(join(root, 'src/content'), '.md')) {
  const text = readFileSync(file, 'utf8');
  const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const flag = front.match(/^aCompleter:\s*true\s*(?:#\s*(.*))?$/m);
  if (flag) marked.push(`${rel(file)}${flag[1] ? ` — ${flag[1]}` : ''}`);
  text.split('\n').forEach((line, i) => {
    if (line.includes('(à confirmer)')) confirm.push(`${rel(file)}:${i + 1} — ${line.trim().slice(0, 110)}`);
  });
}
add('Fiches et pages provisoires (aCompleter: true)', marked);
add('Informations « (à confirmer) »', confirm);

// Partenaires
const partFile = join(root, 'src/content/partenaires/partenaires.yaml');
if (existsSync(partFile)) {
  const blocks = readFileSync(partFile, 'utf8').split(/^- /m).slice(1);
  add('Partenaires à compléter', blocks
    .filter((b) => /^\s*aCompleter:\s*true/m.test(b))
    .map((b) => b.match(/id:\s*(.+)/)?.[1]?.trim() ?? '(sans id)'));
}

// Coordonnées
add('Coordonnées provisoires (src/data/geo)', walk(join(root, 'src/data/geo'), '.json')
  .filter((f) => JSON.parse(readFileSync(f, 'utf8')).statut === 'provisoire')
  .map(rel));

// Association
const assoc = readFileSync(join(root, 'src/config/association.ts'), 'utf8');
add('Champs vides dans src/config/association.ts', [...assoc.matchAll(/^\s*(\w+):\s*(?:''|\[\])/gm)].map((m) => m[1]));
add('Champs à vérifier dans src/config/association.ts', [...assoc.matchAll(/\/\*\*([^*]*À compléter[^*]*)\*\/\s*\n\s*(\w+):\s*'[^']+'/g)].map((m) => `${m[2]} — ${m[1].trim()}`));

if (!sections.length) {
  console.log('Rien à compléter.');
} else {
  for (const { title, items } of sections) {
    console.log(`\n${title} (${items.length})`);
    for (const item of items) console.log(`  - ${item}`);
  }
  console.log('\nVoir docs/contenu-a-fournir.md pour savoir quoi demander à l’association.');
}

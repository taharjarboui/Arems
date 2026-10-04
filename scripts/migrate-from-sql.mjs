// Migration ponctuelle (phase 2) : ancien site Symfony → collections Astro.
// Lit ../arems-main/db_backup/backup.sql, applique les corrections décidées pendant la migration
// (voir docs/rapport-migration.md) et écrit :
//   - src/content/{especes,sites,sentiers,actions}/fr/*.md
//   - src/content/partenaires/partenaires.yaml
//   - src/data/geo/{sites,sentiers}/*.json
//   - scripts/media-manifest.json (images et sons à convertir par scripts/media.mjs)
// Le script écrase ces fichiers : il ne sert qu'une fois. Ensuite, on édite le Markdown directement.
// Usage : node scripts/migrate-from-sql.mjs
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDump } from './lib/sql-dump.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const legacy = join(root, '../arems-main');
const db = readDump(join(legacy, 'db_backup/backup.sql'));

// ---------------------------------------------------------------- utilitaires

const media = []; // { from, to, kind }
const seen = new Map(); // fichier source → chemin publié (un fichier source n'est converti qu'une fois)

/** Déclare une image de l'ancien site ; renvoie son futur chemin public, ou undefined si le fichier n'existe pas. */
function image(file, to) {
  if (!file) return undefined;
  const name = file.replace(/^\//, '');
  if (!existsSync(join(legacy, 'public/images', name))) {
    console.warn(`Image absente, ignorée : ${name}`);
    return undefined;
  }
  if (!seen.has(name)) {
    seen.set(name, `/images/${to}.webp`);
    media.push({ kind: 'image', from: `public/images/${name}`, to: `public/images/${to}.webp` });
  }
  return seen.get(name);
}

function son(file, slug) {
  media.push({ kind: 'son', from: `public/sons/${file}`, to: `public/sons/${slug}.mp3` });
  return `/sons/${slug}.mp3`;
}

const q = (v) => JSON.stringify(v); // une chaîne JSON est une chaîne YAML valide

/** Frontmatter YAML lisible : scalaires, listes de chaînes, listes d'objets. `note` devient un commentaire après aCompleter. */
function frontmatter(data, note) {
  const lines = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || (Array.isArray(v) && v.length === 0 && k !== 'sites')) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) { lines.push(`${k}: []`); continue; }
      lines.push(`${k}:`);
      for (const item of v) {
        if (typeof item !== 'object') { lines.push(`  - ${q(item)}`); continue; }
        const entries = Object.entries(item).filter(([, x]) => x !== undefined);
        entries.forEach(([ik, iv], i) => lines.push(`${i === 0 ? '  - ' : '    '}${ik}: ${q(iv)}`));
      }
    } else if (k === 'aCompleter' && v && note) {
      lines.push(`aCompleter: true # ${note}`);
    } else {
      lines.push(`${k}: ${typeof v === 'string' ? q(v) : v}`);
    }
  }
  return `---\n${lines.join('\n')}\n---\n`;
}

function write(rel, text) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

/** Supprime les coordonnées laissées dans les textes (elles vont dans le fichier geo) et les balises HTML. */
const typo = (s) => s.replace(/'/g, '’');
const clean = (s) => typo(s
  .replace(/\s*Coordonnées\s*:.*$/s, '')
  .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '\n\n')
  .replace(/(^|\. )Wadi Soud/g, '$1L’Oued Soud')
  .replace(/Wadi Soud/g, 'l’Oued Soud')
  .replace(/Canards sarcelés/g, 'canards, sarcelles')
  .trim());

// ---------------------------------------------------------------- espèces

const CATEGORIES = { 1: 'plantes', 2: 'oiseaux', 3: 'reptiles', 4: 'insectes' };

// Corrections par identifiant de l'ancienne table `espece`.
// Champs absents = repris tels quels. `image: null` = photo de l'ancien site écartée (voir le rapport).
// `note` = raison du marqueur aCompleter. `skip` = fiche non reprise.
const corrections = {
  20: { slug: 'foulque-macroule', title: 'Foulque macroule', nomScientifique: 'Fulica atra', famille: 'Rallidae', habitat: 'Étangs, marais et lagunes',
    summary: 'Oiseau d’eau au plumage noir, reconnaissable à son bec et à sa plaque frontale blancs. Elle nage et plonge pour se nourrir de plantes aquatiques.',
    statutUicn: 'LC', note: 'remplace la fiche « Râle d’eau » : photo et cri de l’ancien site étaient ceux de la foulque ; présence sur les sites à confirmer' },
  21: { slug: 'canard-colvert', statutUicn: 'LC', famille: 'Anatidae', habitat: 'Plans d’eau douce et saumâtre' },
  22: { slug: 'spatule-blanche', statutUicn: 'LC', famille: 'Threskiornithidae', habitat: 'Marais d’eau salée et lagunes' },
  23: { slug: 'flamant-rose', statutUicn: 'LC', famille: 'Phoenicopteridae', habitat: 'Sebkhas et marais salants' },
  24: { slug: 'avocette-elegante', statutUicn: 'LC', famille: 'Recurvirostridae', habitat: 'Lagunes, vasières et marais côtiers' },
  25: { slug: 'crabier-chevelu', statutUicn: 'LC', famille: 'Ardeidae', image: null, note: 'photo à fournir (celle de l’ancien site montrait un héron cendré)' },
  26: { slug: 'heron-cendre', nomScientifique: 'Ardea cinerea', famille: 'Ardeidae', ordre: 'Pelecaniformes', statutUicn: 'LC', imageFile: 'crabier.jpeg', sonFile: 'Ardea.mp3' },
  27: { slug: 'grebe-castagneux', statutUicn: 'LC', famille: 'Podicipedidae', habitat: 'Étangs et marais à végétation dense' },
  28: { slug: 'gallinule-poule-d-eau', statutUicn: 'LC', famille: 'Rallidae', habitat: 'Marais, oueds et plans d’eau bordés de végétation' },
  29: { slug: 'mouette-rieuse', statutUicn: 'LC', famille: 'Laridae', habitat: 'Côtes, lagunes et marais', image: null, note: 'photo à fournir (celle de l’ancien site montrait un chevalier, probablement un chevalier stagnatile)' },
  30: { slug: 'tadorne-de-belon', statutUicn: 'LC', famille: 'Anatidae', habitat: 'Lagunes et marais côtiers',
    summary: 'Grand canard au plumage blanc, à tête vert sombre, avec une large bande rousse sur la poitrine et un bec rouge.' },
  42: { slug: 'jonc-maritime', famille: 'Juncaceae', ordre: 'Poales', habitat: 'Marais salés et bords de lagunes', image: null, statutUicn: undefined,
    note: 'photo à fournir (celle de l’ancien site montrait une tortue d’eau dans des roseaux)' },
  43: { slug: 'roseau-commun', nomScientifique: 'Phragmites australis', famille: 'Poaceae', ordre: 'Poales', habitat: 'Bords d’eau douce et saumâtre', statutUicn: undefined },
  44: { slug: 'massette-a-feuilles-etroites', famille: 'Typhaceae', ordre: 'Poales', habitat: 'Bords d’eau et marais', image: null, statutUicn: undefined,
    note: 'photo à fournir (celle de l’ancien site porte le filigrane d’un site tiers)' },
  45: { slug: 'tamaris-d-afrique', title: 'Tamaris d’Afrique', famille: 'Tamaricaceae', ordre: 'Caryophyllales', habitat: 'Sols salés, bords de sebkhas et d’oueds', statutUicn: undefined },
  46: { slug: 'salicorne', title: 'Salicorne', famille: 'Amaranthaceae', ordre: 'Caryophyllales', habitat: 'Sols salés des sebkhas', statutUicn: undefined,
    note: 'espèce exacte à confirmer : Salicornia europaea d’après l’ancien site, mais les sebkhas tunisiennes abritent aussi Sarcocornia et Arthrocnemum' },
  47: { slug: 'statice', title: 'Statice', nomScientifique: 'Limonium sp.', famille: 'Plumbaginaceae', ordre: 'Caryophyllales', habitat: 'Sols salés des sebkhas', statutUicn: undefined,
    summary: 'Plante des milieux salés aux petites fleurs mauves en épis, typique des bords de sebkhas.',
    note: 'espèce à identifier : « Limonium monopetalum » (ancien site) est le Limoniastrum, qui ne correspond pas à la photo' },
  48: { slug: 'nigelle-des-champs', famille: 'Ranunculaceae', ordre: 'Ranunculales', habitat: 'Champs et friches', statutUicn: undefined,
    summary: 'Plante annuelle des champs et des friches, aux fleurs pâles veinées de vert.',
    note: 'présence sur les sites à confirmer ; l’usage en phytothérapie cité par l’ancien site concerne la nigelle cultivée (Nigella sativa)' },
  49: { slug: 'reichardie-de-tanger', famille: 'Asteraceae', ordre: 'Asterales', habitat: 'Milieux ouverts, sols secs et pauvres', image: null, statutUicn: undefined,
    note: 'photo à fournir (celle de l’ancien site montrait une fleur de figuier de Barbarie)' },
  50: { slug: 'datura-stramoine', famille: 'Solanaceae', ordre: 'Solanales', habitat: 'Friches et bords de chemins', statutUicn: undefined,
    summary: 'Plante aux grandes fleurs blanches en trompette. Toutes ses parties sont très toxiques.' },
  51: { slug: 'tortue-grecque', title: 'Tortue grecque', nomScientifique: 'Testudo graeca', famille: 'Testudinidae', statutUicn: 'VU', habitat: 'Milieux ouverts et secs',
    summary: 'Tortue terrestre des milieux ouverts, protégée en Tunisie. Sa carapace bombée porte des écailles jaunes et noires.',
    note: 'remplace la fiche « Tortue d’Hermann », absente de Tunisie ; présence sur les sites à confirmer' },
  52: { slug: 'cistude-d-europe', famille: 'Emydidae', statutUicn: 'NT', image: null,
    note: 'présence à confirmer ; la photo de l’ancien site (tor.jpeg) montre plutôt une émyde lépreuse (Mauremys leprosa), commune en Tunisie' },
  53: { slug: 'couleuvre-viperine', title: 'Couleuvre vipérine', nomScientifique: 'Natrix maura', famille: 'Natricidae', statutUicn: 'LC', habitat: 'Mares, oueds et marais',
    summary: 'Serpent non venimeux, excellent nageur, qui chasse poissons et amphibiens dans les mares, les oueds et les marais.',
    note: 'remplace la fiche « Couleuvre à collier » (Natrix natrix), absente de Tunisie' },
  54: { slug: 'libellule', nomScientifique: 'Anisoptera', famille: undefined, statutUicn: undefined,
    note: 'espèce à identifier sur la photo ; Libellula depressa (ancien site) ne correspond pas' },
  55: { skip: true }, // Mouche domestique : fiche générique sans lien avec les sites
  56: { slug: 'petit-monarque', title: 'Petit monarque', nomScientifique: 'Danaus chrysippus', statutUicn: 'LC', habitat: 'Milieux ouverts, friches',
    summary: 'Papillon orange aux ailes bordées de noir ponctuées de blanc, répandu en Afrique du Nord. Sa chenille se nourrit d’asclépiades.' },
};

const SONS = { 'lamingo.mp3': 'flamingo.mp3', 'Adrea.mp3': 'Ardea.mp3' }; // noms erronés dans la base

let order = 10;
for (const e of db.espece) {
  const c = corrections[e.id] ?? {};
  if (c.skip) continue;
  const slug = c.slug ?? e.slug;
  const categorie = CATEGORIES[e.categorie_id];
  const imageFile = c.image === null ? undefined : (c.imageFile ?? e.image);
  const sonFile = c.sonFile ?? (e.son ? (SONS[e.son] ?? e.son) : undefined);
  const statut = 'statutUicn' in c ? c.statutUicn : undefined;
  const data = {
    title: c.title ?? e.nom,
    summary: typo(c.summary ?? e.description),
    nomScientifique: c.nomScientifique ?? e.nom_scientifique,
    categorie,
    famille: 'famille' in c ? c.famille : e.famille,
    ordre: c.ordre ?? e.ordre,
    habitat: typo(c.habitat ?? e.habitat),
    statutUicn: statut,
    importanceEcologique: typo(e.importance_ecologique),
    image: image(imageFile, `especes/${slug}`),
    imageAlt: imageFile ? `${c.title ?? e.nom} (${c.nomScientifique ?? e.nom_scientifique})` : undefined,
    imageCredit: imageFile ? 'Ancien site AREMS (auteur et droits à confirmer)' : undefined,
    son: sonFile ? son(sonFile, slug) : undefined,
    sonCredit: sonFile ? 'Ancien site AREMS (source à confirmer)' : undefined,
    sites: [],
    order: order++,
    aCompleter: Boolean(c.note) || undefined,
  };
  write(`src/content/especes/fr/${slug}.md`, frontmatter(data, c.note));
}

// ---------------------------------------------------------------- site Ramsar
// Source : fiche Ramsar n° 2006, https://rsis.ramsar.org/ris/2006

write('src/content/sites/fr/halk-el-menzel.md', frontmatter({
  title: 'Sebkhet Halk El Menzel et Oued Essed',
  summary: 'Lagune côtière salée au nord de Sousse, exemple presque intact de sebkha, la zone humide caractéristique du Sahel tunisien.',
  image: image('Capture3.png', 'sites/halk-el-menzel'),
  imageAlt: 'Flamants roses sur la sebkha',
  imageCredit: 'Ancien site AREMS (auteur à confirmer)',
  protection: 'Site Ramsar n° 2006, désigné le 2 février 2012',
  commune: 'Sousse',
  surface: '1 450 ha',
  order: 10,
  aCompleter: true,
}, 'texte de présentation à compléter par l’association') + `
La Sebkhet Halk El Menzel et l’Oued Essed forment une lagune côtière salée inscrite sur la liste des zones humides d’importance internationale (convention de Ramsar). C’est un exemple presque intact de sebkha, type de zone humide caractéristique de la région semi-aride du Sahel tunisien.

Le site sert d’habitat à des espèces d’intérêt biologique, dont la sarcelle marbrée (*Marmaronetta angustirostris*), espèce vulnérable, et de halte pour les oiseaux migrateurs.

Source : [fiche Ramsar n° 2006](https://rsis.ramsar.org/ris/2006).
`);

write('src/data/geo/sites/halk-el-menzel.json', JSON.stringify({
  statut: 'verifie',
  centre: [35.98972, 10.50278],
  zoom: 13,
  source: 'Fiche Ramsar n° 2006 (35°59′23″ N, 10°30′10″ E)',
}, null, 2) + '\n');

// ---------------------------------------------------------------- sentiers

const dms = (d, m, s) => Math.round((d + m / 60 + s / 3600) * 1e6) / 1e6;

const SENTIERS = {
  2: {
    slug: 'sentier-halk-el-menzel',
    title: 'Sentier de la Sebkhet Halk El Menzel',
    titres: ['Départ', 'Zone de reboisement', 'Passage du cours d’eau', 'Arrivée', 'Observatoire d’oiseaux'],
    note: 'durée, distance et position des points 2, 3 et 5 à fournir ; ordre des points à vérifier (l’observatoire vient après l’arrivée dans l’ancien site)',
    geo: {
      statut: 'provisoire',
      centre: [35.97135, 10.52168],
      zoom: 16,
      points: [
        { n: 1, position: [dms(35, 58, 18.10), dms(10, 31, 27.65)] },
        { n: 4, position: [dms(35, 58, 15.59), dms(10, 31, 8.48)] },
      ],
      source: 'Points 1 (départ) et 4 (arrivée) : coordonnées citées dans les textes de l’ancien site, à vérifier sur le terrain.',
    },
  },
  1: {
    slug: 'circuit-oued-soud',
    title: 'Circuit écologique de l’Oued Soud',
    distance: '740 m',
    titres: ['Départ du circuit', 'Panneau sur la faune', 'Insectes et petites espèces aquatiques', 'Point d’observation', 'Insectes et oiseaux d’eau'],
    note: 'graphie à confirmer (Oued Soud, Oued Essoud ou Oued Essed) ; durée, difficulté et coordonnées à fournir',
    geo: {
      statut: 'provisoire',
      centre: [35.98972, 10.50278],
      zoom: 13,
      source: 'Centre du site Ramsar ; position du circuit inconnue.',
    },
  },
};

for (const p of db.parcours_touristique) {
  const s = SENTIERS[p.id];
  const points = db.point_interet
    .filter((pt) => pt.parcours_id === p.id)
    .sort((a, b) => a.position - b.position)
    .map((pt, i) => {
      const img = image(pt.image, `sentiers/${s.slug}-${i + 1}`);
      return { titre: s.titres[i], description: clean(pt.description), image: img, imageAlt: img ? s.titres[i] : undefined };
    });
  write(`src/content/sentiers/fr/${s.slug}.md`, frontmatter({
    title: s.title,
    summary: typo(p.resume.replace('Le circuit n°2 dans l\'Oued Soud', 'Le circuit n° 2 de l’Oued Soud')),
    site: 'halk-el-menzel',
    image: image(p.image, `sentiers/${s.slug}-plan`),
    imageAlt: `Plan du ${s.title.charAt(0).toLowerCase()}${s.title.slice(1)}`,
    distance: s.distance,
    points,
    order: p.id === 2 ? 10 : 20,
    aCompleter: true,
  }, s.note));
  write(`src/data/geo/sentiers/${s.slug}.json`, JSON.stringify(s.geo, null, 2) + '\n');
}

// ---------------------------------------------------------------- actions

const ACTIONS = {
  'postes-observation': { title: 'Postes d’observation' },
  'panneaux-information': { title: 'Panneaux d’information et de sensibilisation' },
  'gestion-dechets': { title: 'Gestion des déchets' },
  'plantation-arbres': { title: 'Plantation d’arbres' },
};

let actionOrder = 10;
for (const a of db.action_environnementale) {
  const meta = ACTIONS[a.slug];
  const details = db.details_action.filter((d) => d.action_id === a.id);
  const galerie = details
    .flatMap((d) => (d.images ?? '').split(',').map((f) => f.trim()).filter(Boolean))
    .map((f, i) => ({ src: image(f, `actions/${a.slug}-${i + 1}`), alt: meta.title }))
    .filter((g) => g.src && g.src !== image(a.image, `actions/${a.slug}`));
  const body = details.map((d) => `## ${d.titre}\n\n${clean(d.contenu)}\n`).join('\n');
  write(`src/content/actions/fr/${a.slug}.md`, frontmatter({
    title: meta.title,
    summary: typo(a.description) + '.',
    image: image(a.image, `actions/${a.slug}`),
    imageAlt: meta.title,
    imageCredit: 'Ancien site AREMS (auteur à confirmer)',
    site: 'halk-el-menzel',
    galerie,
    order: actionOrder++,
    aCompleter: true,
  }, 'date, lieu, objectifs et bilan à fournir ; textes de l’ancien site très génériques') + `\n${body}`);
}

// ---------------------------------------------------------------- partenaires
// Logos identifiés visuellement ; ceux marqués aCompleter sont à confirmer avec l'association.

const PARTENAIRES = {
  'cap.png': { id: 'crda-sousse', nom: 'CRDA de Sousse', note: true },
  'capt1.png': { id: 'medwet', nom: 'MedWet (Initiative pour les zones humides méditerranéennes)', url: 'https://medwet.org' },
  'capt2.png': { id: 'jci-hergla', nom: 'JCI Hergla' },
  'capt3.png': { id: 'partenaire-04', nom: 'Partenaire à identifier', note: true },
  'capt4.png': { id: 'partenaire-05', nom: 'Partenaire à identifier', note: true },
  'capt6.png': { id: 'forets-tunisie', nom: 'Direction générale des forêts', note: true },
  'capt7.png': { id: 'isa-chott-mariem', nom: 'Institut supérieur agronomique de Chott-Mariem' },
  'capt8.png': { id: 'partenaire-08', nom: 'Partenaire à identifier', note: true },
  'capt9.png': { id: 'commune-de-sousse', nom: 'Commune de Sousse', note: true },
  'capt10.png': { id: 'marie-curie', nom: 'Marie Curie', note: true },
  'capt11.png': { id: 'ppi-oscan', nom: 'PPI-OSCAN (Programme de petites initiatives)' },
  'cap12.png': { id: 'ffem', nom: 'Fonds français pour l’environnement mondial', url: 'https://www.ffem.fr' },
  'cap13.png': { id: 'ofb', nom: 'Office français de la biodiversité', url: 'https://www.ofb.gouv.fr' },
  'cap14.png': { id: 'mava', nom: 'Fondation MAVA' },
  'cap15.png': { id: 'uicn', nom: 'UICN', url: 'https://www.iucn.org' },
};

const yaml = ['# Partenaires de l’association : une entrée par partenaire, logo dans public/images/partenaires/.',
  '# Logos repris de l’ancien site et identifiés visuellement ; `aCompleter: true` = nom à confirmer.'];
let pOrder = 10;
for (const pa of db.partenaire) {
  const p = PARTENAIRES[pa.logo];
  yaml.push(`- id: ${p.id}`, `  nom: ${q(p.nom)}`, `  logo: ${image(pa.logo, `partenaires/${p.id}`)}`);
  if (p.url) yaml.push(`  url: ${p.url}`);
  yaml.push(`  order: ${pOrder++}`);
  if (p.note) yaml.push('  aCompleter: true');
}
write('src/content/partenaires/partenaires.yaml', yaml.join('\n') + '\n');

// ---------------------------------------------------------------- médias

write('scripts/media-manifest.json', JSON.stringify(media, null, 2) + '\n');
console.log(`Espèces, site, sentiers, actions et partenaires écrits. ${media.length} médias à convertir : npm run media`);

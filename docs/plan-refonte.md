# Plan de refonte AREMS : Symfony → Astro

Objectif : reconstruire `arems-main/` (PHP/Symfony 7.3 + MySQL) avec la stack décrite dans `CLAUDE.md` (Astro + Tailwind v4 + Leaflet + Vercel), puis déployer de zéro sur `memoires-sousse.org`.

- Nouveau projet : `AREMS/site/`. Ancien code : `AREMS/arems-main/` (lu par les scripts de migration, jamais copié dans le dépôt).
- Dépôt Git : https://github.com/taharjarboui/Arems.git (branche `main`).

Principe : **parité fonctionnelle d'abord, améliorations ensuite.** On reprend le périmètre et le contenu du site PHP, on corrige ce qui est faux et on remplace ce qui est factice. Les nouveautés (page S'engager, Plausible, Sanity) viennent après la mise en ligne.

Aucune redirection depuis les anciennes URL Symfony : le site PHP n'a jamais été en production.

## Décisions de cadrage (4 octobre 2026)
- **Langues** : l'architecture est trilingue (`fr`, `ar`, `en` : routes, `ui.ts`, dossiers de contenu, RTL), mais **la v1 ne publie que le français**. La liste `publishedLangs` de `src/i18n/ui.ts` décide des langues générées et proposées dans le sélecteur. Ajouter `ar` ou `en` à cette liste suffit à publier une langue, une fois son contenu écrit.
- **Carte des sentiers** : on garde le module (tracé, points numérotés, « me localiser »). Les coordonnées sortent du code et vont dans un fichier de configuration par sentier : `src/data/geo/sentiers/<slug>.json`. Les coordonnées ne dépendent pas de la langue ; les textes des points restent dans le Markdown du sentier. Ajouter un sentier = un fichier Markdown + un fichier geo.
- **Météo** : à développer avec une source gratuite, **Open-Meteo** (sans clé, sans compte, CORS autorisé, usage non commercial gratuit). Appel côté client depuis les coordonnées des sites ; le site reste statique.
- **Contenu de l'association** (textes, logo, partenaires, contacts, traces GPS) : récupéré plus tard. On prépare les **emplacements** et une **logique de mise à jour** documentée. Rien n'est bloquant pour la mise en ligne.

---

## Correspondance ancien → nouveau

### Données (entités Doctrine → collections Astro)

| Symfony | Astro | Remarques |
|---|---|---|
| `Espece` + `CategorieEspece` | collection `especes`, champ `categorie` (enum) | La catégorie devient un enum ; ses libellés vont dans `ui.ts`, ses images dans `public/images/categories/`. |
| `ParcoursTouristique` + `PointInteret` | collection `sentiers` (textes) + `src/data/geo/sentiers/<slug>.json` (coordonnées) | Le point d'intérêt n'a plus de page à lui : il devient une ancre `#point-n` sur la page du sentier. |
| `ActionEnvironnementale` + `DetailsAction` | collection `actions` | Les détails deviennent des sections `##` du corps Markdown ; les images (chaîne séparée par des virgules) deviennent `galerie: []`. |
| `Partenaire` | collection de données `partenaires` (YAML) | Noms factices à remplacer. |
| `Zone` (table vide) | collection `sites` | Oued Soud et Sebkhet Halk El Menzel ; les sentiers y sont rattachés. |
| `Activite` (table vide, inutilisée) | supprimée | |
| `EspeceForm`, templates CRUD `espece/index`, `new`, `edit`, `_form`, `_delete_form` | supprimés | L'édition passera par Sanity plus tard. |

### Routes (contrôleurs → pages Astro)

| Symfony | Astro (FR) |
|---|---|
| `/` | `/fr/` |
| `/categorie/{slug}` | `/fr/biodiversite/` (catalogue) et `/fr/biodiversite/{categorie}/` |
| `/espece/{slug}` | `/fr/especes/{slug}` |
| `/sentiers` (template absent) | `/fr/sentiers/` |
| `/parcours/{slug}` + `/parcours/{id}/map` (template absent) | `/fr/sentiers/{slug}` (carte intégrée) |
| `/point-interet/{id}` | `/fr/sentiers/{slug}#point-n` |
| `/action/{slug}` | `/fr/actions/` et `/fr/actions/{slug}` |
| `/zones` (plantait) | `/fr/sites/` et `/fr/sites/{slug}` |
| `/about` (template absent) | `/fr/association` |
| `/contact` | `/fr/contact` + `POST /api/contact` |
| — | `/404`, sitemap, redirection `/` → `/fr/` |

Les segments d'URL sont traduits dans `sections` de `ui.ts`.

### Gabarits (Twig → composants Astro)

| Twig | Astro |
|---|---|
| `base.html.twig` (Bootstrap via CDN, Google Translate, Font Awesome) | `Base.astro`, `Header.astro`, `Footer.astro`. Bootstrap, Google Translate et Font Awesome ne sont pas repris : Tailwind, i18n natif et SVG inline. |
| `home/index.html.twig` (710 lignes) | Un composant par section : `Hero`, `MeteoWidget`, `CategoryGrid`, `MissionBlock`, `ActionCards`, `TrailCards`, `PartnersStrip`, `JoinCta`. |
| `categorie/show`, `espece/show`, `espece/detail` | `SpeciesCard.astro` + page espèce (photo, nom, nom scientifique, badge UICN, `<audio>`). |
| `parcours/show` (carte Leaflet) | `TrailMap.astro` (lit `src/data/geo/sentiers/<slug>.json`) + `PointList.astro`. |
| `action/detail` (galerie + zoom JS) | `Gallery.astro` (`<dialog>` natif). |
| `contact/contact` | page contact + `api/contact.ts` (Resend). |

### Ce qui était factice dans l'ancien site, et ce qu'on en fait
- **Carte** : le tracé et les points étaient codés en dur dans le template, à des coordonnées au hasard (`34.1 + Math.random()…`), au centre de la Tunisie. → Le module est gardé et lit `src/data/geo/sentiers/<slug>.json`. Ces fichiers démarrent avec un centrage approximatif sur le site naturel et `"statut": "provisoire"`. La carte affiche alors la mention « Tracé indicatif » et pas de tracé inventé. On passe à `"verifie"` quand les traces GPS réelles sont saisies.
- **Météo** : les valeurs étaient fixes (24 °C, 12 km/h, 65 %). → Widget réel avec Open-Meteo.
- **Traduction** : Google Translate. → i18n natif, FR seulement en v1.
- **Animations `animate__…`** : supprimées (charte).

---

## Contenu de l'association : emplacements et mise à jour

Tout ce qui viendra de l'association a un emplacement unique, connu d'avance :

| Contenu | Emplacement | En attendant |
|---|---|---|
| Nom officiel, sigle, e-mail public éventuel, adresse, réseaux sociaux | `src/config/association.ts` | Valeurs provisoires ; les champs vides ne s'affichent pas. |
| Logo, favicon, image de partage | `public/images/logo.svg` (ou `.png`), `favicon.png`, `og-default.jpg` | Logo de l'ancien site (`logo1.png`). |
| Présentation (histoire, mission, équipe) | `src/content/pages/fr/association.md` | Texte provisoire. |
| Partenaires | `src/content/partenaires/partenaires.yaml` | Logos de l'ancien site, noms vides. |
| Traces GPS des sentiers | `src/data/geo/sentiers/<slug>.json` | Centrage approximatif, `statut: provisoire`. |
| Fiches espèces, sites, actions | `src/content/<collection>/fr/<slug>.md` | Contenu migré du dump SQL, champs douteux marqués. |
| Destinataire du formulaire | variable `CONTACT_TO` dans Vercel | Adresse de test. |

**Logique de mise à jour** : chaque contenu provisoire porte `aCompleter: true` dans son frontmatter (ou `statut: provisoire` pour les fichiers geo). `npm run todo` liste tout ce qui reste à compléter, à partir de ces marqueurs et des « (à confirmer) ». Le marqueur n'est jamais affiché tel quel aux visiteurs. `docs/contenu-a-fournir.md` est la liste à envoyer à l'association : quoi, sous quel format, où ça va. Quand un contenu arrive, on remplace le fichier, on retire le marqueur, on vérifie `npm run build`, et on pousse.

---

## Phases

### Phase 0 — Préparation
- Créer `AREMS/site/` : config Astro, Vercel et Tailwind, i18n, layout, Header, Footer, Map, page contact et `api/contact.ts`. Aucune identité visuelle ni composant partagé avec un autre site : tokens sémantiques provisoires aux couleurs du logo, polices système.
- Adapter l'identité : nom, domaine `memoires-sousse.org`, expéditeur par défaut, `publishedLangs = ['fr']`.
- `CLAUDE.md` (la consigne), `docs/plan-refonte.md` (ce plan), `README.md`, `.env.example`.
- `git init`, premier commit, push sur `taharjarboui/Arems`.

**Fini quand** : `npm run build` passe (accueil provisoire, contact, 404), et le dépôt est sur GitHub.

### Phase 1 — Fondations
- Direction visuelle propre à AREMS (à partir du logo et du sujet) : valeurs définitives des tokens de `global.css`, typographie (latin + arabe), signature graphique ; couleurs officielles des badges UICN.
- `ui.ts` : libellés FR complets (AR et EN : mêmes clés, à traduire plus tard), `sections`.
- `content.config.ts` : schémas Zod de `especes`, `sites`, `sentiers`, `actions`, `partenaires`, `pages`, avec le champ `aCompleter`. Schéma des fichiers `src/data/geo/*.json`.
- `src/config/association.ts`, `docs/contenu-a-fournir.md`, script `npm run todo`.
- Header (Biodiversité, Sites & sentiers, Actions, Association, Contact) et Footer (partenaires, réseaux sociaux).

**Fini quand** : la navigation complète existe en FR, et `npm run todo` fonctionne.

### Phase 2 — Migration du contenu
- `scripts/migrate-from-sql.mjs` : lit les `INSERT` de `../arems-main/db_backup/backup.sql` sans MySQL et écrit les fichiers Markdown FR. Il applique les corrections listées dans `CLAUDE.md` et pose `aCompleter: true` partout où un doute subsiste.
- Fichiers `src/data/geo/` provisoires pour les deux sentiers (points sans coordonnées).
- `scripts/media.mjs` (sharp + ffmpeg) :
  - ne garder que les médias référencés ;
  - renommer d'après le slug ;
  - redimensionner à 1600 px maximum en WebP ;
  - convertir les WAV en MP3 ;
  - lister les fichiers inutilisés.
- `docs/rapport-migration.md` : corrections faites et points à faire valider.

**Fini quand** : tout le contenu passe la validation des schémas au build.

### Phase 3 — Pages et composants (parité)
1. Fiche espèce et catalogue Biodiversité (filtrage par catégorie en pages statiques).
2. Fiche sentier et liste, avec `TrailMap` qui lit le fichier geo : tracé et marqueurs si les coordonnées existent, sinon centrage sur le site et mention « Tracé indicatif » ; bouton « me localiser » conservé.
3. Fiche site avec ses espèces et ses sentiers.
4. Fiche action et liste, avec galerie.
5. `MeteoWidget` : Open-Meteo (`api.open-meteo.com/v1/forecast`, variables actuelles : température, vent, humidité, code météo → pictogramme et libellé dans `ui.ts`). Appel côté client, cache de 30 minutes en `sessionStorage`, rien d'affiché si l'appel échoue. Coordonnées lues dans le fichier geo du site ou dans `src/config/association.ts`. Attribution « Données météo : Open-Meteo » sous le widget. Sur l'accueil et sur les fiches site.
6. Accueil, page Association (emplacement), 404.

**Fini quand** : toutes les routes FR existent, le build passe, aucun lien n'est cassé.

### Phase 4 — Contact
Adapter `api/contact.ts` : objet `[AREMS]`, sujets propres à l'association (bénévolat, partenariat, presse, scolaires, signaler une observation, autre). Vérifier le domaine dans Resend le moment venu.

### Phase 5 — SEO et qualité
- Sitemap, hreflang (langues publiées seulement), Open Graph.
- JSON-LD : `NGO`, `TouristAttraction`, `Event`.
- Accessibilité : `alt` et transcription des sons.
- Lighthouse au-dessus de 95.

### Phase 6 — Déploiement de zéro
- Projet Vercel relié à `taharjarboui/Arems`, domaine `memoires-sousse.org` (et `www`), variables d'environnement.

**Fini quand** : le site est en ligne en HTTPS, et un message de test envoyé par le formulaire de contact arrive bien.

### Phase 7 — Intégration du contenu de l'association
Au fil de l'eau, selon `docs/contenu-a-fournir.md` et la logique de mise à jour ci-dessus, jusqu'à ce que `npm run todo` soit vide.

### Phase 8 — Traductions
Traduire `ui.ts` puis le contenu en AR, puis en EN (même slug), et ajouter la langue à `publishedLangs`.

### Phase 9 — Après la parité
Page S'engager, Actualités, Plausible, Sanity (seul `content.config.ts` change), archivage de `arems-main/`.

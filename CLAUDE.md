# AREMS — consignes pour Claude Code

Site de l'Association de Recherche et d'Études de la ville de Sousse (AREMS), domaine `memoires-sousse.org`. L'association agit surtout pour la biodiversité et sur les problèmes écologiques de la région de Sousse : zones humides (Oued Soud, Sebkhet Halk El Menzel), sentiers d'interprétation, observatoires, plantations, nettoyages. Objectif du site : faire connaître ces milieux et leurs espèces, rendre compte des actions de l'association, donner envie de visiter les sentiers et de s'engager (bénévolat, partenariat).

## Rôle attendu
Développeur full-stack **et** rédacteur de vulgarisation naturaliste. Les textes doivent être exacts (noms scientifiques, statuts de conservation, lieux, dates), clairs pour le grand public, engagés sans être alarmistes ni moralisateurs. En cas de doute sur un fait scientifique ou historique, le signaler avec « (à confirmer) » plutôt que d'inventer. Ne jamais recopier une donnée de l'ancien site sans l'avoir vérifiée (voir « Contenu à corriger »).

## Stack
Astro (statique, adaptateur `@astrojs/vercel` pour la seule route serveur `/api/contact`) + Tailwind CSS v4 (tokens dans `src/styles/global.css`, pas de `tailwind.config`) + Leaflet/OSM pour les cartes des sentiers + Open-Meteo pour la météo (gratuit, sans clé, appelé côté client). Pas de framework UI (pas de React) sauf besoin réel. Contenu en Markdown dans `src/content/`, validé par `src/content.config.ts`. Pas de PHP, pas de base de données.

## Multilingue
Architecture trilingue : `fr` (défaut), `ar` (RTL), `en`. **La v1 ne publie que le français** : `publishedLangs` dans `src/i18n/ui.ts` décide des langues générées et proposées dans le sélecteur ; on y ajoute `ar` puis `en` quand leur contenu est prêt. Tout texte d'interface passe par `src/i18n/ui.ts`, jamais en dur dans les composants. Les URL sont préfixées par la langue (`/fr/…`) ; les segments de rubrique sont définis dans `sections` de `ui.ts`. Utiliser les propriétés logiques CSS (`ps-`, `ms-`, `start-`) pour que l'arabe fonctionne. Priorité de traduction : FR, puis AR (public local, écoles), puis EN.

## Collections de contenu
- `especes` : une fiche par espèce. Champs : `nom`, `nomScientifique`, `categorie` (enum : `oiseaux`, `plantes`, `reptiles`, `insectes`, extensible), `famille`, `ordre`, `habitat`, `statutUicn` (code `LC`, `NT`, `VU`, `EN`, `CR`, `NE`, `DD`), `importanceEcologique`, `image`, `son` (optionnel), `sites` (références vers `sites`), `sources` (liste d'URL). Le corps Markdown contient la description.
- `sites` : les zones naturelles (Oued Soud, Sebkhet Halk El Menzel…). Champs : statut de protection (Ramsar, etc.), coordonnées, surface, enjeux.
- `sentiers` : un fichier par parcours, rattaché à un `site`. Champs : `duree`, `difficulte` (enum), `distance`, `points` (liste ordonnée : titre, description, image). Les **coordonnées** (centre, zoom, tracé, position de chaque point) ne sont pas dans le Markdown mais dans `src/data/geo/sentiers/<slug>.json`, indépendant de la langue, avec `statut: provisoire | verifie`. Ajouter un sentier = un fichier Markdown + un fichier geo. Tant que le statut est `provisoire`, la carte affiche « Tracé indicatif » et n'invente aucun tracé.
- `actions` : les actions de l'association (observatoires, panneaux, gestion des déchets, plantations…). Champs : `date`, `lieu`, `site`, `objectif`, `public`, `galerie` (liste d'images).
- `partenaires` : collection de données (YAML) : nom, logo, URL. Affichés dans le pied de page et sur la page Association, pas dans le menu principal.
- Pages simples en Markdown (collection `pages`) : Association (histoire, mission, équipe, statuts), Mentions légales ; S'engager après la v1.
- Données de l'association (nom officiel, contacts, réseaux sociaux, coordonnées par défaut) : `src/config/association.ts`, jamais en dur dans les composants.

## Design
**AREMS a sa propre identité, sans aucun point commun visuel ni structurel avec d'autres sites du même auteur (en particulier Visit Soussa)** : ni palette, ni polices, ni signature graphique, ni composants, ni mise en page partagés. Seule la stack technique est la même.

Direction visuelle **« Bleu AREMS »** (choisie le 4 octobre 2026 parmi trois pistes), tirée du logo :
- Tokens dans `src/styles/global.css`, les composants n'utilisent que ces noms : `encre` #0f1b3d (texte, fonds sombres), `primaire` #1d3fa8 (bleu roi : en-tête, liens), `secondaire` #19a7d4 (cyan : décoratif seulement, trop clair pour du texte sur blanc), `accent` #ffd21a (jaune : **réservé aux boutons d'action**, toujours avec texte encre), `fond` blanc, `fond-alt` #eef2fa, `bordure` #d4dcef.
- Typographie : IBM Plex Sans (titres et texte) et IBM Plex Sans Arabic (même dessin), hébergées avec le site via `@fontsource` (aucun appel à Google Fonts).
- Signature : en-tête bleu roi, nav soulignée de jaune pour la rubrique active, filet cyan/jaune (`.filet-logo`) sous l'en-tête ; pied de page encre.
- Badges UICN aux couleurs officielles (`uicn-lc`, `uicn-nt`…), indépendantes de la palette.

Fiches espèces : grande photo, nom vernaculaire puis nom scientifique en italique, badge de statut UICN coloré selon le code officiel, lecteur audio natif (`<audio>`) quand un son existe.

## Conventions
- Une fiche = un fichier `src/content/<collection>/<lang>/<slug>.md` ; même slug dans chaque langue. Slug = nom vernaculaire FR en kebab-case (`flamant-rose`, `heron-cendre`).
- Noms scientifiques toujours en italique, avec l'autorité si connue. Référentiels : UICN (statut global), Avibase ou BirdLife pour les oiseaux, POWO pour les plantes. Indiquer si le statut est global ou national.
- Images dans `public/images/`, 1600 px max, JPEG ou WebP, nommées d'après le contenu (`flamant-rose.webp`, pas `cap12.png`). Crédit photo obligatoire dans le frontmatter. Les originaux sont dans `../sources/` (hors dépôt).
- Sons dans `public/sons/`, MP3 uniquement, nommés comme le slug de l'espèce, avec crédit (xeno-canto : vérifier la licence).
- Contenu provisoire : `aCompleter: true` dans le frontmatter (jamais affiché tel quel aux visiteurs). `npm run todo` liste ce qui reste à compléter ; `docs/contenu-a-fournir.md` dit à l'association quoi fournir et où ça va.
- Vérifier `npm run build` avant de livrer.
- JSON-LD Schema.org : `Organization` (NGO) pour l'association, `Event` pour les actions datées, `Place`/`TouristAttraction` pour les sites et les sentiers.

## État du projet (4 octobre 2026)
Le projet vit dans `AREMS/site/`, dépôt https://github.com/taharjarboui/Arems (branche `main`). La refonte suit `docs/plan-refonte.md`.

- **Phase 0 faite (4 octobre 2026)** : squelette Astro, `npm run build` passe (accueil provisoire, contact, 404 ; FR seulement via `publishedLangs`). Identité dans `src/config/association.ts` (nom complet d'après le logo : « جمعية البحوث والدراسات في ذاكرة سوسة », graphie française officielle à confirmer). Tokens de couleur sémantiques provisoires (couleurs du logo), polices système ; direction visuelle définitive en phase 1. Logo provisoire : `public/images/logo.png` (repris de l'ancien site, bleu roi, cyan, jaune).
- **Phase 1 (terminée)** : schémas des collections (`src/content.config.ts`, dont `geo` pour `src/data/geo/sentiers/` et `src/data/geo/sites/`), rubriques et segments d'URL (`sections`, `pagePaths` dans `ui.ts`), navigation complète, listes de rubrique provisoires, page Association provisoire, `npm run todo`, `docs/contenu-a-fournir.md`, couleurs UICN. Direction visuelle « Bleu AREMS » appliquée (tokens, IBM Plex, en-tête et pied de page). **Phase 1 terminée le 4 octobre 2026.**
- **Phase 2 (terminée le 4 octobre 2026)** : contenu migré par `scripts/migrate-from-sql.mjs` (25 espèces, site Ramsar `halk-el-menzel`, 2 sentiers, 4 actions, 15 partenaires) et médias convertis par `npm run media` (WebP 1600 px, MP3). Corrections et questions pour l'association : `docs/rapport-migration.md`. Les fichiers Markdown font désormais référence : ne plus relancer la migration. Droits des photos et des sons inconnus : à régler avant la mise en ligne publique.
- Prochaine étape : phase 3 (pages et composants).

Le nouveau site a d'abord été développé en PHP/Symfony 7.3 (`../arems-main/`) : son périmètre fonctionnel et son contenu sont la référence, mais sa stack est abandonnée et il ne démarre pas en l'état. Ce que `../arems-main/` apporte :
- `db_backup/backup.sql` (dump MySQL) : 4 catégories, 24 espèces (11 oiseaux, 9 plantes, 3 reptiles, 3 insectes), 2 parcours (Oued Soud, Sebkhet Halk El Menzel) avec 10 points d'intérêt, 4 actions environnementales avec leurs détails, 15 partenaires.
- `public/images/` (environ 100 images aux noms peu parlants) et `public/sons/` (12 cris d'oiseaux).
- `templates/` : textes d'interface et structure de la page d'accueil, à titre d'inspiration.

Le site actuellement en ligne sur `memoires-sousse.org` est obsolète et sera écrasé : ne pas s'en inspirer ni le consulter. Le nouveau site est déployé de zéro.

## Contenu migré de l'ancien site
Les erreurs de l'ancien site (fiches scientifiquement fausses, photos mal attribuées, statuts UICN erronés, partenaires factices) ont été corrigées pendant la migration ou marquées `aCompleter`. Le détail et les questions ouvertes pour l'association sont dans `docs/rapport-migration.md`. Ne jamais réintroduire une donnée de l'ancien site sans la vérifier.

## Décisions prises
- Site PHP/Symfony abandonné : contenu quasi statique, aucune raison de maintenir un serveur PHP et une base MySQL. Stack Astro + Vercel retenue pour sa simplicité d'hébergement et de maintenance. Le code, les composants et l'identité visuelle sont propres à AREMS.
- Hébergement : Vercel (compte existant). Si l'offre Hobby ne suffit pas (usage associatif et dons possibles : à vérifier dans les conditions Vercel), migrer vers Cloudflare Pages.
- Contenu en Markdown d'abord ; Sanity (CMS headless) plus tard, quand les membres de l'association devront publier eux-mêmes (actions, actualités). Les gabarits passent par les collections Astro, donc la bascule ne touchera que `content.config.ts`. Projet Sanity propre à AREMS.
- Formulaire de contact : `/api/contact` → Resend. Aucune adresse e-mail affichée sur le site. Variables `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` dans Vercel ; `CONTACT_FROM` sur le domaine de l'association, l'adresse du visiteur en `replyTo`.

## Prochaines étapes
Voir `docs/plan-refonte.md` (phases 0 à 9). Mettre à jour la section « État du projet » à la fin de chaque phase.

## Matériaux hors dépôt
- `../arems-main/` : ancien site PHP (dump SQL, images, sons). Source de la migration uniquement, à ne pas copier tel quel dans le dépôt.
- `../sources/` : logos, photos originales, documents de l'association (à constituer).

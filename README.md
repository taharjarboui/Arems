# AREMS — site

Site de l'association AREMS (Sousse) : biodiversité, zones humides, sentiers et actions de l'association. Astro + Tailwind CSS, statique ; architecture trilingue (FR / AR / EN), seul le français est publié pour l'instant.

Consignes de travail : [CLAUDE.md](CLAUDE.md). Plan de refonte depuis l'ancien site Symfony : [docs/plan-refonte.md](docs/plan-refonte.md).

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
npm run preview    # teste le build
```

## Où est quoi

| Dossier | Rôle |
|---|---|
| `src/content/<collection>/<fr|ar|en>/*.md` | Le contenu : une fiche = un fichier Markdown. Le même nom de fichier dans `fr/`, `ar/`, `en/` relie les versions d'une fiche. |
| `src/content.config.ts` | Les champs autorisés pour chaque collection. |
| `src/data/geo/` | Coordonnées des sentiers et des sites (cartes, météo), indépendantes de la langue. |
| `src/config/association.ts` | Nom, contacts et réseaux sociaux de l'association. |
| `src/i18n/ui.ts` | Textes de l'interface, segments d'URL par langue, langues publiées (`publishedLangs`). |
| `src/pages/[lang]/` | Les gabarits. |
| `src/components/` | Header, Footer, `GeoMap` (Leaflet), `MeteoWidget` (Open-Meteo), `FicheCard`, `UicnBadge`, `Gallery`, fiches par rubrique (`fiches/`). |
| `src/styles/global.css` | Palette, typographie. |
| `public/images/` | Images optimisées pour le web (1600 px max). |

## Scripts

| Commande | Rôle |
|---|---|
| `npm run todo` | Liste ce qui reste à compléter (contenu provisoire, coordonnées, partenaires) |
| `npm run vignettes` | Crée la vignette 800 px de chaque nouvelle photo (lancé aussi par `npm run build`) |
| `npm run icones` | Régénère favicon, icône mobile, logo léger et image de partage à partir du logo |
| `npm run test:protection` | Teste la protection par mot de passe |

## Publier une langue

Traduire les libellés dans `src/i18n/ui.ts` et le contenu dans `src/content/<collection>/<langue>/`, puis ajouter la langue à `publishedLangs`.

## Protection par mot de passe (avant l'ouverture au public)

Tant que `src/config/protection.json` contient `"protection": true`, le site en ligne n'est pas public :

- tout visiteur arrive sur la page d'attente `/bientot/` ;
- le logo de cette page mène à `/acces`, où l'on saisit le mot de passe (variable Vercel **`SITE_PASSWORD`**) ; l'accès reste ouvert 30 jours sur ce navigateur ;
- pages, images, sons et plan du site sont inaccessibles sans ce passage ; `/robots.txt` interdit l'indexation ;
- `/sortie` déconnecte.

La protection est un middleware Vercel (`scripts/protection/middleware.js`) ajouté après `astro build` par `scripts/protection/install.mjs`. Elle ne s'applique pas à `npm run dev`. Tests : `npm run test:protection`. Sans `SITE_PASSWORD`, personne ne peut entrer. Changer le mot de passe déconnecte tout le monde.

**Ouvrir le site au public** : passer `"protection": false`, commiter, pousser.

## Déploiement

Hébergé sur Vercel : chaque push sur `main` redéploie. Domaine `memoires-sousse.org`. La redirection `/` → `/fr/` est définie dans `astro.config.mjs` (`redirects`).

Le site est statique, sauf `/api/contact` ([src/pages/api/contact.ts](src/pages/api/contact.ts)) : une fonction Vercel qui envoie le formulaire de contact par e-mail via Resend. Variables d'environnement (voir `.env.example`) :

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` | Clé API Resend (secrète) |
| `CONTACT_TO` | Adresse(s) qui reçoivent les messages |
| `SITE_PASSWORD` | Mot de passe d'accès tant que la protection est active |
| `CONTACT_FROM` | Expéditeur ; par défaut `onboarding@resend.dev`, à remplacer par une adresse `@memoires-sousse.org` une fois le domaine vérifié dans Resend |

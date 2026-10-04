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
| `src/components/` | Header, Footer, Card, Map (Leaflet), SectionHeading. |
| `src/styles/global.css` | Palette, typographie. |
| `public/images/` | Images optimisées pour le web (1600 px max). |

## Publier une langue

Traduire les libellés dans `src/i18n/ui.ts` et le contenu dans `src/content/<collection>/<langue>/`, puis ajouter la langue à `publishedLangs`.

## Déploiement

Hébergé sur Vercel : chaque push sur `main` redéploie. Domaine `memoires-sousse.org`. La redirection `/` → `/fr/` est définie dans `astro.config.mjs` (`redirects`).

Le site est statique, sauf `/api/contact` ([src/pages/api/contact.ts](src/pages/api/contact.ts)) : une fonction Vercel qui envoie le formulaire de contact par e-mail via Resend. Variables d'environnement (voir `.env.example`) :

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` | Clé API Resend (secrète) |
| `CONTACT_TO` | Adresse(s) qui reçoivent les messages |
| `CONTACT_FROM` | Expéditeur ; par défaut `onboarding@resend.dev`, à remplacer par une adresse `@memoires-sousse.org` une fois le domaine vérifié dans Resend |

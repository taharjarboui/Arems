# Contenu à fournir par l'association

Liste à transmettre à l'AREMS. Pour chaque élément : ce qu'il faut, sous quelle forme, et où il est intégré dans le site. Rien n'est bloquant pour la mise en ligne : en attendant, le site affiche un contenu provisoire.

`npm run todo` donne l'état à jour de ce qui reste à compléter.

Les questions précises issues de la migration de l'ancien site (photos mal attribuées, espèces douteuses, partenaires à identifier, droits des médias) sont détaillées dans [rapport-migration.md](rapport-migration.md).

## Identité

| Élément | Format souhaité | Emplacement |
|---|---|---|
| Nom officiel complet, en français et en arabe, tel qu'il figure dans les statuts | Texte | `src/config/association.ts` (`nom`, `nomAr`) |
| Logo en haute définition | SVG, ou PNG de 1000 px de large minimum sur fond transparent | `public/images/logo.svg` (ou `.png`) |
| Adresse postale (si elle doit apparaître sur le site) | Texte | `src/config/association.ts` (`adresse`) |
| Réseaux sociaux | Liens (Facebook, Instagram…) | `src/config/association.ts` (`reseaux`) |
| Adresse e-mail qui reçoit les messages du formulaire de contact | Adresse e-mail (n'apparaît jamais sur le site) | Variable `CONTACT_TO` dans Vercel |

## Page « L'association »

| Élément | Format souhaité | Emplacement |
|---|---|---|
| Histoire (date de création, contexte) | Texte, une demi-page | `src/content/pages/fr/association.md` |
| Mission et domaines d'action | Texte | idem |
| Équipe ou bureau (noms, rôles), si souhaité | Liste | idem |
| Comment adhérer ou devenir bénévole | Texte | idem (puis page « S'engager » après la v1) |

## Sites et sentiers

| Élément | Format souhaité | Emplacement |
|---|---|---|
| Nom officiel de chaque site (ex. graphie exacte « Oued Soud » ou « Oued Essed ») et statut de protection (Ramsar, date) | Texte | `src/content/sites/fr/<site>.md` |
| Tracé de chaque sentier | Fichier GPX ou KML (enregistré avec un téléphone pendant le parcours suffit), ou liste de points GPS | `src/data/geo/sentiers/<sentier>.json` (champ `trace`) |
| Position de chaque point d'intérêt (panneau, observatoire…) | Coordonnées GPS ou point marqué dans le GPX | `src/data/geo/sentiers/<sentier>.json` (champ `points`) |
| Durée, distance, difficulté de chaque sentier | Texte | `src/content/sentiers/fr/<sentier>.md` |

## Biodiversité

| Élément | Format souhaité | Emplacement |
|---|---|---|
| Validation de la liste des espèces : espèces réellement observées sur les sites, espèces à retirer ou à ajouter | Relecture de `docs/rapport-migration.md` (produit en phase 2) | `src/content/especes/fr/` |
| Photos des espèces, avec nom du photographe et autorisation de publication | JPEG 2000 px minimum | `public/images/especes/` |
| Enregistrements des cris d'oiseaux, avec leur source | MP3 ou WAV, source (xeno-canto ou enregistrement propre) | `public/sons/` |

## Actions

| Élément | Format souhaité | Emplacement |
|---|---|---|
| Pour chaque action : date, lieu, objectif, public, partenaires | Texte | `src/content/actions/fr/<action>.md` |
| Photos des actions, avec crédit | JPEG 2000 px minimum | `public/images/actions/` |

## Partenaires

| Élément | Format souhaité | Emplacement |
|---|---|---|
| Nom et site web de chaque partenaire (les 15 logos de l'ancien site sont sans nom) | Liste | `src/content/partenaires/partenaires.yaml` |
| Logos en bonne qualité | SVG ou PNG transparent | `public/images/partenaires/` |

## Comment un contenu est intégré

1. Remplacer le fichier ou le champ indiqué ci-dessus.
2. Retirer le marqueur : `aCompleter: true` (fiches, pages, partenaires) ou passer `statut` à `verifie` (coordonnées), et supprimer les « (à confirmer) » levés.
3. Vérifier avec `npm run todo` puis `npm run build`.
4. Commiter et pousser sur `main` : le site est redéployé automatiquement.

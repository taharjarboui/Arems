# Rapport de migration du contenu (phase 2)

Le contenu de l'ancien site (base MySQL `arems-main/db_backup/backup.sql`, images et sons) a été converti en fichiers Markdown le 4 octobre 2026 par `scripts/migrate-from-sql.mjs`. Ce rapport liste ce qui a été corrigé et ce que l'association doit valider. Il est destiné à être relu par un membre de l'association connaissant les sites.

`npm run todo` donne la liste à jour des fiches encore provisoires.

## Ce qui a été repris

| Contenu | Ancien site | Nouveau site |
|---|---|---|
| Espèces | 26 fiches | 25 fiches (la fiche « Mouche » n'est pas reprise) |
| Sites | aucun (table vide) | 1 site : Sebkhet Halk El Menzel et Oued Essed (site Ramsar n° 2006) |
| Sentiers | 2 parcours, 10 points d'intérêt | 2 sentiers, 10 points d'intérêt |
| Actions | 4 actions et leurs détails | 4 actions |
| Partenaires | 15 logos nommés « Sponsor 1 » à « Sponsor 9 » | 15 partenaires, dont 11 identifiés d'après leur logo |
| Médias | 99 images et 12 sons (36 Mo) | 56 images et 11 sons convertis (5,4 Mo) |

## 1. Espèces : erreurs corrigées

### Fiches remplacées
| Ancienne fiche | Problème | Nouvelle fiche |
|---|---|---|
| Râle d'eau (*Rallus aquaticus*) | La photo et le cri étaient ceux de la foulque macroule. | **Foulque macroule** (*Fulica atra*). Si le râle d'eau est aussi observé, il faudra une fiche séparée avec sa propre photo. |
| Tortue d'Hermann (*Testudo hermanni*) | Espèce absente de Tunisie. La photo montre une tortue terrestre compatible avec la tortue grecque. | **Tortue grecque** (*Testudo graeca*), VU. |
| Couleuvre à collier (*Natrix natrix*) | Espèce absente de Tunisie. | **Couleuvre vipérine** (*Natrix maura*), dont le motif correspond à la photo. |
| Papillon monarque (*Danaus plexippus*) | Espèce américaine. La photo montre un petit monarque. | **Petit monarque** (*Danaus chrysippus*). |
| Lavande de mer (*Limonium monopetalum*) | Ce nom désigne le Limoniastrum, qui ne correspond pas à la photo (un Limonium). | **Statice** (*Limonium* sp.), espèce à identifier. |

### Données scientifiques corrigées
| Fiche | Erreur | Correction |
|---|---|---|
| Héron cendré | Nom scientifique, famille et ordre du martin-pêcheur (*Alcedo atthis*, Alcedinidae, Coraciiformes) | *Ardea cinerea*, Ardeidae, Pelecaniformes |
| Canard colvert, Flamant rose | Statut « Vulnérable » | LC (préoccupation mineure) |
| Spatule blanche, Crabier chevelu | Statut « Quasi menacé » | LC |
| Cistude d'Europe | Statut « Vulnérable » | NT (quasi menacé) |
| Roseau commun | *Phragmites communis* (ancien nom) | *Phragmites australis* |
| Toutes les plantes | Famille « Plantes vasculaires », ordre « Angiospermes » | Famille et ordre réels (Juncaceae, Poaceae, Typhaceae, Tamaricaceae…) |
| Toutes les fiches | Adresses temporaires (`slug-temp-20`…) | Adresses lisibles (`/fr/biodiversite/flamant-rose`) |

Les statuts UICN indiqués sont des statuts **mondiaux**. Ils sont à vérifier sur [iucnredlist.org](https://www.iucnredlist.org), et un statut national pourra être ajouté si l'association le souhaite. Les plantes n'ont pas de statut pour l'instant.

### Photos mal attribuées dans l'ancien site
Les photos avaient été mélangées entre les fiches :

| Fiche | Ce que montrait la photo | Décision |
|---|---|---|
| Héron cendré (`gris.jpeg`) | Une cane colvert en vol | Remplacée par `crabier.jpeg`, qui montre un héron cendré |
| Crabier chevelu (`crabier.jpeg`) | Un héron cendré | Pas de photo, **à fournir** |
| Mouette rieuse (`railleur.jpeg`) | Un chevalier (probablement chevalier stagnatile) | Pas de photo, **à fournir** |
| Jonc maritime (`plante4.jpeg`) | Une tortue d'eau sur des roseaux | Pas de photo, **à fournir** |
| Reichardie de Tanger (`flower2.jpeg`) | Une fleur de figuier de Barbarie | Pas de photo, **à fournir** |
| Massette (`plante5.jpeg`) | Bonne espèce, mais filigrane d'un site tiers | Écartée, **à fournir** |
| Cistude d'Europe (`tor.jpeg`) | Une tortue d'eau qui ressemble plutôt à une **émyde lépreuse** (*Mauremys leprosa*), commune en Tunisie | Écartée. **À trancher** : la cistude est-elle observée sur les sites, ou faut-il une fiche émyde lépreuse ? |
| Libellule (`inse1.jpeg`) | Une libellule bleu sombre, qui n'est pas *Libellula depressa* | Gardée, **espèce à identifier** |

### Fiches à valider
- **Présence sur les sites** : aucune fiche n'est encore rattachée à un site (`sites: []`). L'association doit indiquer, pour chaque espèce, si elle est observée à Halk El Menzel, à l'Oued Soud, ou aux deux.
- **Espèces douteuses** : la nigelle des champs, la reichardie de Tanger et la datura stramoine sont des plantes de champs et de friches, pas de zones humides. Faut-il les garder ?
- **Salicorne** : l'espèce exacte est à confirmer (*Salicornia*, *Sarcocornia* ou *Arthrocnemum*).
- **Espèces à envisager** : la fiche Ramsar cite la **sarcelle marbrée** (*Marmaronetta angustirostris*, VU) comme espèce importante du site. Elle n'a pas de fiche.
- **Fiche non reprise** : « Mouche » (*Musca domestica*), fiche générique sans lien avec les sites.

### Droits des photos et des sons
**L'origine de la plupart des médias est inconnue.** Plusieurs photos ressemblent à des images trouvées sur Internet (canard colvert sur la glace, tadorne sur une pelouse de parc, grèbe, poule d'eau), et les sons viennent probablement de banques en ligne. Avant la mise en ligne, il faut :
- pour chaque photo, connaître l'auteur et avoir son autorisation, ou la remplacer par une photo de l'association ;
- pour chaque son, connaître la source et la licence. Sur [xeno-canto](https://xeno-canto.org), la plupart des enregistrements sont en licence Creative Commons et imposent de citer l'auteur.

Le champ `imageCredit` ou `sonCredit` de chaque fiche est à compléter en conséquence.

## 2. Site et sentiers

- **Le site Ramsar** a été créé d'après la fiche officielle ([Ramsar n° 2006](https://rsis.ramsar.org/ris/2006)) : 1 450 ha, désigné le 2 février 2012, centre 35°59′23″ N, 10°30′10″ E. Le texte de présentation est à compléter par l'association.
- **« Oued Soud »** : les panneaux de l'association écrivent « Oued Essoud », et la fiche Ramsar « Oued Essed ». **Quelle graphie retenir ?**
- **Sentier de Halk El Menzel** : l'ancien site citait les coordonnées GPS du départ (35°58′18.10″ N, 10°31′27.65″ E) et de l'arrivée (35°58′15.59″ N, 10°31′08.48″ E). Elles sont reprises dans `src/data/geo/sentiers/sentier-halk-el-menzel.json`, sans tracé. Il manque :
  - la position des 3 autres points ;
  - le tracé ;
  - la durée et la distance.

  Dans l'ancien site, l'observatoire venait après l'arrivée : **l'ordre des points est à vérifier.**
- **Circuit de l'Oued Soud** : il fait 740 m. Sa position est inconnue (la carte sera centrée sur le site Ramsar en attendant). Les titres des arrêts ont été réécrits, car la numérotation sautait du « premier » au « troisième » arrêt.
- **Plans des sentiers** : `image11.png` et `image12.png` sont des captures satellites avec le tracé dessiné. Elles sont gardées comme images de couverture et peuvent aider à saisir les tracés.

## 3. Actions

Les 4 actions sont reprises : postes d'observation, panneaux d'information, gestion des déchets, plantation d'arbres. Leurs textes sont très génériques (« Cette action contribue à la protection de l'environnement ») et n'ont ni date ni lieu. Pour chacune, il faut fournir :
- la date ou la période ;
- le lieu précis ;
- les objectifs et le bilan, avec des chiffres si possible ;
- les partenaires.

Une donnée chiffrée se trouve dans la description du sentier de Halk El Menzel : « un nettoyage de 5 400 m² et un périmètre reboisé de 300 mètres ». Elle pourrait étoffer les fiches Gestion des déchets et Plantation d'arbres.

La photo `image8.jpeg` (main tenant une jeune pousse), utilisée pour la gestion des déchets, est une photo d'illustration générique : **à remplacer par une photo d'action réelle.**

## 4. Partenaires

| Logo | Identification | À confirmer |
|---|---|---|
| `cap.png` | CRDA de Sousse | oui |
| `capt1.png` | MedWet | |
| `capt2.png` | JCI Hergla | |
| `capt3.png` | Logo bleu avec un bateau et texte arabe | **à identifier** |
| `capt4.png` | Blason | **à identifier** |
| `capt6.png` | Direction générale des forêts (d'après le texte arabe) | oui |
| `capt7.png` | Institut supérieur agronomique de Chott-Mariem | |
| `capt8.png` | Écusson bleu avec un bateau et des olives | **à identifier** |
| `capt9.png` | Commune de Sousse | oui |
| `capt10.png` | « Marie Curie » (établissement scolaire ?) | **à identifier** |
| `capt11.png` | PPI-OSCAN | |
| `cap12.png` | FFEM | |
| `cap13.png` | Office français de la biodiversité | |
| `cap14.png` | Fondation MAVA | |
| `cap15.png` | UICN | |

## 5. Médias non repris

43 images de l'ancien site ne sont utilisées par aucune fiche. Certaines peuvent servir plus tard, sur l'accueil ou dans les galeries :

| Fichiers | Remarque |
|---|---|
| `background*.jpeg`, `3.jpeg`, `8.jpeg` | Fonds de l'ancien accueil, dont une vue aérienne d'un oued (`background.jpeg`) |
| `eau.jpeg` | Chevalier dans l'eau (même oiseau que `railleur.jpeg`) |
| `insecte.jpeg` | Libellule rouge, probablement un crocothémis écarlate (*Crocothemis erythraea*) |
| `insec2-4.jpeg`, `papillon3-4.png`, `papilon2.png` | Autres insectes, à identifier |
| `pan1-3.jpeg` | Panneaux, utiles pour l'action « Panneaux d'information » |
| `gris.jpeg` | Cane colvert en vol |
| `tor.jpeg`, `plante4.jpeg` | Tortues d'eau, probablement des émydes lépreuses |
| `logo1.png` | Logo, déjà repris comme `public/images/logo.png` |
| ` Fulica.wav` | Enregistrement de 0,24 seconde, inutilisable |

Les fichiers originaux restent dans `arems-main/public/images/`.

## Comment refaire la migration

La migration est faite une fois pour toutes : désormais, on modifie directement les fichiers Markdown. Si elle devait être relancée (avant toute modification manuelle) : `node scripts/migrate-from-sql.mjs`, puis `npm run media`.

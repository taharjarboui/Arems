import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Collections de contenu, rangées par langue : src/content/<collection>/<fr|ar|en>/<slug>.md
// L'identifiant d'une entrée est donc "fr/flamant-rose", "ar/flamant-rose", etc.
// Les liens entre fiches (espèce → sites, sentier → site) utilisent le slug, commun à toutes les langues.
//
// `aCompleter: true` marque un contenu provisoire, en attente d'informations de l'association.
// Il n'est jamais affiché aux visiteurs ; `npm run todo` liste ces contenus.

const commun = {
  title: z.string(),
  summary: z.string(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imageCredit: z.string().optional(),
  order: z.number().default(100),
  aCompleter: z.boolean().default(false),
};

export const categoriesEspeces = ['oiseaux', 'plantes', 'reptiles', 'insectes'] as const;
export const statutsUicn = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD', 'NE'] as const;

const especes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/especes' }),
  schema: z.object({
    ...commun, // title = nom vernaculaire
    nomScientifique: z.string(),
    categorie: z.enum(categoriesEspeces),
    famille: z.string().optional(),
    ordre: z.string().optional(),
    habitat: z.string().optional(),
    statutUicn: z.enum(statutsUicn).optional(),
    /** Le statut UICN est mondial sauf mention contraire. */
    statutPortee: z.enum(['mondial', 'national']).default('mondial'),
    importanceEcologique: z.string().optional(),
    son: z.string().optional(),
    sonCredit: z.string().optional(),
    /** Slugs des sites où l'espèce est observée. */
    sites: z.array(z.string()).default([]),
    sources: z.array(z.string().url()).default([]),
  }),
});

const sites = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sites' }),
  schema: z.object({
    ...commun,
    protection: z.string().optional(), // ex. « Site Ramsar (2012) »
    commune: z.string().optional(),
    surface: z.string().optional(),
  }),
});

const sentiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sentiers' }),
  schema: z.object({
    ...commun,
    /** Slug du site naturel où se trouve le sentier. */
    site: z.string(),
    duree: z.string().optional(),
    distance: z.string().optional(),
    difficulte: z.enum(['facile', 'moyenne', 'difficile']).optional(),
    /** Points d'intérêt dans l'ordre du parcours ; leurs coordonnées sont dans src/data/geo/sentiers/<slug>.json (champ `n`). */
    points: z.array(z.object({
      titre: z.string(),
      description: z.string(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    })).default([]),
  }),
});

const actions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actions' }),
  schema: z.object({
    ...commun,
    date: z.coerce.date().optional(),
    lieu: z.string().optional(),
    site: z.string().optional(),
    galerie: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      credit: z.string().optional(),
    })).default([]),
  }),
});

// Pages simples (Association, Mentions légales) : src/content/pages/<lang>/<slug>.md
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    aCompleter: z.boolean().default(false),
  }),
});

// Partenaires : une seule liste, commune à toutes les langues.
const partenaires = defineCollection({
  loader: file('src/content/partenaires/partenaires.yaml'),
  schema: z.object({
    nom: z.string(),
    logo: z.string(),
    url: z.string().url().optional(),
    order: z.number().default(100),
    aCompleter: z.boolean().default(false),
  }),
});

// Coordonnées des sentiers et des sites : src/data/geo/<sentiers|sites>/<slug>.json
// Indépendantes de la langue. Ajouter un sentier = un fichier Markdown + un fichier geo.
const point = z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]); // [lat, lng]
const geo = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/geo' }),
  schema: z.object({
    /** `provisoire` : centrage approximatif, aucun tracé inventé ; la carte affiche « Tracé indicatif ». */
    statut: z.enum(['provisoire', 'verifie']),
    centre: point,
    zoom: z.number().int().min(1).max(19).default(14),
    /** Tracé du sentier (ou contour du site), dans l'ordre. Vide tant qu'il n'est pas relevé. */
    trace: z.array(point).default([]),
    /** Position des points d'intérêt ; `n` = rang du point dans le Markdown du sentier (1 = premier). */
    points: z.array(z.object({ n: z.number().int().positive(), position: point })).default([]),
    /** D'où viennent les coordonnées (ex. « GPX fourni par l'association, mars 2027 »). */
    source: z.string().optional(),
  }),
});

export const collections = { especes, sites, sentiers, actions, pages, partenaires, geo };

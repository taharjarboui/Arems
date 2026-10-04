// Données structurées schema.org (JSON-LD), lues par les moteurs de recherche.
// Règle : n'y mettre que des informations vérifiées. Les coordonnées au statut `provisoire`
// et les champs vides de src/config/association.ts n'y figurent pas.
import type { CollectionEntry } from 'astro:content';
import { association } from '../config/association';
import type { Lang } from '../i18n/ui';

type Geo = { statut: 'provisoire' | 'verifie'; centre: [number, number] } | undefined;

const abs = (path: string, site: URL) => new URL(path, site).toString();

export function organisation(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': abs('/#association', site),
    name: association.nom,
    alternateName: [association.sigle, association.nomAr],
    url: site.toString(),
    logo: abs('/images/logo.png', site),
    address: { '@type': 'PostalAddress', addressLocality: association.ville, addressCountry: association.pays, ...(association.adresse && { streetAddress: association.adresse }) },
    ...(association.reseaux.length > 0 && { sameAs: association.reseaux.map((r) => r.url) }),
  };
}

export function siteWeb(site: URL, lang: Lang) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', url: site.toString(), name: association.sigle, inLanguage: lang, publisher: { '@id': abs('/#association', site) } };
}

/** Fil d'Ariane : [libellé, chemin] du plus général au plus précis. */
export function ariane(site: URL, items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path, site) })),
  };
}

const geo = (g: Geo) => (g?.statut === 'verifie' ? { geo: { '@type': 'GeoCoordinates', latitude: g.centre[0], longitude: g.centre[1] } } : {});
const image = (path: string | undefined, site: URL) => (path ? { image: abs(path, site) } : {});

export function lieu(entry: CollectionEntry<'sites'> | CollectionEntry<'sentiers'>, url: URL, site: URL, g: Geo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: entry.data.title,
    description: entry.data.summary,
    url: url.toString(),
    ...image(entry.data.image, site),
    ...geo(g),
    address: { '@type': 'PostalAddress', addressLocality: association.ville, addressCountry: association.pays },
  };
}

export function espece(entry: CollectionEntry<'especes'>, url: URL, site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Taxon',
    name: entry.data.nomScientifique,
    alternateName: entry.data.title,
    // « Limonium sp. » ou « Anisoptera » désignent un genre ou un groupe, pas une espèce.
    ...(/ sp\.$|^[A-Z][a-z]+$/.test(entry.data.nomScientifique) ? {} : { taxonRank: 'species' }),
    url: url.toString(),
    ...image(entry.data.image, site),
  };
}

/** Une action n'est un événement que si elle a une date. */
export function action(entry: CollectionEntry<'actions'>, url: URL, site: URL, lieuNom?: string) {
  if (!entry.data.date) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: entry.data.title,
    description: entry.data.summary,
    startDate: entry.data.date.toISOString().slice(0, 10),
    url: url.toString(),
    ...image(entry.data.image, site),
    organizer: { '@id': abs('/#association', site) },
    ...(lieuNom && { location: { '@type': 'Place', name: lieuNom, address: { '@type': 'PostalAddress', addressLocality: association.ville, addressCountry: association.pays } } }),
  };
}

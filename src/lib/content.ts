import { getCollection, type CollectionEntry } from 'astro:content';
import { publishedLangs, sections, type Lang, type SectionKey, type PageKey } from '../i18n/ui';
import { homeUrl, contactUrl, sectionUrl, pageUrl, splitId } from '../i18n/utils';

type FicheCollection = 'especes' | 'sites' | 'sentiers' | 'actions';

/** Entrées d'une collection pour une langue, triées par `order` puis titre. */
export async function entriesFor<C extends FicheCollection>(collection: C, lang: Lang): Promise<CollectionEntry<C>[]> {
  const all = (await getCollection(collection, (e) => splitId(e.id).lang === lang)) as CollectionEntry<C>[];
  return all.sort((a, b) => (a.data.order - b.data.order) || a.data.title.localeCompare(b.data.title, lang));
}

/** Coordonnées d'un sentier ou d'un site (src/data/geo/<type>/<slug>.json), ou undefined. */
export async function geoFor(type: 'sentiers' | 'sites', slug: string) {
  const all = await getCollection('geo', (e) => e.id === `${type}/${slug}`);
  return all[0]?.data;
}

/** Équivalents d'une page dans chaque langue publiée, pour hreflang et le sélecteur de langue. */
function alternatesFor(url: (lang: Lang) => string) {
  const alternates: Partial<Record<Lang, string>> = {};
  for (const l of publishedLangs) alternates[l] = url(l);
  return alternates;
}

export const homeAlternates = () => alternatesFor(homeUrl);
export const contactAlternates = () => alternatesFor(contactUrl);
export const sectionAlternates = (section: SectionKey) => alternatesFor((l) => sectionUrl(l, section));
export const pageAlternates = (page: PageKey) => alternatesFor((l) => pageUrl(l, page));

/** Les URL d'une même fiche dans chaque langue publiée où elle existe. */
export async function ficheAlternates(section: SectionKey, slug: string) {
  const siblings = await getCollection(sections[section].collection, (e) => splitId(e.id).slug === slug);
  const alternates: Partial<Record<Lang, string>> = {};
  for (const e of siblings) {
    const { lang } = splitId(e.id);
    if (publishedLangs.includes(lang)) alternates[lang] = sectionUrl(lang, section, slug);
  }
  return alternates;
}

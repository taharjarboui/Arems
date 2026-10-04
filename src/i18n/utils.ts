import { ui, defaultLang, rtlLangs, sections, pagePaths, languages, publishedLangs, type Lang, type UiKey, type SectionKey, type PageKey } from './ui';

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  return isLang(lang) ? lang : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function isRtl(lang: Lang) {
  return rtlLangs.includes(lang);
}

/** Paramètres `getStaticPaths` d'une page présente dans chaque langue publiée. */
export function langPaths() {
  return publishedLangs.map((lang) => ({ params: { lang } }));
}

// Toutes les URL internes se terminent par « / », comme les pages générées (trailingSlash: 'always').

/** URL d'une section ("/fr/biodiversite/") ou d'une fiche ("/fr/biodiversite/flamant-rose/"). */
export function sectionUrl(lang: Lang, section: SectionKey, slug?: string) {
  const base = `/${lang}/${sections[section].path[lang]}/`;
  return slug ? `${base}${slug}/` : base;
}

/** Retrouve la section à partir d'un segment d'URL dans une langue donnée. */
export function sectionFromPath(lang: Lang, segment: string): SectionKey | undefined {
  return (Object.keys(sections) as SectionKey[]).find((k) => sections[k].path[lang] === segment);
}

/** URL d'une page simple ("/fr/association"). */
export function pageUrl(lang: Lang, page: PageKey) {
  return `/${lang}/${pagePaths[page][lang]}/`;
}

export function homeUrl(lang: Lang) {
  return `/${lang}/`;
}

/** Sépare "fr/flamant-rose" en { lang, slug }. */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: isLang(lang) ? lang : defaultLang, slug: rest.join('/') };
}

export function formatDate(date: Date, lang: Lang) {
  const locale = lang === 'ar' ? 'ar-TN' : lang === 'en' ? 'en-GB' : 'fr-FR';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function contactUrl(lang: Lang) {
  return `/${lang}/contact/`;
}

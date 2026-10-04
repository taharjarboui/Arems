import { publishedLangs, type Lang } from '../i18n/ui';
import { homeUrl, contactUrl } from '../i18n/utils';

// Les fonctions de lecture des collections (entrées par langue, alternates d'une fiche)
// arrivent en phase 1 avec les collections.

/** Équivalents d'une page dans chaque langue publiée, pour hreflang et le sélecteur de langue. */
function alternatesFor(url: (lang: Lang) => string) {
  const alternates: Partial<Record<Lang, string>> = {};
  for (const l of publishedLangs) alternates[l] = url(l);
  return alternates;
}

export const homeAlternates = () => alternatesFor(homeUrl);
export const contactAlternates = () => alternatesFor(contactUrl);

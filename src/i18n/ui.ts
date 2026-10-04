export const languages = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'fr';
export const rtlLangs: Lang[] = ['ar'];

// Langues générées et proposées dans le sélecteur. L'architecture gère les trois ;
// ajouter 'ar' puis 'en' ici une fois leur contenu et leurs libellés traduits.
export const publishedLangs: Lang[] = ['fr'];

// Sections du site : clé interne → segment d'URL par langue et collection associée.
// Remplies en phase 1 (biodiversite, sites, sentiers, actions).
export const sections = {} as const satisfies Record<string, { collection: string; path: Record<Lang, string> }>;

export type SectionKey = keyof typeof sections;

const fr = {
  'site.name': 'AREMS',
  'site.tagline': 'Zones humides et biodiversité de la région de Sousse',
  'nav.menu': 'Menu',
  'nav.lang': 'Langue',
  'hero.title': 'La nature de Sousse, à connaître et à protéger',
  'hero.text': 'Zones humides, oiseaux migrateurs, flore des sebkhas : l’association AREMS étudie et préserve la biodiversité de la région de Sousse.',
  'hero.cta': 'Nous écrire',
  'footer.about': 'L’association',
  'footer.contact': 'Nous contacter',
  'footer.rights': 'Tous droits réservés.',
  'contact.title': 'Nous contacter',
  'contact.intro': 'Une question sur nos actions, l’envie de participer, une proposition de partenariat, une observation à signaler ? Écrivez-nous.',
  'contact.name': 'Votre nom',
  'contact.email': 'Votre adresse e-mail',
  'contact.subject': 'Sujet',
  'contact.subject.benevolat': 'Participer aux actions',
  'contact.subject.partenariat': 'Partenariat',
  'contact.subject.scolaires': 'Visite scolaire',
  'contact.subject.observation': 'Signaler une observation',
  'contact.subject.presse': 'Presse',
  'contact.subject.autre': 'Autre',
  'contact.message': 'Votre message',
  'contact.send': 'Envoyer',
  'contact.sending': 'Envoi en cours…',
  'contact.success': 'Message reçu. Un membre de l’association vous répondra par e-mail.',
  'contact.error': 'L’envoi a échoué. Vérifiez votre adresse e-mail et votre message, puis réessayez.',
  'contact.privacy': 'Vos coordonnées ne servent qu’à traiter votre demande ; elles ne sont pas conservées sur ce site.',
  'card.read': 'Lire la fiche',
  'empty': 'Cette rubrique est en cours de rédaction.',
  '404.title': 'Page introuvable',
  '404.text': 'L’adresse saisie ne correspond à aucune page du site.',
  '404.back': 'Retour à l’accueil',
} as const;

export type UiKey = keyof typeof fr;

// Le français fait référence ; une clé absente en arabe ou en anglais retombe sur le français.
export const ui: { fr: typeof fr } & Record<Exclude<Lang, 'fr'>, Partial<Record<UiKey, string>>> = {
  fr,
  ar: {
    'nav.menu': 'القائمة',
    'nav.lang': 'اللغة',
  },
  en: {
    'nav.menu': 'Menu',
    'nav.lang': 'Language',
  },
};

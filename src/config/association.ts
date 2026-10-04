// Coordonnées et identité de l'association : seul endroit où elles sont définies.
// Les composants lisent ce fichier, ils ne contiennent jamais ces valeurs en dur.
// Un champ vide ('' ou liste vide) n'est pas affiché sur le site.
// Valeurs marquées « à compléter » : à remplacer par celles fournies par l'association (voir docs/contenu-a-fournir.md).

export const association = {
  /** Sigle, affiché dans l'en-tête. */
  sigle: 'AREMS',
  /** Nom complet en français. À compléter : graphie officielle des statuts. */
  nom: 'Association de Recherches et d’Études sur la Mémoire de Sousse',
  /** Nom complet en arabe, tel qu'il figure sur le logo. */
  nomAr: 'جمعية البحوث والدراسات في ذاكرة سوسة',
  ville: 'Sousse',
  pays: 'TN',
  /** Adresse postale. À compléter. */
  adresse: '',
  /** Réseaux sociaux : { nom, url }. À compléter. */
  reseaux: [] as { nom: string; url: string }[],
  /** Centre utilisé par défaut pour la météo et les cartes (centre de Sousse). */
  coordonnees: { lat: 35.8256, lng: 10.6411 },
} as const;

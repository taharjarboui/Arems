// Tailles d'images : chaque photo de fiche existe en 1600 px et en vignette 800 px (`-800.webp`,
// assez pour une carte pleine largeur sur un téléphone à écran haute densité ;
// générée par scripts/vignettes.mjs). `srcset` laisse le navigateur choisir la plus légère qui convient.

const avecVignette = /^\/images\/(especes|sites|sentiers|actions)\/.+\.webp$/;

/** Vignette 800 px d'une photo, ou la photo elle-même si elle n'en a pas. */
export function vignette(src: string) {
  return avecVignette.test(src) ? src.replace(/\.webp$/, '-800.webp') : src;
}

/** Attribut srcset (800 px + 1600 px) ; undefined si la photo n'a pas de vignette. */
export function srcset(src: string) {
  return avecVignette.test(src) ? `${vignette(src)} 800w, ${src} 1600w` : undefined;
}

/** Valeurs de `sizes` courantes : largeur affichée selon l'écran. */
export const sizes = {
  carte: '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  colonne: '(min-width: 768px) 66vw, 100vw',
  /** Tuiles en deux colonnes sur mobile, quatre sur grand écran. */
  tuile: '(min-width: 1024px) 25vw, 50vw',
  pleine: '100vw',
};

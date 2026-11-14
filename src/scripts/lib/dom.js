// Küçük DOM yardımcıları ve ortak medya sorguları.

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Kullanıcı işletim sisteminde animasyonları azaltmayı seçtiyse true. */
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Telefon genişliği; mobil düzen bu sınıra göre açılıp kapanır. */
export const SMALL_SCREEN = '(max-width:720px)';
export const isSmallScreen = () => matchMedia(SMALL_SCREEN).matches;

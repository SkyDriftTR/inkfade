// Sayfa kaydırmasının tek kontrol noktası.
// Yumuşak kaydırma (Lenis) açıksa onu, değilse tarayıcının kendi kaydırmasını kullanır.
import { reducedMotion } from './dom.js';

let lenis = null;

export const setSmoothScroll = (instance) => { lenis = instance; };

/** Menü ya da lightbox açıkken arka sayfanın kaymasını engeller. */
export function lockScroll() {
  lenis?.stop();
  document.body.style.overflow = 'hidden';
}

export function unlockScroll() {
  lenis?.start();
  document.body.style.overflow = '';
}

export function scrollToEl(el, offset = 0) {
  if (lenis) lenis.scrollTo(el, { offset });
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

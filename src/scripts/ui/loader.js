// Açılış (yükleme) ekranı.
import { $ } from '../lib/dom.js';

const SAFETY_TIMEOUT = 4500; // animasyon bir sebeple takılırsa bile ekran kapanır

export const loader = $('.loader');

export function hideLoader() {
  if (loader) loader.style.display = 'none';
  document.documentElement.classList.remove('loading');
}

export function armLoaderSafety() {
  setTimeout(hideLoader, SAFETY_TIMEOUT);
}

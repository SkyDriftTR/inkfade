// Sık sorulanlar: aynı anda tek bir cevap açık kalır.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$ } from '../lib/dom.js';

export function initFaq() {
  let refreshTimer;
  $$('.faq-q').forEach((question) => question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const willOpen = !item.classList.contains('open');

    $$('.faq-item.open').forEach((other) => {
      other.classList.remove('open');
      $('.faq-q', other).setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
    // sayfa yüksekliği değişti; kaydırma animasyonlarının konumlarını açılma bitince güncelle
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 500);
  }));
}

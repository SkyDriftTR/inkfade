// Portfolyo görsellerini tam ekranda açan pencere. Klavye: Esc kapatır, ← → gezinir.
import { $, $$ } from '../lib/dom.js';
import { lockScroll, unlockScroll } from '../lib/scroll.js';

const pad = (n) => String(n).padStart(2, '0');

export function initLightbox() {
  const box = $('#lb');
  if (!box) return;
  const image = $('#lbImg'), title = $('#lbTitle'), counter = $('#lbCount'), closeBtn = $('#lbClose');

  let items = [], index = 0, lastFocus = null;

  function show() {
    const item = items[index];
    const thumb = $('img', item);
    title.textContent = item.dataset.label;
    counter.textContent = `${pad(index + 1)} / ${pad(items.length)}`;
    image.src = thumb.dataset.full || thumb.currentSrc || thumb.src;
    image.alt = thumb.alt;
  }

  function open(row, i) {
    items = $$('.pf-item', row);
    index = i;
    lastFocus = document.activeElement;
    box.hidden = false;
    lockScroll();
    show();
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    unlockScroll();
    lastFocus?.focus();
  }

  function step(dir) {
    index = (index + dir + items.length) % items.length;
    show();
  }

  $$('.pf-item').forEach((item) => item.addEventListener('click', () => open(item.closest('.pf-row'), +item.dataset.i)));
  closeBtn.addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lb-stage')) close(); });
  addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
}

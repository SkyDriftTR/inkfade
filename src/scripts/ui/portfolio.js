// Portfolyo şeritleri: oklarla, mouse ile sürükleyerek ya da kategori çipleriyle gezinme.
import { $, $$ } from '../lib/dom.js';
import { scrollToEl } from '../lib/scroll.js';

const ITEM_GAP = 14;
const DRAG_THRESHOLD = 5;

function initArrows(row, track) {
  $$('.pf-ctrl button', row).forEach((button) => button.addEventListener('click', () => {
    const step = $('.pf-item', track).offsetWidth + ITEM_GAP;
    track.scrollBy({ left: +button.dataset.dir * step * 2, behavior: 'smooth' });
  }));
}

/** Mouse ile sürükleyerek kaydırma. Sürükleme sonrası tıklama lightbox'ı açmasın diye yutulur. */
function initDrag(track) {
  let down = false, moved = false, startX = 0, startScroll = 0;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) { moved = true; track.classList.add('dragging'); }
    track.scrollLeft = startScroll - dx;
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    setTimeout(() => track.classList.remove('dragging'), 0);
  });
  track.addEventListener('click', (e) => {
    if (!moved) return;
    e.preventDefault(); e.stopPropagation(); moved = false;
  }, true);
}

export function initPortfolio() {
  $$('.pf-row').forEach((row) => {
    const track = $('.pf-track', row);
    initArrows(row, track);
    initDrag(track);
  });
  $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
    scrollToEl(document.getElementById(chip.dataset.go), -80);
  }));
}

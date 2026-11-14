// Özel imleç: mouse kullanan cihazlarda fırça ucu, linklerin üzerinde büyür.
import { $, $$, reducedMotion } from '../lib/dom.js';

export function initCursor() {
  const cursor = $('.cursor');
  if (!cursor || !matchMedia('(pointer:fine)').matches || reducedMotion) return;

  document.body.classList.add('has-cursor');
  let x = -100, y = -100, targetX = -100, targetY = -100;
  addEventListener('pointermove', (e) => { targetX = e.clientX; targetY = e.clientY; }, { passive: true });

  (function follow() {
    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    const tilt = cursor.classList.contains('big') ? '' : ' rotate(-45deg)';
    cursor.style.transform = `translate(${x}px,${y}px)${tilt}`;
    requestAnimationFrame(follow);
  })();

  $$('a,button,[data-cursor],.float').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('big'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('big'));
  });
}

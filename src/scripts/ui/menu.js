// Mobil menü: hamburger butonuyla açılır, sağ üstten daire şeklinde genişler.
import gsap from 'gsap';
import { $, $$, reducedMotion } from '../lib/dom.js';
import { lockScroll, unlockScroll } from '../lib/scroll.js';

const DESKTOP = '(min-width:901px)';
const ORIGIN = 'calc(100% - 40px) 40px';

export function initMenu() {
  const root = document.documentElement;
  const burger = $('.burger'), menu = $('#menu');
  if (!burger || !menu) return;
  const links = $$('.menu-links a');

  function setExpanded(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  }

  function open() {
    menu.hidden = false;
    root.classList.add('menu-open');
    setExpanded(true);
    lockScroll();
    if (reducedMotion) return;
    gsap.fromTo(menu, { clipPath: `circle(0% at ${ORIGIN})` }, { clipPath: `circle(150% at ${ORIGIN})`, duration: 0.7, ease: 'power3.inOut' });
    gsap.fromTo(links, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, delay: 0.25, ease: 'power3.out' });
  }

  function close() {
    if (menu.hidden) return;
    root.classList.remove('menu-open');
    menu.hidden = true;
    setExpanded(false);
    unlockScroll();
  }

  burger.addEventListener('click', () => (menu.hidden ? open() : close()));
  links.forEach((a) => a.addEventListener('click', close));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  matchMedia(DESKTOP).addEventListener('change', (e) => { if (e.matches) close(); });
}

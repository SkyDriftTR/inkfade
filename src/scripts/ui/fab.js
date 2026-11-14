// Sağ alttaki sabit "Randevu" butonu.
// Ana ekrandan sonra görünür; randevu bölümünde ve footer'da (imzanın üstüne binmesin diye) gizlenir.
import { $ } from '../lib/dom.js';

export function initFab() {
  const fab = $('.fab');
  const booking = $('#randevu');
  const footer = $('.foot-bottom');
  if (!fab) return;

  let inBooking = false, inFooter = false;
  const sync = () => fab.classList.toggle('show', scrollY > innerHeight * 0.8 && !inBooking && !inFooter);

  if (booking) new IntersectionObserver(([e]) => { inBooking = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(booking);
  if (footer) new IntersectionObserver(([e]) => { inFooter = e.isIntersecting; sync(); }).observe(footer);
  addEventListener('scroll', sync, { passive: true });
}

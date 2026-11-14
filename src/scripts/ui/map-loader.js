// Harita kütüphanesi büyük olduğu için ancak "Bizi bul" bölümüne yaklaşınca yüklenir.
import { $ } from '../lib/dom.js';

export function lazyLoadMap() {
  const el = $('#map');
  if (!el) return;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    import('./map.js')
      .then((mod) => mod.initMap(el))
      .catch(() => el.closest('.map-frame').classList.add('failed'));
  }, { rootMargin: '600px' });
  io.observe(el);
}

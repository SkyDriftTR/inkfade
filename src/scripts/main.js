// Ana sayfanın giriş noktası: modülleri sırayla başlatır.
import { $$, reducedMotion } from './lib/dom.js';
import { armLoaderSafety, hideLoader } from './ui/loader.js';
import { initHeroSmoke } from './effects/hero-smoke.js';
import { createBrandSmoke } from './effects/brand-smoke.js';
import { createSmokeTrail } from './effects/smoke-trail.js';
import { initCursor } from './ui/cursor.js';
import { initFab } from './ui/fab.js';
import { initPortfolio } from './ui/portfolio.js';
import { initLightbox } from './ui/lightbox.js';
import { initMenu } from './ui/menu.js';
import { initFaq } from './ui/faq.js';
import { lazyLoadMap } from './ui/map-loader.js';
import { initMotion } from './motion.js';

armLoaderSafety();

const heroSmoke = initHeroSmoke();
initCursor();
initFab();
initPortfolio();
initLightbox();
initMenu();
initFaq();
const brandSmoke = createBrandSmoke();
const smokeTrail = createSmokeTrail();
lazyLoadMap();

const manifestoWords = $$('#manifesto .w');

if (reducedMotion) {
  // animasyon istemeyenler için her şey ilk andan son hâliyle görünür
  hideLoader();
  manifestoWords.forEach((w) => w.classList.add('on'));
  $$('mark.hl').forEach((h) => h.classList.add('on'));
  document.documentElement.classList.add('no-pin');
} else {
  initMotion({ heroSmoke, brandSmoke, smokeTrail, manifestoWords });
}

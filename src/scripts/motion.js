// Kaydırmaya bağlı bütün animasyonlar (GSAP + ScrollTrigger) ve yumuşak kaydırma (Lenis).
// Her bölümün animasyonu kendi fonksiyonunda; initMotion hepsini sırayla kurar.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { $, $$, isSmallScreen } from './lib/dom.js';
import { setSmoothScroll } from './lib/scroll.js';
import { loader, hideLoader } from './ui/loader.js';

/** Bölümün başından sonuna kadar kaydırmaya bağlı (scrub) tetikleyici. */
const scrubThrough = (trigger) => ({ trigger, start: 'top bottom', end: 'bottom top', scrub: true });

const BRAND_BLUE = '#6f8dff';
const REVEAL_HEADINGS = '.about-name, .styles-head h2, .pf-head h2, .piercing h2, .process h2, .faq-side h2, .book h2, .loc-head h2, .pillars h3';

function setupSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  setSmoothScroll(lenis);

  // sayfa içi linkler (#randevu gibi) de yumuşak kaysın
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0 });
  }));
}

/** Açılış: halkalar çizilir, sayaç 100'e gider, ekran daire şeklinde kapanır, logo belirir. */
function playIntro({ smokeTrail, onDone }) {
  const strokes = $$('circle,path', loader);
  strokes.forEach((s) => {
    const length = s.getTotalLength();
    s.style.strokeDasharray = length;
    s.style.strokeDashoffset = length;
  });
  const counter = $('.loader-count', loader);
  const count = { value: 0 };
  const word = $('.loader-word');

  gsap.set(loader, { clipPath: 'circle(75% at 50% 50%)' });
  gsap.timeline({ onComplete: () => { hideLoader(); setTimeout(onDone, 400); } })
    .to(strokes, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.1 }, 0)
    .to(count, { value: 100, duration: 1.5, ease: 'power1.inOut', onUpdate: () => { counter.textContent = String(Math.round(count.value)).padStart(3, '0'); } }, 0)
    .to(word, { opacity: 1, letterSpacing: '.32em', duration: 0.6, ease: 'power2.out', onStart: () => smokeTrail.along(word, { duration: 0.7, count: 36 }) }, 0.9)
    .to(loader, { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: 'power3.inOut' }, 1.7)
    .fromTo('.logo-inner', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', force3D: true }, 1.9)
    .fromTo('.logo-intro', { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power2.out' }, 1.9)
    .from('.hero-copy', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out' }, 2.2);
}

/** Ana ekran sabitlenir; kaydırdıkça logo büyüyerek solar, duman da söner. */
function heroScroll(heroSmoke) {
  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=100%', scrub: true, pin: true, onUpdate: (s) => heroSmoke.setProgress(s.progress) },
  })
    // logo kendi GPU katmanında kalsın (force3D), yoksa solarken tek karelik parlama oluyordu
    .to('.logo', { scale: 1.9, opacity: 0, ease: 'none', force3D: true }, 0)
    .to('.logo-soft', { opacity: 1, ease: 'none', duration: 0.3 }, 0)
    .to('.hero-tag', { y: -80, opacity: 0, ease: 'none' }, 0)
    .to('.scroll-hint', { opacity: 0, ease: 'none', duration: 0.2 }, 0);
}

/** Manifesto metni kaydırdıkça kelime kelime aydınlanır. */
function manifesto(words) {
  ScrollTrigger.create({
    trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: (s) => {
      const lit = Math.round(s.progress * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    },
  });
}

/** "Works" bölümündeki kartlar farklı hızlarda süzülür. */
function floatingCards() {
  const tilt = isSmallScreen() ? 0.35 : 1; // telefonda daha az eğik, ekrandan taşmasın
  $$('.float').forEach((card, i) => {
    const speed = +card.dataset.speed || 1;
    const side = i % 2 ? -1 : 1;
    gsap.fromTo(card,
      { y: innerHeight * 0.5 * speed, rotate: side * (3 + speed * 2) * tilt },
      { y: -innerHeight * 0.9 * speed, rotate: -side * 2 * tilt, ease: 'none', scrollTrigger: scrubThrough('.work') });
  });
  gsap.fromTo('.work-title h2', { scale: 0.86 }, { scale: 1.08, ease: 'none', scrollTrigger: scrubThrough('.work') });
}

/**
 * Stiller bölümü.
 * Bilgisayar: bölüm sabitlenir, dikey kaydırma yatay şeride dönüşür. Alçak ekranlarda (laptoplar)
 * yazı dairenin yanına geçer ve daire boyutu ekran yüksekliğine göre hesaplanır, böylece her şey tek ekrana sığar.
 * Telefon: ekran yüksekliği yetmediği için parmakla kaydırılan şerit.
 */
function stylesTrack() {
  const section = $('.styles'), track = $('.track');
  const distance = () => Math.max(0, track.scrollWidth - innerWidth);
  const pinned = () => ({ trigger: '.styles', start: 'top top', end: () => `+=${distance()}`, scrub: true });

  function fitToViewport() {
    if (section.classList.contains('swipe')) return;
    const sideBySide = innerHeight < 1000;
    section.classList.toggle('row', sideBySide);
    const head = $('.styles-head').offsetHeight;
    const pad = parseFloat(getComputedStyle(track).paddingBottom) || 0;

    if (sideBySide) {
      const art = Math.round(Math.max(240, Math.min(520, innerHeight - head - pad - 16, innerWidth * 0.42)));
      section.style.setProperty('--art', `${art}px`);
      section.style.removeProperty('--panel-w');
      return;
    }
    // yazı yüksekliği panel genişliğine bağlı; iki turda dengeye oturur
    const panel = $('.panel'), gap = parseFloat(getComputedStyle(panel).rowGap) || 18;
    for (let i = 0; i < 2; i++) {
      const textH = panel.offsetHeight - $('.art', panel).offsetHeight - gap;
      const available = innerHeight - head - textH - gap - pad - 12;
      section.style.setProperty('--panel-w', `${Math.round(Math.max(300, Math.min(520, available)))}px`);
    }
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 721px)', () => {
    fitToViewport();
    ScrollTrigger.addEventListener('refreshInit', fitToViewport);
    gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { ...pinned(), pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
    gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: pinned() });
    $$('.panel .art img').forEach((img) => gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: pinned() }));
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', fitToViewport);
      section.classList.remove('row');
      section.style.removeProperty('--panel-w');
      section.style.removeProperty('--art');
    };
  });
  mm.add('(max-width: 720px)', () => {
    section.classList.add('swipe');
    return () => section.classList.remove('swipe');
  });
}

/** Hakkımda: fotoğraf sabit durur, çevresindeki halka döner; bio'daki vurgular sırayla maviye döner. */
function about() {
  ScrollTrigger.create({ trigger: '.about-photo', start: 'top 65%', end: 'bottom 20%', toggleClass: 'lit' });
  gsap.fromTo('.about-ring', { rotate: -30 }, { rotate: 40, ease: 'none', scrollTrigger: scrubThrough('.about') });
  gsap.from('.about-text > *:not(.about-name)', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.about-text', start: 'top 80%' } });
  $$('mark.hl').forEach((mark) => ScrollTrigger.create({
    trigger: mark, start: 'top 78%',
    onEnter: () => mark.classList.add('on'),
    onLeaveBack: () => mark.classList.remove('on'),
  }));
}

function portfolioRows() {
  $$('.pf-row').forEach((row) => gsap.from($$('.pf-item', row), {
    y: 60, opacity: 0.2, stagger: 0.06, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 85%' },
  }));
}

function processSteps() {
  gsap.to('.steps .rail i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  $$('.step').forEach((step) => gsap.from(step, { opacity: 0.25, x: 30, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 82%' } }));
}

/** Randevu bölümü mürekkep gibi ortadan yayılarak açılır. */
function booking() {
  gsap.fromTo('.book', { clipPath: 'circle(18% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: '.book', start: 'top bottom', end: 'top 20%', scrub: true } });
  gsap.from('.ring-btn svg circle', { strokeDashoffset: 600, duration: 1.6, ease: 'power2.out', stagger: 0.15, scrollTrigger: { trigger: '.ring-btn', start: 'top 85%' } });
}

/** Büyük başlıklar bulanıktan netleşerek, arkalarında duman bırakarak belirir. */
function headingReveal(smokeTrail) {
  $$(REVEAL_HEADINGS).forEach((heading) => {
    gsap.set(heading, { opacity: 0, filter: 'blur(14px)', y: 26 });
    ScrollTrigger.create({
      trigger: heading, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(heading, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.2, ease: 'power3.out', clearProps: 'filter' });
        smokeTrail.along(heading, { duration: 0.8, count: Math.round(Math.min(60, 20 + heading.offsetWidth / 12)) });
      },
    });
  });
}

/** Footer imzası dumanla beyaz gelir, sonra maviye döner. */
function footerCredit(smokeTrail) {
  const credit = $('.foot-credit');
  if (!credit) return;
  const tagline = $('.fc-tag', credit);
  gsap.set(credit, { opacity: 0, filter: 'blur(10px)', y: 14 });
  gsap.set(tagline, { color: '#ffffff' });
  ScrollTrigger.create({
    trigger: credit, start: 'top 98%', once: true,
    onEnter: () => {
      smokeTrail.along(credit, { duration: 0.9, count: 34 });
      gsap.timeline()
        .to(credit, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.3, ease: 'power3.out', clearProps: 'filter' })
        .to(tagline, { color: BRAND_BLUE, duration: 1.4, ease: 'power2.inOut', clearProps: 'color' }, 1.4);
    },
  });
}

export function initMotion({ heroSmoke, brandSmoke, smokeTrail, manifestoWords }) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  setupSmoothScroll();
  playIntro({ smokeTrail, onDone: () => brandSmoke.startAmbient() });
  heroScroll(heroSmoke);
  manifesto(manifestoWords);
  floatingCards();
  stylesTrack();
  about();
  portfolioRows();
  processSteps();
  booking();
  headingReveal(smokeTrail);
  footerCredit(smokeTrail);

  // görseller yüklenince sayfa yüksekliği değişir; tetikleyici konumlarını güncelle
  addEventListener('load', () => ScrollTrigger.refresh());
}

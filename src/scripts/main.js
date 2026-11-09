import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { rng, drawArt } from './art.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const loader = $('.loader');
const hideLoader = () => { if (loader) loader.style.display = 'none'; };
setTimeout(hideLoader, 4500); // güvenlik: ne olursa olsun kapanır

let lenis = null;

/* ---------- yer tutucu çizimler ---------- */
const eager = $$('.float canvas, .panel canvas, .about-photo canvas');
const drawn = new Set();
const paint = (c) => { drawArt(c); drawn.add(c); };
eager.forEach(paint);
const lazyIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { paint(e.target); lazyIO.unobserve(e.target); }
}), { rootMargin: '300px' });
$$('canvas[data-lazy]').forEach((c) => lazyIO.observe(c));
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => drawn.forEach(drawArt), 220); });

/* ---------- hero: duman + mürekkep damlaları ---------- */
const cv = $('#smoke'), ctx = cv.getContext('2d');
let W = 0, H = 0, mx = 0, my = 0, tmx = 0, tmy = 0, heroProgress = 0, heroVisible = true;
function size() {
  const D = Math.min(devicePixelRatio || 1, 1.5);
  W = cv.clientWidth; H = cv.clientHeight; cv.width = W * D; cv.height = H * D; ctx.setTransform(D, 0, 0, D, 0, 0);
}
size(); addEventListener('resize', size);
const R0 = rng(7);
const puffs = Array.from({ length: 22 }, () => ({ x: R0(), y: R0(), r: 0.18 + R0() * 0.32, a: 0.035 + R0() * 0.06, s: (R0() - 0.5) * 0.00012, ph: R0() * 6 }));
const drops = Array.from({ length: matchMedia('(max-width:720px)').matches ? 45 : 90 }, () => ({ x: R0(), y: R0(), z: R0(), r: 1 + R0() * R0() * 7, v: 0.00008 + R0() * 0.00025 }));
function frame(t) {
  if (heroVisible) {
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of puffs) {
      const px = (p.x + Math.sin(t * 0.00007 + p.ph) * 0.05 + ((p.s * t) % 1)) * W - mx * 20;
      const py = (p.y + Math.cos(t * 0.00006 + p.ph) * 0.04) * H - my * 14 - heroProgress * H * 0.15;
      const r = p.r * Math.max(W, H); const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(200,204,216,${p.a})`); g.addColorStop(0.6, `rgba(120,126,150,${p.a * 0.4})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const d of drops) {
      const depth = 0.3 + d.z * 1.7;
      const y = (((d.y - t * d.v * (reduce ? 0 : 1)) % 1) + 1) % 1;
      const px = d.x * W - mx * 40 * depth;
      const py = (((y * H - my * 30 * depth - heroProgress * H * 0.6 * depth) % H) + H) % H;
      const r = d.r * depth * 0.7, blur = Math.abs(d.z - 0.55) * 1.4;
      ctx.fillStyle = `rgba(58,99,255,${0.25 + 0.5 * (1 - blur * 0.6)})`;
      ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
      if (r > 3) { ctx.fillStyle = 'rgba(140,165,255,.35)'; ctx.beginPath(); ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.3, 0, 7); ctx.fill(); }
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }).observe($('.hero'));

/* ---------- imleç ---------- */
const cur = $('.cursor');
if (matchMedia('(pointer:fine)').matches && !reduce) {
  document.body.classList.add('has-cursor');
  let cx = -100, cy = -100, px = -100, py = -100;
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
  (function loop() {
    cx += (px - cx) * 0.22; cy += (py - cy) * 0.22;
    cur.style.transform = `translate(${cx}px,${cy}px)` + (cur.classList.contains('big') ? '' : ' rotate(-45deg)');
    requestAnimationFrame(loop);
  })();
  $$('a,button,[data-cursor],.float').forEach((el) => {
    el.addEventListener('pointerenter', () => cur.classList.add('big'));
    el.addEventListener('pointerleave', () => cur.classList.remove('big'));
  });
}

/* ---------- sabit randevu butonu ---------- */
const fab = $('.fab'); let inBook = false;
const syncFab = () => fab.classList.toggle('show', scrollY > innerHeight * 0.8 && !inBook);
new IntersectionObserver((es) => { inBook = es[0].isIntersecting; syncFab(); }, { threshold: 0.15 }).observe($('#randevu'));
addEventListener('scroll', syncFab, { passive: true });

/* ---------- portfolyo şeritleri ---------- */
$$('.pf-row').forEach((row) => {
  const tr = $('.pf-track', row);
  $$('.pf-ctrl button', row).forEach((b) => b.addEventListener('click', () => {
    const w = $('.pf-item', tr).offsetWidth + 14;
    tr.scrollBy({ left: +b.dataset.dir * w * 2, behavior: 'smooth' });
  }));
  let down = false, sx = 0, sl = 0, moved = false;
  tr.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; });
  addEventListener('pointermove', (e) => {
    if (!down) return; const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; tr.classList.add('dragging'); }
    tr.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => tr.classList.remove('dragging'), 0); });
  tr.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
});
const scrollToEl = (el, offset = 0) => { if (lenis) lenis.scrollTo(el, { offset }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
$$('.chip').forEach((b) => b.addEventListener('click', () => scrollToEl(document.getElementById(b.dataset.go), -80)));

/* ---------- lightbox ---------- */
const lb = $('#lb'), lbC = $('#lbCanvas'), lbImg = $('#lbImg');
let lbItems = [], lbI = 0, lbName = '', lastFocus = null;
function lbShow() {
  const it = lbItems[lbI]; const img = $('img', it), c = $('canvas', it);
  $('#lbTitle').textContent = `${it.dataset.title} · ${it.dataset.tag}`;
  $('#lbCount').textContent = `${String(lbI + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
  if (img) { lbImg.src = img.dataset.full || img.currentSrc || img.src; lbImg.alt = img.alt; lbImg.hidden = false; lbC.hidden = true; }
  else { lbImg.hidden = true; lbC.hidden = false; lbC.dataset.mode = c.dataset.mode; lbC.dataset.seed = c.dataset.seed; requestAnimationFrame(() => drawArt(lbC)); }
}
function lbOpen(row, i) {
  lbItems = $$('.pf-item', row); lbName = row.dataset.name; lbI = i; lastFocus = document.activeElement;
  lb.hidden = false; lenis?.stop(); document.body.style.overflow = 'hidden'; lbShow(); $('#lbClose').focus();
}
function lbClose() { lb.hidden = true; lenis?.start(); document.body.style.overflow = ''; lastFocus?.focus(); }
function lbStep(d) { lbI = (lbI + d + lbItems.length) % lbItems.length; lbShow(); }
$$('.pf-item').forEach((b) => b.addEventListener('click', () => lbOpen(b.closest('.pf-row'), +b.dataset.i)));
$('#lbClose').addEventListener('click', lbClose);
$('#lbPrev').addEventListener('click', () => lbStep(-1));
$('#lbNext').addEventListener('click', () => lbStep(1));
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-stage')) lbClose(); });
addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') lbClose();
  if (e.key === 'ArrowRight') lbStep(1);
  if (e.key === 'ArrowLeft') lbStep(-1);
});


/* ---------- mobil menü ---------- */
const root = document.documentElement;
const burger = $('.burger'), menu = $('#menu');
const menuLinks = $$('.menu-links a');
function openMenu() {
  menu.hidden = false; root.classList.add('menu-open');
  burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Menüyü kapat');
  lenis?.stop(); document.body.style.overflow = 'hidden';
  if (!reduce) {
    gsap.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 40px) 40px)' }, { clipPath: 'circle(150% at calc(100% - 40px) 40px)', duration: 0.7, ease: 'power3.inOut' });
    gsap.fromTo(menuLinks, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, delay: 0.25, ease: 'power3.out' });
  }
}
function closeMenu() {
  if (menu.hidden) return;
  root.classList.remove('menu-open'); menu.hidden = true;
  burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Menüyü aç');
  lenis?.start(); document.body.style.overflow = '';
}
burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
menuLinks.forEach((a) => a.addEventListener('click', closeMenu));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
matchMedia('(min-width:901px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });

/* ---------- SSS ---------- */
let faqT;
$$('.faq-q').forEach((q) => q.addEventListener('click', () => {
  const item = q.closest('.faq-item'); const open = !item.classList.contains('open');
  $$('.faq-item.open').forEach((x) => { x.classList.remove('open'); $('.faq-q', x).setAttribute('aria-expanded', 'false'); });
  if (open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
  clearTimeout(faqT); faqT = setTimeout(() => ScrollTrigger.refresh(), 500);
}));

/* ---------- logo: üzerine gelince arkasından duman ---------- */
const brand = $('.brand'), smokeCv = $('.brand-smoke');
const brandSmoke = (() => {
  if (!brand || !smokeCv || reduce) return { burst() {} };
  const sx = smokeCv.getContext('2d');
  let parts = [], emitting = false, running = false, W = 0, H = 0, mark = null, last = 0, acc = 0;
  const fit = () => {
    const r = smokeCv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; smokeCv.width = W * d; smokeCv.height = H * d; sx.setTransform(d, 0, 0, d, 0, 0);
    const m = $('.brand-mark', brand).getBoundingClientRect();
    mark = { x: m.left - r.left, y: m.top - r.top, w: m.width, h: m.height };
  };
  // ince, uzayan duman şeritleri: her parçacık hız yönünde esneyen yumuşak bir elips
  const spawn = (n) => {
    for (let i = 0; i < n && parts.length < 70; i++) {
      parts.push({
        x: mark.x + mark.w * (0.08 + Math.random() * 0.84),
        y: mark.y + mark.h * (0.45 + Math.random() * 0.4),
        vx: 0.1 + Math.random() * 0.45, vy: -(0.2 + Math.random() * 0.35),
        r: 2 + Math.random() * 3, g: 0.1 + Math.random() * 0.14,
        life: 0, max: 120 + Math.random() * 100, a: 0.1 + Math.random() * 0.12,
        c: Math.random() < 0.3 ? '90,125,255' : '205,208,220', ph: Math.random() * 6.28, sw: 0.6 + Math.random() * 0.9,
      });
    }
  };
  const tick = (t) => {
    const dt = Math.min(2.5, last ? (t - last) / 16.7 : 1); last = t;
    if (emitting && (acc += dt * 0.45) >= 1) { spawn(Math.floor(acc)); acc %= 1; }
    sx.clearRect(0, 0, W, H);
    parts = parts.filter((p) => (p.life += dt) < p.max);
    for (const p of parts) {
      const k = p.life / p.max;
      const curl = Math.sin(p.life * 0.045 + p.ph) * p.sw;
      p.x += (p.vx + curl * 0.35) * dt; p.y += p.vy * dt; p.r += p.g * dt; p.vy *= 0.997;
      const alpha = p.a * Math.sin(Math.PI * Math.min(1, k * 1.2)) * (1 - k * 0.4);
      const ang = Math.atan2(p.vy, p.vx + curl * 0.35);
      sx.save(); sx.translate(p.x, p.y); sx.rotate(ang); sx.scale(1.9, 0.75);
      const g = sx.createRadialGradient(0, 0, 0, 0, 0, p.r);
      g.addColorStop(0, `rgba(${p.c},${alpha})`); g.addColorStop(0.5, `rgba(${p.c},${alpha * 0.4})`); g.addColorStop(1, `rgba(${p.c},0)`);
      sx.fillStyle = g; sx.beginPath(); sx.arc(0, 0, p.r, 0, 7); sx.fill(); sx.restore();
    }
    if (emitting || parts.length) requestAnimationFrame(tick);
    else { running = false; last = 0; brand.classList.remove('smoking'); }
  };
  const start = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  brand.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; fit(); emitting = true; brand.classList.add('smoking'); start(); });
  brand.addEventListener('pointerleave', () => { emitting = false; });
  brand.addEventListener('focus', () => { fit(); spawn(14); brand.classList.add('smoking'); start(); });
  return {
    burst(n = 18) { fit(); spawn(n); brand.classList.add('smoking'); start(); },
  };
})();
// dokunmatik ekranda: dokununca kısa bir duman
brand?.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') brandSmoke.burst(20); });

/* ---------- manifesto ---------- */
const words = $$('#manifesto .w');

if (reduce) {
  hideLoader(); words.forEach((w) => w.classList.add('on')); $$('mark.hl').forEach((h) => h.classList.add('on'));
  document.documentElement.classList.add('no-pin');
} else {
  initMotion();
}

function initMotion() {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* yumuşak kaydırma */
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); const el = id.length > 1 && document.querySelector(id);
    if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: 0 }); }
  }));

  /* açılış */
  const paths = $$('circle,path', loader);
  paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const count = $('.loader-count', loader); const cobj = { v: 0 };
  gsap.set(loader, { clipPath: 'circle(75% at 50% 50%)' });
  gsap.timeline({ onComplete: () => { hideLoader(); setTimeout(() => brandSmoke.burst(20), 400); } })
    .to(paths, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.1 }, 0)
    .to(cobj, { v: 100, duration: 1.5, ease: 'power1.inOut', onUpdate: () => { count.textContent = String(Math.round(cobj.v)).padStart(3, '0'); } }, 0)
    .to('.loader-word', { opacity: 1, letterSpacing: '.32em', duration: 0.6, ease: 'power2.out' }, 0.9)
    .to(loader, { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: 'power3.inOut' }, 1.7)
    .from('.logo img', { scale: 0.6, filter: 'blur(18px)', opacity: 0, duration: 1.4, ease: 'expo.out' }, 1.9)
    .from('.hero-copy', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out' }, 2.2);

  /* hero: logo kaydırınca solar */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=100%', scrub: true, pin: true, onUpdate: (s) => { heroProgress = s.progress; } } })
    .to('.logo', { scale: 1.9, opacity: 0, filter: 'blur(14px)', ease: 'none' }, 0)
    .to('.hero-tag', { y: -80, opacity: 0, ease: 'none' }, 0)
    .to('.hero-copy p', { y: -120, opacity: 0, ease: 'none' }, 0)
    .to('.scroll-hint', { opacity: 0, ease: 'none', duration: 0.2 }, 0);

  /* manifesto kelime kelime */
  ScrollTrigger.create({
    trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: (s) => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); },
  });

  /* uçan kartlar */
  $$('.float').forEach((f, i) => {
    const sp = +f.dataset.speed || 1;
    gsap.fromTo(f, { y: innerHeight * 0.5 * sp, rotate: (i % 2 ? -1 : 1) * (3 + sp * 2) },
      { y: -innerHeight * 0.9 * sp, rotate: (i % 2 ? 1 : -1) * 2, ease: 'none', scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('.work-title h2', { scale: 0.86 }, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* yatay stiller */
  const track = $('.track');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.styles', start: 'top top', end: () => '+=' + dist(), scrub: true, pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
  gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.styles', start: 'top top', end: () => '+=' + dist(), scrub: true } });
  $$('.panel .art img').forEach((c) => gsap.fromTo(c, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.styles', start: 'top top', end: () => '+=' + dist(), scrub: true } }));

  /* hakkımda: fotoğraf görünür olunca renklenir */
  ScrollTrigger.create({ trigger: '.about-photo', start: 'top 65%', end: 'bottom 20%', toggleClass: 'lit' });
  /* hakkımda */
  gsap.fromTo('.about-photo', { y: 50 }, { y: -50, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.about-ring', { rotate: -30 }, { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.about-text > *', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.about-text', start: 'top 80%' } });

  $$('mark.hl').forEach((h) => ScrollTrigger.create({
    trigger: h, start: 'top 78%',
    onEnter: () => h.classList.add('on'), onLeaveBack: () => h.classList.remove('on'),
  }));

  /* portfolyo ve piercing */
  $$('.pf-row').forEach((r) => gsap.from($$('.pf-item', r), { y: 60, opacity: 0.2, stagger: 0.06, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: r, start: 'top 85%' } }));

  /* süreç çizgisi */
  gsap.to('.steps .rail i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  $$('.step').forEach((s) => gsap.from(s, { opacity: 0.25, x: 30, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 82%' } }));

  /* randevu: mürekkep yayılır */
  gsap.fromTo('.book', { clipPath: 'circle(18% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: '.book', start: 'top bottom', end: 'top 20%', scrub: true } });
  gsap.from('.ring-btn svg circle', { strokeDashoffset: 600, duration: 1.6, ease: 'power2.out', stagger: 0.15, scrollTrigger: { trigger: '.ring-btn', start: 'top 85%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
}

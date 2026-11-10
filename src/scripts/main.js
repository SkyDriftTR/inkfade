import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { rng, drawArt } from './art.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const loader = $('.loader');
const hideLoader = () => { if (loader) loader.style.display = 'none'; document.documentElement.classList.remove('loading'); };
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
// Tuvalin boyutunu değiştirmek onu siler. Boyut değişimi bu yüzden sadece işaretlenir ve bir sonraki
// karede, çizimden hemen önce uygulanır; aksi halde ekrana tek karelik boş (koyu) bir tuval gidiyordu.
let needSize = true;
function size() {
  needSize = false;
  const D = Math.min(devicePixelRatio || 1, 1.5);
  const w = Math.round(cv.clientWidth), h = Math.round(cv.clientHeight);
  if (w === W && h === H && cv.width === Math.round(w * D)) return;
  W = w; H = h; cv.width = Math.round(W * D); cv.height = Math.round(H * D); ctx.setTransform(D, 0, 0, D, 0, 0);
}
size();
const markSize = () => { needSize = true; };
new ResizeObserver(markSize).observe(cv); addEventListener('resize', markSize);
const R0 = rng(7);
const puffs = Array.from({ length: 22 }, () => ({ x: R0(), y: R0(), r: 0.18 + R0() * 0.32, a: 0.035 + R0() * 0.06, s: (R0() - 0.5) * 0.00012, ph: R0() * 6 }));
// aşağıdan yukarı süzülen ince duman şeritleri (eski mavi damlaların yerine)
const smallHero = matchMedia('(max-width:720px)').matches;
const wisps = Array.from({ length: smallHero ? 14 : 26 }, () => ({
  x: R0(), y: R0(), z: R0(), r: 0.03 + R0() * 0.05, v: 0.000018 + R0() * 0.00004,
  ph: R0() * 6.28, sw: 0.02 + R0() * 0.06, a: 0.09 + R0() * 0.1, blue: true,
  ox: 0, oy: 0, fade: 0,
}));
// yumuşak gri-beyaz duman: düşük çözünürlüklü ayrı tuvalde çizilip büyütülür, böylece kenarları pamuk gibi dağılır
const veils = Array.from({ length: smallHero ? 26 : 46 }, () => ({
  x: R0(), y: R0(), z: R0(), r: 0.05 + R0() * 0.07, v: 0.000014 + R0() * 0.00003,
  ph: R0() * 6.28, sw: 0.03 + R0() * 0.07, a: 0.032 + R0() * 0.042,
  ox: 0, oy: 0, fade: 0,
}));
const SC = 0.25, oc = document.createElement('canvas'), ox2 = oc.getContext('2d');
// imlecin ekrandaki yeri: dumanı oradan dağıtır
let hpx = -9999, hpy = -9999, hpOn = false;
addEventListener('pointermove', (e) => { hpx = e.clientX; hpy = e.clientY; hpOn = true; }, { passive: true });
document.addEventListener('pointerleave', () => { hpOn = false; });
function frame(t) {
  if (needSize) size();
  if (heroVisible) {
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const M = Math.min(W, H) || 1;
    const cr = hpOn ? cv.getBoundingClientRect() : null;
    const qx = cr ? hpx - cr.left : -9999, qy = cr ? hpy - cr.top : -9999, R = Math.max(150, M * 0.24);
    // imleç yakınındaysa dışarı itilir ve incelir, sonra yavaşça yerine döner
    const push = (w, px, py) => {
      let tx = 0, ty = 0, tf = 0;
      if (hpOn && !reduce) {
        const dx = px - qx, dy = py - qy, d = Math.hypot(dx, dy);
        if (d < R) { const f = (1 - d / R) ** 2; tx = (dx / (d || 1)) * f * R; ty = (dy / (d || 1)) * f * R; tf = f; }
      }
      w.ox += (tx - w.ox) * (tx ? 0.1 : 0.025); w.oy += (ty - w.oy) * (ty ? 0.1 : 0.025);
      w.fade += (tf - w.fade) * (tf ? 0.12 : 0.035);
    };
    const pos = (w, k, depth) => {
      const curl = Math.sin(t * 0.0004 + w.ph + k * 5) * w.sw;
      return [(w.x + curl) * W - mx * 30 * depth, (1.1 - k * 1.25) * H - my * 22 * depth - heroProgress * H * 0.35 * depth];
    };
    const life = (w, sgi, gap) => (((w.y + t * w.v * (reduce ? 0 : 1) - sgi * gap) % 1) + 1) % 1;
    const dim = 1 - heroProgress * 0.6;

    // 1) yumuşak duman perdesi (düşük çözünürlük)
    const ow = Math.max(2, Math.round(W * SC)), oh = Math.max(2, Math.round(H * SC));
    if (oc.width !== ow || oc.height !== oh) { oc.width = ow; oc.height = oh; }
    ox2.setTransform(1, 0, 0, 1, 0, 0); ox2.clearRect(0, 0, ow, oh);
    ox2.globalCompositeOperation = 'lighter'; ox2.setTransform(SC, 0, 0, SC, 0, 0);
    // geniş arka plan bulutları da burada: tam çözünürlükte çizmek kaydırırken kasmaya yol açıyordu
    for (const p of puffs) {
      const px = (p.x + Math.sin(t * 0.00007 + p.ph) * 0.05 + ((p.s * t) % 1)) * W - mx * 20;
      const py = (p.y + Math.cos(t * 0.00006 + p.ph) * 0.04) * H - my * 14 - heroProgress * H * 0.15;
      const r = p.r * Math.max(W, H); const g = ox2.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(200,204,216,${p.a})`); g.addColorStop(0.6, `rgba(120,126,150,${p.a * 0.4})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ox2.fillStyle = g; ox2.beginPath(); ox2.arc(px, py, r, 0, 7); ox2.fill();
    }
    const vsegs = smallHero ? 5 : 7;
    for (const w of veils) {
      const depth = 0.5 + w.z;
      for (let sgi = 0; sgi < vsegs; sgi++) {
        const k = life(w, sgi, 0.03);
        let [px, py] = pos(w, k, depth);
        if (sgi === 0) push(w, px, py);
        const keep = 1 - sgi / (vsegs + 1);
        px += w.ox * keep; py += w.oy * keep;
        const r = w.r * M * depth * (0.7 + k * 1.6);
        const alpha = w.a * Math.sin(Math.PI * k) * dim * (1 - w.fade * 0.8) * (0.55 + keep * 0.45);
        if (alpha <= 0.002) continue;
        ox2.save(); ox2.translate(px, py); ox2.rotate(-Math.PI / 2 + Math.cos(t * 0.0004 + w.ph + k * 5) * 0.35); ox2.scale(1.7, 1);
        const g = ox2.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, `rgba(222,225,236,${alpha})`); g.addColorStop(0.35, `rgba(200,205,222,${alpha * 0.6})`);
        g.addColorStop(0.7, `rgba(170,178,205,${alpha * 0.18})`); g.addColorStop(1, 'rgba(160,170,200,0)');
        ox2.fillStyle = g; ox2.beginPath(); ox2.arc(0, 0, r, 0, 7); ox2.fill(); ox2.restore();
      }
    }
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(oc, 0, 0, W, H);

    // 2) ince mavi şeritler
    const segs = smallHero ? 2 : 3;
    for (const w of wisps) {
      const depth = 0.5 + w.z;
      for (let sgi = 0; sgi < segs; sgi++) {
        const k = life(w, sgi, 0.045);
        let [px, py] = pos(w, k, depth);
        if (sgi === 0) push(w, px, py);
        px += w.ox * (1 - sgi * 0.25); py += w.oy * (1 - sgi * 0.25);
        const r = w.r * M * depth * (0.6 + k * 1.8) * (1 - sgi * 0.18);
        const alpha = w.a * Math.sin(Math.PI * k) * dim * (1 - w.fade * 0.75) * (1 - sgi * 0.28);
        if (alpha <= 0.002) continue;
        const ang = -Math.PI / 2 + Math.cos(t * 0.0004 + w.ph + k * 5) * 0.5;
        ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.scale(3.2, 0.62 + w.fade * 0.4);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, `rgba(111,141,255,${alpha})`); g.addColorStop(0.45, `rgba(111,141,255,${alpha * 0.45})`); g.addColorStop(1, 'rgba(111,141,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.restore();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
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
const fab = $('.fab'); let inBook = false, inFoot = false;
const syncFab = () => fab.classList.toggle('show', scrollY > innerHeight * 0.8 && !inBook && !inFoot);
new IntersectionObserver((es) => { inBook = es[0].isIntersecting; syncFab(); }, { threshold: 0.15 }).observe($('#randevu'));
// sayfa sonunda footer'daki imzanın üstüne binmesin
new IntersectionObserver((es) => { inFoot = es[0].isIntersecting; syncFab(); }).observe($('.foot-bottom'));
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
  $('#lbTitle').textContent = it.dataset.label;
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
  if (!brand || !smokeCv || reduce) return { burst() {}, setAlways() {} };
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
        vx: (0.1 + Math.random() * 0.45) * (mark.h / 34), vy: -(0.2 + Math.random() * 0.35) * (mark.h / 34),
        r: (2 + Math.random() * 3) * (mark.h / 34), g: (0.1 + Math.random() * 0.14) * (mark.h / 34),
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
  // küçük ekranda hover yok: duman sürekli tüter
  let always = false;
  const setAlways = (on) => {
    always = on; emitting = on || brand.matches(':hover');
    if (on) { fit(); brand.classList.add('smoking'); start(); }
  };
  brand.addEventListener('pointerleave', () => { if (always) emitting = true; });
  addEventListener('resize', () => { if (running) fit(); });
  document.addEventListener('visibilitychange', () => { if (always) { emitting = !document.hidden; if (!document.hidden) start(); } });
  return {
    burst(n = 18) { fit(); spawn(n); brand.classList.add('smoking'); start(); },
    setAlways,
  };
})();
// dokunmatik ekranda: dokununca kısa bir duman
brand?.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') brandSmoke.burst(20); });

/* ---------- duman motoru: büyük başlıklar ve yükleme ekranı için ---------- */
// Parçacıklar bir öğeye bağlıdır; sayfa kayarken dumanla birlikte hareket ederler.
const fx = (() => {
  const c = $('.fx-smoke');
  if (!c || reduce) return { along() {} };
  const x = c.getContext('2d');
  let parts = [], running = false, last = 0, W = 0, H = 0;
  let needFit = true;
  const fit = () => { needFit = false; const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); };
  fit(); addEventListener('resize', () => { needFit = true; });
  const spawnOn = (el, r, n, from = 0, to = 1) => {
    const k = Math.max(0.6, Math.min(2.4, r.height / 48));
    for (let i = 0; i < n && parts.length < 180; i++) {
      parts.push({
        el, lx: r.width * (from + Math.random() * (to - from)), ly: r.height * (0.2 + Math.random() * 0.7),
        dx: 0, dy: 0, vx: (Math.random() - 0.35) * 0.5 * k, vy: -(0.25 + Math.random() * 0.5) * k,
        r: (3 + Math.random() * 5) * k, g: (0.12 + Math.random() * 0.2) * k,
        life: 0, max: 80 + Math.random() * 90, a: 0.1 + Math.random() * 0.14,
        c: Math.random() < 0.3 ? '90,125,255' : '205,208,220', ph: Math.random() * 6.28,
      });
    }
  };
  const tick = (t) => {
    const dt = Math.min(2.5, last ? (t - last) / 16.7 : 1); last = t;
    if (needFit) fit();
    x.clearRect(0, 0, W, H);
    parts = parts.filter((p) => (p.life += dt) < p.max);
    const rects = new Map();
    for (const p of parts) {
      let r = rects.get(p.el); if (!r) { r = p.el.getBoundingClientRect(); rects.set(p.el, r); }
      const k = p.life / p.max, curl = Math.sin(p.life * 0.05 + p.ph);
      p.dx += (p.vx + curl * 0.3) * dt; p.dy += p.vy * dt; p.r += p.g * dt;
      const px = r.left + p.lx + p.dx, py = r.top + p.ly + p.dy;
      if (py < -150 || py > H + 150) continue;
      const alpha = p.a * Math.sin(Math.PI * Math.min(1, k * 1.25)) * (1 - k * 0.35);
      x.save(); x.translate(px, py); x.rotate(Math.atan2(p.vy, p.vx + curl * 0.3)); x.scale(1.8, 0.8);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, p.r);
      g.addColorStop(0, `rgba(${p.c},${alpha})`); g.addColorStop(0.5, `rgba(${p.c},${alpha * 0.4})`); g.addColorStop(1, `rgba(${p.c},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, p.r, 0, 7); x.fill(); x.restore();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; last = 0; x.clearRect(0, 0, W, H); c.classList.remove('on'); }
  };
  return {
    // öğe boyunca soldan sağa süpürerek duman bırakır
    along(el, { duration = 0.8, count = 40 } = {}) {
      const steps = 8, per = Math.ceil(count / steps);
      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          const r = el.getBoundingClientRect(); if (!r.width) return;
          spawnOn(el, r, per, i / steps, (i + 1.6) / steps);
          if (!running) { running = true; c.classList.add('on'); requestAnimationFrame(tick); }
        }, (duration * 1000 * i) / steps);
      }
    },
  };
})();

/* ---------- harita: bölüme yaklaşınca yüklenir ---------- */
const mapEl = $('#map');
if (mapEl) {
  const mapIO = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    mapIO.disconnect();
    import('./map.js').then((mod) => mod.initMap(mapEl)).catch(() => mapEl.closest('.map-frame').classList.add('failed'));
  }, { rootMargin: '600px' });
  mapIO.observe(mapEl);
}

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
  gsap.timeline({ onComplete: () => { hideLoader(); setTimeout(() => { brandSmoke.burst(20); const mq = matchMedia('(max-width:720px)'); brandSmoke.setAlways(mq.matches); mq.addEventListener('change', (e) => brandSmoke.setAlways(e.matches)); }, 400); } })
    .to(paths, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.1 }, 0)
    .to(cobj, { v: 100, duration: 1.5, ease: 'power1.inOut', onUpdate: () => { count.textContent = String(Math.round(cobj.v)).padStart(3, '0'); } }, 0)
    .to('.loader-word', { opacity: 1, letterSpacing: '.32em', duration: 0.6, ease: 'power2.out', onStart: () => fx.along($('.loader-word'), { duration: 0.7, count: 36 }) }, 0.9)
    .to(loader, { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: 'power3.inOut' }, 1.7)
    .fromTo('.logo-inner', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', force3D: true }, 1.9)
    .fromTo('.logo-intro', { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power2.out' }, 1.9)
    .from('.hero-copy', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out' }, 2.2);

  /* hero: logo kaydırınca solar */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=100%', scrub: true, pin: true, onUpdate: (s) => { heroProgress = s.progress; } } })
    .to('.logo', { scale: 1.9, opacity: 0, ease: 'none', force3D: true }, 0)
    .to('.logo-soft', { opacity: 1, ease: 'none', duration: 0.3 }, 0)
    .to('.hero-tag', { y: -80, opacity: 0, ease: 'none' }, 0)
    .to('.scroll-hint', { opacity: 0, ease: 'none', duration: 0.2 }, 0);

  /* manifesto kelime kelime */
  ScrollTrigger.create({
    trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: (s) => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); },
  });

  /* uçan kartlar */
  const small = matchMedia('(max-width:720px)').matches; // telefonda kartlar daha az eğik, ekrandan taşmasın
  $$('.float').forEach((f, i) => {
    const sp = +f.dataset.speed || 1, tilt = small ? 0.35 : 1;
    gsap.fromTo(f, { y: innerHeight * 0.5 * sp, rotate: (i % 2 ? -1 : 1) * (3 + sp * 2) * tilt },
      { y: -innerHeight * 0.9 * sp, rotate: (i % 2 ? 1 : -1) * 2 * tilt, ease: 'none', scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('.work-title h2', { scale: 0.86 }, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* yatay stiller */
  // masaüstü: dikey kaydırma yatay şeride dönüşür. telefon: ekran yüksekliği yetmediği için parmakla kaydırılan şerit
  const track = $('.track'), stylesSec = $('.styles');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const mm = gsap.matchMedia();
  // sabitlenen bölüm tek ekrana sığmalı: daire boyutu ekran yüksekliğinden hesaplanır (alçak laptop ekranları)
  // Alçak ekranlarda (laptoplar) yazı dairenin yanına geçer, daire büyük kalır.
  const fitStyles = () => {
    if (stylesSec.classList.contains('swipe')) return;
    const row = innerHeight < 1000;
    stylesSec.classList.toggle('row', row);
    const head = $('.styles-head').offsetHeight, pad = parseFloat(getComputedStyle(track).paddingBottom) || 0;
    if (row) {
      const art = Math.round(Math.max(240, Math.min(520, innerHeight - head - pad - 16, innerWidth * 0.42)));
      stylesSec.style.setProperty('--art', art + 'px'); stylesSec.style.removeProperty('--panel-w');
      return;
    }
    const p0 = $('.panel'), gap = parseFloat(getComputedStyle(p0).rowGap) || 18;
    for (let i = 0; i < 2; i++) {
      const textH = p0.offsetHeight - $('.art', p0).offsetHeight - gap;
      const avail = innerHeight - head - textH - gap - pad - 12;
      stylesSec.style.setProperty('--panel-w', Math.round(Math.max(300, Math.min(520, avail))) + 'px');
    }
  };
  mm.add('(min-width: 721px)', () => {
    fitStyles();
    ScrollTrigger.addEventListener('refreshInit', fitStyles);
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.styles', start: 'top top', end: () => '+=' + dist(), scrub: true, pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
    gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.styles', start: 'top top', end: () => '+=' + dist(), scrub: true } });
    $$('.panel .art img').forEach((c) => gsap.fromTo(c, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.styles', start: 'top top', end: () => '+=' + dist(), scrub: true } }));
    return () => { ScrollTrigger.removeEventListener('refreshInit', fitStyles); stylesSec.classList.remove('row'); stylesSec.style.removeProperty('--panel-w'); stylesSec.style.removeProperty('--art'); };
  });
  mm.add('(max-width: 720px)', () => {
    stylesSec.classList.add('swipe');
    return () => stylesSec.classList.remove('swipe');
  });

  /* hakkımda: fotoğraf görünür olunca renklenir */
  ScrollTrigger.create({ trigger: '.about-photo', start: 'top 65%', end: 'bottom 20%', toggleClass: 'lit' });
  /* hakkımda */
  // fotoğraf sabit durur; sadece çevresindeki halka döner
  gsap.fromTo('.about-ring', { rotate: -30 }, { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.about-text > *:not(.about-name)', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.about-text', start: 'top 80%' } });

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

  /* büyük başlıklar dumanla belirir */
  $$('.about-name, .styles-head h2, .pf-head h2, .piercing h2, .process h2, .faq-side h2, .book h2, .loc-head h2, .pillars h3').forEach((h) => {
    gsap.set(h, { opacity: 0, filter: 'blur(14px)', y: 26 });
    ScrollTrigger.create({
      trigger: h, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(h, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.2, ease: 'power3.out', clearProps: 'filter' });
        fx.along(h, { duration: 0.8, count: Math.round(Math.min(60, 20 + h.offsetWidth / 12)) });
      },
    });
  });

  /* footer imzası: dumanla beyaz gelir, slogan sonra laciverte döner */
  const credit = $('.foot-credit');
  if (credit) {
    const tag = $('.fc-tag', credit);
    gsap.set(credit, { opacity: 0, filter: 'blur(10px)', y: 14 });
    gsap.set(tag, { color: '#ffffff' });
    ScrollTrigger.create({
      trigger: credit, start: 'top 98%', once: true,
      onEnter: () => {
        fx.along(credit, { duration: 0.9, count: 34 });
        gsap.timeline()
          .to(credit, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.3, ease: 'power3.out', clearProps: 'filter' })
          .to(tag, { color: '#6f8dff', duration: 1.4, ease: 'power2.inOut', clearProps: 'color' }, 1.4);
      },
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
}

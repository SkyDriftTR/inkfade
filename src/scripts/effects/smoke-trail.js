// Büyük başlıklar, yükleme ekranı ve footer imzası belirirken çıkan duman.
// Tüm ekranı kaplayan tek bir tuval kullanılır; parçacıklar bir öğeye bağlıdır ve
// sayfa kayarken o öğeyle birlikte hareket eder. Duman yokken tuval gizlenir.
import { $, reducedMotion } from '../lib/dom.js';
import { drawPuff, frameDelta, randomSmokeColor } from '../lib/smoke.js';

const MAX_PARTICLES = 180;
const SWEEP_STEPS = 8;

export function createSmokeTrail() {
  const canvas = $('.fx-smoke');
  if (!canvas || reducedMotion) return { along() {} };

  const ctx = canvas.getContext('2d');
  let particles = [], running = false, last = 0, W = 0, H = 0;
  let needsFit = true;

  function fit() {
    needsFit = false;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnOn(el, rect, n, from, to) {
    const s = Math.max(0.6, Math.min(2.4, rect.height / 48)); // başlık boyutuna göre ölçek
    for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
      particles.push({
        el,
        lx: rect.width * (from + Math.random() * (to - from)),
        ly: rect.height * (0.2 + Math.random() * 0.7),
        dx: 0, dy: 0,
        vx: (Math.random() - 0.35) * 0.5 * s,
        vy: -(0.25 + Math.random() * 0.5) * s,
        r: (3 + Math.random() * 5) * s,
        grow: (0.12 + Math.random() * 0.2) * s,
        life: 0, max: 80 + Math.random() * 90,
        a: 0.1 + Math.random() * 0.14,
        rgb: randomSmokeColor(), phase: Math.random() * 6.28,
      });
    }
  }

  function tick(t) {
    const dt = frameDelta(t, last); last = t;
    if (needsFit) fit();
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter((p) => (p.life += dt) < p.max);
    const rects = new Map(); // her öğenin konumunu karede bir kez ölç
    for (const p of particles) {
      let r = rects.get(p.el);
      if (!r) { r = p.el.getBoundingClientRect(); rects.set(p.el, r); }
      const k = p.life / p.max;
      const curl = Math.sin(p.life * 0.05 + p.phase);
      p.dx += (p.vx + curl * 0.3) * dt; p.dy += p.vy * dt; p.r += p.grow * dt;
      const x = r.left + p.lx + p.dx, y = r.top + p.ly + p.dy;
      if (y < -150 || y > H + 150) continue;
      drawPuff(ctx, {
        x, y, angle: Math.atan2(p.vy, p.vx + curl * 0.3), stretch: [1.8, 0.8], radius: p.r,
        rgb: p.rgb, alpha: p.a * Math.sin(Math.PI * Math.min(1, k * 1.25)) * (1 - k * 0.35),
      });
    }
    if (particles.length) requestAnimationFrame(tick);
    else { running = false; last = 0; ctx.clearRect(0, 0, W, H); canvas.classList.remove('on'); }
  }

  fit();
  addEventListener('resize', () => { needsFit = true; });

  return {
    /** Öğe boyunca soldan sağa süpürerek duman bırakır. */
    along(el, { duration = 0.8, count = 40 } = {}) {
      const perStep = Math.ceil(count / SWEEP_STEPS);
      for (let i = 0; i < SWEEP_STEPS; i++) {
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          if (!rect.width) return;
          spawnOn(el, rect, perStep, i / SWEEP_STEPS, (i + 1.6) / SWEEP_STEPS);
          if (!running) { running = true; canvas.classList.add('on'); requestAnimationFrame(tick); }
        }, (duration * 1000 * i) / SWEEP_STEPS);
      }
    },
  };
}

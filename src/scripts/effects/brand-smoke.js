// Sol üstteki INKFADE yazısının arkasından tüten duman.
// Bilgisayarda üzerine gelince, telefonda dokununca ya da küçük ekranlarda sürekli tüter.
import { $, reducedMotion, SMALL_SCREEN } from '../lib/dom.js';
import { drawPuff, frameDelta, randomSmokeColor } from '../lib/smoke.js';

const MAX_PARTICLES = 70;
const NOOP = { burst() {}, startAmbient() {} };

export function createBrandSmoke() {
  const brand = $('.brand');
  const canvas = $('.brand-smoke');
  if (!brand || !canvas || reducedMotion) return NOOP;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let emitting = false, running = false, always = false;
  let W = 0, H = 0, mark = null, last = 0, acc = 0;

  function fit() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = $('.brand-mark', brand).getBoundingClientRect();
    mark = { x: m.left - r.left, y: m.top - r.top, w: m.width, h: m.height };
  }

  function spawn(n) {
    const s = mark.h / 34; // yazı boyutuna göre ölçek
    for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
      particles.push({
        x: mark.x + mark.w * (0.08 + Math.random() * 0.84),
        y: mark.y + mark.h * (0.45 + Math.random() * 0.4),
        vx: (0.1 + Math.random() * 0.45) * s,
        vy: -(0.2 + Math.random() * 0.35) * s,
        r: (2 + Math.random() * 3) * s,
        grow: (0.1 + Math.random() * 0.14) * s,
        life: 0, max: 120 + Math.random() * 100,
        a: 0.1 + Math.random() * 0.12,
        rgb: randomSmokeColor(), phase: Math.random() * 6.28, sway: 0.6 + Math.random() * 0.9,
      });
    }
  }

  function tick(t) {
    const dt = frameDelta(t, last); last = t;
    if (emitting && (acc += dt * 0.45) >= 1) { spawn(Math.floor(acc)); acc %= 1; }
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter((p) => (p.life += dt) < p.max);
    for (const p of particles) {
      const k = p.life / p.max;
      const curl = Math.sin(p.life * 0.045 + p.phase) * p.sway;
      p.x += (p.vx + curl * 0.35) * dt; p.y += p.vy * dt; p.r += p.grow * dt; p.vy *= 0.997;
      drawPuff(ctx, {
        x: p.x, y: p.y, angle: Math.atan2(p.vy, p.vx + curl * 0.35), stretch: [1.9, 0.75], radius: p.r,
        rgb: p.rgb, alpha: p.a * Math.sin(Math.PI * Math.min(1, k * 1.2)) * (1 - k * 0.4),
      });
    }
    if (emitting || particles.length) requestAnimationFrame(tick);
    else { running = false; last = 0; brand.classList.remove('smoking'); }
  }

  function start() {
    brand.classList.add('smoking');
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function burst(n = 18) { fit(); spawn(n); start(); }

  function setAlways(on) {
    always = on;
    emitting = on || brand.matches(':hover');
    if (on) { fit(); start(); }
  }

  brand.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { fit(); emitting = true; start(); } });
  brand.addEventListener('pointerleave', () => { emitting = always; });
  brand.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') burst(20); });
  brand.addEventListener('focus', () => burst(14));
  addEventListener('resize', () => { if (running) fit(); });
  document.addEventListener('visibilitychange', () => {
    if (!always) return;
    emitting = !document.hidden; // sekme arka plandayken pil harcamasın
    if (!document.hidden) start();
  });

  return {
    burst,
    /** Açılıştan sonra çağrılır: küçük ekranlarda (hover olmadığı için) duman sürekli tüter. */
    startAmbient() {
      burst(20);
      const mq = matchMedia(SMALL_SCREEN);
      setAlways(mq.matches);
      mq.addEventListener('change', (e) => setAlways(e.matches));
    },
  };
}

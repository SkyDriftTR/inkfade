// Ana ekranın arka planındaki duman.
// İki katman var:
//   1) Yumuşak gri duman ve geniş bulutlar: ayrı, düşük çözünürlüklü bir tuvalde çizilir ve
//      tarayıcı onu ekran kartıyla büyütür. Kenarlar pamuk gibi dağılır, işlemci yorulmaz.
//   2) İnce mavi şeritler: ana tuvalde, daha keskin çizilir.
// İmleç (ya da parmak) yakındaki dumanı dışarı iter; imleç gidince duman yavaşça yerine döner.
import { $, reducedMotion, isSmallScreen } from '../lib/dom.js';
import { seededRandom } from '../lib/random.js';
import { makeSprite } from '../lib/smoke.js';

const VEIL_SCALE = 0.25; // yumuşak katmanın çözünürlüğü (ekranın dörtte biri)

const SPRITES = {
  cloud: makeSprite([[0, 'rgba(200,204,216,1)'], [0.6, 'rgba(120,126,150,.4)'], [1, 'rgba(0,0,0,0)']]),
  veil: makeSprite([[0, 'rgba(222,225,236,1)'], [0.35, 'rgba(200,205,222,.6)'], [0.7, 'rgba(170,178,205,.18)'], [1, 'rgba(160,170,200,0)']]),
  streak: makeSprite([[0, 'rgba(111,141,255,1)'], [0.45, 'rgba(111,141,255,.45)'], [1, 'rgba(111,141,255,0)']]),
};

function createParticles(small) {
  const rand = seededRandom(7);
  const clouds = Array.from({ length: 22 }, () => ({
    x: rand(), y: rand(), r: 0.18 + rand() * 0.32, a: 0.035 + rand() * 0.06, drift: (rand() - 0.5) * 0.00012, phase: rand() * 6,
  }));
  const streaks = Array.from({ length: small ? 14 : 26 }, () => ({
    x: rand(), y: rand(), z: rand(), r: 0.03 + rand() * 0.05, speed: 0.000018 + rand() * 0.00004,
    phase: rand() * 6.28, sway: 0.02 + rand() * 0.06, a: 0.09 + rand() * 0.1, ox: 0, oy: 0, fade: 0,
  }));
  const veils = Array.from({ length: small ? 26 : 46 }, () => ({
    x: rand(), y: rand(), z: rand(), r: 0.05 + rand() * 0.07, speed: 0.000014 + rand() * 0.00003,
    phase: rand() * 6.28, sway: 0.03 + rand() * 0.07, a: 0.032 + rand() * 0.042, ox: 0, oy: 0, fade: 0,
  }));
  return { clouds, streaks, veils };
}

export function initHeroSmoke() {
  const canvas = $('#smoke');
  const ctx = canvas.getContext('2d');
  const veilCanvas = document.createElement('canvas');
  const veilCtx = veilCanvas.getContext('2d');
  veilCanvas.setAttribute('aria-hidden', 'true');
  canvas.before(veilCanvas);

  const small = isSmallScreen();
  const { clouds, streaks, veils } = createParticles(small);
  const veilSegments = small ? 5 : 7; // her yumuşak şeridin kuyruk uzunluğu
  const streakSegments = small ? 2 : 3;

  let W = 0, H = 0;
  let progress = 0; // ana ekrandan aşağı kaydırma oranı (0–1)
  let visible = true;
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  const pointer = { x: -9999, y: -9999, active: false };

  // Tuvalin boyutunu değiştirmek içeriğini siler. Bu yüzden boyut değişimi sadece işaretlenir
  // ve bir sonraki karede, çizimden hemen önce uygulanır; yoksa ekrana tek karelik boş tuval gider.
  let needsResize = true;
  const markResize = () => { needsResize = true; };
  function resize() {
    needsResize = false;
    const w = Math.round(canvas.clientWidth), h = Math.round(canvas.clientHeight);
    if (w === W && h === H && canvas.width === w) return;
    W = w; H = h;
    canvas.width = W; canvas.height = H;
  }

  /** İmleç yakınındaki parçacığı dışarı iter; uzaklaşınca yavaşça geri bırakır. */
  function repel(p, px, py, origin, radius) {
    let tx = 0, ty = 0, tf = 0;
    if (pointer.active && !reducedMotion) {
      const dx = px - origin.x, dy = py - origin.y, d = Math.hypot(dx, dy);
      if (d < radius) {
        const f = (1 - d / radius) ** 2;
        tx = (dx / (d || 1)) * f * radius;
        ty = (dy / (d || 1)) * f * radius;
        tf = f;
      }
    }
    p.ox += (tx - p.ox) * (tx ? 0.1 : 0.025);
    p.oy += (ty - p.oy) * (ty ? 0.1 : 0.025);
    p.fade += (tf - p.fade) * (tf ? 0.12 : 0.035);
  }

  /** Parçacığın yaşam döngüsündeki yeri: 0 altta doğar, 1 yukarıda kaybolur. */
  const lifeAt = (p, t, segment, gap) => (((p.y + t * p.speed * (reducedMotion ? 0 : 1) - segment * gap) % 1) + 1) % 1;

  function positionAt(p, t, k, depth) {
    const curl = Math.sin(t * 0.0004 + p.phase + k * 5) * p.sway;
    return [
      (p.x + curl) * W - parallax.x * 30 * depth,
      (1.1 - k * 1.25) * H - parallax.y * 22 * depth - progress * H * 0.35 * depth,
    ];
  }

  function drawVeilLayer(t, M, origin, radius, dim) {
    const ow = Math.max(2, Math.round(W * VEIL_SCALE)), oh = Math.max(2, Math.round(H * VEIL_SCALE));
    if (veilCanvas.width !== ow || veilCanvas.height !== oh) { veilCanvas.width = ow; veilCanvas.height = oh; }
    veilCtx.setTransform(1, 0, 0, 1, 0, 0);
    veilCtx.clearRect(0, 0, ow, oh);
    veilCtx.globalCompositeOperation = 'lighter';
    veilCtx.setTransform(VEIL_SCALE, 0, 0, VEIL_SCALE, 0, 0);

    for (const c of clouds) {
      const px = (c.x + Math.sin(t * 0.00007 + c.phase) * 0.05 + ((c.drift * t) % 1)) * W - parallax.x * 20;
      const py = (c.y + Math.cos(t * 0.00006 + c.phase) * 0.04) * H - parallax.y * 14 - progress * H * 0.15;
      const r = c.r * Math.max(W, H);
      veilCtx.globalAlpha = c.a;
      veilCtx.drawImage(SPRITES.cloud, px - r, py - r, r * 2, r * 2);
    }

    for (const v of veils) {
      const depth = 0.5 + v.z;
      for (let s = 0; s < veilSegments; s++) {
        const k = lifeAt(v, t, s, 0.03);
        let [px, py] = positionAt(v, t, k, depth);
        if (s === 0) repel(v, px, py, origin, radius);
        const keep = 1 - s / (veilSegments + 1); // kuyruk uçlarına doğru incelir
        px += v.ox * keep; py += v.oy * keep;
        const r = v.r * M * depth * (0.7 + k * 1.6);
        const alpha = v.a * Math.sin(Math.PI * k) * dim * (1 - v.fade * 0.8) * (0.55 + keep * 0.45);
        if (alpha <= 0.002) continue;
        veilCtx.save();
        veilCtx.translate(px, py);
        veilCtx.rotate(-Math.PI / 2 + Math.cos(t * 0.0004 + v.phase + k * 5) * 0.35);
        veilCtx.scale(1.7, 1);
        veilCtx.globalAlpha = Math.min(1, alpha);
        veilCtx.drawImage(SPRITES.veil, -r, -r, r * 2, r * 2);
        veilCtx.restore();
      }
    }
    veilCtx.globalAlpha = 1;
  }

  function drawStreakLayer(t, M, origin, radius, dim) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of streaks) {
      const depth = 0.5 + p.z;
      for (let s = 0; s < streakSegments; s++) {
        const k = lifeAt(p, t, s, 0.045);
        let [px, py] = positionAt(p, t, k, depth);
        if (s === 0) repel(p, px, py, origin, radius);
        px += p.ox * (1 - s * 0.25); py += p.oy * (1 - s * 0.25);
        const r = p.r * M * depth * (0.6 + k * 1.8) * (1 - s * 0.18);
        const alpha = p.a * Math.sin(Math.PI * k) * dim * (1 - p.fade * 0.75) * (1 - s * 0.28);
        if (alpha <= 0.002) continue;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-Math.PI / 2 + Math.cos(t * 0.0004 + p.phase + k * 5) * 0.5);
        ctx.scale(3.2, 0.62 + p.fade * 0.4);
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.drawImage(SPRITES.streak, -r, -r, r * 2, r * 2);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(t) {
    if (needsResize) resize();
    if (visible) {
      parallax.x += (parallax.tx - parallax.x) * 0.05;
      parallax.y += (parallax.ty - parallax.y) * 0.05;
      const M = Math.min(W, H) || 1;
      const rect = pointer.active ? canvas.getBoundingClientRect() : null;
      const origin = rect ? { x: pointer.x - rect.left, y: pointer.y - rect.top } : { x: -9999, y: -9999 };
      const radius = Math.max(150, M * 0.24);
      const dim = 1 - progress * 0.6;
      drawVeilLayer(t, M, origin, radius, dim);
      drawStreakLayer(t, M, origin, radius, dim);
    }
    requestAnimationFrame(frame);
  }

  resize();
  new ResizeObserver(markResize).observe(canvas);
  addEventListener('resize', markResize);
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
    parallax.tx = e.clientX / innerWidth - 0.5;
    parallax.ty = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.active = false; });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe($('.hero'));
  requestAnimationFrame(frame);

  return {
    /** Ana ekrandan ne kadar aşağı kaydırıldığı; duman buna göre söner ve yukarı kayar. */
    setProgress(value) { progress = value; },
  };
}

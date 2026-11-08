// Kodla çizilen yer tutucu "dövme" desenleri ve piercing takıları.
// Gerçek fotoğraflar eklendikçe bu çizimler kendiliğinden devre dışı kalır.

export function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fit(c) {
  const r = c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d);
  const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
  return [x, r.width, r.height];
}

const bone = '233,231,226', blue = '58,99,255';

function softPuffs(x, R, S, count, maxA) {
  for (let i = 0; i < count; i++) {
    const px = (R() - 0.5) * S * 1.7, py = (R() - 0.5) * S * 1.8, r = S * (0.15 + R() * 0.5);
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(${bone},${0.03 + R() * maxA})`); g.addColorStop(1, `rgba(${bone},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  }
}

export function drawArt(c) {
  const [x, w, h] = fit(c);
  const R = rng(+c.dataset.seed || 1);
  const mode = c.dataset.mode;
  const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.42;
  x.fillStyle = '#0d0f18'; x.fillRect(0, 0, w, h);
  const g = x.createRadialGradient(cx, cy * 0.9, 0, cx, cy, Math.max(w, h) * 0.7);
  g.addColorStop(0, 'rgba(140,144,160,.10)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.save(); x.translate(cx, cy);
  const k = 6 + Math.floor(R() * 4) * 2;

  if (mode === 'dots') {
    for (let ring = 1; ring <= 9; ring++) {
      const rad = (S * ring) / 9, n = k * ring, size = 1 + R() * 1.6 * (ring % 3 === 0 ? 1.8 : 1);
      x.fillStyle = ring === 5 ? `rgba(${blue},.9)` : `rgba(${bone},${0.45 + R() * 0.5})`;
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * rad, Math.sin(a) * rad, size, 0, 7); x.fill(); }
    }
    x.strokeStyle = `rgba(${bone},.7)`; x.lineWidth = 1;
    for (let i = 0; i < k; i++) {
      x.save(); x.rotate((i / k) * Math.PI * 2); x.beginPath(); x.moveTo(0, 0);
      x.quadraticCurveTo(S * 0.25, -S * 0.18, S * 0.55, 0); x.quadraticCurveTo(S * 0.25, S * 0.18, 0, 0); x.stroke(); x.restore();
    }
  } else if (mode === 'lines') {
    x.strokeStyle = `rgba(${bone},.85)`; x.lineWidth = 0.8;
    [0.3, 0.55, 0.8, 1].forEach((f) => { x.beginPath(); x.arc(0, 0, S * f, 0, 7); x.stroke(); });
    for (let j = 0; j < 3; j++) {
      const n = 3 + j, rr = S * (0.55 + j * 0.22); x.beginPath();
      for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2 + j * 0.3; const px = Math.cos(a) * rr, py = Math.sin(a) * rr; i ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
    }
    x.strokeStyle = `rgba(${blue},.95)`; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, -S * 1.15); x.lineTo(0, S * 1.15); x.stroke();
    x.fillStyle = `rgba(${bone},.9)`;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * S * 0.8, Math.sin(a) * S * 0.8, 1.6, 0, 7); x.fill(); }
  } else if (mode === 'bold') {
    for (let layer = 3; layer >= 1; layer--) {
      const len = (S * layer) / 3, wid = len * 0.32;
      for (let i = 0; i < k; i++) {
        x.save(); x.rotate((i / k) * Math.PI * 2 + layer * 0.2); x.beginPath(); x.moveTo(0, 0);
        x.bezierCurveTo(wid, -len * 0.4, wid * 0.6, -len * 0.9, 0, -len);
        x.bezierCurveTo(-wid * 0.6, -len * 0.9, -wid, -len * 0.4, 0, 0);
        x.fillStyle = layer % 2 ? `rgba(${bone},.9)` : '#0d0f18'; x.fill(); x.restore();
      }
    }
    x.fillStyle = `rgb(${blue})`; x.beginPath(); x.arc(0, 0, S * 0.12, 0, 7); x.fill();
  } else if (mode === 'ring' || mode === 'stud') {
    softPuffs(x, R, S, 20, 0.06);
    const metal = (a, b) => {
      const m = x.createLinearGradient(a, a, b, b);
      m.addColorStop(0, '#4c5164'); m.addColorStop(0.35, '#f3f4f8'); m.addColorStop(0.55, '#9aa0b4'); m.addColorStop(0.8, '#e2e5ee'); m.addColorStop(1, '#3d4255');
      return m;
    };
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = S * 0.12; x.shadowOffsetY = S * 0.05;
    if (mode === 'ring') {
      const rad = S * (0.55 + R() * 0.12), lw = S * 0.085;
      x.lineCap = 'round'; x.lineWidth = lw; x.strokeStyle = metal(-rad, rad);
      x.beginPath(); x.arc(0, 0, rad, Math.PI / 2 + 0.32, Math.PI / 2 - 0.32 + Math.PI * 2); x.stroke();
      const b = x.createRadialGradient(-S * 0.04, rad - S * 0.05, 0, 0, rad, S * 0.14);
      b.addColorStop(0, '#ffffff'); b.addColorStop(0.4, '#aeb4c8'); b.addColorStop(1, '#2a2f40');
      x.fillStyle = b; x.beginPath(); x.arc(0, rad, S * 0.13, 0, 7); x.fill();
      x.shadowColor = 'transparent';
      x.strokeStyle = `rgba(${blue},.9)`; x.lineWidth = 1.2; x.beginPath(); x.arc(0, 0, rad + lw * 1.6, -2.4, -0.7); x.stroke();
    } else {
      const r = S * 0.26;
      x.fillStyle = metal(-r * 1.3, r * 1.3);
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; x.beginPath(); x.arc(Math.cos(a) * r * 1.02, Math.sin(a) * r * 1.02, r * 0.2, 0, 7); x.fill(); }
      x.beginPath(); x.arc(0, 0, r * 1.08, 0, 7); x.fill(); x.shadowColor = 'transparent';
      const gm = x.createRadialGradient(-r * 0.3, -r * 0.35, 0, 0, 0, r);
      gm.addColorStop(0, '#c9d5ff'); gm.addColorStop(0.35, '#3a63ff'); gm.addColorStop(1, '#0b1650');
      x.fillStyle = gm; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; x.beginPath(); x.moveTo(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke(); }
      x.beginPath();
      for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI * 2; const px = Math.cos(a) * r * 0.45, py = Math.sin(a) * r * 0.45; i ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
      x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.ellipse(-r * 0.35, -r * 0.4, r * 0.14, r * 0.07, -0.6, 0, 7); x.fill();
    }
  } else if (mode === 'smoke' || mode === 'cover') {
    softPuffs(x, R, S, 46, 0.12);
    if (mode === 'cover') {
      x.strokeStyle = `rgb(${blue})`; x.lineCap = 'round';
      [[S * 0.95, 2.4], [S * 0.9, 1], [S * 0.85, 3.2]].forEach(([r, lw], i) => {
        x.lineWidth = lw; x.beginPath(); x.arc(i * 1.2, -i, r, -0.4 + i * 0.3, Math.PI * 1.75 + i * 0.2); x.stroke();
      });
    } else {
      x.fillStyle = `rgba(${bone},.5)`;
      for (let i = 0; i < 500; i++) { const a = R() * 7, r = Math.sqrt(R()) * S; x.fillRect(Math.cos(a) * r, Math.sin(a) * r, 1, 1); }
    }
  }
  x.restore();
}

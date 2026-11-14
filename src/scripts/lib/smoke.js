// Duman parçacıkları için ortak çizim yardımcıları.

/** Duman renkleri: çoğu gri-beyaz, bir kısmı marka mavisi. */
export const SMOKE_GREY = '205,208,220';
export const SMOKE_BLUE = '90,125,255';
export const randomSmokeColor = () => (Math.random() < 0.3 ? SMOKE_BLUE : SMOKE_GREY);

/** Gelen saniye farkını 60 fps'lik kare birimine çevirir; sekme uyandığında sıçramayı sınırlar. */
export const frameDelta = (now, last) => Math.min(2.5, last ? (now - last) / 16.7 : 1);

/**
 * Hareket yönünde esnetilmiş yumuşak bir duman parçası çizer.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number, y:number, angle:number, stretch:[number, number], radius:number, rgb:string, alpha:number}} p
 */
export function drawPuff(ctx, { x, y, angle, stretch, radius, rgb, alpha }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(stretch[0], stretch[1]);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.5, `rgba(${rgb},${alpha * 0.4})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Bir kez çizilip tekrar tekrar kullanılan yuvarlak duman görseli (sprite).
 * Her karede gradyan üretmek yerine bunu drawImage ile basmak çok daha ucuz.
 * @param {Array<[number, string]>} stops  [konum 0–1, renk] çiftleri
 */
export function makeSprite(stops, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  stops.forEach(([offset, color]) => g.addColorStop(offset, color));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

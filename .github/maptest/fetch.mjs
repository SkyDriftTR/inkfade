// Test için: stil, tilejson, sprite, glifler ve stüdyo çevresindeki vektör karoları indirir.
import fs from 'node:fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const saved = {};
const get = async (url, bin) => {
  const r = await fetch(url); if (!r.ok) { console.log('FAIL', r.status, url); return null; }
  const buf = Buffer.from(await r.arrayBuffer());
  const name = 'f' + Object.keys(saved).length + (bin ? '.bin' : '.txt');
  fs.writeFileSync(`${out}/${name}`, buf); saved[url] = { file: name, type: r.headers.get('content-type') };
  return buf;
};
const styleUrl = 'https://tiles.openfreemap.org/styles/positron';
const style = JSON.parse((await get(styleUrl)).toString());
for (const [k, src] of Object.entries(style.sources)) {
  if (src.url) {
    const tj = JSON.parse((await get(src.url)).toString());
    const tpl = tj.tiles[0];
    const lat = 42.0261229, lng = 35.1463521;
    for (let z = 12; z <= 16; z++) {
      const n = 2 ** z, xt = (lng + 180) / 360 * n, yt = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n;
      const r = z >= 15 ? 2 : 1;
      for (let x = Math.floor(xt) - r; x <= Math.floor(xt) + r; x++) for (let y = Math.floor(yt) - r; y <= Math.floor(yt) + r; y++) {
        await get(tpl.replace('{z}', z).replace('{x}', x).replace('{y}', y), true);
      }
    }
  }
}
if (style.sprite) { const sp = typeof style.sprite === 'string' ? style.sprite : style.sprite[0].url; for (const s of ['', '@2x']) { await get(`${sp}${s}.json`); await get(`${sp}${s}.png`, true); } }
const fonts = new Set();
for (const l of style.layers) { const f = l.layout?.['text-font']; if (Array.isArray(f) && typeof f[0] === 'string') fonts.add(f.join(',')); }
for (const f of fonts) for (const range of ['0-255', '256-511']) await get(style.glyphs.replace('{fontstack}', encodeURIComponent(f)).replace('{range}', range), true);
fs.writeFileSync(`${out}/index.json`, JSON.stringify(saved, null, 1));
console.log('saved', Object.keys(saved).length, 'layers', style.layers.length, [...fonts]);

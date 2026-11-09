import { works } from './works.js';

// Portfolyo şeritleri. "works" listesine works.js'teki adları yaz; sıralama buradaki gibi olur.
// "works" boş olan kategoriler "count" kadar kodla çizilmiş yer tutucu gösterir (şimdilik Piercing).

export const categories = [
  {
    slug: 'realism',
    name: 'Black & Grey Realism',
    works: ['zeus', 'ozgurluk', 'catlak-heykel', 'misir', 'catrina', 'vampir', 'kartal-kaplan'],
  },
  {
    slug: 'sleeve',
    name: 'Sleeve & büyük ölçek',
    works: ['basmelek', 'melek-kafatasi', 'anubis', 'gotham'],
  },
  {
    slug: 'oriental',
    name: 'Oriental',
    works: ['hannya', 'foo-dog-koi'],
  },
  {
    slug: 'sketch',
    name: 'Sketch & Dotwork',
    works: ['kirik-heykel', 'balance', 'spiderman'],
  },
  {
    slug: 'fine-line',
    name: 'Fine line & Minimal',
    works: ['lale', 'gul', 'denizanasi'],
  },
];

// Her kategori için gösterilecek öğe listesini üretir.
export function itemsOf(cat, ci) {
  if (cat.works.length) {
    return cat.works.map((id) => {
      const w = works[id];
      if (!w) throw new Error(`portfolio.js: "${id}" works.js içinde yok`);
      return { src: w.sm, full: w.lg, pos: w.pos, title: w.title, tag: w.place };
    });
  }
  return Array.from({ length: cat.count }, (_, i) => ({
    mode: cat.placeholder[i % cat.placeholder.length],
    seed: ci * 100 + i * 7 + 1,
    title: cat.tags[i % cat.tags.length],
    tag: 'örnek',
  }));
}

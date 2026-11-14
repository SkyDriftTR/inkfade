import { works } from './works.js';

// Portfolyo şeritleri. "works" listesine works.js'teki adları yaz; sıralama buradaki gibi olur.

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

/** Kategorideki işleri portfolyo kartı verisine çevirir. */
export function itemsOf(cat) {
  return cat.works.map((id) => {
    const w = works[id];
    if (!w) throw new Error(`portfolio.js: "${id}" works.js içinde yok`);
    return { src: w.sm, full: w.lg, pos: w.pos, tag: w.place };
  });
}

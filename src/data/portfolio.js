// Portfolyo verisi.
// Gerçek fotoğrafları eklemek için: görselleri src/assets/portfolio/<kategori>/ altına koy,
// aşağıda ilgili kategorinin "images" listesine import edip { src, tag } olarak ekle.
// "images" boş olan kategoriler "count" kadar kodla çizilmiş yer tutucu gösterir.
//
// Örnek:
//   import bw1 from '../assets/portfolio/blackwork/01.jpg';
//   images: [{ src: bw1, tag: 'Ön kol' }]

export const categories = [
  {
    slug: 'blackwork',
    name: 'Blackwork',
    placeholder: ['bold'],
    count: 9,
    tags: ['Ön kol', 'Omuz', 'Sırt', 'Baldır', 'Kaburga', 'Boyun'],
    images: [],
  },
  {
    slug: 'fine-line',
    name: 'Fine line',
    placeholder: ['lines'],
    count: 8,
    tags: ['Bilek', 'Köprücük', 'Parmak', 'Ense', 'Ön kol'],
    images: [],
  },
  {
    slug: 'dotwork',
    name: 'Dotwork & Mandala',
    placeholder: ['dots'],
    count: 10,
    tags: ['Sırt', 'Omuz', 'Diz', 'Ön kol', 'El'],
    images: [],
  },
  {
    slug: 'realism',
    name: 'Realism',
    placeholder: ['smoke'],
    count: 8,
    tags: ['Kol', 'Baldır', 'Göğüs', 'Sırt'],
    images: [],
  },
  {
    slug: 'cover-up',
    name: 'Cover-up',
    placeholder: ['cover'],
    count: 6,
    tags: ['Önce / sonra', 'Bilek', 'Sırt', 'Omuz'],
    images: [],
  },
  {
    slug: 'piercing',
    name: 'Piercing',
    placeholder: ['ring', 'stud'],
    count: 8,
    tags: ['Helix', 'Tragus', 'Conch', 'Septum', 'Burun', 'Lob', 'Rook', 'Göbek'],
    images: [],
  },
];

// Her kategori için gösterilecek öğe listesini üretir.
export function itemsOf(cat, ci) {
  if (cat.images.length) {
    return cat.images.map((img, i) => ({ src: typeof img.src === 'string' ? img.src : img.src.src, tag: img.tag || cat.tags[i % cat.tags.length] }));
  }
  return Array.from({ length: cat.count }, (_, i) => ({
    mode: cat.placeholder[i % cat.placeholder.length],
    seed: ci * 100 + i * 7 + 1,
    tag: cat.tags[i % cat.tags.length],
  }));
}

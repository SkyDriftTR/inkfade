# Ink Fade

Ink Fade dövme ve piercing stüdyosunun web sitesi. Astro ile yazıldı; animasyonlar GSAP ScrollTrigger, yumuşak kaydırma Lenis ile.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ klasörüne derler
```

## Yayın

`main` dalına her push'ta GitHub Actions siteyi derleyip GitHub Pages'e yayınlar (`.github/workflows/deploy.yml`).
İlk kurulumda repo ayarlarında **Settings → Pages → Source: GitHub Actions** seçili olmalı.

## İçeriği güncelleme

| Ne | Nerede |
| --- | --- |
| Portfolyo kategorileri ve fotoğraflar | `src/data/portfolio.js` |
| Piercing uygulamaları ve iyileşme süreleri | `src/data/piercing.js` |
| Instagram, telefon | `src/data/site.js` |
| Logo | `src/assets/logo.webp` |
| Bölümler | `src/components/` |
| Renkler ve fontlar | `src/styles/global.css` (en üstteki `:root`) |

### Portfolyoya fotoğraf ekleme

1. Fotoğrafları `src/assets/portfolio/blackwork/` gibi bir klasöre koy.
2. `src/data/portfolio.js` dosyasının başında import et ve kategorinin `images` listesine ekle:

```js
import bw1 from '../assets/portfolio/blackwork/01.jpg';
// ...
images: [{ src: bw1, tag: 'Ön kol' }],
```

`images` boş olan kategoriler kodla çizilmiş örnek desenler gösterir.

# Inkfade Tattoo & Piercing

Sinop'taki Inkfade dövme ve piercing stüdyosunun web sitesi: **https://inkfadetattoo.com**

Astro ile yazılmış statik bir site. Animasyonlar GSAP + ScrollTrigger, yumuşak kaydırma Lenis,
harita MapLibre + OpenFreeMap ile. Sunucu tarafında çalışan bir şey yok; çıktı düz HTML/CSS/JS.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ klasörüne derler
npm run preview  # derlenmiş siteyi yerelde açar
```

## Yayın

`main` dalına her push'ta GitHub Actions siteyi derleyip GitHub Pages'e yayınlar
(`.github/workflows/deploy.yml`). Site adresi (`SITE`) ve kök yolu (`BASE_PATH`) Pages ayarından
otomatik gelir; özel domain (inkfadetattoo.com) **Settings → Pages → Custom domain** kısmında tanımlı.
DNS Cloudflare'de: dört A kaydı (185.199.108–111.153) ve `www` için CNAME, hepsi "DNS only".

## Klasör yapısı

```
src/
├── pages/            Sayfalar. Her dosya bir adres: index (ana sayfa), rehberler, gizlilik,
│                     sitemap.xml ve robots.txt
├── layouts/
│   ├── Base.astro    Bütün sayfaların iskeleti: <head>, SEO/paylaşım etiketleri, fontlar
│   └── Guide.astro   Rehber sayfalarının ortak şablonu (başlık, SSS, randevu kutusu, iç linkler)
├── components/       Ana sayfanın bölümleri (Hero, About, Works, Stiller, Portfolyo, ...)
├── data/             Bütün içerik burada; metin/fotoğraf değiştirmek için çoğu zaman yeterli
├── lib/url.js        Kök yol ve tam adres yardımcıları (iç linkler, canonical, sitemap)
├── scripts/          Tarayıcıda çalışan kod (sadece ana sayfada yüklenir)
│   ├── main.js       Giriş noktası: modülleri başlatır
│   ├── motion.js     Kaydırma animasyonları, bölüm bölüm
│   ├── effects/      Duman efektleri: ana ekran arka planı, logo dumanı, başlık dumanı
│   ├── ui/           Yükleme ekranı, imleç, menü, portfolyo, lightbox, SSS, harita
│   └── lib/          Ortak yardımcılar (DOM, kaydırma, duman çizimi, tohumlu rastgele)
├── styles/global.css Tüm stiller; renkler ve fontlar en üstteki :root içinde
└── assets/           Logo, Ulaş'ın fotoğrafı ve dövme fotoğrafları (Astro optimize eder)
public/               Olduğu gibi kopyalanan dosyalar: favicon, paylaşım görseli, fontlar
```

## İçeriği güncelleme

| Ne | Nerede |
| --- | --- |
| Telefon, Instagram, adres, harita konumu, footer imzası | `src/data/site.js` |
| Hakkımda metni ve fotoğraf | `src/data/about.js` |
| Dövme fotoğrafları | `src/data/works.js` |
| Portfolyo kategorileri | `src/data/portfolio.js` |
| Piercing listesi ve iyileşme süreleri | `src/data/piercing.js` |
| Sık sorulanlar | `src/data/faq.js` |
| Rehber sayfaları listesi (footer, sitemap) | `src/data/guides.js` |

### Yeni dövme fotoğrafı eklemek

1. Görseli `src/assets/works/` altına `<ad>.webp` (büyük) ve `<ad>-sm.webp` (küçük) olarak koy.
2. `src/data/works.js` dosyasında iki import satırı ve `works` listesine bir kayıt ekle
   (`place` fotoğrafın altında yazan bölge adı, `pos` kırpılınca görünecek bölge).
3. `src/data/portfolio.js` içinde istediğin kategorinin `works` listesine adını yaz.

### Yeni rehber sayfası eklemek

1. `src/pages/<adres>.astro` oluştur, `Guide` şablonunu kullan (mevcut rehberlere bakabilirsin).
2. `src/data/guides.js` listesine başlık ve açıklamasıyla ekle. Footer linki ve site haritası
   kendiliğinden güncellenir.

## Notlar

- Fontlar (Pirata One, Grenze, Instrument Sans) Türkçe karakterlerle sınırlanmış hâlde
  `public/fonts/` içinde; Google'a bağlantı kurulmaz (KVKK). Lisansları aynı klasörde.
- Sitede çerez ya da ziyaretçi takibi yok; bu yüzden çerez banner'ı da yok. Bir analiz aracı
  eklenirse `src/pages/gizlilik.astro` metni güncellenmeli.
- Animasyonları azaltmayı seçen ziyaretçilere (prefers-reduced-motion) site animasyonsuz açılır.

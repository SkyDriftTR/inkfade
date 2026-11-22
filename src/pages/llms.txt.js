// Yapay zekâ asistanları için stüdyonun kısa ve doğru bir özeti (llms.txt).
// Bütün bilgiler sitedeki veri dosyalarından gelir; oradaki bir değişiklik buraya da yansır.
import { site } from '../data/site.js';
import { about } from '../data/about.js';
import { guides } from '../data/guides.js';
import { groups } from '../data/piercing.js';

export function GET({ site: origin }) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  const url = (path = '') => (origin ? new URL(`${base}${path}`, origin).href : `${base}${path}`);
  const piercings = groups.flatMap((g) => g.items.map((i) => i.name)).join(', ');

  const body = `# ${site.name}

> Sinop Merkez'de dövme ve piercing stüdyosu. Kurucusu ve dövme sanatçısı ${about.name}; uzmanlık alanı Black & Grey Realism. Tüm tasarımlar kişiye özel hazırlanır, piercing işlemleri tek kullanımlık steril iğneyle yapılır.

## Stüdyo bilgileri

- Ad: ${site.name}
- Sanatçı: ${about.name} (${about.role})
- Adres: ${site.address}
- Telefon / WhatsApp: ${site.phone}
- Instagram: @${site.instagram} (${site.instagramUrl})
- Randevu: WhatsApp üzerinden (${site.whatsappUrl})
- Harita: ${site.mapsUrl}
- Web sitesi: ${url()}

## Hizmetler

- Dövme stilleri: Black & Grey Realism (uzmanlık), Sleeve (tam kol / tam bacak), Oriental, Sketch & Dotwork, Fine line
- Kişiye özel dövme tasarımı, cover-up (eski dövme kapatma)
- Piercing (steril iğne, ilk takı 316L cerrahi çelik): ${piercings}

## Sayfalar

- [Ana sayfa](${url()}): Çalışmalar, stiller, portfolyo, piercing, süreç, konum, Google yorumları, randevu ve sık sorulan sorular
${guides.map((g) => `- [${g.label}](${url(`${g.slug}/`)}): ${g.description}`).join('\n')}
- [Gizlilik ve KVKK](${url('gizlilik/')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

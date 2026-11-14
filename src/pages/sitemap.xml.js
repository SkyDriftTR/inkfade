import { guides } from '../data/guides.js';
// Arama motorları için site haritası. Adresler SITE ayarından üretilir.
export function GET({ site }) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  const root = site ? new URL(base, site).href : base;
  const pages = [['', '1.0'], ...guides.map((g) => [`${g.slug}/`, '0.7']), ['gizlilik/', '0.3']];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, pr]) => `  <url><loc>${root}${p}</loc><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}

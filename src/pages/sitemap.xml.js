// Arama motorları için site haritası. Adresler SITE ayarından (özel domain) üretilir.
import { guides } from '../data/guides.js';
import { absolute } from '../lib/url.js';

const PAGES = [
  ['', '1.0'],
  ...guides.map((g) => [`${g.slug}/`, '0.7']),
  ['gizlilik/', '0.3'],
];

export function GET({ site }) {
  const urls = PAGES.map(([path, priority]) => `  <url><loc>${absolute(path, site)}</loc><priority>${priority}</priority></url>`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}

import { absolute } from '../lib/url.js';

export function GET({ site }) {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}

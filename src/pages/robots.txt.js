export function GET({ site }) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  const map = site ? new URL(`${base}sitemap.xml`, site).href : `${base}sitemap.xml`;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${map}\n`, { headers: { 'Content-Type': 'text/plain' } });
}

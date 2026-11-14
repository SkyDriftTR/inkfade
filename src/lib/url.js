// Sitenin kök yolu: özel domainde "/", GitHub Pages alt klasöründe "/repo-adi/".
// Bütün iç linkler bununla kurulur; adres değişince kodda başka bir yeri düzeltmek gerekmez.
const raw = import.meta.env.BASE_URL;

export const base = raw.endsWith('/') ? raw : `${raw}/`;

/**
 * Bir sayfanın tam adresini döndürür (canonical, sitemap, paylaşım görseli için).
 * `site` tanımlı değilse (yerelde) kök yola göre göreli adres döner.
 */
export const absolute = (path = '', site) => (site ? new URL(`${base}${path}`, site).href : `${base}${path}`);

import { defineConfig, passthroughImageService } from 'astro/config';

// SITE ve BASE_PATH, GitHub Actions'ta repo adına göre otomatik verilir.
// Yerelde (npm run dev) ikisi de boş kalır ve site kökten çalışır.
export default defineConfig({
  // Pages, HTTPS zorunlu kılınmadan önce adresi http:// verebiliyor; site her zaman https üzerinden sunulur.
  site: process.env.SITE ? process.env.SITE.replace(/^http:\/\//, 'https://') : undefined,
  base: process.env.BASE_PATH || '/',
  image: { service: passthroughImageService() },
});

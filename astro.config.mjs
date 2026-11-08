import { defineConfig, passthroughImageService } from 'astro/config';

// SITE ve BASE_PATH, GitHub Actions'ta repo adına göre otomatik verilir.
// Yerelde (npm run dev) ikisi de boş kalır ve site kökten çalışır.
export default defineConfig({
  site: process.env.SITE || undefined,
  base: process.env.BASE_PATH || '/',
  image: { service: passthroughImageService() },
});

// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://silo.legal',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
  // CSRF protection: reject cross-origin POST/PATCH/DELETE based on Origin header.
  // Mitigates CSRF on /api/admin/access/[id], /api/auth/welcome, /api/auth/sign-out.
  security: {
    checkOrigin: true,
  },
  vite: {
    ssr: {
      noExternal: [],
    },
  },
});

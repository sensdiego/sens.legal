// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sens.legal',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
  vite: {
    ssr: {
      noExternal: [],
    },
  },
});

// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://sens.legal',
  output: 'hybrid',
  adapter: vercel(),
  vite: {
    ssr: {
      noExternal: [],
    },
  },
});

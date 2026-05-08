// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

const sitemapExclusions = ['/admin', '/api', '/pending', '/sign-in'];

/**
 * @param {string} page
 */
function isPublicSitemapPage(page) {
  const { pathname } = new URL(page);
  return !sitemapExclusions.some((excluded) => (
    pathname === excluded ||
    pathname === `${excluded}/` ||
    pathname.startsWith(`${excluded}/`)
  ));
}

export default defineConfig({
  site: 'https://silo.legal',
  output: 'server',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: isPublicSitemapPage,
    }),
  ],
  // CSRF protection: reject cross-origin POST/PATCH/DELETE based on Origin header.
  // Mitigates CSRF on admin login/logout endpoints.
  security: {
    checkOrigin: true,
  },
  vite: {
    ssr: {
      noExternal: [],
    },
  },
});

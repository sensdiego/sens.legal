import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(null, {
    status: 308,
    headers: {
      Location: '/og-image.png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });

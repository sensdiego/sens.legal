import type { APIRoute } from 'astro';
import { adminAuthStatus } from '../../../lib/admin-session';

export const prerender = false;

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(adminAuthStatus()), {
    status: 200,
    headers: jsonHeaders,
  });
};

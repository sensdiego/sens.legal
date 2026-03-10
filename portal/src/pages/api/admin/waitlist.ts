import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const token = new URL(request.url).searchParams.get('token');
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || token !== adminToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: entries } = await supabase.rpc('portal_waitlist_list');
  const { data: count } = await supabase.rpc('portal_waitlist_count');

  return new Response(JSON.stringify({ total: count ?? 0, entries: entries ?? [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

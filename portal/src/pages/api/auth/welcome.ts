import type { APIRoute } from 'astro';
import { createSupabaseServerClient, supabaseAdmin } from '../../../lib/supabase-server';

export const prerender = false;

export const PATCH: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  await supabaseAdmin
    .from('profiles')
    .update({ welcomed_at: new Date().toISOString() })
    .eq('id', user.id);
  return new Response(null, { status: 204 });
};

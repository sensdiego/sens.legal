import type { APIRoute } from 'astro';
import { createSupabaseServerClient, supabaseAdmin } from '../../../lib/supabase-server';

export const prerender = false;

export const PATCH: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ welcomed_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) {
    console.error('[welcome] profiles update failed', error);
    return new Response('Update failed', { status: 500 });
  }
  return new Response(null, { status: 204 });
};

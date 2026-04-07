import type { APIRoute } from 'astro';
import { createSupabaseServerClient, supabaseAdmin } from '../../../../lib/supabase-server';
import { sendApprovedEmail } from '../../../../lib/email-templates';

export const prerender = false;

export const POST: APIRoute = async ({ request, params, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const id = params.id;
  if (!id) return new Response('Missing id', { status: 400 });

  const form = await request.formData();
  const action = form.get('action');

  if (action === 'approve') {
    const { data: req } = await supabaseAdmin
      .from('access_requests')
      .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user.id })
      .eq('id', id)
      .select('email, name')
      .single();

    if (req?.email) {
      try {
        await sendApprovedEmail({ to: req.email, name: req.name ?? 'there' });
      } catch {
        // silent
      }
    }
    return redirect('/admin/access?status=pending');
  }

  if (action === 'reject') {
    await supabaseAdmin
      .from('access_requests')
      .update({ status: 'rejected' })
      .eq('id', id);
    return redirect('/admin/access?status=pending');
  }

  return new Response('Unknown action', { status: 400 });
};

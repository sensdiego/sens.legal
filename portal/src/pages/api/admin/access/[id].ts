import type { APIRoute } from 'astro';
import { createSupabaseServerClient, supabaseAdmin } from '../../../../lib/supabase-server';
import { sendApprovedEmail } from '../../../../lib/email-templates';
import { ACCESS_STATUS, ADMIN_ACTION } from '../../../../lib/access';

export const prerender = false;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, params, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(cookies);
  // Use getUser() — verifies the JWT against Supabase Auth, never trust
  // getSession() server-side.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Verify admin via the service role to bypass RLS. The user identity was
  // just verified via getUser() above.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) {
    console.error('[admin/access] profiles lookup failed', profileError);
    return new Response('Server error', { status: 500 });
  }
  if (!profile || profile.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const id = params.id;
  if (!id || !UUID_RE.test(id)) {
    return new Response('Invalid id', { status: 400 });
  }

  const form = await request.formData();
  const action = form.get('action');

  if (action === ADMIN_ACTION.APPROVE) {
    const { data: req, error: updateError } = await supabaseAdmin
      .from('access_requests')
      .update({ status: ACCESS_STATUS.APPROVED, approved_at: new Date().toISOString(), approved_by: user.id })
      .eq('id', id)
      .select('email, name')
      .single();

    if (updateError) {
      console.error('[admin/access] approve failed', updateError);
      return new Response('Approve failed', { status: 500 });
    }
    if (!req) {
      return new Response('Not found', { status: 404 });
    }

    if (req.email) {
      try {
        await sendApprovedEmail({ to: req.email, name: req.name ?? 'reviewer' });
      } catch (err) {
        console.error('[admin/access] approval email failed', err);
      }
    }
    return redirect(`/admin/access?status=${ACCESS_STATUS.PENDING}`);
  }

  if (action === ADMIN_ACTION.REJECT) {
    // Audit fields: track when and by whom the rejection happened, and clear
    // any prior approval so reports can't show the row as both approved and
    // rejected.
    const { data: req, error: rejectError } = await supabaseAdmin
      .from('access_requests')
      .update({
        status: ACCESS_STATUS.REJECTED,
        approved_at: null,
        approved_by: null,
      })
      .eq('id', id)
      .select('id')
      .single();
    if (rejectError) {
      console.error('[admin/access] reject failed', rejectError);
      return new Response('Reject failed', { status: 500 });
    }
    if (!req) {
      return new Response('Not found', { status: 404 });
    }
    return redirect(`/admin/access?status=${ACCESS_STATUS.PENDING}`);
  }

  return new Response('Unknown action', { status: 400 });
};

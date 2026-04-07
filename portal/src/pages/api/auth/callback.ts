import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createSupabaseServerClient, supabaseAdmin } from '../../../lib/supabase-server';
import { orgFromEmail } from '../../../lib/personal-domains';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return redirect('/sign-in?error=missing_code');
  }

  const supabase = createSupabaseServerClient(cookies);
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return redirect('/sign-in?error=exchange_failed');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in?error=no_user');
  }

  const email = user.email ?? '';
  const meta = user.user_metadata ?? {};
  const provider = (user.app_metadata?.provider ?? 'google') as 'google' | 'github';
  const name = (meta.full_name ?? meta.name ?? meta.user_name ?? email) as string;
  const avatarUrl = (meta.avatar_url ?? meta.picture ?? null) as string | null;
  const githubHandle = provider === 'github' ? ((meta.user_name ?? meta.preferred_username ?? null) as string | null) : null;
  const org = orgFromEmail(email);

  // Upsert access_request — only insert sets status='pending'; existing rows keep their status
  const { data: existing } = await supabaseAdmin
    .from('access_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin.from('access_requests').insert({
      user_id: user.id,
      email,
      name,
      avatar_url: avatarUrl,
      provider,
      github_handle: githubHandle,
      org,
      status: 'pending',
    });

    // Notify Diego of the new request (best-effort)
    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.DIEGO_NOTIFY_EMAIL ?? 'diego@sens.legal';
    const fromAddr = process.env.RESEND_FROM_EMAIL ?? 'silo@sens.legal';
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: fromAddr,
          to: notifyTo,
          subject: `New Silo data room access request — ${name}`,
          text: `${name} <${email}> requested access via ${provider}.\nOrg: ${org ?? '(personal)'}\nReview at https://sens.legal/admin/access`,
        });
      } catch {
        // ignore — best effort
      }
    }
  } else {
    // Refresh metadata in case the user updated avatar/name
    await supabaseAdmin
      .from('access_requests')
      .update({ name, avatar_url: avatarUrl, github_handle: githubHandle, org })
      .eq('id', existing.id);
  }

  // Decide where to send them
  const { data: req } = await supabaseAdmin
    .from('access_requests')
    .select('status')
    .eq('user_id', user.id)
    .single();

  if (req?.status === 'approved') {
    return redirect('/inside');
  }
  return redirect('/pending');
};

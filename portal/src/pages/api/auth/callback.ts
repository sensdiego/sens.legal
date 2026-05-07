import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createSupabaseServerClient, supabaseAdmin } from '../../../lib/supabase-server';
import { orgFromEmail } from '../../../lib/personal-domains';
import { ACCESS_STATUS } from '../../../lib/access';
import { ensureBootstrapAdminAccess, isBootstrapAdminEmail } from '../../../lib/bootstrap-admin';
import type { Database } from '../../../lib/database.types';

type AccessRequestUpdate = Database['public']['Tables']['access_requests']['Update'];

export const prerender = false;

// Allowlist of OAuth provider avatar hosts. Reviewer-controlled avatar URLs
// render in the admin panel as <img src> — without an allowlist, a malicious
// reviewer can point at an attacker server to leak the admin's IP/UA on every
// page render (CSRF reconnaissance, tracking pixels).
const AVATAR_HOST_ALLOWLIST = new Set([
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  'avatars.githubusercontent.com',
]);

function safeAvatarUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return null;
    return AVATAR_HOST_ALLOWLIST.has(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

// Resend can be slow or unreachable. The OAuth callback runs synchronously and
// the user sees a white screen until it returns — Vercel Hobby times out at
// 10s. Cap the notification email at 3s; failures are logged and the user
// still sees the redirect.
async function sendNotificationWithTimeout(
  send: () => Promise<unknown>,
  timeoutMs: number,
): Promise<void> {
  try {
    await Promise.race([
      send(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('resend timeout')), timeoutMs),
      ),
    ]);
  } catch (err) {
    console.error('[callback] notification email failed', err);
  }
}

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return redirect('/sign-in?error=missing_code');
  }

  const supabase = createSupabaseServerClient(cookies);
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('[callback] exchangeCodeForSession failed', exchangeError);
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
  const avatarUrl = safeAvatarUrl(meta.avatar_url ?? meta.picture);
  const githubHandle =
    provider === 'github'
      ? ((meta.user_name ?? meta.preferred_username ?? null) as string | null)
      : null;
  const org = orgFromEmail(email);
  const shouldBootstrapAdmin = isBootstrapAdminEmail(email);

  // INSERT-first pattern (race-safe). Two concurrent callbacks for the same
  // user (double-click on the OAuth button, browser retry, prefetch) used to
  // both see existing=null and both INSERT — the second crashed with
  // 23505 unique_violation on user_id. Now: try INSERT first; on conflict,
  // fall through to the metadata-refresh path.
  const insertResult = await supabaseAdmin.from('access_requests').insert({
    user_id: user.id,
    email,
    name,
    avatar_url: avatarUrl,
    provider,
    github_handle: githubHandle,
    org,
    status: ACCESS_STATUS.PENDING,
  });

  let isNewRequest = false;
  if (!insertResult.error) {
    isNewRequest = true;
  } else if (insertResult.error.code === '23505') {
    // Existing row — refresh metadata only (never status). Conditionally skip
    // null fields so a smaller-scope re-login (e.g. GitHub without avatar
    // scope) doesn't null out previously populated columns. Email is always
    // refreshed because the auth.users.email may have changed since first
    // signup, and stale email means notifications go to the wrong place.
    const updatePatch: AccessRequestUpdate = { email };
    if (name) updatePatch.name = name;
    if (avatarUrl) updatePatch.avatar_url = avatarUrl;
    if (githubHandle) updatePatch.github_handle = githubHandle;
    if (org) updatePatch.org = org;
    const { error: updateError } = await supabaseAdmin
      .from('access_requests')
      .update(updatePatch)
      .eq('user_id', user.id);
    if (updateError) {
      console.error('[callback] access_requests update failed', updateError);
      return redirect('/sign-in?error=update_failed');
    }
  } else {
    console.error('[callback] access_requests insert failed', insertResult.error);
    return redirect('/sign-in?error=insert_failed');
  }

  if (shouldBootstrapAdmin) {
    try {
      await ensureBootstrapAdminAccess({
        userId: user.id,
        email,
        name,
        avatarUrl,
        provider,
        githubHandle,
        org,
      });
    } catch (err) {
      console.error('[callback] bootstrap admin sync failed', err);
      return redirect('/sign-in?error=update_failed');
    }
  }

  // Notify Diego of the new request (best-effort, capped at 3s).
  if (isNewRequest && !shouldBootstrapAdmin) {
    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.DIEGO_NOTIFY_EMAIL ?? 'diego@sens.legal';
    const fromAddr = process.env.RESEND_FROM_EMAIL ?? 'silo@sens.legal';
    if (resendKey) {
      const resend = new Resend(resendKey);
      await sendNotificationWithTimeout(
        () =>
          resend.emails.send({
            from: fromAddr,
            to: notifyTo,
            subject: `New Silo data room access request — ${name}`,
            text: `${name} <${email}> requested access via ${provider}.\nOrg: ${org ?? '(personal)'}\nReview at https://silo.legal/admin/access`,
          }),
        3000,
      );
    }
  }

  // Decide where to send them. We need a fresh status read because an admin
  // may have pre-approved this user (existing row already approved before they
  // first signed in is rare today, but the read is the canonical source).
  const { data: req, error: statusError } = await supabaseAdmin
    .from('access_requests')
    .select('status')
    .eq('user_id', user.id)
    .single();

  if (statusError || !req) {
    console.error('[callback] status read failed', statusError);
    return redirect('/sign-in?error=status_check_failed');
  }

  if (shouldBootstrapAdmin) {
    return redirect('/admin');
  }
  if (req.status === ACCESS_STATUS.APPROVED) {
    return redirect('/inside');
  }
  return redirect('/pending');
};

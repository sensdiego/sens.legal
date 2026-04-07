import { supabaseAdmin } from './supabase-server';

export interface TrackViewArgs {
  userId: string;
  email: string;
  page: string;
  ip?: string;
  userAgent?: string;
}

// A page reload, browser prefetch, or back/forward navigation triggers a fresh
// SSR render and a fresh dd_views insert. Without dedupe, a 30-minute reading
// session can produce dozens of identical rows per reviewer. We collapse
// repeated views of the same page by the same user within this window into a
// single row.
const DEDUPE_WINDOW_MS = 60_000;

/**
 * Insert a single dd_views row, deduplicating against the most recent view of
 * the same page by the same user within the last 60 seconds.
 *
 * Awaited by the caller (InsideLayout) so the write completes before the
 * Vercel serverless function returns. Errors are logged to console.error so
 * Vercel runtime logs capture them — historically this was a silent try/catch
 * and we lost visibility into write failures. The caller still doesn't fail
 * the page render on a logging error; tracking is best-effort but no longer
 * silent.
 */
export async function trackView(args: TrackViewArgs): Promise<void> {
  // Look up the most recent view of this page by this user.
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  const { data: recent, error: lookupError } = await supabaseAdmin
    .from('dd_views')
    .select('id')
    .eq('user_id', args.userId)
    .eq('page', args.page)
    .gte('viewed_at', since)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error('[track-view] dedupe lookup failed', lookupError);
    // Fall through to insert — better a duplicate than a missing row.
  } else if (recent) {
    // Within the dedupe window, skip the insert.
    return;
  }

  const { error } = await supabaseAdmin.from('dd_views').insert({
    user_id: args.userId,
    email: args.email,
    page: args.page,
    ip: args.ip ?? null,
    user_agent: args.userAgent ?? null,
  });
  if (error) {
    console.error('[track-view] insert failed', error);
  }
}

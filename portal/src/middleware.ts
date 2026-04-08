import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, supabaseAdmin } from './lib/supabase-server';
import { ACCESS_STATUS } from './lib/access';
import { ensureBootstrapAdminAccess } from './lib/bootstrap-admin';

const PUBLIC_PATHS = new Set<string>([
  '/',
  '/about',
  '/sign-in',
  '/contact',
  '/privacy',
  '/terms',
  '/data-retention',
]);

const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/_astro/',
  '/fonts/',
  '/about/',
  '/favicon',
  '/logo',
  '/robots',
  '/sitemap',
];

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.has(path)) return true;
  return PUBLIC_PREFIXES.some((p) => path.startsWith(p));
}

// Anchored prefix match: '/inside' OR '/inside/...' but NOT '/insidious'.
function matchesGate(path: string, base: string): boolean {
  return path === base || path.startsWith(`${base}/`);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (isPublic(path)) {
    return next();
  }

  const supabase = createSupabaseServerClient(context.cookies);
  // Use getUser() — verifies the JWT against the Supabase Auth server. NEVER
  // use getSession() server-side: it returns cookie data without revalidation,
  // so a stale or revoked refresh token within its expiry window passes the
  // gate. https://supabase.com/docs/guides/auth/server-side
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email) {
    try {
      await ensureBootstrapAdminAccess({
        userId: user.id,
        email: user.email,
        name:
          (user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.user_metadata?.user_name ??
            user.email) as string,
        avatarUrl:
          (user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null) as string | null,
        provider: (user.app_metadata?.provider ?? 'google') as 'google' | 'github',
        githubHandle:
          (user.user_metadata?.user_name ?? user.user_metadata?.preferred_username ?? null) as
            | string
            | null,
      });
    } catch (error) {
      console.error('[middleware] bootstrap admin sync failed', error);
      return context.redirect('/sign-in?error=lookup_failed');
    }
  }

  // Pending page is for authenticated users only.
  if (path === '/pending') {
    if (!user) return context.redirect('/sign-in');
    return next();
  }

  // /inside/* requires approved status. We pre-fetch the viewer's display name
  // and welcome state and stash them on Astro.locals so the 7 inside pages
  // (and the inside/index landing) don't each repeat the queries.
  if (matchesGate(path, '/inside')) {
    if (!user) return context.redirect('/sign-in');
    // Service role bypasses RLS on the lookup. The user identity was just
    // verified via getUser() above, so .eq('user_id', user.id) is safe.
    const [reqResult, profileResult] = await Promise.all([
      supabaseAdmin
        .from('access_requests')
        .select('status, name, org')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabaseAdmin
        .from('profiles')
        .select('welcomed_at')
        .eq('id', user.id)
        .maybeSingle(),
    ]);
    if (reqResult.error) {
      console.error('[middleware] access_requests lookup failed', reqResult.error);
      return context.redirect('/sign-in?error=lookup_failed');
    }
    if (profileResult.error) {
      console.error('[middleware] profiles lookup failed', profileResult.error);
      return context.redirect('/sign-in?error=lookup_failed');
    }
    const req = reqResult.data;
    const profile = profileResult.data;
    if (!req || req.status !== ACCESS_STATUS.APPROVED) {
      return context.redirect('/pending');
    }
    context.locals.shouldLogView = true;
    context.locals.userId = user.id;
    context.locals.userEmail = user.email ?? '';
    context.locals.viewerName = req.name ?? user.email ?? 'reviewer';
    context.locals.viewerOrg = req.org ?? null;
    context.locals.welcomedAt = profile?.welcomed_at ?? null;
    return next();
  }

  // /admin/* requires admin role.
  if (matchesGate(path, '/admin')) {
    if (!user) return context.redirect('/sign-in');
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      console.error('[middleware] profiles lookup failed', error);
      return context.redirect('/sign-in?error=lookup_failed');
    }
    if (!profile || profile.role !== 'admin') {
      return context.redirect('/');
    }
    context.locals.userId = user.id;
    context.locals.userEmail = user.email ?? '';
    return next();
  }

  return next();
});

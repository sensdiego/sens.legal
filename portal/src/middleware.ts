import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, supabaseAdmin } from './lib/supabase-server';
import { ensureBootstrapAdminAccess } from './lib/bootstrap-admin';

const PUBLIC_PATHS = new Set<string>([
  '/',
  '/about',
  '/sign-in',
  '/contact',
  '/privacy',
  '/terms',
  '/data-retention',
  '/inside',
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
  '/inside/',
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

  // /inside/* is public — handled at the top of this middleware via PUBLIC_PATHS
  // and PUBLIC_PREFIXES. The data room is now openly readable.

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

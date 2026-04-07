import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

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

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (isPublic(path)) {
    return next();
  }

  const supabase = createSupabaseServerClient(context.cookies);
  const { data: { session } } = await supabase.auth.getSession();

  // Pending page is for authenticated users only
  if (path === '/pending') {
    if (!session) return context.redirect('/sign-in');
    return next();
  }

  // /inside/* requires approved status
  if (path.startsWith('/inside')) {
    if (!session) return context.redirect('/sign-in');
    const { data: req } = await supabase
      .from('access_requests')
      .select('status')
      .eq('user_id', session.user.id)
      .single();
    if (!req || req.status !== 'approved') {
      return context.redirect('/pending');
    }
    // Surface a flag for the page to log the view
    context.locals.shouldLogView = true;
    context.locals.userId = session.user.id;
    context.locals.userEmail = session.user.email ?? '';
    return next();
  }

  // /admin/* requires admin role
  if (path.startsWith('/admin')) {
    if (!session) return context.redirect('/sign-in');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return context.redirect('/');
    }
    context.locals.userId = session.user.id;
    context.locals.userEmail = session.user.email ?? '';
    return next();
  }

  return next();
});

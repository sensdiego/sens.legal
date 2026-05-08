import { defineMiddleware } from 'astro:middleware';
import { isAdminAuthenticated } from './lib/admin-session';

const PUBLIC_PATHS = new Set<string>([
  '/',
  '/about',
  '/sign-in',
  '/pending',
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

function matchesGate(path: string, base: string): boolean {
  return path === base || path.startsWith(`${base}/`);
}

function signInRedirect(path: string, search: string): string {
  return `/sign-in?next=${encodeURIComponent(`${path}${search}`)}`;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (isPublic(path)) {
    return next();
  }

  // /inside/* is public. Only the operator admin surface is gated now.
  if (matchesGate(path, '/admin')) {
    if (!isAdminAuthenticated(context.cookies)) {
      return context.redirect(signInRedirect(path, url.search));
    }
    context.locals.isAdmin = true;
    return next();
  }

  if (matchesGate(path, '/api/admin')) {
    if (!isAdminAuthenticated(context.cookies)) {
      return new Response('Unauthorized', { status: 401 });
    }
    context.locals.isAdmin = true;
    return next();
  }

  return next();
});

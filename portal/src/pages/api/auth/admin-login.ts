import type { APIRoute } from 'astro';
import { adminAuthStatus, setAdminSession, verifyAdminPassword } from '../../../lib/admin-session';

export const prerender = false;

function sanitizeNext(value: unknown): string {
  if (typeof value !== 'string') return '/admin';
  return value === '/admin' || value.startsWith('/admin/') ? value : '/admin';
}

function signInError(code: string, next: string): string {
  const params = new URLSearchParams({ error: code });
  if (next !== '/admin') params.set('next', next);
  return `/sign-in?${params.toString()}`;
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = form.get('password');
  const next = sanitizeNext(form.get('next'));

  if (!adminAuthStatus().available) {
    return redirect(signInError('not_configured', next), 303);
  }

  if (typeof password !== 'string' || !verifyAdminPassword(password)) {
    return redirect(signInError('invalid_password', next), 303);
  }

  setAdminSession(cookies, new URL(request.url));
  return redirect(next, 303);
};

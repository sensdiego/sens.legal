import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client tied to the request's cookies.
 * Use this from middleware and SSR pages to read/write the session.
 */
export function createSupabaseServerClient(cookies: AstroCookies) {
  // During build-time SSG, env vars may be absent; use placeholders so
  // createServerClient doesn't throw. No live requests happen during build.
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder';
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies.set(name, value, { ...options, path: options.path ?? '/' });
      },
      remove(name: string, options: CookieOptions) {
        cookies.delete(name, { ...options, path: options.path ?? '/' });
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS. Use only in admin endpoints
 * after verifying the caller is admin.
 * Lazy singleton — created on first access so build-time SSG doesn't fail
 * when env vars are absent.
 */
let _supabaseAdmin: ReturnType<typeof createClient> | undefined;
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false },
      });
    }
    return (_supabaseAdmin as unknown as Record<string | symbol, unknown>)[prop];
  },
});

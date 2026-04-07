import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import type { Database } from './database.types';

// Read env vars lazily on every call. Reading them at module-load time means a
// cold-start without env vars (preview deploy with missing secret, build-time
// SSG) permanently binds the module to placeholder strings — every subsequent
// invocation in the same container is broken until restart.
function getEnv(): { url: string; anonKey: string; serviceRoleKey: string } {
  const url =
    import.meta.env.PUBLIC_SUPABASE_URL ??
    process.env.PUBLIC_SUPABASE_URL ??
    '';
  const anonKey =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
    process.env.PUBLIC_SUPABASE_ANON_KEY ??
    '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return { url, anonKey, serviceRoleKey };
}

/**
 * Server-side Supabase client tied to the request's cookies.
 * Use this from middleware and SSR pages to read/write the session.
 */
export function createSupabaseServerClient(cookies: AstroCookies): SupabaseClient<Database> {
  // During build-time SSG, env vars may be absent; use placeholders so
  // createServerClient doesn't throw. No live requests happen during build.
  const { url, anonKey } = getEnv();
  return createServerClient<Database>(
    url || 'https://placeholder.supabase.co',
    anonKey || 'placeholder',
    {
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
    },
  );
}

/**
 * Service-role client. Bypasses RLS. Use only after verifying the caller is
 * admin (or for server-internal flows like the OAuth callback that just
 * verified the user via getUser()).
 *
 * Lazy singleton — env vars are read on first access so build-time SSG with
 * missing vars doesn't throw, and a cold start without env vars doesn't lock
 * the module to placeholders permanently (the getEnv() call inside
 * getSupabaseAdmin() re-reads on every miss).
 */
let _supabaseAdmin: SupabaseClient<Database> | null = null;

function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_supabaseAdmin) return _supabaseAdmin;
  const { url, serviceRoleKey } = getEnv();
  _supabaseAdmin = createClient<Database>(
    url || 'https://placeholder.supabase.co',
    serviceRoleKey || 'placeholder',
    { auth: { persistSession: false } },
  );
  return _supabaseAdmin;
}

// Proxy preserves the existing `supabaseAdmin.from(...)` ergonomics throughout
// the codebase while routing through the lazy getter on every property access.
// Methods are bound to the underlying client so destructuring also works
// (`const { from } = supabaseAdmin`).
export const supabaseAdmin: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop) {
      const client = getSupabaseAdmin() as unknown as Record<string | symbol, unknown>;
      const value = client[prop];
      if (typeof value === 'function') {
        return (value as (...args: unknown[]) => unknown).bind(client);
      }
      return value;
    },
  },
);

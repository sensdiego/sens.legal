import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client. Used by the OauthButton to start the
 * OAuth handshake with `signInWithOAuth({ provider, options: { redirectTo } })`.
 */
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);

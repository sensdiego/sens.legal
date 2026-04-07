import { supabaseAdmin } from './supabase-server';

export interface TrackViewArgs {
  userId: string;
  email: string;
  page: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Fire-and-forget view logger. Never throws — failure is silent.
 */
export async function trackView(args: TrackViewArgs): Promise<void> {
  try {
    await supabaseAdmin.from('dd_views').insert({
      user_id: args.userId,
      email: args.email,
      page: args.page,
      ip: args.ip ?? null,
      user_agent: args.userAgent ?? null,
    });
  } catch {
    // silent
  }
}

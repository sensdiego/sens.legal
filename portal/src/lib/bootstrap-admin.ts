import { ACCESS_STATUS } from './access';
import type { Database, Provider } from './database.types';
import { supabaseAdmin } from './supabase-server';

const DEFAULT_BOOTSTRAP_ADMIN_EMAILS = ['diego@sens.legal'];
const BOOTSTRAP_ADMIN_NOTES =
  'Auto-approved bootstrap admin from configured email allowlist.';

type AccessRequestUpdate = Database['public']['Tables']['access_requests']['Update'];
type Role = Database['public']['Tables']['profiles']['Row']['role'];

type EnsureBootstrapAdminAccessInput = {
  userId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  provider?: Provider;
  githubHandle?: string | null;
  org?: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getConfiguredBootstrapAdminEmails(): readonly string[] {
  const raw =
    process.env.BOOTSTRAP_ADMIN_EMAILS ??
    import.meta.env.BOOTSTRAP_ADMIN_EMAILS ??
    '';
  const parsed = raw
    .split(',')
    .map((email: string) => normalizeEmail(email))
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_BOOTSTRAP_ADMIN_EMAILS;
}

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getConfiguredBootstrapAdminEmails().includes(normalizeEmail(email));
}

async function ensureBootstrapAdminProfile(userId: string, role: Role): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, role }, { onConflict: 'id' });
  if (error) {
    throw new Error(`[bootstrap-admin] profiles upsert failed: ${error.message}`);
  }
}

export async function ensureBootstrapAdminAccess(
  input: EnsureBootstrapAdminAccessInput,
): Promise<boolean> {
  if (!isBootstrapAdminEmail(input.email)) return false;

  const email = normalizeEmail(input.email ?? '');
  const approvedAt = new Date().toISOString();
  const { data: existingRequest, error: requestLookupError } = await supabaseAdmin
    .from('access_requests')
    .select('id, status, approved_at')
    .eq('user_id', input.userId)
    .maybeSingle();

  if (requestLookupError) {
    throw new Error(
      `[bootstrap-admin] access_requests lookup failed: ${requestLookupError.message}`,
    );
  }

  await ensureBootstrapAdminProfile(input.userId, 'admin');

  if (!existingRequest) {
    if (!input.provider) {
      throw new Error('[bootstrap-admin] provider is required to create access request');
    }
    const { error: insertError } = await supabaseAdmin.from('access_requests').insert({
      user_id: input.userId,
      email,
      name: input.name ?? email,
      avatar_url: input.avatarUrl ?? null,
      provider: input.provider,
      github_handle: input.githubHandle ?? null,
      org: input.org ?? null,
      status: ACCESS_STATUS.APPROVED,
      approved_at: approvedAt,
      approved_by: null,
      notes: BOOTSTRAP_ADMIN_NOTES,
    });
    if (insertError) {
      throw new Error(`[bootstrap-admin] access_requests insert failed: ${insertError.message}`);
    }
    return true;
  }

  const updatePatch: AccessRequestUpdate = {
    email,
    status: ACCESS_STATUS.APPROVED,
    notes: existingRequest.status === ACCESS_STATUS.APPROVED
      ? undefined
      : BOOTSTRAP_ADMIN_NOTES,
  };
  if (!existingRequest.approved_at) {
    updatePatch.approved_at = approvedAt;
  }
  if (input.name) updatePatch.name = input.name;
  if (input.avatarUrl) updatePatch.avatar_url = input.avatarUrl;
  if (input.provider) updatePatch.provider = input.provider;
  if (input.githubHandle) updatePatch.github_handle = input.githubHandle;
  if (input.org) updatePatch.org = input.org;

  const { error: updateError } = await supabaseAdmin
    .from('access_requests')
    .update(updatePatch)
    .eq('user_id', input.userId);

  if (updateError) {
    throw new Error(`[bootstrap-admin] access_requests update failed: ${updateError.message}`);
  }

  return true;
}

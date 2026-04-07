// Centralized constants for access_request status and admin actions.
// Replaces magic strings scattered across middleware, callback, [id].ts,
// admin pages, and the SQL CHECK constraints. Keep this in sync with the
// CHECK constraint in supabase/migrations/20260407_silo_gated_portal.sql.

export const ACCESS_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type AccessStatus = (typeof ACCESS_STATUS)[keyof typeof ACCESS_STATUS];

export const ALL_ACCESS_STATUSES: readonly AccessStatus[] = [
  ACCESS_STATUS.PENDING,
  ACCESS_STATUS.APPROVED,
  ACCESS_STATUS.REJECTED,
];

export function isAccessStatus(value: unknown): value is AccessStatus {
  return (
    typeof value === 'string' &&
    (ALL_ACCESS_STATUSES as readonly string[]).includes(value)
  );
}

export const ADMIN_ACTION = {
  APPROVE: 'approve',
  REJECT: 'reject',
} as const;

export type AdminAction = (typeof ADMIN_ACTION)[keyof typeof ADMIN_ACTION];

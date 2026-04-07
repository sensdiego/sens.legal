// Date/time formatting helpers shared across admin pages.
// Centralized so a format change doesn't require grepping admin/*.

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 19);
}

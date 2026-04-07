const PERSONAL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'msn.com',
]);

/**
 * Returns the domain part of an email, lowercased, or null on parse error.
 */
export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 0 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

/**
 * True when the email's domain is a known personal provider.
 */
export function isPersonalDomain(email: string): boolean {
  const d = emailDomain(email);
  return d !== null && PERSONAL_DOMAINS.has(d);
}

/**
 * Best-effort organization extraction from an email. Returns the domain
 * for corporate emails, or null for known personal providers.
 */
export function orgFromEmail(email: string): string | null {
  const d = emailDomain(email);
  if (d === null || PERSONAL_DOMAINS.has(d)) return null;
  return d;
}

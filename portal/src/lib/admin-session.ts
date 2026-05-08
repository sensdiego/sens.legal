import type { AstroCookies } from 'astro';
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'silo_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type AdminSessionPayload = {
  sub: 'admin';
  iat: number;
  exp: number;
};

function env(name: string): string {
  return process.env[name] ?? import.meta.env[name] ?? '';
}

function secret(): string {
  return env('ADMIN_SESSION_SECRET') || legacyAdminToken();
}

function plainPassword(): string {
  return env('ADMIN_PASSWORD') || legacyAdminToken();
}

function passwordHash(): string {
  return env('ADMIN_PASSWORD_HASH');
}

function legacyAdminToken(): string {
  return env('ADMIN_TOKEN');
}

function hmac(value: string): Buffer {
  return createHmac('sha256', secret()).update(value).digest();
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function unb64url(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

function verifyPlainPassword(candidate: string): boolean {
  const configured = plainPassword();
  if (!configured || !secret()) return false;
  return safeEqual(hmac(candidate), hmac(configured));
}

function verifyScryptPassword(candidate: string): boolean {
  const configured = passwordHash();
  const parts = configured.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  try {
    const salt = unb64url(parts[1] ?? '');
    const expected = unb64url(parts[2] ?? '');
    const actual = scryptSync(candidate, salt, expected.length);
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
}

function sign(payload: string): string {
  return b64url(hmac(payload));
}

function secureCookie(url: URL): boolean {
  return url.protocol === 'https:' || import.meta.env.PROD;
}

export function adminAuthStatus() {
  const hasSecret = Boolean(secret());
  const hasPlainPassword = Boolean(plainPassword());
  const hasPasswordHash = Boolean(passwordHash());
  const hasLegacyAdminToken = Boolean(legacyAdminToken());
  return {
    provider: 'builtin',
    available: hasSecret && (hasPlainPassword || hasPasswordHash),
    secretConfigured: hasSecret,
    passwordConfigured: hasPlainPassword || hasPasswordHash,
    passwordHashConfigured: hasPasswordHash,
    legacyAdminTokenConfigured: hasLegacyAdminToken,
  };
}

export function verifyAdminPassword(candidate: string): boolean {
  if (!candidate) return false;
  if (passwordHash()) return verifyScryptPassword(candidate);
  return verifyPlainPassword(candidate);
}

export function setAdminSession(cookies: AstroCookies, url: URL): void {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: 'admin',
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encoded = b64url(JSON.stringify(payload));
  cookies.set(COOKIE_NAME, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: secureCookie(url),
  });
}

export function clearAdminSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

export function isAdminAuthenticated(cookies: AstroCookies): boolean {
  const raw = cookies.get(COOKIE_NAME)?.value;
  if (!raw || !secret()) return false;
  const [payload, signature] = raw.split('.');
  if (!payload || !signature || !safeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) {
    return false;
  }

  try {
    const decoded = JSON.parse(unb64url(payload).toString('utf8')) as Partial<AdminSessionPayload>;
    const now = Math.floor(Date.now() / 1000);
    return decoded.sub === 'admin' && typeof decoded.exp === 'number' && decoded.exp > now;
  } catch {
    return false;
  }
}

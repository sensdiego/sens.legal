---
title: "Authentication"
description: "Authentication system using NextAuth v5 with Google OAuth, magic links, and dev bypass."
lang: en
sidebar:
  order: 11
---

# Authentication

Juca uses NextAuth v5 (Auth.js) for authentication with JWT-based sessions. Two authentication providers are configured: Google OAuth and Resend magic links (email).

## Configuration

The auth system is defined in `src/lib/auth.ts`:

```typescript
// Exports
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, Resend],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
  // ...
});
```

**Required environment variables for production:**

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `AUTH_SECRET` | NextAuth JWT secret |
| `RESEND_API_KEY` | Resend API key for magic link emails |
| `AUTH_EMAIL_FROM` | Sender email for magic links |
| `ADMIN_EMAILS` | Comma-separated admin email whitelist |

## Dev Bypass

For local development, set `ENABLE_DEV_AUTH=true` to skip authentication entirely. This returns a hardcoded dev user:

```typescript
// Dev user returned when ENABLE_DEV_AUTH=true
{ id: 'dev-user', email: 'dev@localhost', name: 'Dev User', role: 'admin' }
```

## Auth Patterns in Code

Juca uses two distinct auth patterns depending on context:

### Server Actions

```typescript
// src/actions/utils.ts
import { requireActionAuth } from '@/actions/utils';

// In any server action:
const user = await requireActionAuth();
// Throws if not authenticated (unless ENABLE_DEV_AUTH=true)
```

### API Routes

```typescript
// In any API route handler:
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  // ...
}
```

:::caution
**Never use `getServerSession()`** — always use `auth()` from `src/lib/auth`. The codebase is 100% consistent on this pattern.
:::

## Admin Role

Admin users are determined by the `ADMIN_EMAILS` environment variable (comma-separated, case-insensitive). The `isAdmin()` function checks membership, and the JWT callback adds a `role` field to the token.

## Middleware

Auth middleware (`src/middleware.ts`) protects all routes except static assets and the health endpoint:

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)']
};
```

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AuthProvider` | `src/components/auth/AuthProvider.tsx` | NextAuth SessionProvider wrapper |
| Sign-in page | `src/app/auth/signin/page.tsx` | Custom sign-in UI |

# Silo Portal Launch Runbook

> Manual operations to execute after the `feat/silo-gated-portal` PR is merged.
> Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
> Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`

Execute phases in order. Each phase is independently revertible.

---

## Phase 1 — Setup OAuth providers (before deploy)

### Google Cloud Console

1. https://console.cloud.google.com → APIs & Services → Credentials → **Create Credentials** → OAuth Client ID
2. Application type: **Web application**
3. Name: `silo-portal`
4. Authorized JavaScript origins:
   - `https://sens.legal`
   - `http://localhost:4321`
5. Authorized redirect URIs:
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
6. **Create** → copy Client ID and Client Secret
7. Supabase dashboard → Authentication → Providers → **Google** → Enable, paste credentials, Save.

### GitHub

1. https://github.com/settings/developers → **New OAuth App**
2. Application name: `Silo Portal`
3. Homepage URL: `https://sens.legal`
4. Authorization callback URL: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
5. **Register application**
6. Click **Generate a new client secret** → copy
7. Supabase dashboard → Authentication → Providers → **GitHub** → Enable, paste credentials, Save.

---

## Phase 1.5 — Configure Supabase Auth URL Configuration (CRITICAL)

This is the step that will silently break Phase 4 if you skip it. Supabase
Auth ships with `Site URL = http://localhost:3000` by default. After the OAuth
provider exchange completes, Supabase Auth redirects the browser to whatever
is in `Site URL` (or to a URL from the Redirect URLs allowlist if the original
`redirect_to` matches one). If neither is set to your production domain, the
user lands on `http://localhost:3000/?code=...` after a successful Google
sign-in — visible failure mode.

Supabase dashboard → **Authentication → URL Configuration**:

1. **Site URL** — change from `http://localhost:3000` to:
   ```
   https://sens.legal
   ```
   Click **Save changes**.

2. **Redirect URLs** — click **Add URL** and add:
   ```
   https://sens.legal/api/auth/callback
   ```
   Click **Save URLs**. Repeat to add the local dev callback so `npm -w portal run dev` also works:
   ```
   http://localhost:4321/api/auth/callback
   ```

Verify both fields are saved (the input should still show the new value after
the page re-renders). The URL Configuration is global per project, not per
environment, so a single setting covers production + local dev.

---

## Phase 2 — Apply Supabase migration

1. Open Supabase dashboard → SQL editor
2. Paste the contents of `supabase/migrations/20260407_silo_gated_portal.sql`
3. Run
4. Verify tables exist: `Database` → tables — should see `profiles`, `access_requests`, `dd_views`

After Diego signs in via OAuth at least once on production, promote to admin:

```sql
-- Run in Supabase SQL editor after Diego's first sign-in
INSERT INTO profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'diego@sens.legal'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## Phase 3 — Vercel environment variables

Vercel dashboard → portal project → Settings → Environment Variables. Add or confirm:

| Variable | Value | Scope |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | (Supabase project URL) | All |
| `PUBLIC_SUPABASE_ANON_KEY` | (Supabase anon key) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase service role) | Production, Preview |
| `RESEND_API_KEY` | (existing) | Production, Preview |
| `RESEND_FROM_EMAIL` | `silo@sens.legal` | All |
| `DIEGO_NOTIFY_EMAIL` | `diego@sens.legal` | All |
| `PORTAL_BASE_URL` | `https://sens.legal` | Production |
| `PORTAL_BASE_URL` | `http://localhost:4321` | Development |

Trigger a redeploy after saving env vars.

---

## Phase 4 — Smoke test in production

After the Vercel deploy completes:

### 4a — Happy path (Google OAuth + admin bootstrap)

1. Open `https://sens.legal` in a fresh incognito window → see new public landing
2. Click "Sign in" → see `/sign-in` with the 2 OAuth buttons
3. Click "Continue with Google" → OAuth flow completes → `/pending`
4. Pending page shows your name and email correctly
5. Run the SQL in Phase 2 to set yourself as admin
6. Refresh; you should still be on `/pending` (admin role doesn't auto-approve access)
7. Open another tab, navigate to `/admin/access` → you should see your own pending row. Visit `/admin` → 3 overview cards show **1 pending, 0 approved, 0 views**.
8. Click **Approve** → row moves to "Approved" tab → you receive email at the address shown on `/admin/access`
9. Open the email link → `/inside` loads with the Welcome card. The greeting uses your first name (if you signed in with an email like `diego@sens.legal` instead of a Google profile with a full name, expect "Welcome, diego." not "Welcome, diego@sens.legal.").
10. Click "Got it" on the welcome card → it disappears. Open a fresh incognito window, sign in as the same user → the welcome card should NOT reappear (verify `welcomed_at` was actually persisted, not just hidden via DOM mutation).
11. Click into `/inside/thesis` → see the scaffolded chapter
12. Visit each of `/inside/{system,proof,depth,decisions,roadmap,team}` → each renders the scaffold (not 404, not 500)
13. Open `/admin/views` → see one row per page visited above. Reload `/inside/thesis` 5 times rapidly → `/admin/views` should NOT show 5 new rows (the 60-second dedupe in `track-view.ts` collapses repeats).
14. Visit `/admin` → cards now show **0 pending, 1 approved, N views** where N matches the count above. Each row has a non-null email, page, and user_agent.

### 4b — GitHub OAuth (second provider path)

1. Open a fresh incognito window
2. Visit `/sign-in` → click "Continue with GitHub" → complete the OAuth flow → land on `/pending`
3. In the admin tab, refresh `/admin/access` → a second pending row appears with `provider=github` and a `@github_handle` shown under the name
4. Approve the row → fresh email arrives → click through → `/inside` loads

### 4c — Negative paths (rejection, revoke, reapply)

1. **Rejection flow:** Create a third test user (any throwaway Gmail). Sign in → `/pending`. Switch to admin tab, click **Reject** on that row → switch back to the test user tab and refresh `/pending` → should show "Request not accepted." copy.
2. **Revoke flow:** Sign in as your second test user (the one you approved in 4b). Visit `/inside` → loads. In the admin tab, navigate to `/admin/access?status=approved`, click **Revoke** on that row → switch to the test user tab and reload `/inside` → should redirect to `/pending` showing the rejected copy. Confirm via SQL: `SELECT status, approved_at, approved_by FROM access_requests WHERE email='<test>'` → status `rejected`, `approved_at` and `approved_by` both NULL.
3. **Re-approve:** From `/admin/access?status=rejected`, click **Approve** on the rejected row (you may need to re-add an Approve button if the UI doesn't expose one — alternatively, run `UPDATE access_requests SET status='approved', approved_at=now(), approved_by='<your admin uid>' WHERE id='<row id>'`). Test user reloads `/inside` → loads.

### 4d — Auth gating (unauthenticated + non-admin)

In a fresh incognito window with NO session:

1. `https://sens.legal/inside` → should redirect to `/sign-in`
2. `https://sens.legal/inside/thesis` → same redirect
3. `https://sens.legal/admin` → should redirect to `/sign-in`
4. `https://sens.legal/admin/access` → same
5. `curl -i -X POST https://sens.legal/api/admin/access/00000000-0000-0000-0000-000000000000 -d 'action=approve'` → should return `401 Unauthorized` (or `403` if SameSite cookie surfaces)

Then sign in as a NON-admin reviewer (any approved test user):

6. Navigate to `/admin` → should redirect to `/`
7. From the test user's browser DevTools, copy the `sb-*` cookies. Use them in a curl: `curl -i -X POST https://sens.legal/api/admin/access/<some-id> -H 'Cookie: sb-...' -d 'action=approve'` → should return `403 Forbidden`.

### 4e — Error redirects (sign-in error states)

Visit each URL and confirm the red error banner shows the right copy:

1. `https://sens.legal/sign-in?error=missing_code` → "Sign-in did not complete..."
2. `https://sens.legal/sign-in?error=exchange_failed` → "Sign-in could not be verified..."
3. `https://sens.legal/sign-in?error=no_user` → "Sign-in succeeded but no profile..."

If any 4a–4e step fails, check:
- Vercel runtime logs for the API endpoint that failed (search for `[middleware]`, `[callback]`, `[admin/access]`, `[track-view]`, `[welcome]` prefixes — every error path now logs)
- Supabase auth logs (Authentication → Users) for OAuth errors
- Browser DevTools network tab for callback errors

---

## Phase 5 — Vercel teardown of subdomain projects

The 4 docs sites (`valter-docs`, `juca-docs`, `leci-docs`, `douto-docs`) no longer have a source path in this monorepo. They will not redeploy. Take them down.

For each of the 4 Vercel projects:

1. Vercel dashboard → project → Settings → Domains → **Remove** `<codename>.sens.legal`
2. Settings → General → bottom of page → **Pause Project** (NOT delete — pausing keeps the project as a 30-day rollback safety net)
3. After 30 days of stability: revisit and **Delete Project**

---

## Phase 6 — DNS cleanup

DNS records location: verify on the day of execution (Vercel DNS, Cloudflare, or Registro.br depending on current state).

For Vercel DNS:

1. Vercel dashboard → top-level Domains → `sens.legal`
2. Find DNS records for `valter`, `juca`, `leci`, `douto` (CNAMEs or A records)
3. Delete each one
4. Verify with `dig valter.sens.legal` after TTL expires (5–60 min) — should return NXDOMAIN

---

## Phase 7 — Archive silo-site repository

```bash
cd ~/Dev/silo-site
git tag pre-archive-2026-04-07
git push --tags
```

Then via GitHub UI:

1. https://github.com/sensdiego/silo → Settings → bottom of page → **Archive this repository**

silo-site stays accessible as historical artifact. New work on Silo product narrative goes through `~/Dev/sens.legal` only.

---

## Phase 8 — Communication (optional)

If any reviewer holds an old `valter.sens.legal/...` link, it will return DNS-error after Phase 6. No cross-domain redirect is configured (intentional — DNS removal is the cleanest cleanup).

Diego sends new `https://sens.legal/sign-in` link manually to anyone who pings about a broken old link.

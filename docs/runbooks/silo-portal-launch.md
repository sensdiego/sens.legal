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

1. Open `https://sens.legal` in a fresh incognito window → see new public landing
2. Click "Sign in" → see `/sign-in` with the 2 OAuth buttons
3. Click "Continue with Google" → OAuth flow completes → `/pending`
4. Pending page shows your name and email correctly
5. Run the SQL in Phase 2 to set yourself as admin
6. Refresh; you should still be on `/pending` (admin role doesn't auto-approve access)
7. Open another tab, navigate to `/admin/access` → you should see your own pending row
8. Click **Approve** → row moves to "Approved" tab → you receive email
9. Open the email link → `/inside` loads with the Welcome card
10. Click "Got it" on the welcome card → it disappears (don't reappear on refresh)
11. Click into `/inside/thesis` → see the scaffolded chapter
12. Open `/admin/views` → see two rows: `/inside` and `/inside/thesis`

If any step fails, check:
- Vercel runtime logs for the API endpoint that failed
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

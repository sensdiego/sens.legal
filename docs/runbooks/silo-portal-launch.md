# Silo Portal Launch Runbook

> Current portal launch checklist. The public data room is ungated, and Supabase
> is no longer part of the runtime auth path.

Execute phases in order. Each phase is independently revertible.

---

## Phase 1 — Vercel environment variables

Vercel dashboard → portal project → Settings → Environment Variables. Add or confirm:

| Variable | Value | Scope |
|---|---|---|
| `ADMIN_SESSION_SECRET` | random high-entropy secret | Production, Preview |
| `ADMIN_PASSWORD` | temporary admin password | Production, Preview |
| `ADMIN_PASSWORD_HASH` | optional `scrypt$...` hash; preferred over `ADMIN_PASSWORD` | Production, Preview |
| `ADMIN_TOKEN` | legacy fallback if the new admin variables are absent | Existing env only |

If both `ADMIN_PASSWORD` and `ADMIN_PASSWORD_HASH` are set,
`ADMIN_PASSWORD_HASH` takes precedence. Trigger a redeploy after saving env vars.
The current runtime can fall back to the legacy `ADMIN_TOKEN`, but that path is
only for continuity; rotate to `ADMIN_SESSION_SECRET` plus `ADMIN_PASSWORD_HASH`
when changing production envs.

Generate a strong local secret with:

```bash
openssl rand -base64 48
```

Generate a password hash with:

```bash
npm -w portal run hash:admin-password -- "your-password"
```

---

## Phase 2 — Smoke test public routes

After deploy:

1. `https://silo.legal/inside` returns `200`.
2. Each chapter returns `200`:
   - `/inside/thesis`
   - `/inside/system`
   - `/inside/proof`
   - `/inside/depth`
   - `/inside/decisions`
   - `/inside/roadmap`
   - `/inside/team`
3. `/robots.txt` returns `200`.
4. `/sitemap-0.xml` returns only public URLs.

---

## Phase 3 — Smoke test admin auth

Unauthenticated:

1. `https://silo.legal/admin` redirects to `/sign-in?next=%2Fadmin`.
2. `GET https://silo.legal/api/auth/health` returns JSON with
   `provider: "builtin"` and `available: true`.

Authenticated:

1. Open `/sign-in`.
2. Enter the configured admin password.
3. Confirm redirect to `/admin`.
4. Confirm the overview cards render.
5. Click **Sign out**.
6. Confirm `/admin` redirects back to `/sign-in`.

Negative path:

1. Submit an incorrect admin password.
2. Confirm `/sign-in?error=invalid_password` renders a visible error.

---

## Phase 4 — Supabase teardown

The deployed portal no longer needs:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Google/GitHub OAuth provider configuration for the portal
- the retired `profiles`, `access_requests`, and `dd_views` runtime tables

Keep `ADMIN_TOKEN` only until the new admin password hash and session secret are
confirmed live.

Before deleting the old Supabase project, export any records that must be kept
for archive or deletion-response purposes. After export, remove the Supabase env
vars from Vercel and redeploy once more.

---

## Phase 5 — DNS and archive checks

Confirm the canonical domains still point to Vercel:

```bash
dig +short silo.legal
dig +short sens.legal
```

If any old reviewer holds a `/pending` link, that route now points them to the
public data room and Diego's email.

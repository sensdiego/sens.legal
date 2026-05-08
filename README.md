# sens.legal

Single Astro portal for Silo, a legal intelligence system for Brazilian lawyers.

## Workspaces

| Workspace | Purpose | Deploy |
|-----------|---------|--------|
| `portal/` | Astro 5 + Vercel adapter — the entire site | silo.legal / sens.legal |

The technical data room at `/inside` is public.
Public surface: `/`, `/about`, `/inside/*`, `/contact`, plus legal pages.
Admin surface: `/sign-in` and `/admin/*`, protected by the portal's built-in signed-cookie admin auth. Supabase is not required at runtime.

## Local development

```bash
npm install
npm run dev
# opens http://localhost:4321
```

Admin auth needs:

| Variable | Purpose |
|----------|---------|
| `ADMIN_SESSION_SECRET` | HMAC secret for the admin session cookie |
| `ADMIN_PASSWORD` | Plain env password for simple deployments |
| `ADMIN_PASSWORD_HASH` | Optional `scrypt$...` hash; preferred when configured |
| `ADMIN_TOKEN` | Legacy fallback used only when the new admin env vars are absent |

Generate a hash with:

```bash
npm -w portal run hash:admin-password -- "your-password"
```

## Spec and plan

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`

Earlier work:
- Spec: `docs/superpowers/specs/2026-03-29-silo-unification-redesign.md`
- Plan: `docs/superpowers/plans/2026-03-29-silo-unification.md`

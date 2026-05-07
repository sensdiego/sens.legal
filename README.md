# sens.legal

Single Astro portal for Silo, a legal intelligence system for Brazilian lawyers.

## Workspaces

| Workspace | Purpose | Deploy |
|-----------|---------|--------|
| `portal/` | Astro 5 + Vercel adapter — the entire site | silo.legal / sens.legal |

The technical data room at `/inside` is public.
Public surface: `/`, `/about`, `/inside/*`, `/contact`, plus legal pages.
Auth/admin surface: `/sign-in`, `/pending`, and `/admin/*` for private follow-up and access management.

## Local development

```bash
npm install
npm run dev
# opens http://localhost:4321
```

## Spec and plan

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`

Earlier work:
- Spec: `docs/superpowers/specs/2026-03-29-silo-unification-redesign.md`
- Plan: `docs/superpowers/plans/2026-03-29-silo-unification.md`

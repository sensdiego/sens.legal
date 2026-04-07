# sens.legal

Single Astro portal for Silo, a legal intelligence system for Brazilian lawyers.

## Workspaces

| Workspace | Purpose | Deploy |
|-----------|---------|--------|
| `portal/` | Astro 5 + Vercel adapter — the entire site | sens.legal |

The portal is gated behind OAuth (Google + GitHub) with manual approval.
Public surface: `/`, `/about`, `/sign-in`, `/pending`, `/contact`, plus legal pages.
Gated surface (`/inside/*`): 7-chapter technical data room for invited reviewers.

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

# Handoff — 2026-04-07 (post-merge)

## How to resume in the next session

Ask explicitly:

`Read /Users/sensdiego/Dev/sens.legal/HANDOFF.md and resume from there.`

---

## Current state

**Project:** sens.legal — single Astro portal at sens.legal hosting Silo's public landing and gated technical data room.
**Branch:** `main` (silo gated portal redesign merged via PR #7, squash commit `eced278`)
**Stack:** Astro 5 (output: server) + Vercel + Supabase Auth (Google + GitHub) + Resend
**Surfaces:**
- Public: `/`, `/about`, `/sign-in`, `/pending`, `/contact`, `/privacy`, `/terms`, `/data-retention`
- Gated `/inside/*`: 7 chapters of the data room (thesis, system, proof, depth, decisions, roadmap, team)
- Backstage `/admin/*`: overview, access requests, views

### Last session

Session of 2026-04-07 — full silo gated portal redesign, merged.

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`
- Mockups: `docs/design-mockups/dd-thesis-mockup.html` and `public-home-mockup.html`
- PR: sensdiego/sens.legal#7 (merged 2026-04-07, squash → `eced278`)
- Follow-up on main: `8b45522` adds runbook Phase 1.5 (Supabase Auth Site URL + Redirect URLs)

The session collapsed the silo-site repo overlap, removed all 4 codename
docs sites, gated the entire portal, dropped pt-br, and locked the
editorial mockup aesthetic as canonical. Pre-merge hardening pass added
5 fix commits on top of the original 54 (RLS rewrite, `getUser()` in
middleware, Astro CSRF via `security.checkOrigin`, race-safe upsert in
the OAuth callback, viewer-info centralization via `Astro.locals`).

### Next steps

1. **Run the launch runbook** in `docs/runbooks/silo-portal-launch.md` —
   nothing in production yet. Order:
   - Phase 1: OAuth providers (Google Cloud Console + GitHub OAuth App)
   - Phase 1.5: Supabase Auth Site URL + Redirect URLs
   - Phase 2: Apply `supabase/migrations/20260407_silo_gated_portal.sql`
     via Supabase dashboard SQL editor; promote Diego to admin after
     first sign-in
   - Phase 3: Vercel env vars (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY,
     SUPABASE_SERVICE_ROLE_KEY, RESEND_*, PORTAL_BASE_URL, DIEGO_NOTIFY_EMAIL)
   - Phase 4: Smoke test the full sign-in → pending → approve → /inside flow
   - Phases 5–7: Vercel teardown of valter/juca/leci/douto subdomain
     projects, DNS removal, silo-site repo archive
2. **Author final content** — Diego replaces the `<TodoBlock>` markers in
   the 8 inside chapters and the public landing copy. Each TodoBlock has
   explicit instructions for what goes in that slot. Corpus reference for
   each chapter lives in `docs/legacy/silo-site/`.

### Locked decisions

- **EN-only.** No PT-BR anywhere in portal.
- **Site is gated.** OAuth via Google + GitHub, manual approval. Public
  surface is the 5 pages above plus legal.
- **silo-site is dead.** Content lives in `docs/legacy/silo-site/`
  permanently. Repo will be archived in launch Phase 7.
- **Single host: sens.legal.** No more subdomain docs sites.
- **Editorial discipline:** restraint > marketing, functional names
  not codenames, "what this document does not cover" sections where
  they help, no emoji.
- **Mockup aesthetic is canonical.** InsideLayout sidebar + accent #2B579A
  + Instrument Sans + JetBrains Mono. No deviations.

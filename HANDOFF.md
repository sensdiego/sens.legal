# Handoff — 2026-04-07

## How to resume in the next session

Ask explicitly:

`Read /Users/sensdiego/Dev/sens.legal/HANDOFF.md and resume from there.`

---

## Current state

**Project:** sens.legal — single Astro portal at sens.legal hosting Silo's public landing and gated technical data room.
**Branch:** `feat/silo-gated-portal` (in flight) or `main` (after merge)
**Stack:** Astro 5 + Vercel + Supabase Auth (Google + GitHub) + Resend
**Surfaces:**
- Public: `/`, `/about`, `/sign-in`, `/pending`, `/contact`, `/privacy`, `/terms`, `/data-retention`
- Gated `/inside/*`: 7 chapters of the data room (thesis, system, proof, depth, decisions, roadmap, team)
- Backstage `/admin/*`: overview, access requests, views

### Last session

Session of 2026-04-07 — full silo gated portal redesign:

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md` (committed)
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md` (committed)
- Mockups: `docs/design-mockups/dd-thesis-mockup.html` and `public-home-mockup.html`

The session collapsed the silo-site repo overlap, removed all 4 codename
docs sites, gated the entire portal, dropped pt-br, and locked the
editorial mockup aesthetic as canonical.

### Next steps

1. **Author final content** — Diego replaces the `<TodoBlock>` markers in
   the 8 inside chapters and the public landing copy. Each TodoBlock
   has explicit instructions for what goes in that slot.
2. **Run the launch runbook** in `docs/runbooks/silo-portal-launch.md`
   after merge — OAuth provider setup, Supabase migration, env vars,
   smoke test, Vercel + DNS teardown of the 4 codename projects,
   silo-site archival.

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

# Handoff — 2026-04-07 (post-launch)

## How to resume in the next session

Ask explicitly:

`Read /Users/sensdiego/Dev/sens.legal/HANDOFF.md and resume from there.`

---

## Current state

**Project:** sens.legal — single Astro portal at sens.legal hosting Silo's public landing and gated technical data room.
**Branch:** `main` (silo gated portal redesign merged via PR #7, squash commit `eced278`).
**Stack:** Astro 5 (output: server) + Vercel + Supabase Auth (Google + GitHub) + Resend.
**Live in production at https://sens.legal.** 1 admin reviewer (Diego). 0 pending requests.

**Surfaces:**

- Public: `/`, `/about`, `/sign-in`, `/pending`, `/contact`, `/privacy`, `/terms`, `/data-retention`
- Gated `/inside/*`: 7 chapters of the data room (thesis, system, proof, depth, decisions, roadmap, team) — all rendering, all with `<TodoBlock>` markers awaiting Diego's content.
- Backstage `/admin/*`: overview, access requests, views.

**Supabase project:** `ikywqzcllcmikmaolbij` (region us-east-1, free tier — see open recommendation below).

### Last session

Session of 2026-04-07 covered the full launch end to end — code review, merge, OAuth setup, deploy, smoke test:

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`
- Mockups: `docs/design-mockups/dd-thesis-mockup.html` and `public-home-mockup.html`
- PR: sensdiego/sens.legal#7 (merged 2026-04-07, squash → `eced278`)
- Runbook follow-up: `8b45522` adds Phase 1.5 (Supabase Auth Site URL + Redirect URLs — discovered live during smoke test)
- Issue: sensdiego/sens.legal#8 (content pass tracking)

What happened in execution order:

1. **Pre-merge code review** surfaced 14 critical findings across 4 reviewer sources (security specialist, data-migration specialist, Claude adversarial, Codex adversarial). Highlights: RLS recursion in `profiles_admin_read_all`, privilege escalation via `profiles_self_update` missing `WITH CHECK`, `getSession()` server-side, no CSRF, race in `/api/auth/callback`, fire-and-forget tracking on Vercel, env vars at module-load time, etc. All fixed in 5 atomic commits before merge.
2. **Migration validated** against the real Supabase project (which had legacy schemas from SEN-401 — `raw_decisions`, `pipeline_processing`, `portal.waitlist`, all empty). Dropped them via `cleanup_legacy_schemas` migration, applied the new schema, ran a stress test confirming SELECT works without recursion, the trigger fires on auth.users insert, and the privilege escalation path returns 0 rows.
3. **PR #7 merged**, Vercel deploy completed in 23 seconds.
4. **OAuth providers configured** via Chrome browser MCP: Google OAuth Client `Silo Portal` in `paidproject` Google Cloud (added `diego@sens.legal` as test user since the consent screen is in Testing mode), GitHub OAuth App `Silo Portal`, both wired into Supabase Auth.
5. **Vercel env vars**: added `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`. The legacy `SUPABASE_SERVICE_ROLE_KEY` from SEN-401 was already correct for this project.
6. **Site URL footgun**: Supabase Auth shipped with `Site URL = http://localhost:3000`. After successful Google OAuth, the browser redirected to `localhost:3000/?code=...` instead of `sens.legal/api/auth/callback`. Fixed via dashboard, documented as Phase 1.5 in the runbook so the next launch doesn't repeat the loss.
7. **End-to-end smoke test**: signed in via Google as `diego@sens.legal`, landed at `/pending`, promoted self to admin via SQL through Supabase MCP, navigated to `/inside`, welcome card rendered with first-name extraction working ("Welcome, Diego."), `dd_views` logged with the 60-second dedupe (2 rapid reloads → 1 row), `/admin` overview cards showed `0 pending, 1 currently active`.
8. **Issue #8 created** to track the remaining content authoring work (37 `<TodoBlock>` slots).

Full session log: `progress.md` 2026-04-07 entries.

### Next steps

1. **Issue #8 — content pass.** 37 `<TodoBlock>` slots across the public landing, about page, and 7 inside chapters. Each marker has explicit guidance. Most critical: thesis (4-6 word headline + 2-sentence wedge), system (Mermaid diagram needs SVG render), proof (concrete capabilities working today). See the issue body for the full inventory and definition of done.
2. **Runbook Phases 5–8** (operational cleanup, none urgent):
   - Phase 5: Vercel teardown of the 4 docs subdomain projects (`sens-legal-{douto,juca,leci,valter}` — currently failing CI on every push because their source paths were deleted in PR #7).
   - Phase 6: DNS cleanup of the 4 codename subdomains.
   - Phase 7: Archive `~/Dev/silo-site` repo on GitHub.
   - Phase 8: Optional comms about the new sens.legal/sign-in link.
3. **Consider Supabase Pro ($25/mo).** Current free-tier project auto-pauses after inactivity. During this session I observed unexplained state regression (applied a migration, queries succeeded for several minutes, then connection refused, then the migration tables were gone — likely free-tier snapshot/restore behavior). For a legal data room where access audit logs need to be durable, this is fragile. Pro plan eliminates auto-pause and gives daily backups. Recommendation: upgrade before adding any external reviewers.

### Locked decisions (carried forward)

- **EN-only.** No PT-BR anywhere in portal.
- **Site is gated.** OAuth via Google + GitHub, manual approval. Public surface is the 5 pages above plus legal.
- **silo-site is dead.** Content lives in `docs/legacy/silo-site/` permanently. Repo will be archived in launch Phase 7.
- **Single host: sens.legal.** No more subdomain docs sites.
- **Editorial discipline:** restraint > marketing, functional names not codenames, "what this document does not cover" sections where they help, no emoji.
- **Mockup aesthetic is canonical.** InsideLayout sidebar + accent #2B579A + Instrument Sans + JetBrains Mono. No deviations.

### New decisions from this session

- **Admin reads use service role (`supabaseAdmin`), not RLS policies.** The recursive admin RLS pattern caused infinite recursion. Fix: drop admin RLS policies entirely, route all admin operations through the service-role client. There's no client-side write path for `profiles` (welcome.ts uses service role), so `profiles_self_update` was dropped to close the privilege escalation vector.
- **Database type is hand-typed**, not generated from `supabase gen types`. Schema is small (3 tables) and stable. Lives at `portal/src/lib/database.types.ts`, must be updated in lockstep with the SQL migration.
- **Astro 5 `security.checkOrigin: true`** is the CSRF mechanism. Only runs in production builds (`output: "server"`) — dev mode disables it by design. Verified in the production build manifest.
- **Site URL config in Supabase Auth is now part of Phase 1.5 of the runbook.** Both `https://sens.legal/api/auth/callback` and `http://localhost:4321/api/auth/callback` are in the Redirect URLs allowlist.

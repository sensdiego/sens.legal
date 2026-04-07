# Silo Gated Portal Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild sens.legal as a single gated portal — kill the 4 codename docs sites and the silo-site repo overlap, gate the entire site behind OAuth (Google + GitHub) with manual approval, drop pt-br mirror, adopt the editorial mockup aesthetic as canonical.

**Architecture:** Astro 5 + Vercel (existing). Add Supabase Auth providers, middleware-based gating, 5 layouts (Public/Minimal/Legal/Inside/Admin), 13 design system components in `portal/src/components/silo/`, 8 chapter pages under `/inside/*`, 5 public pages, admin dashboard rebuilt from scratch. Single big PR with atomic commits.

**Tech Stack:** Astro 5, TypeScript, Supabase Auth (Google + GitHub providers), Resend, Vercel adapter

**Spec:** `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`

---

## Test Discipline

The portal has **no test framework** (`grep -r '\.test\.\|\.spec\.' portal/` returns nothing). The CI workflow runs only `astro check` (typecheck) and `astro build`. Adding a test framework (vitest, playwright) is **out of scope** — explicit non-objective in the spec.

The discipline used in this plan is:

1. **Typecheck pass:** `npm -w portal run check` succeeds with zero errors after each file change.
2. **Build pass:** `npm -w portal run build` succeeds with zero errors at the end of each task.
3. **Manual smoke tests for auth-critical paths**, captured in the runbook (`docs/runbooks/silo-portal-launch.md`) and executed after deploy. Auth flow is the highest-risk surface; smoke tests cover OAuth callback, middleware gating, and approval flow.
4. **SQL migration verification**: applied to Supabase dev project, then production via dashboard SQL editor.

**Why not TDD with mocked Supabase:** Mocking Supabase Auth + GoTrue session cookies in a unit test framework is high-effort and low-value vs. running the actual flow in incognito after deploy. Build verification + manual smoke tests cover the realistic risk surface for a 1-developer site with no end-user volume.

Where the plan says "verify build", it means run the typecheck + build commands and confirm they pass.

---

## File Map

### Create

**Layouts:**
- `portal/src/layouts/PublicLayout.astro`
- `portal/src/layouts/MinimalLayout.astro`
- `portal/src/layouts/LegalLayout.astro`
- `portal/src/layouts/InsideLayout.astro`
- `portal/src/layouts/AdminLayout.astro`

**Design system components:**
- `portal/src/components/silo/ProofRow.astro`
- `portal/src/components/silo/Diagram.astro`
- `portal/src/components/silo/SectionLabel.astro`
- `portal/src/components/silo/PageLede.astro`
- `portal/src/components/silo/Pager.astro`
- `portal/src/components/silo/ConfidentialBadge.astro`
- `portal/src/components/silo/PrincipleList.astro`
- `portal/src/components/silo/Principle.astro`
- `portal/src/components/silo/TodoBlock.astro`
- `portal/src/components/silo/AdminTable.astro`
- `portal/src/components/silo/OauthButton.astro`
- `portal/src/components/silo/WelcomeCard.astro`
- `portal/src/components/silo/OrgCell.astro`

**Lib:**
- `portal/src/lib/supabase-server.ts` (replaces existing supabase.ts)
- `portal/src/lib/supabase-browser.ts`
- `portal/src/lib/track-view.ts`
- `portal/src/lib/email-templates.ts`
- `portal/src/lib/personal-domains.ts` (helper for OrgCell + admin filtering)

**Middleware:**
- `portal/src/middleware.ts`

**Public pages (rewritten):**
- `portal/src/pages/index.astro` (rewritten from current)
- `portal/src/pages/about.astro`
- `portal/src/pages/contact.astro`
- `portal/src/pages/sign-in.astro`
- `portal/src/pages/pending.astro`

**Inside pages (new):**
- `portal/src/pages/inside/index.astro`
- `portal/src/pages/inside/thesis.astro`
- `portal/src/pages/inside/system.astro`
- `portal/src/pages/inside/proof.astro`
- `portal/src/pages/inside/depth.astro`
- `portal/src/pages/inside/decisions.astro`
- `portal/src/pages/inside/roadmap.astro`
- `portal/src/pages/inside/team.astro`

**Admin pages (rebuilt from scratch):**
- `portal/src/pages/admin/index.astro` (rewrites old waitlist.astro role)
- `portal/src/pages/admin/access.astro`
- `portal/src/pages/admin/views.astro`

**API endpoints:**
- `portal/src/pages/api/auth/callback.ts`
- `portal/src/pages/api/auth/sign-out.ts`
- `portal/src/pages/api/auth/welcome.ts`
- `portal/src/pages/api/admin/access/[id].ts`

**Database:**
- `supabase/migrations/20260407_silo_gated_portal.sql`

**Docs:**
- `docs/legacy/silo-site/architecture.md` (copied from `~/Dev/silo-site/docs/`)
- `docs/legacy/silo-site/faq.md`
- `docs/legacy/silo-site/product-overview.md`
- `docs/legacy/silo-site/project-history.md`
- `docs/legacy/silo-site/release-notes.md`
- `docs/legacy/silo-site/roadmap.md`
- `docs/runbooks/silo-portal-launch.md`

**Public assets:**
- `portal/public/about/diego.png` — **already added** in commit `117a153`

### Modify

- `package.json` (root): remove `sites/*` from workspaces, remove dev/build/sync scripts for sites
- `vercel.json`: replace all redirects with the new collapsed set
- `.github/workflows/ci.yml`: remove the 4 `Build {Valter,Juca,Leci,Douto} docs` steps
- `README.md`: remove subdomain table, rewrite for new state
- `EDITORIAL_SNAPSHOT.md`: align with EN-only governance
- `progress.md`: append 2026-04-07 session entry
- `HANDOFF.md`: replace contents with new state
- `portal/src/pages/privacy.astro`: add OAuth + tracking clauses
- `portal/src/pages/terms.astro`: minor revision for new auth model
- `portal/src/pages/data-retention.astro`: add `dd_views` retention clause

### Delete

- `sites/valter/` (entire subdirectory)
- `sites/juca/` (entire subdirectory)
- `sites/leci/` (entire subdirectory)
- `sites/douto/` (entire subdirectory)
- `scripts/sync-docs.sh`
- `scripts/build-all.sh`
- `portal/src/pages/silo.astro`
- `portal/src/pages/architecture.astro`
- `portal/src/pages/roadmap.astro`
- `portal/src/pages/contributing.astro`
- `portal/src/pages/support.astro`
- `portal/src/pages/api/index.astro`
- `portal/src/pages/api/waitlist.ts`
- `portal/src/pages/api/admin/waitlist.ts`
- `portal/src/pages/admin/waitlist.astro`
- `portal/src/pages/pt-br/` (entire subdirectory)
- `portal/src/components/ProofPoints.astro`
- `portal/src/components/CapabilityCard.astro`
- `portal/src/components/MilestoneStatus.astro`
- `portal/src/components/Search.astro`
- `portal/src/layouts/DocsLayout.astro`
- `portal/src/lib/supabase.ts` (replaced by supabase-server.ts in lib/)

### Investigate before deletion

- `shared/` — investigate in Phase A. Delete if only used by sites/*; keep if portal imports from it.

---

## Branch and PR

**Branch:** `feat/silo-gated-portal`
**PR title:** `feat(portal): silo gated portal redesign — single source of truth`
**Base:** `main`

Create branch as the first action of Phase A.

---

## Phase A — Demolition

### Task A0: Create branch and verify clean baseline

- [ ] **Step 1: Verify clean working tree**

```bash
cd /Users/sensdiego/Dev/sens.legal
git status
```

Expected: `nothing to commit` (untracked HANDOFF.md / .txt are OK).

- [ ] **Step 2: Create and switch to feature branch**

```bash
git checkout -b feat/silo-gated-portal
```

Expected: `Switched to a new branch 'feat/silo-gated-portal'`

- [ ] **Step 3: Verify baseline build passes on the new branch**

```bash
npm install
npm -w portal run check
npm -w portal run build
```

Expected: typecheck and build complete with zero errors. This establishes the green baseline before any deletion.

- [ ] **Step 4: Investigate `shared/` before deletion**

```bash
ls shared/ 2>/dev/null && grep -r "from.*shared" portal/src/ 2>/dev/null
```

If `shared/` exists and is imported by `portal/src/`, leave it alone — it's load-bearing. If it's empty or only referenced from `sites/*`, mark it for deletion in Task A1.

---

### Task A1: Delete the 4 docs sites and sync scripts

**Files:**
- Delete: `sites/valter/`
- Delete: `sites/juca/`
- Delete: `sites/leci/`
- Delete: `sites/douto/`
- Delete: `scripts/sync-docs.sh`
- Delete: `scripts/build-all.sh`
- Delete (conditionally): `shared/` if Task A0 Step 4 confirmed it's not imported by portal

- [ ] **Step 1: Delete the 4 sites directories**

```bash
rm -rf sites/valter sites/juca sites/leci sites/douto
```

- [ ] **Step 2: Delete the sync and build-all scripts**

```bash
rm scripts/sync-docs.sh scripts/build-all.sh
```

- [ ] **Step 3: Verify scripts directory still has other files (or remove if empty)**

```bash
ls scripts/
```

If empty, run `rmdir scripts`. Otherwise leave it.

- [ ] **Step 4: Conditionally delete shared/ based on Task A0 Step 4**

If shared/ is unused: `rm -rf shared`. Otherwise skip.

- [ ] **Step 5: Verify portal still typechecks (sites deletion should not affect it)**

```bash
npm -w portal run check
```

Expected: passes. Portal does not import from sites/*.

- [ ] **Step 6: Stage and commit**

```bash
git add -A sites/ scripts/
git status
git commit -m "$(cat <<'EOF'
chore(sites): remove valter/juca/leci/douto subdirs and sync scripts

Sites are autodocs synced from external private repos. Public-facing
portal at sens.legal will be the single host for Silo content per
2026-04-07 redesign spec.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task A2: Drop sites/* from workspaces and dev scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Read current package.json**

```bash
cat package.json
```

- [ ] **Step 2: Replace `package.json` with cleaned version**

Open `package.json` and replace its contents with:

```json
{
  "name": "sens-legal-docs",
  "private": true,
  "workspaces": [
    "portal"
  ],
  "scripts": {
    "dev": "npm -w portal run dev",
    "dev:portal": "npm -w portal run dev",
    "build": "npm -w portal run build",
    "check": "npm -w portal run check"
  },
  "dependencies": {
    "@vercel/analytics": "^1.6.1",
    "@vercel/speed-insights": "^1.3.1"
  }
}
```

Changes from previous version:
- `workspaces` reduced from `["portal", "sites/*"]` to `["portal"]`
- Removed scripts: `dev:valter`, `dev:juca`, `dev:leci`, `dev:douto`, `build:all`, `sync`
- Added top-level convenience aliases: `dev`, `build`, `check`

- [ ] **Step 3: Run `npm install` to refresh the lockfile**

```bash
npm install
```

Expected: `package-lock.json` updated to drop sites/* references. No errors.

- [ ] **Step 4: Verify portal still builds**

```bash
npm -w portal run check && npm -w portal run build
```

Expected: passes.

- [ ] **Step 5: Stage and commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(workspace): drop sites/* from workspaces and dev scripts

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task A3: Remove sites/* from CI workflow

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Replace `.github/workflows/ci.yml` with cleaned version**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    name: Typecheck & Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Typecheck portal
        run: npm -w portal run check

      - name: Build portal
        run: npm -w portal run build
```

Removed: the 4 `Build {Valter,Juca,Leci,Douto} docs` steps.

- [ ] **Step 2: Stage and commit**

```bash
git add .github/workflows/ci.yml
git commit -m "$(cat <<'EOF'
ci: remove sites/* build steps from workflow

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task A4: Remove pt-br mirror

**Files:**
- Delete: `portal/src/pages/pt-br/` (entire subdirectory)

- [ ] **Step 1: List what's about to be deleted (sanity check)**

```bash
find portal/src/pages/pt-br -type f
```

Expected files: `about.astro`, `architecture.astro`, `contact.astro`, `contributing.astro`, `index.astro`, `roadmap.astro`, `silo.astro`, plus `api/` subdirectory.

- [ ] **Step 2: Delete the entire pt-br subdirectory**

```bash
rm -rf portal/src/pages/pt-br
```

- [ ] **Step 3: Verify build still passes**

```bash
npm -w portal run check && npm -w portal run build
```

Expected: passes. Note that pt-br pages do not feed any other page.

- [ ] **Step 4: Stage and commit**

```bash
git add -A portal/src/pages/pt-br
git commit -m "$(cat <<'EOF'
chore(i18n): remove pt-br mirror entirely

EN-only discipline per 2026-04-07 spec. Portal becomes English-only;
pt-br versions of all pages are deleted.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task A5: Remove deprecated public pages and components

**Files:**
- Delete: `portal/src/pages/silo.astro`
- Delete: `portal/src/pages/architecture.astro`
- Delete: `portal/src/pages/roadmap.astro`
- Delete: `portal/src/pages/contributing.astro`
- Delete: `portal/src/pages/support.astro`
- Delete: `portal/src/pages/api/index.astro`
- Delete: `portal/src/pages/api/waitlist.ts`
- Delete: `portal/src/pages/api/admin/waitlist.ts`
- Delete: `portal/src/pages/admin/waitlist.astro`
- Delete: `portal/src/components/ProofPoints.astro`
- Delete: `portal/src/components/CapabilityCard.astro`
- Delete: `portal/src/components/MilestoneStatus.astro`
- Delete: `portal/src/components/Search.astro`
- Delete: `portal/src/layouts/DocsLayout.astro`

- [ ] **Step 1: Audit which pages still import from the components being deleted**

```bash
grep -rn "ProofPoints\|CapabilityCard\|MilestoneStatus\|Search\|DocsLayout" portal/src/pages/
```

Expected: results only from pages we're also deleting in this task. If anything else still references them, note it — `portal/src/pages/index.astro` likely imports `DocsLayout`. We'll handle index in Phase E.

- [ ] **Step 2: Delete the public pages**

```bash
rm portal/src/pages/silo.astro
rm portal/src/pages/architecture.astro
rm portal/src/pages/roadmap.astro
rm portal/src/pages/contributing.astro
rm portal/src/pages/support.astro
```

- [ ] **Step 3: Delete the API routes**

```bash
rm portal/src/pages/api/index.astro
rm portal/src/pages/api/waitlist.ts
rm portal/src/pages/api/admin/waitlist.ts
```

- [ ] **Step 4: Delete the old admin waitlist page**

```bash
rm portal/src/pages/admin/waitlist.astro
```

- [ ] **Step 5: Delete the deprecated components**

```bash
rm portal/src/components/ProofPoints.astro
rm portal/src/components/CapabilityCard.astro
rm portal/src/components/MilestoneStatus.astro
rm portal/src/components/Search.astro
```

- [ ] **Step 6: Delete the deprecated DocsLayout (CAUTION)**

```bash
grep -rn "DocsLayout" portal/src/
```

If `portal/src/pages/index.astro` and the legal pages (`privacy`, `terms`, `data-retention`) still import `DocsLayout`, we cannot delete it yet — those pages need a temporary layout until Phase E rewrites them.

**Decision:** keep `DocsLayout.astro` for now, deletion deferred to Task K1 (after all consumers are rewritten). Skip this step.

- [ ] **Step 7: Verify build now FAILS due to broken imports in `index.astro`**

```bash
npm -w portal run check
```

Expected: errors complaining about missing imports in `portal/src/pages/index.astro` (likely imports `ProofPoints`, `CapabilityCard`, etc.).

This is an intentional broken state. We will not commit until we stub `index.astro` to a placeholder that compiles.

- [ ] **Step 8: Stub `portal/src/pages/index.astro` with a minimal placeholder**

Replace `portal/src/pages/index.astro` with:

```astro
---
import DocsLayout from '../layouts/DocsLayout.astro';
---

<DocsLayout title="Silo" description="Silo portal — under reconstruction">
  <h1>Silo</h1>
  <p>Portal is being reconstructed. The new gated portal launches with the
  silo-portal-redesign spec dated 2026-04-07.</p>
</DocsLayout>
```

This is a temporary stub. Phase E rewrites it as the real public landing.

- [ ] **Step 9: Verify build now passes**

```bash
npm -w portal run check && npm -w portal run build
```

Expected: passes.

- [ ] **Step 10: Stage and commit**

```bash
git add -A portal/src/pages portal/src/components
git commit -m "$(cat <<'EOF'
refactor(portal): remove deprecated public pages and marketing components

Deletes silo/architecture/roadmap/contributing/support pages, the
api/index landing, the waitlist endpoints, and the proof-points/
capability-card/milestone-status components that fed them.

index.astro stubbed with a placeholder; full rewrite comes in Phase E.
DocsLayout is temporarily kept until legal pages are migrated to
LegalLayout (Phase F).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task A6: Update README and EDITORIAL_SNAPSHOT for new state

**Files:**
- Modify: `README.md`
- Modify: `EDITORIAL_SNAPSHOT.md`

- [ ] **Step 1: Read current README to identify subdomain references**

```bash
cat README.md
```

- [ ] **Step 2: Replace `README.md` with the new version**

Replace the subdomain table and any references to valter/juca/leci/douto subdomains. The new README states:

```markdown
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
```

- [ ] **Step 3: Read current EDITORIAL_SNAPSHOT.md**

```bash
cat EDITORIAL_SNAPSHOT.md
```

- [ ] **Step 4: Update EDITORIAL_SNAPSHOT.md to reflect EN-only governance**

Add a new section at the top:

```markdown
## 2026-04-07 — EN-only and gated portal

The portal is now English-only. PT-BR mirror was deleted in the gated
portal redesign (spec `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`).

Editorial discipline carried over from `~/Dev/silo-site` (now archived):
- Functional names only — no internal codenames in public copy
- Restraint over marketing voice
- "What this document does not cover" sections where helpful
- No emojis in copy
```

- [ ] **Step 5: Verify build still passes**

```bash
npm -w portal run check && npm -w portal run build
```

- [ ] **Step 6: Stage and commit**

```bash
git add README.md EDITORIAL_SNAPSHOT.md
git commit -m "$(cat <<'EOF'
docs: update README and editorial snapshot for new portal state

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task A7: Preserve silo-site Markdown corpus under docs/legacy

**Files:**
- Create: `docs/legacy/silo-site/architecture.md` (copy from `~/Dev/silo-site/docs/`)
- Create: `docs/legacy/silo-site/faq.md`
- Create: `docs/legacy/silo-site/product-overview.md`
- Create: `docs/legacy/silo-site/project-history.md`
- Create: `docs/legacy/silo-site/release-notes.md`
- Create: `docs/legacy/silo-site/roadmap.md`

- [ ] **Step 1: Verify silo-site repo is locally checked out**

```bash
ls ~/Dev/silo-site/docs/
```

Expected output includes: `architecture.md`, `faq.md`, `product-overview.md`, `project-history.md`, `release-notes.md`, `roadmap.md`, plus `pt-br/` subdir (which we will NOT copy).

- [ ] **Step 2: Create destination directory**

```bash
mkdir -p docs/legacy/silo-site
```

- [ ] **Step 3: Copy the 6 EN markdown files**

```bash
cp ~/Dev/silo-site/docs/architecture.md docs/legacy/silo-site/
cp ~/Dev/silo-site/docs/faq.md docs/legacy/silo-site/
cp ~/Dev/silo-site/docs/product-overview.md docs/legacy/silo-site/
cp ~/Dev/silo-site/docs/project-history.md docs/legacy/silo-site/
cp ~/Dev/silo-site/docs/release-notes.md docs/legacy/silo-site/
cp ~/Dev/silo-site/docs/roadmap.md docs/legacy/silo-site/
```

- [ ] **Step 4: Add a README in docs/legacy/silo-site explaining provenance**

Create `docs/legacy/silo-site/README.md`:

```markdown
# silo-site Markdown corpus (archived)

Source: `github.com/sensdiego/silo` at tag `pre-archive-2026-04-07` (created during launch runbook Phase 7).

These files are the canonical Markdown for Silo's product narrative as of
2026-04-07. They are preserved here as the corpus for the Phase E and Phase G
content scaffolds in `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`.

The PT-BR mirror from the original silo-site repo is intentionally not copied
(EN-only discipline).

Diego writes the final copy in `portal/src/pages/` using these files as
material — direct copy is not the intent.
```

- [ ] **Step 5: Stage and commit**

```bash
git add docs/legacy/silo-site
git commit -m "$(cat <<'EOF'
docs(legacy): preserve silo-site markdown corpus for content scaffolds

Six EN markdown files copied from ~/Dev/silo-site/docs/ as the source
material for the Inside chapter scaffolds. PT-BR mirror intentionally
not copied. silo-site repo will be archived in launch runbook Phase 7.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase B — Layouts foundation

Note: shared CSS variables already live in `portal/src/styles/global.css` from the existing DESIGN.md. New layouts import that stylesheet. We rely on the existing variables — no new CSS file in this phase.

### Task B1: Create PublicLayout

**Files:**
- Create: `portal/src/layouts/PublicLayout.astro`

- [ ] **Step 1: Write `portal/src/layouts/PublicLayout.astro`**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Silo — verifiable legal reasoning.' } = Astro.props;
const path = Astro.url.pathname;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>{title} — Silo</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body class="public">
    <header class="public-topbar">
      <a class="brand" href="/">Silo</a>
      <nav class="public-nav">
        <a href="/about" class:list={[{ active: path === '/about' }]}>About</a>
        <a href="/contact" class:list={[{ active: path === '/contact' }]}>Contact</a>
        <a href="/sign-in" class="signin">Sign in</a>
      </nav>
    </header>

    <main class="public-page">
      <slot />
    </main>

    <footer class="public-footer">
      <div class="footer-row">
        <span>Silo · Built in São Paulo · MMXXVI</span>
        <div class="links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/data-retention">Data Retention</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>

    <style is:global>
      .public { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); }
      .public-topbar { height: var(--header-height); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; padding: 0 2rem; gap: 2rem; position: sticky; top: 0; z-index: 10; background: var(--color-bg); }
      .public-topbar .brand { font-weight: 700; font-size: 1rem; letter-spacing: -0.01em; color: var(--color-text); text-decoration: none; }
      .public-nav { margin-left: auto; display: flex; gap: 2rem; align-items: center; }
      .public-nav a { font-size: 0.875rem; color: var(--color-text-secondary); font-weight: 500; text-decoration: none; transition: color 0.15s; }
      .public-nav a:hover, .public-nav a.active { color: var(--color-text); }
      .public-nav .signin { color: var(--color-text); font-weight: 600; border-left: 1px solid var(--color-border); padding-left: 2rem; }
      .public-nav .signin::after { content: ' →'; color: var(--color-accent); }
      .public-page { max-width: 38rem; margin: 0 auto; padding: 0 2rem; }
      .public-footer { border-top: 1px solid var(--color-border); padding: 2rem 0 3rem 0; margin-top: 4rem; }
      .footer-row { max-width: 38rem; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
      .footer-row a { color: var(--color-text-muted); text-decoration: none; transition: color 0.15s; }
      .footer-row a:hover { color: var(--color-text); }
      .footer-row .links { display: flex; gap: 1.5rem; }
    </style>
  </body>
</html>
```

- [ ] **Step 2: Verify build still passes (layout is unused so no impact yet)**

```bash
npm -w portal run check && npm -w portal run build
```

- [ ] **Step 3: Commit**

```bash
git add portal/src/layouts/PublicLayout.astro
git commit -m "feat(portal/layouts): add PublicLayout with editorial topbar and footer

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task B2: Create MinimalLayout

**Files:**
- Create: `portal/src/layouts/MinimalLayout.astro`

- [ ] **Step 1: Write the file**

```astro
---
import '../styles/global.css';
interface Props { title: string; }
const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>{title} — Silo</title>
    <link rel="icon" type="image/png" href="/logo.png" />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body class="minimal">
    <header class="minimal-topbar">
      <a class="brand" href="/">Silo</a>
    </header>
    <main class="minimal-content">
      <slot />
    </main>
    <style is:global>
      .minimal { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); min-height: 100vh; display: flex; flex-direction: column; }
      .minimal-topbar { height: var(--header-height); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; padding: 0 2rem; }
      .minimal-topbar .brand { font-weight: 700; font-size: 1rem; color: var(--color-text); text-decoration: none; }
      .minimal-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 4rem 2rem; }
    </style>
  </body>
</html>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/layouts/MinimalLayout.astro
git commit -m "feat(portal/layouts): add MinimalLayout for sign-in and pending pages

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task B3: Create LegalLayout

**Files:**
- Create: `portal/src/layouts/LegalLayout.astro`

- [ ] **Step 1: Write the file**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  lastUpdated: string;
}

const { title, description, lastUpdated } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} — Silo</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" type="image/png" href="/logo.png" />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body class="legal">
    <header class="legal-topbar">
      <a class="brand" href="/">Silo</a>
      <nav class="legal-nav"><a href="/sign-in" class="signin">Sign in →</a></nav>
    </header>
    <main class="legal-page">
      <article class="legal-article">
        <h1>{title}</h1>
        <p class="last-updated">Last updated: {lastUpdated}</p>
        <slot />
      </article>
    </main>
    <footer class="legal-footer">
      <div class="footer-row">
        <span>Silo · MMXXVI</span>
        <div class="links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/data-retention">Data Retention</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
    <style is:global>
      .legal { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); line-height: 1.7; }
      .legal-topbar { height: var(--header-height); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; padding: 0 2rem; }
      .legal-topbar .brand { font-weight: 700; font-size: 1rem; color: var(--color-text); text-decoration: none; }
      .legal-nav { margin-left: auto; }
      .legal-nav .signin { color: var(--color-text); font-weight: 600; text-decoration: none; }
      .legal-page { max-width: 38rem; margin: 0 auto; padding: 4rem 2rem; }
      .legal-article h1 { font-size: 2.25rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
      .legal-article .last-updated { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2.5rem; }
      .legal-article h2 { font-size: 1.375rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1rem; }
      .legal-article h3 { font-size: 1.0625rem; font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.5rem; }
      .legal-article p, .legal-article ul, .legal-article ol { margin-bottom: 1.25rem; color: var(--color-text); }
      .legal-article ul, .legal-article ol { padding-left: 1.5rem; }
      .legal-article li { margin-bottom: 0.5rem; }
      .legal-article code { font-family: var(--font-mono); font-size: 0.875em; background: var(--color-bg-secondary); padding: 0.125rem 0.375rem; border-radius: 3px; }
      .legal-article table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
      .legal-article th, .legal-article td { border: 1px solid var(--color-border); padding: 0.75rem; text-align: left; font-size: 0.875rem; }
      .legal-article th { background: var(--color-bg-secondary); font-weight: 600; }
      .legal-footer { border-top: 1px solid var(--color-border); padding: 2rem 0 3rem 0; margin-top: 4rem; }
      .legal-footer .footer-row { max-width: 38rem; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; gap: 1rem; font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
      .legal-footer .footer-row a { color: var(--color-text-muted); text-decoration: none; }
      .legal-footer .footer-row .links { display: flex; gap: 1.5rem; }
    </style>
  </body>
</html>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/layouts/LegalLayout.astro
git commit -m "feat(portal/layouts): add LegalLayout for privacy/terms/data-retention

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task B4: Create InsideLayout

This is the largest layout — sidebar with 7 numbered chapters, top bar with confidential badge and viewing-as, content column, pager. Mirrors `docs/design-mockups/dd-thesis-mockup.html`.

**Files:**
- Create: `portal/src/layouts/InsideLayout.astro`

- [ ] **Step 1: Write the file**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  chapter: '01' | '02' | '03' | '04' | '05' | '06' | '07';
  prev?: { num: string; title: string; href: string };
  next?: { num: string; title: string; href: string };
  viewerName?: string;
  expiresAt?: string;
}

const { title, chapter, prev, next, viewerName = '', expiresAt = '' } = Astro.props;

const chapters = [
  { num: '01', slug: 'thesis', label: 'Thesis' },
  { num: '02', slug: 'system', label: 'System' },
  { num: '03', slug: 'proof', label: 'Proof' },
  { num: '04', slug: 'depth', label: 'Depth' },
  { num: '05', slug: 'decisions', label: 'Decisions' },
  { num: '06', slug: 'roadmap', label: 'Roadmap & Risks' },
  { num: '07', slug: 'team', label: 'Team & Velocity' },
];

const currentIdx = chapters.findIndex((c) => c.num === chapter);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>{title} — Silo Data Room</title>
    <link rel="icon" type="image/png" href="/logo.png" />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body class="inside">
    <header class="inside-topbar">
      <div class="brand">
        <span class="silo">Silo</span>
        <span class="sep">/</span>
        <span class="sub">Technical Data Room</span>
      </div>
      <div class="topbar-spacer"></div>
      <span class="conf-badge">Confidential</span>
      {viewerName && <span class="viewing-as">viewing as <strong>{viewerName}</strong></span>}
    </header>

    <div class="shell">
      <aside class="sidebar">
        <div class="side-label">Reviewer Journey</div>
        <ul class="side-nav">
          {chapters.map((c, i) => (
            <li class:list={[
              { current: c.num === chapter },
              { visited: i < currentIdx },
            ]}>
              <a href={`/inside/${c.slug}`}>
                <span class="num">{c.num}</span>
                <span>{c.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div class="side-meta">
          {expiresAt && <div class="row"><strong>Access expires</strong><br />{expiresAt}</div>}
          <div class="row"><strong>Last updated</strong><br />2026-04-07</div>
          <div class="row"><strong>Repo access</strong><br />on request</div>
        </div>
      </aside>

      <main class="main">
        <article class="article">
          <slot />

          {(prev || next) && (
            <div class="pager">
              {prev ? (
                <a class="prev" href={prev.href}>
                  <span class="label">← Previous</span>
                  <span class="title">{prev.num} · {prev.title}</span>
                </a>
              ) : <span></span>}
              {next ? (
                <a class="next" href={next.href}>
                  <span class="label">Next →</span>
                  <span class="title">{next.num} · {next.title}</span>
                </a>
              ) : <span></span>}
            </div>
          )}

          <div class="article-foot">
            <span>silo · technical data room · confidential</span>
            <span>{chapter} of 07</span>
          </div>
        </article>
      </main>
    </div>

    <style is:global>
      .inside { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); -webkit-font-smoothing: antialiased; line-height: 1.65; }
      .inside h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 0.75rem; }
      .inside h2 { font-size: 1.5rem; font-weight: 600; line-height: 1.3; margin-top: 2.5rem; margin-bottom: 1rem; }
      .inside h3 { font-size: 1.125rem; font-weight: 600; line-height: 1.35; margin-top: 1.75rem; margin-bottom: 0.5rem; }
      .inside p { margin-bottom: 1.25rem; color: var(--color-text); }
      .inside a { color: var(--color-text); text-decoration: none; border-bottom: 1px solid var(--color-border); }
      .inside a:hover { color: var(--color-accent); border-bottom-color: var(--color-accent); }

      .inside-topbar { height: var(--header-height); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; padding: 0 2rem; gap: 2rem; background: var(--color-bg); position: sticky; top: 0; z-index: 10; }
      .inside-topbar .brand { font-weight: 600; }
      .inside-topbar .silo { font-weight: 700; letter-spacing: -0.01em; }
      .inside-topbar .sep { color: var(--color-text-muted); margin: 0 0.625rem; font-weight: 400; }
      .inside-topbar .sub { color: var(--color-text-secondary); font-weight: 500; }
      .topbar-spacer { flex: 1; }
      .conf-badge { font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: 3px; padding: 0.25rem 0.625rem; background: var(--color-bg-secondary); }
      .viewing-as { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); }
      .viewing-as strong { font-weight: 500; color: var(--color-text-secondary); }

      .shell { display: grid; grid-template-columns: 17rem 1fr; min-height: calc(100vh - var(--header-height)); }

      .sidebar { border-right: 1px solid var(--color-border); padding: 2.5rem 1.75rem; position: sticky; top: var(--header-height); height: calc(100vh - var(--header-height)); overflow-y: auto; background: var(--color-bg); }
      .side-label { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 1rem; padding-left: 1.875rem; }
      .side-nav { list-style: none; display: flex; flex-direction: column; gap: 0.125rem; padding: 0; margin: 0; }
      .side-nav li { display: flex; padding: 0; border-radius: 4px; }
      .side-nav li a { display: flex; align-items: baseline; gap: 0.875rem; padding: 0.5rem 0.625rem 0.5rem 0; color: var(--color-text-secondary); font-weight: 500; border: none; flex: 1; }
      .side-nav .num { font-family: var(--font-mono); font-size: 0.75rem; width: 1.25rem; text-align: right; color: var(--color-text-muted); font-weight: 500; }
      .side-nav li:hover a { color: var(--color-text); }
      .side-nav li.visited a { color: var(--color-text); }
      .side-nav li.visited .num::after { content: '·'; color: var(--color-accent); margin-left: 0.25rem; }
      .side-nav li.current { background: var(--color-bg-secondary); margin-left: -0.625rem; margin-right: -0.625rem; padding-left: calc(0.625rem - 2px); border-left: 2px solid var(--color-accent); }
      .side-nav li.current a { color: var(--color-text); font-weight: 600; padding-left: 0.625rem; }
      .side-nav li.current .num { color: var(--color-accent); font-weight: 600; }
      .side-meta { margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--color-border); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-text-muted); line-height: 1.6; }
      .side-meta .row { margin-bottom: 0.375rem; }
      .side-meta strong { color: var(--color-text-secondary); font-weight: 500; }

      .main { padding: 4rem 4rem 6rem 4rem; display: flex; justify-content: center; }
      .article { width: 100%; max-width: 42rem; }

      .pager { margin-top: 5rem; padding-top: 2rem; border-top: 1px solid var(--color-border); display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      .pager a { border: 1px solid var(--color-border); border-radius: 4px; padding: 1rem 1.25rem; display: block; transition: border-color 0.15s; }
      .pager a:hover { border-color: var(--color-border-active); }
      .pager .label { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); display: block; margin-bottom: 0.25rem; }
      .pager .title { font-weight: 600; color: var(--color-text); }
      .pager .next { text-align: right; }

      .article-foot { margin-top: 2rem; font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-text-muted); display: flex; justify-content: space-between; }

      @media print {
        .inside-topbar, .sidebar, .pager, .article-foot { display: none; }
        .shell { grid-template-columns: 1fr; }
        .main { padding: 2rem 0; }
      }
    </style>
  </body>
</html>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/layouts/InsideLayout.astro
git commit -m "feat(portal/layouts): add InsideLayout — sidebar nav + chapter pager + print CSS

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task B5: Create AdminLayout

**Files:**
- Create: `portal/src/layouts/AdminLayout.astro`

- [ ] **Step 1: Write the file**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  active?: 'index' | 'access' | 'views';
}

const { title, active = 'index' } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>{title} — Silo Admin</title>
    <link rel="icon" type="image/png" href="/logo.png" />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body class="admin">
    <header class="admin-topbar">
      <div class="brand"><span class="silo">Silo</span><span class="sep">/</span><span class="sub">Admin</span></div>
      <div class="topbar-spacer"></div>
      <form method="POST" action="/api/auth/sign-out" class="signout-form">
        <button type="submit">Sign out</button>
      </form>
    </header>
    <div class="shell">
      <aside class="sidebar">
        <ul>
          <li class:list={[{ active: active === 'index' }]}><a href="/admin">Overview</a></li>
          <li class:list={[{ active: active === 'access' }]}><a href="/admin/access">Access requests</a></li>
          <li class:list={[{ active: active === 'views' }]}><a href="/admin/views">Views</a></li>
        </ul>
      </aside>
      <main class="main">
        <slot />
      </main>
    </div>
    <style is:global>
      .admin { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); }
      .admin-topbar { height: var(--header-height); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; padding: 0 2rem; gap: 2rem; background: var(--color-bg); }
      .admin-topbar .brand { font-weight: 600; }
      .admin-topbar .silo { font-weight: 700; }
      .admin-topbar .sep { color: var(--color-text-muted); margin: 0 0.625rem; }
      .admin-topbar .sub { color: var(--color-text-secondary); font-weight: 500; }
      .admin-topbar .topbar-spacer { flex: 1; }
      .signout-form button { background: none; border: 1px solid var(--color-border); border-radius: 4px; padding: 0.375rem 0.875rem; font-family: var(--font-sans); font-size: 0.8125rem; color: var(--color-text-secondary); cursor: pointer; }
      .signout-form button:hover { color: var(--color-text); border-color: var(--color-border-active); }
      .admin .shell { display: grid; grid-template-columns: 14rem 1fr; min-height: calc(100vh - var(--header-height)); }
      .admin .sidebar { border-right: 1px solid var(--color-border); padding: 2rem 1rem; }
      .admin .sidebar ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
      .admin .sidebar li a { display: block; padding: 0.5rem 0.875rem; border-radius: 4px; color: var(--color-text-secondary); font-weight: 500; font-size: 0.875rem; text-decoration: none; }
      .admin .sidebar li a:hover { color: var(--color-text); background: var(--color-bg-secondary); }
      .admin .sidebar li.active a { color: var(--color-text); background: var(--color-bg-secondary); border-left: 2px solid var(--color-accent); }
      .admin .main { padding: 3rem 3rem; }
      .admin h1 { font-size: 1.875rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1.5rem; }
      .admin h2 { font-size: 1.25rem; font-weight: 600; margin: 2rem 0 1rem; }
      .admin table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
      .admin th, .admin td { border-bottom: 1px solid var(--color-border); padding: 0.75rem 0.5rem; text-align: left; }
      .admin th { font-weight: 600; color: var(--color-text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
    </style>
  </body>
</html>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/layouts/AdminLayout.astro
git commit -m "feat(portal/layouts): add AdminLayout for /admin dashboard

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase C — Design system components (non-auth)

These components don't depend on Supabase. They can be added before the auth lib. Auth-dependent components (OauthButton, WelcomeCard, OrgCell) are added in Phase E after the auth lib in Phase D.

### Task C1: Create ProofRow

**Files:**
- Create: `portal/src/components/silo/ProofRow.astro`

- [ ] **Step 1: Write the file**

```astro
---
interface Props {
  value: string;
  label: string;
  source?: string;
}
const { value, label, source } = Astro.props;
---

<div class="proof-row">
  <span class="v">{value}</span>
  <span class="l">{label}{source && <span class="src">{source}</span>}</span>
</div>

<style>
  .proof-row { display: grid; grid-template-columns: 6.5rem 1fr; gap: 1.25rem; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); align-items: baseline; }
  .proof-row:last-child { border-bottom: none; }
  .v { font-family: var(--font-mono); font-size: 1.125rem; font-weight: 500; color: var(--color-text); }
  .l { color: var(--color-text-secondary); font-size: 0.9375rem; }
  .src { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-text-muted); margin-left: 0.5rem; }
</style>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/ProofRow.astro
git commit -m "feat(portal/silo): add ProofRow component

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task C2: Create SectionLabel and PageLede

**Files:**
- Create: `portal/src/components/silo/SectionLabel.astro`
- Create: `portal/src/components/silo/PageLede.astro`

- [ ] **Step 1: Write SectionLabel**

```astro
---
// portal/src/components/silo/SectionLabel.astro
---
<span class="section-label"><slot /></span>
<style>
  .section-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    display: block;
    margin-bottom: 1.5rem;
  }
</style>
```

- [ ] **Step 2: Write PageLede**

```astro
---
// portal/src/components/silo/PageLede.astro
---
<p class="lede"><slot /></p>
<style>
  .lede {
    font-size: 1.0625rem;
    color: var(--color-text-secondary);
    margin-bottom: 2.5rem;
    line-height: 1.55;
    font-weight: 400;
    max-width: 34rem;
  }
</style>
```

- [ ] **Step 3: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/SectionLabel.astro portal/src/components/silo/PageLede.astro
git commit -m "feat(portal/silo): add SectionLabel and PageLede

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task C3: Create Diagram and ConfidentialBadge

**Files:**
- Create: `portal/src/components/silo/Diagram.astro`
- Create: `portal/src/components/silo/ConfidentialBadge.astro`

- [ ] **Step 1: Write Diagram**

```astro
---
interface Props {
  src: string;
  caption?: string;
  alt?: string;
}
const { src, caption, alt = caption ?? '' } = Astro.props;
---

<figure class="diagram">
  <img src={src} alt={alt} />
  {caption && <figcaption>{caption}</figcaption>}
</figure>

<style>
  .diagram { margin: 2rem 0; }
  .diagram img { display: block; max-width: 100%; height: auto; border: 1px solid var(--color-border); border-radius: 4px; }
  .diagram figcaption { margin-top: 0.625rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); text-align: center; }
</style>
```

- [ ] **Step 2: Write ConfidentialBadge**

```astro
---
// portal/src/components/silo/ConfidentialBadge.astro
---
<span class="conf-badge-inline">Confidential</span>
<style>
  .conf-badge-inline {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    padding: 0.25rem 0.625rem;
    background: var(--color-bg-secondary);
  }
</style>
```

- [ ] **Step 3: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/Diagram.astro portal/src/components/silo/ConfidentialBadge.astro
git commit -m "feat(portal/silo): add Diagram and ConfidentialBadge

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task C4: Create Pager

**Files:**
- Create: `portal/src/components/silo/Pager.astro`

Note: InsideLayout already includes the pager inline. This standalone Pager component is for use in pages outside the data room (e.g., long /about). Currently no consumer — kept for parity with the spec component list.

- [ ] **Step 1: Write the file**

```astro
---
interface Props {
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
}
const { prev, next } = Astro.props;
---

<div class="pager-standalone">
  {prev ? <a class="prev" href={prev.href}><span class="label">← Previous</span><span class="title">{prev.label}</span></a> : <span></span>}
  {next ? <a class="next" href={next.href}><span class="label">Next →</span><span class="title">{next.label}</span></a> : <span></span>}
</div>

<style>
  .pager-standalone { margin-top: 5rem; padding-top: 2rem; border-top: 1px solid var(--color-border); display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .pager-standalone a { border: 1px solid var(--color-border); border-radius: 4px; padding: 1rem 1.25rem; display: block; text-decoration: none; }
  .pager-standalone a:hover { border-color: var(--color-border-active); }
  .pager-standalone .label { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); display: block; margin-bottom: 0.25rem; }
  .pager-standalone .title { font-weight: 600; color: var(--color-text); }
  .pager-standalone .next { text-align: right; }
</style>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/Pager.astro
git commit -m "feat(portal/silo): add standalone Pager component

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task C5: Create Principle and PrincipleList

**Files:**
- Create: `portal/src/components/silo/Principle.astro`
- Create: `portal/src/components/silo/PrincipleList.astro`

- [ ] **Step 1: Write Principle**

```astro
---
interface Props {
  number: string;
  title: string;
}
const { number, title } = Astro.props;
---

<div class="principle">
  <span class="num">{number}</span>
  <div>
    <h3>{title}</h3>
    <p><slot /></p>
  </div>
</div>

<style>
  .principle { display: grid; grid-template-columns: 2rem 1fr; gap: 1rem; align-items: start; }
  .principle .num { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent); font-weight: 500; padding-top: 0.25rem; }
  .principle h3 { margin-bottom: 0.25rem; font-size: 1.0625rem; font-weight: 600; }
  .principle p { margin-bottom: 0; color: var(--color-text-secondary); font-size: 0.9375rem; }
</style>
```

- [ ] **Step 2: Write PrincipleList**

```astro
---
// portal/src/components/silo/PrincipleList.astro
---
<div class="principle-list"><slot /></div>
<style>
  .principle-list { display: grid; gap: 2rem; margin-top: 0.5rem; }
</style>
```

- [ ] **Step 3: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/Principle.astro portal/src/components/silo/PrincipleList.astro
git commit -m "feat(portal/silo): add Principle and PrincipleList for the public landing approach section

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task C6: Create TodoBlock and AdminTable

**Files:**
- Create: `portal/src/components/silo/TodoBlock.astro`
- Create: `portal/src/components/silo/AdminTable.astro`

- [ ] **Step 1: Write TodoBlock**

```astro
---
interface Props {
  hideInProd?: boolean;
}
const { hideInProd = false } = Astro.props;
const isProd = import.meta.env.PROD;
const hidden = hideInProd && isProd;
---

{!hidden && (
  <span class="todo">
    <strong>TODO</strong>
    <slot />
  </span>
)}

<style>
  .todo {
    display: block;
    background: rgba(43, 87, 154, 0.04);
    border-left: 2px solid var(--color-accent);
    padding: 0.625rem 0.875rem;
    margin: 0.75rem 0 1.5rem 0;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-accent);
    line-height: 1.55;
  }
  .todo strong {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    margin-right: 0.5rem;
  }
</style>
```

The `hideInProd` prop lets Diego flip TODOs invisible when shipping by setting `hideInProd={true}` on each TodoBlock once content is finalized.

- [ ] **Step 2: Write AdminTable**

```astro
---
// portal/src/components/silo/AdminTable.astro
// Thin wrapper that just emits a styled table; columns and rows
// are passed in via the slot.
---
<div class="admin-table-wrap">
  <table class="admin-table">
    <slot />
  </table>
</div>

<style>
  .admin-table-wrap { overflow-x: auto; }
  .admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .admin-table th { font-weight: 600; color: var(--color-text-secondary); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--color-border); text-align: left; }
  .admin-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
  .admin-table tr:hover td { background: var(--color-bg-secondary); }
</style>
```

- [ ] **Step 3: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/TodoBlock.astro portal/src/components/silo/AdminTable.astro
git commit -m "feat(portal/silo): add TodoBlock and AdminTable

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase D — Auth lib and database migration

### Task D1: Install Supabase SSR helper

The portal currently has `@supabase/supabase-js`. For server-side cookie-based session handling in Astro middleware, we add `@supabase/ssr`.

- [ ] **Step 1: Add the dependency**

```bash
npm install -w portal @supabase/ssr
```

- [ ] **Step 2: Verify install + commit**

```bash
npm -w portal run check
git add portal/package.json package-lock.json
git commit -m "chore(portal): add @supabase/ssr for cookie-based auth

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task D2: Create supabase-server.ts

**Files:**
- Create: `portal/src/lib/supabase-server.ts`

This replaces the existing `portal/src/lib/supabase.ts`. Old service-role client is preserved here as a separate function for admin endpoints.

- [ ] **Step 1: Write the file**

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client tied to the request's cookies.
 * Use this from middleware and SSR pages to read/write the session.
 */
export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies.set(name, value, { ...options, path: options.path ?? '/' });
      },
      remove(name: string, options: CookieOptions) {
        cookies.delete(name, { ...options, path: options.path ?? '/' });
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS. Use only in admin endpoints
 * after verifying the caller is admin.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
```

- [ ] **Step 2: Delete the old `portal/src/lib/supabase.ts`**

The new file replaces it.

```bash
rm portal/src/lib/supabase.ts
```

- [ ] **Step 3: Verify nothing else still imports `lib/supabase`**

```bash
grep -rn "from.*lib/supabase'" portal/src/
```

Expected: empty (Phase A deleted all consumers — `api/waitlist.ts`, `api/admin/waitlist.ts`, `admin/waitlist.astro`).

- [ ] **Step 4: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/lib/supabase-server.ts portal/src/lib/supabase.ts
git commit -m "feat(portal/lib): add supabase-server with cookie-bound SSR client + service role admin

Replaces lib/supabase.ts (server-only) with two clients:
- createSupabaseServerClient(cookies): SSR session via @supabase/ssr
- supabaseAdmin: service-role client for admin endpoints (post-auth)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task D3: Create supabase-browser.ts

**Files:**
- Create: `portal/src/lib/supabase-browser.ts`

- [ ] **Step 1: Write the file**

```ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client. Used by the OauthButton to start the
 * OAuth handshake with `signInWithOAuth({ provider, options: { redirectTo } })`.
 */
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/lib/supabase-browser.ts
git commit -m "feat(portal/lib): add supabase-browser client for OAuth client flow

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task D4: Create personal-domains helper

**Files:**
- Create: `portal/src/lib/personal-domains.ts`

- [ ] **Step 1: Write the file**

```ts
const PERSONAL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'msn.com',
]);

/**
 * Returns the domain part of an email, lowercased, or null on parse error.
 */
export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 0 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

/**
 * True when the email's domain is a known personal provider.
 */
export function isPersonalDomain(email: string): boolean {
  const d = emailDomain(email);
  return d !== null && PERSONAL_DOMAINS.has(d);
}

/**
 * Best-effort organization extraction from an email. Returns the domain
 * for corporate emails, or null for known personal providers.
 */
export function orgFromEmail(email: string): string | null {
  const d = emailDomain(email);
  if (d === null || PERSONAL_DOMAINS.has(d)) return null;
  return d;
}
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/lib/personal-domains.ts
git commit -m "feat(portal/lib): add personal-domains helper for org extraction

Used by OauthCallback to populate access_requests.org and by OrgCell
to render personal-provider rows in muted style.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task D5: Write the Supabase migration SQL

**Files:**
- Create: `supabase/migrations/20260407_silo_gated_portal.sql`

This file is the source of truth for the database schema. It is applied via Supabase dashboard SQL editor in launch runbook Phase 2 (no Supabase CLI assumed).

- [ ] **Step 1: Create the migrations directory and write the SQL**

```bash
mkdir -p supabase/migrations
```

Then create `supabase/migrations/20260407_silo_gated_portal.sql`:

```sql
-- Silo gated portal schema
-- Spec: docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md
-- Apply via Supabase dashboard SQL editor.

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'reviewer'
                    CHECK (role IN ('reviewer', 'admin')),
  welcomed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self_read"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_self_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_read_all"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- access_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS access_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  name            text,
  avatar_url      text,
  provider        text NOT NULL CHECK (provider IN ('google', 'github')),
  github_handle   text,
  org             text,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  approved_at     timestamptz,
  approved_by     uuid REFERENCES auth.users(id),
  notes           text
);

CREATE INDEX IF NOT EXISTS idx_access_requests_status
  ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at
  ON access_requests(created_at DESC);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_requests_self_read"
  ON access_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "access_requests_admin_all"
  ON access_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- dd_views
-- ============================================================
CREATE TABLE IF NOT EXISTS dd_views (
  id              bigserial PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  page            text NOT NULL,
  ip              inet,
  user_agent      text,
  viewed_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dd_views_user_id
  ON dd_views(user_id);
CREATE INDEX IF NOT EXISTS idx_dd_views_viewed_at
  ON dd_views(viewed_at DESC);

ALTER TABLE dd_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dd_views_admin_only"
  ON dd_views FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- updated_at trigger for access_requests
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS access_requests_updated_at ON access_requests;
CREATE TRIGGER access_requests_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- profile auto-creation on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (NEW.id, 'reviewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

- [ ] **Step 2: Stage and commit**

```bash
git add supabase/migrations/20260407_silo_gated_portal.sql
git commit -m "feat(db): silo gated portal migration — profiles, access_requests, dd_views

Includes RLS policies, updated_at trigger, and auto-creation of
profiles row on auth.users insert. Applied via Supabase dashboard
SQL editor in launch runbook Phase 2.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase E — Auth-dependent components + middleware + auth endpoints

### Task E1: Create OauthButton

**Files:**
- Create: `portal/src/components/silo/OauthButton.astro`

- [ ] **Step 1: Write the file**

```astro
---
interface Props {
  provider: 'google' | 'github';
  label?: string;
}
const { provider, label = provider === 'google' ? 'Continue with Google' : 'Continue with GitHub' } = Astro.props;
---

<button
  type="button"
  class="oauth-btn"
  data-provider={provider}
>
  {provider === 'google' && (
    <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )}
  {provider === 'github' && (
    <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.57v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.52.12-3.18 0 0 1.01-.32 3.31 1.23a11.5 11.5 0 0 1 6.02 0c2.3-1.55 3.31-1.23 3.31-1.23.66 1.66.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .31.21.69.83.57A12 12 0 0 0 12 .3" />
    </svg>
  )}
  <span>{label}</span>
</button>

<script>
  import { supabaseBrowser } from '../../lib/supabase-browser';

  document.querySelectorAll<HTMLButtonElement>('button.oauth-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const provider = btn.dataset.provider as 'google' | 'github';
      btn.disabled = true;
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        btn.disabled = false;
        alert('Sign-in failed: ' + error.message);
      }
    });
  });
</script>

<style>
  .oauth-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1.25rem;
    border: 1px solid var(--color-border-active);
    border-radius: 4px;
    background: var(--color-bg);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;
  }
  .oauth-btn:hover { background: var(--color-text); color: var(--color-bg); }
  .oauth-btn:disabled { opacity: 0.6; cursor: wait; }
  .oauth-btn .icon { width: 1rem; height: 1rem; flex-shrink: 0; }
</style>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/OauthButton.astro
git commit -m "feat(portal/silo): add OauthButton with Google + GitHub providers

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task E2: Create OrgCell

**Files:**
- Create: `portal/src/components/silo/OrgCell.astro`

- [ ] **Step 1: Write the file**

```astro
---
import { isPersonalDomain, emailDomain } from '../../lib/personal-domains';

interface Props {
  email: string;
  org?: string | null;
}
const { email, org } = Astro.props;
const personal = isPersonalDomain(email);
const display = org ?? emailDomain(email) ?? 'unknown';
---

<span class:list={['org-cell', { personal }]}>{display}</span>

<style>
  .org-cell {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }
  .org-cell.personal {
    color: var(--color-text-muted);
    font-style: italic;
  }
</style>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/OrgCell.astro
git commit -m "feat(portal/silo): add OrgCell — muted style for personal-domain emails

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task E3: Create WelcomeCard

**Files:**
- Create: `portal/src/components/silo/WelcomeCard.astro`

- [ ] **Step 1: Write the file**

```astro
---
interface Props {
  name: string;
}
const { name } = Astro.props;
---

<div class="welcome-card" id="welcome-card">
  <h2>Welcome, {name}.</h2>
  <p>
    The data room is structured as 7 chapters meant to be read in order.
    Total reading time is roughly 30 minutes. Start with
    <a href="/inside/thesis">Thesis →</a>.
  </p>
  <button type="button" id="welcome-dismiss">Got it</button>
</div>

<script>
  const card = document.getElementById('welcome-card');
  const btn = document.getElementById('welcome-dismiss');
  if (card && btn) {
    btn.addEventListener('click', async () => {
      card.style.display = 'none';
      try {
        await fetch('/api/auth/welcome', { method: 'PATCH' });
      } catch (e) {
        // best-effort; silent on failure
      }
    });
  }
</script>

<style>
  .welcome-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 2rem 2.25rem;
    margin: 2rem 0 3rem 0;
  }
  .welcome-card h2 {
    font-size: 1.375rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  .welcome-card p {
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  .welcome-card a {
    color: var(--color-text);
    border-bottom: 1px solid var(--color-border);
  }
  .welcome-card a:hover {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
  }
  .welcome-card button {
    background: none;
    border: 1px solid var(--color-border-active);
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text);
    cursor: pointer;
    transition: background-color 0.15s;
  }
  .welcome-card button:hover {
    background: var(--color-text);
    color: var(--color-bg);
  }
</style>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/components/silo/WelcomeCard.astro
git commit -m "feat(portal/silo): add WelcomeCard for /inside first-visit

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task E4: Create middleware.ts

**Files:**
- Create: `portal/src/middleware.ts`

- [ ] **Step 1: Write the file**

```ts
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

const PUBLIC_PATHS = new Set<string>([
  '/',
  '/about',
  '/sign-in',
  '/contact',
  '/privacy',
  '/terms',
  '/data-retention',
]);

const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/_astro/',
  '/fonts/',
  '/about/',
  '/favicon',
  '/logo',
  '/robots',
  '/sitemap',
];

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.has(path)) return true;
  return PUBLIC_PREFIXES.some((p) => path.startsWith(p));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (isPublic(path)) {
    return next();
  }

  const supabase = createSupabaseServerClient(context.cookies);
  const { data: { session } } = await supabase.auth.getSession();

  // Pending page is for authenticated users only
  if (path === '/pending') {
    if (!session) return context.redirect('/sign-in');
    return next();
  }

  // /inside/* requires approved status
  if (path.startsWith('/inside')) {
    if (!session) return context.redirect('/sign-in');
    const { data: req } = await supabase
      .from('access_requests')
      .select('status')
      .eq('user_id', session.user.id)
      .single();
    if (!req || req.status !== 'approved') {
      return context.redirect('/pending');
    }
    // Surface a flag for the page to log the view
    context.locals.shouldLogView = true;
    context.locals.userId = session.user.id;
    context.locals.userEmail = session.user.email ?? '';
    return next();
  }

  // /admin/* requires admin role
  if (path.startsWith('/admin')) {
    if (!session) return context.redirect('/sign-in');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return context.redirect('/');
    }
    context.locals.userId = session.user.id;
    context.locals.userEmail = session.user.email ?? '';
    return next();
  }

  return next();
});
```

- [ ] **Step 2: Add `Astro.locals` types**

Create or update `portal/src/env.d.ts`:

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    shouldLogView?: boolean;
    userId?: string;
    userEmail?: string;
  }
}
```

If `portal/src/env.d.ts` already exists, merge the `App.Locals` declaration into it.

- [ ] **Step 3: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/middleware.ts portal/src/env.d.ts
git commit -m "feat(portal/middleware): gate /inside and /admin behind Supabase Auth

Public paths whitelist + per-path role/status checks. Sets locals.shouldLogView
for /inside/* pages to trigger view logging without blocking the response.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task E5: Create /api/auth/callback.ts

**Files:**
- Create: `portal/src/pages/api/auth/callback.ts`

- [ ] **Step 1: Write the file**

```ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createSupabaseServerClient, supabaseAdmin } from '../../../lib/supabase-server';
import { orgFromEmail } from '../../../lib/personal-domains';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return redirect('/sign-in?error=missing_code');
  }

  const supabase = createSupabaseServerClient(cookies);
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return redirect('/sign-in?error=exchange_failed');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in?error=no_user');
  }

  const email = user.email ?? '';
  const meta = user.user_metadata ?? {};
  const provider = (user.app_metadata?.provider ?? 'google') as 'google' | 'github';
  const name = (meta.full_name ?? meta.name ?? meta.user_name ?? email) as string;
  const avatarUrl = (meta.avatar_url ?? meta.picture ?? null) as string | null;
  const githubHandle = provider === 'github' ? ((meta.user_name ?? meta.preferred_username ?? null) as string | null) : null;
  const org = orgFromEmail(email);

  // Upsert access_request — only insert sets status='pending'; existing rows keep their status
  const { data: existing } = await supabaseAdmin
    .from('access_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin.from('access_requests').insert({
      user_id: user.id,
      email,
      name,
      avatar_url: avatarUrl,
      provider,
      github_handle: githubHandle,
      org,
      status: 'pending',
    });

    // Notify Diego of the new request (best-effort)
    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.DIEGO_NOTIFY_EMAIL ?? 'diego@sens.legal';
    const fromAddr = process.env.RESEND_FROM_EMAIL ?? 'silo@sens.legal';
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: fromAddr,
          to: notifyTo,
          subject: `New Silo data room access request — ${name}`,
          text: `${name} <${email}> requested access via ${provider}.\nOrg: ${org ?? '(personal)'}\nReview at https://sens.legal/admin/access`,
        });
      } catch {
        // ignore — best effort
      }
    }
  } else {
    // Refresh metadata in case the user updated avatar/name
    await supabaseAdmin
      .from('access_requests')
      .update({ name, avatar_url: avatarUrl, github_handle: githubHandle, org })
      .eq('id', existing.id);
  }

  // Decide where to send them
  const { data: req } = await supabaseAdmin
    .from('access_requests')
    .select('status')
    .eq('user_id', user.id)
    .single();

  if (req?.status === 'approved') {
    return redirect('/inside');
  }
  return redirect('/pending');
};
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/api/auth/callback.ts
git commit -m "feat(portal/auth): OAuth callback — exchange code, upsert access_request, notify

Inserts access_requests row with status=pending on first sign-in.
Subsequent sign-ins refresh metadata but never overwrite status.
Notifies Diego via Resend on first request.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task E6: Create /api/auth/sign-out.ts and /api/auth/welcome.ts

**Files:**
- Create: `portal/src/pages/api/auth/sign-out.ts`
- Create: `portal/src/pages/api/auth/welcome.ts`

- [ ] **Step 1: Write sign-out**

```ts
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const supabase = createSupabaseServerClient(cookies);
  await supabase.auth.signOut();
  return redirect('/');
};
```

- [ ] **Step 2: Write welcome**

```ts
import type { APIRoute } from 'astro';
import { createSupabaseServerClient, supabaseAdmin } from '../../../lib/supabase-server';

export const prerender = false;

export const PATCH: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  await supabaseAdmin
    .from('profiles')
    .update({ welcomed_at: new Date().toISOString() })
    .eq('id', user.id);
  return new Response(null, { status: 204 });
};
```

- [ ] **Step 3: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/api/auth/sign-out.ts portal/src/pages/api/auth/welcome.ts
git commit -m "feat(portal/auth): add sign-out and welcome dismissal endpoints

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase F — Public pages and legal page updates

### Task F1: Rewrite /index.astro as the public landing

**Files:**
- Modify: `portal/src/pages/index.astro` (rewrite the placeholder from Task A5 Step 8)

This is the public landing — mirrors `docs/design-mockups/public-home-mockup.html`. Final copy is authored by Diego in a follow-up; this commit lays down the structure with `<TodoBlock>` markers and the actual proof rows from `constants.ts`.

- [ ] **Step 1: Write the file**

```astro
---
import PublicLayout from '../layouts/PublicLayout.astro';
import ProofRow from '../components/silo/ProofRow.astro';
import SectionLabel from '../components/silo/SectionLabel.astro';
import PrincipleList from '../components/silo/PrincipleList.astro';
import Principle from '../components/silo/Principle.astro';
import OauthButton from '../components/silo/OauthButton.astro';
import TodoBlock from '../components/silo/TodoBlock.astro';
import { proofPoints } from '../data/constants';

const description = 'Verifiable legal reasoning. Silo grounds frontier models in a knowledge graph of how courts actually decide.';
---

<PublicLayout title="Silo" description={description}>
  <section class="hero">
    <span class="pre-label">Silo<span class="dot">·</span>Legal Intelligence</span>
    <h1>Verifiable<br />legal reasoning.</h1>
    <p class="lede">
      Frontier models hallucinate citations and offer no audit trail.
      Silo grounds them in a knowledge graph of how courts actually decide —
      and shows its work.
    </p>
    <TodoBlock>Tighten or replace the lede in Diego's voice. ~2 lines max.</TodoBlock>
  </section>

  <section>
    <SectionLabel>What's running today</SectionLabel>
    {proofPoints.map((p) => (
      <ProofRow value={p.value} label={p.label} />
    ))}
    <TodoBlock>Add `source` field per row when constants.ts is updated with provenance — e.g., "live · Apr 2026", "Neo4j Aura", "schema v2.1".</TodoBlock>
  </section>

  <section id="approach">
    <SectionLabel>Approach</SectionLabel>

    <p>
      Silo is built on the bet that the unit of legal reasoning is the
      relationship between decisions, not the text of any single one.
      Vector retrieval finds passages that look similar to a query. It
      cannot answer the questions a litigator actually asks: which
      precedents bind this court, which decisions overrule which, which
      arguments tend to win when the panel includes these justices.
    </p>

    <PrincipleList>
      <Principle number="01" title="Better than an LLM-only workflow">
        Silo does not compete with frontier models. It amplifies them with
        structured legal data, case context, and traceable evidence the
        model alone does not have.
      </Principle>
      <Principle number="02" title="Traceability before fluency">
        A good legal answer must allow inspection. Every output points back
        to where it came from — what was retrieved, what was derived, what
        was assumed.
      </Principle>
      <Principle number="03" title="One product, specialized gears">
        For users and observers, there is one product: Silo. Internally,
        the work is organized into specialized modules — main interface,
        intelligence engine, legislative grounding, document intelligence,
        evaluation layer.
      </Principle>
      <Principle number="04" title="Utility before feature volume">
        The focus is to solve real legal workflow pain points, not to pile
        up AI features with low adoption.
      </Principle>
    </PrincipleList>
    <TodoBlock>Diego: confirm voice on these 4 principles, edit if needed.</TodoBlock>
  </section>

  <section id="about">
    <SectionLabel>About</SectionLabel>
    <h2>A practicing lawyer, building the workflow he wished existed.</h2>
    <p>
      Silo is built by Diego Sens, a Brazilian corporate and litigation
      attorney writing the system from inside a working firm.
    </p>
    <TodoBlock>Diego: 1-2 more sentences in your voice. End with subtle invitation to /about.</TodoBlock>
  </section>

  <section class="cta" id="cta">
    <div class="cta-card">
      <h2>Investors and partners evaluating Silo</h2>
      <p>
        Sign in to request access to the technical data room. We approve
        manually, usually within a day.
      </p>
      <div class="cta-buttons">
        <OauthButton provider="google" />
        <OauthButton provider="github" />
      </div>
      <p class="cta-fineprint">
        By signing in, you agree to the <a href="/privacy">privacy policy</a> and
        <a href="/terms">terms</a>. We do not require an organization, NDA, or
        sales call.
      </p>
    </div>
  </section>
</PublicLayout>

<style>
  .hero { padding: 6rem 0 4rem 0; }
  .hero .pre-label { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-text-muted); margin-bottom: 1.5rem; display: block; }
  .hero .pre-label .dot { color: var(--color-accent); margin: 0 0.5rem; }
  .hero h1 { font-size: 3.25rem; font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; margin-bottom: 1.25rem; }
  .hero .lede { font-size: 1.1875rem; line-height: 1.55; color: var(--color-text-secondary); margin-bottom: 0; max-width: 34rem; }

  section { padding: 4rem 0; border-top: 1px solid var(--color-border); }
  section h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; }
  section p { margin-bottom: 1.25rem; }

  .cta { padding: 5rem 0 6rem 0; }
  .cta-card { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 6px; padding: 2.5rem 2.25rem; }
  .cta-card h2 { font-size: 1.625rem; margin-bottom: 0.75rem; }
  .cta-card p { color: var(--color-text-secondary); max-width: 30rem; margin-bottom: 2rem; }
  .cta-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .cta-fineprint { margin-top: 1.5rem; font-size: 0.8125rem; color: var(--color-text-muted); line-height: 1.55; }
  .cta-fineprint a { color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); }
  .cta-fineprint a:hover { color: var(--color-text); border-bottom-color: var(--color-text); }
</style>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/index.astro
git commit -m "feat(portal/pages): rewrite / as the editorial public landing

Replaces the placeholder from Phase A. Hero + proof rows + 4-principle
approach + about teaser + OAuth CTA card. Final copy is authored by
Diego in a follow-up; structure and TODO markers in place.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task F2: Create /about.astro

**Files:**
- Create: `portal/src/pages/about.astro`

- [ ] **Step 1: Write the file**

```astro
---
import PublicLayout from '../layouts/PublicLayout.astro';
import SectionLabel from '../components/silo/SectionLabel.astro';
import TodoBlock from '../components/silo/TodoBlock.astro';
---

<PublicLayout title="About" description="A practicing lawyer building Silo from inside a working firm.">
  <section class="about-page">
    <SectionLabel>About</SectionLabel>

    <div class="about-header">
      <img src="/about/diego.png" alt="Diego Sens" class="portrait" />
      <div>
        <h1>Diego Sens</h1>
        <p class="role">Founder, Silo</p>
      </div>
    </div>

    <p>
      Silo is built by Diego Sens, a Brazilian corporate and litigation
      attorney writing the system from inside a working firm. The product
      reflects what a real practice needs from AI — not what a generic
      chatbot can plausibly demo.
    </p>

    <TodoBlock>Diego: write 2-3 paragraphs about your bar background, the moment you decided to build Silo, and why a practicing lawyer is the right person to build this.</TodoBlock>

    <h2>Why a practitioner, not a generalist</h2>
    <TodoBlock>Diego: 1-2 paragraphs on the insight asymmetry — what a practicing lawyer sees that a generalist tech founder cannot.</TodoBlock>

    <h2>Current phase</h2>
    <p>
      Silo is in private build and validation. Foundations are focused on
      densification of the knowledge graph in the corporate and M&A niche.
    </p>
    <TodoBlock>Diego: short paragraph naming a current concrete focus or recent milestone.</TodoBlock>
  </section>
</PublicLayout>

<style>
  .about-page { padding: 6rem 0 4rem 0; }
  .about-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
  .portrait { width: 5rem; height: 5rem; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-border); }
  .about-header h1 { font-size: 2.25rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.25rem; line-height: 1.1; }
  .about-header .role { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin: 0; }

  .about-page h2 { font-size: 1.375rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1rem; }
  .about-page p { margin-bottom: 1.25rem; }
</style>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/about.astro
git commit -m "feat(portal/pages): add /about with diego.png and TODO scaffolding

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task F3: Create /contact.astro

**Files:**
- Create: `portal/src/pages/contact.astro`

- [ ] **Step 1: Write the file**

```astro
---
import PublicLayout from '../layouts/PublicLayout.astro';
import SectionLabel from '../components/silo/SectionLabel.astro';
---

<PublicLayout title="Contact" description="One email for everything.">
  <section class="contact-page">
    <SectionLabel>Contact</SectionLabel>
    <h1>One email.</h1>
    <p>
      No form, no chat widget, no sales funnel. Write to
      <a href="mailto:diego@sens.legal">diego@sens.legal</a> and you'll hear back.
    </p>
    <p class="fineprint">
      For data room access, sign in at <a href="/sign-in">sens.legal/sign-in</a> instead — it's
      faster and gives us your identity automatically.
    </p>
  </section>
</PublicLayout>

<style>
  .contact-page { padding: 6rem 0 4rem 0; }
  .contact-page h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1.25rem; }
  .contact-page p { margin-bottom: 1.25rem; }
  .contact-page p a { color: var(--color-text); border-bottom: 1px solid var(--color-border); }
  .contact-page p a:hover { color: var(--color-accent); border-bottom-color: var(--color-accent); }
  .fineprint { font-size: 0.875rem; color: var(--color-text-muted); }
</style>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/contact.astro
git commit -m "feat(portal/pages): add /contact — single mailto, no form

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task F4: Create /sign-in.astro and /pending.astro

**Files:**
- Create: `portal/src/pages/sign-in.astro`
- Create: `portal/src/pages/pending.astro`

- [ ] **Step 1: Write sign-in**

```astro
---
import MinimalLayout from '../layouts/MinimalLayout.astro';
import OauthButton from '../components/silo/OauthButton.astro';

const error = Astro.url.searchParams.get('error');
const errorMessages: Record<string, string> = {
  missing_code: 'Sign-in did not complete. Please try again.',
  exchange_failed: 'Sign-in could not be verified. Please try again.',
  no_user: 'Sign-in succeeded but no profile was found. Please contact diego@sens.legal.',
};
const errorMsg = error ? (errorMessages[error] ?? 'Sign-in error.') : null;
---

<MinimalLayout title="Sign in">
  <div class="signin-card">
    <h1>Sign in</h1>
    <p>
      Signing in tells us who you are and creates a request to access the
      Silo technical data room. We review every request manually, usually
      within a day.
    </p>

    {errorMsg && <p class="error">{errorMsg}</p>}

    <div class="buttons">
      <OauthButton provider="google" />
      <OauthButton provider="github" />
    </div>

    <p class="fineprint">
      By signing in, you agree to the <a href="/privacy">privacy policy</a> and
      <a href="/terms">terms</a>.
    </p>
  </div>
</MinimalLayout>

<style>
  .signin-card { max-width: 26rem; }
  .signin-card h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1rem; }
  .signin-card p { color: var(--color-text-secondary); margin-bottom: 1.5rem; line-height: 1.6; }
  .signin-card .error { color: #8a1a1a; background: rgba(138, 26, 26, 0.06); border-left: 2px solid #8a1a1a; padding: 0.75rem 1rem; border-radius: 3px; font-size: 0.875rem; }
  .signin-card .buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem; }
  .signin-card .fineprint { font-size: 0.75rem; color: var(--color-text-muted); }
  .signin-card .fineprint a { color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); }
</style>
```

- [ ] **Step 2: Write pending**

```astro
---
import MinimalLayout from '../layouts/MinimalLayout.astro';
import { createSupabaseServerClient } from '../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase
  .from('access_requests')
  .select('status, name, email')
  .eq('user_id', user?.id ?? '')
  .maybeSingle();

const status = req?.status ?? 'pending';
const name = req?.name ?? user?.user_metadata?.name ?? 'there';
const email = req?.email ?? user?.email ?? '';
---

<MinimalLayout title="Pending">
  <div class="pending-card">
    {status === 'pending' && (
      <>
        <h1>Thanks, {name}.</h1>
        <p>
          Your request to access the Silo technical data room is under
          review. We'll email <strong>{email}</strong> when it's approved,
          usually within a day.
        </p>
        <p class="fineprint">
          You can close this tab. There's nothing else to do on your end.
        </p>
      </>
    )}
    {status === 'rejected' && (
      <>
        <h1>Request not accepted.</h1>
        <p>
          Your request to access the Silo data room was not accepted at
          this time. If you believe this is a mistake, write to
          <a href="mailto:diego@sens.legal"> diego@sens.legal</a>.
        </p>
      </>
    )}
    {status === 'approved' && (
      <>
        <h1>You're in.</h1>
        <p>Head to <a href="/inside">the data room →</a></p>
      </>
    )}
    <form method="POST" action="/api/auth/sign-out" class="signout">
      <button type="submit">Sign out</button>
    </form>
  </div>
</MinimalLayout>

<style>
  .pending-card { max-width: 26rem; text-align: center; }
  .pending-card h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1.25rem; }
  .pending-card p { color: var(--color-text-secondary); margin-bottom: 1.5rem; line-height: 1.6; }
  .pending-card p strong { color: var(--color-text); font-weight: 600; }
  .pending-card .fineprint { font-size: 0.875rem; color: var(--color-text-muted); }
  .pending-card a { color: var(--color-text); border-bottom: 1px solid var(--color-border); }
  .pending-card a:hover { color: var(--color-accent); border-bottom-color: var(--color-accent); }
  .signout { margin-top: 2rem; }
  .signout button { background: none; border: 1px solid var(--color-border); border-radius: 4px; padding: 0.5rem 1rem; font-family: var(--font-sans); font-size: 0.8125rem; color: var(--color-text-secondary); cursor: pointer; }
  .signout button:hover { color: var(--color-text); border-color: var(--color-border-active); }
</style>
```

- [ ] **Step 3: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/sign-in.astro portal/src/pages/pending.astro
git commit -m "feat(portal/pages): add /sign-in and /pending

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task F5: Migrate /privacy, /terms, /data-retention to LegalLayout

**Files:**
- Modify: `portal/src/pages/privacy.astro`
- Modify: `portal/src/pages/terms.astro`
- Modify: `portal/src/pages/data-retention.astro`

The goal: switch from `DocsLayout` to `LegalLayout`, add OAuth + tracking clauses to privacy, add `dd_views` retention to data-retention. Existing copy is mostly preserved — only the layout import and frontmatter change, plus new sections.

- [ ] **Step 0: Read existing legal pages to capture body content**

```bash
cat portal/src/pages/privacy.astro
cat portal/src/pages/terms.astro
cat portal/src/pages/data-retention.astro
```

Save the body content (everything between `<DocsLayout ...>` opening tag and `</DocsLayout>` closing tag) for each file. The body is preserved verbatim in Steps 1-3 except for the specific additions noted.

- [ ] **Step 1: Update `portal/src/pages/privacy.astro`**

Change the frontmatter:

```astro
---
import LegalLayout from '../layouts/LegalLayout.astro';
---

<LegalLayout title="Privacy Policy" description="How Silo handles service data, request telemetry, uploaded content, and support requests." lastUpdated="2026-04-07">
  <p>Silo is operated by Diego Sens. This page explains, at a high level, what data Silo processes, why it is processed, and how to request support or deletion.</p>

  <h2>Authentication and access requests</h2>
  <p>The sens.legal portal is gated. To request access to the technical data room, you sign in via Google or GitHub OAuth. When you sign in, Silo receives:</p>
  <ul>
    <li>your email address (verified by the OAuth provider);</li>
    <li>your display name and avatar URL as provided by the OAuth provider;</li>
    <li>your provider identity (Google account ID or GitHub user handle);</li>
    <li>a session cookie that keeps you signed in to sens.legal.</li>
  </ul>
  <p>This data is stored in a row in the <code>access_requests</code> table on Silo's Supabase project. Diego reviews each request manually and either approves or leaves it pending.</p>

  <h2>Data room view tracking</h2>
  <p>When you visit a page under <code>/inside/*</code> (the data room), Silo logs a row in the <code>dd_views</code> table containing your user ID, email, the page path, your IP address, your user-agent, and a timestamp. This is used to understand how reviewers engage with the data room. It is not shared with third parties.</p>

  <h2>What data Silo may process</h2>
  <p>Depending on the feature you use, Silo may process:</p>
  <ul>
    <li>access and integration data, such as API keys, scope information, client identifiers, and marketplace auth metadata when enabled for a deployment;</li>
    <li>request telemetry, such as timestamps, IP address, user agent, route or tool name, latency, and <code>trace_id</code>;</li>
    <li>user-submitted content, such as search queries, prompts, uploaded PDFs, workflow payloads, memories, and conversation content;</li>
    <li>generated workflow artifacts, such as extracted text, structured analysis outputs, and review records;</li>
    <li>operational and security events, such as authentication failures, rate-limit events, and audit records.</li>
  </ul>

  <h2>Why this data is processed</h2>
  <!-- PRESERVE: paste the existing privacy.astro content from "Why this data is processed" through the end of the file's body, dropping only the original closing </DocsLayout> tag. -->

  <h2>Requesting deletion</h2>
  <p>To delete your access_requests and dd_views rows, write to <a href="mailto:diego@sens.legal">diego@sens.legal</a> with the subject "Silo data deletion".</p>
</LegalLayout>
```

**Important:** preserve the rest of the existing `privacy.astro` body content. The ellipsis `(... preserve ...)` above means the human/agent applying this step keeps all paragraphs and headings from the current file that are not explicitly being added. Only the layout import, frontmatter, and the 3 new sections (Authentication, View tracking, Requesting deletion) are new.

- [ ] **Step 2: Update `portal/src/pages/terms.astro`**

Change only the frontmatter import + the LegalLayout wrapper. No copy changes required for terms.

```astro
---
import LegalLayout from '../layouts/LegalLayout.astro';
---

<LegalLayout title="Terms of Use" description="Rules and limits for using Silo's API, MCP tools, and workflow features." lastUpdated="2026-04-07">
  <!-- PRESERVE: paste the entire body from the existing terms.astro between <DocsLayout> and </DocsLayout> tags. No copy changes. -->
</LegalLayout>
```

- [ ] **Step 3: Update `portal/src/pages/data-retention.astro`**

```astro
---
import LegalLayout from '../layouts/LegalLayout.astro';
---

<LegalLayout title="Data Retention Policy" description="Operational retention guidance for logs, memories, conversations, workflow artifacts, support records, and data room view logs." lastUpdated="2026-04-07">
  <p>This page explains how Silo approaches data retention at an operational level. Exact retention can vary by deployment, contract, or legal hold, but the categories below describe the default model used by the product.</p>

  <h2>Data room access requests and view logs</h2>
  <p>Two new categories were added with the gated portal launch:</p>
  <table>
    <thead>
      <tr><th>Category</th><th>Default retention</th></tr>
    </thead>
    <tbody>
      <tr><td><code>access_requests</code> — sign-in identity and approval status</td><td>Retained while the portal is operational; deleted on user request.</td></tr>
      <tr><td><code>dd_views</code> — per-page view logs of reviewers</td><td>Retained for 12 months from the date of view, then anonymized (user_id and IP cleared).</td></tr>
    </tbody>
  </table>

  <h2>Retention model by category</h2>
  <!-- PRESERVE: paste the existing data-retention.astro body from "Retention model by category" through the end. The new "Data room access requests and view logs" section above is added before this preserved block. -->
</LegalLayout>
```

- [ ] **Step 4: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/privacy.astro portal/src/pages/terms.astro portal/src/pages/data-retention.astro
git commit -m "feat(portal/legal): migrate legal pages to LegalLayout + add OAuth/tracking clauses

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task F6: Delete the now-unused DocsLayout

**Files:**
- Delete: `portal/src/layouts/DocsLayout.astro`

- [ ] **Step 1: Verify nothing imports DocsLayout anymore**

```bash
grep -rn "DocsLayout" portal/src/
```

Expected: empty.

- [ ] **Step 2: Delete + verify build + commit**

```bash
rm portal/src/layouts/DocsLayout.astro
npm -w portal run check && npm -w portal run build
git add portal/src/layouts/DocsLayout.astro
git commit -m "chore(portal/layouts): drop DocsLayout — all consumers migrated

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase G — Inside pages (data room scaffolds)

All inside pages are scaffolds — structure, headings, components, and `<TodoBlock>` markers. Final copy is authored by Diego in a follow-up. Pages that have a corpus in `docs/legacy/silo-site/` reference it via inline HTML comments so Diego has the source material at hand.

### Task G1: Create /inside/index.astro (landing)

**Files:**
- Create: `portal/src/pages/inside/index.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import WelcomeCard from '../../components/silo/WelcomeCard.astro';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase
  .from('access_requests')
  .select('name')
  .eq('user_id', user!.id)
  .single();
const { data: profile } = await supabase
  .from('profiles')
  .select('welcomed_at')
  .eq('id', user!.id)
  .single();

const viewerName = req?.name ?? user?.email ?? 'reviewer';
const showWelcome = !profile?.welcomed_at;

const chapters = [
  { num: '01', slug: 'thesis', label: 'Thesis', summary: 'What we are building, in five minutes.' },
  { num: '02', slug: 'system', label: 'System', summary: 'Architecture, data flow, the syllogism graph.' },
  { num: '03', slug: 'proof', label: 'Proof', summary: 'What is running today — numbers, traces.' },
  { num: '04', slug: 'depth', label: 'Depth', summary: 'Deep dives into the hard problems.' },
  { num: '05', slug: 'decisions', label: 'Decisions', summary: 'ADRs, premortems, why we chose X.' },
  { num: '06', slug: 'roadmap', label: 'Roadmap & Risks', summary: 'What is next; what could go wrong.' },
  { num: '07', slug: 'team', label: 'Team & Velocity', summary: 'Who decides, how fast we ship.' },
];
---

<InsideLayout title="Data Room" chapter="01" viewerName={viewerName} next={{ num: '01', title: 'Thesis', href: '/inside/thesis' }}>
  {showWelcome && <WelcomeCard name={viewerName.split(' ')[0] ?? viewerName} />}

  <h1>Silo Technical Data Room</h1>
  <p class="lede">
    Seven chapters meant to be read in order. Total reading time is roughly
    30 minutes. You can also read each chapter in isolation — they cross-link
    where it helps but each stands on its own.
  </p>

  <div class="chapter-grid">
    {chapters.map((c) => (
      <a class="chapter-card" href={`/inside/${c.slug}`}>
        <span class="num">{c.num}</span>
        <span class="title">{c.label}</span>
        <span class="summary">{c.summary}</span>
      </a>
    ))}
  </div>
</InsideLayout>

<style>
  .lede { font-size: 1.0625rem; color: var(--color-text-secondary); margin-bottom: 2.5rem; line-height: 1.55; max-width: 36rem; }
  .chapter-grid { display: grid; gap: 0.75rem; margin-top: 1rem; }
  .chapter-card { display: grid; grid-template-columns: 3rem 1fr; gap: 1rem; padding: 1.25rem 1.5rem; border: 1px solid var(--color-border); border-radius: 4px; text-decoration: none; transition: border-color 0.15s; }
  .chapter-card:hover { border-color: var(--color-border-active); border-bottom-color: var(--color-border-active); }
  .chapter-card .num { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent); font-weight: 600; padding-top: 0.25rem; }
  .chapter-card .title { font-weight: 600; font-size: 1.0625rem; color: var(--color-text); display: block; }
  .chapter-card .summary { color: var(--color-text-secondary); font-size: 0.875rem; grid-column: 2; display: block; margin-top: 0.125rem; }
</style>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/index.astro
git commit -m "feat(portal/inside): landing with personalized welcome and 7-chapter grid

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task G2: Create /inside/thesis.astro

**Files:**
- Create: `portal/src/pages/inside/thesis.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import PageLede from '../../components/silo/PageLede.astro';
import TodoBlock from '../../components/silo/TodoBlock.astro';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase.from('access_requests').select('name').eq('user_id', user!.id).single();
const viewerName = req?.name ?? '';
---

{/*
  CORPUS REFERENCE — docs/legacy/silo-site/product-overview.md
  Use as raw material for the final copy. Don't paste verbatim;
  rewrite in editorial voice for an investor DD reader.
*/}

<InsideLayout
  title="Thesis"
  chapter="01"
  viewerName={viewerName}
  next={{ num: '02', title: 'System', href: '/inside/system' }}
>
  <h1>{/* TODO: 4-6 word headline naming the bet */}</h1>
  <PageLede>{/* TODO: 2 sentences naming the wedge and what's contrarian about it */}</PageLede>

  <h2>The problem</h2>
  <TodoBlock>2-3 paragraphs distilling the legal workflow pain. Use silo-site product-overview.md "Problem" section as starting material — but tighten for a DD reader who has 5 minutes.</TodoBlock>

  <h2>What Silo bets on</h2>
  <TodoBlock>3 paragraphs: (1) the unit of legal reasoning is relationships between decisions, not similarity of text; (2) traceability is non-negotiable; (3) the moat is the graph + the practitioner-built taxonomy.</TodoBlock>

  <h2>Why this bet beats vector retrieval</h2>
  <TodoBlock>1-2 paragraphs explaining why graph + structure beats RAG for litigation. Concrete example helps.</TodoBlock>

  <h2>Where to go next</h2>
  <p>
    For the architecture and data flow that delivers on this bet, continue to
    <a href="/inside/system">02 · System</a>. For the live numbers and a
    recorded trace, jump to <a href="/inside/proof">03 · Proof</a>.
  </p>
</InsideLayout>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/thesis.astro
git commit -m "feat(portal/inside): scaffold 01 · Thesis chapter

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task G3: Create /inside/system.astro

**Files:**
- Create: `portal/src/pages/inside/system.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import PageLede from '../../components/silo/PageLede.astro';
import TodoBlock from '../../components/silo/TodoBlock.astro';
import Diagram from '../../components/silo/Diagram.astro';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase.from('access_requests').select('name').eq('user_id', user!.id).single();
const viewerName = req?.name ?? '';
---

{/*
  CORPUS REFERENCE — docs/legacy/silo-site/architecture.md
  Includes a Mermaid diagram and per-layer descriptions.
  For the SVG diagram referenced below, render the Mermaid source from
  docs/legacy/silo-site/architecture.md to docs/design-mockups/silo-system.svg
  before merging this PR (or ship Diego a Figma export).
*/}

<InsideLayout
  title="System"
  chapter="02"
  viewerName={viewerName}
  prev={{ num: '01', title: 'Thesis', href: '/inside/thesis' }}
  next={{ num: '03', title: 'Proof', href: '/inside/proof' }}
>
  <h1>The system in five minutes</h1>
  <PageLede>{/* TODO: 2 sentences orienting the reader for the architecture walk */}</PageLede>

  <h2>Why a graph, not a vector store</h2>
  <TodoBlock>2 paragraphs: vectors find similar passages, graphs answer the actual litigator questions. Concrete examples.</TodoBlock>

  <h2>Architecture, end to end</h2>
  <TodoBlock>Render the Mermaid diagram from docs/legacy/silo-site/architecture.md as SVG to /diagrams/silo-system.svg, then enable the Diagram component below.</TodoBlock>
  {/* <Diagram src="/diagrams/silo-system.svg" caption="Pipeline → Graph → Surfaces (sourced from silo-site/architecture.md)" /> */}

  <h2>What each layer does</h2>
  <TodoBlock>5 short subsections — Main interface, Intelligence engine, Legislative grounding, Document intelligence, Evaluation. Each 2-4 sentences. Keep functional names; never use codenames.</TodoBlock>

  <h2>The hard problem</h2>
  <TodoBlock>Cross-tribunal entity resolution. ~150 words on why this is the part competitors who index PDFs cannot do.</TodoBlock>

  <h2>What this document does not cover</h2>
  <TodoBlock>Bullet list — internal repo names, private infrastructure, vendor specifics, technical backlog. Borrowed from silo-site convention.</TodoBlock>
</InsideLayout>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/system.astro
git commit -m "feat(portal/inside): scaffold 02 · System chapter with diagram slot

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task G4: Create /inside/proof.astro

**Files:**
- Create: `portal/src/pages/inside/proof.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import PageLede from '../../components/silo/PageLede.astro';
import ProofRow from '../../components/silo/ProofRow.astro';
import SectionLabel from '../../components/silo/SectionLabel.astro';
import TodoBlock from '../../components/silo/TodoBlock.astro';
import { proofPoints } from '../../data/constants';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase.from('access_requests').select('name').eq('user_id', user!.id).single();
const viewerName = req?.name ?? '';
---

{/*
  CORPUS REFERENCE — portal/src/data/constants.ts (proofPoints, capabilities)
  Numbers must remain accurate; update constants.ts when they change rather
  than hardcoding here.
*/}

<InsideLayout
  title="Proof"
  chapter="03"
  viewerName={viewerName}
  prev={{ num: '02', title: 'System', href: '/inside/system' }}
  next={{ num: '04', title: 'Depth', href: '/inside/depth' }}
>
  <h1>What is running today</h1>
  <PageLede>{/* TODO: 2 sentences framing — "we report what is live, not what is planned" */}</PageLede>

  <SectionLabel>Live numbers</SectionLabel>
  {proofPoints.map((p) => (
    <ProofRow value={p.value} label={p.label} />
  ))}
  <TodoBlock>Update each ProofRow with a `source` field — provenance line ("live · Apr 2026", "Neo4j Aura", etc.). Requires updating constants.ts to add source.</TodoBlock>

  <h2>What's already in production</h2>
  <TodoBlock>3-5 bullet points naming concrete capabilities that work end-to-end today, with one-line description and the date they shipped.</TodoBlock>

  <h2>A recorded trace</h2>
  <TodoBlock>Walk through one query from input to output, showing each system layer. ~200 words. Screenshot or terminal capture would help — store in /diagrams/.</TodoBlock>

  <h2>What is not yet production</h2>
  <TodoBlock>Honest list of capabilities that are functional but not stable, and capabilities that are still building. Explicit so reviewer trusts the rest.</TodoBlock>
</InsideLayout>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/proof.astro
git commit -m "feat(portal/inside): scaffold 03 · Proof chapter using constants.ts

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task G5: Create /inside/depth.astro

**Files:**
- Create: `portal/src/pages/inside/depth.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import PageLede from '../../components/silo/PageLede.astro';
import TodoBlock from '../../components/silo/TodoBlock.astro';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase.from('access_requests').select('name').eq('user_id', user!.id).single();
const viewerName = req?.name ?? '';
---

{/*
  NO CORPUS — Diego writes from scratch. Suggested deep dives:
  - The syllogism node (graph schema)
  - Cross-tribunal entity resolution (SAME_AS edges)
  - Hybrid search (vector + structural)
  - The MCP tool surface
  - The ingestion pipeline
*/}

<InsideLayout
  title="Depth"
  chapter="04"
  viewerName={viewerName}
  prev={{ num: '03', title: 'Proof', href: '/inside/proof' }}
  next={{ num: '05', title: 'Decisions', href: '/inside/decisions' }}
>
  <h1>Where the engineering lives</h1>
  <PageLede>{/* TODO: 2 sentences explaining what this chapter offers vs the System chapter — System is end-to-end, Depth is the hard parts */}</PageLede>

  <h2>The syllogism node</h2>
  <TodoBlock>Diego: 200-300 words on what the syllogism node is, how it materializes legal reasoning structurally, why it's the crown jewel of the schema.</TodoBlock>

  <h2>Cross-tribunal entity resolution</h2>
  <TodoBlock>Diego: 200 words on the SAME_AS edges, the hard cases (same justice, multiple name variants), and the heuristics that work.</TodoBlock>

  <h2>Hybrid search</h2>
  <TodoBlock>Diego: 200 words on how vector retrieval is combined with graph traversal, why neither alone is enough.</TodoBlock>

  <h2>The MCP tool surface</h2>
  <TodoBlock>Diego: 150 words on the 31 MCP tools, what they expose, how Anthropic's MCP made this stable interface possible.</TodoBlock>

  <h2>The ingestion pipeline</h2>
  <TodoBlock>Diego: 200 words on Pipeline v2.1 — how decisions flow from raw PDFs to graph nodes with provenance preserved at every step.</TodoBlock>

  <h2>What this document does not cover</h2>
  <TodoBlock>Bullet list — exact algorithms, vendor specifics, current infrastructure layout. Diego can offer to walk reviewer through code in a session.</TodoBlock>
</InsideLayout>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/depth.astro
git commit -m "feat(portal/inside): scaffold 04 · Depth chapter

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task G6: Create /inside/decisions.astro

**Files:**
- Create: `portal/src/pages/inside/decisions.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import PageLede from '../../components/silo/PageLede.astro';
import TodoBlock from '../../components/silo/TodoBlock.astro';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase.from('access_requests').select('name').eq('user_id', user!.id).single();
const viewerName = req?.name ?? '';
---

{/*
  CORPUS REFERENCE — docs/legacy/silo-site/project-history.md + git log
  Pull notable decisions from history: graph-not-vectors, codename
  consolidation under Silo, EN-only discipline, etc.
*/}

<InsideLayout
  title="Decisions"
  chapter="05"
  viewerName={viewerName}
  prev={{ num: '04', title: 'Depth', href: '/inside/depth' }}
  next={{ num: '06', title: 'Roadmap & Risks', href: '/inside/roadmap' }}
>
  <h1>How we got here</h1>
  <PageLede>{/* TODO: 2 sentences on the value of seeing decisions, not just outcomes */}</PageLede>

  <h2>Decision · Graph not vectors</h2>
  <TodoBlock>~150 words: when, why, what we tried before, what changed our mind.</TodoBlock>

  <h2>Decision · Single product, not 4 codenames</h2>
  <TodoBlock>~150 words: the Silo unification of Mar 2026, why we collapsed 4 internal codenames under one product story.</TodoBlock>

  <h2>Decision · EN-first editorial discipline</h2>
  <TodoBlock>~100 words on why public materials (and the data room) are EN-first.</TodoBlock>

  <h2>Premortems</h2>
  <TodoBlock>List 3-5 things we have explicitly thought could kill Silo, and what we did about each.</TodoBlock>

  <h2>What this document does not cover</h2>
  <TodoBlock>Pricing, GTM, customer segmentation — those are not engineering decisions.</TodoBlock>
</InsideLayout>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/decisions.astro
git commit -m "feat(portal/inside): scaffold 05 · Decisions chapter

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task G7: Create /inside/roadmap.astro

**Files:**
- Create: `portal/src/pages/inside/roadmap.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import PageLede from '../../components/silo/PageLede.astro';
import TodoBlock from '../../components/silo/TodoBlock.astro';
import { milestones } from '../../data/constants';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase.from('access_requests').select('name').eq('user_id', user!.id).single();
const viewerName = req?.name ?? '';
---

{/*
  CORPUS REFERENCE — docs/legacy/silo-site/roadmap.md + portal/src/data/constants.ts (milestones)
*/}

<InsideLayout
  title="Roadmap & Risks"
  chapter="06"
  viewerName={viewerName}
  prev={{ num: '05', title: 'Decisions', href: '/inside/decisions' }}
  next={{ num: '07', title: 'Team & Velocity', href: '/inside/team' }}
>
  <h1>Where Silo is going</h1>
  <PageLede>{/* TODO: 2 sentences orienting the reader: we name the next 4-6 months, then the kill criteria */}</PageLede>

  <h2>Phases</h2>
  <ol class="phases">
    {milestones.map((m, i) => (
      <li>
        <span class="phase-num">{String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>{m.name}</h3>
          <p>{m.description}</p>
          <p class="status">Status: {m.status}</p>
        </div>
      </li>
    ))}
  </ol>
  <TodoBlock>Diego: refine each phase description for DD voice. The current copy comes from constants.ts which was written for the marketing /silo page.</TodoBlock>

  <h2>Risks</h2>
  <TodoBlock>3-5 risks, each with a one-line description and a one-line mitigation. Examples: (a) corpus growth cost, (b) vendor concentration, (c) regulatory shift around legal AI in Brazil, (d) sales motion not validated.</TodoBlock>

  <h2>Kill criteria</h2>
  <TodoBlock>2-3 explicit conditions under which Silo would stop. The test of credibility is being able to say it.</TodoBlock>
</InsideLayout>

<style>
  .phases { list-style: none; padding: 0; margin: 0; display: grid; gap: 1.5rem; }
  .phases li { display: grid; grid-template-columns: 3rem 1fr; gap: 1rem; }
  .phase-num { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent); font-weight: 600; padding-top: 0.25rem; }
  .phases h3 { font-size: 1.0625rem; font-weight: 600; margin-bottom: 0.25rem; }
  .phases p { margin-bottom: 0.25rem; color: var(--color-text-secondary); font-size: 0.9375rem; }
  .phases .status { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
</style>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/roadmap.astro
git commit -m "feat(portal/inside): scaffold 06 · Roadmap & Risks chapter

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task G8: Create /inside/team.astro

**Files:**
- Create: `portal/src/pages/inside/team.astro`

- [ ] **Step 1: Write the file**

```astro
---
import InsideLayout from '../../layouts/InsideLayout.astro';
import PageLede from '../../components/silo/PageLede.astro';
import TodoBlock from '../../components/silo/TodoBlock.astro';
import { createSupabaseServerClient } from '../../lib/supabase-server';

const supabase = createSupabaseServerClient(Astro.cookies);
const { data: { user } } = await supabase.auth.getUser();
const { data: req } = await supabase.from('access_requests').select('name').eq('user_id', user!.id).single();
const viewerName = req?.name ?? '';
---

{/*
  NO CORPUS — Diego writes from scratch.
*/}

<InsideLayout
  title="Team & Velocity"
  chapter="07"
  viewerName={viewerName}
  prev={{ num: '06', title: 'Roadmap & Risks', href: '/inside/roadmap' }}
>
  <h1>Who decides, how fast we ship</h1>
  <PageLede>{/* TODO: 2 sentences naming the team shape and the operating model */}</PageLede>

  <h2>Team</h2>
  <TodoBlock>Diego: 2 paragraphs — who you are, who else (current and planned), the practitioner-as-builder bet.</TodoBlock>

  <h2>Operating model</h2>
  <TodoBlock>Diego: 2 paragraphs on how you make decisions, how AI is integrated into your build loop, why a 1-person team can ship at this velocity.</TodoBlock>

  <h2>Cadence</h2>
  <TodoBlock>Diego: concrete numbers — commits per week, releases per month, decisions per sprint. Shows momentum.</TodoBlock>

  <h2>What this document does not cover</h2>
  <TodoBlock>Hiring plans, comp structure, equity. Available on request.</TodoBlock>
</InsideLayout>
```

- [ ] **Step 2: Verify + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/inside/team.astro
git commit -m "feat(portal/inside): scaffold 07 · Team & Velocity chapter

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase H — Admin pages, admin endpoints, view tracking, email templates

### Task H1: Create track-view.ts and email-templates.ts libs

**Files:**
- Create: `portal/src/lib/track-view.ts`
- Create: `portal/src/lib/email-templates.ts`

- [ ] **Step 1: Write track-view.ts**

```ts
import { supabaseAdmin } from './supabase-server';

export interface TrackViewArgs {
  userId: string;
  email: string;
  page: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Fire-and-forget view logger. Never throws — failure is silent.
 */
export async function trackView(args: TrackViewArgs): Promise<void> {
  try {
    await supabaseAdmin.from('dd_views').insert({
      user_id: args.userId,
      email: args.email,
      page: args.page,
      ip: args.ip ?? null,
      user_agent: args.userAgent ?? null,
    });
  } catch {
    // silent
  }
}
```

- [ ] **Step 2: Write email-templates.ts**

```ts
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromAddr = process.env.RESEND_FROM_EMAIL ?? 'silo@sens.legal';
const portalBase = process.env.PORTAL_BASE_URL ?? 'https://sens.legal';

function client(): Resend | null {
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendApprovedEmail(args: { to: string; name: string }): Promise<void> {
  const resend = client();
  if (!resend) return;

  await resend.emails.send({
    from: fromAddr,
    to: args.to,
    subject: "You're in — Silo Technical Data Room",
    text: `Welcome, ${args.name}.

Your access to the Silo technical data room has been approved. Visit
${portalBase}/inside to start.

The data room is structured as 7 chapters meant to be read in order;
total reading time is roughly 30 minutes. Each chapter is also designed
to stand alone if you'd rather skim.

If anything is unclear, write to diego@sens.legal.

— Silo`,
  });
}

// Note: the new-request notification email is inlined in
// portal/src/pages/api/auth/callback.ts (Task E5) because that file
// already imports Resend directly and the message is single-use.
```

- [ ] **Step 3: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/lib/track-view.ts portal/src/lib/email-templates.ts
git commit -m "feat(portal/lib): add track-view and email-templates

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task H2: Wire view tracking into all /inside/* pages via shared header partial

**Files:**
- Modify: `portal/src/layouts/InsideLayout.astro` (add tracking call in frontmatter)

The cleanest place to fire view tracking is the `InsideLayout` frontmatter — runs once per render, can read `Astro.locals` set by middleware.

- [ ] **Step 1: Update InsideLayout.astro frontmatter**

Open `portal/src/layouts/InsideLayout.astro` and at the top of the frontmatter (after imports), add:

```ts
import { trackView } from '../lib/track-view';

// View tracking — fire-and-forget, runs once per render
if (Astro.locals.shouldLogView && Astro.locals.userId && Astro.locals.userEmail) {
  trackView({
    userId: Astro.locals.userId,
    email: Astro.locals.userEmail,
    page: Astro.url.pathname,
    ip: Astro.clientAddress,
    userAgent: Astro.request.headers.get('user-agent') ?? undefined,
  });
}
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/layouts/InsideLayout.astro
git commit -m "feat(portal/inside): fire view tracking from InsideLayout frontmatter

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task H3: Create /admin/index.astro

**Files:**
- Create: `portal/src/pages/admin/index.astro`

- [ ] **Step 1: Write the file**

```astro
---
import AdminLayout from '../../layouts/AdminLayout.astro';
import { supabaseAdmin } from '../../lib/supabase-server';

// Counts for the overview cards
const { count: pendingCount } = await supabaseAdmin
  .from('access_requests')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending');
const { count: approvedCount } = await supabaseAdmin
  .from('access_requests')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'approved');
const { count: viewsCount } = await supabaseAdmin
  .from('dd_views')
  .select('*', { count: 'exact', head: true });
---

<AdminLayout title="Overview" active="index">
  <h1>Overview</h1>

  <div class="cards">
    <a class="card" href="/admin/access">
      <span class="label">Access requests</span>
      <span class="num">{pendingCount ?? 0}</span>
      <span class="hint">pending review</span>
    </a>
    <a class="card" href="/admin/access?status=approved">
      <span class="label">Approved reviewers</span>
      <span class="num">{approvedCount ?? 0}</span>
      <span class="hint">currently active</span>
    </a>
    <a class="card" href="/admin/views">
      <span class="label">Views logged</span>
      <span class="num">{viewsCount ?? 0}</span>
      <span class="hint">total since launch</span>
    </a>
  </div>
</AdminLayout>

<style>
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; margin-top: 1rem; }
  .card { display: block; padding: 1.5rem 1.75rem; border: 1px solid var(--color-border); border-radius: 6px; text-decoration: none; transition: border-color 0.15s; }
  .card:hover { border-color: var(--color-border-active); }
  .card .label { display: block; font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin-bottom: 0.5rem; }
  .card .num { display: block; font-family: var(--font-mono); font-size: 2rem; font-weight: 500; color: var(--color-text); line-height: 1; }
  .card .hint { display: block; font-size: 0.8125rem; color: var(--color-text-secondary); margin-top: 0.5rem; }
</style>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/admin/index.astro
git commit -m "feat(portal/admin): add overview landing with 3 count cards

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task H4: Create /admin/access.astro

**Files:**
- Create: `portal/src/pages/admin/access.astro`

- [ ] **Step 1: Write the file**

```astro
---
import AdminLayout from '../../layouts/AdminLayout.astro';
import OrgCell from '../../components/silo/OrgCell.astro';
import { supabaseAdmin } from '../../lib/supabase-server';

const status = (Astro.url.searchParams.get('status') ?? 'pending') as 'pending' | 'approved' | 'rejected';

const { data: rows } = await supabaseAdmin
  .from('access_requests')
  .select('id, user_id, email, name, avatar_url, provider, github_handle, org, status, created_at')
  .eq('status', status)
  .order('created_at', { ascending: false });

function fmtDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
---

<AdminLayout title="Access requests" active="access">
  <h1>Access requests</h1>

  <nav class="tabs">
    <a href="/admin/access?status=pending" class:list={[{ active: status === 'pending' }]}>Pending</a>
    <a href="/admin/access?status=approved" class:list={[{ active: status === 'approved' }]}>Approved</a>
    <a href="/admin/access?status=rejected" class:list={[{ active: status === 'rejected' }]}>Rejected</a>
  </nav>

  {!rows || rows.length === 0 ? (
    <p class="empty">No requests with status "{status}".</p>
  ) : (
    <table class="admin-table">
      <thead>
        <tr>
          <th>Reviewer</th>
          <th>Email</th>
          <th>Org</th>
          <th>Provider</th>
          <th>Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr>
            <td>
              <div class="reviewer">
                {r.avatar_url && <img src={r.avatar_url} alt={r.name ?? ''} />}
                <div>
                  <div class="name">{r.name ?? '(no name)'}</div>
                  {r.github_handle && <div class="handle">@{r.github_handle}</div>}
                </div>
              </div>
            </td>
            <td class="mono">{r.email}</td>
            <td><OrgCell email={r.email} org={r.org} /></td>
            <td class="mono">{r.provider}</td>
            <td class="mono">{fmtDate(r.created_at)}</td>
            <td class="actions">
              {status === 'pending' && (
                <>
                  <form method="POST" action={`/api/admin/access/${r.id}`} class="inline">
                    <input type="hidden" name="action" value="approve" />
                    <button type="submit" class="approve">Approve</button>
                  </form>
                  <form method="POST" action={`/api/admin/access/${r.id}`} class="inline">
                    <input type="hidden" name="action" value="reject" />
                    <button type="submit" class="reject">Reject</button>
                  </form>
                </>
              )}
              {status === 'approved' && (
                <form method="POST" action={`/api/admin/access/${r.id}`} class="inline">
                  <input type="hidden" name="action" value="reject" />
                  <button type="submit" class="reject">Revoke</button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</AdminLayout>

<style>
  .tabs { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; }
  .tabs a { font-size: 0.875rem; color: var(--color-text-secondary); text-decoration: none; padding: 0.375rem 0.125rem; font-weight: 500; }
  .tabs a.active { color: var(--color-text); border-bottom: 2px solid var(--color-accent); padding-bottom: calc(0.375rem - 2px); }
  .empty { color: var(--color-text-secondary); padding: 2rem 0; }
  .reviewer { display: flex; gap: 0.625rem; align-items: center; }
  .reviewer img { width: 1.75rem; height: 1.75rem; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-border); }
  .reviewer .name { font-weight: 600; }
  .reviewer .handle { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--color-text-muted); }
  .mono { font-family: var(--font-mono); font-size: 0.8125rem; }
  .actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .actions form.inline { display: inline; margin: 0; }
  .actions button { font-family: var(--font-sans); font-size: 0.75rem; font-weight: 600; padding: 0.375rem 0.75rem; border-radius: 3px; cursor: pointer; border: 1px solid; }
  .actions .approve { background: var(--color-bg); color: var(--color-accent); border-color: var(--color-accent); }
  .actions .approve:hover { background: var(--color-accent); color: var(--color-bg); }
  .actions .reject { background: var(--color-bg); color: var(--color-text-secondary); border-color: var(--color-border); }
  .actions .reject:hover { color: var(--color-text); border-color: var(--color-border-active); }
</style>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/admin/access.astro
git commit -m "feat(portal/admin): add /admin/access with pending/approved/rejected tabs

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task H5: Create /admin/views.astro

**Files:**
- Create: `portal/src/pages/admin/views.astro`

- [ ] **Step 1: Write the file**

```astro
---
import AdminLayout from '../../layouts/AdminLayout.astro';
import { supabaseAdmin } from '../../lib/supabase-server';

const { data: views } = await supabaseAdmin
  .from('dd_views')
  .select('id, email, page, ip, user_agent, viewed_at')
  .order('viewed_at', { ascending: false })
  .limit(200);

function fmtTs(iso: string): string {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 19);
}
---

<AdminLayout title="Views" active="views">
  <h1>Views</h1>
  <p class="hint">Last 200 page views across the data room.</p>

  {!views || views.length === 0 ? (
    <p class="empty">No views logged yet.</p>
  ) : (
    <table class="admin-table">
      <thead>
        <tr>
          <th>When</th>
          <th>Reviewer</th>
          <th>Page</th>
          <th>IP</th>
        </tr>
      </thead>
      <tbody>
        {views.map((v) => (
          <tr>
            <td class="mono">{fmtTs(v.viewed_at)}</td>
            <td class="mono">{v.email}</td>
            <td class="mono">{v.page}</td>
            <td class="mono ip">{v.ip ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</AdminLayout>

<style>
  .hint { color: var(--color-text-secondary); font-size: 0.875rem; margin-bottom: 1.5rem; }
  .empty { color: var(--color-text-secondary); padding: 2rem 0; }
  .mono { font-family: var(--font-mono); font-size: 0.8125rem; }
  .ip { color: var(--color-text-muted); }
</style>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/admin/views.astro
git commit -m "feat(portal/admin): add /admin/views page (last 200 views)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task H6: Create /api/admin/access/[id].ts

**Files:**
- Create: `portal/src/pages/api/admin/access/[id].ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p portal/src/pages/api/admin/access
```

- [ ] **Step 2: Write the file**

```ts
import type { APIRoute } from 'astro';
import { createSupabaseServerClient, supabaseAdmin } from '../../../../lib/supabase-server';
import { sendApprovedEmail } from '../../../../lib/email-templates';

export const prerender = false;

export const POST: APIRoute = async ({ request, params, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const id = params.id;
  if (!id) return new Response('Missing id', { status: 400 });

  const form = await request.formData();
  const action = form.get('action');

  if (action === 'approve') {
    const { data: req } = await supabaseAdmin
      .from('access_requests')
      .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user.id })
      .eq('id', id)
      .select('email, name')
      .single();

    if (req?.email) {
      try {
        await sendApprovedEmail({ to: req.email, name: req.name ?? 'there' });
      } catch {
        // silent
      }
    }
    return redirect('/admin/access?status=pending');
  }

  if (action === 'reject') {
    await supabaseAdmin
      .from('access_requests')
      .update({ status: 'rejected' })
      .eq('id', id);
    return redirect('/admin/access?status=pending');
  }

  return new Response('Unknown action', { status: 400 });
};
```

- [ ] **Step 3: Verify build + commit**

```bash
npm -w portal run check && npm -w portal run build
git add portal/src/pages/api/admin/access/[id].ts
git commit -m "feat(portal/admin): add POST /api/admin/access/[id] for approve/reject

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase I — vercel.json redirects + runbook + final docs

### Task I1: Rewrite vercel.json with new redirects

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Replace `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "redirects": [
    { "source": "/silo", "destination": "/", "permanent": true },
    { "source": "/architecture", "destination": "/inside/system", "permanent": true },
    { "source": "/api", "destination": "/inside/depth", "permanent": true },
    { "source": "/roadmap", "destination": "/inside/roadmap", "permanent": true },
    { "source": "/projects/:slug*", "destination": "/", "permanent": true },
    { "source": "/use-cases/:slug*", "destination": "/", "permanent": true },
    { "source": "/pt-br/:path*", "destination": "/", "permanent": true }
  ]
}
```

All previous PT-BR redirects are collapsed into a single catch-all `/pt-br/:path*` → `/`. Old `/projects/*` and `/use-cases/*` similarly catch-all'd.

- [ ] **Step 2: Verify build still passes**

```bash
npm -w portal run check && npm -w portal run build
```

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "chore(vercel): rewrite redirects for collapsed routes and removed pt-br

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task I2: Write the launch runbook

**Files:**
- Create: `docs/runbooks/silo-portal-launch.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p docs/runbooks
```

- [ ] **Step 2: Write `docs/runbooks/silo-portal-launch.md`**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add docs/runbooks/silo-portal-launch.md
git commit -m "docs(runbook): silo portal launch — 8-phase manual ops

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task I3: Update progress.md and HANDOFF.md

**Files:**
- Modify: `progress.md`
- Modify: `HANDOFF.md`

- [ ] **Step 1: Append session entry to `progress.md`**

Read the current `progress.md` to find the most recent entry, then append at the END of the file (preserving everything that came before):

```markdown

---

## 2026-04-07 — Silo gated portal redesign

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`
- PR: `feat/silo-gated-portal` (link after merge)

What this rebuild ships:

- The 4 codename docs sites (`sites/{valter,juca,leci,douto}/`) deleted; their content was autosynced from external repos and is no longer needed.
- silo-site repo (`~/Dev/silo-site`) archived; its 6 EN markdown files preserved under `docs/legacy/silo-site/` as corpus.
- The portal becomes a single Astro app gated behind Supabase OAuth (Google + GitHub) with manual approval.
- Public surface reduced to 5 pages (`/`, `/about`, `/sign-in`, `/pending`, `/contact`) plus legal pages; everything else lives behind the gate at `/inside/*`.
- The data room is structured as 7 chapters meant to be read in order: thesis, system, proof, depth, decisions, roadmap, team.
- PT-BR mirror deleted entirely under EN-only discipline.
- Editorial design from the brainstorm session mockups (`docs/design-mockups/`) is canonical: warm off-white, accent #2B579A, Instrument Sans + JetBrains Mono.
- Admin dashboard rebuilt from the ground up: overview, access requests with approve/reject, view tracking.
```

- [ ] **Step 2: Replace `HANDOFF.md`**

Replace the entire contents of `HANDOFF.md`:

```markdown
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

1. **Execute the implementation plan** — run task-by-task using
   `superpowers:subagent-driven-development` (recommended) or
   `superpowers:executing-plans`. The plan is structured as 9 phases.
2. **Author final content** — Diego replaces the `<TodoBlock>` markers in
   the 8 inside chapters and the public landing copy. Each TodoBlock
   has explicit instructions for what goes in that slot.
3. **Run the launch runbook** in `docs/runbooks/silo-portal-launch.md`
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
- **Mockup aesthetic is canonical.** DDLayout sidebar + accent #2B579A
  + Instrument Sans + JetBrains Mono. No deviations.
```

- [ ] **Step 3: Commit**

```bash
git add progress.md HANDOFF.md
git commit -m "docs: log 2026-04-07 silo portal redesign session and update HANDOFF

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task I4: Final build verification + open PR

- [ ] **Step 1: Run full build one more time on the branch tip**

```bash
npm -w portal run check && npm -w portal run build
```

Expected: zero errors. If anything fails, fix in place and amend the relevant commit.

- [ ] **Step 2: Push branch**

```bash
git push -u origin feat/silo-gated-portal
```

- [ ] **Step 3: Open the PR**

```bash
gh pr create --title "feat(portal): silo gated portal redesign — single source of truth" --body "$(cat <<'EOF'
## Summary

- Rebuild sens.legal as the single Astro host for Silo
- Gate the entire site behind Supabase OAuth (Google + GitHub) with manual approval
- Drop the 4 codename docs sites, the silo-site repo overlap, and the pt-br mirror
- Adopt the editorial mockup aesthetic as canonical (Instrument Sans + accent #2B579A)
- Add 7-chapter data room scaffolds at /inside/* with TodoBlock markers for Diego's content pass

## Spec and plan

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`

## Test plan

- [ ] CI passes (typecheck + build)
- [ ] Manual smoke test in production after merge — see `docs/runbooks/silo-portal-launch.md`
- [ ] OAuth providers configured (runbook Phase 1)
- [ ] Supabase migration applied (runbook Phase 2)
- [ ] Vercel env vars set (runbook Phase 3)
- [ ] Sign-in → pending → admin approve → /inside → view logged (runbook Phase 4)

## Out of scope (deferred to follow-up PRs)

- Final content authored by Diego in the 8 chapter scaffolds
- silo-site repo archive in GitHub UI (runbook Phase 7)
- DNS removal of the 4 subdomains (runbook Phase 6)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Verify the PR URL**

```bash
gh pr view --web
```

Done. Plan execution complete on the branch — content authoring and runbook execution happen in follow-up sessions.

---









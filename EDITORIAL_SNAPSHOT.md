# Editorial Snapshot Governance

This note explains how to keep the public `sens.legal` narrative aligned across
GitHub and the portal without reopening copy drift every time a project
advances.

## What This Governs

Use this policy whenever editing:

- `README.md`
- `portal/src/data/projects.ts`
- `portal/src/components/ProjectRoadmapStatus.astro`
- `portal/src/pages/index.astro`
- `portal/src/pages/roadmap.astro`
- `portal/src/pages/projects/*`
- PT-BR mirrors of those pages

## Source Reading Rule

Start with each project's `progress.md` / `PROGRESS.md`.

Then read roadmap or migration artifacts when they define implementation phases
more clearly than the progress log alone.

Project-specific supporting files:

- `Valter`: `PROGRESS.md` + `ROADMAP.md` + `migracaojucavalter.md`
- `Juca`: `progress.md` + `ROADMAP.md`
- `Leci`: `progress.md` + `docs/planning/ROADMAP.md`
- `Douto`: `progress.md` + `ROADMAP.md`

## Editorial Rules

- Treat the public roadmap as an editorial snapshot, not a precise percentage.
- Prefer stage-based language such as `Stage 2 of 5`, `Now`, `Next`, and
  `Blockers`.
- Do not invent fixed progress numbers without a canonical source.
- Do not describe `Leci` as planning-only or API-less.
- Do not describe `Douto` as an autonomous end-user product.
- Do not describe `Juca` as owner of search, KG, reasoning, or the central
  legal backend.
- Keep `Valter` framed as the central jurisprudence and reasoning backend with
  graph-led retrieval.

## Shared Snapshot First

Treat `portal/src/data/projects.ts` as the first edit surface for public
ecosystem updates.

It already owns:

- the roadmap stages, `Now`, `Next`, blockers, and milestone updates
- the home-page project blurbs via each project's `focus` + `description`
- the shared roadmap intro and ecosystem principles in EN and PT-BR

The goal is to update shared data first and only then touch page-level copy if a
page truly needs extra context.

## Update Checklist

When the public roadmap changes:

1. Re-read the canonical source files listed above.
2. Read roadmap or migration artifacts when they define phases more clearly than the progress log alone.
3. Update `portal/src/data/projects.ts` first.
4. Verify that the shared snapshot still reads correctly in:
   - `README.md`
   - home
   - roadmap
   - project pages
5. Build the portal.
6. Review the published site for EN and PT-BR before declaring the update done.

## Review Routine

Use a lightweight review cadence instead of waiting for drift to accumulate.

Event-driven review:

- whenever a project changes stage
- whenever a migration phase closes
- whenever a new public API or canonical integration surface ships

Weekly sweep:

- compare the public snapshot against the latest canonical files for `Valter`,
  `Juca`, `Leci`, and `Douto`
- verify homepage microcopy and roadmap notes, because these are the highest
  drift-risk surfaces
- spot-check the published EN and PT-BR pages after any update lands

## Current Implementation

The shared public snapshot is centralized in:

- `portal/src/data/projects.ts`
- `portal/src/components/ProjectRoadmapStatus.astro`

The goal is to keep public narrative drift low by editing the shared snapshot
instead of manually rewriting multiple pages.

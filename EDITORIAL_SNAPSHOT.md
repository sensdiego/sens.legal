# Editorial Snapshot Governance

This note explains how to keep the public `sens.legal` narrative aligned across
GitHub and the portal.

## What This Governs

Use this policy whenever editing:

- `README.md`
- `portal/src/data/projects.ts`
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

## Update Checklist

When the public roadmap changes:

1. Re-read the canonical source files listed above.
2. Update `portal/src/data/projects.ts`.
3. Verify that the shared snapshot still reads correctly in:
   - `README.md`
   - home
   - roadmap
   - project pages
4. Build the portal.
5. Review the published site for EN and PT-BR before declaring the update done.

## Current Implementation

The shared public snapshot is centralized in:

- `portal/src/data/projects.ts`
- `portal/src/components/ProjectRoadmapStatus.astro`

The goal is to keep public narrative drift low by editing the shared snapshot
instead of manually rewriting multiple pages.

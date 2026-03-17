# sens.legal

![Node 20+](https://img.shields.io/badge/node-20%2B-339933?logo=node.js&logoColor=white)
![npm workspaces](https://img.shields.io/badge/npm-workspaces-CB3837?logo=npm&logoColor=white)
![Astro](https://img.shields.io/badge/astro-portal%20%2B%20docs-FF5D01?logo=astro&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-vercel-000000?logo=vercel&logoColor=white)
![Ecosystem](https://img.shields.io/badge/ecosystem-4%20projects-1f6feb)

The institutional and documentation monorepo for the **sens.legal** ecosystem.

This repository is the public-facing layer of the ecosystem: the portal, the project docs sites, shared presentation assets, and the sync/build tooling that keep those surfaces aligned.

## Public Entry Points

| Surface | URL |
|---------|-----|
| Portal | [sens.legal](https://sens.legal) |
| Valter docs | [valter.sens.legal](https://valter.sens.legal) |
| Juca docs | [juca.sens.legal](https://juca.sens.legal) |
| Leci docs | [leci.sens.legal](https://leci.sens.legal) |
| Douto docs | [douto.sens.legal](https://douto.sens.legal) |

## Ecosystem

sens.legal is organized around four projects:

- **Juca**: the frontend hub for lawyers and user-facing orchestration
- **Valter**: the central backend for jurisprudence retrieval, reasoning, verification, and MCP
- **Leci**: the document-first legislation engine used for reliable grounding
- **Douto**: the local doctrine pipeline that produces doctrinal artifacts for Valter

## Roadmap Snapshot

This is a public-facing editorial snapshot derived from each project's progress
file plus project-specific roadmap or migration artifacts when those documents
define implementation phases more clearly than the progress log alone.

| Project | Roadmap position | Now | Next |
|---------|------------------|-----|------|
| Valter | Stage 7 of 10 - Production stability (v1.0)<br>`[#######---]` | Close App Directory submission (Phases 2-4: token guardrails, OAuth consent UI, final validation) and ship public policies (privacy, terms, data retention). | Pipeline de Peticoes: 5-tier petition ingestion into the knowledge graph. Multi-tribunal expansion with TRF4 and TJSP scrapers. |
| Juca | Stage 2 of 5 - Progressive briefing<br>`[####------]` | Build the progressive briefing flow on top of the Valter-backed shell, while replacing the temporary production auth bypass. | Polish and expand hub workflows once the briefing phases are live. |
| Leci | Stage 3 of 5 - Reader and grounding contracts<br>`[######----]` | Ship provision-context, deep-link, and reader flows on top of `/api/resolve` and `/api/resolve-dispositivos`. | Publish grounding contracts for Valter and Juca, then move into ingestion and quality hardening. |
| Douto | Stage 1 of 5 - Reproducible foundation<br>`[##--------]` | Regularize paths and CLI behavior, remove creator-machine dependencies, and lock the local pipeline baseline. | Measure doctrinal quality for contracts and civil procedure before defining the Valter handoff contract. |

## What This Repo Owns

This repo is where we maintain:

- the institutional portal in [`portal/`](portal/)
- the docs sites for each project in [`sites/`](sites/)
- shared assets and styles in [`shared/`](shared/)
- sync and build helpers in [`scripts/`](scripts/)

This repo is **not** the main product codebase for Juca, Valter, Leci, or Douto. Each project has its own implementation repository and its own operational history.

## Source Of Truth

The README is an entry point, not the canonical source of project status.

Use this rule:

1. Implementation details: trust the project repository.
2. Project status, migration state, and roadmap reality: trust each project's `progress.md` / `PROGRESS.md`, then read roadmap or migration artifacts when they define implementation phases more clearly.
3. This repo: trust it for institutional presentation, portal copy, synced docs, and deploy wiring for those surfaces.

The root [`progress.md`](progress.md) in this repo is only for work tracked inside the `sens.legal` docs/portal monorepo itself.

The public snapshot policy for GitHub and portal surfaces is documented in
[`EDITORIAL_SNAPSHOT.md`](EDITORIAL_SNAPSHOT.md).

## Public Update Workflow

When a project's public status changes:

1. Re-read that project's `progress.md` / `PROGRESS.md`.
2. Read roadmap or migration artifacts when they define phases more clearly.
3. Update the shared snapshot in [`portal/src/data/projects.ts`](portal/src/data/projects.ts) first.
4. Verify the mirrored public surfaces: `README`, home, roadmap, and project pages.
5. Build locally and spot-check the published EN and PT-BR pages after deploy.

## Light Review Routine

- Trigger a public review when a project changes stage, closes a migration phase, or ships a new canonical API surface.
- Run a lightweight weekly sweep across `Valter`, `Juca`, `Leci`, and `Douto` even without a launch.
- Treat homepage microcopy and roadmap notes as high-risk drift surfaces during every sweep.

## Repository Structure

```text
.
├── portal/         # sens.legal portal
├── sites/
│   ├── juca/       # Juca docs site
│   ├── valter/     # Valter docs site
│   ├── leci/       # Leci docs site
│   └── douto/      # Douto docs site
├── shared/         # Shared assets, components, styles
├── scripts/        # Sync/build helpers
├── DEPLOY.md       # Deployment and DNS notes
└── progress.md     # Repo-level progress log for this monorepo
```

## Local Development

Install dependencies once at the repo root:

```bash
npm install
```

Run the portal:

```bash
npm run dev:portal
```

Run an individual docs site:

```bash
npm run dev:juca
npm run dev:valter
npm run dev:leci
npm run dev:douto
```

Build everything:

```bash
npm run build:all
```

Sync docs from project sources:

```bash
npm run sync
```

## Deploy And Hosting

The portal and docs surfaces are deployed as separate Vercel projects:

- `sens.legal` for the portal
- `valter.sens.legal`
- `juca.sens.legal`
- `leci.sens.legal`
- `douto.sens.legal`

Operational details, DNS notes, and sync/deploy workflow live in [`DEPLOY.md`](DEPLOY.md).

## Notes

- The portal and docs surfaces are bilingual where applicable (`en` + `pt-BR`).
- The monorepo uses npm workspaces for `portal/` and `sites/*`.
- This repo may contain local helper files that are not part of the public/documentation workflow. Avoid assuming every untracked file belongs to the product.

# sens.legal

This repository is the institutional and documentation monorepo for the **sens.legal** ecosystem.

It contains:

- the public-facing portal in [`portal/`](portal/)
- the docs sites for each project in [`sites/`](sites/)
- shared assets and styles in [`shared/`](shared/)
- sync and build helpers in [`scripts/`](scripts/)

## Ecosystem

sens.legal is organized around four projects:

- **Juca**: the frontend hub for lawyers and user-facing orchestration
- **Valter**: the central backend for jurisprudence retrieval, reasoning, verification, and MCP
- **Leci**: the document-first legislation engine used for reliable grounding
- **Douto**: the local doctrine pipeline that produces doctrinal artifacts for Valter

## What This Repo Is For

This repo is the place where we maintain:

- institutional copy and positioning
- public portal pages
- documentation sites for the ecosystem projects
- shared presentation-layer assets

This repo is **not** the main product codebase for Juca, Valter, Leci, or Douto. Each project has its own implementation repository.

## Source Of Truth

The README is an entry point, not the canonical source of project status.

Use this rule:

1. Project implementation details: trust the project repository.
2. Project status, migration state, and roadmap reality: trust each project's `progress.md` / `PROGRESS.md`.
3. This repo: trust it for institutional presentation, portal copy, and synced documentation surfaces.

The root [`progress.md`](progress.md) in this repo is only for work tracked inside the `sens.legal` docs/portal monorepo itself.

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
├── DEPLOY.md       # Deployment notes
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

## Notes

- The portal and docs surfaces are bilingual where applicable (`en` + `pt-BR`).
- Deployment details and operational notes live in [`DEPLOY.md`](DEPLOY.md).
- This repo may contain local helper files that are not part of the public/documentation workflow. Avoid assuming every untracked file belongs to the product.

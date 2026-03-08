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
2. Project status, migration state, and roadmap reality: trust each project's `progress.md` / `PROGRESS.md`.
3. This repo: trust it for institutional presentation, portal copy, synced docs, and deploy wiring for those surfaces.

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

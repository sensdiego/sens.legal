# sens.legal — Deployment Guide

## Architecture

Monorepo with npm workspaces containing 4 independent sites:

| Site | Path | URL | Framework |
|------|------|-----|-----------|
| Portal | `portal/` | `sens.legal` | Astro |
| Valter Docs | `sites/valter/` | `valter.sens.legal` | Astro Starlight |
| Juca Docs | `sites/juca/` | `juca.sens.legal` | Astro Starlight |
| Leci Docs | `sites/leci/` | `leci.sens.legal` | Astro Starlight |

## Prerequisites

- Node.js 20+
- npm 10+
- Source repos cloned at `~/Dev/`: `Valter/`, `juca/`, `leci/`

## Setup

```bash
# Install all workspace dependencies
cd ~/Dev/sens.legal
npm install

# Sync docs from source repos
npm run sync
```

## Local Development

```bash
# Run a single site
npm run dev:portal    # http://localhost:4321
npm run dev:valter    # http://localhost:4321
npm run dev:juca      # http://localhost:4321
npm run dev:leci      # http://localhost:4321
```

Only run one `dev` at a time (they share port 4321).

## Sync Workflow

Content lives in each project's repo (`~/Dev/Valter/docs/`, etc.).
The sync script copies whitelisted files (per SITE_MANIFEST.json) into each site's `src/content/docs/`.

```bash
npm run sync
```

Run sync before building or after updating content in source repos.

## Deploy — Option A (Free Tier, Recommended)

Create **4 separate Vercel projects**, each pointing to a subdirectory:

1. **sens-legal-portal**: Root directory = `portal/`
2. **sens-legal-valter**: Root directory = `sites/valter/`
3. **sens-legal-juca**: Root directory = `sites/juca/`
4. **sens-legal-leci**: Root directory = `sites/leci/`

Each project has its own `vercel.json` with build config and headers.

### DNS Setup

| Record | Type | Value |
|--------|------|-------|
| `sens.legal` | A / CNAME | Vercel (portal project) |
| `valter.sens.legal` | CNAME | `cname.vercel-dns.com` |
| `juca.sens.legal` | CNAME | `cname.vercel-dns.com` |
| `leci.sens.legal` | CNAME | `cname.vercel-dns.com` |

Assign custom domains in each Vercel project's settings.

## Deploy — Option B (Pro Tier)

Single Vercel project with monorepo config at root.
Requires Vercel Pro for multiple domains on one project.

## Build (CI only)

```bash
npm run build:all
```

**Do NOT run builds locally** — delegate to CI/Vercel.

## Checklist

- [ ] `npm install` exits 0 (4 workspaces resolved)
- [ ] `npm run sync` copies correct file counts (valter:36, juca:40, leci:36)
- [ ] Each `astro.config.mjs` exists in `sites/*/`
- [ ] `vercel.json` present in `portal/` and each `sites/*/`
- [ ] DNS records configured for all 4 subdomains
- [ ] Vercel projects created and linked
- [ ] llms.txt and llms-full.txt accessible at each subdomain

## Troubleshooting

**Sync fails**: Check that source repos exist at `~/Dev/Valter/`, `~/Dev/juca/`, `~/Dev/leci/` and each has `SITE_MANIFEST.json`.

**Build fails on CI**: Ensure `npm run sync` runs before `npm run build` in the build command. The sync script requires the source repos to be available.

**Mermaid not rendering**: The sites use client-side mermaid.js via CDN. Check browser console for errors. If Expressive Code interferes with mermaid code blocks, consider switching to `remark-mermaidjs` plugin.

**Wrong file count after sync**: The sync uses SITE_MANIFEST.json whitelist. If files were added/removed from docs, regenerate the manifest in the source repo.

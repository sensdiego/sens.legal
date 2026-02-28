---
title: "Installation"
description: "Complete setup guide including all optional services, data stores, and development tools."
lang: en
sidebar:
  order: 3
---

# Installation

This is the full setup guide. For a minimal 5-minute setup, see [Quickstart](/getting-started/quickstart).

## System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20+ | LTS recommended. Verify: `node -v` |
| npm | 10+ | Ships with Node 20 |
| Git | 2.x+ | With Git LFS for large data files |
| C++ build tools | — | Required for `better-sqlite3` native compilation |
| Docker | — | Optional, only for local Neo4j |

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sensdiego/juca.git
cd juca
```

If the repository uses Git LFS for data files, also run:

```bash
git lfs install
git lfs pull
```

### 2. Install Dependencies

```bash
npm install
```

This installs ~670 packages including the `better-sqlite3` native module. If compilation fails:

- **macOS:** `xcode-select --install`
- **Linux (Debian/Ubuntu):** `sudo apt-get install build-essential python3`
- **Linux (RHEL/Fedora):** `sudo dnf groupinstall "Development Tools"`

### 3. Environment Configuration

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

**Required variables (minimum):**

```bash
# LLM Providers — at least Anthropic + Groq
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Dev auth bypass
ENABLE_DEV_AUTH=true
```

**Optional but recommended:**

```bash
# Valter integration (the primary backend)
VALTER_API_URL=https://valter-api-production.up.railway.app
VALTER_API_KEY=your-key

# Additional LLM providers
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=sk-...

# Knowledge Graph (local mode by default)
KG_PROVIDER=json
```

See [Environment Variables](/configuration/environment) for the complete reference of 30+ variables.

### 4. Local Neo4j (Optional)

If you want to use the Neo4j knowledge graph locally instead of JSON files:

```bash
docker compose up -d
```

This starts a Neo4j Community 5 instance. Then configure:

```bash
KG_PROVIDER=neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
```

:::note
Neo4j is not needed if you're using the Valter API for knowledge graph queries, which is the recommended approach going forward.
:::

### 5. Git Hooks

The project uses custom git hooks in `.githooks/`:

| Hook | Action |
|------|--------|
| `pre-commit` | Runs ESLint on staged files |
| `pre-push` | Runs the full test suite |
| `post-checkout` | Housekeeping tasks |
| `post-commit` | Housekeeping tasks |
| `post-merge` | Housekeeping tasks |

Hooks are configured automatically via the `prepare` script in package.json:

```bash
npm run prepare  # Runs: git config core.hooksPath .githooks
```

### 6. Verify Installation

```bash
# Start the dev server
npm run dev

# In another terminal, run tests
npm test
```

Expected outcomes:
- Dev server starts at `http://localhost:3000` with no errors
- Tests execute (some may fail due to known issue [#270](https://github.com/sensdiego/juca/issues/270))

## Docker Setup (Production)

Juca uses a multi-stage Docker build for production deployment:

```bash
# Build the image (NOTE: for CI/Railway only — do NOT run locally)
docker build -t juca .
```

The Dockerfile:
1. **deps stage** — Installs npm dependencies
2. **build stage** — Runs `next build` with standalone output
3. **runtime stage** — Minimal Node.js image with only production artifacts

Deployment to Railway happens automatically on push to `main`.

:::danger
**Never run `docker build` or `next build` locally.** Per project rules ([CLAUDE.md](/development/contributing)), builds that consume >50% CPU must be delegated to CI. Push to your branch and let GitHub Actions or Railway handle it.
:::

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `better-sqlite3` compilation fails | Install C++ build tools (see step 2) |
| Git LFS files are pointer files | Run `git lfs pull` |
| Auth errors on every page | Set `ENABLE_DEV_AUTH=true` in `.env.local` |
| "No API key configured" | Add at minimum `ANTHROPIC_API_KEY` and `GROQ_API_KEY` |

For more issues, see [Troubleshooting](/reference/troubleshooting).

---
title: Troubleshooting
description: Common problems and their solutions when working with Juca.
lang: en
sidebar:
  order: 3
---

# Troubleshooting

> Common problems and their solutions when developing or running Juca.

## Installation Issues

### better-sqlite3 compilation fails

**Cause:** `better-sqlite3` is a native C++ addon that requires compilation during `npm install`.

**Solution:**

| Platform | Fix |
|----------|-----|
| macOS | `xcode-select --install` (installs C++ build tools) |
| Linux (Debian/Ubuntu) | `sudo apt-get install build-essential python3` |
| Linux (RHEL/Fedora) | `sudo dnf groupinstall "Development Tools"` |

Also ensure you are using Node.js 20+ (the version specified in the project):

```bash
node --version  # Should be v20.x or higher
```

### Git LFS files not downloaded

**Cause:** Git LFS was not installed or initialized before cloning, so data files appear as pointer files.

**Solution:**

```bash
git lfs install
git lfs pull
```

**Verify:** Files in `data/` should be their actual size (not small pointer files of ~130 bytes).

### npm install fails with peer dependency errors

**Cause:** Conflicting package versions or stale lockfile.

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Runtime Issues

### Authentication errors in development

**Cause:** Missing OAuth configuration (Google Client ID, Auth Secret, etc.).

**Solution:** Add the dev auth bypass to `.env.local`:

```bash
ENABLE_DEV_AUTH=true
```

This creates a dev user without requiring external auth providers. For production, configure the full auth stack — see [Environment Variables](/configuration/environment).

### "No API key configured" errors

**Cause:** Missing LLM provider API keys.

**Solution:** Add at minimum these two keys to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...   # Primary generator (required)
GROQ_API_KEY=gsk_...           # Fast critics (required)
```

Check `/api/health` to see which providers are configured:

```bash
curl http://localhost:3000/api/health | jq '.providers'
```

### Valter API connection failures

**Cause:** Valter API unreachable, wrong URL, or invalid API key.

**Diagnosis:**

```bash
curl -H "X-API-Key: $VALTER_API_KEY" \
  https://valter-api-production.up.railway.app/health
```

Expected: HTTP 200 with status `ok`.

**Solutions:**

| Symptom | Fix |
|---------|-----|
| Connection refused | Check `VALTER_API_URL` in `.env.local` |
| 401 Unauthorized | Check `VALTER_API_KEY` value |
| Timeout | Valter may be cold-starting on Railway — wait 30s and retry |
| 503 Service Unavailable | Valter is deploying or overloaded — check Railway dashboard |

### SQLite database lock errors

**Cause:** Multiple processes accessing the SQLite database simultaneously.

**Solution:**

1. Ensure only one dev server is running:
   ```bash
   lsof -i :3000  # Check what's using port 3000
   ```
2. Kill orphan Node processes:
   ```bash
   pkill -f "next dev"
   ```
3. If the lock file persists, restart the dev server

:::note
SQLite uses WAL (Write-Ahead Logging) mode for better concurrency, but it still has limits at ~50 concurrent writers. This is a known limitation tracked in Issue #231 (SQLite → PostgreSQL migration).
:::

---

## Test Issues

### 72 test files failing

**Cause:** Technical debt from a coverage sprint (Issue #270). Many tests target backend code that is being migrated to Valter.

**What to do:**
1. Focus on tests relevant to the hub architecture (components, blocks, server actions, unified API)
2. Tests for `src/lib/backend/` may fail — these are being deprecated
3. Run specific test files instead of the full suite:
   ```bash
   npx vitest run src/components  # Component tests only
   npx vitest run src/actions     # Server action tests only
   ```

### E2E tests fail to start

**Cause:** Dev server not running or wrong port.

**Solution:**

1. Start the dev server first:
   ```bash
   npm run dev
   ```
2. In a separate terminal, run E2E:
   ```bash
   npm run test:e2e
   ```

The Playwright config expects the app at `http://localhost:3000`. If you are using a different port, update `playwright.config.ts`.

### E2E tests are flaky

**Cause:** Timing issues with SSE streams, animation delays, or network conditions.

**Solutions:**
- Use `npm run test:e2e:headed` to see what's happening in the browser
- Use `npm run test:e2e:ui` for Playwright's visual debugger
- Playwright is configured with 2 retries in CI and 0 locally
- Check `test-results/` for failure screenshots

---

## Build Issues

### "Never run `next build` locally"

This is a **project rule** from `CLAUDE.md`, not a bug. Builds consume >50% CPU and are prohibited locally.

**To verify your changes compile:**
1. Run `npm run lint` (checks for ESLint errors)
2. Run `npm test` (runs unit tests)
3. Push to your branch — GitHub Actions runs lint + build + tests

**To verify deployment:**
- Push to `main` — Railway auto-deploys with the multi-stage Dockerfile

---

## Getting Help

- **GitHub Issues:** [github.com/sensdiego/juca/issues](https://github.com/sensdiego/juca/issues)
- Check existing issues before creating new ones
- Include reproduction steps, error messages, and environment details

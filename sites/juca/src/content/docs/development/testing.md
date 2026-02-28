---
title: "Testing Guide"
description: "How to write and run tests in Juca — unit tests with Vitest, component tests with Testing Library, and E2E with Playwright."
lang: en
sidebar:
  order: 3
---

# Testing Guide

Juca uses Vitest for unit/integration tests, Testing Library for component tests, and Playwright for E2E tests. This page covers running tests, writing tests, and the project's test conventions.

## Test Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | ^4.0.18 | Unit and integration test runner |
| @vitest/coverage-v8 | ^4.0.18 | V8 coverage provider |
| Playwright | ^1.58.0 | E2E testing (Chromium only) |
| Testing Library | ^16.3.2 | React component test utilities |
| jest-dom | ^6.9.1 | DOM assertion matchers |
| user-event | ^14.6.1 | User interaction simulation |
| jsdom | ^28.0.0 | Browser environment for unit tests |

## Running Tests

```bash
# Unit tests (single run)
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with visible browser
npm run test:e2e:headed

# E2E with UI mode (visual debugger)
npm run test:e2e:ui
```

## Test File Organization

Tests live alongside the code they test:

| Code Location | Test Location | Example |
|---|---|---|
| `src/app/api/unified/sessions/route.ts` | `src/app/api/unified/sessions/__tests__/route.test.ts` | API route test |
| `src/lib/blocks/types.ts` | `src/lib/blocks/__tests__/types.test.ts` | Library test |
| `src/components/blocks/DiagnosisBlock.tsx` | `src/components/blocks/__tests__/DiagnosisBlock.test.tsx` | Component test |
| `src/actions/briefing.ts` | `src/actions/__tests__/briefing.test.ts` | Server action test |
| (E2E flows) | `e2e/*.spec.ts` | End-to-end specs |
| (E2E data) | `e2e/fixtures/briefing-blocks.ts` | Shared fixtures |

## Environment Directives

Vitest test files can specify their environment:

```typescript
// @vitest-environment node
// Use for: server-side code (jsPDF, SQLite, file system)

// @vitest-environment jsdom
// Use for: component tests (React, DOM manipulation)
```

Default environment is `jsdom` (configured in `vitest.config.ts`).

## Writing Unit Tests

### Block Factory Tests

```typescript
import { createDiagnosisData } from '@/lib/blocks/types';
import { makeBlock } from './helpers';

describe('createDiagnosisData', () => {
  it('creates diagnosis block from analysis', () => {
    const analysis = { /* mock CaseAnalysis */ };
    const data = createDiagnosisData(analysis);
    expect(data).toHaveProperty('situation');
    expect(data).toHaveProperty('area');
  });
});
```

### Using `makeBlock()` Helper

The `makeBlock()` test helper creates block fixtures with type and data overrides:

```typescript
const block = makeBlock({
  type: 'diagnosis',
  data: { situation: 'pesquisando', area: 'civil' }
});
```

## Writing E2E Tests

E2E tests use Playwright with API mocking via `page.route()`:

```typescript
import { test, expect } from '@playwright/test';

test('renders briefing blocks', async ({ page }) => {
  // Mock the API response
  await page.route('/api/unified/analyze', async route => {
    await route.fulfill({
      json: { success: true, data: { blocks: mockBlocks } }
    });
  });

  await page.goto('/');
  await expect(page.getByTestId('work-canvas')).toBeVisible();
});
```

**Playwright configuration highlights:**

| Setting | Value |
|---------|-------|
| Browser | Chromium only (Desktop Chrome) |
| Parallel | `true` |
| Retries | 2 in CI, 0 locally |
| Screenshots | On failure only |
| Traces | On first retry |
| Base URL | `http://localhost:3000` |

## Coverage Status

| Area | Test Files | Coverage |
|------|-----------|----------|
| API Routes (`src/app/api/`) | 51 | Good |
| Backend lib (`src/lib/`) | 48 | Good |
| Components (`src/components/`) | 24 | Partial (ui/ and blocks/ covered) |
| Server Actions (`src/actions/`) | 2 | Partial |
| E2E specs (`e2e/`) | 8 | Main flows covered |

:::caution
**Known issue:** 72 test files are currently failing ([#270](https://github.com/sensdiego/juca/issues/270)). Many test backend code that is being migrated to Valter. These need re-evaluation before the v0.3 milestone.
:::

## CI Integration

GitHub Actions runs on every push to `main`/`develop` and on PRs to `main`:

1. **lint-and-build** job: `npm ci` → `npm run lint` → `npm run build`
2. **test-unit** job: `npm ci` → `npm test` → `npm run test:coverage`

Coverage artifacts are uploaded with 14-day retention.

:::note
E2E tests do **not** run in CI yet. Playwright integration with GitHub Actions is planned for v0.5.
:::

---
title: "Coding Conventions"
description: "Coding standards, naming patterns, auth patterns, and commit conventions used in the Juca codebase."
lang: en
sidebar:
  order: 2
---

# Coding Conventions

This page documents all coding patterns enforced in the Juca codebase. Following these conventions ensures consistency and makes the codebase predictable for both human and AI contributors.

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `WorkCanvas.tsx`, `PhaseRail.tsx` |
| Hooks | camelCase with `use` prefix | `useFeatureFlag`, `useSSEStream` |
| Server Actions | camelCase | `updateDiagnosis`, `evaluatePrecedent` |
| API routes | kebab-case directories | `document-metadata/`, `validate-processo/` |
| Block types | snake_case | `risk_balance`, `exit_card`, `action_prompt` |
| Feature flags | camelCase | `unifiedHome`, `deepMode` |
| CSS tokens | kebab-case with `--` prefix | `--color-primary`, `--radius-xl` |

## Authentication Patterns

The codebase uses two auth patterns. Never mix them:

**Server Actions** — Use `requireActionAuth()`:

```typescript
// src/actions/briefing.ts
'use server';
import { requireActionAuth } from '@/actions/utils';

export async function updateDiagnosis(sessionId: string, fields: object) {
  const user = await requireActionAuth(); // throws if unauthorized
  // ...
}
```

**API Routes** — Use `auth()` directly:

```typescript
// src/app/api/unified/sessions/route.ts
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  // ...
}
```

:::caution
Never use `getServerSession()` — always use `auth()` from `@/lib/auth`. The codebase has 100% consistency on this pattern.
:::

## Block Creation Pattern

Always use factory helpers to create blocks:

```typescript
import { createDiagnosisData } from '@/lib/blocks/types';
import { getBlocksDB } from '@/lib/db/sessions';

const blockData = createDiagnosisData(analysis);
await getBlocksDB().addBlock({
  sessionId,
  type: 'diagnosis',
  data: blockData
});
```

## Next.js 16 Route Params

Route parameters in Next.js 16 are `Promise`-based:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // Must await!
  // ...
}
```

## Commit Conventions

```text
feat(scope): description        # New feature
fix(scope): description         # Bug fix
docs: description               # Documentation only
chore: description              # Maintenance, dependencies
```

Scopes: `rewrite`, `briefing`, `deploy`, `lint`, `test`, `auth`, etc.

All commits include a co-author header:

```text
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## CSS and Animations

Tailwind v4 CSS-first approach — tokens in `src/app/globals.css`:

```css
:root {
  --color-primary: #000000;
  --color-accent: #fff06d;
  --color-bg-primary: #ffffff;
}
```

Available animation utilities:

| Class | Effect |
|-------|--------|
| `animate-fade-in` | 300ms fadeIn (translateY 10px→0, opacity 0→1) |
| `spring-transition` | `cubic-bezier(0.34, 1.56, 0.64, 1)` for spring feel |
| `animate-pulse` | Built-in Tailwind pulse |
| `scroll-smooth-block` | Smooth scroll behavior |

For staggered animations:

```tsx
<div style={{
  animationDelay: `${index * 100}ms`,
  animationFillMode: 'backwards'
}}>
```

## Import Organization

All imports use the `@/` alias. Order:

```typescript
// 1. React / Next.js
import React, { useState } from 'react';
import { NextResponse } from 'next/server';

// 2. External libraries
import { jsPDF } from 'jspdf';

// 3. Internal libraries
import { auth } from '@/lib/auth';
import { getBlocksDB } from '@/lib/db/sessions';

// 4. Components
import { WorkCanvas } from '@/components/canvas/WorkCanvas';

// 5. Types
import type { Block, BlockType } from '@/types/blocks';
```

## Code Style

- **TypeScript strict mode** — all code must pass `tsc` without errors
- **ESLint** with Next.js rules (flat config in `eslint.config.mjs`)
- **No Prettier** — ESLint handles formatting
- **No console.log** in production code — use the centralized logger at `src/lib/logger.ts`

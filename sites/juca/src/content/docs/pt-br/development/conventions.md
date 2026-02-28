---
title: "Convenções de Código"
description: "Padrões de código, nomenclatura, padrões de autenticação e convenções de commits usados na codebase do Juca."
lang: pt-BR
sidebar:
  order: 2
---

# Convenções de Código

Esta página documenta todos os padrões de código adotados na codebase do Juca. Seguir essas convenções garante consistência e torna a codebase previsível tanto para contribuidores humanos quanto para IAs.

## Convenções de Nomenclatura

| Contexto | Convenção | Exemplo |
|---------|-----------|---------|
| Componentes | PascalCase | `WorkCanvas.tsx`, `PhaseRail.tsx` |
| Hooks | camelCase com prefixo `use` | `useFeatureFlag`, `useSSEStream` |
| Server Actions | camelCase | `updateDiagnosis`, `evaluatePrecedent` |
| Rotas de API | diretórios em kebab-case | `document-metadata/`, `validate-processo/` |
| Tipos de bloco | snake_case | `risk_balance`, `exit_card`, `action_prompt` |
| Feature flags | camelCase | `unifiedHome`, `deepMode` |
| Tokens CSS | kebab-case com prefixo `--` | `--color-primary`, `--radius-xl` |

## Padrões de Autenticação

A codebase usa dois padrões de autenticação. Nunca os misture:

**Server Actions** — Use `requireActionAuth()`:

```typescript
// src/actions/briefing.ts
'use server';
import { requireActionAuth } from '@/actions/utils';

export async function updateDiagnosis(sessionId: string, fields: object) {
  const user = await requireActionAuth(); // lança erro se não autorizado
  // ...
}
```

**Rotas de API** — Use `auth()` diretamente:

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
Nunca use `getServerSession()` — sempre use `auth()` de `@/lib/auth`. A codebase tem 100% de consistência nesse padrão.
:::

## Padrão de Criação de Blocos

Sempre use funções factory para criar blocos:

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

## Parâmetros de Rota no Next.js 16

Os parâmetros de rota no Next.js 16 são baseados em `Promise`:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // Precisa de await!
  // ...
}
```

## Convenções de Commit

```text
feat(scope): description        # Nova funcionalidade
fix(scope): description         # Correção de bug
docs: description               # Apenas documentação
chore: description              # Manutenção, dependências
```

Escopos: `rewrite`, `briefing`, `deploy`, `lint`, `test`, `auth`, etc.

Todos os commits incluem um header de co-autor:

```text
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## CSS e Animações

Abordagem CSS-first do Tailwind v4 — tokens em `src/app/globals.css`:

```css
:root {
  --color-primary: #000000;
  --color-accent: #fff06d;
  --color-bg-primary: #ffffff;
}
```

Utilitários de animação disponíveis:

| Classe | Efeito |
|--------|--------|
| `animate-fade-in` | 300ms fadeIn (translateY 10px→0, opacity 0→1) |
| `spring-transition` | `cubic-bezier(0.34, 1.56, 0.64, 1)` para sensação de mola |
| `animate-pulse` | Pulse nativo do Tailwind |
| `scroll-smooth-block` | Comportamento de scroll suave |

Para animações escalonadas:

```tsx
<div style={{
  animationDelay: `${index * 100}ms`,
  animationFillMode: 'backwards'
}}>
```

## Organização de Imports

Todos os imports usam o alias `@/`. Ordem:

```typescript
// 1. React / Next.js
import React, { useState } from 'react';
import { NextResponse } from 'next/server';

// 2. Bibliotecas externas
import { jsPDF } from 'jspdf';

// 3. Bibliotecas internas
import { auth } from '@/lib/auth';
import { getBlocksDB } from '@/lib/db/sessions';

// 4. Componentes
import { WorkCanvas } from '@/components/canvas/WorkCanvas';

// 5. Tipos
import type { Block, BlockType } from '@/types/blocks';
```

## Estilo de Código

- **TypeScript em modo estrito** — todo o código deve passar no `tsc` sem erros
- **ESLint** com regras do Next.js (configuração flat em `eslint.config.mjs`)
- **Sem Prettier** — o ESLint cuida da formatação
- **Sem `console.log`** em código de produção — use o logger centralizado em `src/lib/logger.ts`

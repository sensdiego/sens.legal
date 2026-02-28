---
title: "Guia de Testes"
description: "Como escrever e rodar testes no Juca — testes unitários com Vitest, testes de componentes com Testing Library e E2E com Playwright."
lang: pt-BR
sidebar:
  order: 3
---

# Guia de Testes

O Juca usa Vitest para testes unitários e de integração, Testing Library para testes de componentes e Playwright para testes E2E. Esta página cobre como rodar, escrever e as convenções de teste do projeto.

## Stack de Testes

| Ferramenta | Versão | Finalidade |
|-----------|--------|-----------|
| Vitest | ^4.0.18 | Runner de testes unitários e de integração |
| @vitest/coverage-v8 | ^4.0.18 | Provedor de cobertura V8 |
| Playwright | ^1.58.0 | Testes E2E (somente Chromium) |
| Testing Library | ^16.3.2 | Utilitários para testes de componentes React |
| jest-dom | ^6.9.1 | Matchers de asserção para o DOM |
| user-event | ^14.6.1 | Simulação de interação do usuário |
| jsdom | ^28.0.0 | Ambiente de browser para testes unitários |

## Rodando os Testes

```bash
# Testes unitários (execução única)
npm test

# Modo watch (reexecuta ao alterar arquivos)
npm run test:watch

# Relatório de cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e

# E2E com browser visível
npm run test:e2e:headed

# E2E com modo UI (depurador visual)
npm run test:e2e:ui
```

## Organização dos Arquivos de Teste

Os testes ficam junto ao código que testam:

| Local do Código | Local do Teste | Exemplo |
|---|---|---|
| `src/app/api/unified/sessions/route.ts` | `src/app/api/unified/sessions/__tests__/route.test.ts` | Teste de rota de API |
| `src/lib/blocks/types.ts` | `src/lib/blocks/__tests__/types.test.ts` | Teste de biblioteca |
| `src/components/blocks/DiagnosisBlock.tsx` | `src/components/blocks/__tests__/DiagnosisBlock.test.tsx` | Teste de componente |
| `src/actions/briefing.ts` | `src/actions/__tests__/briefing.test.ts` | Teste de Server Action |
| (fluxos E2E) | `e2e/*.spec.ts` | Specs end-to-end |
| (dados E2E) | `e2e/fixtures/briefing-blocks.ts` | Fixtures compartilhados |

## Diretivas de Ambiente

Arquivos de teste do Vitest podem especificar seu ambiente:

```typescript
// @vitest-environment node
// Use para: código server-side (jsPDF, SQLite, sistema de arquivos)

// @vitest-environment jsdom
// Use para: testes de componente (React, manipulação do DOM)
```

O ambiente padrão é `jsdom` (configurado em `vitest.config.ts`).

## Escrevendo Testes Unitários

### Testes de Block Factory

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

### Usando o Helper `makeBlock()`

O helper de testes `makeBlock()` cria fixtures de blocos com sobreposições de tipo e dados:

```typescript
const block = makeBlock({
  type: 'diagnosis',
  data: { situation: 'pesquisando', area: 'civil' }
});
```

## Escrevendo Testes E2E

Os testes E2E usam Playwright com mock de API via `page.route()`:

```typescript
import { test, expect } from '@playwright/test';

test('renders briefing blocks', async ({ page }) => {
  // Mock da resposta da API
  await page.route('/api/unified/analyze', async route => {
    await route.fulfill({
      json: { success: true, data: { blocks: mockBlocks } }
    });
  });

  await page.goto('/');
  await expect(page.getByTestId('work-canvas')).toBeVisible();
});
```

**Destaques da configuração do Playwright:**

| Configuração | Valor |
|-------------|-------|
| Browser | Somente Chromium (Desktop Chrome) |
| Paralelo | `true` |
| Retentativas | 2 no CI, 0 localmente |
| Screenshots | Somente em falhas |
| Traces | Na primeira retentativa |
| URL Base | `http://localhost:3000` |

## Status de Cobertura

| Área | Arquivos de Teste | Cobertura |
|------|------------------|-----------|
| Rotas de API (`src/app/api/`) | 51 | Boa |
| Lib de backend (`src/lib/`) | 48 | Boa |
| Componentes (`src/components/`) | 24 | Parcial (ui/ e blocks/ cobertos) |
| Server Actions (`src/actions/`) | 2 | Parcial |
| Specs E2E (`e2e/`) | 8 | Fluxos principais cobertos |

:::caution
**Problema conhecido:** 72 arquivos de teste estão falhando atualmente ([#270](https://github.com/sensdiego/juca/issues/270)). Muitos testam código de backend que está sendo migrado para o Valter. Esses testes precisam ser reavaliados antes do milestone v0.3.
:::

## Integração com CI

O GitHub Actions roda a cada push para `main`/`develop` e em PRs para `main`:

1. **Job lint-and-build:** `npm ci` → `npm run lint` → `npm run build`
2. **Job test-unit:** `npm ci` → `npm test` → `npm run test:coverage`

Os artefatos de cobertura são enviados com retenção de 14 dias.

:::note
Os testes E2E **ainda não rodam** no CI. A integração do Playwright com o GitHub Actions está planejada para o v0.5.
:::

---
title: "Arquivos de Configuração"
description: "Referência de todos os arquivos de configuração na raiz do projeto e suas principais definições."
lang: pt-BR
sidebar:
  order: 2
---

# Arquivos de Configuração

O Juca possui 11 arquivos de configuração na raiz do projeto. Esta página documenta a finalidade e as configurações principais de cada um.

## Inventário de Arquivos

| Arquivo | Finalidade |
|---------|-----------|
| `next.config.ts` | Configuração do framework Next.js |
| `tsconfig.json` | Opções do compilador TypeScript |
| `tailwind.config.ts` | Tailwind CSS v4 (mínimo — tokens definidos no CSS) |
| `postcss.config.mjs` | PostCSS com plugin do Tailwind |
| `vitest.config.ts` | Configuração de testes unitários |
| `playwright.config.ts` | Configuração de testes E2E |
| `eslint.config.mjs` | Configuração flat do ESLint com regras do Next.js |
| `.env.example` | Template de variáveis de ambiente |
| `.env.local` | Ambiente local (ignorado pelo git) |
| `Dockerfile` | Build de produção multi-estágio |
| `docker-compose.yml` | Serviço local do Neo4j para desenvolvimento |

## Configuração do Next.js

Configurações principais em `next.config.ts`:

| Configuração | Valor | Finalidade |
|-------------|-------|-----------|
| `output` | `'standalone'` | Builds otimizados para Docker |
| `serverExternalPackages` | `['better-sqlite3']` | Suporte a módulos nativos |
| Remoção de console | Somente em produção (mantém warn/error/info) | Logs de produção mais limpos |
| Headers de segurança | X-Frame-Options, X-Content-Type-Options, etc. | Boas práticas OWASP |
| Cache de API | `no-store, max-age=0` | Evitar respostas de API desatualizadas |

## Tailwind v4 (CSS-First)

O Tailwind v4 usa uma abordagem de configuração CSS-first. Os tokens de design são definidos em `src/app/globals.css` como propriedades customizadas do CSS, e não no `tailwind.config.ts`:

```css
/* src/app/globals.css — tokens de design */
:root {
  --color-primary: #000000;
  --color-accent: #fff06d;
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text-primary: #000000;
  --color-text-secondary: #666a6f;
  --radius-sm: 4px;
  --radius-full: 9999px;
  /* ... 50+ tokens para cores IRAC, níveis de confiança, temas do GC, sombras */
}
```

O arquivo `tailwind.config.ts` é mínimo — existe principalmente para registro de plugins.

## Aliases de Caminho TypeScript

O `tsconfig.json` configura um único alias de caminho:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Todos os imports em toda a codebase usam `@/` em vez de caminhos relativos:

```typescript
import { auth } from '@/lib/auth';
import { getBlocksDB } from '@/lib/db/sessions';
```

## Git Hooks

Hooks customizados em `.githooks/`:

| Hook | Ação |
|------|------|
| `pre-commit` | Executa ESLint nos arquivos em stage |
| `pre-push` | Executa o conjunto completo de testes do Vitest |
| `post-checkout` | Tarefas de limpeza |
| `post-commit` | Tarefas de limpeza |
| `post-merge` | Tarefas de limpeza |

Configurado via `package.json`:

```json
{ "scripts": { "prepare": "git config core.hooksPath .githooks" } }
```

## Docker

O `Dockerfile` usa um build de 3 estágios:

1. **deps** — `npm ci` com dependências de produção
2. **build** — `next build` com saída standalone
3. **runtime** — Imagem mínima do Node.js com apenas artefatos de produção

O `docker-compose.yml` fornece uma instância local do Neo4j Community 5 para desenvolvimento. Isso será descontinuado após a conclusão da migração para o Valter.

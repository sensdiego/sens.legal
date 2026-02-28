---
title: "Stack Tecnológica"
description: "Stack tecnológica completa com versões, justificativas e status de transição de cada dependência."
lang: pt-BR
sidebar:
  order: 2
---

# Stack Tecnológica

Cada dependência do Juca está aqui por um motivo. Esta página lista a stack completa com versões, finalidades e status atual — incluindo quais pacotes são transitórios (serão removidos quando a migração para o Valter for concluída).

## Framework Principal

| Biblioteca | Versão | Finalidade | Status |
|------------|--------|------------|--------|
| Next.js | ^16.1.6 | App Router, Server Components, Server Actions | **Ativo** |
| React | 19.2.3 | Framework de UI (recursos concorrentes, hook use()) | **Ativo** |
| React DOM | 19.2.3 | Renderizador do React | **Ativo** |
| TypeScript | ^5 | Tipagem em toda a stack | **Ativo** |
| Tailwind CSS | ^4.1.18 | Framework utilitário CSS-first (v4) | **Ativo** |
| @tailwindcss/postcss | ^4.1.18 | Integração PostCSS para o Tailwind | **Ativo** |

:::note
O Tailwind v4 usa uma abordagem **CSS-first**. Os design tokens são definidos em `src/app/globals.css` como propriedades customizadas CSS, e não em `tailwind.config.ts`. Veja [Convenções](/development/conventions) para detalhes.
:::

## Provedores de LLM

Esses SDKs alimentam o pipeline local de multi-LLM. São **transitórios** — o processamento de LLM está migrando para a API Valter.

| Biblioteca | Versão | Finalidade | Status |
|------------|--------|------------|--------|
| @anthropic-ai/sdk | ^0.71.2 | Claude (Sonnet 4, Opus 4, Haiku 3.5) — gerador e revisor | **Transitório** |
| openai | ^6.16.0 | OpenAI (GPT-5.x, o3) + DeepSeek (SDK compartilhado) | **Transitório** |
| @google/generative-ai | ^0.24.1 | Gemini (2.5 Flash/Pro) | **Transitório** |
| groq-sdk | ^0.37.0 | Groq (Qwen 3 32B, Llama 3.3 70B) — critics para inferência rápida | **Transitório** |

## Banco de Dados

| Biblioteca | Versão | Finalidade | Status |
|------------|--------|------------|--------|
| better-sqlite3 | ^12.6.2 | Persistência de sessões e blocks (modo WAL, chaves estrangeiras) | **Ativo** — migrará para Postgres na v0.6+ |
| sqlite-vec | ^0.1.7-alpha.2 | Extensão de busca vetorial para SQLite | **Transitório** |
| neo4j-driver | ^6.0.1 | Grafo de Conhecimento via adapter pattern (JSON ou Neo4j) | **Transitório** — KG migrando para o Valter |

## Autenticação

| Biblioteca | Versão | Finalidade | Status |
|------------|--------|------------|--------|
| next-auth | ^5.0.0-beta.30 | NextAuth v5 — Google OAuth + magic links via Resend, sessões JWT | **Ativo** |

## Bibliotecas de UI

| Biblioteca | Versão | Finalidade | Status |
|------------|--------|------------|--------|
| lucide-react | ^0.563.0 | Biblioteca de ícones | **Ativo** |
| swr | ^2.3.8 | Busca de dados (uso mínimo — apenas `useHealthCheck`) | **Em revisão** |

## Utilitários

| Biblioteca | Versão | Finalidade | Status |
|------------|--------|------------|--------|
| jspdf | ^4.2.0 | Geração de PDF a partir de sessões de briefing | **Ativo** |
| pdf-parse | ^2.4.5 | Leitura de PDFs enviados para análise | **Transitório** |
| uuid | ^13.0.0 | Geração de IDs (uso mínimo — apenas health checks) | **Em revisão** |
| yauzl | ^3.2.0 | Extração de ZIP (apenas scripts de ingestão) | **Transitório** |

## Observabilidade

| Biblioteca | Versão | Finalidade | Status |
|------------|--------|------------|--------|
| @opentelemetry/api | ^1.9.0 | API de rastreamento distribuído | **Ativo** (opt-in) |
| @opentelemetry/sdk-node | ^0.211.0 | SDK OTel para Node.js | **Ativo** (opt-in) |
| @opentelemetry/exporter-trace-otlp-http | ^0.211.0 | Exportador OTLP HTTP | **Ativo** (opt-in) |

## Ferramentas de Desenvolvimento

| Biblioteca | Versão | Finalidade |
|------------|--------|------------|
| vitest | ^4.0.18 | Testes unitários e de integração |
| @vitest/coverage-v8 | ^4.0.18 | Relatórios de cobertura V8 |
| @playwright/test | ^1.58.0 | Testes E2E (apenas Chromium) |
| @testing-library/react | ^16.3.2 | Utilitários para teste de componentes |
| @testing-library/jest-dom | ^6.9.1 | Matchers de asserção para o DOM |
| @testing-library/user-event | ^14.6.1 | Simulação de interações do usuário |
| jsdom | ^28.0.0 | Ambiente de browser para o Vitest |
| eslint | ^9 | Linting com as regras do Next.js |
| @next/bundle-analyzer | ^16.1.4 | Análise do tamanho do bundle |
| dotenv | ^17.2.3 | Carregamento de variáveis de ambiente |

## Build e Deploy

| Ferramenta | Finalidade |
|------------|------------|
| Turbopack | Servidor de desenvolvimento (via Next.js 16) |
| Docker (multi-stage) | Builds de produção com saída standalone |
| GitHub Actions | Pipeline de CI (lint + build + testes unitários) |
| Railway | Hospedagem em produção (auto-deploy a partir de `main`) |
| Git LFS | Armazenamento de arquivos grandes para arquivos de dados |
| Git hooks customizados (`.githooks/`) | Lint no pre-commit, testes no pre-push |

## Saúde das Dependências

Após a limpeza estrutural (2026-02-28), a árvore de dependências está limpa:

- **4 dependências fantasma removidas:** zustand, @tanstack/react-virtual, next-pwa, resend
- **2 dependências em revisão:** uuid e swr (uso mínimo, candidatas à remoção)
- **Todas as dependências restantes** são ativamente importadas e usadas no código de produção
- **Zero segredos hardcoded** — todas as chaves de API e URLs via variáveis de ambiente

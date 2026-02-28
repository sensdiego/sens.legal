---
title: "Funcionalidades"
description: "Inventário completo de funcionalidades com status de implementação, atribuição de milestones e links para documentação detalhada."
lang: pt-BR
sidebar:
  order: 1
---

# Funcionalidades

Esta página inventaria todas as funcionalidades do Juca com seu status atual. As funcionalidades estão organizadas por estágio do ciclo de vida: implementadas, em progresso, planejadas e depreciadas.

## Legenda de Status

| Badge | Significado |
|-------|-------------|
| ✅ Implementado | Totalmente funcional em produção |
| 🔨 Em Progresso | Parcialmente implementado, em desenvolvimento ativo |
| 📋 Planejado | Desenhado mas ainda não iniciado |
| ⚠️ Transitório | Funciona, mas será removido/substituído durante a migração para o Valter |
| ❌ Depreciado | Removido ou substituído |

## Funcionalidades Principais

| Funcionalidade | Status | Milestone | Docs |
|----------------|--------|-----------|------|
| [Block System](/features/block-system) (11 tipos) | ✅ Implementado | — | [Detalhes](/features/block-system) |
| [Briefing Progressivo](/features/briefing/) (4 fases) | 🔨 Em Progresso | v0.4 | [Detalhes](/features/briefing/) |
| [Composer + Detecção de Intenção](/features/composer) | ✅ Implementado | — | [Detalhes](/features/composer) |
| [Gerenciamento de Sessão](/features/session-management) | ✅ Implementado | — | [Detalhes](/features/session-management) |
| [Exportação PDF](/features/pdf-export) | ✅ Implementado | — | [Detalhes](/features/pdf-export) |
| [Autenticação](/features/auth) (NextAuth v5) | ✅ Implementado | — | [Detalhes](/features/auth) |
| [Feature Flags](/features/feature-flags) | ✅ Implementado | — | [Detalhes](/features/feature-flags) |
| SSE Streaming | ✅ Implementado | — | [Composer](/features/composer) |
| Rastreamento OpenTelemetry | ✅ Implementado | — | [Integrações](/configuration/integrations) |
| Deploy Docker + Railway | ✅ Implementado | — | [Instalação](/getting-started/installation) |
| CI (GitHub Actions) | ✅ Implementado | — | [Testes](/development/testing) |

## Funcionalidades Transitórias (Migrando para o Valter)

Estas funcionalidades existem no backend local do Juca, mas estão sendo substituídas por chamadas à API do Valter:

| Funcionalidade | Localização Atual | Substituto no Valter | Remoção |
|----------------|-------------------|----------------------|---------|
| Busca Híbrida (BM25 + Semântica + KG) | `src/lib/backend/search/` | `/v1/retrieve` | v0.4 |
| Pipeline Multi-LLM (G,C,R) | `src/lib/backend/llm/`, `chat-pipeline/` | Pipeline interno do Valter | v0.4 |
| Extração IRAC | `src/lib/backend/reasoning/` | Interno do Valter | v0.4 |
| Adaptador de Grafo de Conhecimento | `src/lib/backend/kg/` | `/v1/graph/*` | v0.4 |
| Validação Anti-Alucinação | `src/lib/validation/` | `/v1/verify` | v0.4 |
| Pipeline do Analisador de Casos | `src/lib/backend/analyzer/` | Adaptado para chamar o Valter | v0.4 |

## Funcionalidades Planejadas

| Funcionalidade | Prioridade | Milestone | Issue |
|----------------|------------|-----------|-------|
| Redesign de UI (design Liquid Legal) | P0 | v0.3 | [#273](https://github.com/sensdiego/juca/issues/273) |
| Camada adaptadora do Valter | P0 | v0.3 | [#292](https://github.com/sensdiego/juca/issues/292) |
| Integração Juca → Valter | P0 | v0.3 | [#293](https://github.com/sensdiego/juca/issues/293) |
| Corrigir 72 testes falhando | P1 | v0.3 | [#270](https://github.com/sensdiego/juca/issues/270) |
| Briefing F1–F4 completo | P1 | v0.4 | [#285](https://github.com/sensdiego/juca/issues/285)–[#288](https://github.com/sensdiego/juca/issues/288) |
| PDF do Briefing | P1 | v0.4 | [#289](https://github.com/sensdiego/juca/issues/289) |
| Remover backend duplicado | P1 | v0.4 | [#295](https://github.com/sensdiego/juca/issues/295) |
| Comparação de divergências | P2 | v0.5 | [#155](https://github.com/sensdiego/juca/issues/155) |
| Exportação de memo (PDF/DOCX) | P2 | v0.5 | [#158](https://github.com/sensdiego/juca/issues/158) |
| E2E no CI | P2 | v0.5 | — |
| Integração Leci | P2 | v0.6+ | — |
| Ledger de custo de LLM | P3 | v0.6+ | [#232](https://github.com/sensdiego/juca/issues/232) |
| SQLite → PostgreSQL | P3 | v0.6+ | [#231](https://github.com/sensdiego/juca/issues/231) |
| Plataforma de Skills | P3 | v1.0+ | [#193](https://github.com/sensdiego/juca/issues/193) |

## Funcionalidades Depreciadas

| Funcionalidade | Motivo | Substituído Por |
|----------------|--------|-----------------|
| Navegação por abas (6 abas) | Substituída no rewrite | Unified Home + Block System |
| Sistema de painéis (`_panels/`, 8 painéis) | Removido no rewrite | Block System |
| Stores Zustand (11 stores) | Removidos no rewrite | React `useState` + Server Actions |
| Juca Semantic (busca por embeddings) | Nunca chegou a produção | Valter `/v1/retrieve` |
| Juca Compare (multi-modelo) | Baixa prioridade com foco no hub | Pode retornar via Valter |
| Juca Insights (analytics) | Baixa prioridade | Endpoints de grafo do Valter |
| Backend local (search/LLM/KG) | Duplicado pelo Valter | API REST do Valter |

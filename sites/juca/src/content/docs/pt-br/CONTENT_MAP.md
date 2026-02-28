---
title: Mapa de Conteúdo
description: Mapeia cada arquivo de documentação para sua fonte de conteúdo, prioridade e status.
lang: pt-BR
sidebar:
  order: 99
---

# Mapa de Conteúdo

> Mapeia cada arquivo de documentação para seu conteúdo, fonte e prioridade durante a fase de redação de conteúdo.

## Legenda de Prioridade

| Prioridade | Significado |
|----------|---------|
| **P0** | Essencial — deve estar completo antes do site de documentação entrar em produção |
| **P1** | Importante — deve estar completo para um site de documentação útil |
| **P2** | Pode aguardar — agradável ter, mas não bloqueante |

---

## Página Inicial & Primeiros Passos

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `index.md` | Visão geral do projeto, capacidades principais, diagrama do ecossistema, links rápidos | ROADMAP.md, PROJECT_MAP.md | **P0** |
| `getting-started/introduction.md` | O que é Juca, por que existe, contexto do ecossistema, conceitos principais | ROADMAP.md "Visao do Produto", PROJECT_MAP.md §1, §5 | **P0** |
| `getting-started/quickstart.md` | Setup de 5 minutos: clone, .env mínimo, npm run dev, primeira interação | README.md, PROJECT_MAP.md §4 | **P0** |
| `getting-started/installation.md` | Setup completo: todos os serviços, Docker, Git hooks, troubleshooting | README.md, PROJECT_MAP.md §3-§4, docker-compose.yml | **P1** |

## Arquitetura

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `architecture/overview.md` | Arquitetura do Hub, pontos de entrada, fluxo de dados, matriz de responsabilidades | PROJECT_MAP.md §5, ROADMAP.md | **P0** |
| `architecture/stack.md` | Tabela completa de dependências com versões, status, justificativas | PROJECT_MAP.md §3, REORG_PLAN.md §2.3 | **P1** |
| `architecture/decisions.md` | 7 ADRs: Unified Home, SQLite, adaptador KG, decomposição do orquestrador, briefing, pivot do hub, Liquid Legal | PROJECT_MAP.md §8, ROADMAP.md decisions, docs/ui-reference.tsx | **P1** |
| `architecture/diagrams.md` | 6 diagramas Mermaid: ecossistema, componentes, ciclo de vida de consultas, fluxo do briefing, tipos de blocos, deployment | PROJECT_MAP.md §5 diagrams, ROADMAP.md ecosystem | **P1** |
| `architecture/ecosystem.md` | Visão geral dos 3 projetos sens.legal: Juca, Valter, Leci | ROADMAP.md ecosystem, exploração dos projetos Valter/Leci | **P0** |

## Funcionalidades

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `features/index.md` | Inventário de funcionalidades com badges de status (implementado/em progresso/planejado/descontinuado) | ROADMAP.md features tables | **P0** |
| `features/block-system.md` | 11 tipos de blocos, ciclo de vida, padrão factory, referência de componentes, guia "adicionando novo bloco" | PROJECT_MAP.md §2 §5, src/lib/blocks/types.ts, src/components/blocks/ | **P0** |
| `features/briefing/index.md` | Visão geral do Briefing Progressivo, fluxo de fases, PhaseRail, abordagem de implementação | ROADMAP.md, Issues #283-289 | **P0** |
| `features/briefing/phase-1-diagnosis.md` | Detalhe da F1: cartão de diagnóstico, endpoints Valter, fluxo UX | Issue #285, src/actions/briefing.ts | **P1** |
| `features/briefing/phase-2-precedents.md` | Detalhe da F2: cartões de precedentes, seleção, busca Valter | Issue #286 | **P1** |
| `features/briefing/phase-3-risks.md` | Detalhe da F3: balanço de risco, Contradição Estratégica, grafo Valter | Issue #287, INNOVATION_LAYER.md | **P1** |
| `features/briefing/phase-4-delivery.md` | Detalhe da F4: 4 modos de entrega, cartão de saída, integração com PDF | Issue #288 | **P1** |
| `features/composer.md` | UI do Composer, detecção de intenção, registro de ferramentas, streaming SSE, fluxo de clarificação | PROJECT_MAP.md §2 §5, src/lib/unified/ | **P1** |
| `features/session-management.md` | Sessões, persistência SQLite, sidebar, server actions, problemas conhecidos | PROJECT_MAP.md §2, src/lib/db/ | **P1** |
| `features/pdf-export.md` | Geração de PDF, endpoint da API, futuro PDF do briefing | src/lib/pdf/generator.ts, Issue #289 | **P2** |
| `features/auth.md` | NextAuth v5, OAuth do Google, magic links, bypass dev, problemas conhecidos | PROJECT_MAP.md §3 §4, src/lib/auth.ts | **P2** |
| `features/feature-flags.md` | Sistema de flags, flags disponíveis, padrões de uso | src/lib/featureFlags.ts | **P2** |

## Configuração

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `configuration/environment.md` | Todos os 30+ variáveis de ambiente organizados por categoria com descrições e padrões | PROJECT_MAP.md §4 complete table | **P0** |
| `configuration/settings.md` | Referência de 11 arquivos de configuração: next.config, tsconfig, tailwind, vitest, playwright, etc. | REORG_PLAN.md §2.2, root config files | **P1** |
| `configuration/integrations.md` | Setup de serviços externos: Valter, provedores LLM, provedores de autenticação, Neo4j, Railway | PROJECT_MAP.md §3, ROADMAP.md | **P1** |

## Desenvolvimento

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `development/setup.md` | Setup do ambiente de desenvolvimento, scripts, workflow multi-agent, regras importantes | README.md, CLAUDE.md, package.json | **P0** |
| `development/conventions.md` | Estilo de código, nomeação, padrões de autenticação, criação de blocos, formato de commits, animações | patterns.md, CLAUDE.md | **P0** |
| `development/testing.md` | Stack de testes, executar testes, organização, escrever testes unitários/E2E, status de cobertura | PROJECT_MAP.md §9, patterns.md "Test Patterns" | **P1** |
| `development/contributing.md` | Branching, diretrizes de PR, regras de agentes IA, princípios de arquitetura | CLAUDE.md, agent_docs/ | **P1** |

## Referência da API

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `api/index.md` | Visão geral da arquitetura da API, tabela de grupos de rotas, padrão de autenticação | PROJECT_MAP.md §2 | **P1** |
| `api/valter-adapter.md` | Camada adaptadora Valter, tabela de endpoints, autenticação, mapeamento de requisição/resposta | ROADMAP.md, exploração da API Valter | **P0** |
| `api/unified.md` | Endpoints unificados: CRUD de sessões, análise, stream SSE | src/app/api/unified/, src/app/api/v2/ | **P1** |
| `api/briefing.md` | Server actions do briefing, exportação de PDF, lista de endpoints transicionais | src/actions/briefing.ts | **P2** |
| `api/export.md` | Detalhe do endpoint de exportação de PDF, internals de geração | src/app/api/export/, src/lib/pdf/ | **P2** |

## Roadmap

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `roadmap/index.md` | Direção estratégica, milestone atual, tabela de visão geral, decisões pendentes | ROADMAP.md | **P0** |
| `roadmap/milestones.md` | Detalhamento dos milestones v0.3–v1.0 com funcionalidades e critérios | ROADMAP.md milestones | **P1** |
| `roadmap/changelog.md` | Histórico: rewrite (Waves 0-5), cleanup, migração KG, autenticação, origens | MEMORY.md, REORG_PLAN.md, PROJECT_MAP.md | **P2** |

## Referência

| Arquivo | Conteúdo | Fonte | Prioridade |
|------|---------|--------|----------|
| `reference/glossary.md` | Termos legais (STJ, súmula, acórdão, etc.) + termos técnicos (bloco, hub, etc.) | Codebase, sistema legal brasileiro | **P1** |
| `reference/faq.md` | Perguntas comuns sobre arquitetura, desenvolvimento, troubleshooting | Todas as fontes de docs | **P2** |
| `reference/troubleshooting.md` | Problemas de instalação, erros de runtime, falhas de testes, regras de build | Problemas comuns, PROJECT_MAP.md §10 | **P1** |

---

## Resumo

| Prioridade | Contagem | Descrição |
|----------|-------|-------------|
| **P0** | 12 | Essencial para lançamento de docs — visão geral, arquitetura, funcionalidades principais, setup, configuração |
| **P1** | 17 | Importante para completude — funcionalidades detalhadas, ADRs, testes, integrações |
| **P2** | 7 | Pode aguardar — exportação de PDF, detalhes de autenticação, FAQ, changelog, endpoints do briefing |
| **Total** | **36** | |

---

## Docs Legados — Resolução

| Arquivo | Status | Resolução |
|------|--------|------------|
| `docs/SEMANTIC_SEARCH_SETUP.md` | Arquivado | Movido para `_archive/docs/`. Conteúdo transicional (serviço local de embedding sendo substituído pelo Valter). |
| `docs/LOGGER_USAGE.md` | Arquivado | Movido para `_archive/docs/`. Uso de logger documentado em convenções. |
| `docs/truncation-audit.md` | Arquivado | Previamente arquivado. Histórico — não mais relevante pós-migração Valter. |
| `docs/ANALYZER_CONSOLIDATED_SPEC.md` | Absorvido | Partes principais absorvidas em `features/composer.md` (seção do analisador). |
| `docs/api-response.md` | Absorvido | Absorvido em `api/index.md` (seção Response Envelope). Arquivado. |
| `docs/orchestrator-diagnostics.md` | Arquivado | Movido para `_archive/docs/`. Transicional (pipeline do orquestrador migrando para Valter). |
| `docs/database-architecture-decisions.md` | Absorvido | Conteúdo absorvido em `architecture/decisions.md` (ADR-002). |
| `docs/ui-reference.tsx` | Mantido | Referência de design — referenciada por ADR-007 e docs de funcionalidades. |

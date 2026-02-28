---
title: Roadmap
description: Visão geral do roadmap do produto com o status atual dos milestones e direção estratégica.
lang: pt-BR
sidebar:
  order: 1
---

# Roadmap

> Roadmap do produto Juca — o hub frontend do ecossistema sens.legal.

## Direção Estratégica

O Juca está passando de um monólito fullstack para um **hub frontend leve** do ecossistema sens.legal. A inteligência de backend (busca, pipeline de LLM, grafo de conhecimento, validação) está sendo delegada a agentes especializados: **Valter** para jurisprudência do STJ e **Leci** para legislação federal. O papel do Juca é oferecer uma interface conversacional elegante (no estilo Fintool/Perplexity) que orquestra esses agentes, gerencia sessões de usuários e entrega resultados por meio do Briefing Progressivo (sistema de 4 fases de revelação progressiva).

## Milestone Atual

**v0.3 — "Hub Foundation"** está em andamento. Entregas principais:

- Reset de UI com design Fintool/Perplexity-style (linguagem de design Liquid Legal)
- Camada de adapter para agentes externos (Valter, Leci, futuros agentes)
- Integração Juca → Valter (endpoints de busca, verificação e grafo)
- Corrigir 72 arquivos de teste falhando (#270)
- Atualizar README.md para refletir a arquitetura hub

Veja [Milestones](/roadmap/milestones) para detalhes completos de todos os milestones.

## Visão Geral dos Milestones

| Milestone | Nome | Status | Foco |
|-----------|------|--------|------|
| **v0.3** | Hub Foundation | Em andamento | Reset de UI + integração Valter |
| **v0.4** | Briefing Progressivo | Planejado | Briefing de 4 fases com Valter como backend |
| **v0.5** | Polimento & Expansão | Planejado | Features de grafo, exportação de memorando, E2E no CI |
| **v0.6+** | Plataforma Multi-Agente | Planejado | Integração Leci, preparação para escala |
| **v1.0** | Lançamento da Plataforma | Planejado | Multi-tenancy, billing, lançamento público |

## Decisões Arquiteturais Pendentes

| # | Questão | Impacto | Status |
|---|---------|---------|--------|
| 1 | Como o Juca se autentica no Valter? (Chave única vs. por usuário vs. token de serviço) | Camada de adapter (v0.3) | Pendente |
| 3 | O que acontece com as ~55 rotas de API pós-migração? (Remover vs. proxy vs. fallback) | Tamanho da codebase (v0.4) | Pendente |
| 4 | Manter SQLite para sessões ou migrar para Postgres? | Alinhamento com o ecossistema | Pendente (pode aguardar v0.6+) |
| 7 | O que fazer com o diretório `data/` local (~80MB)? | Tamanho do repositório | Pendente (manter até v0.4) |

As decisões #2 (template de UI), #5 (escopo do briefing) e #6 (deployment do Valter) já foram resolvidas. Veja [Decisões de Arquitetura](/architecture/decisions) para detalhes.

## Páginas Detalhadas

- [Milestones](/roadmap/milestones) — Detalhamento dos milestones com features, critérios e dependências
- [Changelog](/roadmap/changelog) — Histórico de mudanças significativas e mudanças arquiteturais

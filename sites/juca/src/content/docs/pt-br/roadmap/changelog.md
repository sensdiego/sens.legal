---
title: Changelog
description: Histórico de mudanças significativas, milestones e mudanças arquiteturais.
lang: pt-BR
sidebar:
  order: 3
---

# Changelog

> Histórico de mudanças significativas, milestones concluídos e mudanças arquiteturais no projeto Juca.

## 2026-02-28 — Limpeza Estrutural & Documentação

**Fase de planejamento estratégico e limpeza:**

- Criado `PROJECT_MAP.md` — diagnóstico técnico abrangente de toda a codebase
- Criado `ROADMAP.md` — roadmap do produto com milestones v0.3 até v1.0
- Criado `REORG_PLAN.md` — avaliação de reorganização estrutural
- Criado `INNOVATION_LAYER.md` — propostas de inovação para desenvolvimento futuro
- Removidas 4 dependências fantasmas: `zustand`, `@tanstack/react-virtual`, `next-pwa`, `resend` (290 pacotes removidos)
- Excluído diretório vazio `src/stores/` (sobra da remoção do Zustand)
- Removidos ~76MB de arquivos de backup redundantes de `data/`
- Arquivados 4 arquivos de documentação obsoletos em `_archive/`
- Criada estrutura de documentação padronizada em `docs/` (36 arquivos)

## 2026-02-25 — Rewrite Completo (Waves 0-5)

**Grande reescrita arquitetural** migrando da navegação por abas para o Unified Home + Sistema de Blocos:

- **Wave 0 (Fundação):** Sistema de tipos de bloco, funções factory, schema de banco de dados
- **Wave 1 (Componentes Principais):** WorkCanvas, PhaseRail, Composer, SessionSidebar
- **Wave 2 (Lógica de Briefing):** Server actions para o fluxo de briefing de 4 fases, máquina de estados
- **Wave 3 (Renderers de Bloco):** 11 renderers de tipos de bloco com elementos interativos
- **Wave 4 (Integração):** Página Unified Home, streaming SSE, feature flags
- **Wave 5 (Testes):** 1.722 testes unitários em 124 arquivos de teste, 60 testes E2E em 8 arquivos spec

**Removidos:**
- Navegação por abas (Chat, Juris, Ratio, Compare, Insights, Semantic)
- Sistema de painéis (`_panels/`, 8 painéis carregados de forma lazy)
- Gerenciamento de estado com Zustand (11 stores → React `useState` + Server Actions)

**Tags:** `wave-0-foundation` até `wave-5-final`, `pre-kill-switch`

## 2026-02 — Migração do Grafo de Conhecimento para Neo4j

- Implementado padrão de adapter suportando backends JSON e Neo4j
- Feature flag: `KG_PROVIDER=json|neo4j`
- Neo4j Aura no plano gratuito implantado em produção
- 6.000+ nós, 104.000+ relacionamentos
- Issue #253

## 2026-01 — Implementação de Autenticação

- NextAuth v5 com Google OAuth + magic links via Resend
- Sessões baseadas em JWT (sem tabela de sessão no banco de dados)
- Modo de bypass para desenvolvimento (`ENABLE_DEV_AUTH=true`)
- Verificação `isAdmin()` para operações administrativas
- Issue #226

## História Anterior

**Origens do projeto:** O Juca começou como uma aplicação fullstack Next.js para análise de jurisprudência do STJ. O corpus inicial continha 1.556 decisões, posteriormente expandido para 23.400+ via Valter.

**Arquitetura original:**
- Busca híbrida embutida (BM25 + semântica + fusão de GC)
- Pipeline multi-LLM (Gerar → Criticar → Revisar) com 5 provedores
- Extração IRAC (Issue, Rule, Application, Conclusion)
- Grafo de conhecimento com Neo4j + adapter JSON
- Validação anti-alucinação (súmulas, ministros, processos)

Essa arquitetura está agora em transição para um modelo hub, onde o Juca se foca na orquestração frontend e o Valter trata a inteligência de backend.

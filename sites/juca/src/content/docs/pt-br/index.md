---
title: "Juca — Hub de IA Jurídica"
description: "Juca é o hub frontend do ecossistema sens.legal — uma interface conversacional que orquestra agentes de IA jurídica especializados para pesquisa jurídica brasileira."
lang: pt-BR
sidebar:
  order: 0
---

# Juca

Juca é o hub frontend do ecossistema **sens.legal** — uma interface conversacional que orquestra agentes de IA jurídica especializados para pesquisa jurídica brasileira.

Construído com Next.js 16 e React 19, o Juca oferece uma interface no estilo Fintool/Perplexity onde advogados interagem com um Composer unificado, e o sistema encaminha as consultas ao agente backend correto. Os resultados são renderizados como **Blocks** estruturados — cards de UI tipados que apresentam diagnósticos, precedentes, análises de risco e recomendações estratégicas.

## Principais Funcionalidades

O valor central do Juca é a **divulgação progressiva de análises jurídicas** por meio do sistema Briefing Progressivo:

- **[Sistema de Blocks](/features/block-system)** — 11 blocks de UI tipados que renderizam conteúdo jurídico estruturado (diagnósticos, precedentes, balanços de risco, entregas)
- **[Briefing Progressivo](/features/briefing/)** — Divulgação progressiva em 4 fases: Diagnóstico → Precedentes → Riscos → Entrega
- **[Integração com o Valter](/api/valter-adapter)** — Consome a API REST do Valter para pesquisa de jurisprudência do STJ, verificação de citações e análise de grafo de conhecimento
- **[Gerenciamento de Sessões](/features/session-management)** — Sessões persistentes com SQLite, navegáveis pela barra lateral
- **[Exportação para PDF](/features/pdf-export)** — Gera documentos PDF a partir de sessões de briefing
- **[Streaming em Tempo Real](/features/composer)** — Streaming de progresso via SSE durante a análise

## O Ecossistema sens.legal

O Juca não funciona sozinho. Ele é a camada voltada ao usuário de um ecossistema com três projetos:

```mermaid
graph TB
    subgraph "Frontend"
        Juca["Juca<br/>Next.js 16 · React 19<br/>Block System · SSE<br/>Lightweight Orchestrator"]
    end
    subgraph "Backend Agents"
        Valter["Valter<br/>FastAPI · Python<br/>23.4K STJ Decisions<br/>KG · Search · LLM Pipeline"]
        Leci["Leci<br/>Next.js · Drizzle<br/>Federal Legislation<br/>DB-first · v0.1-pre"]
    end
    Juca -->|"REST API"| Valter
    Juca -.->|"REST API (future)"| Leci
```

Veja [Arquitetura → Ecossistema](/architecture/ecosystem) para detalhes sobre cada projeto.

## Links Rápidos

| Quero... | Ir para |
|---|---|
| Rodar o Juca localmente em 5 minutos | [Quickstart](/getting-started/quickstart) |
| Entender a arquitetura | [Visão Geral da Arquitetura](/architecture/overview) |
| Aprender sobre o Sistema de Blocks | [Sistema de Blocks](/features/block-system) |
| Ver o roadmap do produto | [Roadmap](/roadmap/) |
| Configurar variáveis de ambiente | [Ambiente](/configuration/environment) |
| Escrever ou rodar testes | [Guia de Testes](/development/testing) |

## Status do Projeto

O Juca está atualmente na fase **v0.3 — "Hub Foundation"**: transformando-se de um monólito fullstack em um hub frontend leve conectado ao agente backend Valter. Veja o [Roadmap](/roadmap/) para detalhes sobre os marcos.

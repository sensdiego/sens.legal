---
title: "Introdução"
description: "O que é o Juca, por que ele existe e como ele se encaixa no ecossistema de IA jurídica do sens.legal."
lang: pt-BR
sidebar:
  order: 1
---

# Introdução

Juca (Jurisprudence Understanding for Contextual Analysis) é o hub frontend da plataforma **sens.legal** — um ecossistema de IA jurídica projetado para substituir ferramentas de pesquisa fragmentadas por uma interface única e inteligente para profissionais do direito brasileiro.

## O Problema

A pesquisa jurídica brasileira está fragmentada em dezenas de ferramentas desconectadas. Advogados passam horas consultando bases de dados de tribunais, cruzando decisões e extraindo raciocínio jurídico manualmente — apenas para produzir análises que podem deixar passar precedentes críticos ou conter citações alucinadas geradas por ferramentas de IA.

As ferramentas de IA jurídica existentes ou carecem de profundidade no domínio (chatbots genéricos) ou carecem de usabilidade (despejam resultados brutos sem estrutura). Nenhuma oferece análise adversarial, divulgação progressiva ou rastreamento de raciocínio baseado em grafos.

## A Solução

O Juca é um **hub frontend conversacional** — não uma aplicação monolítica. Ele oferece:

1. **Uma interface limpa no estilo Fintool/Perplexity** onde advogados digitam consultas em linguagem natural
2. **Divulgação progressiva** via o Briefing Progressivo (sistema de 4 fases que revela a análise de forma incremental)
3. **Orquestração** de agentes backend especializados que fazem o trabalho pesado (busca, processamento com LLM, consultas ao grafo de conhecimento)
4. **Saída estruturada** por meio do Sistema de Blocks — 11 blocks de UI tipados que renderizam diagnósticos, precedentes, análises de risco e recomendações estratégicas

O Juca em si é intencionalmente leve. A inteligência vive nos agentes backend.

## O Ecossistema

O sens.legal é composto por três projetos, cada um com uma responsabilidade distinta:

| Projeto | Papel | Stack | Status |
|---------|-------|-------|--------|
| **Juca** (este projeto) | Hub frontend + orquestrador leve | Next.js 16, React 19, TypeScript, Tailwind v4 | Em desenvolvimento ativo (v0.3) |
| **Valter** | Agente backend para jurisprudência do STJ | Python, FastAPI, PostgreSQL, Qdrant, Neo4j Aura, Redis | Produção (`valter-api-production.up.railway.app`) |
| **Leci** | Agente backend para legislação federal | TypeScript, Next.js, Drizzle ORM, PostgreSQL + pgvector | Estágio inicial (v0.1-pre, apenas schema do BD) |

O Juca se comunica com o Valter via REST API. A integração com o Leci está planejada para v0.6+.

## Para Quem É Esta Documentação?

Esta documentação atende quatro públicos:

- **Profissionais do direito** — Usuários finais que interagem com a interface do Juca para pesquisar jurisprudência
- **Desenvolvedores** — Engenheiros que contribuem com o código (humanos ou IA)
- **Agentes de IA** — Claude Code, Codex e futuros agentes que operam no código via instruções do CLAUDE.md
- **Stakeholders** — O dono do projeto e potenciais investidores avaliando a plataforma

## Conceitos Fundamentais

Antes de se aprofundar, familiarize-se com estes conceitos centrais:

| Conceito | Definição |
|----------|-----------|
| **Block** | Uma unidade de conteúdo de UI tipada. O Juca tem 11 tipos de block (message, diagnosis, precedent, risk_balance, delivery, etc.). Blocks são a unidade fundamental de composição da interface. |
| **Briefing Progressivo** | Um sistema de divulgação progressiva em 4 fases: Diagnóstico → Precedentes → Riscos → Entrega. Cada fase produz tipos específicos de block. |
| **WorkCanvas** | A área de conteúdo principal que renderiza os blocks em sequência. |
| **Composer** | O componente de entrada onde os usuários digitam consultas. Por trás dele, um detector de intenção encaminha as consultas para ferramentas especializadas. |
| **PhaseRail** | Um trilho de navegação visual que mostra a fase atual do briefing e permite navegar entre as fases concluídas. |
| **Tool Registry** | Um padrão que mapeia intenções detectadas do usuário para funções de handler especializadas (juris, ratio, analyzer, compare, insights). |
| **Hub** | O papel arquitetural do Juca — um frontend fino que delega a inteligência backend a agentes externos (Valter, Leci). |

## Próximos Passos

- **[Quickstart](/getting-started/quickstart)** — Coloque o Juca rodando localmente em 5 minutos
- **[Visão Geral da Arquitetura](/architecture/overview)** — Entenda como as peças se encaixam
- **[Sistema de Blocks](/features/block-system)** — Aprenda sobre a unidade central de composição da UI

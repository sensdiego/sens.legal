---
title: "Home da Documentação do Leci"
description: "Hub de navegação da arquitetura, setup, roadmap e operações do Leci para humanos e agentes de IA."
lang: pt-BR
sidebar:
  order: 1
---


# Home da Documentação do Leci

## O que esta documentação cobre
Esta documentação explica como o Leci funciona hoje, o que vem a seguir e como contribuir com segurança para uma engine legislativa document-first. Ela foi escrita para desenvolvedores, stakeholders do projeto e agentes de IA que consomem contexto estruturado.

## Quem deve começar por aqui
Use esta página como ponto de entrada se você for:
- um contribuidor configurando o projeto pela primeira vez;
- um revisor validando consistência entre arquitetura e roadmap;
- alguém avaliando prontidão de API e confiabilidade da camada legislativa;
- um agente de IA que precisa de contexto estruturado, explícito e parseável.

## Trilhas recomendadas de leitura
### Onboarding rápido
1. `getting-started/introduction`
2. `getting-started/quickstart`
3. `development/setup`

### Arquitetura e implementação
1. `architecture/overview`
2. `architecture/stack`
3. `features/index`

### Planejamento e risco
1. `roadmap/index`
2. `roadmap/milestones`
3. `planning/PREMORTEM.md`

## Maturidade atual em um parágrafo
O Leci já não é apenas um repositório de schema e planejamento. O baseline atual inclui `/api/search` funcional, contratos tipados de busca, shell de pesquisa e leitura, e validação com dados reais, mantendo a direção de produto centrada em recuperação legislativa document-first e grounding confiável para o ecossistema sens.legal. Resolução canônica de referências, reader mais profundo e contratos de grounding mais amplos continuam como próxima camada de evolução.

## Política de fonte da verdade
Quando documentação e implementação divergirem, confie nesta ordem:
1. Source code (`src/`, `drizzle/`, `scripts/`)
2. Configuration files (`package.json`, `.env.example`, build configs)
3. Planning artifacts (`docs/planning/*`)
4. Narrative pages in docs

:::caution
Do not infer implementation status from roadmap language alone. Always verify against code paths and migration artifacts.
:::

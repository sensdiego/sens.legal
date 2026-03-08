---
title: Valter — Backend de Conhecimento Juridico
description: Backend central para retrieval de jurisprudencia, reasoning, verificacao e consumo via MCP.
lang: pt-BR
sidebar:
  order: 0
---

# Valter

> O backend central de conhecimento juridico do ecossistema sens.legal — servindo jurisprudencia do STJ via REST API e MCP.

## O que e o Valter?

O Valter e o backend em que retrieval de jurisprudencia, verificacao e reasoning estao sendo centralizados para o ecossistema. Ele transforma decisoes do STJ em conhecimento juridico estruturado que pode ser consumido por frontends, fluxos internos e LLMs compativeis com MCP.

A arquitetura combina PostgreSQL, Qdrant, Neo4j e Redis, mas o ponto importante nao e a lista de storages. O ponto importante e o paradigma atual de retrieval: **graph-led retrieval**. O grafo de conhecimento deixou de ser descrito como um pequeno boost opcional em cima de search. Ele agora e um caminho primario de descoberta e explicabilidade, enquanto busca lexical e semantica atuam como sinais complementares e caminhos de fallback graceful.

O Valter tambem e dono da camada de anti-alucinacao e explicabilidade do ecossistema. Consumidores o usam para recuperar precedentes, verificar referencias, comparar casos similares, inspecionar divergencias e obter trilhas de reasoning ancoradas em dados reais do tribunal.

## Links Rapidos

- **[Primeiros Passos](/pt-br/getting-started/quickstart)** — Setup com Docker, primeira chamada de API, primeira conexao MCP
- **[Visao Geral da Arquitetura](/pt-br/architecture/overview)** — Monolito modular, regra de dependencia e limites de runtime
- **[Stack Tecnologica](/pt-br/architecture/stack)** — Python, FastAPI e a arquitetura de quatro stores
- **[Referencia da API](/pt-br/api/)** — Endpoints REST para retrieval, verificacao, graph analytics e ingestao
- **[Tools MCP](/pt-br/api/mcp-tools)** — A superficie MCP exposta pelo Valter
- **[Busca e Retrieval](/pt-br/features/hybrid-search)** — Modelo atual de retrieval e funcionamento do graph-led
- **[Decisoes de Arquitetura](/pt-br/architecture/decisions)** — ADRs com escolhas-chave e racional
- **[Glossario](/pt-br/reference/glossary)** — Termos juridicos e tecnicos usados no projeto

## Parte do sens.legal

O Valter e um dos quatro projetos do ecossistema sens.legal:

| Projeto | Papel |
|---------|-------|
| **Juca** | Hub frontend para advogados e orquestracao voltada ao usuario |
| **Valter** | Backend central de retrieval, reasoning, verificacao e MCP |
| **Leci** | Engine legislativa document-first para grounding confiavel |
| **Douto** | Pipeline local de doutrina que fornece artefatos doutrinarios ao Valter |

Isso tambem significa que o Valter e o destino da migracao de backend que esta saindo do Juca. Busca, reasoning e outras responsabilidades de backend estao sendo movidas para o Valter para que o frontend permaneça focado em experiencia do usuario e orquestracao.

## Responsabilidades do Valter

- retrieval sobre jurisprudencia do STJ
- reasoning graph-led e explicabilidade
- verificacao contra dados do tribunal
- acesso via MCP e REST para consumidores externos
- pipelines de ingestao e enriquecimento que sustentam a camada de conhecimento

## O que o Valter nao faz

- ser o hub frontend para advogados, papel do Juca
- ser a autoridade legislativa, papel do Leci
- ser um produto autonomo de doutrina, que tambem nao e o papel do Douto

Em vez disso, o Valter e o backend central de jurisprudencia e reasoning que se integra com o restante do ecossistema.

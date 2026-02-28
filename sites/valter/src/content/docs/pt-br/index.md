---
title: Valter — Backend de Conhecimento Juridico
description: Backend que alimenta o raciocinio juridico para LLMs e advogados, servindo jurisprudencia do STJ via REST API e MCP.
lang: pt-BR
sidebar:
  order: 0
---

# Valter

> O backend de conhecimento juridico do ecossistema Diego Sens — servindo jurisprudencia do STJ brasileiro via REST API e Model Context Protocol (MCP).

## O que e o Valter?

Valter e um backend especializado que transforma dados juridicos brutos do Superior Tribunal de Justica (STJ) em conhecimento juridico estruturado e verificavel. Ele combina quatro data stores construidos para finalidades especificas — PostgreSQL para documentos e metadados, Qdrant para busca semantica vetorial, Neo4j para um grafo de conhecimento das relacoes juridicas, e Redis para cache — entregando busca hibrida com boosting via knowledge graph, verificacao anti-alucinacao e analytics de grafo sobre dezenas de milhares de decisoes judiciais.

Diferentemente de motores de busca juridica genericos que tratam decisoes como blocos de texto isolados, o Valter conecta decisoes por meio de um knowledge graph baseado na ontologia FRBR. Criterios, dispositivos legais, precedentes e ministros sao entidades de primeira classe no grafo, viabilizando consultas como "quais argumentos juridicos tem a maior taxa de sucesso para este ministro nesta categoria" ou "como a aplicacao deste criterio evoluiu nos ultimos cinco anos". Toda afirmacao retornada pelo sistema e rastreavel ate um no especifico do grafo ou verificada contra dados reais do tribunal.

O Valter e MCP-nativo: 28 tools sao expostas via Model Context Protocol, permitindo que LLMs como Claude e ChatGPT consultem jurisprudencia, verifiquem referencias, analisem divergencias e componham argumentos diretamente. As mesmas capacidades estao disponiveis por meio de uma REST API para consumo tradicional por frontends.

## Numeros-chave

| Metrica | Valor |
|---------|-------|
| Decisoes do STJ no knowledge graph | ~28.000 |
| Relacoes entre entidades juridicas | 207.000+ |
| Registros de metadados do STJ | 810.225 |
| Features classificadas de documentos | 2.119 |
| Vetores semanticos (768-dim) | ~3.673 |
| Tools MCP para integracao com LLMs | 28 |
| Endpoints de graph analytics | 12 |
| Data stores | 4 (PostgreSQL, Qdrant, Neo4j, Redis) |
| Routers da REST API | 11 |
| Endpoints do workflow de ingestao | 17 |

## Links Rapidos

- **[Primeiros Passos](/pt-br/getting-started/quickstart)** — Setup com Docker, primeira chamada de API, primeira conexao MCP
- **[Visao Geral da Arquitetura](/pt-br/architecture/overview)** — Monolito modular, regra de dependencia, 4 runtimes
- **[Stack Tecnologica](/pt-br/architecture/stack)** — Python, FastAPI, 4 bancos de dados e por que cada um foi escolhido
- **[Referencia da API](/api/)** — Endpoints REST para busca, verificacao, graph analytics e ingestao
- **[Tools MCP](/api/mcp-tools)** — Todas as 28 tools disponiveis para Claude, ChatGPT e outros clientes MCP
- **[Funcionalidades](/features/)** — Busca hibrida, graph analytics, anti-alucinacao e mais
- **[Decisoes de Arquitetura](/pt-br/architecture/decisions)** — ADRs documentando escolhas-chave e suas justificativas
- **[Glossario](/reference/glossary)** — Termos juridicos e tecnicos usados ao longo do projeto

## Parte do sens.legal

O Valter e um dos tres projetos que formam o ecossistema sens.legal:

| Projeto | Papel | Stack | Status |
|---------|-------|-------|--------|
| **Valter** | Backend de conhecimento juridico — jurisprudencia do STJ, servida via REST API e MCP | Python, FastAPI, PostgreSQL, Qdrant, Neo4j, Redis | Em producao |
| **Leci** | Backend de legislacao — estatutos e normas brasileiras como fonte de dados complementar | Planejado | Integracao prevista para v2.0 |
| **Juca** | Frontend para advogados — a interface pela qual profissionais do direito interagem com o ecossistema | Next.js | Em desenvolvimento |

O Valter atua como motor de conhecimento: o Juca chama a REST API do Valter para busca e analise, enquanto Claude e ChatGPT conectam via MCP para usar as mesmas capacidades como tools no seu processo de raciocinio. Quando o Leci for integrado, o Valter podera cruzar jurisprudencia com os dispositivos legislativos especificos sendo aplicados, fechando o ciclo entre como os tribunais interpretam a lei e o que a lei de fato diz.

---
title: "Busca e Retrieval"
description: "Modelo atual de retrieval do Valter: descoberta graph-led com sinais complementares de search e fallback graceful."
sidebar:
  order: 2
lang: pt-BR
---

# Busca e Retrieval

Esta página mantém o slug histórico `/features/hybrid-search`, mas o modelo atual de retrieval deve ser descrito como **graph-led retrieval**.

## O modelo atual

O Valter já não trata o knowledge graph como um pequeno boost opcional de score sobre um pipeline centrado em search. O modelo atual usa o grafo como caminho primário de descoberta e explicação, enquanto busca lexical e semântica permanecem como sinais complementares e mecanismos de fallback.

Na prática, a stack de retrieval combina:

- descoberta e traversal no grafo para relevância orientada por estrutura
- retrieval lexical e semântico para coleta paralela de evidência
- reranking e fusão quando úteis
- saídas de explicabilidade que descrevem por que uma decisão apareceu
- graceful degradation quando caminhos de grafo não estão disponíveis

## O que isso muda

A diferença não é apenas de wording. Ela muda a forma de pensar o Valter:

- relevância deixa de ser apenas um score ponderado de search;
- retrieval pode ser explicado por entidades, paths e estrutura de precedentes;
- search continua importante, mas não como centro único do sistema.

## Principais superfícies de retrieval

| Endpoint | Finalidade |
|----------|------------|
| `POST /v1/retrieve` | Recuperar jurisprudência pelo pipeline atual graph-led |
| `POST /v1/similar_cases` | Encontrar decisões similares em termos estruturais e semânticos |
| `POST /v1/search/features` | Filtrar sobre metadados jurídicos extraídos |
| `POST /v1/factual/dual-search` | Comparar visões de retrieval factual e orientado a tese |

## Notas para implementadores

- Knobs de compatibilidade e pesos de baixo nível ainda podem existir no runtime durante a migração.
- Mesmo assim, o modelo conceitual deve ser descrito como graph-led retrieval.
- Se você precisar de detalhes estritos de request/response para um cliente, prefira o schema atual de runtime ou a superfície gerada da API em vez de inventários manuais copiados.

---
title: Endpoints de Search
description: Visão geral dos endpoints atuais de retrieval do Valter e de como eles se encaixam no modelo graph-led.
lang: pt-BR
sidebar:
  order: 2
---

# Endpoints de Search

O Valter expõe quatro superfícies principais de retrieval para trabalho com jurisprudência. O ponto arquitetural importante é que esses endpoints pertencem a um sistema de **graph-led retrieval**, e não a um pipeline search-first com um pequeno boost de knowledge graph.

## Superfícies de retrieval

| Endpoint | Finalidade |
|----------|------------|
| `POST /v1/retrieve` | Retrieval geral de jurisprudência pelo pipeline atual do Valter |
| `POST /v1/similar_cases` | Retrieval de casos similares com sinais estruturais e semânticos |
| `POST /v1/search/features` | Retrieval filtrado sobre metadados jurídicos extraídos |
| `POST /v1/factual/dual-search` | Visões separadas de retrieval factual e orientado a tese |

## POST /v1/retrieve

Use este endpoint quando você precisa da experiência principal de retrieval de jurisprudência.

Conceitualmente, ele:

- descobre material relevante por lógica de retrieval orientada a grafo
- usa sinais de search como evidência complementar e fallback
- retorna resultados estruturados adequados para reasoning downstream, verificação ou renderização em UI

Se você estiver integrando um cliente estrito, prefira o schema atual de runtime ou a superfície OpenAPI gerada para obter os campos exatos de request e response.

## POST /v1/similar_cases

Use este endpoint quando você parte de uma decisão e quer jurisprudência próxima. Similaridade deixou de ser apenas "texto parecido"; ela também pode incorporar evidência estrutural da camada de conhecimento apoiada no grafo.

## POST /v1/search/features

Use este endpoint quando você precisa de retrieval filtrado sobre metadados extraídos, como categorias, rótulos de resultado ou outros atributos jurídicos estruturados.

## POST /v1/factual/dual-search

Use este endpoint quando você precisa separar similaridade factual de similaridade orientada a tese. Isso é útil para análise contrastiva e para entender se duas decisões são próximas por fatos, por enquadramento jurídico ou pelos dois.

## Guia de integração

- Trate `POST /v1/retrieve` como o ponto de entrada principal para retrieval de jurisprudência.
- Trate os demais endpoints como ferramentas especializadas construídas sobre a mesma camada de conhecimento.
- Evite descrever toda a superfície de search como "BM25 + semântico + KG boost"; essa já não é a narrativa correta do sistema.

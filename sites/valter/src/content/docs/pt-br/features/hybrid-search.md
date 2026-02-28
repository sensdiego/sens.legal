---
title: Busca Hibrida
description: Busca multi-estrategia combinando BM25 lexical, vetores semanticos, boost de knowledge graph, query expansion e cross-encoder reranking.
sidebar:
  order: 2
lang: pt-BR
---

# Busca Hibrida

O pipeline de busca do Valter combina cinco estrategias em um unico fluxo de consulta: match lexical BM25, similaridade de vetores semanticos, boost de knowledge graph, query expansion via LLM e cross-encoder reranking. O endpoint e `POST /v1/retrieve`.

A formula central e:

```
score_final(d, q) = w_bm25 * norm(BM25) + w_sem * norm(cosine) + w_kg * kg_boost
```

Pesos padrao: BM25 = 0.5, semantico = 0.4, KG = 0.1.

## Estagios do Pipeline

Toda requisicao de busca passa por 8 estagios. Cada estagio e mensuravel de forma independente e a maioria pode ser ativada/desativada via parametros da requisicao.

### 1. Verificacao de Cache

O retriever calcula uma chave de cache a partir do hash do texto da consulta, filtros, estrategia e feature flags. Se existir uma resposta em cache no Redis (TTL de 180s), ela e retornada imediatamente sem executar o pipeline.

Um cache hit define `cache_hit: true` na resposta e registra a latencia apenas como o tempo de consulta ao cache. Este e o caminho mais rapido pelo sistema.

### 2. Query Expansion

Quando `expand_query` esta habilitado, o `LLMQueryExpander` gera ate 3 variantes da consulta usando um Groq LLM. O prompt de expansao e especifico para busca juridica brasileira:

```python
# From core/query_expander.py
# Rules for expansion:
# 1. Legal synonyms (e.g., "dano moral" -> "dano extrapatrimonial")
# 2. Procedural equivalents (e.g., "recurso especial" -> "REsp")
# 3. Thesis/statute reformulations (e.g., "prazo prescricional" -> "prescricao quinquenal art. 206 CC")
```

O expander tem um timeout configuravel (padrao 3.0s). Em caso de timeout ou falha, a expansao retorna uma lista vazia e o pipeline continua apenas com a consulta original. As variantes expandidas sao incluidas na resposta como `expansion_queries`.

### 3. Encoding

A consulta original e quaisquer variantes de expansao sao codificadas em vetores densos usando o modelo de embedding definido por `VALTER_EMBEDDING_MODEL` (padrao: `rufimelo/Legal-BERTimbau-sts-base`, 768 dimensoes).

Dois backends de encoder estao disponiveis:

- **Local**: `SentenceTransformerEncoder` -- carrega o modelo no processo
- **Remoto**: `RailwayEncoder` -- envia requisicoes HTTP para um servico GPU dedicado no Railway

### 4. Retrieval Paralelo

BM25 e busca semantica rodam concorrentemente usando `asyncio.gather` para otimizacao de latencia.

- **BM25**: Usa a biblioteca `rank_bm25` (`BM25Okapi`) sobre documentos tokenizados do PostgreSQL. O indice e construido na inicializacao a partir dos campos ementa, tese e razoes_decidir de todos os documentos.
- **Semantico**: Realiza busca por similaridade de cosseno no Qdrant usando o vetor da consulta codificada. Quando query expansion esta ativa, todos os vetores de variantes sao buscados e os resultados sao mesclados.

Ambos os caminhos de retrieval buscam ate `top_k * 3` candidatos (limitado a 100) para garantir diversidade suficiente antes do merge.

### 5. Merge

Os candidatos do BM25 e da busca semantica sao combinados usando uma de duas estrategias, selecionavel via parametro `strategy` da requisicao:

- **weighted** (padrao): Normaliza os scores de BM25 e semantico independentemente, depois os combina usando pesos configuraveis. O dataclass `SearchWeights` tem como padrao `bm25=0.5, semantic=0.4, kg=0.1`.
- **rrf** (Reciprocal Rank Fusion): Merge baseado em posicao usando a formula `1 / (k + rank)` com `k=60`. Essa abordagem e menos sensivel a diferencas na distribuicao de scores entre retrievers.

Se um retriever retornar resultados vazios, a estrategia automaticamente recorre apenas aos resultados do outro retriever.

### 6. Filtragem

Filtros pos-retrieval sao aplicados a lista mesclada de candidatos. Filtros disponiveis em `SearchFilters`:

| Filtro | Tipo | Comportamento |
|--------|------|---------------|
| `ministro` | string | Normalizado para maiusculas para matching case-insensitive |
| `data_inicio` | string (YYYYMMDD) | Data minima da decisao |
| `data_fim` | string (YYYYMMDD) | Data maxima da decisao |
| `tipos_recurso` | list[string] | Extraido do formato do numero do processo |
| `resultado` | string | Filtro de resultado da decisao |

:::note
Os filtros sao aplicados apos o retrieval, entao a contagem retornada pode ser menor que `top_k` quando filtros excluem candidatos.
:::

### 7. Boost de Knowledge Graph

Quando `include_kg` esta habilitado e o graph store Neo4j esta disponivel, cada resultado recebe um boost de relevancia baseado nas suas conexoes no grafo.

O calculo do KG boost (`compute_kg_boost_from_entities` em `stores/graph.py`) avalia tres tipos de entidade para cada decisao:

- **Criterios** -- criterios juridicos conectados a decisao, ponderados por um multiplicador qualitativo `peso`
- **Fatos** -- elementos factuais vinculados no grafo
- **Provas** -- entidades de evidencia

As queries de boost rodam concorrentemente com concorrencia configuravel (`VALTER_KG_BOOST_MAX_CONCURRENCY`, padrao 20). O score de boost e combinado com o score de busca usando o peso de KG (padrao 0.1).

:::tip
Se o Neo4j estiver indisponivel, os resultados ainda sao retornados sem KG boost. O sistema registra um warning mas nao falha a requisicao.
:::

### 8. Reranking

Quando `rerank` esta habilitado e um reranker esta configurado, os melhores resultados sao reordenados por um modelo cross-encoder que pontua pares consulta-documento por relevancia.

Dois backends de reranker estao disponiveis:

- **Local**: `CrossEncoderReranker` -- roda o modelo cross-encoder no processo
- **Remoto**: `RailwayReranker` -- envia requisicoes HTTP para um servico GPU dedicado

O reranking tipicamente adiciona 200-500ms de latencia, mas melhora a precisao dos resultados do topo.

## Busca Dual-Vector

O retriever dual-vector (`DualVectorRetriever` em `core/dual_vector_retriever.py`) usa uma abordagem diferente: em vez de um unico vetor de consulta, ele codifica fatos e tese juridica separadamente e busca o corpus com cada um.

**Endpoint**: `POST /v1/factual/dual-search`

O relatorio de divergencia classifica os resultados em tres categorias:

| Categoria | Significado |
|-----------|-------------|
| `fact_only` | Factualmente similar mas juridicamente diferente |
| `thesis_only` | Juridicamente similar mas factualmente diferente |
| `overlap` | Similar em ambas as dimensoes factual e juridica |

Essa separacao e valiosa para identificar casos em que os mesmos fatos levaram a raciocinio juridico diferente, ou em que a mesma tese juridica foi aplicada a cenarios factuais diferentes.

## Feature Search

O feature search oferece filtragem estruturada sobre 21 campos extraidos por IA (gerados por classificacao via Groq LLM).

**Endpoint**: `POST /v1/search/features`

Nove filtros combinaveis com semantica AND (exceto `categorias` que usa OR/ANY):

| Filtro | Tipo de Match |
|--------|--------------|
| `categorias` | Semantica OR/ANY entre as categorias listadas |
| `dispositivo_norma` | Match exato (ex.: "CDC", "CC/2002") |
| `resultado` | Exato, case-sensitive |
| `unanimidade` | Booleano |
| `tipo_decisao` | Exato, case-sensitive |
| `tipo_recurso` | Exato, case-sensitive |
| `ministro_relator` | Exato, case-sensitive |
| `argumento_vencedor` | Parcial ILIKE, case-insensitive |
| `argumento_perdedor` | Parcial ILIKE, case-insensitive |

## Configuracao

Principais variaveis de ambiente que controlam o pipeline de busca:

| Variavel | Padrao | Finalidade |
|----------|--------|------------|
| `VALTER_EMBEDDING_MODEL` | `rufimelo/Legal-BERTimbau-sts-base` | Modelo de embedding para encoding |
| `VALTER_EMBEDDING_DIMENSION` | `768` | Dimensao do vetor |
| `VALTER_KG_BOOST_BATCH_ENABLED` | `true` | Habilitar KG boost em batch |
| `VALTER_KG_BOOST_MAX_CONCURRENCY` | `20` | Maximo de queries concorrentes ao Neo4j para KG boost |
| `VALTER_QUERY_EXPANSION_MAX_VARIANTS` | `3` | Maximo de variantes de query expansion |

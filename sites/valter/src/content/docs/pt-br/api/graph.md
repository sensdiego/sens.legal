---
title: Endpoints de Graph
description: Referencia da API para 13 endpoints de analytics do knowledge graph — divergencias, argumentos otimos, evolucao temporal e mais.
lang: pt-BR
sidebar:
  order: 3

---

# Endpoints de Graph

13 endpoints sob `/v1/graph/` expondo analytics do knowledge graph Neo4j para raciocinio juridico. Todos os endpoints usam `POST` e retornam resultados envelopados em `{ data, meta }`.

Todas as consultas de grafo tem um **timeout de 15 segundos**. Se o Neo4j estiver inacessivel, a API retorna `503 SERVICE_UNAVAILABLE`. Erros de programacao propagam como `500 INTERNAL_ERROR`.

## POST /v1/graph/divergencias

Detecta divergencias jurisprudenciais ativas -- clusters de decisoes com resultados divididos (provido vs improvido) para os mesmos criterios juridicos. O `divergence_score` e calculado como `minority / total`, de modo que uma divisao perfeitamente equilibrada 50/50 recebe o score mais alto.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `categoria_id` | `string` | `null` | Filtrar por categoria juridica (ex.: `cat-direito-consumidor`). Omita para todas as categorias. |
| `limit` | `integer` | `10` | Maximo de clusters de divergencia retornados (1-50) |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/divergencias \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "categoria_id": "cat-direito-consumidor", "limit": 5 }'
```

## POST /v1/graph/divergencias/turma

Analisa como diferentes ministros decidem sobre o mesmo tema juridico. Retorna contagens de resultados por ministro para criterios que correspondem ao tema.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `tema` | `string` | **obrigatorio** | Tema juridico para analise de divergencia (1-500 chars, ex.: `dano moral`) |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/divergencias/turma \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "tema": "dano moral em relacoes de consumo" }'
```

:::note
Apesar do nome, este endpoint atualmente faz match de criterios por substring do tema, em vez de usar metadados explicitos de turma (divisao do tribunal).
:::

## POST /v1/graph/optimal-argument

Encontra argumentos (criterios, dispositivos legais, precedentes) com a maior taxa de sucesso para uma categoria juridica e resultado desejado.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `categoria_id` | `string` | **obrigatorio** | ID da categoria juridica (ex.: `cat-direito-consumidor`) |
| `resultado_desejado` | `string` | `"provido"` | Resultado alvo: `provido`, `improvido` ou `parcialmente provido` |
| `tipo_argumento` | `string` | `"all"` | Filtrar por tipo: `criterio`, `dispositivo`, `precedente` ou `all` |
| `min_decisions` | `integer` | `2` | Minimo de decisoes de suporte para relevancia estatistica (2-100, piso interno e 2) |
| `top_k` | `integer` | `10` | Maximo de argumentos retornados (1-50) |

:::tip
O graph store retorna no maximo ~11 itens (5 criterios + 3 dispositivos + 3 precedentes). Definir `top_k` acima de 11 nao trara mais resultados.
:::

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/optimal-argument \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": "cat-direito-consumidor",
    "resultado_desejado": "provido",
    "tipo_argumento": "criterio",
    "min_decisions": 3
  }'
```

## POST /v1/graph/optimal-argument-by-ministro

Variante por ministro do argumento otimo. Compara as taxas de sucesso de um ministro especifico com a media geral da categoria. O campo `delta` mostra a diferenca: positivo significa que o argumento performa melhor com esse ministro.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `categoria_id` | `string` | **obrigatorio** | ID da categoria juridica |
| `ministro` | `string` | **obrigatorio** | Nome do ministro (normalizado automaticamente para maiusculas) |
| `resultado_desejado` | `string` | `"provido"` | Resultado alvo |
| `tipo_argumento` | `string` | `"all"` | Filtro de tipo de argumento |
| `min_decisions` | `integer` | `1` | Minimo de decisoes do ministro (1-100) |
| `min_category_decisions` | `integer` | `2` | Minimo de decisoes na categoria (2-100, piso interno e 2) |
| `top_k` | `integer` | `10` | Maximo de argumentos retornados (1-50) |

A resposta inclui `recommended_arguments` (delta > 0) e `avoid_arguments` (delta < -0.1).

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/optimal-argument-by-ministro \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": "cat-direito-consumidor",
    "ministro": "Nancy Andrighi",
    "resultado_desejado": "provido"
  }'
```

## POST /v1/graph/ministro-profile

Perfil abrangente do comportamento judicial de um ministro do STJ: total de decisoes, intervalo de datas, principais criterios, distribuicao de resultados, divergencias com pares e decisoes mais citadas.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `ministro` | `string` | **obrigatorio** | Nome do ministro (normalizado automaticamente para maiusculas) |
| `include_divergencias` | `boolean` | `true` | Incluir divergencias com pares nos mesmos criterios |
| `include_precedentes` | `boolean` | `true` | Incluir decisoes mais citadas deste ministro |
| `limit_criterios` | `integer` | `10` | Maximo de criterios no ranking (1-50, limite do store e 10) |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/ministro-profile \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ministro": "Nancy Andrighi",
    "include_divergencias": true,
    "include_precedentes": true,
    "limit_criterios": 5
  }'
```

:::note
Limites internos do grafo: ate 10 criterios, 20 divergencias com pares, 5 decisoes mais citadas. O parametro `limit_criterios` nao pode exceder esses limites do store.
:::

## POST /v1/graph/temporal-evolution

Acompanha como a aplicacao de um criterio juridico muda ao longo do tempo. Retorna buckets por periodo com divisao provido/improvido e um label heuristico de tendencia (crescente, decrescente ou estavel).

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `criterio` | `string` | **obrigatorio** | Criterio juridico a analisar (1-500 chars, ex.: `dano moral`) |
| `granularity` | `string` | `"year"` | Granularidade temporal: `year` ou `month` |
| `periodo_inicio` | `string` | `null` | Inicio do periodo. O formato deve corresponder a granularidade: `YYYY` para year, `YYYY-MM` para month. |
| `periodo_fim` | `string` | `null` | Fim do periodo. Mesmo requisito de formato. |

:::caution
O formato do periodo deve corresponder a granularidade. Usar `YYYY-MM` com `granularity: "year"` retorna um erro `400 INVALID_REQUEST`.
:::

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/temporal-evolution \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "criterio": "boa-fe objetiva",
    "granularity": "year",
    "periodo_inicio": "2018",
    "periodo_fim": "2024"
  }'
```

## POST /v1/graph/citation-chain

Rastreia a cadeia de citacao de saida a partir de uma decisao raiz atraves de relacionamentos `CITA_PRECEDENTE` ate a profundidade especificada.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `decisao_id` | `string` | **obrigatorio** | ID da decisao raiz |
| `max_depth` | `integer` | `3` | Maximo de saltos de citacao (1-5) |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/citation-chain \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "decisao_id": "doc-stj-resp-1234567", "max_depth": 3 }'
```

:::note
Este endpoint rastreia apenas citacoes de saida (quais decisoes a raiz cita). Nao inclui citacoes de entrada (quem cita a raiz). A resposta inclui um flag `max_depth_reached`.
:::

## POST /v1/graph/pagerank

Classifica as decisoes mais influentes no grafo de citacoes usando um score simplificado de PageRank: `in_citations * 10 + second_order * 3`.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `limit` | `integer` | `20` | Top-N decisoes mais influentes (1-100) |
| `min_citations` | `integer` | `0` | Minimo de citacoes diretas pos-filtro (0 = sem filtro) |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/pagerank \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "limit": 10, "min_citations": 5 }'
```

## POST /v1/graph/communities

Identifica comunidades tematicas de decisoes que compartilham criterios juridicos. Retorna pares de decisoes agrupados por contagem de criterios compartilhados (co-ocorrencia par a par).

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `min_shared` | `integer` | `3` | Minimo de criterios compartilhados para formar um par de comunidade (1-20) |
| `limit` | `integer` | `20` | Maximo de comunidades retornadas (1-100) |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/communities \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "min_shared": 4, "limit": 10 }'
```

:::note
Trata-se de co-ocorrencia par a par (tamanho=2 por item), nao deteccao completa de comunidades por teoria de grafos (ex.: Louvain). Cada entrada de comunidade representa um par de decisoes com seus criterios compartilhados.
:::

## POST /v1/graph/structural-similarity

Compara duas decisoes em cinco dimensoes do grafo (criterios, fatos, provas, dispositivos, precedentes) usando scoring Jaccard ponderado. Retorna estatisticas por dimensao e um `weighted_score` combinado em [0, 1].

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `source_id` | `string` | **obrigatorio** | ID da primeira decisao |
| `target_id` | `string` | **obrigatorio** | ID da segunda decisao |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/structural-similarity \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "doc-stj-resp-1234567",
    "target_id": "doc-stj-resp-7654321"
  }'
```

## POST /v1/graph/shortest-path

Encontra o caminho mais curto bidirecional entre duas decisoes no knowledge graph, usando todos os tipos de relacionamento.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `source_id` | `string` | **obrigatorio** | ID da decisao de origem |
| `target_id` | `string` | **obrigatorio** | ID da decisao de destino |
| `max_depth` | `integer` | `10` | Profundidade maxima do caminho em saltos (1-20) |

Retorna nodes e edges com tipos de relacionamento reais, ou `found: false` quando nenhum caminho existe dentro do limite de profundidade.

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/shortest-path \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "doc-stj-resp-1234567",
    "target_id": "doc-stj-resp-7654321",
    "max_depth": 5
  }'
```

## POST /v1/graph/embeddings

Computa vetores de features estruturais de 7 dimensoes para decisoes com base na topologia do grafo: contagem de criterios, contagem de fatos, contagem de provas, contagem de dispositivos, citacoes de entrada, citacoes de saida e resultado codificado.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `decisao_ids` | `string[]` | `null` | IDs especificos de decisoes. Omita para modo de amostragem aleatoria. Maximo 500 IDs por request. |
| `limit` | `integer` | `100` | Limite de tamanho da amostra quando `decisao_ids` e omitido (1-500) |

Os resultados sao cacheados no Redis por 1 hora.

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/graph/embeddings \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "decisao_ids": ["doc-stj-resp-1234567", "doc-stj-resp-7654321"]
  }'
```

:::tip
Graph embeddings sao uteis para clustering, visualizacao (t-SNE/UMAP) e como features para modelos de ML downstream. Eles representam propriedades estruturais no knowledge graph, nao embeddings semanticos de texto.
:::

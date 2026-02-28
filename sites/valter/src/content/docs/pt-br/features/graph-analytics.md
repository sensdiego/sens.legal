---
title: Graph Analytics
description: 12 endpoints de knowledge graph para raciocinio juridico -- divergencias, argumentos otimos, evolucao temporal, perfis de ministros e analise estrutural.
sidebar:
  order: 3
lang: pt-BR
---

# Graph Analytics

O Valter expoe 12 endpoints sob `POST /v1/graph/*` que consultam o knowledge graph Neo4j para tarefas de raciocinio juridico: deteccao de divergencias, composicao de argumento otimo, analise de tendencias temporais, perfil de ministros e similaridade estrutural.

## Visao Geral

O knowledge graph contem decisoes, criterios, dispositivos legais, precedentes, ministros e categorias conectados por relacionamentos tipados como CITA, APLICA, DIVERGE_DE e RELATOR_DE. A ontologia e adaptada do FRBR (Functional Requirements for Bibliographic Records) para o direito brasileiro.

Todos os endpoints de grafo compartilham padroes comuns:

- **Timeout de 15 segundos** por query Neo4j, aplicado via `asyncio.wait_for`
- **Tratamento de erros estruturado**: erros de conexao/driver do Neo4j retornam `SERVICE_UNAVAILABLE`; bugs de programacao (`KeyError`, `TypeError`) propagam como erros 500 para visibilidade
- **Trace ID** de correlacao em toda resposta via `MetaResponse(trace_id, latency_ms)`
- **Cache** via Redis para queries acessadas frequentemente

## Endpoints

| Endpoint | Metodo | Finalidade |
|----------|--------|------------|
| `/v1/graph/divergencias` | POST | Detectar resultados divididos em criterios juridicos |
| `/v1/graph/divergencias/turma` | POST | Analisar resultados divididos por ministro/tema |
| `/v1/graph/optimal-argument` | POST | Encontrar argumentos com maior taxa de sucesso |
| `/v1/graph/optimal-argument-by-ministro` | POST | Comparar taxas do ministro vs medias da categoria |
| `/v1/graph/ministro-profile` | POST | Perfil completo de comportamento do ministro |
| `/v1/graph/temporal-evolution` | POST | Rastrear tendencias de criterios ao longo do tempo |
| `/v1/graph/citation-chain` | POST | Rastrear arestas de citacao de saida |
| `/v1/graph/pagerank` | POST | Rankear decisoes influentes |
| `/v1/graph/communities` | POST | Encontrar pares de decisoes com alta sobreposicao |
| `/v1/graph/structural-similarity` | POST | Comparar duas decisoes em 5 dimensoes |
| `/v1/graph/shortest-path` | POST | Encontrar cadeias de conexao entre decisoes |
| `/v1/graph/graph-embeddings` | POST | Calcular vetores estruturais 7D |

### Deteccao de Divergencias

**`POST /v1/graph/divergencias`**

Encontra criterios juridicos onde as decisoes tem resultados divididos (provido vs improvido). O score de divergencia e calculado como `minority_count / total_count` -- uma divisao equilibrada (50/50) produz o score mais alto.

**Parametros**: `categoria_id` (filtro exato opcional), `limit` (1-50, padrao 10).

**Caso de uso**: Identificar onde o direito esta instavel, encontrar desacordos ativos entre ministros e localizar contra-argumentos para uma posicao juridica dada.

**`POST /v1/graph/divergencias/turma`**

Analisa resultados divididos para criterios que correspondem a uma substring de tema e agrega contagens por ministro. Apesar do nome, a query de grafo atual usa agregacao em nivel de ministro em vez de metadados explicitos de turma (divisao do tribunal).

**Parametros**: `tema` (obrigatorio, match de substring case-insensitive nos nomes dos criterios).

### Argumento Otimo

**`POST /v1/graph/optimal-argument`**

Dada uma categoria e resultado desejado, encontra os caminhos de argumento com as maiores taxas de sucesso. O graph store executa multiplas queries Cypher internamente para calcular taxas de sucesso em tres tipos de argumento:

| Tipo | Limite Interno | Min Decisoes |
|------|----------------|--------------|
| Criterio | 5 | 2 |
| Dispositivo (lei) | 3 | 2 |
| Precedente | 3 | 2 |

Cada passo da cadeia de argumento inclui: fato, criterio, success_rate, dispositivo e decisoes de suporte.

**Parametros**: `categoria_id` (obrigatorio), `resultado_desejado` (provido/improvido/parcialmente provido), `tipo_argumento` (all/criterio/dispositivo/precedente), `min_decisions`, `top_k` (1-50).

### Argumento Otimo por Ministro

**`POST /v1/graph/optimal-argument-by-ministro`**

Compara as taxas de sucesso de um ministro especifico contra a media da categoria para cada argumento. Retorna um delta por argumento:

- **Delta positivo**: o argumento funciona melhor com este ministro do que a media do tribunal
- **Delta negativo (< -0.1)**: argumento a evitar com este ministro

Limites internos do grafo: ate 10 criterios, 5 dispositivos, 5 precedentes. Nomes de ministros sao auto-normalizados para maiusculas.

**Parametros**: `categoria_id` (obrigatorio), `ministro` (obrigatorio), `resultado_desejado`, `tipo_argumento`, `min_decisions`, `min_category_decisions`, `top_k`.

### Evolucao Temporal

**`POST /v1/graph/temporal-evolution`**

Rastreia como a aplicacao de um criterio juridico muda ao longo do tempo. Agrega contagens de decisoes por ano ou mes, com divisao provido/improvido por periodo, e calcula um rotulo heuristico de tendencia (crescente, declinante ou estavel).

**Parametros**: `criterio` (obrigatorio), `granularity` (year/month), `periodo_inicio`, `periodo_fim`.

:::note
O formato do periodo deve corresponder a granularidade: use `YYYY` para granularidade anual e `YYYY-MM` para mensal. Formatos incompativeis retornam um erro de validacao.
:::

### Perfil de Ministro

**`POST /v1/graph/ministro-profile`**

Retorna um perfil abrangente do comportamento judicial de um ministro, construido a partir de 5 queries Cypher internas:

- **Resumo**: total de decisoes, intervalo de datas
- **Principais criterios** usados em decisoes (limitado a 10 internamente)
- **Distribuicao de resultados**: contagens de provido, improvido, parcialmente provido
- **Divergencias com pares**: ministros que discordam com mais frequencia (limitado a 20)
- **Decisoes mais citadas**: as decisoes mais influentes do ministro (limitado a 5)

**Parametros**: `ministro` (obrigatorio), `include_divergencias` (padrao true), `include_precedentes` (padrao true), `limit_criterios` (1-50, nao pode exceder o limite interno de 10).

### PageRank

**`POST /v1/graph/pagerank`**

Rankeia as decisoes mais influentes usando uma formula de pontuacao simplificada:

```
score = in_citations * 10 + second_order_citations * 3
```

Isso e baseado em padroes de citacao no grafo em vez do algoritmo completo de PageRank. O filtro `min_citations` e aplicado em pos-processamento.

**Parametros**: `limit` (1-100, padrao 20), `min_citations` (padrao 0).

### Comunidades

**`POST /v1/graph/communities`**

Retorna pares de decisoes com alta sobreposicao baseada em criterios juridicos compartilhados. Trata-se de deteccao de co-ocorrencia por pares (tamanho=2 por item), e nao de deteccao de comunidades no sentido da teoria de grafos.

**Parametros**: `min_shared` (minimo de criterios compartilhados, padrao 3), `limit` (1-100, padrao 20).

### Citacoes

**`POST /v1/graph/citation-chain`**

Rastreia arestas de citacao de saida a partir de uma decisao raiz atraves de relacionamentos `CITA_PRECEDENTE` ate uma profundidade configuravel. Retorna nos de citacao, arestas e um flag `max_depth_reached`. Nao inclui citacoes de entrada (decisoes que citam a raiz).

**Parametros**: `decisao_id` (obrigatorio), `max_depth` (1-5, padrao 3).

### Similaridade Estrutural

**`POST /v1/graph/structural-similarity`**

Compara duas decisoes em cinco dimensoes do grafo usando score Jaccard ponderado:

| Dimensao | O Que Mede |
|----------|-----------|
| Criterios | Criterios juridicos compartilhados entre decisoes |
| Fatos | Elementos factuais compartilhados |
| Provas | Tipos de evidencia compartilhados |
| Dispositivos | Dispositivos legais citados em comum |
| Precedentes | Citacoes de precedentes compartilhadas |

Retorna estatisticas por dimensao e um `weighted_score` em [0, 1].

**Parametros**: `source_id` (obrigatorio), `target_id` (obrigatorio).

### Caminho Mais Curto

**`POST /v1/graph/shortest-path`**

Encontra o caminho mais curto bidirecional entre duas decisoes usando todos os tipos de relacionamento, ate uma profundidade configuravel. Retorna os nos do caminho, arestas com tipos reais de relacionamento e `found=false` quando nao existe caminho dentro do limite de profundidade.

**Parametros**: `source_id` (obrigatorio), `target_id` (obrigatorio), `max_depth` (1-20, padrao 10).

### Graph Embeddings

**`POST /v1/graph/graph-embeddings`**

Calcula um vetor estrutural de 7 dimensoes por decisao, capturando a topologia do grafo em vez da semantica textual:

| Dimensao | Descricao |
|----------|-----------|
| 1 | Contagem de criterios |
| 2 | Contagem de fatos |
| 3 | Contagem de provas |
| 4 | Contagem de dispositivos |
| 5 | Contagem de citacoes de entrada |
| 6 | Contagem de citacoes de saida |
| 7 | Resultado codificado (provido/improvido/parcial) |

Suporta dois modos: **batch** (lista explicita de `decisao_ids`) e **sample** (decisoes aleatorias limitadas por `limit`, padrao 100, maximo 500).

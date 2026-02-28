---
title: Endpoints de Search
description: Referencia da API para endpoints de busca — recuperacao hibrida, casos similares, busca por features e busca dual-vector.
lang: pt-BR
sidebar:
  order: 2

---

# Endpoints de Search

Quatro endpoints para buscar e recuperar decisoes juridicas do STJ usando estrategias hibridas, features extraidas por IA e analise dual-vector.

## POST /v1/retrieve

Busca hibrida sobre o corpus de jurisprudencia combinando matching lexical BM25 com similaridade vetorial semantica, boost opcional via knowledge graph e reranking opcional com cross-encoder.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `query` | `string` | **obrigatorio** | Consulta juridica em linguagem natural (1-1000 chars) |
| `top_k` | `integer` | `20` | Numero de resultados a recuperar (1-100) |
| `strategy` | `string` | `"weighted"` | Estrategia de scoring: `weighted`, `rrf`, `bm25` ou `semantic` |
| `include_kg` | `boolean` | `false` | Aplicar boost de relevancia via knowledge graph antes da ordenacao final |
| `rerank` | `boolean` | `false` | Aplicar reranking com cross-encoder. Melhora precisao, adiciona ~100-300ms |
| `expand_query` | `boolean` | `false` | Expandir query com variantes juridicas geradas por LLM. Melhora recall, adiciona ~500-1500ms |
| `weights` | `object` | `null` | Pesos customizados por sinal (veja abaixo) |
| `filters` | `object` | `null` | Filtros pos-recuperacao (veja abaixo) |
| `page_size` | `integer` | `null` | Habilitar paginacao por cursor (1-50, deve ser <= `top_k`) |
| `cursor` | `string` | `null` | Cursor de continuacao da pagina anterior |
| `include_stj_metadata` | `boolean` | `false` | Incluir metadados do STJ via consulta ao PostgreSQL (~5-20ms extra) |

### Objeto weights

| Campo | Tipo | Padrao | Descricao |
|---|---|---|---|
| `bm25` | `float` | `0.5` | Peso do sinal lexical BM25 |
| `semantic` | `float` | `0.4` | Peso do sinal de embedding semantico |
| `kg` | `float` | `0.1` | Peso do boost via knowledge graph |

### Objeto filters

| Campo | Tipo | Descricao |
|---|---|---|
| `ministro` | `string` | Nome do ministro (normalizado automaticamente para maiusculas) |
| `data_inicio` | `string` | Filtro de data inicial (formato YYYYMMDD) |
| `data_fim` | `string` | Filtro de data final (formato YYYYMMDD) |
| `tipos_recurso` | `string[]` | Filtro de tipo de recurso (array) |
| `resultado` | `string` | Filtro de resultado: `provido`, `improvido`, `parcialmente provido` |
| `source` | `string` | Filtro de tipo de fonte: `corpus`, `embedding_only`, `ementa_only` |

:::note
Os filtros sao aplicados **pos-recuperacao**, portanto o numero real de resultados retornados pode ser menor que `top_k` quando filtros excluem matches.
:::

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/retrieve \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "dano moral atraso voo overbooking companhia aerea",
    "top_k": 10,
    "strategy": "weighted",
    "rerank": true,
    "filters": {
      "resultado": "provido",
      "data_inicio": "20200101"
    }
  }'
```

### Exemplo de resposta

```json
{
  "data": [
    {
      "id": "doc-stj-resp-1234567",
      "processo": "REsp 1.234.567/SP",
      "ministro": "NANCY ANDRIGHI",
      "data": "20230615",
      "orgao": "TERCEIRA TURMA",
      "ementa": "RECURSO ESPECIAL. TRANSPORTE AEREO. ...",
      "ementa_preview": "RECURSO ESPECIAL. TRANSPORTE AEREO...",
      "tese": "O atraso significativo de voo gera dano moral presumido...",
      "razoes_decidir": null,
      "score": 0.92,
      "has_integra": true,
      "score_breakdown": {
        "bm25": 0.78,
        "semantic": 0.95,
        "kg_boost": null,
        "rerank_score": 0.92
      },
      "matched_terms": ["dano", "moral", "atraso", "voo"],
      "stj_metadata": null
    }
  ],
  "meta": {
    "trace_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "latency_ms": 245.3,
    "cache_hit": false,
    "model_version": "legal-bertimbau-v1.0",
    "expansion_queries": null
  },
  "pagination": {
    "cursor": null,
    "has_more": false,
    "total_estimate": 8
  }
}
```

## POST /v1/similar_cases

Encontra casos similares a uma decisao usando um blend de 70% similaridade semantica e 30% sobreposicao estrutural via knowledge graph.

:::note
A URL usa underscore (`similar_cases`) por compatibilidade com versoes anteriores. Nao pode ser renomeada sem quebrar consumidores existentes.
:::

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `document_id` | `string` | **obrigatorio** | ID do documento de origem para comparacao |
| `top_k` | `integer` | `10` | Numero de casos similares a retornar (1-100) |
| `include_structural` | `boolean` | `true` | Incluir similaridade estrutural do KG no score. Desabilitar usa apenas semantica (mais rapido). |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/similar_cases \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "doc-stj-resp-1234567",
    "top_k": 5,
    "include_structural": true
  }'
```

:::tip
Em caso de timeout com o modo estrutural habilitado, o endpoint automaticamente faz retry usando apenas similaridade semantica como fallback.
:::

## POST /v1/search/features

Busca estruturada sobre features de documentos extraidas por IA com 9 filtros combinaveis via AND. Pelo menos um filtro e obrigatorio.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `categorias` | `string[]` | `null` | Categorias juridicas (semantica OR/ANY dentro da lista) |
| `dispositivo_norma` | `string` | `null` | Filtro de dispositivo legal (ex.: `CDC`, `CC/2002`). Match exato por contencao. |
| `resultado` | `string` | `null` | Filtro de resultado (exato, case-sensitive) |
| `unanimidade` | `boolean` | `null` | Filtro de decisao unanime |
| `tipo_decisao` | `string` | `null` | Tipo de decisao (exato, case-sensitive) |
| `tipo_recurso` | `string` | `null` | Tipo de recurso (exato, case-sensitive) |
| `ministro_relator` | `string` | `null` | Ministro relator (exato, case-sensitive) |
| `argumento_vencedor` | `string` | `null` | Texto do argumento vencedor (match parcial, case-insensitive) |
| `argumento_perdedor` | `string` | `null` | Texto do argumento perdedor (match parcial, case-insensitive) |
| `limit` | `integer` | `20` | Resultados por pagina (1-100) |
| `offset` | `integer` | `0` | Offset de paginacao |

:::caution
A maioria dos filtros escalares usa **matching exato case-sensitive**. Apenas `argumento_vencedor` e `argumento_perdedor` suportam matching parcial case-insensitive (SQL `ILIKE`). O campo `categorias` usa semantica OR (qualquer categoria listada faz match), enquanto todos os outros filtros combinam com AND.
:::

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/search/features \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "categorias": ["Direito do Consumidor"],
    "resultado": "provido",
    "dispositivo_norma": "CDC",
    "limit": 10
  }'
```

### Exemplo de resposta

```json
{
  "data": [
    {
      "document_id": "doc-stj-resp-9876543",
      "processo": "REsp 9.876.543/RJ",
      "ementa_preview": "CONSUMIDOR. PRODUTO DEFEITUOSO...",
      "categorias": ["Direito do Consumidor"],
      "resultado": "provido",
      "tipo_decisao": "Acórdão",
      "unanimidade": true,
      "dispositivo_norma": ["CDC", "CC/2002"],
      "argumento_vencedor": "Responsabilidade objetiva do fornecedor..."
    }
  ],
  "total": 42,
  "meta": {
    "trace_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "latency_ms": 35.8
  }
}
```

## POST /v1/factual/dual-search

Busca dual-vector que separa fatos da tese juridica, busca cada um independentemente e produz um relatorio de divergencia. O pipeline: entrada de texto, extracao via LLM (Groq), codificacao de cada digest em vetores separados, busca vetorial, analise de divergencia.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `text` | `string` | `null` | Texto juridico para analise (50-15000 chars). Obrigatorio se `document_id` nao for fornecido. |
| `document_id` | `string` | `null` | ID de documento do corpus. Obrigatorio se `text` nao for fornecido. |
| `top_k` | `integer` | `10` | Maximo de resultados por dimensao (1-50) |
| `filters` | `object` | `null` | Mesmo objeto de filtros do `/v1/retrieve` (ministro, resultado, source) |

:::note
Um dos dois deve ser fornecido: `text` ou `document_id`. Quando `document_id` e usado, o texto e montado a partir dos campos ementa, tese e razoes_decidir do documento.
:::

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/factual/dual-search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "doc-stj-resp-1234567",
    "top_k": 5
  }'
```

### Exemplo de resposta

```json
{
  "data": {
    "factual_digest": {
      "bullets": [
        { "index": 0, "text": "Consumidor adquiriu produto com defeito...", "source_excerpt": "...", "uncertainty": false }
      ],
      "digest_text": "Consumidor adquiriu produto com defeito de fabricacao...",
      "extraction_model": "llama-3.3-70b-versatile"
    },
    "thesis_digest": {
      "thesis_text": "Responsabilidade objetiva do fornecedor por vicio do produto...",
      "legal_basis": ["CDC art. 12", "CDC art. 18"],
      "precedents_cited": ["REsp 1.234.567/SP"],
      "extraction_model": "llama-3.3-70b-versatile"
    },
    "factual_results": [
      { "id": "doc-001", "processo": "REsp 111.222/MG", "ministro": "NANCY ANDRIGHI", "data": "20230101", "score": 0.89 }
    ],
    "thesis_results": [
      { "id": "doc-002", "processo": "REsp 333.444/PR", "ministro": "MARCO BUZZI", "data": "20220615", "score": 0.85 }
    ],
    "overlap_ids": [],
    "fact_only_ids": ["doc-001"],
    "thesis_only_ids": ["doc-002"],
    "divergence_summary": "Os fatos sao similares a doc-001 mas a tese juridica diverge. doc-002 compartilha a mesma tese mas com fatos distintos."
  },
  "meta": {
    "trace_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "latency_ms": 1850.5
  }
}
```

O relatorio de divergencia revela tres categorias:
- **overlap_ids** -- casos que correspondem tanto nos fatos quanto na tese (precedente forte).
- **fact_only_ids** -- faticamente similares mas juridicamente diferentes (potencial distinguishing).
- **thesis_only_ids** -- mesma tese juridica mas fatos diferentes (precedente tematico).

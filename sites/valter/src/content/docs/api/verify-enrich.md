---
title: Verify & Enrich Endpoints
description: API reference for anti-hallucination verification, IRAC enrichment, and factual extraction.
lang: en
sidebar:
  order: 4

---

# Verify & Enrich Endpoints

Three endpoints for validating legal references, enriching decisions with structured analysis, and extracting factual digests from legal text.

## POST /v1/verify

Anti-hallucination verification endpoint. Validates legal references in text (sumulas, minister names, process numbers, legislation mentions) against local reference data. Designed to verify LLM-generated legal arguments before presenting them to users.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | **required** | Text containing legal references to verify (1-10000 chars) |
| `check_sumulas` | `boolean` | `true` | Validate sumula references against STJ/STF data |
| `check_ministros` | `boolean` | `true` | Validate minister names against reference list |
| `check_processos` | `boolean` | `true` | Validate CNJ process number format (does not confirm existence) |
| `check_legislacao` | `boolean` | `true` | Extract and classify legislation mentions (does not verify vigency) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/verify \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Conforme Sumula 479 do STJ, relatada pela Ministra Nancy Andrighi no REsp 1.234.567/SP, com base no art. 14 do CDC...",
    "check_sumulas": true,
    "check_ministros": true,
    "check_processos": true,
    "check_legislacao": true
  }'
```

### Example response

```json
{
  "data": {
    "sumulas": {
      "Sumula 479": {
        "numero": 479,
        "tribunal": "STJ",
        "valid": true,
        "texto": "As instituicoes financeiras respondem objetivamente...",
        "situacao": "vigente",
        "vigente": true
      }
    },
    "ministros": {
      "Nancy Andrighi": {
        "nome": "NANCY ANDRIGHI",
        "valid": true,
        "confidence": 1.0,
        "is_aposentado": false
      }
    },
    "processos": {
      "1.234.567/SP": {
        "numero": "1234567",
        "format_valid": true
      }
    },
    "legislacao": [
      {
        "referencia": "art. 14 do CDC",
        "tipo": "artigo",
        "lei_numero": "CDC",
        "artigo": "14",
        "alias_resolucao": null
      }
    ],
    "metrics": {
      "risk_level": "low",
      "risk_score": 0.05,
      "total_citations": 3,
      "valid_count": 3,
      "invalid_count": 0
    },
    "verified_at": "2026-02-28T14:30:00Z"
  },
  "meta": {
    "trace_id": "d4e5f6a7-b8c9-0123-def0-123456789abc",
    "latency_ms": 12.5
  }
}
```

### Verification details

| Reference type | Validation method | Limitations |
|---|---|---|
| Sumulas | Matched against local STJ/STF sumula database | Checks number + tribunal, returns texto and vigency status |
| Ministers | Matched against local reference list with confidence score | Includes retirement status (`is_aposentado`) |
| Processes | CNJ format validation via regex | Format-only -- does not confirm existence in external tribunal systems |
| Legislation | Regex extraction and classification (artigo, lei, decreto, etc.) | Extracted and classified, but **not** verified for legal existence or vigency |

### Risk metrics

The `metrics` object provides an aggregate hallucination risk assessment:

- `risk_level`: `low`, `medium`, or `high`
- `risk_score`: Numeric score (0.0 = no risk, 1.0 = maximum risk)
- `total_citations` / `valid_count` / `invalid_count`: Summary counts

## POST /v1/context/enrich

Enrich a legal document with IRAC analysis (Issue, Rule, Application, Conclusion) and knowledge graph context including criteria, legal statutes, precedents, legislation, and related decisions.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `document_id` | `string` | **required** | Document ID to enrich (obtain via search endpoints first) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/context/enrich \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "document_id": "doc-stj-resp-1234567" }'
```

### Example response

```json
{
  "data": {
    "document_id": "doc-stj-resp-1234567",
    "irac": {
      "labels": [
        { "section": "issue", "text": "Se o atraso de voo gera dano moral presumido", "confidence": 0.85 },
        { "section": "rule", "text": "CDC art. 14 - responsabilidade objetiva do fornecedor", "confidence": 0.90 },
        { "section": "application", "text": "O atraso superior a 4 horas configura falha na prestacao...", "confidence": 0.78 },
        { "section": "conclusion", "text": "Recurso especial provido para fixar indenizacao...", "confidence": 0.92 }
      ],
      "model_version": "heuristic-v1.0"
    },
    "criterios": [
      { "name": "dano moral", "peso": "high" },
      { "name": "responsabilidade objetiva", "peso": "medium" }
    ],
    "dispositivos": [
      { "id": "disp-cdc-14", "name": "CDC art. 14" }
    ],
    "precedentes": [
      { "id": "doc-stj-resp-111222", "name": "REsp 111.222/SP" }
    ],
    "legislacao": [
      {
        "source": "doc-stj-resp-1234567",
        "target": "CDC",
        "type": "APLICA_LEI",
        "attributes": { "artigo": "14" }
      }
    ],
    "related_decisions": [
      {
        "decisao_id": "doc-stj-resp-333444",
        "processo": "REsp 333.444/MG",
        "shared_criterios": ["dano moral", "responsabilidade objetiva"]
      }
    ],
    "kg_available": true
  },
  "meta": {
    "trace_id": "e5f6a7b8-c9d0-1234-ef01-23456789abcd",
    "latency_ms": 85.2
  }
}
```

:::note
The IRAC analysis uses a regex-based heuristic classifier, not an LLM. The `model_version` field indicates the classification method. Knowledge graph context (`criterios`, `dispositivos`, `precedentes`, `legislacao`, `related_decisions`) comes from Neo4j and is only populated when `kg_available` is `true`.
:::

## POST /v1/factual/extract

Extract a structured factual digest and legal thesis from legal text using Groq LLM. Produces dense, comparable representations suitable for dual-vector search.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `null` | Legal text for extraction (50-15000 chars). Required if `document_id` is omitted. |
| `document_id` | `string` | `null` | Corpus document ID. Required if `text` is omitted. |

:::caution
Requires `VALTER_GROQ_API_KEY` and `VALTER_GROQ_ENABLED=true` in the environment. Without these, the endpoint returns `503 SERVICE_UNAVAILABLE`.
:::

### Example request

```bash
curl -X POST http://localhost:8000/v1/factual/extract \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "document_id": "doc-stj-resp-1234567" }'
```

### Example response

```json
{
  "data": {
    "factual_digest": {
      "bullets": [
        { "index": 0, "text": "Consumidor adquiriu passagem para voo com horario determinado", "source_excerpt": "...", "uncertainty": false },
        { "index": 1, "text": "Voo atrasou mais de 8 horas sem assistencia", "source_excerpt": "...", "uncertainty": false }
      ],
      "digest_text": "Consumidor adquiriu passagem para voo. Voo atrasou mais de 8 horas sem assistencia da companhia aerea.",
      "extraction_model": "llama-3.3-70b-versatile"
    },
    "thesis_digest": {
      "thesis_text": "O atraso significativo de voo internacional gera dano moral presumido independente de prova especifica",
      "legal_basis": ["CDC art. 14", "Convenção de Montreal art. 19"],
      "precedents_cited": ["REsp 1.584.465/SC"],
      "extraction_model": "llama-3.3-70b-versatile"
    },
    "source_text_preview": "RECURSO ESPECIAL. TRANSPORTE AEREO INTERNACIONAL..."
  },
  "meta": {
    "trace_id": "f6a7b8c9-d0e1-2345-f012-3456789abcde",
    "latency_ms": 2340.1
  }
}
```

The factual digest and thesis digest are produced independently and can be used as inputs for [dual-vector search](./search/#post-v1factualdual-search).

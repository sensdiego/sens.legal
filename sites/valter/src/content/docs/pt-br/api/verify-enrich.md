---
title: Endpoints de Verify & Enrich
description: Referencia da API para verificacao anti-alucinacao, enriquecimento IRAC e extracao factual.
lang: pt-BR
sidebar:
  order: 4

---

# Endpoints de Verify & Enrich

Tres endpoints para validar referencias juridicas, enriquecer decisoes com analise estruturada e extrair digests factuais de texto juridico.

## POST /v1/verify

Endpoint de verificacao anti-alucinacao. Valida referencias juridicas em texto (sumulas, nomes de ministros, numeros de processo, mencoes a legislacao) contra dados de referencia locais. Projetado para verificar argumentos juridicos gerados por LLM antes de apresenta-los aos usuarios.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `text` | `string` | **obrigatorio** | Texto contendo referencias juridicas a verificar (1-10000 chars) |
| `check_sumulas` | `boolean` | `true` | Validar referencias a sumulas contra dados do STJ/STF |
| `check_ministros` | `boolean` | `true` | Validar nomes de ministros contra lista de referencia |
| `check_processos` | `boolean` | `true` | Validar formato de numero de processo CNJ (nao confirma existencia) |
| `check_legislacao` | `boolean` | `true` | Extrair e classificar mencoes a legislacao (nao verifica vigencia) |

### Exemplo de request

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

### Exemplo de resposta

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

### Detalhes da verificacao

| Tipo de referencia | Metodo de validacao | Limitacoes |
|---|---|---|
| Sumulas | Match contra banco local de sumulas STJ/STF | Verifica numero + tribunal, retorna texto e status de vigencia |
| Ministros | Match contra lista de referencia local com score de confianca | Inclui status de aposentadoria (`is_aposentado`) |
| Processos | Validacao de formato CNJ via regex | Apenas formato -- nao confirma existencia em sistemas externos de tribunais |
| Legislacao | Extracao e classificacao via regex (artigo, lei, decreto, etc.) | Extraida e classificada, mas **nao** verificada quanto a existencia legal ou vigencia |

### Metricas de risco

O objeto `metrics` fornece uma avaliacao agregada de risco de alucinacao:

- `risk_level`: `low`, `medium` ou `high`
- `risk_score`: Score numerico (0.0 = sem risco, 1.0 = risco maximo)
- `total_citations` / `valid_count` / `invalid_count`: Contagens resumidas

## POST /v1/context/enrich

Enriquece um documento juridico com analise IRAC (Issue, Rule, Application, Conclusion) e contexto do knowledge graph incluindo criterios, dispositivos legais, precedentes, legislacao e decisoes relacionadas.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `document_id` | `string` | **obrigatorio** | ID do documento a enriquecer (obtenha via endpoints de search primeiro) |

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/context/enrich \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "document_id": "doc-stj-resp-1234567" }'
```

### Exemplo de resposta

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
A analise IRAC usa um classificador heuristico baseado em regex, nao um LLM. O campo `model_version` indica o metodo de classificacao. O contexto do knowledge graph (`criterios`, `dispositivos`, `precedentes`, `legislacao`, `related_decisions`) vem do Neo4j e so e populado quando `kg_available` e `true`.
:::

## POST /v1/factual/extract

Extrai um digest factual estruturado e uma tese juridica de texto juridico usando Groq LLM. Produz representacoes densas e comparaveis adequadas para busca dual-vector.

### Parametros

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `text` | `string` | `null` | Texto juridico para extracao (50-15000 chars). Obrigatorio se `document_id` for omitido. |
| `document_id` | `string` | `null` | ID de documento do corpus. Obrigatorio se `text` for omitido. |

:::caution
Requer `VALTER_GROQ_API_KEY` e `VALTER_GROQ_ENABLED=true` no ambiente. Sem essas variaveis, o endpoint retorna `503 SERVICE_UNAVAILABLE`.
:::

### Exemplo de request

```bash
curl -X POST http://localhost:8000/v1/factual/extract \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "document_id": "doc-stj-resp-1234567" }'
```

### Exemplo de resposta

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

O digest factual e o digest da tese sao produzidos independentemente e podem ser usados como entradas para a [busca dual-vector](./search/#post-v1factualdual-search).

---
title: Endpoints de Ingest
description: Referencia da API para endpoints do workflow de ingestao — analise de PDF, processamento por fases, gerenciamento de artefatos e revisao humana.
lang: pt-BR
sidebar:
  order: 5

---

# Endpoints de Ingest

Endpoints sob `/v1/ingest/` para o workflow completo de analise de casos: do upload de PDF passando pela analise automatizada por fases ate a analise juridica revisada por humanos. Varios endpoints tem caminhos duplos (`/workflow/...` e `/processo/full-analysis/...`) para compatibilidade retroativa.

## Ciclo de Vida do Workflow

### POST /v1/ingest/workflow

Inicia um workflow completo de analise de caso. Faz upload de um arquivo PDF para processamento assincrono. Este e o ponto de entrada principal para novas analises de caso.

Alias: `POST /v1/ingest/processo/full-analysis` (legado, mesmo handler).

**Content-Type:** `multipart/form-data`

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `file` | `UploadFile` | **obrigatorio** | Arquivo PDF do caso juridico |
| `source_system` | `string` | `"projudi"` | Label do sistema de origem |
| `rules_version` | `string` | `null` | Override da versao do conjunto de regras |
| `min_precedent_score` | `number` | `null` | Limiar minimo de score de precedente (0-100) |
| `max_matches_per_phase` | `integer` | `null` | Limite de matches de precedentes por fase (1-10) |
| `reason` | `string` | `null` | Nota do operador para rastreabilidade de auditoria |
| `strict_infra_required` | `boolean` | `true` | Falhar se dependencias de infra obrigatorias estiverem indisponiveis |

**Retorna:** `202 Accepted` com `workflow_id` e status inicial.

```bash
curl -X POST http://localhost:8000/v1/ingest/workflow \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@caso-12345.pdf" \
  -F "source_system=projudi"
```

:::note
O tamanho maximo de upload e controlado por `VALTER_MAX_UPLOAD_MB` (padrao: 100 MB).
:::

### GET /v1/ingest/workflow/{workflow_id}

Consulta o estado atual e o progresso de um workflow.

Alias: `GET /v1/ingest/processo/full-analysis/{workflow_id}`

| Parametro | Tipo | Descricao |
|---|---|---|
| `workflow_id` | `string` (path) | ID do workflow retornado pelo endpoint de criacao |

Retorna o estado atual, detalhes de progresso, fases e eventuais erros.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123 \
  -H "Authorization: Bearer $API_KEY"
```

### GET /v1/ingest/workflow/{workflow_id}/result

Recupera o resultado consolidado de um workflow concluido.

Alias: `GET /v1/ingest/processo/full-analysis/{workflow_id}/result`

Retorna o resultado completo da analise quando o workflow esta concluido, ou um payload de nao-pronto/erro enquanto ainda esta em execucao.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/result \
  -H "Authorization: Bearer $API_KEY"
```

## Extracao de Processo (Legado)

### POST /v1/ingest/processo

Inicia um workflow de extracao de processo (pipeline legado, anterior ao workflow de analise completa).

**Retorna:** `202 Accepted` com `extraction_id`.

### GET /v1/ingest/processo/{extraction_id}

Consulta o status e resultado de uma extracao de processo legada.

### POST /v1/ingest/processo/{extraction_id}/validate

Valida (aprova/rejeita) uma extracao legada com motivo opcional.

## Conversao de PDF

### POST /v1/ingest/pdf-to-markdown

Converte um PDF de processo juridico completo para Markdown relevante. Utilitario independente que nao cria um workflow.

| Parametro | Tipo | Descricao |
|---|---|---|
| `file` | `UploadFile` | Arquivo PDF a converter |

Retorna o Markdown convertido com secoes relevantes destacadas.

## Analise por Fases

### POST /v1/ingest/processo/{extraction_id}/phase-analysis

Executa analise por fases em uma extracao. Identifica fases processuais no caso juridico e associa cada uma a jurisprudencia relevante.

**Retorna:** `202 Accepted` com `analysis_id`.

### GET /v1/ingest/processo/{extraction_id}/phase-analysis/{analysis_id}

Consulta o status e resultados de uma analise por fases.

### POST /v1/ingest/processo/{extraction_id}/phase-analysis/reprocess

Reprocessa a analise por fases de uma extracao. Cria uma nova execucao imutavel sem modificar a anterior.

**Retorna:** `202 Accepted` com novo `analysis_id`.

## Revisao Humana

### POST /v1/ingest/processo/{extraction_id}/phase-analysis/{analysis_id}/review

Submete revisao humana para fases em uma analise por fases legada. Aprova ou rejeita fases individuais com notas do revisor.

| Parametro | Tipo | Descricao |
|---|---|---|
| `phase_label` | `string` | Identificador da fase a revisar |
| `approved` | `boolean` | Decisao de aprovacao |
| `reviewer` | `string` | Identidade do revisor para trilha de auditoria |
| `notes` | `string` | Notas da revisao |

### POST /v1/ingest/workflow/{workflow_id}/review

Submete revisao humana para um workflow de analise completa. Suporta revisao por fase e revisao final.

Alias: `POST /v1/ingest/processo/full-analysis/{workflow_id}/review`

| Parametro | Tipo | Descricao |
|---|---|---|
| `phase_label` | `string` | Fase a revisar (omita para revisao final) |
| `approved` | `boolean` | Decisao da revisao |
| `reviewer` | `string` | Identidade do revisor |
| `notes` | `string` | Notas da revisao |

## Reprocessamento

### POST /v1/ingest/workflow/{workflow_id}/reprocess

Inicia uma nova execucao imutavel para um workflow existente. Nao altera execucoes anteriores.

Alias: `POST /v1/ingest/processo/full-analysis/{workflow_id}/reprocess`

**Retorna:** `202 Accepted` com informacoes da nova execucao do workflow.

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `rules_version` | `string` | `null` | Override da versao do conjunto de regras para a nova execucao |
| `min_precedent_score` | `number` | `null` | Limiar minimo de score de precedente |
| `max_matches_per_phase` | `integer` | `null` | Limite de matches de precedentes por fase |
| `reason` | `string` | `null` | Motivo do operador para trilha de auditoria |
| `strict_infra_required` | `boolean` | `null` | Override do requisito estrito de infraestrutura |

## Auditoria & Eventos

### GET /v1/ingest/workflow/{workflow_id}/events

Lista eventos auditaveis de um workflow. Retorna eventos com timestamp para todas as transicoes de estado, conclusoes de fases, erros e acoes de revisao.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/events \
  -H "Authorization: Bearer $API_KEY"
```

### GET /v1/ingest/workflow/{workflow_id}/interactions

Lista a trilha de interacoes do dominio de um workflow. Inclui revisoes humanas, decisoes do sistema e notas do operador.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/interactions \
  -H "Authorization: Bearer $API_KEY"
```

## Artefatos

### GET /v1/ingest/workflow/{workflow_id}/artifacts

Lista todos os artefatos versionados gerados por um workflow (PDFs, JSONs, relatorios Markdown, logs).

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/artifacts \
  -H "Authorization: Bearer $API_KEY"
```

### POST /v1/ingest/workflow/{workflow_id}/artifacts/{artifact_id}/signed-url

Gera uma URL assinada com tempo limitado para download de um artefato especifico do workflow.

| Parametro | Tipo | Descricao |
|---|---|---|
| `workflow_id` | `string` (path) | ID do workflow |
| `artifact_id` | `string` (path) | Identificador do artefato da lista de artefatos |

Retorna uma URL assinada com TTL controlado por `VALTER_R2_PRESIGN_TTL_SECONDS` (padrao: 600 segundos / 10 minutos).

```bash
curl -X POST http://localhost:8000/v1/ingest/workflow/wf-abc123/artifacts/art-456/signed-url \
  -H "Authorization: Bearer $API_KEY"
```

```json
{
  "data": {
    "signed_url": "https://storage.example.com/artifacts/art-456?X-Amz-Signature=...",
    "expires_in_seconds": 600
  },
  "meta": {
    "trace_id": "a1b2c3d4-...",
    "latency_ms": 45.2
  }
}
```

## Resumo de Endpoints

| Metodo | Caminho | Descricao | Status |
|---|---|---|---|
| `POST` | `/v1/ingest/workflow` | Iniciar workflow de analise completa | 202 |
| `GET` | `/v1/ingest/workflow/{id}` | Consultar status do workflow | 200 |
| `GET` | `/v1/ingest/workflow/{id}/result` | Obter resultado do workflow | 200 |
| `POST` | `/v1/ingest/workflow/{id}/review` | Submeter revisao humana | 200 |
| `POST` | `/v1/ingest/workflow/{id}/reprocess` | Reprocessar workflow | 202 |
| `GET` | `/v1/ingest/workflow/{id}/events` | Listar eventos de auditoria | 200 |
| `GET` | `/v1/ingest/workflow/{id}/artifacts` | Listar artefatos | 200 |
| `GET` | `/v1/ingest/workflow/{id}/interactions` | Listar interacoes | 200 |
| `POST` | `/v1/ingest/workflow/{id}/artifacts/{aid}/signed-url` | Obter URL de download assinada | 200 |
| `POST` | `/v1/ingest/pdf-to-markdown` | Converter PDF para Markdown | 200 |
| `POST` | `/v1/ingest/processo` | Iniciar extracao legada | 202 |
| `GET` | `/v1/ingest/processo/{id}` | Consultar status da extracao | 200 |
| `POST` | `/v1/ingest/processo/{id}/validate` | Validar extracao | 200 |
| `POST` | `/v1/ingest/processo/{id}/phase-analysis` | Iniciar analise por fases | 202 |
| `GET` | `/v1/ingest/processo/{id}/phase-analysis/{aid}` | Consultar status da analise por fases | 200 |
| `POST` | `/v1/ingest/processo/{id}/phase-analysis/{aid}/review` | Revisar analise por fases | 200 |
| `POST` | `/v1/ingest/processo/{id}/phase-analysis/reprocess` | Reprocessar analise por fases | 202 |

:::tip
Os caminhos `/v1/ingest/processo/full-analysis/*` sao aliases para `/v1/ingest/workflow/*` e compartilham os mesmos handlers. Novas integracoes devem usar os caminhos `/v1/ingest/workflow/*`.
:::

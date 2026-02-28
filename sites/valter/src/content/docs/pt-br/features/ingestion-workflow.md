---
title: Workflow de Ingestao
description: Pipeline completo de analise de caso desde upload do PDF, extracao PROJUDI, analise de fases, matching de jurisprudencia e revisao humana.
sidebar:
  order: 5
lang: pt-BR
---

# Workflow de Ingestao

O workflow de ingestao do Valter transforma um PDF bruto de processo em uma analise juridica estruturada com identificacao de fases, matching de jurisprudencia e sugestoes revisadas por humanos. O workflow e exposto atraves de 17 endpoints sob `/v1/ingest/*` e tambem e acessivel via 8 MCP tools.

## Visao Geral

O workflow opera como um pipeline assincrono apoiado por um ARQ worker (fila de jobs no Redis) com uma maquina de estados que aplica transicoes validas e gera eventos auditaveis. Cada estagio produz artefatos intermediarios armazenados localmente ou no Cloudflare R2.

O pipeline segue este fluxo de alto nivel:

```
PDF Upload -> PROJUDI Extraction -> Phase Analysis -> Jurisprudence Matching
    -> Suggestions -> Human Review -> Artifacts
```

A revisao humana e obrigatoria em dois pontos de verificacao: apos a analise individual de cada fase e como aprovacao final da analise completa. Fases rejeitadas podem disparar reprocessamento imutavel -- novas versoes sao criadas enquanto execucoes anteriores sao preservadas.

## Estagios do Pipeline

### 1. Upload e Extracao do PDF

O workflow inicia com o upload de um PDF via `POST /v1/ingest/workflow`. O pipeline PROJUDI (`core/projudi_pipeline.py`) trata a extracao de processos de primeira instancia:

- **Extracao de texto** usando pdfplumber/pypdf, com fallback opcional de OCR via pytesseract
- **Deteccao de movimentacoes** via padroes regex que identificam movimentacoes processuais datadas (ex.: `Ref. mov. 1.2`, `Data: 15/02/2024 | Movimentacao: Peticao Inicial`)
- **Segmentacao em secoes** rotuladas: fatos, fundamentos_processuais, merito, pedidos, decisao, anexo

Cada documento extraido e representado como um `ProcessDocument`:

```python
# From core/projudi_pipeline.py
@dataclass(slots=True)
class ProcessDocument:
    document_id: str
    tipo_documento: str
    tipo_subdocumento: str | None
    movement_number: str | None
    movement_datetime: str | None
    page_start: int
    page_end: int
    text_excerpt: str
    key_sections: list[KeySection]
    confidence: float
    confidence_signals: dict[str, float]
    confidence_explanation: str
    needs_review: bool | None
```

O tamanho maximo de upload e controlado por `VALTER_MAX_UPLOAD_MB` (padrao: 100).

### 2. Classificacao e Scoring de Confianca

Apos a extracao, cada segmento de documento e automaticamente classificado:

- **Identificacao do tipo de documento** (peticao inicial, contestacao, decisao, sentenca, etc.)
- **Scoring de confianca** por campo extraido, com detalhamento individual dos sinais
- **Heranca entre irmaos** compartilha metadados entre documentos relacionados no mesmo processo
- **Regras de tipo** avaliadas pelo `ProjudiTypeRuleEvaluator` para classificacao deterministica

Documentos com confianca abaixo do limite sao sinalizados com `needs_review: true`.

### 3. Analise de Fases

O `DeterministicPhaseInterpreter` (`core/phase_interpreter.py`) mapeia documentos extraidos para fases processuais usando uma maquina de estados baseada em regras. Sete fases sao rastreadas em ordem:

| Fase | Rotulo |
|------|--------|
| 1 | Postulacao Inicial |
| 2 | Resposta do Reu |
| 3 | Saneamento e Organizacao |
| 4 | Instrucao Probatoria |
| 5 | Sentenca de Primeiro Grau |
| 6 | Cumprimento/Execucao |
| 7 | Transicao Recursal |

Cinco modulos centrais tratam a analise de fases:

| Modulo | Finalidade |
|--------|------------|
| `phase_interpreter.py` | Maquina de estados deterministica para identificacao de fases |
| `phase_matcher.py` | Associa documentos a fases baseado em sinais de conteudo |
| `phase_rules.py` | Definicoes de regras e avaliador (`PhaseRuleEvaluator`) |
| `phase_recommender.py` | Gera recomendacoes por fase |
| `phase_jurisprudence.py` | Encontra precedentes relevantes por fase |

A versao das regras e configuravel via `VALTER_PHASE_RULES_VERSION`.

### 4. Matching de Jurisprudencia

Para cada fase identificada, o sistema encontra precedentes relevantes do STJ usando o mesmo pipeline de busca hibrida do `POST /v1/retrieve`. O matching e filtrado por criterios relevantes a fase.

| Parametro | Padrao | Finalidade |
|-----------|--------|------------|
| `VALTER_PHASE_MIN_PRECEDENT_SCORE` | 55.0 | Score minimo para um match de precedente |
| `VALTER_PHASE_MAX_MATCHES_PER_PHASE` | 5 | Maximo de precedentes retornados por fase |

### 5. Revisao Humana

O workflow pausa em dois pontos de revisao:

**Revisao de fase** (`POST /v1/ingest/workflow/{id}/review`): O operador aprova ou rejeita a analise de cada fase individual. Cada revisao registra:

- `approved` (booleano)
- Identidade do `reviewer` para trilha de auditoria
- `notes` para contexto

**Revisao final**: Apos todas as fases serem revisadas, o operador aprova ou rejeita a analise completa.

Rejeicoes nao apagam trabalho anterior. Se reprocessamento for necessario, `reprocess_case_analysis` cria uma nova execucao imutavel preservando todas as versoes anteriores e seus historicos de revisao.

### 6. Geracao de Artefatos

Workflows concluidos produzem artefatos versionados:

- **Manifesto JSONL** dos resultados da analise com todas as fases, precedentes e decisoes de revisao
- **Relatorios PDF** (quando configurado)
- **Logs** de cada estagio de processamento

Os artefatos sao armazenados usando uma estrategia de dual-backend:

| Backend | Status | Finalidade |
|---------|--------|------------|
| Filesystem local | Ativo | Armazenamento padrao |
| Cloudflare R2 | Pronto, canary em 0% | Armazenamento em nuvem com rollout canary deterministico |

URLs assinadas para download sao geradas via `POST /v1/ingest/workflow/{id}/artifacts/{aid}/signed-url`.

## Maquina de Estados

A `WorkflowStateMachine` (`core/workflow_state_machine.py`) aplica transicoes validas ao longo do workflow. Transicoes invalidas levantam `InvalidWorkflowTransitionError`.

### Estados

| Estado | Descricao |
|--------|-----------|
| `queued_extraction` | Estado inicial, aguardando job de extracao |
| `processing_extraction` | Extracao de PDF em andamento |
| `queued_phase_analysis` | Extracao concluida, aguardando analise de fases |
| `processing_phase_analysis` | Analise de fases em andamento |
| `awaiting_phase_reviews` | Aguardando revisao humana das fases individuais |
| `awaiting_final_review` | Revisoes de fase concluidas, aguardando aprovacao final |
| `needs_user_action` | Estado terminal: requer intervencao do operador |
| `completed` | Estado terminal: workflow concluido com sucesso |
| `failed` | Estado terminal: workflow encontrou erro irrecuperavel |

### Transicoes

```
queued_extraction --[enqueue_extraction_job]--> processing_extraction
processing_extraction --[extraction_completed]--> queued_phase_analysis
queued_phase_analysis --[enqueue_phase_analysis_job]--> processing_phase_analysis
processing_phase_analysis --[phase_analysis_completed]--> awaiting_phase_reviews
                                                      --> awaiting_final_review
                                                      --> completed
```

:::note
Estados terminais de falha (`failed`, `needs_user_action`) nao sao alcancaveis atraves do metodo `next_state()` da maquina de estados. Eles sao aplicados exclusivamente via `FullCaseWorkflowOrchestrator.mark_failed()`, que trata persistencia e emissao de eventos para cenarios de erro. Essa e uma separacao arquitetural intencional: a maquina cobre o caminho feliz, enquanto `mark_failed()` cobre todos os caminhos de erro/terminacao.
:::

Cada transicao gera um evento de auditoria persistido em formato JSONL.

## Configuracao

| Variavel | Padrao | Finalidade |
|----------|--------|------------|
| `VALTER_INGEST_JOB_TIMEOUT_SECONDS` | 1800 | Timeout para jobs individuais de ingestao |
| `VALTER_INGEST_WORKER_CONCURRENCY` | 2 | Concorrencia do ARQ worker |
| `VALTER_WORKFLOW_TIMEOUT_SECONDS` | 2400 | Timeout geral do workflow |
| `VALTER_WORKFLOW_MAX_RETRIES` | 3 | Maximo de tentativas de retry |
| `VALTER_WORKFLOW_STRICT_INFRA_REQUIRED` | true | Falhar quando dependencias de infra obrigatorias estao indisponiveis |
| `VALTER_PHASE_RULES_VERSION` | `phase-rules-v1` | Versao do conjunto de regras ativo |
| `VALTER_MAX_UPLOAD_MB` | 100 | Tamanho maximo de upload de PDF |

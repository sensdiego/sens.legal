---
title: Milestones
description: Etapas oficiais de construcao do Douto.
lang: pt-BR
sidebar:
  order: 2
---

# Milestones

## Etapa 1 - Fundacao Reproduzivel

**Objetivo:** fazer o pipeline rodar de forma explicavel e reproduzivel.

Issues:
- `SEN-447`
- `SEN-448`
- `SEN-449`
- `SEN-450`
- `SEN-451`

Gate de saida:
- prompt versionado;
- paths regularizados;
- CLI minimamente coerente;
- instalacao reproduzivel.

## Etapa 2 - Quality Gate Doutrinario

**Objetivo:** medir enrichment e retrieval nos dominios prioritarios.

Issues:
- `SEN-452`
- `SEN-453`
- `SEN-454`
- `SEN-455`
- `SEN-456`

Gate de saida:
- schema de enrichment validado;
- amostras anotadas de contratos e processo civil;
- relatorio go/no-go de retrieval.

## Etapa 3 - Contrato de Entrega ao Valter

**Objetivo:** definir exatamente o que o Douto entrega.

Issues:
- `SEN-457`
- `SEN-458`
- `SEN-459`
- `SEN-460`

Gate de saida:
- contrato de artefato;
- IDs e areas estaveis;
- manifesto de cobertura;
- handoff documentado.

## Etapa 4 - Retrieval Explicavel

**Objetivo:** transformar busca local em retrieval reutilizavel e auditavel.

Issues:
- `SEN-461`
- `SEN-462`
- `SEN-463`
- `SEN-464`

Gate de saida:
- nucleo de busca reutilizavel;
- BM25 sem recomputacao por query;
- evidencias e ambiguidades expostas;
- smoke pack pronto para handoff.

## Etapa 5 - Sintese com Gate Proprio

**Objetivo:** habilitar brainstorm e novas teses sem perder rastreabilidade.

Issues:
- `SEN-465`
- `SEN-466`
- `SEN-467`
- `SEN-468`

Gate de saida:
- schema de brief doutrinario;
- sintese por dominio;
- gate de qualidade especifico para liberar sintese ao Valter.

## Etapa Posterior

- `SEN-446`: avaliar sinais hierarquicos no ranking depois da linha base

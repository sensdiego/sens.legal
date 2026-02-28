---
title: "Fase 1: Diagnóstico"
description: "Card de diagnóstico interativo que captura a situação jurídica do usuário e enriquece com contexto inicial do Valter."
lang: pt-BR
sidebar:
  order: 1
---

# Fase 1: Diagnóstico

A Fase 1 é o primeiro passo analítico após o chat inicial (Fase 0). Ela apresenta um card de diagnóstico interativo que captura a situação jurídica do usuário e a enriquece com contexto da API do Valter.

## O Que Acontece

1. O usuário descreve sua questão jurídica no Composer
2. A detecção de intenção identifica a necessidade de análise de caso
3. Um bloco `diagnosis` aparece com campos pré-preenchidos extraídos da consulta
4. O usuário edita e refina os campos (situação, área jurídica, tema, tese)
5. O usuário seleciona sua **situação** (pesquisando, avaliando, atuando ou estudando)
6. O sistema chama o Valter `/v1/retrieve` para enriquecimento inicial de contexto
7. Blocos `action_prompt` sugerem próximos passos
8. A Fase 2 fica disponível

## Tipos de Blocos Produzidos

| Tipo de Bloco | Propósito |
|---------------|-----------|
| `diagnosis` | Card principal com campos editáveis: descrição da situação, área jurídica, tema, tese |
| `action_prompt` | Botões interativos para seleção de situação e contexto adicional |

## Server Actions

```typescript
// Atualizar campos do diagnóstico
updateDiagnosis(sessionId: string, fields: Partial<DiagnosisFields>)
  → Returns: BriefingFlowState

// Selecionar situação do usuário (determina o modo de entrega da Fase 4)
chooseSituation(sessionId: string, situation: Situation)
  → Returns: { state: BriefingFlowState, phase2Blocks: Block[] }

// Adicionar informações de contexto
addAdditionalContext(sessionId: string, text: string)
  → Returns: BriefingFlowState
```

## Integração com a API do Valter

A Fase 1 chama o Valter para enriquecer o diagnóstico com contexto relevante:

| Endpoint | Propósito |
|----------|-----------|
| `/v1/retrieve` | Buscar precedentes iniciais correspondentes à área jurídica e ao tema |

> 🚧 **Funcionalidade Planejada** — A integração com o Valter para a Fase 1 está sendo implementada como parte do v0.3 (camada adaptadora) e do v0.4 (fases do briefing).

## Seleção de Situação

A seleção de situação na Fase 1 é crítica porque se propaga até a Fase 4:

| Seleção | Rótulo | Significado | Saída na Fase 4 |
|---------|--------|-------------|-----------------|
| `pesquisando` | Pesquisando | Coletando informações | Síntese |
| `avaliando` | Avaliando | Analisando um caso específico | Parecer |
| `atuando` | Atuando | Tomando ação jurídica | Estratégia |
| `estudando` | Estudando | Estudo acadêmico | Mapa |

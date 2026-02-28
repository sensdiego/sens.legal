---
title: "Fase 2: Precedentes"
description: "Seleção interativa de precedentes com cards alimentados pela busca de jurisprudência do STJ via Valter."
lang: pt-BR
sidebar:
  order: 2
---

# Fase 2: Precedentes

A Fase 2 apresenta precedentes relevantes do STJ como cards interativos. Os usuários avaliam cada precedente (útil ou não útil) e selecionam os mais relevantes para o caso deles. Essas seleções influenciam diretamente a análise de riscos da Fase 3.

## O Que Acontece

1. O contexto do diagnóstico da Fase 1 é enviado ao Valter
2. O Valter retorna precedentes relevantes via `/v1/retrieve` e `/v1/similar_cases`
3. Cards de precedentes aparecem no WorkCanvas
4. O usuário avalia cada precedente (relevante / não relevante)
5. Um bloco `precedent_picker` fornece uma interface de seleção
6. Os precedentes selecionados alimentam a Fase 3 (Riscos)

## Tipos de Blocos Produzidos

| Tipo de Bloco | Propósito |
|---------------|-----------|
| `precedent` | Card individual de precedente do STJ com detalhes do caso, ementa e fundamentação principal |
| `precedent_picker` | Interface de seleção exibindo total de precedentes e quantidade selecionada |

## Server Actions

```typescript
// Avaliar um único precedente
evaluatePrecedent(sessionId: string, processoId: string, evaluation: PrecedentEvaluation)
  → Returns: BriefingFlowState
```

## Integração com a API do Valter

| Endpoint | Propósito |
|----------|-----------|
| `/v1/retrieve` | Busca principal de precedentes correspondentes ao diagnóstico da Fase 1 |
| `/v1/similar_cases` | Encontrar casos similares aos precedentes selecionados pelo usuário |

## Block Factory

```typescript
// Criar um bloco de precedente a partir dos resultados de busca do Valter
createPrecedentData(precedent: Precedent): PrecedentBlockData

// Criar a interface de seleção
createPrecedentPickerData(total: number, precedentBlockIds: string[]): PrecedentPickerBlockData
```

> 🚧 **Funcionalidade Planejada** — A Fase 2 está planejada para o milestone v0.4.

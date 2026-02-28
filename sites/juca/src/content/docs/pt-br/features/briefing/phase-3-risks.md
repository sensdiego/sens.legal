---
title: "Fase 3: Riscos & Oportunidades"
description: "Balanço visual de riscos e oportunidades alimentado pela análise de grafos e endpoints de argumentação adversarial do Valter."
lang: pt-BR
sidebar:
  order: 3
---

# Fase 3: Riscos & Oportunidades

A Fase 3 sintetiza o diagnóstico (Fase 1) e os precedentes selecionados (Fase 2) em um balanço visual de riscos e oportunidades. Utiliza os endpoints de análise de grafos do Valter para geração de argumentos adversariais e análise de divergências.

## O Que Acontece

1. Diagnóstico + precedentes selecionados são enviados aos endpoints de grafos do Valter
2. O Valter retorna análise adversarial (argumentos a favor e contra)
3. Um bloco `risk_balance` renderiza o balanço visual
4. Um bloco `chart` fornece visualização de dados
5. Revelação progressiva: riscos mostrados primeiro, depois oportunidades
6. O usuário pode explorar os detalhes de cada risco/oportunidade
7. As opções de entrega da Fase 4 ficam disponíveis

## Tipos de Blocos Produzidos

| Tipo de Bloco | Propósito |
|---------------|-----------|
| `risk_balance` | Balanço visual mostrando riscos ponderados versus oportunidades |
| `chart` | Visualização de dados dos resultados da análise de riscos |

## Server Actions

```typescript
// Avançar da Fase 2 para a Fase 3
advanceToPhase3(sessionId: string)
  → Returns: { state: BriefingFlowState, phase3Blocks: Block[] }

// Marcar um risco específico como resolvido/reconhecido
resolveRisk(sessionId: string, riskId: string)
  → Returns: BriefingFlowState
```

## Integração com a API do Valter

| Endpoint | Propósito |
|----------|-----------|
| `/v1/graph/optimal-argument` | Análise adversarial — gera os argumentos mais fortes a favor e contra |
| `/v1/graph/divergencias` | Analisa divergências entre ministros e câmaras do tribunal |
| `/v1/graph/temporal-evolution` | Tendências temporais de como as decisões sobre o tema evoluíram |

## Sistema de Pesos de Risco

O balanço de riscos usa um modelo de pontuação ponderada definido na Block Factory:

```typescript
// Severidade × Probabilidade → Pontuação Ponderada (0-100)
const weights = {
  alta:  { provavel: 90, possivel: 75, improvavel: 60 },
  media: { provavel: 60, possivel: 45, improvavel: 30 },
  baixa: { provavel: 40, possivel: 25, improvavel: 15 }
};
```

Cada risco é pontuado, e o agregado determina a visualização geral do balanço.

## Inovação: Contradição Estratégica

A Fase 3 foi projetada para suportar uma funcionalidade de visão dual adversarial ("Contradição Estratégica"):

1. Chamar o Valter `/v1/graph/optimal-argument` duas vezes — uma vez para o lado "a favor", outra para "contra"
2. Chamar `/v1/graph/divergencias` para divergências no nível de ministro
3. Renderizar uma visualização de balanço estratégico em 3 zonas

Isso fornece aos advogados ambos os lados do argumento em uma única visão — uma capacidade que nenhuma IA jurídica comercial oferece atualmente.

> 🚧 **Funcionalidade Planejada** — A Fase 3 está planejada para o milestone v0.4.

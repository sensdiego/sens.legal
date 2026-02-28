---
title: "Block System"
description: "O Block System é a unidade fundamental de composição de UI do Juca — 11 tipos de blocos que renderizam todo o conteúdo jurídico estruturado."
lang: pt-BR
sidebar:
  order: 2
---

# Block System

O Block System é a arquitetura de UI fundamental do Juca. Todo conteúdo renderizado no WorkCanvas — desde mensagens de chat até diagnósticos jurídicos e recomendações estratégicas — é um **Block**: uma estrutura de dados tipada com um componente React correspondente.

## Por que Blocos?

O Block System substituiu uma arquitetura de painéis por abas, onde cada funcionalidade (Chat, Juris, Ratio, Compare, Insights, Semantic) tinha sua própria lógica de renderização isolada. Os blocos resolvem três problemas:

1. **Composição uniforme** — Qualquer tipo de conteúdo pode ser renderizado no mesmo canvas
2. **Compatível com SSE** — Blocos chegam de forma incremental via streaming à medida que são criados
3. **Testável** — Cada tipo de bloco tem uma factory function (pura) e um componente (isolado)

## Os 11 Tipos de Blocos

| Tipo | Componente | Fase do Briefing | Propósito |
|------|-----------|-----------------|-----------|
| `message` | MessageBlock | Fase 0 (Chat) | Mensagens de chat do usuário e da IA |
| `progress` | ProgressBlock | Qualquer | Indicadores de carregamento durante o processamento |
| `diagnosis` | DiagnosisBlock | Fase 1 | Card de diagnóstico com situação, área, tema e tese |
| `action_prompt` | ActionPromptBlock | Fase 1 | Prompts interativos sugerindo próximas ações |
| `precedent` | PrecedentBlock | Fase 2 | Card individual de precedente do STJ com detalhes |
| `precedent_picker` | PrecedentPickerBlock | Fase 2 | Interface de seleção para avaliar precedentes |
| `summary` | SummaryBlock | Qualquer | Resumo do estado da análise |
| `risk_balance` | RiskBalanceBlock | Fase 3 | Balanço visual de riscos versus oportunidades |
| `chart` | ChartBlock | Fase 3 | Visualização de dados da análise de riscos |
| `delivery` | DeliveryBlock | Fase 4 | Entregável final em um dos 4 modos adaptativos |
| `exit_card` | ExitCardBlock | Fase 4 | Conclusão da sessão com resumo + exportação |

## Ciclo de Vida de um Bloco

Todo bloco segue este ciclo desde a criação até a renderização:

```text
1. Intenção detectada → Ferramenta selecionada
2. Ferramenta chama a API do Valter ou processa os dados
3. Block Factory cria dados tipados:
   createDiagnosisData(analysis)
   createPrecedentData(precedent)
   createRiskBalanceData(analysis, situation, evaluations)
4. Bloco persistido: getBlocksDB().addBlock(input)
5. SSE transmite o evento do bloco para o cliente
6. WorkCanvas renderiza o componente do bloco com base em block.type
```

## Funções Factory de Blocos

Todas as factory functions ficam em `src/lib/blocks/types.ts`. Cada uma retorna um objeto de dados fortemente tipado:

```typescript
// Factories da Fase 1
createDiagnosisData(analysis: CaseAnalysis): DiagnosisBlockData
createSituationPromptData(): ActionPromptBlockData
createContextPromptData(): ActionPromptBlockData

// Factories da Fase 2
createPrecedentData(p: Precedent): PrecedentBlockData
createPrecedentPickerData(total, precedentBlockIds): PrecedentPickerBlockData

// Factories da Fase 3
createSummaryData(total): SummaryBlockData
createRiskBalanceData(analysis, situation, evaluatedUseful): RiskBalanceBlockData
createChartData(analysis, riskBalance): ChartBlockData

// Factories da Fase 4
createDeliveryData(analysis, state): DeliveryBlockData
createExitCardData(): ExitCardBlockData
```

### Cálculo de Peso de Risco

O bloco `risk_balance` utiliza um sistema de pontuação ponderada:

```typescript
// Severidade × Probabilidade → pontuação ponderada
const weights = {
  alta:  { provavel: 90, possivel: 75, improvavel: 60 },
  media: { provavel: 60, possivel: 45, improvavel: 30 },
  baixa: { provavel: 40, possivel: 25, improvavel: 15 }
};
```

### Seleção do Modo de Entrega

O bloco `delivery` se adapta com base na situação do usuário selecionada na Fase 1:

| Situação | Modo de Entrega | Gerador de Conteúdo |
|----------|----------------|---------------------|
| `pesquisando` (pesquisando) | Síntese | `buildSinteseContent()` |
| `avaliando` (avaliando) | Parecer | `buildParecerContent()` |
| `atuando` (atuando) | Estratégia | `buildEstrategiaContent()` |
| `estudando` (estudando) | Mapa | `buildMapaContent()` |

## Componentes de Blocos

Os componentes de blocos ficam em `src/components/blocks/`. Cada um recebe props tipadas correspondentes à sua estrutura de dados e renderiza de forma independente. O WorkCanvas mapeia `block.type` para o componente correto:

```typescript
// Lógica simplificada de renderização do WorkCanvas
{blocks.map(block => {
  switch (block.type) {
    case 'message':    return <MessageBlock data={block.data} />
    case 'diagnosis':  return <DiagnosisBlock data={block.data} />
    case 'precedent':  return <PrecedentBlock data={block.data} />
    // ... etc para todos os 11 tipos
  }
})}
```

## Adicionando um Novo Tipo de Bloco

Para adicionar um 12º tipo de bloco:

1. **Defina o tipo** em `src/types/blocks.ts` — adicione à union `BlockType` e crie a interface `YourBlockData`
2. **Crie a factory** em `src/lib/blocks/types.ts` — adicione a função `createYourBlockData()`
3. **Construa o componente** em `src/components/blocks/YourBlock.tsx` — componente React que renderiza os dados
4. **Registre no WorkCanvas** — adicione o `case` ao switch de tipo de bloco em `src/components/canvas/WorkCanvas.tsx`
5. **Escreva testes** — teste unitário para a factory function e teste de componente para o componente React

:::tip
Use o helper `makeBlock()` (dos utilitários de teste) com overrides de tipo e dados para criar fixtures de blocos rapidamente nos testes.
:::

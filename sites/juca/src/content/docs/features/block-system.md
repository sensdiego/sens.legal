---
title: "Block System"
description: "The Block System is Juca's core UI composition unit — 11 typed blocks that render all structured legal content."
lang: en
sidebar:
  order: 2
---

# Block System

The Block System is Juca's fundamental UI architecture. Every piece of content rendered in the WorkCanvas — from chat messages to legal diagnoses to strategic recommendations — is a **Block**: a typed data structure with a corresponding React component.

## Why Blocks?

The Block System replaced a tab-based panel architecture where each feature (Chat, Juris, Ratio, Compare, Insights, Semantic) had its own isolated rendering logic. Blocks solve three problems:

1. **Uniform composition** — Any content type can be rendered in the same canvas
2. **SSE-friendly** — Blocks stream incrementally as they're created
3. **Testable** — Each block type has a factory function (pure) and a component (isolated)

## The 11 Block Types

| Type | Component | Briefing Phase | Purpose |
|------|-----------|---------------|---------|
| `message` | MessageBlock | Phase 0 (Chat) | User and AI chat messages |
| `progress` | ProgressBlock | Any | Loading indicators during processing |
| `diagnosis` | DiagnosisBlock | Phase 1 | Diagnostic card with situation, area, theme, thesis |
| `action_prompt` | ActionPromptBlock | Phase 1 | Interactive prompts suggesting next actions |
| `precedent` | PrecedentBlock | Phase 2 | Individual STJ precedent card with details |
| `precedent_picker` | PrecedentPickerBlock | Phase 2 | Selection interface for evaluating precedents |
| `summary` | SummaryBlock | Any | Summary of analysis state |
| `risk_balance` | RiskBalanceBlock | Phase 3 | Visual risk-vs-opportunity balance |
| `chart` | ChartBlock | Phase 3 | Data visualization of risk analysis |
| `delivery` | DeliveryBlock | Phase 4 | Final output in one of 4 adaptive modes |
| `exit_card` | ExitCardBlock | Phase 4 | Session completion with summary + export |

## Block Lifecycle

Every block follows this lifecycle from creation to rendering:

```text
1. Intent detected → Tool selected
2. Tool calls Valter API or processes data
3. Block Factory creates typed data:
   createDiagnosisData(analysis)
   createPrecedentData(precedent)
   createRiskBalanceData(analysis, situation, evaluations)
4. Block persisted: getBlocksDB().addBlock(input)
5. SSE streams block event to client
6. WorkCanvas renders block component based on block.type
```

## Block Factory Functions

All factory functions live in `src/lib/blocks/types.ts`. Each returns a strongly-typed data object:

```typescript
// Phase 1 factories
createDiagnosisData(analysis: CaseAnalysis): DiagnosisBlockData
createSituationPromptData(): ActionPromptBlockData
createContextPromptData(): ActionPromptBlockData

// Phase 2 factories
createPrecedentData(p: Precedent): PrecedentBlockData
createPrecedentPickerData(total, precedentBlockIds): PrecedentPickerBlockData

// Phase 3 factories
createSummaryData(total): SummaryBlockData
createRiskBalanceData(analysis, situation, evaluatedUseful): RiskBalanceBlockData
createChartData(analysis, riskBalance): ChartBlockData

// Phase 4 factories
createDeliveryData(analysis, state): DeliveryBlockData
createExitCardData(): ExitCardBlockData
```

### Risk Weight Calculation

The `risk_balance` block uses a weighted scoring system:

```typescript
// Risk severity × probability → weighted score
const weights = {
  alta:  { provavel: 90, possivel: 75, improvavel: 60 },
  media: { provavel: 60, possivel: 45, improvavel: 30 },
  baixa: { provavel: 40, possivel: 25, improvavel: 15 }
};
```

### Delivery Mode Selection

The `delivery` block adapts based on the user's situation selected in Phase 1:

| Situation | Delivery Mode | Content Generator |
|-----------|--------------|-------------------|
| `pesquisando` (researching) | Síntese (Synthesis) | `buildSinteseContent()` |
| `avaliando` (evaluating) | Parecer (Opinion) | `buildParecerContent()` |
| `atuando` (acting) | Estratégia (Strategy) | `buildEstrategiaContent()` |
| `estudando` (studying) | Mapa (Map) | `buildMapaContent()` |

## Block Components

Block components live in `src/components/blocks/`. Each receives typed props matching its data shape and renders independently. The WorkCanvas maps `block.type` to the correct component:

```typescript
// Simplified WorkCanvas rendering logic
{blocks.map(block => {
  switch (block.type) {
    case 'message':    return <MessageBlock data={block.data} />
    case 'diagnosis':  return <DiagnosisBlock data={block.data} />
    case 'precedent':  return <PrecedentBlock data={block.data} />
    // ... etc for all 11 types
  }
})}
```

## Adding a New Block Type

To add a 12th block type:

1. **Define the type** in `src/types/blocks.ts` — add to the `BlockType` union and create the `YourBlockData` interface
2. **Create the factory** in `src/lib/blocks/types.ts` — add `createYourBlockData()` function
3. **Build the component** in `src/components/blocks/YourBlock.tsx` — React component that renders the data
4. **Register in WorkCanvas** — add the `case` to the block type switch in `src/components/canvas/WorkCanvas.tsx`
5. **Write tests** — unit test for the factory function and component test for the React component

:::tip
Use the `makeBlock()` test helper (from test utilities) with type and data overrides to quickly create block fixtures in tests.
:::

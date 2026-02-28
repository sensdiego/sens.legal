---
title: "Phase 4: Contextual Delivery"
description: "Four adaptive delivery modes that present the final analysis tailored to the user's legal situation."
lang: en
sidebar:
  order: 4
---

# Phase 4: Contextual Delivery

Phase 4 is the culmination of the Briefing — it aggregates all previous phases into a tailored deliverable. The delivery mode is determined by the user's situation selected in Phase 1.

## Delivery Modes

| Mode | Situation | Content | Generator Function |
|------|-----------|---------|-------------------|
| **Síntese** (Synthesis) | `pesquisando` | Concise summary of favorable and unfavorable precedents | `buildSinteseContent()` |
| **Parecer** (Opinion) | `avaliando` | Formal legal opinion with favorability percentage | `buildParecerContent()` |
| **Estratégia** (Strategy) | `atuando` | 2-3 strategic paths with actionable steps | `buildEstrategiaContent()` |
| **Mapa** (Map) | `estudando` | Temporal evolution map + divergent current analysis | `buildMapaContent()` |

## What Happens

1. All phase data aggregated (diagnosis + precedents + risks)
2. Delivery mode automatically selected based on Phase 1 situation
3. AI generates the tailored deliverable
4. A `delivery` block renders the output
5. An `exit_card` block appears with session summary + PDF export option

## Block Types Produced

| Block Type | Purpose |
|-----------|---------|
| `delivery` | Final analysis output in one of the 4 adaptive modes |
| `exit_card` | Session completion card with summary and export options |

## Server Actions

```typescript
// Generate the delivery based on accumulated briefing state
generateDelivery(sessionId: string)
  → Returns: { state: BriefingFlowState, phase4Blocks: Block[] }

// Select a strategic path (Strategy mode)
choosePath(sessionId: string, pathId: string)
  → Returns: BriefingFlowState

// Set the procedural stage
setFaseProcessual(sessionId: string, fase: string)
  → Returns: BriefingFlowState

// Finalize the session
finalizeSession(sessionId: string)
  → Returns: BriefingFlowState

// Handle exit card actions (export, new session, etc.)
handleExitAction(sessionId: string, action: string)
  → Returns: { state: BriefingFlowState, action: string }
```

## PDF Export

After delivery, the `exit_card` offers PDF export. The generated PDF reflects the user's journey through all four phases:

- Phase 1 diagnosis summary
- Phase 2 selected precedents
- Phase 3 risk balance visualization
- Phase 4 delivery content in the chosen mode

See [PDF Export](/features/pdf-export) for technical details.

> 🚧 **Planned Feature** — Phase 4 is planned for v0.4 milestone. Briefing PDF with phase selections is tracked in [#289](https://github.com/sensdiego/juca/issues/289).

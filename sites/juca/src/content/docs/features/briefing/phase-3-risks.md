---
title: "Phase 3: Risks & Opportunities"
description: "Visual risk-opportunity balance powered by Valter's graph analysis and adversarial argument endpoints."
lang: en
sidebar:
  order: 3
---

# Phase 3: Risks & Opportunities

Phase 3 synthesizes the diagnosis (Phase 1) and selected precedents (Phase 2) into a visual risk-opportunity balance. It uses Valter's graph analysis endpoints for adversarial argument generation and divergence analysis.

## What Happens

1. Diagnosis + selected precedents sent to Valter graph endpoints
2. Valter returns adversarial analysis (arguments for and against)
3. A `risk_balance` block renders the visual balance
4. A `chart` block provides data visualization
5. Progressive reveal: risks shown first, then opportunities
6. User can explore details of each risk/opportunity
7. Phase 4 delivery options become available

## Block Types Produced

| Block Type | Purpose |
|-----------|---------|
| `risk_balance` | Visual balance showing weighted risks vs. opportunities |
| `chart` | Data visualization of risk analysis results |

## Server Actions

```typescript
// Advance from Phase 2 to Phase 3
advanceToPhase3(sessionId: string)
  → Returns: { state: BriefingFlowState, phase3Blocks: Block[] }

// Mark a specific risk as resolved/acknowledged
resolveRisk(sessionId: string, riskId: string)
  → Returns: BriefingFlowState
```

## Valter API Integration

| Endpoint | Purpose |
|----------|---------|
| `/v1/graph/optimal-argument` | Adversarial analysis — generates strongest arguments both for and against |
| `/v1/graph/divergencias` | Analyzes divergences between ministers and court divisions |
| `/v1/graph/temporal-evolution` | Temporal trends in how decisions on this topic have evolved |

## Risk Weight System

The risk balance uses a weighted scoring model defined in the Block Factory:

```typescript
// Severity × Probability → Weighted Score (0-100)
const weights = {
  alta:  { provavel: 90, possivel: 75, improvavel: 60 },
  media: { provavel: 60, possivel: 45, improvavel: 30 },
  baixa: { provavel: 40, possivel: 25, improvavel: 15 }
};
```

Each risk is scored, and the aggregate determines the overall balance visualization.

## Innovation: Contradição Estratégica

Phase 3 is designed to support an adversarial dual-view feature ("Contradição Estratégica"):

1. Call Valter `/v1/graph/optimal-argument` twice — once for the "for" side, once for "against"
2. Call `/v1/graph/divergencias` for minister-level disagreements
3. Render a 3-zone strategic balance visualization

This provides lawyers with both sides of the argument in a single view — a capability no commercial legal AI currently offers.

> 🚧 **Planned Feature** — Phase 3 is planned for v0.4 milestone.

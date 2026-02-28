---
title: "Phase 2: Precedents"
description: "Interactive precedent selection with cards powered by Valter's STJ jurisprudence search."
lang: en
sidebar:
  order: 2
---

# Phase 2: Precedents

Phase 2 presents relevant STJ precedents as interactive cards. Users evaluate each precedent (useful or not useful) and select the ones most relevant to their case. These selections directly influence the risk analysis in Phase 3.

## What Happens

1. Diagnosis context from Phase 1 is sent to Valter
2. Valter returns relevant precedents via `/v1/retrieve` and `/v1/similar_cases`
3. Precedent cards appear in the WorkCanvas
4. User evaluates each precedent (relevant / not relevant)
5. A `precedent_picker` block provides a selection interface
6. Selected precedents feed into Phase 3 (Risks)

## Block Types Produced

| Block Type | Purpose |
|-----------|---------|
| `precedent` | Individual STJ precedent card with case details, ementa, and key reasoning |
| `precedent_picker` | Selection interface showing total precedents and selected count |

## Server Actions

```typescript
// Evaluate a single precedent
evaluatePrecedent(sessionId: string, processoId: string, evaluation: PrecedentEvaluation)
  → Returns: BriefingFlowState
```

## Valter API Integration

| Endpoint | Purpose |
|----------|---------|
| `/v1/retrieve` | Primary search for precedents matching the Phase 1 diagnosis |
| `/v1/similar_cases` | Find cases similar to the user's selected precedents |

## Block Factory

```typescript
// Create a precedent block from Valter search results
createPrecedentData(precedent: Precedent): PrecedentBlockData

// Create the picker interface
createPrecedentPickerData(total: number, precedentBlockIds: string[]): PrecedentPickerBlockData
```

> 🚧 **Planned Feature** — Phase 2 is planned for v0.4 milestone.

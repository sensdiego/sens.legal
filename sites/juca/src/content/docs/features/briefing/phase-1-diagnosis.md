---
title: "Phase 1: Diagnosis"
description: "Interactive diagnostic card that captures the user's legal situation and provides initial context from Valter."
lang: en
sidebar:
  order: 1
---

# Phase 1: Diagnosis

Phase 1 is the first analytical step after the initial chat (Phase 0). It presents an interactive diagnosis card that captures the user's legal situation and enriches it with context from the Valter API.

## What Happens

1. User describes their legal question in the Composer
2. Intent detection identifies a case analysis need
3. A `diagnosis` block appears with pre-filled fields extracted from the query
4. User edits and refines the fields (situation, legal area, theme, thesis)
5. User selects their **situation** (researching, evaluating, acting, or studying)
6. System calls Valter `/v1/retrieve` for initial context enrichment
7. `action_prompt` blocks suggest next steps
8. Phase 2 becomes available

## Block Types Produced

| Block Type | Purpose |
|-----------|---------|
| `diagnosis` | Main card with editable fields: situation description, legal area, theme, thesis |
| `action_prompt` | Interactive buttons for situation selection and additional context |

## Server Actions

```typescript
// Update diagnosis fields
updateDiagnosis(sessionId: string, fields: Partial<DiagnosisFields>)
  → Returns: BriefingFlowState

// Select user situation (determines Phase 4 delivery mode)
chooseSituation(sessionId: string, situation: Situation)
  → Returns: { state: BriefingFlowState, phase2Blocks: Block[] }

// Add context information
addAdditionalContext(sessionId: string, text: string)
  → Returns: BriefingFlowState
```

## Valter API Integration

Phase 1 calls Valter to enrich the diagnosis with relevant context:

| Endpoint | Purpose |
|----------|---------|
| `/v1/retrieve` | Search for initial precedents matching the legal area and theme |

> 🚧 **Planned Feature** — The Valter integration for Phase 1 is being implemented as part of v0.3 (adapter layer) and v0.4 (briefing phases).

## Situation Selection

The situation selection in Phase 1 is critical because it cascades to Phase 4:

| Selection | Label | Meaning | Phase 4 Output |
|-----------|-------|---------|----------------|
| `pesquisando` | Researching | Gathering information | Síntese (Synthesis) |
| `avaliando` | Evaluating | Analyzing a specific case | Parecer (Opinion) |
| `atuando` | Acting | Taking legal action | Estratégia (Strategy) |
| `estudando` | Studying | Academic study | Mapa (Map) |

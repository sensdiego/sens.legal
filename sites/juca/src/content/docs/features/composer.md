---
title: "Composer & Intent Detection"
description: "The Composer input component and the orchestration layer that detects intent, fills slots, and routes queries to tools."
lang: en
sidebar:
  order: 8
---

# Composer & Intent Detection

The Composer is Juca's input component — a pill-shaped text field where users type legal queries. Behind it, the orchestration layer detects intent, fills required slots, and routes queries to specialized tools that call the Valter API.

## Composer Component

The Composer lives in `src/components/canvas/Composer.tsx` and follows the Liquid Legal design language:

- **Shape:** Pill-shaped container with white background and subtle shadow
- **Input:** Full-width text field with placeholder
- **Send button:** Circular, dark (`--ink-primary`), with arrow icon
- **Behavior:** Submits via Server Action, streams results via SSE

On submit, the Composer calls a Server Action that starts the orchestration pipeline.

## Orchestration Pipeline

The orchestration pipeline lives in `src/lib/unified/` and processes queries in four stages:

```text
User input
  → Intent Detector (classify query)
    → Slot Filling (extract parameters)
      → Clarification Policy (ask if info is missing)
        → Tool Registry (execute the right tool)
```

### Intent Detection

The Intent Detector (`src/lib/unified/`) classifies user queries into categories that map to tools. It considers the query text, conversation context, and any referenced artifacts.

### Slot Filling

Each tool declares required parameters (slots). The slot filler extracts values from the user's query — for example, legal area, court, case number, or topic.

### Clarification Policy

If the intent is ambiguous or required slots are empty, the Clarification Policy determines what to ask. This renders as `action_prompt` blocks in the WorkCanvas, presenting options to the user.

## Tool Registry

The Tool Registry maps intents to tool implementations. Each tool is a class extending `BaseTool`:

| Tool | ID | Priority | Capabilities | Key Artifacts |
|------|-----|----------|-------------|--------------|
| AnalyzerTool | `analyzer` | 9 (highest) | case_analysis, search, conversation, follow_up | `case_analysis`, `document` |
| JurisTool | `juris` | 8 | search, follow_up | `search_results`, `document` |
| RatioTool | `ratio` | 7 | extraction, follow_up | `irac_extraction` |
| CompareTool | `compare` | 5 | comparison | `model_comparison` |
| InsightsTool | `insights` | 4 | statistics | `insights_stats` |

Priority determines which tool handles a query when multiple tools match. The AnalyzerTool (priority 9) handles complex case analysis scenarios; JurisTool (priority 8) handles direct search queries.

### Tool Interface

All tools implement this interface:

```typescript
interface BaseTool {
  id: string;
  priority: number;
  capabilities: ToolCapability[];
  producesArtifacts: string[];
  consumesArtifacts?: string[];

  execute(params: ToolParams, onProgress?: ProgressCallback): Promise<ToolResult>;
}

type ToolCapability = 'search' | 'extraction' | 'comparison'
  | 'statistics' | 'conversation' | 'follow_up' | 'case_analysis';
```

### JurisTool Configuration

The JurisTool uses a hybrid search strategy with configurable weights:

```typescript
{
  strategy: 'hybrid',
  weights: { bm25: 0.6, semantic: 0.4, kg: 1.0 },
  defaultLimit: 10
}
```

## SSE Streaming

Real-time progress is streamed to the client via Server-Sent Events through `/api/v2/stream`:

**Request:** `POST { sessionId, text }`

**Event types:**

| Event | Data | Purpose |
|-------|------|---------|
| `stage` | `{ stage, label, tool? }` | Progress update (e.g., "Searching precedents...") |
| `result` | `{ blocks: Block[] }` | Final blocks to render |
| `error` | `{ message }` | Error information |

**Client hook:** `useSSEStream()` returns `{ sendStreaming, isStreaming, currentStage, abort }` — providing real-time UI feedback and abort capability.

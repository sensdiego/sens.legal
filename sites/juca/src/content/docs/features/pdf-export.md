---
title: "PDF Export"
description: "How Juca generates PDF documents from briefing sessions using jsPDF."
lang: en
sidebar:
  order: 10
---

# PDF Export

Juca generates PDF documents from briefing sessions using jsPDF. The PDF is rendered server-side as a pure function and delivered via a dedicated API endpoint.

## How It Works

The PDF generation pipeline:

1. Client requests PDF via `GET /api/export/pdf/[sessionId]`
2. API route authenticates the request and loads the session
3. `generateBriefingPDF(input)` processes session blocks into PDF content
4. PDF returned as binary (`application/pdf`)

## Implementation

The generator is a pure function in `src/lib/pdf/generator.ts`:

```typescript
function generateBriefingPDF(input: BriefingPDFInput): Uint8Array {
  const doc = new jsPDF();

  // Extract blocks by type
  const diagnosis = blocks.find(b => b.type === 'diagnosis');
  const precedents = blocks.filter(b => b.type === 'precedent');
  const riskBalance = blocks.find(b => b.type === 'risk_balance');
  const delivery = blocks.find(b => b.type === 'delivery');

  // Render sections with manual Y-position tracking
  let y = 20;
  // ... render each section, calling checkPage() for overflow
  // Use doc.splitTextToSize(text, maxWidth) for text wrapping

  return new Uint8Array(doc.output('arraybuffer'));
}
```

:::tip
The generator is a pure function — it takes data in, returns bytes out. This makes it easy to test with `// @vitest-environment node` (jsPDF requires Node, not jsdom).
:::

## API Endpoint

```text
GET /api/export/pdf/[sessionId]
```

| Parameter | Type | Location | Required |
|-----------|------|----------|----------|
| `sessionId` | string | URL path | Yes |

**Authentication:** Required. Uses `auth()` from `src/lib/auth`.

**Response:** `application/pdf` binary content.

## Future: Briefing-Aware PDF

> 🚧 **Planned Feature** — The v0.4 PDF ([#289](https://github.com/sensdiego/juca/issues/289)) will reflect user selections across all 4 Briefing phases. The PDF structure will adapt based on the delivery mode (Síntese produces a concise summary; Parecer produces a formal opinion layout).

> 🚧 **Planned Feature** — DOCX export is planned for v0.5 ([#158](https://github.com/sensdiego/juca/issues/158)).

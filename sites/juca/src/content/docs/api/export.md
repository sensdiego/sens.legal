---
title: Export Endpoints
description: API endpoints for exporting briefing sessions as PDF and other formats.
lang: en
sidebar:
  order: 5
---

# Export Endpoints

> API endpoints for exporting briefing sessions as PDF documents and future formats.

## GET /api/export/pdf/[sessionId]

Generate and download a PDF document from a completed briefing session.

**Source:** `src/app/api/export/pdf/[sessionId]/route.ts`

### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `sessionId` | Path | string | Yes | The briefing session ID to export |

**Authentication:** Required via `auth()` from `@/lib/auth`. Bypassed when `ENABLE_DEV_AUTH=true`.

### Response

**Success `200`:**

| Header | Value |
|--------|-------|
| Content-Type | `application/pdf` |
| Content-Disposition | `attachment; filename="briefing-{short-id}.pdf"` |

Body: raw PDF binary data.

**Errors:**

| Status | Body | Cause |
|--------|------|-------|
| 401 | `{ error: 'Unauthorized' }` | Missing or invalid auth session |
| 404 | `{ error: 'Session not found' }` | No blocks exist for the given sessionId |

### Example

```bash
# Download briefing PDF (requires auth cookie)
curl -o briefing.pdf \
  -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/export/pdf/abc-12345
```

In the browser, the download is triggered by navigating to the URL or using `window.open()`:

```typescript
window.open(`/api/export/pdf/${sessionId}`, '_blank');
```

## PDF Generation Pipeline

The PDF is generated server-side by `generateBriefingPDF()` in `src/lib/pdf/generator.ts`:

1. **Load blocks** — Fetches all blocks for the session from SQLite via `getBlocksDB()`
2. **Extract by type** — Finds `delivery`, `diagnosis`, `risk_balance`, `precedent`, and other block types
3. **Build document** — Creates a jsPDF instance with A4 page size
4. **Render sections** — Renders each block type into PDF sections with appropriate formatting
5. **Handle overflow** — Uses `checkPage()` to detect when content exceeds page height and adds new pages
6. **Text wrapping** — Uses `doc.splitTextToSize(text, maxWidth)` for long text content
7. **Return bytes** — Outputs `new Uint8Array(doc.output('arraybuffer'))`

:::note
The PDF reflects the user's selections through all 4 briefing phases — diagnosis fields, evaluated precedents, resolved risks, and the chosen delivery mode content.
:::

## Future: DOCX Export

Planned for v0.5 (Issue #158):

- Export briefing as a professional legal memo in both PDF and DOCX formats
- DOCX will use a template with proper legal document formatting
- Will support the same block-to-section rendering pipeline as PDF

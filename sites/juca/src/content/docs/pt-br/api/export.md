---
title: Endpoints de Exportação
description: Endpoints de API para exportar sessões de briefing em PDF e outros formatos.
lang: pt-BR
sidebar:
  order: 5
---

# Endpoints de Exportação

> Endpoints de API para exportar sessões de briefing como documentos PDF e formatos futuros.

## GET /api/export/pdf/[sessionId]

Gera e faz download de um documento PDF a partir de uma sessão de briefing concluída.

**Fonte:** `src/app/api/export/pdf/[sessionId]/route.ts`

### Requisição

| Parâmetro | Local | Tipo | Obrigatório | Descrição |
|-----------|-------|------|-------------|-----------|
| `sessionId` | Path | string | Sim | ID da sessão de briefing a exportar |

**Autenticação:** Obrigatória via `auth()` de `@/lib/auth`. Ignorada quando `ENABLE_DEV_AUTH=true`.

### Resposta

**Sucesso `200`:**

| Header | Valor |
|--------|-------|
| Content-Type | `application/pdf` |
| Content-Disposition | `attachment; filename="briefing-{short-id}.pdf"` |

Corpo: dados binários brutos do PDF.

**Erros:**

| Status | Corpo | Causa |
|--------|-------|-------|
| 401 | `{ error: 'Unauthorized' }` | Sessão de autenticação ausente ou inválida |
| 404 | `{ error: 'Session not found' }` | Nenhum bloco existe para o sessionId informado |

### Exemplo

```bash
# Baixar PDF do briefing (requer cookie de autenticação)
curl -o briefing.pdf \
  -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/export/pdf/abc-12345
```

No browser, o download é acionado navegando para a URL ou usando `window.open()`:

```typescript
window.open(`/api/export/pdf/${sessionId}`, '_blank');
```

## Pipeline de Geração do PDF

O PDF é gerado no lado do servidor por `generateBriefingPDF()` em `src/lib/pdf/generator.ts`:

1. **Carregar blocos** — Busca todos os blocos da sessão no SQLite via `getBlocksDB()`
2. **Extrair por tipo** — Encontra os tipos `delivery`, `diagnosis`, `risk_balance`, `precedent` e outros
3. **Construir o documento** — Cria uma instância do jsPDF com tamanho de página A4
4. **Renderizar seções** — Renderiza cada tipo de bloco em seções do PDF com formatação adequada
5. **Tratar overflow** — Usa `checkPage()` para detectar quando o conteúdo excede a altura da página e adiciona novas páginas
6. **Quebra de texto** — Usa `doc.splitTextToSize(text, maxWidth)` para conteúdo de texto longo
7. **Retornar bytes** — Gera `new Uint8Array(doc.output('arraybuffer'))`

:::note
O PDF reflete as seleções do usuário ao longo das 4 fases do briefing — campos do diagnóstico, precedentes avaliados, riscos resolvidos e o conteúdo do modo de entrega escolhido.
:::

## Futuro: Exportação DOCX

Planejado para v0.5 (Issue #158):

- Exportar briefing como memorando jurídico profissional em formatos PDF e DOCX
- DOCX usará um template com formatação adequada para documentos jurídicos
- Suportará o mesmo pipeline de renderização bloco a seção usado no PDF

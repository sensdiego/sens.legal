---
title: "Exportação PDF"
description: "Como o Juca gera documentos PDF a partir de sessões de briefing usando jsPDF."
lang: pt-BR
sidebar:
  order: 10
---

# Exportação PDF

O Juca gera documentos PDF a partir de sessões de briefing usando jsPDF. O PDF é renderizado no lado do servidor como uma função pura e entregue por meio de um endpoint de API dedicado.

## Como Funciona

O pipeline de geração de PDF:

1. O cliente solicita o PDF via `GET /api/export/pdf/[sessionId]`
2. A rota de API autentica a requisição e carrega a sessão
3. `generateBriefingPDF(input)` processa os blocos da sessão em conteúdo PDF
4. O PDF é retornado como binário (`application/pdf`)

## Implementação

O gerador é uma função pura em `src/lib/pdf/generator.ts`:

```typescript
function generateBriefingPDF(input: BriefingPDFInput): Uint8Array {
  const doc = new jsPDF();

  // Extrair blocos por tipo
  const diagnosis = blocks.find(b => b.type === 'diagnosis');
  const precedents = blocks.filter(b => b.type === 'precedent');
  const riskBalance = blocks.find(b => b.type === 'risk_balance');
  const delivery = blocks.find(b => b.type === 'delivery');

  // Renderizar seções com controle manual de posição Y
  let y = 20;
  // ... renderiza cada seção, chamando checkPage() para overflow
  // Usa doc.splitTextToSize(text, maxWidth) para quebra de texto

  return new Uint8Array(doc.output('arraybuffer'));
}
```

:::tip
O gerador é uma função pura — recebe dados como entrada e retorna bytes como saída. Isso facilita o teste com `// @vitest-environment node` (o jsPDF requer Node, não jsdom).
:::

## Endpoint de API

```text
GET /api/export/pdf/[sessionId]
```

| Parâmetro | Tipo | Localização | Obrigatório |
|-----------|------|-------------|-------------|
| `sessionId` | string | Caminho da URL | Sim |

**Autenticação:** Obrigatória. Usa `auth()` de `src/lib/auth`.

**Resposta:** Conteúdo binário `application/pdf`.

## Futuro: PDF Consciente do Briefing

> 🚧 **Funcionalidade Planejada** — O PDF do v0.4 ([#289](https://github.com/sensdiego/juca/issues/289)) refletirá as seleções do usuário ao longo das 4 fases do Briefing. A estrutura do PDF se adaptará com base no modo de entrega (Síntese produz um resumo conciso; Parecer produz um layout de opinião formal).

> 🚧 **Funcionalidade Planejada** — Exportação em DOCX está planejada para o v0.5 ([#158](https://github.com/sensdiego/juca/issues/158)).

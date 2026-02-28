---
title: Endpoints de Briefing
description: Endpoints de API e server actions específicos do fluxo Briefing Progressivo.
lang: pt-BR
sidebar:
  order: 4
---

# Endpoints de Briefing

> Endpoints de API e server actions específicos do fluxo de 4 fases do Briefing Progressivo.

## Server Actions

Todas as mutações de briefing usam Server Actions definidas em `src/actions/briefing.ts`. Cada action:
- É marcada com `'use server'`
- Usa `requireActionAuth()` para autenticação
- Retorna um objeto `BriefingFlowState` (ou uma variante estendida)

### Fase 1 — Diagnóstico

| Action | Assinatura | Finalidade |
|--------|-----------|-----------|
| `updateDiagnosis` | `(sessionId, fields) → BriefingFlowState` | Atualiza campos do diagnóstico (situação, área, tema, tese). Avança da Fase 0 → Fase 1 se necessário. |
| `chooseSituation` | `(sessionId, situation) → { state, phase2Blocks }` | Define a situação do usuário. Deriva o modo de entrega e gera os blocos da Fase 2. |
| `addAdditionalContext` | `(sessionId, text) → BriefingFlowState` | Armazena contexto adicional em texto livre no estado do briefing. |

**Mapeamento Situação → Modo de Entrega:**

| Situação | Modo de Entrega | Descrição |
|---------|----------------|-----------|
| `pesquisando` | `sintese` | Usuário está pesquisando — recebe uma síntese concisa |
| `avaliando` | `parecer` | Usuário está avaliando — recebe um parecer jurídico formal |
| `atuando` | `estrategia` | Usuário está atuando — recebe um plano estratégico |
| `estudando` | `mapa` | Usuário está estudando — recebe um mapa conceitual |

### Fase 2 — Precedentes

| Action | Assinatura | Finalidade |
|--------|-----------|-----------|
| `evaluatePrecedent` | `(sessionId, processoId, evaluation) → BriefingFlowState` | Avalia um precedente como `'useful'` ou `'not_useful'`. Avança para a Fase 2 se necessário. |

### Fase 3 — Riscos

| Action | Assinatura | Finalidade |
|--------|-----------|-----------|
| `advanceToPhase3` | `(sessionId) → { state, phase3Blocks }` | Gera blocos de risco (risk_balance + gráfico) a partir da análise de caso existente. |
| `resolveRisk` | `(sessionId, riskId) → BriefingFlowState` | Marca um risco como tratado. Atualiza o bloco `risk_balance` no banco de dados. |

### Fase 4 — Entrega

| Action | Assinatura | Finalidade |
|--------|-----------|-----------|
| `generateDelivery` | `(sessionId) → { state, phase4Blocks }` | Gera blocos de entrega com base no modo de entrega selecionado. Requer que `deliveryMode` esteja definido. |
| `choosePath` | `(sessionId, pathId) → BriefingFlowState` | Define o caminho estratégico escolhido no bloco de entrega `estrategia`. Gera os próximos passos. |
| `setFaseProcessual` | `(sessionId, fase) → BriefingFlowState` | Atualiza o campo `faseProcessual` no bloco de entrega `estrategia`. |

### Finalização de Sessão

| Action | Assinatura | Finalidade |
|--------|-----------|-----------|
| `finalizeSession` | `(sessionId) → BriefingFlowState` | Marca a sessão como finalizada. Atualiza o bloco `exit_card` para `selected: 'concluir'`. |
| `handleExitAction` | `(sessionId, action) → { state, action }` | Trata a seleção do card de saída. Se `action === 'concluir'`, define `finalized = true`. |

---

## Exportação de PDF

### GET /api/export/pdf/[sessionId]

Gera e faz download de um documento PDF para uma sessão de briefing.

**Fonte:** `src/app/api/export/pdf/[sessionId]/route.ts`

**Auth:** Verificação de sessão via `auth()`. Ignorada quando `ENABLE_DEV_AUTH=true`.

**Parâmetros de path:** `sessionId: string`

**Resposta `200`:**

| Header | Valor |
|--------|-------|
| Content-Type | `application/pdf` |
| Content-Disposition | `attachment; filename="briefing-{sessionId.slice(0,8)}.pdf"` |

Corpo: bytes brutos do PDF gerado por `generateBriefingPDF()` de `src/lib/pdf/generator.ts`.

**Respostas de erro:**
- `401` — `{ error: 'Unauthorized' }`
- `404` — `{ error: 'Session not found' }` (nenhum bloco existe para o sessionId)

**Detalhes da geração do PDF:**
- Usa jsPDF para criação do PDF
- Extrai blocos por tipo do banco de dados da sessão
- Rastreamento manual de posição Y com `checkPage()` para overflow de página
- Quebra de texto via `doc.splitTextToSize(text, maxWidth)`
- Saída: `new Uint8Array(doc.output('arraybuffer'))`

---

## Endpoints Transitórios

Esses endpoints existem no Juca mas estão sendo migrados para o Valter. Serão removidos no v0.4 após a conclusão da migração:

| Grupo | Caminho | Endpoints | Destino da Migração |
|-------|--------|-----------|-------------------|
| Analyzer | `/api/analyzer/*` | 8 | Valter `/v1/factual/*`, `/v1/retrieve` |
| Chat | `/api/chat/*` | 6 | Pipeline LLM do Valter |
| KG | `/api/kg/*` | 14 | Valter `/v1/graph/*` |
| Reasoning | `/api/reasoning/*` | 4 | Extração IRAC do Valter |
| Search | `/api/search/*` | 2 | Valter `/v1/retrieve` |
| Comparator | `/api/comparator/*` | 2 | Comparação multi-modelo do Valter |

:::danger
Não construa novas funcionalidades sobre endpoints transitórios. Use o adapter Valter (v0.3) ou Server Actions.
:::

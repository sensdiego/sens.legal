---
title: "Composer & Detecção de Intenção"
description: "O componente de entrada Composer e a camada de orquestração que detecta intenção, preenche slots e encaminha consultas para as ferramentas certas."
lang: pt-BR
sidebar:
  order: 8
---

# Composer & Detecção de Intenção

O Composer é o componente de entrada do Juca — um campo de texto em formato de pílula onde os usuários digitam consultas jurídicas. Por trás dele, a camada de orquestração detecta a intenção, preenche os slots necessários e encaminha as consultas para ferramentas especializadas que chamam a API do Valter.

## Componente Composer

O Composer fica em `src/components/canvas/Composer.tsx` e segue a linguagem de design Liquid Legal:

- **Forma:** Container em formato de pílula com fundo branco e sombra suave
- **Input:** Campo de texto de largura total com placeholder
- **Botão de envio:** Circular, escuro (`--ink-primary`), com ícone de seta
- **Comportamento:** Envia via Server Action, transmite resultados via SSE

Ao enviar, o Composer chama uma Server Action que inicia o pipeline de orquestração.

## Pipeline de Orquestração

O pipeline de orquestração fica em `src/lib/unified/` e processa consultas em quatro etapas:

```text
Entrada do usuário
  → Detector de Intenção (classifica a consulta)
    → Preenchimento de Slots (extrai parâmetros)
      → Política de Clarificação (pergunta se faltam informações)
        → Registro de Ferramentas (executa a ferramenta certa)
```

### Detecção de Intenção

O Detector de Intenção (`src/lib/unified/`) classifica as consultas dos usuários em categorias que mapeiam para ferramentas. Ele considera o texto da consulta, o contexto da conversa e quaisquer artefatos referenciados.

### Preenchimento de Slots

Cada ferramenta declara os parâmetros obrigatórios (slots). O preenchedor de slots extrai valores da consulta do usuário — por exemplo, área jurídica, tribunal, número do processo ou tema.

### Política de Clarificação

Se a intenção for ambígua ou os slots obrigatórios estiverem vazios, a Política de Clarificação determina o que perguntar. Isso é renderizado como blocos `action_prompt` no WorkCanvas, apresentando opções ao usuário.

## Registro de Ferramentas

O Registro de Ferramentas mapeia intenções para implementações de ferramentas. Cada ferramenta é uma classe que estende `BaseTool`:

| Ferramenta | ID | Prioridade | Capacidades | Artefatos Principais |
|------------|----|------------|-------------|----------------------|
| AnalyzerTool | `analyzer` | 9 (mais alta) | case_analysis, search, conversation, follow_up | `case_analysis`, `document` |
| JurisTool | `juris` | 8 | search, follow_up | `search_results`, `document` |
| RatioTool | `ratio` | 7 | extraction, follow_up | `irac_extraction` |
| CompareTool | `compare` | 5 | comparison | `model_comparison` |
| InsightsTool | `insights` | 4 | statistics | `insights_stats` |

A prioridade determina qual ferramenta lida com uma consulta quando várias ferramentas correspondem. A AnalyzerTool (prioridade 9) lida com cenários complexos de análise de casos; a JurisTool (prioridade 8) lida com consultas de busca direta.

### Interface de Ferramenta

Todas as ferramentas implementam esta interface:

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

### Configuração da JurisTool

A JurisTool usa uma estratégia de busca híbrida com pesos configuráveis:

```typescript
{
  strategy: 'hybrid',
  weights: { bm25: 0.6, semantic: 0.4, kg: 1.0 },
  defaultLimit: 10
}
```

## SSE Streaming

O progresso em tempo real é transmitido para o cliente via Server-Sent Events através de `/api/v2/stream`:

**Requisição:** `POST { sessionId, text }`

**Tipos de evento:**

| Evento | Dados | Propósito |
|--------|-------|-----------|
| `stage` | `{ stage, label, tool? }` | Atualização de progresso (ex.: "Buscando precedentes...") |
| `result` | `{ blocks: Block[] }` | Blocos finais para renderizar |
| `error` | `{ message }` | Informações de erro |

**Hook do cliente:** `useSSEStream()` retorna `{ sendStreaming, isStreaming, currentStage, abort }` — fornecendo feedback de UI em tempo real e capacidade de cancelamento.

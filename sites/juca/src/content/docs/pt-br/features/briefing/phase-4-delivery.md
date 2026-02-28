---
title: "Fase 4: Entrega Contextual"
description: "Quatro modos de entrega adaptativos que apresentam a análise final ajustada à situação jurídica do usuário."
lang: pt-BR
sidebar:
  order: 4
---

# Fase 4: Entrega Contextual

A Fase 4 é o ponto culminante do Briefing — ela agrega todas as fases anteriores em um entregável personalizado. O modo de entrega é determinado pela situação do usuário selecionada na Fase 1.

## Modos de Entrega

| Modo | Situação | Conteúdo | Função Geradora |
|------|----------|----------|-----------------|
| **Síntese** | `pesquisando` | Resumo conciso de precedentes favoráveis e desfavoráveis | `buildSinteseContent()` |
| **Parecer** | `avaliando` | Parecer jurídico formal com percentual de favorabilidade | `buildParecerContent()` |
| **Estratégia** | `atuando` | 2-3 caminhos estratégicos com passos acionáveis | `buildEstrategiaContent()` |
| **Mapa** | `estudando` | Mapa de evolução temporal + análise de correntes divergentes | `buildMapaContent()` |

## O Que Acontece

1. Todos os dados das fases são agregados (diagnóstico + precedentes + riscos)
2. O modo de entrega é automaticamente selecionado com base na situação da Fase 1
3. A IA gera o entregável personalizado
4. Um bloco `delivery` renderiza o resultado
5. Um bloco `exit_card` aparece com o resumo da sessão + opção de exportação PDF

## Tipos de Blocos Produzidos

| Tipo de Bloco | Propósito |
|---------------|-----------|
| `delivery` | Resultado final da análise em um dos 4 modos adaptativos |
| `exit_card` | Card de conclusão da sessão com resumo e opções de exportação |

## Server Actions

```typescript
// Gerar a entrega com base no estado acumulado do briefing
generateDelivery(sessionId: string)
  → Returns: { state: BriefingFlowState, phase4Blocks: Block[] }

// Selecionar um caminho estratégico (modo Estratégia)
choosePath(sessionId: string, pathId: string)
  → Returns: BriefingFlowState

// Definir a fase processual
setFaseProcessual(sessionId: string, fase: string)
  → Returns: BriefingFlowState

// Concluir a sessão
finalizeSession(sessionId: string)
  → Returns: BriefingFlowState

// Tratar ações do card de saída (exportar, nova sessão, etc.)
handleExitAction(sessionId: string, action: string)
  → Returns: { state: BriefingFlowState, action: string }
```

## Exportação PDF

Após a entrega, o `exit_card` oferece exportação em PDF. O PDF gerado reflete a jornada do usuário ao longo das quatro fases:

- Resumo do diagnóstico da Fase 1
- Precedentes selecionados na Fase 2
- Visualização do balanço de riscos da Fase 3
- Conteúdo da entrega da Fase 4 no modo escolhido

Consulte [Exportação PDF](/features/pdf-export) para detalhes técnicos.

> 🚧 **Funcionalidade Planejada** — A Fase 4 está planejada para o milestone v0.4. O PDF do Briefing com as seleções das fases está rastreado em [#289](https://github.com/sensdiego/juca/issues/289).

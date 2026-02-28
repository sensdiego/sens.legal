---
title: "Feature Flags"
description: "Sistema de feature flags para rollout progressivo com suporte a parâmetros de URL e localStorage."
lang: pt-BR
sidebar:
  order: 12
---

# Feature Flags

O Juca usa um sistema de feature flags leve para rollout progressivo de funcionalidades e habilitação condicional de recursos experimentais. As flags são avaliadas no lado do cliente com três níveis de prioridade: parâmetros de URL (maior), localStorage e valores padrão (menor).

## Flags Disponíveis

| Flag | Padrão | Propósito |
|------|--------|-----------|
| `unifiedHome` | `true` | Habilitar a interface Unified Home (Block System) |
| `analyzeAfterSearch` | `false` | Disparar análise automaticamente após resultados de busca |
| `webSearchFallback` | `false` | Recorrer à busca na web quando o corpus local não tem resultados |
| `deepMode` | `false` | Habilitar o modo de análise profunda (mais completo, mais lento) |

## API

O sistema de feature flags é definido em `src/lib/featureFlags.ts`:

```typescript
import { getFlag, setFlag, clearFlag, toggleFlag } from '@/lib/featureFlags';

// Ler uma flag (verifica parâmetro de URL → localStorage → padrão)
const enabled = getFlag('unifiedHome'); // → true

// Definir uma flag no localStorage
setFlag('deepMode', true);

// Alternar uma flag, retorna o novo valor
const newValue = toggleFlag('webSearchFallback'); // → true

// Limpar uma flag (reverte para o padrão)
clearFlag('analyzeAfterSearch');
```

**Formato da chave de armazenamento:** `juca_ff_{flagName}` no localStorage.

## Hook para o Cliente

Para componentes React, use o hook `useFeatureFlag` de `src/hooks/useFeatureFlag.ts`:

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const isDeepMode = useFeatureFlag('deepMode');

  if (isDeepMode) {
    return <DeepAnalysisUI />;
  }
  return <StandardUI />;
}
```

O hook é seguro para SSR — retorna o valor padrão durante a renderização no servidor e hidrata a partir do localStorage no cliente.

## Override via URL

Qualquer flag pode ser sobrescrita via parâmetro de URL para testes:

```text
http://localhost:3000?deepMode=true&webSearchFallback=true
```

Os parâmetros de URL têm a maior prioridade e são úteis para testar combinações de funcionalidades sem modificar o localStorage.

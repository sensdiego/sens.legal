---
title: "Feature Flags"
description: "Feature flag system for progressive rollout with URL parameter and localStorage support."
lang: en
sidebar:
  order: 12
---

# Feature Flags

Juca uses a lightweight feature flag system for progressive rollout of features and conditional enabling of experimental functionality. Flags are evaluated client-side with three priority levels: URL parameters (highest), localStorage, and defaults (lowest).

## Available Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `unifiedHome` | `true` | Enable the Unified Home interface (Block System) |
| `analyzeAfterSearch` | `false` | Automatically trigger analysis after search results |
| `webSearchFallback` | `false` | Fall back to web search when local corpus has no results |
| `deepMode` | `false` | Enable deep analysis mode (more thorough, slower) |

## API

The feature flag system is defined in `src/lib/featureFlags.ts`:

```typescript
import { getFlag, setFlag, clearFlag, toggleFlag } from '@/lib/featureFlags';

// Read a flag (checks URL param → localStorage → default)
const enabled = getFlag('unifiedHome'); // → true

// Set a flag in localStorage
setFlag('deepMode', true);

// Toggle a flag, returns new value
const newValue = toggleFlag('webSearchFallback'); // → true

// Clear a flag (reverts to default)
clearFlag('analyzeAfterSearch');
```

**Storage key format:** `juca_ff_{flagName}` in localStorage.

## Client-Side Hook

For React components, use the `useFeatureFlag` hook from `src/hooks/useFeatureFlag.ts`:

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

The hook is SSR-safe — it returns the default value during server rendering and hydrates from localStorage on the client.

## Override via URL

Any flag can be overridden via URL parameter for testing:

```text
http://localhost:3000?deepMode=true&webSearchFallback=true
```

URL parameters take highest priority and are useful for testing feature combinations without modifying localStorage.

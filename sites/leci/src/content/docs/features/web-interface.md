---
title: "Web Interface"
description: "Current search shell and the next UX layer for legislation discovery and reading."
lang: en
sidebar:
  order: 5
---

# Web Interface

## The current UI is already a functional shell
Leci no longer ships just a minimal landing page. The current web surface is a search shell that validates the current legislation retrieval loop end to end.

## Current implemented behavior
The current UI already includes:
- a search experience mounted from `src/app/page.tsx`
- query state reflected in the URL
- a central results canvas
- surrounding context/navigation rails
- incremental loading for additional results

## What this interface is for
The current shell is not meant to be flashy product polish. Its role is to validate that legislation retrieval, result framing, and document context can be exercised in a way that downstream consumers can trust.

## What still comes next
The next UX layer includes:
- stronger known-item lookup for laws and references;
- richer structural reading flows at device/article level;
- clearer grounding context for downstream consumers such as Valter.

## UX quality constraints
Legal users need predictability, source clarity, and explicit structural context.

:::caution
Do not present generated or inferred legal answers without clear evidence context. Leci's UI should stay grounding-first, not answer-first.
:::

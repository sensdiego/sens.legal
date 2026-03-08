---
title: "Architecture Overview"
description: "How Douto's local batch pipeline and doctrine artifacts fit into the sens.legal knowledge layer."
lang: en
sidebar:
  order: 1
---

# Architecture Overview

Douto is a local batch pipeline plus a structured doctrine knowledge base. It is not a continuously running web service, and it should not be treated as a standalone product runtime.

## Architectural pattern

The architecture has two main parts:

- a batch-processing pipeline that transforms legal books into structured outputs
- a knowledge base layer that stores doctrinal structure and intermediate artifacts

## Pipeline flow

At a high level, Douto turns:

`PDF -> extracted text -> chunks -> enriched metadata -> embeddings -> doctrinal artifacts`

Each stage writes artifacts that can be reused later instead of depending on an always-on service.

## Position in the ecosystem

The important architectural relationship is:

`Douto -> doctrinal artifacts -> Valter -> ecosystem consumers`

This means Douto integrates into sens.legal primarily by strengthening Valter's backend knowledge layer. It does not sit directly in front of lawyers the way Juca does.

## Why this matters

If Douto is described as an autonomous doctrine product, the ecosystem narrative becomes misleading. Its real role is narrower and more useful:

- prepare doctrine locally
- structure doctrine for later reuse
- supply doctrine into the central backend knowledge layer

## Current constraints

- local and batch-oriented rather than always-on
- artifact-producing rather than API-first
- meant for ecosystem backend support rather than direct end-user interaction

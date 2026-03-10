---
title: "Douto — Jude.md Doctrine Layer"
description: "Documentation for Douto as Jude.md's internal doctrine supplier to Valter."
lang: en
sidebar:
  order: 0
---

# Douto

Douto is Jude.md's doctrine layer.
Its job is to turn legal books into traceable doctrinal retrieval and synthesis for Valter, starting with contract law and civil procedure.

## Operational Definition

- **Primary consumer:** Valter
- **Indirect consumers:** Juca, lawyers, and internal agents
- **Usage unit:** legal institute / legal problem
- **Evidence unit:** traceable doctrinal chunk
- **Delivery unit:** doctrine artifact consumable by Valter

## What Douto Does Today

- Runs a batch pipeline over legal books
- Enriches chunks with doctrinal metadata
- Generates embeddings and search artifacts
- Provides local CLI search for inspection and validation
- Maintains INDEX + MOCs as an internal editorial layer

## What Douto Does Not Yet Do

- It is not a direct end-user product
- It is not a real-time service
- It does not yet have a fully stabilized delivery contract with Valter
- Its synthesis layer is not yet released for ecosystem consumption

## Current Status

| Metric | Value |
|--------|-------|
| Books in corpus | ~50 |
| Estimated chunks | ~31,500 |
| Priority domains | Contract law and civil procedure |
| Real surface | Local pipeline + CLI search |
| Primary consumer | Valter |
| Test coverage | 0% |
| Current delivery mode | Static artifacts |

## Build Order

1. Reproducible foundation
2. Quality gate
3. Delivery contract to Valter
4. Explainable retrieval
5. Synthesis with its own gate

## Quick Links

| Section | Description |
|---------|-------------|
| [Introduction](getting-started/introduction) | What Douto is and what it is not |
| [Architecture](architecture/overview) | How the pipeline and Valter handoff are structured |
| [Integrations](configuration/integrations) | How Douto delivers today and how it should evolve |
| [Roadmap](roadmap/) | Official build sequence |

## Part of the Ecosystem

| Component | Role relative to Douto |
|-----------|------------------------|
| **Valter** | Primary consumer of doctrine artifacts |
| **Juca** | Indirect interface for lawyers |
| **Leci** | Complementary source in the ecosystem, not a competitor |
| **Joseph** | Coordination/orchestration, not Douto's product center |

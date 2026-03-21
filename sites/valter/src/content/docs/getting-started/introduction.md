---
title: "Introduction"
description: "What Valter is, why it exists, who consumes it, and how graph-led retrieval changes the system."
lang: en
sidebar:
  order: 1
---

# Introduction

Valter is the jurisprudence and reasoning backend of the sens.legal ecosystem. It serves multi-tribunal case law (STJ, TJPR, TJSP, TRF4 — 2.2M classified decisions) through REST API (50+ endpoints) and MCP (31 tools), turning raw decisions into retrieval, verification, and reasoning workflows anchored in tribunal data.

## Why Valter exists

Generic LLMs are useful legal assistants, but they are unreliable when left alone with legal references. They hallucinate decisions, misattribute ministers, and flatten complex precedent structures into vague summaries.

Valter exists to solve that problem by making legal knowledge explicit and queryable. Instead of asking a model to improvise over its training data, consumers ask Valter to retrieve, verify, compare, and explain against real jurisprudence data.

## Who consumes Valter

Valter serves three main kinds of consumers:

- **Juca**, the frontend hub that calls Valter over REST (backend migration is complete)
- **MCP clients** such as Claude and ChatGPT, which use Valter as a legal tool surface
- **Internal ecosystem workflows**, which rely on Valter as the central jurisprudence and reasoning layer

## What changed in the retrieval model

The current retrieval paradigm is **graph-led retrieval**.

That means:
- the legal graph is a primary path for discovery and explanation;
- lexical and semantic search still matter, but as complementary signals and fallback paths;
- the system should no longer be described as "hybrid search plus a knowledge-graph boost".

This distinction matters because it changes how relevance is explained. The output is not just "this score is high"; it is "this decision is connected through entities, criteria, precedent structure, and supporting search evidence."

## Core capabilities

Valter's main capabilities fall into five areas:

### Retrieval
Retrieve jurisprudence, similar cases, and filtered result sets over multi-tribunal data (STJ, TJPR, TJSP, TRF4).

### Verification
Check whether references, citations, and claims map back to real tribunal material.

### Reasoning and explainability
Expose graph-aware argument paths, divergence views, and reasoning-chain style explanations.

### Ingestion and enrichment
Support the workflows that keep the jurisprudence layer structured and queryable.

### External access
Expose the same backend through REST and MCP so frontend applications and LLM clients can consume the same legal knowledge layer.

## Where Valter fits

Within sens.legal:

| Project | Responsibility |
|---------|----------------|
| **Juca** | Frontend hub |
| **Valter** | Jurisprudence retrieval, reasoning, verification, MCP |
| **Leci** | Legislation grounding |
| **Douto** | Doctrine artifacts supplied into Valter |

Valter is the central backend where all legal retrieval, reasoning, and verification converge for the ecosystem.

## Architecture at a glance

Valter is a modular monolith with multiple runtimes:

- REST API for frontend and service consumers
- MCP transports for tool-using LLM clients
- background workers for ingest and enrichment tasks

The codebase is organized so retrieval, graph logic, verification, and external interfaces live in one backend instead of being duplicated across the ecosystem.

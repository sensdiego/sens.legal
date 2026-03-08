---
title: "Douto — Legal Doctrine Pipeline"
description: "Documentation for Douto, the local doctrine-processing pipeline that supplies doctrinal artifacts to the sens.legal ecosystem."
lang: en
sidebar:
  order: 0
---

# Douto

Douto is the local doctrine-processing pipeline of the [sens.legal](https://sens.legal) ecosystem. It transforms legal books into structured doctrinal artifacts that can later be consumed by the ecosystem's knowledge layer, especially through Valter.

## What Douto does

Douto processes doctrine from PDF to structured outputs:

- PDF extraction into structured markdown
- intelligent chunking with legal-domain heuristics
- metadata enrichment over doctrinal content
- embedding generation for doctrinal retrieval workflows
- local search and artifact generation for downstream use

## Current positioning

Douto should be understood as an **internal pipeline**, not as a finished standalone doctrine product for end users.

Its role is to:

- organize doctrinal material into reusable artifacts
- support the ecosystem's broader legal knowledge layer
- supply doctrinal context into Valter rather than compete with Juca as a user-facing experience

## Part of sens.legal

Douto is one of four projects in the sens.legal ecosystem:

| Project | Role |
|---------|------|
| **Juca** | Frontend hub for lawyers |
| **Valter** | Central jurisprudence and reasoning backend |
| **Leci** | Document-first legislation engine |
| **Douto** | Local doctrine pipeline and artifact producer |

The important boundary is this: Douto does not own the frontend and should not be framed as a self-contained legal doctrine application. Its outputs are meant to strengthen the ecosystem's backend knowledge layer.

## Quick Links

| Section | Description |
|---------|-------------|
| [Introduction](getting-started/introduction) | What Douto is, why it exists, and where it fits |
| [Quickstart](getting-started/quickstart) | Run the local pipeline baseline |
| [Architecture](architecture/overview) | How the batch pipeline and knowledge base work |
| [Features](features/) | Feature inventory with implementation status |
| [Roadmap](roadmap/) | Planned milestones and risks |
| [Glossary](reference/glossary) | Legal and technical terminology |

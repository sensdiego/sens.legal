---
title: "Artefato de Premortem de Planejamento"
description: "Artefato de stress-test de risco descrevendo cenários de falha e requisitos de mitigação."
lang: pt-BR
sidebar:
  order: 2
---


# Artefato de Premortem de Planejamento

## Purpose of this artifact
This premortem captures pessimistic failure analysis to proactively shape sequencing and quality priorities. It should inform milestone order and not be treated as optional commentary.

## Core failure themes identified
Main high-impact risk areas include:
- weak product-market validation before core reliability;
- inconsistent temporal/legal correctness;
- insufficient testing and quality gates;
- governance fragmentation across planning tools;
- ingestion staleness and silent data drift.

## How to use premortem findings
Teams should convert risk statements into explicit controls:
- gating criteria before advanced feature investment;
- quality checks tied to milestone exits;
- owners and deadlines for mitigation tasks.

## Premortem governance rule
If roadmap scope changes, reassess premortem assumptions in the same planning cycle and update mitigation commitments accordingly.

---
title: "Introduction"
description: "What Douto is, who it exists for, and what problem it solves in Jude.md."
lang: en
sidebar:
  order: 1
---

# Introduction

Douto is Jude.md's internal doctrine supplier.
It exists to fill what case law and legislation cannot cover on their own: conceptual depth, doctrinal divergence, and new argumentative paths.

## The Problem Douto Solves

Within the legal ecosystem, case law and legislation are essential, but they do not fully solve:

- opening new argumentative paths;
- enabling serious legal brainstorming;
- mapping doctrinal disagreements;
- giving depth to a legal problem before precedent is settled.

That is Douto's job.

## What Douto Is

- a batch doctrine pipeline;
- an internal supplier to Valter;
- a retrieval layer and, later, a synthesis layer;
- an editorial organizer of the doctrine corpus in markdown.

## What Douto Is Not

- an independent end-user product;
- a lawyer-facing interface;
- a case law service;
- a legislation service;
- an autonomous legal chat product.

## Who Uses Douto

| Audience | Role |
|----------|------|
| **Valter** | Primary consumer |
| **Juca** | Indirect consumer through Valter |
| **Lawyer** | Receives ecosystem-level output |
| **Internal agents** | Secondary usage, not the priority |

## Primary Unit

- **Usage unit:** legal institute / legal problem
- **Evidence unit:** traceable doctrinal chunk
- **Delivery unit:** doctrine package for Valter

## Ambiguity Rule

When two readings are plausible, Douto should not collapse them into a fake single answer.
It should:

- show both;
- explain why each appeared;
- point to the underlying evidence;
- make insufficient coverage explicit.

## Priority Domains

In the near term, Douto should be authoritative in:

1. contract law;
2. civil procedure.

## Real State Today

Today Douto has:

- a working local pipeline;
- enrichment and embeddings;
- local CLI search;
- INDEX + MOCs in markdown.

Today Douto does not yet have:

- mature programmatic delivery to Valter;
- a trustworthy quality gate;
- released synthesis.

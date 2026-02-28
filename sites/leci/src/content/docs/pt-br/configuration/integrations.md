---
title: "Integrações Externas"
description: "Integrações externas atuais e planejadas, com considerações de setup, confiabilidade e segurança."
lang: pt-BR
sidebar:
  order: 3
---


# Integrações Externas

## Integrations are intentionally minimal in current implementation
Leci currently integrates with a small set of external systems and keeps most complexity inside the repository until core reliability stabilizes.

## Active integrations
### PostgreSQL provider (Railway context)
Database connectivity is provided through `DATABASE_URL` and used by migration/tooling paths.

### GitHub Actions + Discord webhook
PR workflow sends review notifications using `DISCORD_PR_REVIEW_WEBHOOK`.

## Planned integrations
> 🚧 **Planned Feature** — Legal source ingestion providers (e.g., Planalto, LexML) are roadmap-defined but not yet integrated in code.

> 🚧 **Planned Feature** — Broader agent/API consumer integrations are roadmap work and require stable contracts first.

## Security expectations
- store secrets in CI secret stores and local `.env` only;
- do not hardcode credentials;
- validate least-privilege DB credentials per environment.

## Reliability expectations
Integration reliability should include:
- explicit failure visibility;
- freshness/status metadata for ingestion-related integrations;
- fallback behavior and operator guidance in troubleshooting docs.

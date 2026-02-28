---
title: "Modelo de Dados Core e Migrations"
description: "Como entidades legais, hierarquia e execução de migrations sustentam todas as capacidades do Leci."
lang: pt-BR
sidebar:
  order: 2
---


# Modelo de Dados Core e Migrations

## This feature is the backbone of the product
The legal data model and migration system define the reliability envelope for every present and future feature in Leci. Without schema integrity and predictable migrations, search, revisions, and integrations cannot be trusted.

## Implemented scope in current code
The implemented core model includes:
- `regulation_types` and `regulations` for legal document metadata;
- `document_nodes` for hierarchical legal structure and searchable text;
- `embeddings` for semantic retrieval preparation;
- `suggestions` and `revisions` for controlled edits and audit history.

## Migration execution behavior
Migrations are executed by `scripts/migrate.ts`, which:
1. reads SQL files in `drizzle/`;
2. sorts them by numeric prefix;
3. executes each file sequentially;
4. logs applied file names.

```ts
const migrations = getMigrationFiles();
for (const migrationPath of migrations) {
  const sql = fs.readFileSync(migrationPath, "utf8");
  await client.query(sql);
  process.stdout.write(`Applied ${path.basename(migrationPath)}\n`);
}
```

## Why this design matters
This design keeps database evolution explicit and reviewable, which is essential in legal-domain systems where accidental data drift can invalidate downstream outputs.

## Operational caveats
:::caution
The migration runner does not track applied migrations in a dedicated table. New SQL files should be idempotent or carefully guarded to avoid rerun failures.
:::

## Planned enhancements
> 🚧 **Planned Feature** — Formal migration governance and rollback policy documentation are roadmap items and not fully codified yet.

> 🚧 **Planned Feature** — Automated schema parity checks between Drizzle schema and SQL migration artifacts are planned but not implemented.

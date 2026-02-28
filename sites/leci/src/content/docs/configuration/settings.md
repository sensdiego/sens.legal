---
title: "Project Settings Files"
description: "Reference for build, runtime, lint, and database settings that control Leci behavior."
lang: en
sidebar:
  order: 2
---

# Project Settings Files

## Settings files define reproducibility and runtime consistency
Leci uses explicit configuration files for runtime, build, linting, and migration behavior. Understanding these files is essential for safe changes.

## Core runtime/build configuration
- `package.json`: scripts, dependencies, engine constraints
- `next.config.ts`: Next.js runtime config entrypoint
- `tsconfig.json`: TypeScript compiler behavior and path aliases

## Styling and linting configuration
- `postcss.config.mjs`: Tailwind plugin integration
- `eslint.config.mjs`: lint rules using Next.js presets

## Database and migration configuration
- `drizzle.config.ts`: schema path, output folder, dialect, DB credentials env binding
- `drizzle/*.sql`: migration files executed by migration script

## Governance guidance
Configuration changes should include:
- rationale in PR description;
- validation command output (`lint`, `test`, `build`);
- docs updates when developer workflow changes.

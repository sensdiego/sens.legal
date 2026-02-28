---
title: "Contributing Guide"
description: "How to contribute to Juca — branching strategy, PR process, and guidelines for human and AI contributors."
lang: en
sidebar:
  order: 4
---

# Contributing Guide

Juca accepts contributions from both human developers and AI code agents. This page covers the branching strategy, PR process, and rules that apply to all contributors.

## Before You Start

1. Follow the [Installation guide](/getting-started/installation) for full setup
2. Read the [Coding Conventions](/development/conventions) for standards
3. Read the [Testing Guide](/development/testing) for test requirements
4. Read `CLAUDE.md` at the project root for AI agent instructions

## Branching Strategy

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Stable branch, all PRs target here | CI must pass |
| `feature/[issue]-[description]-claude` | Claude Code feature branches | — |
| `feature/[issue]-[description]-codex` | Codex feature branches | — |

**Rules:**
- Always branch from `main`
- Include the GitHub issue number in the branch name
- Append `-claude` or `-codex` suffix to identify the agent
- Never work on a branch owned by the other agent

```bash
# Example: creating a branch for issue #285
git checkout main
git pull
git checkout -b feature/285-briefing-phase1-claude
```

## Making Changes

1. Create your feature branch from `main`
2. Make changes following the [conventions](/development/conventions)
3. Write tests for new functionality
4. The `pre-push` hook runs tests automatically on push
5. CI runs lint + build + unit tests on the remote

## Pull Request Guidelines

When creating a PR:

- **Title:** Short, descriptive (< 70 characters)
- **Body:** Summary of changes, link to related issue(s)
- **Tests:** All tests must pass in CI
- **No new lint errors**
- **Follow existing patterns** — don't introduce new abstractions without justification

## Rules for AI Agent Contributors

These rules from `CLAUDE.md` are mandatory:

| Rule | Rationale |
|------|-----------|
| Never run builds/bundlers locally | Saves CPU, uses CI instead |
| Prefer editing existing code | Prevents abstraction bloat |
| Don't add features beyond what's asked | Keeps changes focused |
| Don't add comments, docstrings, or types to unchanged code | Reduces diff noise |
| Default to simplest reversible solution | Maximizes flexibility |
| Never skip git hooks | Ensures code quality |

**Priority order when principles conflict:**

1. Correctness (especially security, data integrity)
2. Simplicity and clarity
3. Maintainability over time
4. Reversibility of decisions
5. Performance and optimization

## What NOT to Do

- Don't create abstractions for one-time operations
- Don't add error handling for scenarios that can't happen
- Don't design for hypothetical future requirements
- Don't add backwards-compatibility shims — just change the code
- Don't create documentation files unless explicitly requested

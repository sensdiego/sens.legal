---
title: Contributing Guide
description: How to contribute to Douto — from reporting issues to submitting pull requests.
lang: en
sidebar:
  order: 4
---

# Contributing to Douto

Guidelines for contributing code, knowledge base content, or documentation to Douto.

## Before You Start

1. **Read the introduction** -- understand what Douto does and its position in the sens.legal ecosystem. See the [project overview](/docs/getting-started/introduction/).
2. **Set up your environment** -- follow the [Development Setup](/docs/development/setup/) guide.
3. **Review the conventions** -- read the [Coding Conventions](/docs/development/conventions/) page.
4. **Check the roadmap** -- see [current priorities](/docs/roadmap/) to find high-impact work.

## Types of Contributions

### 1. Pipeline Improvements

Bug fixes, optimizations, and new features for the 5 pipeline scripts. This is where most engineering work happens.

**High-impact areas right now:**
- Standardizing environment variable usage across all scripts (F22, P0)
- Extracting shared functions to `pipeline/utils.py` (F23, P1)
- Pinning dependency versions in `requirements.txt` (F24, P1)

### 2. Tests (Highest Impact)

:::tip[Best way to contribute right now]
Adding test coverage is the single highest-impact contribution you can make. Douto has **0% test coverage**. Even one test for `rechunk_v3.py` is a meaningful improvement. See the [Testing](/docs/development/testing/) page for the planned strategy and priority functions.
:::

### 3. Knowledge Base Content

- Populate empty MOCs (MOC_CONSUMIDOR, MOC_TRIBUTARIO, MOC_CONSTITUCIONAL, MOC_COMPLIANCE, MOC_SUCESSOES)
- Catalog new books into existing MOCs
- Create atomic notes (when the `nodes/` system is implemented)

### 4. Documentation

- Improve these docs
- Add inline code comments
- Update README sections

### 5. Bug Reports

File issues with clear reproduction steps. Include:
- Which script and command you ran
- The error message or unexpected behavior
- Your environment (OS, Python version, dependency versions)
- The values of relevant environment variables (redact API keys)

## Contribution Workflow

### Step 1: Find or Create an Issue

Check the existing issues and roadmap for work to pick up. If you're fixing a new bug or proposing a feature, open an issue first to discuss the approach.

<!-- NEEDS_INPUT: Clarify whether GitHub Issues or Linear (SEN-XXX) is the primary tracker. Decision D04 is pending. -->

### Step 2: Create a Branch

```bash
git fetch origin
git checkout main
git pull origin main

# Feature branch
git checkout -b feat/SEN-XXX-short-description

# Bug fix branch
git checkout -b fix/SEN-XXX-short-description

# Documentation branch
git checkout -b docs/short-description
```

### Step 3: Make Changes

Follow the [Coding Conventions](/docs/development/conventions/). Key checkpoints:

- [ ] No hardcoded absolute paths
- [ ] Type hints on public functions
- [ ] `--dry-run` support if the script modifies data
- [ ] Specific exception handling (no broad `except Exception`)
- [ ] Structured logging for important events

### Step 4: Test Your Changes

Since there are no automated tests yet, verify manually:

```bash
# For pipeline changes: test with a small subset
python3 pipeline/rechunk_v3.py --dry-run --limit 5

# For search changes: run a known query and check results
python3 pipeline/search_doutrina_v2.py "boa-fe objetiva" --area contratos
```

When tests exist (v0.3+):

```bash
make test
make lint
```

### Step 5: Commit

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git add pipeline/rechunk_v3.py
git commit -m "feat: add bibliography detection to rechunker -- SEN-XXX"
```

| Prefix | When to use |
|--------|------------|
| `feat:` | New functionality |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `refactor:` | Code restructuring without behavior change |
| `test:` | Adding or updating tests |
| `chore:` | Build, dependencies, tooling |

### Step 6: Push and Open a PR

```bash
git push -u origin feat/SEN-XXX-short-description
```

Then open a pull request on GitHub targeting `main`.

## Pull Request Guidelines

### PR Checklist

- [ ] **Focused scope** -- one feature or fix per PR. Don't mix unrelated changes.
- [ ] **Clear description** -- explain *what* changed and *why*. Link to the issue or roadmap feature.
- [ ] **No breaking changes** -- unless discussed and approved in the issue.
- [ ] **Tests** -- add tests for new functionality (when the test framework exists).
- [ ] **Documentation** -- update docs if user-facing behavior changes.
- [ ] **No secrets** -- double-check that `.env` files, API keys, or large data files are not included.
- [ ] **No formatting noise** -- don't include unrelated whitespace or style changes.

### PR Title Format

```
feat: short description of what this PR does
fix: what was broken and how it's fixed
docs: what documentation was updated
```

### PR Body Template

```markdown
## What

Brief description of the change.

## Why

Link to issue, roadmap feature, or explain the motivation.

## How

Key implementation decisions. What alternatives were considered.

## Testing

How you verified the change works (manual steps or test commands).
```

## Knowledge Base Contributions

Special guidelines for changes to the `knowledge/` directory:

### Adding a New Book to a MOC

1. Open the relevant MOC file (e.g., `knowledge/mocs/MOC_CIVIL.md`)
2. Add the book entry with all required metadata:

```markdown
### Titulo do Livro
- **Autor:** Nome do Autor
- **Editora:** Editora
- **Edicao:** Xa edicao, ANO
- **Chunks:** (pending processing)
- **Status:** catalogado
```

3. Verify the book's legal domain matches the MOC
4. Do **not** update `INDEX_DOUTO.md` unless adding a new domain

### Adding a New Domain/MOC

1. Create `knowledge/mocs/MOC_{DOMAIN}.md` with required frontmatter
2. Add the domain to `knowledge/INDEX_DOUTO.md` with a wikilink
3. Update the documentation

### Rules

- Use **wikilinks** (`[[target]]`) for all internal references
- Follow the **frontmatter schema** defined in [Conventions](/docs/development/conventions/#knowledge-base-conventions)
- Set `status_enriquecimento` correctly -- never leave it as `"pendente"` after enrichment
- Include book metadata: title, author, edition, publisher
- Verify links resolve correctly (open in Obsidian to check)

## Issue Tracking

:::note[Pending decision -- D04]
The source of truth for issue tracking is currently unclear. Commits reference Linear issues (SEN-XXX), but GitHub Issues is empty (0 open, 0 closed). Decision D04 will resolve whether to use Linear, GitHub Issues, or a hybrid approach.
:::

**For now:**
- File issues on GitHub with descriptive labels
- Reference Linear ticket numbers in commits and PRs when applicable

**Suggested labels:**

| Label | Color | Use for |
|-------|-------|---------|
| `tech-debt` | red | Hardcoded paths, missing tests, duplicated code |
| `pipeline` | blue | Changes to pipeline scripts |
| `knowledge-base` | green | MOC updates, new books, atomic notes |
| `integration` | purple | sens.legal ecosystem integration |
| `testing` | yellow | Test infrastructure and coverage |
| `documentation` | gray | Docs improvements |

## Ownership & Attribution

Douto is the exclusive property of Diego Sens (@sensdiego). All contributions are made under the project's license terms.

When commits involve AI assistance, use the mandatory format:

```
Co-Authored-By (execucao): Claude Opus 4.6 <noreply@anthropic.com>
```

The term **(execucao)** indicates AI assisted with implementation. Conception, architecture, product decisions, and intellectual property remain with the author.

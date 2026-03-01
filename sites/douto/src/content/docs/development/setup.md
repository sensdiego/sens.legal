---
title: Development Setup
description: How to set up a development environment for contributing to Douto.
lang: en
sidebar:
  order: 1
---

# Development Setup

Everything you need to start developing on Douto -- from cloning to running your first pipeline pass.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.10+ | Required for modern type hints (`tuple[dict, str]`) |
| pip | Latest | Package installer |
| Git | Any recent | Version control |
| RAM | 8 GB+ | PyTorch + Legal-BERTimbau model loading |
| Disk | ~2 GB free | Model cache (~500 MB) + embeddings data |

**Optional:**

| Tool | Purpose |
|------|---------|
| CUDA-compatible GPU | Faster embedding generation (CPU works, just slower) |
| [Obsidian](https://obsidian.md/) | Navigate the knowledge base visually with wikilinks |
| API keys | See below -- only needed for specific pipeline stages |

## Clone and Install

```bash
# Clone the repository
git clone https://github.com/sensdiego/douto.git
cd douto

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r pipeline/requirements.txt
```

:::caution[Unpinned dependencies]
The `requirements.txt` does not specify version numbers. Dependency versions may drift over time and cause incompatibilities. Pinning versions is tracked as F24 (v0.2). If you encounter issues, try matching the versions from a known working environment.

Current dependencies:
- `sentence-transformers`
- `torch`
- `numpy`
- `anthropic`
- `llama-parse`
:::

## Configure Environment

Set environment variables based on what you plan to do. See the [Environment Variables](/docs/configuration/environment/) reference for full details.

### Minimal (search only)

```bash
export DATA_PATH="/path/to/juca/data"
```

### Full pipeline

```bash
export VAULT_PATH="/path/to/your/vault"
export OUTPUT_PATH="/path/to/juca/data"
export DATA_PATH="/path/to/juca/data"
export MINIMAX_API_KEY="your-minimax-key"
export LLAMA_CLOUD_API_KEY="your-llamaparse-key"
```

:::tip
Create a `.env` file in the project root and `source .env` before working. See the [Environment Variables](/docs/configuration/environment/#example-env-file) page for a template.
:::

## Verify Setup

Run these commands to confirm each component is working:

```bash
# Check Python version (need 3.10+)
python3 --version

# Check sentence-transformers
python3 -c "import sentence_transformers; print('sentence-transformers OK')"

# Check PyTorch and CUDA availability
python3 -c "import torch; print(f'torch OK, CUDA: {torch.cuda.is_available()}')"

# Check anthropic SDK
python3 -c "import anthropic; print('anthropic SDK OK')"

# Check pipeline scripts are accessible
python3 pipeline/search_doutrina_v2.py --help
python3 pipeline/rechunk_v3.py --help
python3 pipeline/enrich_chunks.py --help
```

If all checks pass, your environment is ready.

## Project Structure

```
douto/
├── AGENTS.md                 # Agent identity, responsibilities, boundaries
├── CLAUDE.md                 # Coding guidelines for AI agents
├── ROADMAP.md                # Product roadmap with milestones
├── PROJECT_MAP.md            # Full project diagnostic
├── PREMORTEM.md              # Risk analysis and failure scenarios
├── knowledge/
│   ├── INDEX_DOUTO.md        # Skill graph index — entry point
│   ├── mocs/
│   │   ├── MOC_CIVIL.md      # 35 books, ~9,365 chunks
│   │   ├── MOC_PROCESSUAL.md # 8 books, ~22,182 chunks
│   │   ├── MOC_EMPRESARIAL.md# 7 books
│   │   └── MOC_CONSUMIDOR.md # Placeholder (not yet populated)
│   └── nodes/
│       └── .gitkeep          # Atomic notes (future — F36)
├── pipeline/
│   ├── process_books.py      # Step 1: PDF → markdown (LlamaParse)
│   ├── rechunk_v3.py         # Step 2: markdown → intelligent chunks
│   ├── enrich_chunks.py      # Step 3: chunks → classified (MiniMax M2.5)
│   ├── embed_doutrina.py     # Step 4: chunks → 768-dim embeddings
│   ├── search_doutrina_v2.py # Step 5: hybrid semantic + BM25 search
│   └── requirements.txt      # Python dependencies (unpinned)
├── tools/
│   └── .gitkeep              # Auxiliary tools (future)
└── docs/                     # Starlight documentation site
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `pipeline/` | ETL scripts that process legal textbooks into searchable data |
| `knowledge/` | Obsidian-compatible markdown skill graph (MOCs, index, future atomic notes) |
| `tools/` | Reserved for auxiliary scripts (empty) |
| `docs/` | Project documentation (Starlight/Astro) |

### Pipeline Data Flow

```
process_books.py → rechunk_v3.py → enrich_chunks.py → embed_doutrina.py → search_doutrina_v2.py
     PDF→MD          MD→chunks      chunks→metadata    chunks→vectors      vectors→results
```

Each script depends on the output of the previous one. They must be run sequentially.

## Development Workflow

### 1. Create a Branch

```bash
git fetch origin
git checkout -b feat/SEN-XXX-description  # feature
git checkout -b fix/SEN-XXX-description   # bug fix
git checkout -b docs/description          # documentation
```

Branch naming follows the pattern `{type}/SEN-{ticket}-{description}` when linked to a Linear issue, or `{type}/{description}` otherwise.

### 2. Make Changes

Follow the [Coding Conventions](/docs/development/conventions/). Key rules:

- Type hints on all public functions
- `--dry-run` support for scripts that modify data
- `os.environ.get()` for all paths (no hardcoded absolutes)
- Idempotent operations (safe to re-run)

### 3. Test Your Changes

:::note
There are currently **no automated tests** (0% coverage). Testing is manual. When tests are added (v0.3, F26-F27), the workflow will include `make test`.
:::

For pipeline changes, test with a small subset:

```bash
python3 pipeline/rechunk_v3.py --dry-run --limit 5
```

### 4. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add pipeline/rechunk_v3.py
git commit -m "feat: add bibliography detection to rechunker"
```

Commit types: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### 5. Push and Open a PR

```bash
git push -u origin feat/SEN-XXX-description
```

Create a pull request targeting `main`. Include a description of what changed and why.

### Multi-Agent Coordination

This project is developed by two AI code agents:

- **Claude Code** -- local execution
- **Codex (OpenAI)** -- cloud execution

**Rule:** Never work on the same branch that Codex is using.

```bash
git branch -a | grep codex  # check for active Codex branches
```

## IDE Recommendations

| Tool | Use |
|------|-----|
| **VS Code** | Primary editor, with Python extension for type checking and linting |
| **Obsidian** | Navigate `knowledge/` visually -- wikilinks, graph view, frontmatter |
| **ruff extension** | Linting (when configured -- F32) |

Open the `knowledge/` directory as an Obsidian vault to see the skill graph in graph view and follow wikilinks between MOCs and future atomic notes.

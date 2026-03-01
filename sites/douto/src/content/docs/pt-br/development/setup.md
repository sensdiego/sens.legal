---
title: Configuracao do Ambiente
description: Como configurar o ambiente de desenvolvimento para contribuir com o Douto.
lang: pt-BR
sidebar:
  order: 1
---

# Configuracao do Ambiente

Tudo o que voce precisa para comecar a desenvolver no Douto -- do clone ao primeiro pipeline executado.

## Pre-requisitos

| Requisito | Versao | Observacoes |
|-----------|--------|-------------|
| Python | 3.10+ | Necessario para type hints modernos (`tuple[dict, str]`) |
| pip | Mais recente | Instalador de pacotes |
| Git | Qualquer recente | Controle de versao |
| RAM | 8 GB+ | Carregamento do PyTorch + modelo Legal-BERTimbau |
| Disco | ~2 GB livres | Cache do modelo (~500 MB) + dados de embeddings |

**Opcionais:**

| Ferramenta | Proposito |
|------------|-----------|
| GPU compativel com CUDA | Geracao de embeddings mais rapida (CPU funciona, so e mais lento) |
| [Obsidian](https://obsidian.md/) | Navegar a knowledge base visualmente com wikilinks |
| API keys | Veja abaixo -- necessarias apenas para etapas especificas do pipeline |

## Clone e Instalacao

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

:::caution[Dependencias sem versao fixa]
O `requirements.txt` nao especifica numeros de versao. As versoes das dependencias podem divergir ao longo do tempo e causar incompatibilidades. Fixar as versoes e rastreado como F24 (v0.2). Se encontrar problemas, tente usar as versoes de um ambiente que sabidamente funciona.

Dependencias atuais:
- `sentence-transformers`
- `torch`
- `numpy`
- `anthropic`
- `llama-parse`
:::

## Configurar Variaveis de Ambiente

Defina as variaveis de ambiente conforme o que voce pretende fazer. Veja a referencia de [Variaveis de Ambiente](/docs/configuration/environment/) para detalhes completos.

### Minimo (apenas busca)

```bash
export DATA_PATH="/path/to/juca/data"
```

### Pipeline completo

```bash
export VAULT_PATH="/path/to/your/vault"
export OUTPUT_PATH="/path/to/juca/data"
export DATA_PATH="/path/to/juca/data"
export MINIMAX_API_KEY="your-minimax-key"
export LLAMA_CLOUD_API_KEY="your-llamaparse-key"
```

:::tip
Crie um arquivo `.env` na raiz do projeto e execute `source .env` antes de trabalhar. Veja a pagina de [Variaveis de Ambiente](/docs/configuration/environment/#example-env-file) para um template.
:::

## Verificar a Instalacao

Execute estes comandos para confirmar que cada componente esta funcionando:

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

Se todas as verificacoes passarem, seu ambiente esta pronto.

## Estrutura do Projeto

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

### Diretorios Principais

| Diretorio | Proposito |
|-----------|-----------|
| `pipeline/` | Scripts ETL que processam livros juridicos em dados pesquisaveis |
| `knowledge/` | Skill graph em markdown compativel com Obsidian (MOCs, indice, futuras notas atomicas) |
| `tools/` | Reservado para scripts auxiliares (vazio) |
| `docs/` | Documentacao do projeto (Starlight/Astro) |

### Fluxo de Dados do Pipeline

```
process_books.py → rechunk_v3.py → enrich_chunks.py → embed_doutrina.py → search_doutrina_v2.py
     PDF→MD          MD→chunks      chunks→metadata    chunks→vectors      vectors→results
```

Cada script depende do output do anterior. Devem ser executados sequencialmente.

## Workflow de Desenvolvimento

### 1. Criar uma Branch

```bash
git fetch origin
git checkout -b feat/SEN-XXX-description  # feature
git checkout -b fix/SEN-XXX-description   # bug fix
git checkout -b docs/description          # documentation
```

A nomenclatura de branches segue o padrao `{type}/SEN-{ticket}-{description}` quando vinculado a uma issue do Linear, ou `{type}/{description}` caso contrario.

### 2. Fazer as Alteracoes

Siga as [Convencoes de Codigo](/docs/development/conventions/). Regras principais:

- Type hints em todas as funcoes publicas
- Suporte a `--dry-run` em scripts que modificam dados
- `os.environ.get()` para todos os caminhos (nada hardcoded)
- Operacoes idempotentes (seguras para re-executar)

### 3. Testar as Alteracoes

:::note
Atualmente **nao ha testes automatizados** (0% de cobertura). Os testes sao manuais. Quando forem adicionados (v0.3, F26-F27), o workflow incluira `make test`.
:::

Para alteracoes no pipeline, teste com um subconjunto pequeno:

```bash
python3 pipeline/rechunk_v3.py --dry-run --limit 5
```

### 4. Fazer Commit

Use o formato [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add pipeline/rechunk_v3.py
git commit -m "feat: add bibliography detection to rechunker"
```

Tipos de commit: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### 5. Push e Abrir PR

```bash
git push -u origin feat/SEN-XXX-description
```

Crie um pull request apontando para `main`. Inclua uma descricao do que mudou e por que.

### Coordenacao Multi-Agente

Este projeto e desenvolvido por dois agentes de codigo IA:

- **Claude Code** -- execucao local
- **Codex (OpenAI)** -- execucao em cloud

**Regra:** Nunca trabalhar na mesma branch que o Codex esta usando.

```bash
git branch -a | grep codex  # check for active Codex branches
```

## Recomendacoes de IDE

| Ferramenta | Uso |
|------------|-----|
| **VS Code** | Editor principal, com extensao Python para type checking e linting |
| **Obsidian** | Navegar `knowledge/` visualmente -- wikilinks, graph view, frontmatter |
| **Extensao ruff** | Linting (quando configurado -- F32) |

Abra o diretorio `knowledge/` como uma vault no Obsidian para visualizar o skill graph no graph view e seguir wikilinks entre MOCs e futuras notas atomicas.

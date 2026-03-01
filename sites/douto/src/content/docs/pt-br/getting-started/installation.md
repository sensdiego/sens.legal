---
title: "Instalacao"
description: "Guia completo de setup para executar o pipeline inteiro do Douto, da extracao de PDF ate a busca."
lang: pt-BR
sidebar:
  order: 3
---

# Instalacao

Este guia cobre o setup completo para executar todos os estagios do pipeline do Douto, da extracao de PDF ate a busca. Se voce so precisa pesquisar no corpus existente, veja o [Quickstart](quickstart).

## Requisitos de Sistema

| Requisito | Minimo | Recomendado |
|-----------|--------|-------------|
| Python | 3.10+ | 3.11+ |
| RAM | 4 GB | 8 GB+ |
| Disco | 2 GB (modelos + corpus) | 10 GB (com todos os livros) |
| GPU | Nao necessaria | Compativel com CUDA (acelera geracao de embeddings) |
| SO | Linux, macOS, WSL2 | Linux ou macOS |

## Passo 1: Clone o Repositorio

```bash
git clone https://github.com/sensdiego/douto.git
cd douto
```

## Passo 2: Crie um Ambiente Virtual

```bash
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows
pip install -r pipeline/requirements.txt
```

:::caution
Todas as dependencias no `requirements.txt` estao sem versoes fixas (`sentence-transformers` em vez de `sentence-transformers==2.6.1`). Para builds reprodutiveis, considere executar `pip freeze > requirements.lock` apos a instalacao e fazer commit do arquivo. Isso esta rastreado como [F24 no roadmap](../roadmap/milestones#v02--stable-pipeline).
:::

Dependencias atuais:

| Pacote | Finalidade | Tamanho |
|--------|-----------|---------|
| `sentence-transformers` | Geracao de embeddings (Legal-BERTimbau) | ~200 MB |
| `torch` | Backend de ML para sentence-transformers | ~800 MB |
| `numpy` | Operacoes vetoriais (similaridade cosseno, etc.) | ~30 MB |
| `anthropic` | SDK para API MiniMax M2.5 (via custom base_url) | ~5 MB |
| `llama-parse` | Extracao de PDF via LlamaIndex | ~10 MB |

## Passo 3: Configure as Variaveis de Ambiente

```bash
# Necessario para todos os estagios do pipeline
export VAULT_PATH="/caminho/para/sua/vault"

# Necessario para extracao de PDF (process_books.py)
export LLAMA_CLOUD_API_KEY="sua-chave-llamaparse"

# Necessario para enriquecimento de chunks (enrich_chunks.py)
export MINIMAX_API_KEY="sua-chave-minimax"

# Opcional: personalizar caminhos de saida
export OUTPUT_PATH="/caminho/para/output"    # padrao: ~/.openclaw/workspace/juca/data
export DATA_PATH="/caminho/para/search/data" # padrao: mesmo que OUTPUT_PATH
```

O diretorio `VAULT_PATH` deve ser uma vault Obsidian com a seguinte estrutura:

```
$VAULT_PATH/
└── Knowledge/
    └── _staging/
        ├── input/      # Coloque os PDFs aqui
        ├── processed/  # Saida do process_books.py e rechunk_v3.py
        └── failed/     # PDFs que falharam na extracao
```

:::danger
Dois scripts do pipeline (`process_books.py` e `rechunk_v3.py`) atualmente possuem **caminhos hardcoded** em vez de ler `VAULT_PATH` do ambiente. Ate que a [F22](../roadmap/milestones#v02--stable-pipeline) seja implementada, pode ser necessario editar esses caminhos diretamente nos scripts:

- `process_books.py` linha 27: `VAULT_PATH = Path("/home/sensd/.openclaw/workspace/vault")`
- `rechunk_v3.py` linha 29: `VAULT_PATH = Path("/mnt/c/Users/sensd/vault")`
:::

Para a referencia completa de variaveis de ambiente, veja [Variaveis de Ambiente](../configuration/environment).

## Passo 4: Baixe o Modelo de Embedding

A biblioteca `sentence-transformers` baixa automaticamente o `rufimelo/Legal-BERTimbau-sts-base` (~500 MB) na primeira execucao. Para baixar antecipadamente:

```bash
python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base')"
```

:::tip
Para armazenar modelos em um local personalizado, defina `SENTENCE_TRANSFORMERS_HOME` ou `HF_HOME` antes de baixar:
```bash
export SENTENCE_TRANSFORMERS_HOME="/caminho/para/cache/de/modelos"
```
:::

## Passo 5: Verifique a Instalacao

```bash
# Verificar versao do Python
python3 --version  # Deve ser 3.10+

# Verificar dependencias principais
python3 -c "from sentence_transformers import SentenceTransformer; print('sentence-transformers OK')"
python3 -c "import torch; print(f'torch OK, CUDA: {torch.cuda.is_available()}')"
python3 -c "import numpy; print(f'numpy OK, version: {numpy.__version__}')"
python3 -c "import anthropic; print('anthropic OK')"

# Verificar CLI de busca
python3 pipeline/search_doutrina_v2.py --help
```

## Executando o Pipeline Completo

Cada estagio depende da saida do anterior. Execute-os em ordem:

### Estagio 1: Extracao de PDF

```bash
# Coloque os PDFs em $VAULT_PATH/Knowledge/_staging/input/
python3 pipeline/process_books.py --dry-run   # Pre-visualizar o que sera processado
python3 pipeline/process_books.py             # Executar a extracao
python3 pipeline/process_books.py --tier fast # Usar tier mais barato do LlamaParse
```

Requer: `LLAMA_CLOUD_API_KEY`. Veja [Extracao de PDF](../features/pipeline/pdf-extraction).

### Estagio 2: Chunking Inteligente

```bash
python3 pipeline/rechunk_v3.py --dry-run       # Pre-visualizar
python3 pipeline/rechunk_v3.py                  # Processar todos os livros
python3 pipeline/rechunk_v3.py contratos-gomes  # Processar um livro
python3 pipeline/rechunk_v3.py --min-chars 1500 # Tamanho minimo de chunk personalizado
```

Nao requer API keys. Veja [Chunking Inteligente](../features/pipeline/intelligent-chunking).

### Estagio 3: Enriquecimento de Chunks

```bash
python3 pipeline/enrich_chunks.py --dry-run   # Pre-visualizar
python3 pipeline/enrich_chunks.py all         # Enriquecer todos os chunks
python3 pipeline/enrich_chunks.py contratos   # Enriquecer uma area
```

Requer: `MINIMAX_API_KEY`. Veja [Enriquecimento](../features/pipeline/enrichment).

### Estagio 4: Geracao de Embeddings

```bash
python3 pipeline/embed_doutrina.py --dry-run  # Pre-visualizar
python3 pipeline/embed_doutrina.py            # Gerar embeddings
```

Nao requer API keys (o modelo e baixado do HuggingFace). Veja [Embeddings](../features/pipeline/embeddings).

### Estagio 5: Busca

```bash
python3 pipeline/search_doutrina_v2.py --interativo  # Modo interativo
python3 pipeline/search_doutrina_v2.py "query" --area all
```

Veja [Busca Hibrida](../features/pipeline/hybrid-search).

## Troubleshooting

### `FileNotFoundError` em caminhos hardcoded

Dois scripts possuem caminhos hardcoded. Edite-os diretamente ou aguarde a [F22](../roadmap/milestones#v02--stable-pipeline):

```python
# process_books.py linha 27 — altere para:
VAULT_PATH = Path(os.environ.get("VAULT_PATH", "/seu/caminho"))

# rechunk_v3.py linha 29 — altere para:
VAULT_PATH = Path(os.environ.get("VAULT_PATH", "/seu/caminho"))
```

### Erros de CUDA no PyTorch

Se sua GPU nao for compativel, force o modo CPU:

```bash
export CUDA_VISIBLE_DEVICES=""
```

### `enrich_prompt.md` nao encontrado

O arquivo de prompt de enriquecimento esta **ausente do repositorio**. Este e um problema critico conhecido ([RT01 no PREMORTEM.md](https://github.com/sensdiego/douto/blob/main/PREMORTEM.md)). Ate que seja recuperado, o enriquecimento de novos chunks vai falhar.

Para mais solucoes, veja [Troubleshooting](../reference/troubleshooting).

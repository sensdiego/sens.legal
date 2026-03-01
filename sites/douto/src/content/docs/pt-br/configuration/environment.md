---
title: Variaveis de Ambiente
description: Referencia completa de todas as variaveis de ambiente usadas no pipeline do Douto.
lang: pt-BR
sidebar:
  order: 1
---

# Variaveis de Ambiente

Todas as variaveis de ambiente usadas pelo Douto, quais scripts as leem, valores padrao e se sao obrigatorias.

## Referencia de Variaveis

| Variavel | Obrigatoria | Padrao | Usada Em | Descricao |
|----------|-------------|--------|----------|-----------|
| `VAULT_PATH` | Sim | varia (veja Problemas Conhecidos) | `enrich_chunks.py`, `embed_doutrina.py` | Caminho para o vault Obsidian contendo chunks markdown processados em `Knowledge/_staging/processed/` |
| `OUTPUT_PATH` | Nao | `~/.openclaw/workspace/juca/data` | `embed_doutrina.py` | Diretorio onde os arquivos JSON de embeddings, corpus e indice BM25 sao gravados |
| `DATA_PATH` | Nao | `~/.openclaw/workspace/juca/data` | `search_doutrina_v2.py` | Diretorio contendo os dados de busca pre-construidos (embeddings, corpus, indice BM25) |
| `MINIMAX_API_KEY` | Sim (para enriquecimento) | -- | `enrich_chunks.py` | Chave de API para MiniMax M2.5, usada via Anthropic SDK com `base_url` customizado |
| `LLAMA_CLOUD_API_KEY` | Sim (para extracao) | -- | `process_books.py` | Chave de API para LlamaParse (LlamaIndex), carregada implicitamente pelo SDK |

:::caution[Dois scripts usam caminhos hardcoded]
`process_books.py` e `rechunk_v3.py` **nao** leem `VAULT_PATH` do ambiente. Eles possuem caminhos absolutos hardcoded. Definir `VAULT_PATH` nao tem efeito nesses scripts ate que [F22](/docs/roadmap/milestones/#v02--stable-pipeline) seja concluido.
:::

### Variaveis Opcionais / Implicitas

| Variavel | Obrigatoria | Padrao | Descricao |
|----------|-------------|--------|-----------|
| `HF_HOME` | Nao | `~/.cache/huggingface` | Sobrescreve o diretorio de cache do HuggingFace onde o `Legal-BERTimbau` e baixado |
| `SENTENCE_TRANSFORMERS_HOME` | Nao | `$HF_HOME` | Sobrescreve o cache de modelos do sentence-transformers especificamente |
| `CUDA_VISIBLE_DEVICES` | Nao | todas as GPUs | Restringe quais GPU(s) o PyTorch usa para geracao de embeddings |

## Problemas Conhecidos com Caminhos

:::danger[Tres caminhos padrao diferentes entre scripts]
Os scripts do pipeline atualmente referenciam tres ambientes hardcoded diferentes, fazendo o pipeline executavel **apenas na maquina do criador**:

| Script | Caminho | Ambiente |
|--------|---------|----------|
| `process_books.py` (linha 27) | `/home/sensd/.openclaw/workspace/vault` | Linux nativo |
| `rechunk_v3.py` (linha 29) | `/mnt/c/Users/sensd/vault` | WSL (montagem Windows) |
| `enrich_chunks.py` (linha 25) | `os.environ.get("VAULT_PATH", "/mnt/c/Users/sensd/vault")` | WSL fallback |
| `embed_doutrina.py` (linha 21) | `os.environ.get("VAULT_PATH", "/mnt/c/Users/sensd/vault")` | WSL fallback |
| `search_doutrina_v2.py` (linha 23) | `os.environ.get("DATA_PATH", "/home/sensd/.openclaw/workspace/juca/data")` | Linux nativo |

Essa inconsistencia e o **item #1 de divida tecnica** (classificado P0) e esta rastreado como F22 no roadmap. A solucao e padronizar todos os scripts para usar `os.environ.get()` com um fallback unico e consistente.
:::

### Relacao Entre Caminhos

Os scripts esperam uma estrutura de diretorios especifica sob `VAULT_PATH`:

```
$VAULT_PATH/
  Knowledge/
    _staging/
      input/         # PDFs para processar (process_books.py le daqui)
      processed/     # Capitulos markdown + chunks enriquecidos (todos os scripts)
      failed/        # Extracoes de PDF que falharam
      processing_log.jsonl
```

`OUTPUT_PATH` e `DATA_PATH` apontam por padrao para o mesmo diretorio (`~/.openclaw/workspace/juca/data`), onde ficam os arquivos de embeddings e indice de busca:

```
$OUTPUT_PATH/  (== $DATA_PATH/)
  embeddings_doutrina.json
  search_corpus_doutrina.json
  bm25_index_doutrina.json
  embeddings_processo_civil.json
  search_corpus_processo_civil.json
  bm25_index_processo_civil.json
```

## Configuracao por Caso de Uso

### Apenas Busca (consultar dados existentes)

Voce so precisa de `DATA_PATH`:

```bash
export DATA_PATH="/path/to/juca/data"
python3 pipeline/search_doutrina_v2.py --interativo
```

### Geracao de Embeddings

Voce precisa de `VAULT_PATH` (chunks fonte) e `OUTPUT_PATH` (onde gravar os embeddings):

```bash
export VAULT_PATH="/path/to/vault"
export OUTPUT_PATH="/path/to/juca/data"
python3 pipeline/embed_doutrina.py
```

### Enriquecimento de Chunks

Voce precisa de `VAULT_PATH` (chunks fonte) e `MINIMAX_API_KEY`:

```bash
export VAULT_PATH="/path/to/vault"
export MINIMAX_API_KEY="your-minimax-api-key"
python3 pipeline/enrich_chunks.py all
```

### Pipeline Completo (PDF ate busca)

Todas as variaveis sao necessarias:

```bash
export VAULT_PATH="/path/to/vault"
export OUTPUT_PATH="/path/to/juca/data"
export MINIMAX_API_KEY="your-minimax-api-key"
export LLAMA_CLOUD_API_KEY="your-llamaparse-key"

python3 pipeline/process_books.py          # PDF -> markdown
python3 pipeline/rechunk_v3.py             # markdown -> chunks
python3 pipeline/enrich_chunks.py all      # chunks -> classified
python3 pipeline/embed_doutrina.py         # chunks -> embeddings
python3 pipeline/search_doutrina_v2.py -i  # interactive search
```

:::caution
Lembre-se que `process_books.py` e `rechunk_v3.py` atualmente **ignoram** `VAULT_PATH` e usam caminhos hardcoded. Voce precisa editar esses arquivos diretamente ou aguardar [F22](/docs/roadmap/milestones/#v02--stable-pipeline).
:::

## Exemplo de Arquivo .env

:::note
O Douto **nao** usa `python-dotenv`. As variaveis de ambiente devem ser definidas no seu shell (ex.: `export` em bash/zsh, ou carregadas de um arquivo). O arquivo `.env` abaixo e um template para seu perfil de shell ou um arquivo para `source`.
:::

```bash
# Douto — Environment Variables
# Copy this to .env and run: source .env

# Path to the Obsidian vault with Knowledge/_staging/ structure
export VAULT_PATH="/path/to/your/vault"

# Where embedding and search index JSONs are written/read
export OUTPUT_PATH="/path/to/juca/data"
export DATA_PATH="/path/to/juca/data"  # typically same as OUTPUT_PATH

# API Keys — required for specific pipeline stages
export MINIMAX_API_KEY="your-minimax-api-key"        # enrichment (enrich_chunks.py)
export LLAMA_CLOUD_API_KEY="your-llamaparse-key"      # PDF extraction (process_books.py)

# Optional: HuggingFace model cache (Legal-BERTimbau is ~500MB)
# export HF_HOME="/path/to/hf-cache"

# Optional: GPU control
# export CUDA_VISIBLE_DEVICES="0"  # use only GPU 0
```

:::tip
Adicione `.env` ao seu `.gitignore` para evitar commitar chaves de API. O `.gitignore` do projeto ja exclui arquivos `.env`.
:::

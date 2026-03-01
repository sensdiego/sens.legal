---
title: "Quickstart"
description: "Execute uma busca doutrinaria em menos de 5 minutos com o corpus pre-construido do Douto."
lang: pt-BR
sidebar:
  order: 2
---

# Quickstart

Este guia permite executar uma busca doutrinaria no corpus pre-construido do Douto em menos de 5 minutos. Para o setup completo do pipeline (incluindo extracao de PDF e enriquecimento), veja [Instalacao](installation).

## Pre-requisitos

- Python 3.10 ou superior
- pip
- ~4 GB de RAM (para carregar embeddings em memoria)
- Arquivos do corpus pre-construido (JSON) — disponiveis com o mantenedor do projeto

## 1. Clone e Instale

```bash
git clone https://github.com/sensdiego/douto.git
cd douto
pip install -r pipeline/requirements.txt
```

:::caution
As dependencias no `requirements.txt` estao atualmente sem versoes fixas. Se voce encontrar conflitos de versao, veja [Instalacao](installation) para alternativas. A fixacao de versoes esta planejada para a [v0.2](../roadmap/milestones#v02--stable-pipeline).
:::

## 2. Configure o Caminho dos Dados

Aponte o Douto para o diretorio que contem os arquivos do corpus pre-construido:

```bash
export DATA_PATH="/caminho/para/seu/corpus/data"
```

Esse diretorio deve conter:

| Arquivo | Descricao |
|---------|-----------|
| `embeddings_doutrina.json` | Vetores de embedding 768-dim para chunks de direito contratual |
| `search_corpus_doutrina.json` | Metadados de cada chunk (titulo, autor, instituto, etc.) |
| `bm25_index_doutrina.json` | Documentos tokenizados para busca BM25 por palavras-chave |
| `embeddings_processo_civil.json` | Embeddings para chunks de processo civil |
| `search_corpus_processo_civil.json` | Metadados para chunks de processo civil |
| `bm25_index_processo_civil.json` | Indice BM25 para processo civil |

## 3. Execute uma Busca

### Consulta Unica

```bash
# Buscar direito contratual por "exceptio non adimpleti contractus"
python3 pipeline/search_doutrina_v2.py "exceptio non adimpleti contractus" --area contratos

# Buscar processo civil por "tutela antecipada"
python3 pipeline/search_doutrina_v2.py "tutela antecipada requisitos" --area processo_civil

# Buscar em todas as areas
python3 pipeline/search_doutrina_v2.py "boa-fé objetiva" --area all --verbose
```

### Modo Interativo

```bash
python3 pipeline/search_doutrina_v2.py --interativo
```

No modo interativo, voce tem um REPL com os seguintes comandos:

| Comando | Descricao |
|---------|-----------|
| `/area contratos\|processo_civil\|all` | Alterna a area de busca |
| `/filtro instituto=X tipo=Y fase=Z` | Define filtros por metadados |
| `/verbose` | Alterna a pre-visualizacao do texto dos chunks |
| `/top N` | Altera o numero de resultados (padrao: 5) |
| `/bm25` | Muda para busca somente por palavras-chave |
| `/sem` | Muda para busca somente semantica |
| `/hybrid` | Muda para busca hibrida (padrao) |
| `/quit` | Sair |

### Com Filtros

```bash
# Buscar por um instituto juridico especifico
python3 pipeline/search_doutrina_v2.py "contrato bilateral" --instituto "exceptio" --area contratos

# Buscar somente definicoes
python3 pipeline/search_doutrina_v2.py "boa-fé objetiva" --tipo "definicao" --verbose
```

## 4. Entenda o Output

Um resultado tipico de busca tem esta aparencia:

```
  1. [0.847] 📗 Da Exceção do Contrato Não Cumprido
     📖 Contratos — Orlando Gomes (chunk 26/89) [contratos]
     🏷️  exceptio non adimpleti contractus, contrato bilateral | definição, requisitos
```

| Elemento | Significado |
|----------|------------|
| `1.` | Posicao no ranking |
| `[0.847]` | Score de relevancia (0-1, quanto maior melhor) |
| `📗` / `📘` | Area: 📗 = contratos, 📘 = processo_civil |
| Primeira linha | Titulo do chunk (heading da secao no livro) |
| `📖` | Titulo do livro, autor, posicao do chunk dentro do livro |
| `🏷️` | Tags de instituto e tags de tipo de conteudo do enriquecimento |

Com `--verbose`, o texto real do chunk (primeiros 300 caracteres) tambem e exibido.

## Proximos Passos

- [Instalacao](installation) — setup completo do pipeline (extracao de PDF, enriquecimento, geracao de embeddings)
- [Busca Hibrida](../features/pipeline/hybrid-search) — aprofundamento nos modos de busca e configuracao
- [Visao Geral da Arquitetura](../architecture/overview) — entenda o fluxo completo de dados

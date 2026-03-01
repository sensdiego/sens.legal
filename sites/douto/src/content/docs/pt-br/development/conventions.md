---
title: Convencoes de Codigo
description: Padroes de codigo, convencoes de nomenclatura e diretrizes arquiteturais para o desenvolvimento do Douto.
lang: pt-BR
sidebar:
  order: 2
---

# Convencoes de Codigo

Padroes e convencoes para todas as contribuicoes de codigo e knowledge base ao Douto. Extraidos do `CLAUDE.md` e aplicados durante code review.

## Ordem de Prioridade

Quando principios conflitam, priorizar nesta ordem:

| Prioridade | Principio | Na Pratica |
|------------|-----------|------------|
| 1 | **Corretude** | Dados juridicos, citacoes e metadados devem ser precisos. Uma classificacao errada de `instituto` e pior do que uma consulta lenta. |
| 2 | **Simplicidade e clareza** | Codigo que outro agente (ou um humano daqui a seis meses) entende sem contexto. Nada de truques engenhosos. |
| 3 | **Manutenibilidade** | Facil de alterar sem quebrar. Funcoes pequenas, interfaces claras, acoplamento minimo entre scripts. |
| 4 | **Reversibilidade** | Preferir decisoes que possam ser desfeitas. Usar `--dry-run`, manter dados originais, evitar operacoes destrutivas. |
| 5 | **Performance** | So otimizar quando houver evidencia de problema. Nunca sacrificar corretude ou clareza por velocidade. |

:::tip
Em caso de duvida, escolha a opcao mais simples e reversivel. Proponha a abordagem minima e explique alternativas com trade-offs. Pergunte antes de implementar se os requisitos nao estiverem claros.
:::

## Convencoes Python

### Linguagem & Stack

- **Python 3.10+** -- necessario para sintaxe moderna de type hints
- **Type hints** sao obrigatorios em todas as funcoes publicas
- **`async/await`** apenas onde necessario (LlamaParse). O pipeline e majoritariamente sincrono.
- **Testes:** `pytest` (quando implementados)
- **Linting:** `ruff` (quando configurado)

### Estilo

| Convencao | Regra | Exemplo |
|-----------|-------|---------|
| Funcoes/variaveis | `snake_case` | `parse_frontmatter()`, `chunk_text` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_CHUNK_CHARS`, `MODEL_NAME` |
| Type hints | Sintaxe moderna | `tuple[dict, str]`, nao `Tuple[Dict, str]` |
| Formatacao de strings | f-strings preferencialmente | `f"Processed {count} chunks"` |
| Imports | stdlib, depois third-party, depois local, separados por linhas em branco | Veja abaixo |
| Tamanho de linha | Seguir defaults do `ruff` (quando configurado) | ~88 caracteres |

```python
# Import order example
import os
import json
import re
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

from pipeline.utils import parse_frontmatter, slugify
```

### Tratamento de Erros

- **Excecoes especificas** -- nunca usar `except Exception as e` generico. Capturar o tipo de erro especifico.
- **Logar com contexto** -- incluir `doc_id`, `chunk_id` e traceback ao logar erros.
- **Falhar ruidosamente** -- se um chunk esta corrompido, logar e pular em vez de produzir lixo silenciosamente.

:::caution
O codebase atual tem 4 catches genericos `except Exception` (PREMORTEM RT07). Codigo novo nao deve introduzir mais. Os existentes devem ser especificados durante refatoracoes.
:::

### Docstrings

Obrigatorias para todas as funcoes publicas. Usar formato Google-style:

```python
def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter and body from a markdown string.

    Args:
        content: Full markdown content with optional frontmatter.

    Returns:
        Tuple of (metadata dict, body text without frontmatter).
        If no frontmatter found, returns ({}, original content).
    """
```

## Convencoes de Scripts do Pipeline

Todo script do pipeline deve seguir estes padroes:

### Funcionalidades Obrigatorias

| Funcionalidade | Implementacao | Proposito |
|----------------|---------------|-----------|
| `--help` | `argparse` | Documentar uso via CLI |
| `--dry-run` | Verificar antes de gravar | Mostrar o que aconteceria sem modificar dados |
| `--force` | Pular verificacoes de idempotencia | Reprocessar itens ja completos |
| Idempotente | Marcadores de processamento, logica de skip | Seguro para re-executar sem efeitos colaterais |
| Logging estruturado | Append em `processing_log.jsonl` | Rastrear sucessos, erros, skips |

### Tratamento de Caminhos

```python
# CORRECT: use os.environ.get() with documented fallback
VAULT_PATH = Path(os.environ.get("VAULT_PATH", "/default/fallback/path"))

# INCORRECT: hardcoded absolute path
VAULT_PATH = Path("/home/sensd/.openclaw/workspace/vault")

# CORRECT: relative to script location
PROMPT_PATH = Path(__file__).parent / "enrich_prompt.md"
```

:::danger
Nenhum caminho absoluto hardcoded em scripts do pipeline. Todo caminho deve usar `os.environ.get()` ou ser relativo a localizacao do script (`Path(__file__).parent`). Este e um checkpoint de revisao pre-commit.
:::

### Convencoes de Output

- **JSON** para output de dados (embeddings, corpus, BM25 index)
- **YAML frontmatter** para metadados em chunks markdown
- **JSONL** para logs estruturados (append-only)
- Output de **progresso** vai para `stderr`; resultados vao para `stdout`

### Limites de Recursos

Nao executar processos que consumam mais de 50% de CPU localmente. Para validacao:

```bash
python3 pipeline/rechunk_v3.py --limit 5 --dry-run  # test with small subset
```

## Convencoes da Knowledge Base

### INDEX_DOUTO.md

- **Fonte de verdade** para dominios e navegacao
- Lista todos os 8 dominios juridicos com wikilinks para seus MOCs
- Deve ser atualizado ao adicionar novos dominios

### Arquivos MOC

Campos obrigatorios no frontmatter:

```yaml
---
type: moc
domain: civil
description: "Obrigacoes, contratos, responsabilidade civil, propriedade"
---
```

### Arquivos de Chunk (Enriquecidos)

Campos obrigatorios no frontmatter:

```yaml
---
knowledge_id: "contratos-orlando-gomes-cap05-001"
tipo: chunk
titulo: "Titulo do chunk"
livro_titulo: "Contratos"
autor: "Orlando Gomes"
area_direito: civil
status_enriquecimento: completo  # "completo" | "pendente" | "lixo"
---
```

Regras:
- Chunks com `status_enriquecimento: "completo"` devem ter `instituto` e `tipo_conteudo` preenchidos
- Nunca sobrescrever chunks enriquecidos sem `--force` explicito
- Nunca deixar `status_enriquecimento: "pendente"` apos execucao do enriquecimento
- Usar `"lixo"` para chunks ruidosos (prefacios, agradecimentos, fichas catalograficas)

### Links

- **Sempre** usar wikilinks: `[[MOC_CIVIL]]`
- **Nunca** usar links relativos markdown: `[text](../mocs/MOC_CIVIL.md)`
- Wikilinks habilitam o graph view e o rastreamento de backlinks no Obsidian

### Encoding

- UTF-8 para todos os arquivos
- Quebras de linha LF (estilo Unix)

## Convencoes de Embeddings

| Regra | Detalhe |
|-------|---------|
| Modelo unico | `rufimelo/Legal-BERTimbau-sts-base` (768-dim) |
| Normalizacao | Sempre `normalize_embeddings=True` para cosine similarity |
| Composicao de texto | Usar `compose_embedding_text()` -- nunca fazer embedding de texto bruto do chunk |
| Nomenclatura de output | `embeddings_{area}.json`, `search_corpus_{area}.json`, `bm25_index_{area}.json` |
| Compatibilidade | Output deve ser compativel com a infraestrutura do Valter/Juca |

O formato do texto composto:

```
[categoria | instituto_1, instituto_2 | tipo_conteudo | titulo | corpo]
```

Isso garante que o embedding capture tanto o contexto de metadados quanto o conteudo real.

## Convencoes de Git

### Nomenclatura de Branches

```
feat/SEN-XXX-description    # nova feature vinculada a issue do Linear
fix/SEN-XXX-description     # bug fix vinculado a issue do Linear
docs/description            # alteracoes de documentacao
refactor/description        # reestruturacao de codigo
```

Adicionar sufixo `-claude` para branches criadas pelo Claude Code, `-codex` para branches criadas pelo Codex.

### Mensagens de Commit

Seguir o formato [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add bibliography detection to rechunker
fix: handle colons in frontmatter values
docs: update environment variable reference
refactor: extract parse_frontmatter to utils.py
test: add fixtures for smart_split edge cases
chore: pin dependency versions
```

Incluir a referencia do ticket Linear quando aplicavel:

```
feat: standardize env vars across pipeline -- SEN-358
```

### Co-Autoria

Quando commits sao produzidos com assistencia de IA:

```
Co-Authored-By (execucao): Claude Opus 4.6 <noreply@anthropic.com>
```

O termo **(execucao)** indica que a IA auxiliou na implementacao. Toda concepcao, arquitetura, decisoes de produto e propriedade intelectual pertencem ao dono do projeto.

### Nunca Fazer Commit De

- Arquivos `.env` ou API keys
- Arquivos JSON de embeddings (muito grandes, artefatos gerados)
- Diretorios `__pycache__/`
- Pesos de modelo ou cache do HuggingFace
- Node modules (caso alguma ferramenta frontend seja adicionada)

## O que NAO Fazer (Non-Goals)

Nao fazer o seguinte sem autorizacao explicita:

| Non-goal | Razao |
|----------|-------|
| Introduzir abstracoes sem necessidade clara | Simplicidade acima de elegancia |
| Adicionar dependencias para problemas ja resolvidos no codebase | Minimizar superficie de dependencias |
| Refatorar codigo funcionando sem issue especifica | Se funciona, nao mexa |
| Otimizar sem evidencia de problemas de performance | Otimizacao prematura e a raiz de todo mal |
| Expandir escopo alem da issue sendo trabalhada | Manter o foco |
| Criar API/MCP server antes do pipeline estar estavel | Fundacao antes de features |
| Gerenciar casos (trabalho do Joseph) | O escopo do Douto e apenas doutrina |
| Buscar jurisprudencia (trabalho do Juca/Valter) | O escopo do Douto e apenas doutrina |
| Buscar legislacao (trabalho da Leci) | O escopo do Douto e apenas doutrina |
| Gerenciar infraestrutura (trabalho do Valter) | Douto e um pipeline de processamento, nao um servico |

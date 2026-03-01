---
title: Configuracoes e Parametros
description: Configuracoes hardcoded, parametros ajustaveis e constantes de configuracao em todo o pipeline do Douto.
lang: pt-BR
sidebar:
  order: 2
---

# Configuracoes e Parametros

Parametros configuraveis do Douto. A maioria esta atualmente hardcoded nos arquivos-fonte e precisa ser externalizada em milestones futuros.

## Configuracoes do Pipeline

### process_books.py -- Extracao de PDF

| Configuracao | Valor | Localizacao | Configuravel |
|-------------|-------|-------------|-------------|
| `DEFAULT_TIER` | `"cost_effective"` | Linha 37 | Sim, via `--tier` (argumento CLI) |
| Padrao de divisao por capitulo | Headers H1/H2 em markdown | Hardcoded em `split_into_chapters()` | Nao |
| Diretorio de entrada | `$VAULT_PATH/Knowledge/_staging/input/` | Hardcoded | Nao |
| Diretorio de saida | `$VAULT_PATH/Knowledge/_staging/processed/` | Hardcoded | Nao |
| Diretorio de falhas | `$VAULT_PATH/Knowledge/_staging/failed/` | Hardcoded | Nao |

**Tiers do LlamaParse:**

| Tier | Qualidade | Velocidade | Custo | Quando usar |
|------|-----------|-----------|-------|-------------|
| `agentic` | Melhor | Mais lento | Mais alto | PDFs escaneados, layouts complexos, tabelas |
| `cost_effective` | Boa (padrao) | Media | Medio | PDFs de texto limpo, maioria dos livros juridicos |
| `fast` | Basica | Mais rapida | Mais baixo | Documentos somente texto |

```bash
python3 pipeline/process_books.py --tier agentic livro.pdf
```

---

### rechunk_v3.py -- Chunking Inteligente

| Configuracao | Valor | Localizacao | Configuravel |
|-------------|-------|-------------|-------------|
| `MIN_CHUNK_CHARS` | `1500` | Linha 32 | Sim, via `--min-chars` (argumento CLI) |
| `MAX_CHUNK_CHARS` | `15000` | Linha 33 | Nao (hardcoded) |
| `SECTION_PATTERNS` | 16 padroes regex | Linhas 41-72 | Nao (hardcoded) |
| Limiar de running header | Deteccao baseada em frequencia | Heuristica hardcoded | Nao |

**Padroes de Deteccao de Secao (16 no total):**

O rechunker reconhece os seguintes padroes estruturais em markdown juridico:

| Tipo de Padrao | Exemplo | ID do Regex |
|---------------|---------|-------------|
| Headers markdown | `## Section Title` | `md_header` |
| Capitulos em ingles | `**Chapter 5:** Title` | `chapter_en` |
| Capitulos em portugues | `**Capitulo X** Title` | `capitulo_pt` |
| CHAPTER em caixa alta | `CHAPTER 5 Title` | `chapter_caps` |
| CAPITULO em caixa alta | `CAPITULO X` | `capitulo_caps` |
| Titulo (livro) | `TITULO VI` | `titulo` |
| Parte | `PARTE GERAL` | `parte` |
| Part em ingles | `Part One` | `part_en` |
| Artigo de lei | `Art. 481.` ou `### Art. 481` | `artigo` |
| Secao em portugues | `Secao I` | `secao` |
| Section em ingles | `Section X` | `section_en` |
| Numerado caixa alta | `1. TITULO EM MAIUSCULAS` | `numbered_caps` |
| Numerado negrito | `**1.** Title` | `numbered_bold` |
| Linha caixa alta | `RESPONSABILIDADE CIVIL OBJETIVA` | `allcaps_title` |
| Titulo negrito caixa alta | `**SOME TITLE HERE**` | `bold_caps_title` |

:::note
Os padroes sao avaliados em ordem. O primeiro match vence. Isso significa que headers markdown (`## Title`) tem prioridade sobre todos os outros padroes.
:::

**Regras de Chunking (hardcoded, nao configuraveis):**

- Notas de rodape sao agrupadas com o paragrafo pai
- Artigos de lei + comentario nunca sao separados
- Exemplos praticos permanecem com o principio que ilustram
- Running headers (titulo/autor repetidos) sao filtrados por frequencia
- Bibliografias sao extraidas como chunks separados com tipo `"bibliografia"`
- Prefacios, agradecimentos e fichas catalograficas sao filtrados como ruido

---

### enrich_chunks.py -- Enriquecimento de Metadados

| Configuracao | Valor | Localizacao | Configuravel |
|-------------|-------|-------------|-------------|
| `MINIMAX_BASE_URL` | `"https://api.minimax.io/anthropic"` | Linha 30 | Nao (hardcoded) |
| `MINIMAX_MODEL` | `"MiniMax-M2.5"` | Linha 31 | Nao (hardcoded) |
| `WORKERS` | `5` | Linha 34 | Nao (hardcoded) |
| `DELAY_BETWEEN_REQUESTS` | `0.5` segundos | Linha 35 | Nao (hardcoded) |
| `PROMPT_PATH` | `pipeline/enrich_prompt.md` | Linha 27 | Nao (hardcoded) |

:::danger[Arquivo de prompt ausente]
`enrich_prompt.md` e referenciado na linha 27, mas **nao esta presente no repositorio**. Isso significa que o enriquecimento nao pode ser executado em novos chunks ate que o prompt seja recuperado ou reconstruido. Rastreado como acao de mitigacao M01 (prioridade P0).
:::

**Campos de Metadados de Enriquecimento:**

O LLM classifica cada chunk nos seguintes campos estruturados:

| Campo | Tipo | Descricao | Valores de exemplo |
|-------|------|-----------|-------------------|
| `categoria` | string | Categoria de alto nivel | `"doutrina"`, `"legislacao_comentada"` |
| `instituto` | list[string] | Institutos juridicos | `["boa-fe objetiva", "exceptio non adimpleti"]` |
| `tipo_conteudo` | string | Tipo de conteudo | `"definicao"`, `"requisitos"`, `"exemplo"`, `"critica"` |
| `fase` | string | Fase processual | `"formacao"`, `"execucao"`, `"extincao"` |
| `ramo` | string | Ramo do direito | `"civil"`, `"processual_civil"`, `"empresarial"` |
| `fontes_normativas` | list[string] | Referencias normativas | `["CC art. 476", "CPC art. 300"]` |

---

### embed_doutrina.py -- Geracao de Embeddings

| Configuracao | Valor | Localizacao | Configuravel |
|-------------|-------|-------------|-------------|
| `MODEL_NAME` | `"rufimelo/Legal-BERTimbau-sts-base"` | Linha 24 | Nao (hardcoded) |
| Dimensoes do embedding | 768 | Determinado pelo modelo | Nao |
| `BATCH_SIZE` | `32` | Linha 25 | Nao (hardcoded) |
| `MAX_TOKENS` | `512` | Linha 26 | Nao (hardcoded, limite do BERTimbau) |
| Normalizacao | `True` | Hardcoded | Nao |

**Template de Composicao de Texto:**

Embeddings sao gerados a partir de um texto composto, nao do corpo bruto do chunk:

```
[categoria | instituto_1, instituto_2 | tipo_conteudo | titulo | corpo_truncado_at_512_tokens]
```

:::caution
Se os metadados de enriquecimento estiverem incorretos (veja PREMORTEM PF01), o texto composto contera informacoes erradas, fazendo o embedding representar algo diferente do conteudo real do chunk. O limite de 512 tokens do modelo significa que o corpo e truncado silenciosamente.
:::

**Arquivos de Saida:**

| Arquivo | Conteudo |
|---------|----------|
| `embeddings_{area}.json` | Vetores de 768 dimensoes por chunk, normalizados |
| `search_corpus_{area}.json` | Texto do chunk + metadados para exibicao |
| `bm25_index_{area}.json` | Termos pre-tokenizados para ranking BM25 |

---

### search_doutrina_v2.py -- Busca Hibrida

| Configuracao | Valor | Localizacao | Configuravel |
|-------------|-------|-------------|-------------|
| `semantic_weight` | `0.7` | Linha 163 (padrao da funcao) | Sim, via `/weight` no modo interativo |
| BM25 `k1` | `1.5` | Linha 126 | Nao (hardcoded) |
| BM25 `b` | `0.75` | Linha 126 | Nao (hardcoded) |
| `top_k` padrao | `5` | Linha 263 | Sim, via `--top` (argumento CLI) ou `/top` |

**Modos de Busca (interativo):**

| Comando | Modo | Descricao |
|---------|------|-----------|
| `/hybrid` | Hibrido (padrao) | `semantic_weight * cosine + (1 - semantic_weight) * BM25` |
| `/sem` | Apenas semantico | Similaridade cosseno pura nos embeddings |
| `/bm25` | Apenas BM25 | Ranking puro por palavras-chave |
| `/area contratos` | Filtro por area | Restringir busca a uma area juridica especifica |
| `/filtro instituto=X` | Filtro por metadado | Filtrar por campo de metadado de enriquecimento |
| `/verbose` | Saida detalhada | Mostrar texto completo do chunk nos resultados |
| `/top N` | Top-K | Alterar numero de resultados retornados |

**Parametros do BM25 Explicados:**

- `k1 = 1.5` -- Controla a saturacao de frequencia de termos. Valores mais altos dao mais peso a termos repetidos. Faixa padrao: 1.2-2.0.
- `b = 0.75` -- Controla a normalizacao por comprimento do documento. `b = 1.0` significa normalizacao total; `b = 0.0` significa sem normalizacao. Valor padrao para texto geral.

:::note
As frequencias de documentos do BM25 sao recalculadas a cada consulta (complexidade O(N * T)). Este e um problema de performance conhecido, rastreado no PREMORTEM RT06. A pre-computacao esta planejada como acao de mitigacao M13.
:::

---

## Configuracoes da Knowledge Base

Estas convencoes sao definidas no `CLAUDE.md` e aplicadas manualmente:

### Schema de Frontmatter

**Arquivos MOC** requerem:

```yaml
---
type: moc
domain: civil          # legal domain
description: "..."     # brief description
---
```

**Arquivos de chunk** requerem:

```yaml
---
knowledge_id: "contratos-orlando-gomes-cap05-001"
tipo: chunk
titulo: "Exceptio non adimpleti contractus"
livro_titulo: "Contratos"
autor: "Orlando Gomes"
area_direito: civil
status_enriquecimento: completo  # or "pendente" or "lixo"
instituto: ["exceptio non adimpleti contractus"]
tipo_conteudo: definicao
ramo: civil
---
```

### Convencoes de Nomenclatura de Arquivos

| Tipo | Padrao | Exemplo |
|------|--------|---------|
| MOC | `MOC_{DOMAIN}.md` | `MOC_CIVIL.md` |
| Diretorio do livro | `{author}-{title}` (slugificado) | `contratos-orlando-gomes/` |
| Arquivo de chunk | `chunk_{NNN}.md` | `chunk_001.md` |

### Formato de Links

Sempre use wikilinks no estilo Obsidian para referencias internas:

```markdown
[[MOC_CIVIL]]           # correct
[MOC Civil](mocs/MOC_CIVIL.md)  # incorrect — never use relative markdown links
```

---

## Roadmap de Configuracao

As configuracoes atuais estao espalhadas por 5 scripts como constantes hardcoded. O roadmap inclui varios passos rumo a uma configuracao centralizada:

| Milestone | Feature | O que muda |
|-----------|---------|-----------|
| v0.2 | F22 | Todos os caminhos usam `os.environ.get()` com fallbacks consistentes |
| v0.2 | F23 | Configuracoes compartilhadas extraidas para `pipeline/utils.py` |
| v0.3 | F31 | `Makefile` com targets configuraveis (`make pipeline`, `make test`) |
| v0.3 | F32 | Configuracao do linter `ruff` |

> **Feature Planejada** -- Um `config.yaml` ou `pyproject.toml` centralizado para todas as configuracoes do pipeline esta em consideracao, mas ainda nao esta no roadmap. Atualmente, editar os arquivos-fonte e a unica forma de alterar a maioria dos parametros.

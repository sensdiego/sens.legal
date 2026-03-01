---
title: "Funcionalidade: Geracao de Embeddings"
description: "Como o embed_doutrina.py gera embeddings de 768 dimensoes com Legal-BERTimbau usando uma estrategia de composicao de texto enriquecida por metadados para busca semantica."
lang: pt-BR
sidebar:
  order: 4
---

# Geracao de Embeddings (F04)

`pipeline/embed_doutrina.py` -- Gera embeddings semanticos de 768 dimensoes usando Legal-BERTimbau, com uma estrategia de composicao de texto enriquecida por metadados que embute nao apenas o corpo do chunk, mas tambem sua classificacao juridica. E isso que viabiliza a busca semantica sobre o corpus doutrinario.

## Visao Geral

| Propriedade | Valor |
|-------------|-------|
| **Script** | `pipeline/embed_doutrina.py` (345 linhas) |
| **Entrada** | Chunks enriquecidos com `status_enriquecimento: "completo"` |
| **Saida** | Tres arquivos JSON: embeddings, corpus de busca, indice BM25 |
| **Modelo** | `rufimelo/Legal-BERTimbau-sts-base` (768-dim) |
| **Max tokens** | 512 (`MAX_TOKENS`) |
| **Batch size** | 32 (`BATCH_SIZE`) |
| **Device** | CUDA se disponivel, senao CPU |

## Estrategia de Composicao de Texto

Esta e a decisao de design mais importante do estagio de embeddings. Em vez de gerar embeddings do texto bruto do chunk, o Douto compoe um prefixo estruturado que captura a classificacao juridica dentro do limite de tokens do BERT.

### Formato

```
[categoria] | [institutos] | [tipo_conteudo] | [titulo] | [corpo_truncado]
```

### Por Que Isso Importa

O Legal-BERTimbau tem um limite rigido de 512 tokens (~2.000 caracteres em portugues). O corpo bruto de um chunk consumiria todo o orcamento de tokens com texto, perdendo o sinal semantico da sua classificacao. Ao prefixar com metadados estruturados, o embedding captura tanto *sobre o que* o texto trata (instituto, categoria) quanto *que tipo* de conteudo e (definicao vs. jurisprudencia vs. exemplo) no espaco vetorial.

Isso significa que uma busca por "requisitos da exceptio non adimpleti contractus" vai encontrar chunks classificados como `instituto: ["exceptio_non_adimpleti_contractus"]` + `tipo_conteudo: ["requisitos"]` mesmo que o corpo do texto use fraseologia diferente.

### O Codigo

```python
def compose_embedding_text(fm: dict, body: str) -> str:
    parts = []

    # 1. Categoria geral
    cat = fm.get("categoria", "")
    if cat:
        parts.append(cat)

    # 2. Institutos juridicos (most important for search)
    institutos = fm.get("instituto", [])
    if isinstance(institutos, list) and institutos:
        parts.append(", ".join(i.replace("_", " ") for i in institutos[:5]))

    # 3. Tipo de conteudo (definicao, jurisprudencia, etc.)
    tipos = fm.get("tipo_conteudo", [])
    if isinstance(tipos, list) and tipos:
        parts.append(", ".join(t.replace("_", " ") for t in tipos[:3]))

    # 4. Titulo da secao
    titulo = fm.get("titulo", "")
    if titulo:
        titulo_clean = re.sub(r'\(cont\.\s*\d+\)', '', titulo).strip()
        titulo_clean = re.sub(r'^\d+\.\s*', '', titulo_clean).strip()
        if titulo_clean:
            parts.append(titulo_clean[:150])

    # 5. Corpo — truncate to fit model (512 tokens ~ 2000 chars PT)
    body_clean = body.strip()
    body_clean = re.sub(r'^>.*\n', '', body_clean, flags=re.MULTILINE).strip()
    body_clean = re.sub(r'^#+\s+.*\n', '', body_clean, count=1).strip()

    prefix = " | ".join(parts)

    # BERTimbau: ~512 tokens, ~4 chars/token PT -> ~2000 chars
    max_body = 1800 - len(prefix)
    if max_body < 200:
        max_body = 200

    text = f"{prefix} | {body_clean[:max_body]}"
    return text
```

### Exemplo de Saida

```
contratos | contrato bilateral, exceptio non adimpleti contractus |
definicao, requisitos | Contratos bilaterais e unilaterais |
A exceptio non adimpleti contractus e a defesa que pode ser oposta
pelo contratante demandado quando o outro nao cumpriu...
```

:::tip
Os underscores nos nomes de instituto sao substituidos por espacos antes do embedding (`i.replace("_", " ")`) para que o tokenizador do BERT os trate como linguagem natural em vez de tokens unicos.
:::

## Estrutura da Entrada do Corpus

Para cada chunk, `build_corpus_entry()` cria um documento de metadados usado para exibicao de resultados e filtragem:

```python
def build_corpus_entry(fm: dict, body: str, filepath: Path) -> dict:
    return {
        "id": filepath.stem,           # e.g., "026-contratos-bilaterais"
        "livro": fm.get("livro_titulo", ""),
        "autor": fm.get("autor", ""),
        "titulo": fm.get("titulo", ""),
        "chunk_numero": fm.get("chunk_numero", 0),
        "chunk_total": fm.get("chunk_total", 0),
        "categoria": fm.get("categoria", ""),
        "instituto": fm.get("instituto", []),
        "sub_instituto": fm.get("sub_instituto", []),
        "tipo_conteudo": fm.get("tipo_conteudo", []),
        "fase": fm.get("fase", []),
        "ramo": fm.get("ramo", ""),
        "fontes_normativas": fm.get("fontes_normativas", []),
        "confiabilidade": fm.get("confiabilidade", ""),
        "livro_dir": filepath.parent.name,
        "texto": body[:3000],           # Preview for display
    }
```

## Arquivos de Saida

O script produz tres arquivos, todos JSON, projetados para compatibilidade com a infraestrutura existente do Juca/Valter.

| Arquivo | Conteudo | Usado Por |
|---------|----------|-----------|
| `embeddings_doutrina.json` | `doc_ids[]` + `embeddings[][]` (768-dim float32, normalizados) + metadados do modelo | Busca semantica (`search_doutrina_v2.py`) |
| `search_corpus_doutrina.json` | Metadados completos por chunk (15 campos de `build_corpus_entry`) | Exibicao de resultados e filtragem por metadados |
| `bm25_index_doutrina.json` | `doc_ids[]` + `documents[]` (texto composto, mesmo input dos embeddings) | Busca BM25 por keywords |

### Estrutura do JSON de Embeddings

```json
{
  "model": "rufimelo/Legal-BERTimbau-sts-base",
  "dimension": 768,
  "num_docs": 9365,
  "min_val": -0.123,
  "max_val": 0.456,
  "created_at": "2026-02-28T14:30:00",
  "doc_ids": ["book-dir/001-chapter-slug", "..."],
  "embeddings": [[0.012, -0.034, ...], ...]
}
```

:::note
Os embeddings sao armazenados como arrays JSON planos, nao em formatos binarios como FAISS ou indices HNSW. Isso significa que toda a matriz de embeddings precisa ser carregada na memoria para busca. Para o corpus atual (~31.500 chunks, 768 dimensoes), isso requer aproximadamente 500 MB de RAM. Isso nao escala alem de ~100 livros sem migracao para um banco vetorial (rastreado como mitigacao **M12** -- migracao para Qdrant).
:::

## Coleta e Filtragem de Chunks

Antes de gerar embeddings, `collect_chunks()` filtra o corpus:

1. **Pula arquivos com prefixo `_`** (arquivos de indice como `_INDEX.md`, `_RAW_FULL.md`)
2. **Pula `status_enriquecimento: "lixo"`** (chunks de ruido)
3. **Pula chunks com corpo < 200 caracteres**
4. **Pula chunks nao enriquecidos** (sem `instituto` e sem `tipo_conteudo` -- ainda nao classificados)

Isso garante que apenas chunks substantivos e classificados entrem no indice de embeddings.

## Configuracao

### Variaveis de Ambiente

| Variavel | Obrigatoria | Padrao | Descricao |
|----------|-------------|--------|-----------|
| `VAULT_PATH` | Nao | `/mnt/c/Users/sensd/vault` | Diretorio base com chunks enriquecidos |
| `OUTPUT_PATH` | Nao | `/home/sensd/.openclaw/workspace/juca/data` | Diretorio de saida dos arquivos JSON |

### Argumentos CLI

```bash
# Gerar embeddings com configuracoes padrao
python3 pipeline/embed_doutrina.py

# Especificar diretorio de saida
python3 pipeline/embed_doutrina.py --output /path/to/output

# Simular sem gerar embeddings
python3 pipeline/embed_doutrina.py --dry-run

# Limitar chunks para testes
python3 pipeline/embed_doutrina.py --limit 100

# Ajustar batch size (padrao: 32)
python3 pipeline/embed_doutrina.py --batch-size 16
```

O modo `--dry-run` e especialmente util: mostra contagem de chunks por livro e amostras de texto composto sem carregar o modelo BERT ou gerar embeddings.

## Performance

O processo de embedding tem duas fases:

1. **Carregamento do modelo** -- 5-15 segundos dependendo do hardware e cache
2. **Encoding** -- velocidade depende do device:

| Device | Velocidade Aproximada |
|--------|----------------------|
| CUDA (GPU) | ~500-1000 chunks/s |
| CPU | ~30-50 chunks/s |

Para o corpus completo (~9.000+ chunks por area), encoding em CPU leva aproximadamente 3-5 minutos.

Os embeddings sao normalizados (`normalize_embeddings=True`) para que a similaridade de cosseno possa ser computada como um simples dot product, eliminando a necessidade de normalizacao no momento da busca.

## Limitacoes Conhecidas

- **Armazenamento em JSON plano** -- sem indexacao HNSW/FAISS/Qdrant. A busca e brute-force via dot product sobre toda a matriz. Funciona na escala atual mas nao escala alem de ~100 livros. Rastreado como mitigacao **M12**.
- **Truncamento em 512 tokens** -- chunks com mais de ~2.000 caracteres (apos o prefixo) perdem conteudo do final. O prefixo ocupa 100-400 caracteres, deixando 1.400-1.700 caracteres para o corpo. Analises juridicas longas podem ter conteudo importante truncado.
- **Poluicao de metadados** -- se os metadados de enriquecimento estiverem errados (ex.: `instituto` mal classificado), o embedding captura semantica incorreta. Como o prefixo e processado primeiro na sequencia de tokens, metadados errados prejudicam ativamente a qualidade da busca. E por isso que o gate de qualidade de metadados (**M06**) e critico.
- **Legal-BERTimbau treinado em PT-PT** -- o modelo foi treinado em portugues de Portugal, nao portugues brasileiro. Embora as linguas sejam mutuamente inteligiveis, pode haver divergencias sutis de vocabulario na terminologia juridica brasileira.
- **Sem atualizacao incremental** -- adicionar um novo livro exige regenerar o arquivo de embeddings inteiro. Nao ha mecanismo de atualizacao incremental ou append-only.
- **Indice BM25 reutiliza texto composto** -- o indice BM25 usa o mesmo texto prefixado por metadados dos embeddings. Isso significa que a busca BM25 por keywords faz match contra termos de metadados (nomes de instituto, categorias) alem do corpo do texto, o que pode inflar a relevancia de resultados que correspondem a metadados mas nao ao conteudo.

---
title: Integracoes Externas
description: Configuracao e setup para LlamaParse, MiniMax M2.5, HuggingFace e o ecossistema sens.legal.
lang: pt-BR
sidebar:
  order: 3
---

# Integracoes Externas

Como o Douto se conecta a servicos externos e ao ecossistema sens.legal.

## LlamaParse (Extracao de PDF)

**Servico:** [LlamaParse](https://cloud.llamaindex.ai/) da LlamaIndex
**Finalidade:** Converter livros juridicos em PDF para markdown estruturado
**Usado por:** `process_books.py`
**Autenticacao:** Variavel de ambiente `LLAMA_CLOUD_API_KEY` (carregada implicitamente pelo SDK)

### Setup

1. Crie uma conta gratuita em [cloud.llamaindex.ai](https://cloud.llamaindex.ai/).
2. Gere uma chave de API no dashboard.
3. Defina a variavel de ambiente:

```bash
export LLAMA_CLOUD_API_KEY="llx-your-key-here"
```

### Tiers

O LlamaParse oferece tres tiers de processamento. O padrao no Douto e `cost_effective`:

| Tier | Indicado para | Velocidade | Custo |
|------|-------------|-----------|-------|
| `agentic` | PDFs escaneados, tabelas complexas, layouts multi-coluna | Mais lento | Mais alto |
| `cost_effective` | Livros juridicos de texto limpo (padrao) | Media | Medio |
| `fast` | Documentos somente texto | Mais rapida | Mais baixo |

Sobrescreva o tier por execucao:

```bash
python3 pipeline/process_books.py --tier agentic livro.pdf
```

### Notas de Uso

- A extracao de PDF e uma **operacao unica** por livro. Uma vez convertido para markdown, o PDF original nao e mais necessario pelo pipeline.
- O markdown processado e salvo em `$VAULT_PATH/Knowledge/_staging/processed/{slug}/`.
- Se a extracao falhar, o PDF e movido para `$VAULT_PATH/Knowledge/_staging/failed/`.
- O LlamaParse usa `asyncio` internamente. Este e o unico componente assincrono do pipeline.

:::tip
Como a extracao e unica, mesmo que o LlamaParse mude a precificacao ou fique indisponivel, livros previamente extraidos nao sao afetados. Somente o processamento de novos livros requer uma chave de API ativa.
:::

---

## MiniMax M2.5 (Enriquecimento de Chunks)

**Servico:** MiniMax M2.5 LLM
**Finalidade:** Classificar chunks com metadados juridicos estruturados (instituto, tipo_conteudo, ramo, etc.)
**Usado por:** `enrich_chunks.py`
**Autenticacao:** Variavel de ambiente `MINIMAX_API_KEY`

### Setup

1. Obtenha uma chave de API em [MiniMax](https://www.minimax.io/).
2. Defina a variavel de ambiente:

```bash
export MINIMAX_API_KEY="your-minimax-api-key"
```

### O Hack com o SDK da Anthropic

:::caution[Integracao fragil -- nao suportada oficialmente]
O Douto usa o **SDK Python da Anthropic** para chamar a API da MiniMax. Isso funciona porque a MiniMax expoe um endpoint compativel com a Anthropic, mas **nao e uma integracao documentada ou oficialmente suportada** por nenhuma das empresas.

```python
# From enrich_chunks.py (line 30-31)
MINIMAX_BASE_URL = "https://api.minimax.io/anthropic"
MINIMAX_MODEL = "MiniMax-M2.5"

# The client is instantiated as:
client = anthropic.Anthropic(
    api_key=os.environ["MINIMAX_API_KEY"],
    base_url=MINIMAX_BASE_URL,
)
```

Qualquer mudanca na camada de compatibilidade da API da MiniMax, ou uma breaking change no SDK da Anthropic, vai quebrar silenciosamente o enriquecimento. Nao havera aviso de depreciacao.
:::

### Configuracoes de Concorrencia

O enriquecimento roda com 5 threads concorrentes e um delay de 0,5 segundo entre requisicoes para evitar rate limiting:

| Parametro | Valor |
|-----------|-------|
| `WORKERS` | 5 threads |
| `DELAY_BETWEEN_REQUESTS` | 0,5 segundos |
| Modelo | `MiniMax-M2.5` |

### Arquivo de Prompt Ausente

:::danger
O arquivo de prompt de enriquecimento (`enrich_prompt.md`) e referenciado no codigo na linha 27, mas **nao esta presente no repositorio**. Sem esse arquivo, `enrich_chunks.py` vai encerrar com erro. A recuperacao ou reconstrucao desse prompt esta rastreada como acao de mitigacao M01 (prioridade P0).
:::

### Decisao Pendente: D06

A escolha do MiniMax M2.5 como modelo de enriquecimento esta em revisao. Opcoes sendo avaliadas:

| Opcao | Pros | Contras |
|-------|------|---------|
| **Manter MiniMax M2.5** | Funciona, barato | Hack fragil com SDK, modelo generico |
| Migrar para Claude | Consistencia no ecossistema | Custo mais alto |
| Modelo local | Zero custo, sem dependencia | Mais lento, complexidade de setup |
| Avaliar depois | Sem esforco agora | Risco se acumula |

---

## HuggingFace (Modelo de Embedding)

**Servico:** HuggingFace Hub (modelo publico)
**Finalidade:** Baixar e cachear o modelo de embedding Legal-BERTimbau
**Usado por:** `embed_doutrina.py`, `search_doutrina_v2.py`
**Autenticacao:** Nenhuma necessaria (modelo publico)

### Detalhes do Modelo

| Propriedade | Valor |
|-------------|-------|
| Model ID | `rufimelo/Legal-BERTimbau-sts-base` |
| Dimensoes | 768 |
| Max tokens | 512 |
| Idioma | Portugues (treinado em corpus juridico PT-PT) |
| Tamanho em disco | ~500 MB |
| Licenca | Open source |

### Setup

O modelo e **baixado automaticamente** na primeira execucao pela biblioteca `sentence-transformers`. Nenhum setup manual e necessario.

Para pre-baixar o modelo (util para ambientes offline ou Docker):

```bash
python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base')"
```

Para controlar onde o modelo e cacheado:

```bash
export HF_HOME="/path/to/cache"
# or specifically:
export SENTENCE_TRANSFORMERS_HOME="/path/to/cache"
```

:::note
O modelo foi treinado em texto juridico de Portugal (PT-PT), nao especificamente em portugues brasileiro. Isso pode causar diferencas sutis na similaridade semantica para termos juridicos especificos do Brasil (veja PREMORTEM PF04). Nenhuma comparacao de benchmark com alternativas existe ainda (planejada em F40).
:::

---

## Integracao com o Ecossistema sens.legal

### Estado Atual

A integracao real do Douto com o ecossistema acontece hoje por **artefatos entregues ao Valter**:

```
embed_doutrina.py
      |
      v
artefatos doutrinarios  ─── entregues em ──→  Valter
```

- O consumidor primario e o Valter.
- Nao existe ainda uma entrega programatica madura.
- O reprocessamento de artefatos ainda faz parte do fluxo.

### Componentes do Ecossistema

| Componente | Papel | Stack | Relacao com o Douto |
|-----------|-------|-------|-------------------|
| **Valter** | Backend do ecossistema | FastAPI, PostgreSQL, Qdrant, Neo4j, Redis | Consumidor primario do Douto |
| **Juca** | Interface indireta para o advogado | Next.js | Consome a camada final via Valter |
| **Leci** | Camada de legislacao | Next.js, PostgreSQL, pgvector | Fonte complementar, nao concorrente |
| **Joseph** | Coordenacao/orquestracao | -- | Contexto de execucao, nao centro do produto |

### Integracao Planejada

O proximo passo nao e “virar servico”.
O proximo passo e **entregar bem ao Valter**.

Sequencia correta:

1. contrato de artefato;
2. IDs e cobertura estaveis;
3. retrieval explicavel;
4. sintese com gate proprio.

MCP, API dedicada ou modulo interno continuam opcoes futuras, mas nao devem furar essa ordem.

:::tip
O criterio de decisao nao e “qual protocolo parece mais moderno”.
O criterio e: qual forma entrega doutrina confiavel ao Valter com menos risco e menos teatro arquitetural.
:::

### Diagrama de Integracao

```mermaid
graph TB
    subgraph "Atual"
        ED["embed_doutrina.py"] -->|artefatos| VA1["Valter"]
    end

    subgraph "Proxima linha"
        DT["contrato + manifesto + retrieval explicavel"] --> VA2["Valter"]
        VA2 --> JU["Juca"]
    end

    subgraph "Futuro opcional"
        MCP["MCP/API do Douto"] --> VAL["Valter ou outros consumidores"]
    end
```

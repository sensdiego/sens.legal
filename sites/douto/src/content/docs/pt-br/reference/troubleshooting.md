---
title: Solucao de Problemas
description: Problemas comuns e solucoes ao rodar o pipeline do Douto.
lang: pt-BR
sidebar:
  order: 3
---

# Solucao de Problemas

Problemas comuns, suas causas e como resolve-los. Organizados por etapa do pipeline.

---

## O Pipeline Nao Inicia

### FileNotFoundError: path hardcoded nao existe

**Sintomas:**

```
FileNotFoundError: [Errno 2] No such file or directory: '/home/sensd/.openclaw/workspace/vault/Knowledge/_staging/processed'
```

ou

```
FileNotFoundError: [Errno 2] No such file or directory: '/mnt/c/Users/sensd/vault/Knowledge/_staging/processed'
```

**Causa:** Dois scripts do pipeline (`process_books.py` e `rechunk_v3.py`) possuem caminhos absolutos da maquina do criador hardcoded no codigo-fonte.

| Script | Path hardcoded | Ambiente |
|--------|---------------|----------|
| `process_books.py` linha 27 | `/home/sensd/.openclaw/workspace/vault` | Linux nativo |
| `rechunk_v3.py` linha 29 | `/mnt/c/Users/sensd/vault` | WSL (mount Windows) |

**Correcao (imediata):** Edite a linha `VAULT_PATH` no script afetado para apontar para sua vault:

```python
# Em process_books.py, altere a linha 27:
VAULT_PATH = Path("/seu/caminho/real/da/vault")

# Em rechunk_v3.py, altere a linha 29:
VAULT_PATH = Path("/seu/caminho/real/da/vault")
```

**Correcao (para enrich_chunks.py e embed_doutrina.py):** Estes scripts leem a variavel de ambiente:

```bash
export VAULT_PATH="/seu/caminho/real/da/vault"
```

**Correcao permanente:** F22 (v0.2) vai padronizar todos os scripts para usar `os.environ.get()`.

---

### ModuleNotFoundError: No module named 'sentence_transformers'

**Causa:** As dependencias Python nao estao instaladas, ou voce esta rodando fora do ambiente virtual.

**Correcao:**

```bash
# Ative o ambiente virtual primeiro
source .venv/bin/activate

# Instale as dependencias
pip install -r pipeline/requirements.txt
```

Se houver erros de permissao, use:

```bash
pip install --user -r pipeline/requirements.txt
```

:::note
O `requirements.txt` nao pina versoes. Se uma dependencia falhar na instalacao, pode ser devido a conflitos de versao com outros pacotes. Tente instalar individualmente: `pip install sentence-transformers torch numpy anthropic llama-parse`.
:::

---

### Erro de versao do Python: sintaxe nao suportada

**Sintomas:**

```
TypeError: 'type' object is not subscriptable
```

em linhas como `tuple[dict, str]`.

**Causa:** A versao do Python e inferior a 3.10. O codebase usa sintaxe moderna de type hints que requer Python 3.10+.

**Correcao:** Atualize o Python para 3.10 ou posterior. Verifique com:

```bash
python3 --version
# Deve ser 3.10.x ou superior
```

---

## Problemas na Extracao de PDF (process_books.py)

### API key do LlamaParse nao encontrada

**Sintomas:**

```
Error: LLAMA_CLOUD_API_KEY not set
```

ou um erro generico de autenticacao do SDK LlamaIndex.

**Causa:** A variavel de ambiente `LLAMA_CLOUD_API_KEY` nao esta configurada. Esta chave e carregada implicitamente pelo SDK LlamaIndex, nao explicitamente no codigo.

**Correcao:**

```bash
export LLAMA_CLOUD_API_KEY="llx-sua-chave-aqui"
```

Obtenha uma chave em [cloud.llamaindex.ai](https://cloud.llamaindex.ai/).

---

### Extracao de PDF produz texto ilegivel

**Causa:** O PDF pode ser escaneado (baseado em imagem) ou ter um layout complexo multi-coluna que o tier `cost_effective` nao consegue processar bem.

**Correcao:** Tente o tier `agentic`, que usa extracao mais sofisticada:

```bash
python3 pipeline/process_books.py --tier agentic livro-problematico.pdf
```

:::tip
Se o livro foi digitalizado de uma copia fisica (OCR), espere artefatos de texto independentemente do tier. Caracteres como `fi` podem ser corrompidos para caracteres separados, `art.` pode virar `art,`, etc. Esses artefatos se propagam por todo o pipeline e contaminam os embeddings.
:::

---

## Problemas de Chunking (rechunk_v3.py)

### Chunks estao muito pequenos ou muito grandes

**Causa:** Os valores hardcoded de `MIN_CHUNK_CHARS` (1500) ou `MAX_CHUNK_CHARS` (15000) podem nao ser adequados para o seu livro especifico.

**Correcao:** Sobrescreva o minimo via CLI:

```bash
python3 pipeline/rechunk_v3.py --min-chars 1000 slug-do-seu-livro
```

`MAX_CHUNK_CHARS` nao e configuravel via CLI. Edite a linha 33 do `rechunk_v3.py` para altera-lo.

---

### Running headers aparecendo como conteudo

**Sintomas:** Chunks que consistem majoritariamente do titulo do livro ou nome do autor repetidos.

**Causa:** A heuristica de deteccao de running headers pode ter falhado para esse livro especifico. Headers que aparecem em toda pagina de um PDF sao normalmente detectados por frequencia e filtrados, mas formatacao incomum pode burlar a deteccao.

**Correcao:** Verifique o markdown processado do livro (em `$VAULT_PATH/Knowledge/_staging/processed/{slug}/`). Se running headers estiverem presentes no markdown de origem, precisam ser limpos antes do rechunking. Use `--force` para refazer o chunking:

```bash
# Apos limpar o markdown de origem:
python3 pipeline/rechunk_v3.py --force slug-do-seu-livro
```

---

## Problemas de Enriquecimento (enrich_chunks.py)

### enrich_prompt.md nao encontrado

**Sintomas:**

```
ERRO: Prompt nao encontrado em /path/to/pipeline/enrich_prompt.md
```

O script encerra imediatamente.

**Causa:** O arquivo do prompt de enriquecimento **nao existe no repositorio**. Foi perdido durante a migracao da vault Obsidian original. Este e um problema critico conhecido (PREMORTEM RT01).

**Impacto:** Nao e possivel enriquecer novos chunks ate que o prompt seja recuperado.

**Solucoes alternativas:**

1. **Reconstruir a partir de chunks existentes** — examine chunks enriquecidos em `$VAULT_PATH/Knowledge/_staging/processed/` para fazer engenharia reversa do formato do prompt e da estrutura de output esperada.
2. **Verificar historico da vault** — se voce tem acesso a vault Obsidian original, procure `enrich_prompt.md` no diretorio do pipeline ou de templates.
3. **Escrever um novo prompt** — baseado nos campos de metadados (categoria, instituto, tipo_conteudo, fase, ramo, fontes_normativas) e na logica de parsing JSON do codigo de enriquecimento.

**Rastreamento:** Acao de mitigacao M01 (prioridade P0).

---

### Falha na autenticacao da API MiniMax

**Sintomas:**

```
anthropic.AuthenticationError: Authentication failed
```

ou

```
Error code: 401
```

**Causa:** A variavel de ambiente `MINIMAX_API_KEY` nao esta configurada, expirou ou e invalida.

**Correcao:**

```bash
export MINIMAX_API_KEY="sua-chave-minimax-valida"
```

Verifique se a chave funciona:

```bash
python3 -c "
import os
from anthropic import Anthropic
client = Anthropic(api_key=os.environ['MINIMAX_API_KEY'], base_url='https://api.minimax.io/anthropic')
print('Auth OK')
"
```

---

### API MiniMax retorna formato inesperado

**Sintomas:** O enriquecimento completa mas os chunks recebem `status_enriquecimento: "pendente"` ou campos de metadados ficam vazios.

**Causa:** A compatibilidade do SDK Anthropic com o endpoint do MiniMax pode ter mudado. Essa integracao usa uma camada de compatibilidade nao documentada (`base_url="https://api.minimax.io/anthropic"`) que nao e oficialmente suportada pela Anthropic nem pelo MiniMax (PREMORTEM RT02).

**Passos de debug:**

1. Verifique o log de enriquecimento em `$VAULT_PATH/Logs/enrichment_log.jsonl` para detalhes do erro.
2. Tente um unico chunk manualmente para ver a resposta bruta da API.
3. Verifique se a versao do pacote `anthropic` mudou: `pip show anthropic`.
4. Verifique se o endpoint da API MiniMax ainda esta acessivel: `curl -I https://api.minimax.io/anthropic`.

**Solucao alternativa:** Se a compatibilidade do SDK quebrou, pode ser necessario:
- Pinar o pacote `anthropic` na ultima versao funcional
- Mudar para chamadas diretas a API MiniMax com `requests` em vez do SDK Anthropic
- Considerar migracao para a API do Claude (decisao D06)

---

### Enriquecimento esta lento

**Causa:** O enriquecimento processa chunks sequencialmente com 5 threads e um delay de 0.5 segundo entre requisicoes. Para livros grandes (centenas de chunks), isso leva tempo.

**Throughput esperado:** ~10 chunks por segundo (5 threads x 2 requisicoes/segundo por thread, menos latencia).

**Para 1.000 chunks:** ~2 minutos. Para o corpus completo de 31.500 chunks: ~1 hora.

Nao ha como aumentar o numero de threads ou reduzir o delay sem editar o codigo-fonte (linhas 34-35 do `enrich_chunks.py`).

:::caution
Aumentar `WORKERS` acima de 5 ou reduzir `DELAY_BETWEEN_REQUESTS` abaixo de 0.5s pode disparar rate limiting na API MiniMax.
:::

---

## Problemas de Busca (search_doutrina_v2.py)

### Busca nao retorna resultados

**Possiveis causas:**

1. **DATA_PATH nao configurado ou apontando para diretorio errado:**
   ```bash
   echo $DATA_PATH
   ls $DATA_PATH  # Deve conter embeddings_*.json, search_corpus_*.json, bm25_index_*.json
   ```

2. **Area nao possui arquivos correspondentes:**
   ```bash
   # Verifique os arquivos disponiveis
   ls $DATA_PATH/embeddings_*.json
   ls $DATA_PATH/search_corpus_*.json
   ```
   A busca espera arquivos nomeados `embeddings_{area}.json`, `search_corpus_{area}.json` e `bm25_index_{area}.json`. Areas suportadas atualmente: `contratos` (mapeado para arquivos `doutrina`) e `processo_civil`.

3. **Arquivos JSON corrompidos ou vazios:**
   ```bash
   python3 -c "import json; json.load(open('$DATA_PATH/embeddings_doutrina.json')); print('JSON OK')"
   ```

4. **Termos da consulta nao correspondem ao vocabulario do corpus:**
   Tente termos mais amplos, ou mude para modo somente semantico (`/sem` no modo interativo) que e melhor para consultas conceituais.

---

### Busca esta muito lenta (consultas de varios segundos)

**Causa:** Esta e uma limitacao arquitetural conhecida. Em cada busca:

1. Arquivos JSON completos (~2 GB no total) sao carregados em memoria (cacheados apos primeira carga)
2. BM25 recalcula frequencias de documentos para cada consulta (complexidade O(N * T))
3. Produto escalar NumPy roda sobre todos os 31.500 vetores de embedding

**Latencia esperada:**
- Primeira consulta: 5-15 segundos (carga de dados + busca)
- Consultas seguintes: 1-3 segundos (dados em cache, mas BM25 ainda recalcula)

**Solucoes alternativas:**
- Use `--area contratos` ou `--area processo_civil` para buscar em uma unica area (dataset menor)
- Use modo `/sem` (somente semantico) para pular o calculo BM25
- Mantenha a sessao interativa aberta para aproveitar o cache

**Correcao permanente:** Migracao para banco vetorial Qdrant (mitigacao M12, planejada para v0.4) e indice BM25 pre-computado (M13).

---

### Resultados parecem irrelevantes

**Possiveis causas:**

1. **Qualidade dos metadados de enriquecimento e desconhecida** — os metadados usados para busca filtrada nunca foram validados (PREMORTEM PF01). Se as classificacoes de `instituto` ou `ramo` estiverem erradas, resultados filtrados estarao errados.

2. **Descompasso semantico vs. palavras-chave** — tente diferentes modos de busca:
   - `/sem` (somente semantico) — melhor para consultas conceituais como "o que e boa-fe nos contratos"
   - `/bm25` (somente palavras-chave) — melhor para termos exatos como "art. 476 CC"
   - `/hybrid` (padrao) — equilibra ambos

3. **Poluicao dos embeddings** — o embedding e gerado a partir de texto composto que inclui metadados. Se os metadados estiverem errados, o embedding captura contexto errado.

4. **Verifique o output detalhado:**
   ```
   /verbose
   ```
   Isso mostra o texto completo do chunk nos resultados, permitindo julgar se o conteudo corresponde a sua intencao.

---

## Problemas na Geracao de Embeddings (embed_doutrina.py)

### Estouro de memoria durante geracao de embeddings

**Sintomas:**

```
RuntimeError: CUDA out of memory
```

ou o processo e encerrado pelo SO.

**Causa:** PyTorch + Legal-BERTimbau + um lote grande de chunks pode exceder a memoria disponivel da GPU ou do sistema.

**Correcao:**

1. **Reduza o batch size** — edite `BATCH_SIZE` em `embed_doutrina.py` linha 25 (padrao: 32). Tente 8 ou 16.

2. **Use CPU ao inves de GPU:**
   ```bash
   export CUDA_VISIBLE_DEVICES=""  # Forca modo CPU
   python3 pipeline/embed_doutrina.py
   ```

3. **Processe menos chunks:**
   ```bash
   python3 pipeline/embed_doutrina.py --limit 100  # Se suportado
   ```

:::note
O modo CPU e mais lento mas usa menos memoria e funciona em qualquer maquina. Para o corpus completo de 31.500 chunks, espere ~10-30 minutos em CPU vs. ~2-5 minutos em GPU.
:::

---

### Falha no download do modelo

**Sintomas:**

```
OSError: Can't load tokenizer for 'rufimelo/Legal-BERTimbau-sts-base'
```

ou

```
ConnectionError: HTTPSConnectionPool(host='huggingface.co', port=443)
```

**Causa:** Problemas de rede ou HuggingFace Hub temporariamente indisponivel.

**Correcao:**

1. **Tente novamente** — quedas do HuggingFace Hub sao geralmente breves.

2. **Pre-baixe o modelo** em uma maquina com internet:
   ```bash
   python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base')"
   ```

3. **Copie o cache** para a maquina alvo:
   ```bash
   # Localizacao padrao do cache
   cp -r ~/.cache/huggingface/hub/models--rufimelo--Legal-BERTimbau-sts-base /caminho/destino/
   export HF_HOME="/caminho/destino/.cache/huggingface"
   ```

---

### Erros de compatibilidade PyTorch / CUDA

**Sintomas:**

```
RuntimeError: CUDA error: no kernel image is available for execution on the device
```

ou diversos erros de incompatibilidade de versao CUDA.

**Causa:** A versao instalada do PyTorch nao corresponde ao driver da GPU ou versao CUDA.

**Correcao:** O modo CPU funciona para tudo que o Douto faz. A geracao de embeddings e mais lenta mas totalmente funcional:

```bash
export CUDA_VISIBLE_DEVICES=""
```

Se precisar de aceleracao por GPU, instale a versao correta do PyTorch para seu CUDA:

```bash
# Verifique sua versao CUDA
nvidia-smi

# Instale o PyTorch correspondente (exemplo para CUDA 12.1)
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

---

## Problemas na Knowledge Base

### Erros de parsing do frontmatter

**Sintomas:** Campos de metadados ausentes, truncados ou com valores errados apos processamento.

**Causa:** O Douto usa um parser YAML customizado baseado em regex (nao PyYAML). Este parser nao consegue lidar com varios edge cases:

| Input | Esperado | Real |
|-------|----------|------|
| `titulo: "Codigo Civil: Comentado"` | `Codigo Civil: Comentado` | `Codigo Civil` (truncado no dois-pontos) |
| `autor: O'Brien` | `O'Brien` | Pode falhar no parsing |
| `tags: [a, b, c]` | `["a", "b", "c"]` | Parseado por regex, pode falhar em listas aninhadas |
| Valores multiline | Texto completo | Apenas primeira linha |

**Solucao alternativa:** Evite caracteres especiais nos valores do frontmatter. Especificamente:
- Nao use dois-pontos (`:`) dentro de valores — mova-os para um campo de descricao
- Nao use o simbolo hash (`#`) — pode ser interpretado como comentario
- Mantenha valores em uma unica linha
- Coloque valores entre aspas duplas se contiverem caracteres especiais

**Correcao permanente:** Migrar para PyYAML (planejado como parte de F23/M05 no `utils.py`).

---

### Wikilinks nao resolvendo no Obsidian

**Causa:** O arquivo alvo pode nao existir ou ter um nome diferente do esperado.

**Correcao:** Verifique se o arquivo alvo existe:
- Links de MOC devem apontar para `knowledge/mocs/MOC_{DOMINIO}.md`
- Todos os links internos devem usar formato wikilink: `[[alvo]]`, nao links markdown `[texto](caminho)`
- Abra a vault no Obsidian para ver links quebrados destacados

---

## Obtendo Ajuda

1. **Consulte esta pagina primeiro** — a maioria dos problemas comuns esta documentada acima.
2. **Consulte PREMORTEM.md** — seu problema pode ser um risco conhecido com plano de mitigacao documentado.
3. **Abra uma issue no GitHub** em [github.com/sensdiego/douto/issues](https://github.com/sensdiego/douto/issues) com:
   - O script e comando que voce executou
   - A mensagem de erro completa
   - Seu ambiente (SO, versao do Python, output de `pip list`)
   - Os valores das variaveis de ambiente relevantes (oculte as API keys)
4. **Para questoes sobre o ecossistema** (integracao Valter/Juca), consulte os respectivos repositorios.

---
title: "Funcionalidade: Maps of Content (MOCs)"
description: "Como os arquivos MOC catalogam livros juridicos por dominio com metadados estruturados, status de processamento e estatisticas do corpus em 8 dominios juridicos."
lang: pt-BR
sidebar:
  order: 2
---

# Maps of Content -- MOCs (F09, F10, F11, F19)

`knowledge/mocs/MOC_*.md` -- A segunda camada do skill graph. Cada MOC cataloga todos os livros de um dominio juridico, organizando-os por subtema com wikilinks para entradas de livros, estatisticas de processamento e conexoes cross-domain.

## O que sao MOCs

Um Map of Content (MOC) e um arquivo-indice curado que serve como ponto de entrada para um dominio juridico especifico. Diferente de uma lista simples, os MOCs organizam os livros tematicamente (ex.: "Doutrina Brasileira", "Drafting e Redacao Contratual", "Doutrina Internacional") para que pesquisadores possam navegar por subtema em vez de buscar alfabeticamente.

Cada MOC responde a tres perguntas:
1. **Quais livros temos** neste dominio?
2. **Como estao organizados** tematicamente?
3. **Com quais outros dominios** este se conecta?

## Formato dos MOCs

Todos os MOCs seguem uma estrutura padrao definida no `CLAUDE.md`:

### Frontmatter

```yaml
---
type: moc
domain: civil
description: Direito Civil — teoria geral dos contratos, obrigacoes,
             responsabilidade civil, interpretacao contratual
key_authors: [Orlando Gomes, Fabio Ulhoa Coelho, Pontes de Miranda,
              Melvin Eisenberg]
total_obras: 35
total_chunks: ~9365
---
```

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `type` | `str` | Sempre `"moc"` |
| `domain` | `str` | Identificador do dominio (corresponde ao INDEX_DOUTO.md) |
| `description` | `str` | Breve descricao da cobertura do dominio |
| `key_authors` | `list[str]` | Principais autores do dominio |
| `total_obras` | `int` | Numero de livros catalogados |
| `total_chunks` | `str` | Contagem aproximada de chunks (prefixado com `~`) |
| `key_legislation` | `list[str]` | Legislacao-chave (usado no MOC_CONSUMIDOR) |

### Estrutura do Conteudo

```markdown
# Titulo do Dominio

Breve descricao do dominio e seu foco.

## Subtema 1
- [[slug-do-livro]] — Autor, breve descricao

## Subtema 2
- [[slug-do-livro]] — Autor, breve descricao

## Conexoes
- -> [[MOC_OUTRO]] (descricao da relacao)
```

Livros sao referenciados via wikilinks (`[[slug-do-livro]]`) que resolvem para diretorios de livros na area de staging da vault.

---

## MOCs Ativos

### MOC_CIVIL.md (F09)

**Arquivo:** `knowledge/mocs/MOC_CIVIL.md`

| Propriedade | Valor |
|-------------|-------|
| Livros catalogados | 35 |
| Chunks aproximados | ~9.365 |
| Autores principais | Orlando Gomes, Fabio Ulhoa Coelho, Pontes de Miranda, Melvin Eisenberg |
| Status | Ativo -- maior por quantidade de livros |

O maior MOC por numero de livros. Organizado em 5 subsecoes tematicas:

| Subsecao | Livros | Cobertura |
|----------|--------|-----------|
| Doutrina Brasileira | 8 | Orlando Gomes, Fabio Ulhoa Coelho, factoring, opcoes, GVLaw, compilacoes |
| Doutrina Internacional -- Teoria | 14 | Chitty on Contracts, Anson's Law, McKendrick, Eisenberg, Benson, Singh, choice of law |
| Interpretacao e Hermeneutica | 3 | Interpretacao contratual, Scalia, UNIDROIT Principles |
| Drafting e Redacao Contratual | 8 | Kenneth Adams, Fontaine (internacional), copyright drafting, legal writing |
| Gestao e Negociacao Contratual | 5 | IACCM, contract management, elementos financeiros, negociacao |

**Conexoes cross-domain:**
- MOC_EMPRESARIAL (contratos empresariais, venture capital)
- MOC_PROCESSUAL (cumprimento de sentenca, execucao contratual)
- MOC_COMPLIANCE (smart contracts, legal tech)

### MOC_PROCESSUAL.md (F10)

**Arquivo:** `knowledge/mocs/MOC_PROCESSUAL.md`

| Propriedade | Valor |
|-------------|-------|
| Livros catalogados | 8 |
| Chunks aproximados | ~22.182 |
| Autores principais | Nelson Nery Jr., Wambier, Marinoni, Mitidiero, Arenhart |
| Status | Ativo -- maior por quantidade de chunks |

O maior MOC por contagem de chunks. Comentarios ao CPC sao obras massivas em multiplos volumes que geram muitos chunks por livro. Organizado em 4 subsecoes:

| Subsecao | Livros | Cobertura |
|----------|--------|-----------|
| CPC Comentado | 2 | Gaio Jr./Cleyson Mello, Nelson Nery Jr./Rosa Maria Nery |
| Teoria Geral do Processo | 2 | Wambier vol. 1, Marinoni/Mitidiero vol. 1 |
| Cognicao e Procedimento Comum | 2 | Wambier vol. 2, Marinoni et al. vol. 2 |
| Procedimentos Diferenciados e Tutelas | 1 | Marinoni et al. vol. 3 |
| Estrategia Processual | 1 | Serie GVLaw |

**Conexoes cross-domain:**
- MOC_CIVIL (direito material subjacente)
- MOC_CONSUMIDOR (inversao do onus, tutelas de urgencia em consumo)

### MOC_EMPRESARIAL.md (F11)

**Arquivo:** `knowledge/mocs/MOC_EMPRESARIAL.md`

| Propriedade | Valor |
|-------------|-------|
| Livros catalogados | 7 |
| Chunks aproximados | -- <!-- NEEDS_INPUT: total chunk count for empresarial MOC --> |
| Autores principais | Paula Forgioni, Doug Cumming |
| Status | Ativo |

Organizado em 4 subsecoes:

| Subsecao | Livros | Cobertura |
|----------|--------|-----------|
| Venture Capital e Private Equity | 2 | Doug Cumming (internacional), avaliacao economica |
| Contratos Empresariais Especializados | 4 | Contratos ageis, claims em construcao, drafting comercial, contratos internacionais |
| Legal Tech | 3 | Smart contracts/blockchain, aquisicoes de TI, contract design |
| Litigio Comercial | 1 | Fentiman (litigio comercial internacional) |

:::note
Algumas entradas de livros no MOC_EMPRESARIAL aparecem em multiplas subsecoes. O total de livros unicos listados no arquivo e 7, mas 10 wikilinks aparecem porque a secao de Legal Tech se sobrepoe a de contratos especializados.
:::

**Conexoes cross-domain:**
- MOC_CIVIL (teoria geral dos contratos)
- MOC_COMPLIANCE (governanca, LGPD em contratos tech)

---

## MOC Placeholder

### MOC_CONSUMIDOR.md (F19)

**Arquivo:** `knowledge/mocs/MOC_CONSUMIDOR.md`

| Propriedade | Valor |
|-------------|-------|
| Livros catalogados | 0 |
| Chunks aproximados | 0 |
| Legislacao-chave | CDC (Lei 8.078/90) |
| Status | Em Andamento (~10%) -- placeholder apenas com estrutura |

O arquivo existe com o frontmatter e a estrutura de secoes corretos, mas nenhum livro foi catalogado:

```markdown
## Fundamentos
(a preencher -- relacao de consumo, principios do CDC)

## Responsabilidade Civil
(a preencher -- fato/vicio do produto/servico)

## Praticas Abusivas
(a preencher -- clausulas abusivas, publicidade enganosa)
```

**Conexoes cross-domain (definidas):**
- MOC_CIVIL (responsabilidade civil geral)
- MOC_PROCESSUAL (inversao do onus, tutela de urgencia)

**Para completar:** Identificar e catalogar livros de direito do consumidor existentes na vault, ou processar novos PDFs pelo pipeline.

---

## MOCs Planejados

> **Funcionalidade Planejada** -- Estes MOCs estao no roadmap (F25, P1, milestone v0.3) mas ainda nao foram criados.

| MOC | Dominio | Descricao | Livros Conhecidos |
|-----|---------|-----------|-------------------|
| `MOC_TRIBUTARIO` | Direito Tributario | Obrigacao tributaria, credito tributario, processo administrativo fiscal | <!-- NEEDS_INPUT: any tax law books in the vault? --> |
| `MOC_CONSTITUCIONAL` | Direito Constitucional | Direitos fundamentais, controle de constitucionalidade, hermeneutica constitucional | <!-- NEEDS_INPUT: any constitutional law books in the vault? --> |
| `MOC_COMPLIANCE` | Compliance & Governanca | LGPD, governanca corporativa, due diligence, anticorrupcao | <!-- NEEDS_INPUT: any compliance books in the vault? --> |
| `MOC_SUCESSOES` | Sucessoes & Planejamento Patrimonial | Inventario, testamento, holdings familiares, planejamento sucessorio | <!-- NEEDS_INPUT: any succession law books in the vault? --> |

:::tip
Mesmo sem livros para catalogar, criar MOCs placeholder (como o `MOC_CONSUMIDOR.md`) e valioso porque completa a estrutura de navegacao no `INDEX_DOUTO.md` e torna o dominio visivel para agentes e scripts que percorrem a knowledge base.
:::

---

## Como Adicionar um Novo MOC

### Passo 1: Criar o arquivo MOC

Crie `knowledge/mocs/MOC_{DOMINIO}.md` com o frontmatter padrao:

```yaml
---
type: moc
domain: {domain_id}
description: {breve descricao do dominio}
key_authors: []
total_obras: 0
total_chunks: 0
---
```

### Passo 2: Adicionar a estrutura de secoes

Defina subsecoes tematicas relevantes para o dominio. Use outros MOCs como modelo.

### Passo 3: Catalogar livros existentes

Se ja existem livros deste dominio na vault (processados e enriquecidos), adicione wikilinks:

```markdown
## Subtema
- [[slug-do-livro]] — Autor, breve descricao
```

### Passo 4: Vincular ao INDEX_DOUTO.md

Verifique que o `INDEX_DOUTO.md` ja possui um wikilink `[[MOC_{DOMINIO}]]` apontando para o novo arquivo. Todos os 8 dominios ja estao listados no indice.

### Passo 5: Processar novos livros (se necessario)

Para novos PDFs:

```bash
# Place PDF in staging
cp new-book.pdf $VAULT_PATH/Knowledge/_staging/input/

# Run the full pipeline
python3 pipeline/process_books.py
python3 pipeline/rechunk_v3.py
python3 pipeline/enrich_chunks.py all
python3 pipeline/embed_doutrina.py
```

Em seguida, adicione a entrada do livro ao arquivo MOC e atualize `total_obras` e `total_chunks` no frontmatter.

---

## Resumo de Estatisticas do Corpus

| MOC | Livros | Chunks | % do Total de Chunks |
|-----|--------|--------|----------------------|
| MOC_CIVIL | 35 | ~9.365 | ~30% |
| MOC_PROCESSUAL | 8 | ~22.182 | ~70% |
| MOC_EMPRESARIAL | 7 | -- | -- |
| MOC_CONSUMIDOR | 0 | 0 | 0% |
| **Total (ativos)** | **50** | **~31.547** | **100%** |

:::note
A disparidade na contagem de chunks entre Civil (35 livros, ~9 mil chunks) e Processual (8 livros, ~22 mil chunks) reflete a natureza do material fonte: comentarios ao CPC sao obras massivas em multiplos volumes onde cada artigo gera multiplos chunks, enquanto livros de direito contratual sao tipicamente mais curtos e focados.
:::

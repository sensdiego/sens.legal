---
title: FAQ
description: Perguntas frequentes sobre o Douto — para desenvolvedores, advogados e stakeholders.
lang: pt-BR
sidebar:
  order: 2
---

# Perguntas Frequentes

Respostas para perguntas comuns sobre o Douto, organizadas por publico.

---

## Para Desenvolvedores

### Como adiciono um novo livro ao corpus?

Execute o pipeline completo de forma sequencial. Coloque o PDF no diretorio de entrada de staging e execute cada etapa:

```bash
# 1. Coloque o PDF no diretorio de entrada
cp livro.pdf $VAULT_PATH/Knowledge/_staging/input/

# 2. Extraia o PDF para markdown
python3 pipeline/process_books.py livro.pdf

# 3. Faça o chunking do markdown
python3 pipeline/rechunk_v3.py slug-do-livro

# 4. Enriqueça os chunks com metadados
python3 pipeline/enrich_chunks.py slug-do-livro

# 5. Gere os embeddings
python3 pipeline/embed_doutrina.py

# 6. Verifique com uma busca
python3 pipeline/search_doutrina_v2.py "consulta sobre o livro" --area contratos
```

:::caution
A etapa 4 requer `enrich_prompt.md`, que atualmente **nao existe no repositorio**. Nao e possivel enriquecer novos chunks ate que seja recuperado (mitigacao M01). As etapas 1-3 e 5-6 funcionam sem ele se os chunks forem enriquecidos manualmente.
:::

### Por que o pipeline nao roda na minha maquina?

A causa mais comum sao **paths hardcoded**. Dois dos cinco scripts (`process_books.py` e `rechunk_v3.py`) tem caminhos absolutos da maquina do criador embutidos no codigo-fonte:

- `process_books.py` linha 27: `/home/sensd/.openclaw/workspace/vault`
- `rechunk_v3.py` linha 29: `/mnt/c/Users/sensd/vault`

**Solucao temporaria:** Edite a linha `VAULT_PATH` em cada script para apontar para seu path local da vault.

**Correcao permanente:** F22 (v0.2) vai padronizar todos os scripts para usar `os.environ.get("VAULT_PATH")`.

Veja [Variaveis de Ambiente](/docs/configuration/environment/) para a referencia completa de variaveis.

### Por que nao tem banco de dados?

O Douto armazena embeddings e indices de busca como arquivos JSON puros. Essa foi a abordagem mais simples para um prototipo de maquina unica. Os trade-offs:

| JSON puro (atual) | Banco vetorial (planejado) |
|--------------------|---------------------------|
| Sem infraestrutura necessaria | Requer setup de Qdrant/FAISS |
| Simples de debugar (legivel por humanos) | Armazenamento binario/opaco |
| Carga completa em memoria por consulta | Indexado, consultas sub-segundo |
| ~2 GB para 31.500 chunks | Armazenamento compacto e escalavel |
| Nao escala alem de ~100 livros | Escala para milhoes de vetores |

A migracao para um banco vetorial (provavelmente Qdrant, ja que o Valter o utiliza) esta planejada para o v0.4 (mitigacao M12).

### Por que MiniMax M2.5 ao inves de Claude para enriquecimento?

Custo. Enriquecer 31.500 chunks com um prompt de classificacao exige throughput significativo de tokens. O MiniMax M2.5 e substancialmente mais barato que o Claude para essa carga de trabalho em lote. O trade-off e qualidade — MiniMax e um modelo generico, nao ajustado para direito brasileiro.

Esta e uma decisao em aberto (D06). Opcoes em avaliacao:

| Opcao | Custo | Qualidade | Dependencia |
|-------|-------|-----------|-------------|
| MiniMax M2.5 (atual) | Baixo | Desconhecida (nao validada) | Hack fragil no SDK |
| Claude | Mais alto | Provavelmente melhor | Consistente com ecossistema |
| Modelo local | Zero | Desconhecida | Complexidade de setup |

### Posso usar outro modelo de embedding?

Tecnicamente sim, mas requer **re-embedding do corpus inteiro** (~31.500 chunks). O modelo esta hardcoded em `embed_doutrina.py` (linha 24) e `search_doutrina_v2.py` (linha 24) como `rufimelo/Legal-BERTimbau-sts-base`.

Consideracoes importantes:
- Todos os embeddings existentes se tornam incompativeis (espaco vetorial diferente)
- A qualidade da busca pode melhorar ou piorar — nao existe benchmark comparativo ainda (planejado em F40)
- O modelo atual foi treinado em texto juridico portugues (PT-PT), o que pode nao ser ideal para terminologia juridica brasileira

### Onde esta o prompt de enriquecimento?

:::danger[Arquivo critico ausente]
`enrich_prompt.md` e referenciado em `enrich_chunks.py` na linha 27 (`Path(__file__).parent / "enrich_prompt.md"`) mas **nao existe no repositorio**. Foi perdido durante a migracao da vault Obsidian original.

Isso significa:
- O enriquecimento nao pode ser executado em novos chunks
- O prompt que gerou metadados para 31.500 chunks existentes nao esta versionado
- Se os chunks precisarem de re-enriquecimento, os mesmos resultados nao podem ser reproduzidos

A recuperacao e a prioridade M01 (P0) no plano de mitigacao do roadmap. Opcoes: localizar no historico da vault, reconstruir a partir de logs da API MiniMax, ou engenharia reversa a partir dos chunks enriquecidos existentes.
:::

### Como contribuir com testes?

Esta e a contribuicao de maior impacto que voce pode fazer. O Douto tem 0% de cobertura de testes.

1. Crie a estrutura de diretorio `tests/` (veja [Testes](/docs/development/testing/))
2. Adicione `pytest` as dependencias de desenvolvimento
3. Comece pelas funcoes do `rechunk_v3.py`: `detect_section()`, `classify_title()`, `smart_split()`
4. Use trechos reais de markdown de livros juridicos como fixtures
5. Faca mock de todas as chamadas a APIs externas (MiniMax, LlamaParse, HuggingFace)

Veja a pagina de [Testes](/docs/development/testing/) para a estrategia completa planejada e exemplos de testes.

---

## Para Usuarios (Advogados)

:::note
O Douto ainda nao possui interface para o usuario final. Estas perguntas antecipam a experiencia futura integrada via Juca/Valter.
:::

### Quais areas do direito o Douto cobre?

Atualmente, tres areas possuem conteudo populado:

| Area | Livros | Chunks | Cobertura |
|------|--------|--------|-----------|
| Direito Civil | 35 | ~9.365 | Contratos, obrigacoes, responsabilidade civil, direitos reais |
| Direito Processual Civil | 8 | ~22.182 | Comentarios ao CPC, teoria geral, procedimentos |
| Direito Empresarial | 7 | -- | Venture capital, smart contracts, litigios comerciais |

**Lacunas:** Direito do Consumidor tem um MOC placeholder. Tributario, Constitucional, Compliance e Sucessoes nao possuem conteudo algum. Se voce buscar um topico em um dominio nao coberto, recebera resultados vazios.

### Quao precisos sao os resultados da busca?

**Resposta honesta: nao sabemos.** Nao existe eval set, benchmark de precisao ou validacao humana da qualidade da busca.

O que sabemos:
- A busca hibrida combina similaridade semantica (significado) com correspondencia de palavras-chave (termos exatos)
- Resultados sao ranqueados por um score combinado (70% semantico, 30% palavras-chave por padrao)
- Filtros de metadados (por instituto, ramo, tipo) dependem da qualidade do enriquecimento, que nao foi validada

A medicao de qualidade esta planejada para o v0.2.5 (validacao de 200 chunks) e v0.5 (eval set formal com 30+ consultas).

### Posso confiar nas citacoes?

**Com cautela.** As citacoes incluem titulo do livro, autor e capitulo, mas **nao numeros de pagina**. Existem riscos conhecidos:

- **Erros de chunking** — o limite do chunk pode nao coincidir com o limite do capitulo no livro original, levando a atribuicao errada (ex.: citar Capitulo 5 quando o conteudo e do Capitulo 4)
- **Aninhamento de citacoes** — autores juridicos frequentemente citam outros autores extensamente. Um chunk pode ser atribuido ao autor do livro quando o conteudo e na verdade uma citacao de outro jurista
- **Sem rastreamento de edicao** — se uma edicao mais recente de um livro for processada, chunks antigos permanecem no indice. Voce pode receber citacoes de uma edicao desatualizada

**Recomendacao:** Sempre verifique citacoes doutrinarias na fonte original antes de usa-las em pecas juridicas.

### Isso vai substituir a pesquisa juridica?

Nao. O Douto e uma ferramenta de busca e recuperacao de informacao, nao um substituto para analise juridica. Ele ajuda a encontrar trechos doutrinarios relevantes mais rapidamente, mas:

- O corpus e limitado (~50 livros, nao e exaustivo)
- Metadados podem conter erros
- Nenhum sistema substitui o julgamento do advogado sobre relevancia e aplicabilidade
- A ferramenta nao compreende as nuances do seu caso especifico

---

## Para Stakeholders

### Qual e a vantagem competitiva?

O diferencial do Douto sao **metadados estruturados sobre doutrina juridica brasileira**. Cada um dos ~31.500 chunks e classificado com seu instituto juridico, tipo de conteudo, fase processual, ramo do direito e referencias normativas. Isso possibilita busca semantica filtrada que motores de busca juridica genericos nao conseguem fazer.

Nenhum concorrente oferece atualmente esse nivel de acesso estruturado a livros doutrinarios brasileiros.

### Qual e a situacao de propriedade intelectual?

:::caution[Verdade incomoda]
O status de propriedade intelectual do corpus requer auditoria. Evidencias no codebase (`rechunk_v3.py` linha 716) sugerem que alguns livros podem ter sido obtidos de fontes nao autorizadas (referencia ao Z-Library). Isso cria tres riscos:

1. **Juridico** — Uso de obras protegidas por direitos autorais sem autorizacao potencialmente viola a Lei 9.610/98 (Lei de Direitos Autorais)
2. **Reputacional** — Due diligence por investidores ou parceiros institucionais flagraria isso
3. **Operacional** — Se o corpus precisar ser substituido por versoes licenciadas, todo o pipeline precisa ser reprocessado (e o prompt de enriquecimento esta atualmente perdido)

Uma auditoria de PI do corpus esta planejada como acao de mitigacao M16 (condicional a busca por investimento ou escala).
:::

### Qual e o prazo para producao?

Com base no roadmap atual:

| Milestone | Meta | O que possibilita |
|-----------|------|-------------------|
| v0.2 | ~Marco 2026 | Pipeline roda em qualquer maquina |
| v0.3 | ~Maio 2026 | Testes, docs, lint — projeto e contribuivel |
| v0.4 | ~Agosto 2026 | Servidor MCP — Valter pode consultar doutrina |

**Ressalvas:**
- O roadmap e mantido por um desenvolvedor solo gerenciando 5 repositorios
- 7 decisoes arquiteturais estao em aberto, 2 das quais bloqueiam o v0.4
- Nenhum usuario externo testou o sistema
- Prazos sao estimativas, nao compromissos

### Quanto custa para rodar?

| Componente | Tipo de custo | Estimativa |
|------------|---------------|------------|
| LlamaParse | Por PDF, unica vez | ~$0.01-0.10 por livro (tier cost_effective) |
| MiniMax M2.5 | Por chunk no enriquecimento | Baixo (preco exato varia) |
| Legal-BERTimbau | Gratuito (modelo open source) | $0 |
| Computacao | CPU/GPU para embeddings | Maquina local, sem custo de cloud |
| Armazenamento | Arquivos JSON | ~2 GB para o corpus atual |

<!-- NEEDS_INPUT: Preco exato do MiniMax M2.5 por token nao esta documentado no codebase. O criador pode ter essa informacao. -->

### O que acontece se o desenvolvedor solo ficar indisponivel?

Isso e identificado como risco RE01 (maior probabilidade no PREMORTEM). Atualmente:

- O pipeline roda apenas na maquina do desenvolvedor
- O prompt de enriquecimento nao esta no repositorio
- Dependencias nao estao pinadas
- Nao existem testes nem CI/CD
- Documentacao esta em andamento (estes docs)

Os milestones v0.2 e v0.3 abordam especificamente esse risco de bus-factor, tornando o projeto portavel e contribuivel. Ate que esses milestones sejam concluidos, outro desenvolvedor enfrentaria friccao significativa de onboarding.

---
title: "Introducao"
description: "O que e o Douto, qual problema ele resolve e por que ele existe dentro do ecossistema sens.legal."
lang: pt-BR
sidebar:
  order: 1
---

# Introducao

Douto e o agente de conhecimento doutrinario da plataforma sens.legal. Ele processa livros juridicos e os transforma em conhecimento estruturado e pesquisavel, pronto para ser consultado por advogados e agentes de IA em tempo real.

## O Problema

A pesquisa juridica no Brasil exige consultar multiplos autores sobre o mesmo conceito. Um advogado pesquisando *exceptio non adimpleti contractus* pode precisar comparar as posicoes de Orlando Gomes, Caio Mario e Pontes de Miranda — cada um em um livro diferente, capitulo diferente, edicao diferente. Esse cruzamento manual costuma levar de 2 a 4 horas por conceito.

As plataformas de legal tech atuais (Jusbrasil, Turivius, Vlex, LexisNexis) fazem **busca** — devolvem documentos que correspondem a uma consulta. Nenhuma delas faz **sintese** — agregar e comparar posicoes doutrinarias entre autores.

O Douto preenche essa lacuna transformando livros juridicos brutos em conhecimento estruturado, classificado e pesquisavel, com metadados que permitem filtrar por instituto juridico, tipo de conteudo, ramo do direito e fase processual.

## O que o Douto Faz

O Douto opera em dois modos complementares:

### Pipeline de Processamento em Batch

Cinco scripts Python executados sequencialmente transformam PDFs juridicos em dados pesquisaveis:

```
PDF → process_books.py → rechunk_v3.py → enrich_chunks.py → embed_doutrina.py → search_doutrina_v2.py
```

Cada estagio adiciona estrutura: o PDF bruto vira markdown, o markdown vira chunks inteligentes, os chunks sao classificados com metadados juridicos, o texto enriquecido gera embeddings, e os embeddings habilitam busca semantica.

### Base de Conhecimento Navegavel

Uma hierarquia de arquivos markdown no estilo Obsidian, organizada por ramo do direito:

```
INDEX_DOUTO.md (raiz — 8 ramos do direito)
  └── MOC_CIVIL.md (35 livros, ~9.365 chunks)
  └── MOC_PROCESSUAL.md (8 livros, ~22.182 chunks)
  └── MOC_EMPRESARIAL.md (7 livros)
  └── nodes/ (notas atomicas — planejado)
```

## Quem Usa o Douto

O Douto atende tres publicos:

| Publico | Como usa o Douto | Disponivel hoje? |
|---------|-----------------|-----------------|
| **Advogados** | Buscam doutrina via frontend Juca durante pesquisa de casos | Ainda nao — requer integracao v0.4 |
| **Agentes de IA** | Consultam doutrina via MCP/API durante briefings e analises | Ainda nao — MCP planejado para v0.4 |
| **Desenvolvedores** | Estendem o pipeline, adicionam livros, melhoram a base de conhecimento | Sim — via CLI |

## Onde o Douto se Encaixa

No ecossistema sens.legal, cada agente cuida de um pilar diferente do conhecimento juridico:

| Agente | Pilar | Corpus atual |
|--------|-------|-------------|
| **Valter** | Jurisprudencia | 23.400+ decisoes do STJ |
| **Leci** | Legislacao | Leis federais |
| **Douto** | Doutrina | ~50 livros, ~31.500 chunks |
| **Joseph** | Orquestracao | Coordena todos os agentes |
| **Juca** | Frontend | Apresenta resultados para advogados |

Quando totalmente integrado, um advogado que pergunte ao Juca sobre um conceito juridico recebera uma visao unificada combinando jurisprudencia do Valter, legislacao da Leci e doutrina do Douto.

## Conceitos Fundamentais

Estes termos aparecem ao longo de toda a documentacao:

| Termo | Definicao |
|-------|-----------|
| **Chunk** | Um fragmento semanticamente coerente de um livro juridico (200-1.000 tokens), produzido pelo `rechunk_v3.py`, com metadados em frontmatter YAML |
| **Instituto juridico** | Um conceito ou instituto do direito — ex.: *exceptio non adimpleti contractus*, *boa-fe objetiva*. A unidade fundamental de classificacao. |
| **Enriquecimento** | O processo de classificar chunks com metadados estruturados usando um LLM (atualmente MiniMax M2.5) |
| **Embedding** | Um vetor de 768 dimensoes representando o conteudo semantico de um chunk, gerado pelo Legal-BERTimbau |
| **MOC** | Map of Content — arquivo indice que lista todos os livros de um ramo do direito |
| **Skill graph** | A estrutura hierarquica de conhecimento: INDEX → MOCs → Chunks → Notas Atomicas |
| **Busca hibrida** | Combinacao de busca semantica (similaridade cosseno) e BM25 (busca por palavras-chave) com pontuacao ponderada |

Para definicoes completas, veja o [Glossario](../reference/glossary).

## O que o Douto NAO Faz

Limites claros definidos no [AGENTS.md](https://github.com/sensdiego/douto):

- **Nao gerencia casos** — isso e do Joseph (orquestrador)
- **Nao busca jurisprudencia** — isso e do Valter (23.400+ decisoes do STJ)
- **Nao busca legislacao** — isso e da Leci (leis federais)
- **Nao gerencia infraestrutura** — isso e do Valter (backend FastAPI)
- **Nao serve interface web** — isso e do Juca (frontend Next.js)

---
title: "Introducao"
description: "O que e o Douto, qual problema ele resolve e por que ele existe como pipeline local de doutrina dentro do sens.legal."
lang: pt-BR
sidebar:
  order: 1
---

# Introducao

Douto e o pipeline de doutrina do ecossistema sens.legal. Ele processa livros juridicos em artefatos doutrinarios estruturados que podem fortalecer a camada backend de conhecimento do ecossistema.

## O problema que o Douto resolve

Pesquisa doutrinaria e dificil de operacionalizar. Livros juridicos contem conceitos, posicoes e enquadramentos valiosos, mas normalmente vivem em PDFs, notas espalhadas ou fluxos de leitura manual que sao dificeis de reutilizar downstream.

O Douto existe para transformar esse material em:

- chunks estruturados
- metadados doutrinarios pesquisaveis
- embeddings e artefatos que possam ser consumidos depois

## O que o Douto e

O Douto e:

- um pipeline de processamento em batch
- uma base estruturada de conhecimento doutrinario
- um fornecedor de artefatos doutrinarios para o ecossistema

Ele nao e:

- o hub frontend para advogados
- o dono do retrieval de jurisprudencia
- a autoridade legislativa
- um produto final autonomo de doutrina para usuario final

## Onde o Douto se encaixa

Dentro do sens.legal:

| Projeto | Responsabilidade |
|---------|------------------|
| **Juca** | Hub frontend |
| **Valter** | Backend central de jurisprudencia e reasoning |
| **Leci** | Grounding legislativo |
| **Douto** | Producao de artefatos doutrinarios |

A relacao principal e entre Douto e Valter. O Douto produz material doutrinario que pode alimentar a camada mais ampla de conhecimento do Valter. Por isso ele deve ser descrito como fornecedor interno, e nao como agente autonomo voltado ao usuario.

## Conceitos centrais

| Termo | Significado |
|-------|-------------|
| **Chunk** | Fragmento doutrinario produzido a partir de livros juridicos |
| **Enriquecimento** | Classificacao de metadados sobre conteudo doutrinario |
| **Embedding** | Representacao vetorial usada em workflows de retrieval doutrinario |
| **Artefato** | Saida reutilizavel gerada pelo pipeline para consumo downstream |

## Leitura pratica

Se voce esta lendo estes docs a partir da perspectiva do ecossistema completo, pense no Douto como a camada de producao de doutrina que apoia o Valter, e nao como um produto standalone acabado para advogados.

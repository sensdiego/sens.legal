---
title: "Douto — Pipeline de Doutrina Juridica"
description: "Documentacao do Douto, pipeline local de processamento de doutrina que fornece artefatos doutrinarios ao ecossistema sens.legal."
lang: pt-BR
sidebar:
  order: 0
---

# Douto

Douto e o pipeline local de processamento de doutrina do ecossistema [sens.legal](https://sens.legal). Ele transforma livros juridicos em artefatos doutrinarios estruturados que depois podem ser consumidos pela camada de conhecimento do ecossistema, especialmente pelo Valter.

## O que o Douto faz

O Douto processa doutrina de PDF ate saídas estruturadas:

- extracao de PDF para markdown estruturado
- chunking inteligente com heuristicas do dominio juridico
- enriquecimento de metadados sobre conteudo doutrinario
- geracao de embeddings para workflows de retrieval doutrinario
- busca local e geracao de artefatos para uso downstream

## Posicionamento atual

O Douto deve ser entendido como um **pipeline interno**, e nao como um produto final autonomo de doutrina para usuario final.

O papel dele e:

- organizar material doutrinario em artefatos reutilizaveis
- sustentar a camada mais ampla de conhecimento do ecossistema
- fornecer contexto doutrinario ao Valter, em vez de competir com o Juca como experiencia voltada ao usuario

## Parte do sens.legal

O Douto e um dos quatro projetos do ecossistema sens.legal:

| Projeto | Papel |
|---------|-------|
| **Juca** | Hub frontend para advogados |
| **Valter** | Backend central de jurisprudencia e reasoning |
| **Leci** | Engine legislativa document-first |
| **Douto** | Pipeline local de doutrina e produtor de artefatos |

A fronteira importante e esta: o Douto nao e dono do frontend e nao deve ser enquadrado como uma aplicacao autonoma de doutrina. As saidas dele existem para reforcar a camada backend de conhecimento do ecossistema.

## Links Rapidos

| Secao | Descricao |
|-------|-----------|
| [Introducao](getting-started/introduction) | O que e o Douto, por que ele existe e onde se encaixa |
| [Quickstart](getting-started/quickstart) | Rode o baseline local do pipeline |
| [Arquitetura](architecture/overview) | Como o pipeline batch e a base de conhecimento funcionam |
| [Funcionalidades](features/) | Inventario de funcionalidades com status |
| [Roadmap](roadmap/) | Marcos planejados e riscos |
| [Glossario](reference/glossary) | Terminologia juridica e tecnica |

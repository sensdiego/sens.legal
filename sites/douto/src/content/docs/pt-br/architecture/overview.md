---
title: "Visao Geral da Arquitetura"
description: "Como o pipeline batch local do Douto e seus artefatos de doutrina se encaixam na camada de conhecimento do sens.legal."
lang: pt-BR
sidebar:
  order: 1
---

# Visao Geral da Arquitetura

O Douto e um pipeline batch local somado a uma base estruturada de conhecimento doutrinario. Ele nao e um servico web continuamente em execucao e nao deve ser tratado como runtime standalone de produto.

## Padrao arquitetural

A arquitetura tem duas partes principais:

- um pipeline de processamento em batch que transforma livros juridicos em saídas estruturadas
- uma camada de base de conhecimento que armazena estrutura doutrinaria e artefatos intermediarios

## Fluxo do pipeline

Em alto nivel, o Douto transforma:

`PDF -> texto extraido -> chunks -> metadados enriquecidos -> embeddings -> artefatos doutrinarios`

Cada etapa grava artefatos que podem ser reutilizados depois, em vez de depender de um servico always-on.

## Posicao no ecossistema

A relacao arquitetural importante e:

`Douto -> artefatos doutrinarios -> Valter -> consumidores do ecossistema`

Isso significa que o Douto integra o sens.legal principalmente fortalecendo a camada backend de conhecimento do Valter. Ele nao fica diretamente na frente do advogado como o Juca.

## Por que isso importa

Se o Douto for descrito como um produto autonomo de doutrina, a narrativa do ecossistema fica enganosa. O papel real dele e mais estreito e mais util:

- preparar doutrina localmente
- estruturar doutrina para reuso posterior
- fornecer doutrina para dentro da camada central de conhecimento do backend

## Restricoes atuais

- local e orientado a batch, nao always-on
- produtor de artefatos, nao API-first
- pensado para suporte backend do ecossistema, nao para interacao direta com usuario final

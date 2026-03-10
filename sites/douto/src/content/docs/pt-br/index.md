---
title: "Douto — Camada de Doutrina do Jude.md"
description: "Documentacao do Douto como fornecedor interno de doutrina para o Valter."
lang: pt-BR
sidebar:
  order: 0
---

# Douto

Douto e a camada de doutrina do Jude.md.
Seu papel e transformar livros juridicos em retrieval e sintese rastreaveis para o Valter, com foco inicial em contratos e processo civil.

## Definicao Operacional

- **Consumidor primario:** Valter
- **Consumidores indiretos:** Juca, advogado e agentes internos
- **Unidade de uso:** instituto juridico / problema juridico
- **Unidade de evidencia:** chunk doutrinario rastreavel
- **Unidade de entrega:** artefato doutrinario consumivel pelo Valter

## O Que o Douto Faz Hoje

- Extrai e reorganiza livros juridicos em pipeline batch
- Enriquece chunks com metadados doutrinarios
- Gera embeddings e artefatos de busca
- Permite busca CLI local para inspecao e validacao
- Mantem INDEX + MOCs como camada editorial interna

## O Que o Douto Ainda Nao Faz

- Nao entrega produto final direto ao advogado
- Nao opera como servico em tempo real
- Nao possui contrato de entrega completamente estabilizado com o Valter
- Nao tem sintese liberada para consumo do ecossistema

## Status Atual

| Metrica | Valor |
|---------|-------|
| Livros no corpus | ~50 |
| Chunks estimados | ~31.500 |
| Dominios prioritarios | Contratos e processo civil |
| Superficie real | Pipeline local + busca CLI |
| Consumidor primario | Valter |
| Cobertura de testes | 0% |
| Modo de entrega atual | Artefatos estaticos |

## Ordem de Construcao

1. Fundacao reproduzivel
2. Quality gate
3. Contrato de entrega ao Valter
4. Retrieval explicavel
5. Sintese com gate proprio

## Links Rapidos

| Secao | Descricao |
|-------|-----------|
| [Introducao](getting-started/introduction) | O que o Douto e e o que ele nao e |
| [Arquitetura](architecture/overview) | Como o pipeline e a entrega ao Valter se organizam |
| [Integracoes](configuration/integrations) | Como o Douto entrega hoje e como deve evoluir |
| [Roadmap](roadmap/) | Sequencia oficial de construcao |

## Parte do Ecossistema

| Componente | Papel em relacao ao Douto |
|-----------|----------------------------|
| **Valter** | Consumidor primario dos artefatos doutrinarios |
| **Juca** | Interface indireta para o advogado |
| **Leci** | Fonte complementar do ecossistema, nao concorrente |
| **Joseph** | Coordenacao/orquestracao, nao centro do produto Douto |

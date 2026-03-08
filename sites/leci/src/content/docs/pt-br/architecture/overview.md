---
title: "Visão Geral da Arquitetura"
description: "Resumo da arquitetura da engine legislativa atual, do fluxo de busca e dos limites de grounding."
lang: pt-BR
sidebar:
  order: 1
---


# Visão Geral da Arquitetura

## O Leci usa uma arquitetura document-first
O Leci hoje roda como um único repositório Next.js em que o PostgreSQL é o sistema de registro e a legislação é modelada por normas e `document_nodes` hierárquicos. O runtime é deliberadamente focado em retrieval confiável e grounding, em vez de tentar abraçar toda a superfície de produto de uma vez.

## Componentes implementados hoje
O codebase atual já inclui estes componentes operacionais:
- shell Next.js App Router e experiência de busca
- `GET /api/search` para recuperação legislativa
- contratos tipados e validação de parâmetros
- schema PostgreSQL + migrations SQL
- vetores de busca em `document_nodes`
- primitivas de revisão e auditoria para mutação de texto legal

## Fluxo de dados atual
O fluxo de runtime atual é direto:
1. uma busca chega ao `/api/search`;
2. os parâmetros são validados pela camada de contratos;
3. o PostgreSQL executa FTS sobre `document_nodes.search_vector`;
4. a resposta é enriquecida com metadados de norma e paginação;
5. a shell de busca renderiza e pagina os resultados.

## Responsabilidades do modelo de dados
O schema separa preocupações jurídicas em tabelas explícitas:
- `regulation_types` and `regulations` for top-level legal documents;
- `document_nodes` for hierarchical legal text and search vector generation;
- `embeddings` for semantic retrieval groundwork;
- `suggestions` and `revisions` for controlled correction and auditability.

## Invariantes arquiteturais
O invariante mais importante é a segurança de revisão para alterações em texto legal.

:::danger
Never mutate `document_nodes.content_text` directly. Apply legal text changes through `leci.apply_revision()` to preserve revision history integrity.
:::

## Fronteiras atuais
O Leci já tem uma API de retrieval, mas ainda não é a forma final do produto legislativo. A arquitetura atual deve ser entendida como:

- operacional o suficiente para grounding legislativo agora;
- deliberadamente estreita para permitir resolução canônica e reader mais rico com segurança;
- focada em ser autoridade legislativa para Valter e Juca, não um backend de jurisprudência/reasoning.

## Expansão arquitetural planejada
A próxima camada arquitetural é sobre profundidade:

- resolução canônica de documentos para referências jurídicas imperfeitas;
- leitura por dispositivo com contexto estrutural mais forte;
- contratos de grounding mais amplos para consumidores downstream;
- automação de ingestão além do baseline atual de runtime.

## Restrições operacionais
A arquitetura atual carrega restrições práticas:
- migration rerun safety depends on SQL idempotence (no migrations history table in script);
- search ainda é um endpoint baseline, não a superfície final completa do produto;
- production-grade observability and SLO enforcement are roadmap work.

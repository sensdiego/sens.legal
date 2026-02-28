---
title: Milestones
description: Detalhamento de cada milestone com features, critérios de conclusão e dependências.
lang: pt-BR
sidebar:
  order: 2
---

# Milestones

> Detalhamento de cada milestone com as features incluídas, critérios de conclusão e dependências.

## v0.3 — "Hub Foundation"

**Objetivo:** Transformar o Juca de um monólito fullstack em um hub frontend leve, com uma UI profissional e integração com o Valter.

**Features:**

| Feature | Issue | Prioridade | Status |
|---------|-------|-----------|--------|
| Reset de UI (estilo Fintool/Perplexity, design Liquid Legal) | #273 | P0 | Planejado |
| Camada de adapter para agentes externos | Novo | P0 | Planejado |
| Integração Juca → Valter (busca, verificação, grafo) | Novo | P0 | Planejado |
| Corrigir 72 arquivos de teste falhando | #270 | P1 | Planejado |
| Limpar dependências fantasmas | — | P1 | Concluído |
| Atualizar README.md | Novo | P1 | Planejado |

**Critérios de conclusão:**
- O Juca renderiza resultados da API Valter (não do backend local)
- A UI segue o design inspirado no Fintool com composer, cards de resultado e painel de citações
- Testes passando no CI (0 falhas)
- README reflete a arquitetura hub

---

## v0.4 — "Briefing Progressivo"

**Objetivo:** Entregar o fluxo completo de briefing de 4 fases com a nova UI, consumindo o Valter como backend.

**Features:**

| Feature | Issue | Prioridade | Endpoint Valter |
|---------|-------|-----------|----------------|
| F1: Diagnóstico Interativo | #285 | P1 | `/v1/factual/*` |
| F2: Precedentes Interativos | #286 | P1 | `/v1/retrieve`, `/v1/similar_cases` |
| F3: Riscos & Oportunidades | #287 | P1 | `/v1/graph/optimal-argument` |
| F4: Entrega Contextual | #288 | P1 | — (geração client-side) |
| Briefing PDF Personalizado | #289 | P1 | — |
| Remover backend duplicado (`src/lib/backend/`) | Novo | P1 | — |
| Timeout + AbortController de ponta a ponta | #238 | P2 | — |

**Critérios de conclusão:**
- Fluxo completo F1→F2→F3→F4 funcional com dados reais do Valter
- PDF reflete as seleções do usuário nas 4 fases
- Zero dependência do backend local para features principais
- Testes E2E cobrem o fluxo de briefing

**Dependências:** v0.3 (a camada de adapter e a integração Valter devem estar concluídas)

---

## v0.5 — "Polimento & Expansão"

**Objetivo:** Estabilizar, expandir as capacidades do grafo e resolver dívidas técnicas.

**Features:**

| Feature | Issue | Prioridade |
|---------|-------|-----------|
| Comparação de divergências/tendências via grafo Valter | #155 | P2 |
| Critérios de seleção avançados | #160 | P2 |
| Exportação de memorando jurídico (PDF + DOCX) | #158 | P2 |
| Validação pós-geração via Valter `/v1/verify` | #207 | P2 |
| Correções de consistência de dados | #268, #274 | P2 |
| Redução de alucinações (ajustes de prompt/schema) | #210 | P2 |
| Testes E2E no CI (Playwright no GitHub Actions) | — | P2 |

**Critérios de conclusão:**
- Features de grafo do Valter acessíveis via UI
- Dados consistentes (sem decisões órfãs)
- E2E rodando no CI

---

## v0.6+ — "Plataforma Multi-Agente"

**Objetivo:** Expandir o hub para suportar múltiplos agentes e preparar para escala.

**Features:**

| Feature | Issue | Prioridade |
|---------|-------|-----------|
| Integração com Leci (legislação federal) | — | P2 |
| Tela de exploração do GC (MinistroProfile, CompareMinistros) | #281 | P2 |
| Ledger de custo de LLM | #232 | P3 |
| Migração SQLite → PostgreSQL | #231 | P3 |
| Correção BOLA (validação de propriedade de sessão) | #227 | P3 |
| Injetar campos Q7/Q14/Q19 | #280 | P3 |

**Critérios de conclusão:**
- O Juca consome 2+ agentes (Valter + Leci)
- Rastreamento de custos funcional
- Sessões protegidas por verificações de propriedade

---

## v1.0 — "Lançamento da Plataforma"

**Objetivo:** Produto pronto para produção para usuários externos.

**Features:**

| Feature | Issue | Prioridade |
|---------|-------|-----------|
| Plataforma de Skills (skills jurídicas modulares) | #193 | P3 |
| Multi-tenancy e billing | — | P3 |
| Configuração PWA | — | P3 |
| Expansão do corpus (TJs, TRFs, TST via agentes) | — | P3 |
| Documentação pública completa | — | P3 |

**Critérios de conclusão:**
- Usuários externos podem se cadastrar e usar o produto
- Billing funcional
- Documentação publicada

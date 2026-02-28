---
title: Milestones
description: Detailed breakdown of each milestone with features, criteria, and dependencies.
lang: en
sidebar:
  order: 2
---

# Milestones

> Detailed breakdown of each milestone with included features, completion criteria, and dependencies.

## v0.3 — "Hub Foundation"

**Objective:** Transform Juca from a fullstack monolith to a lightweight frontend hub with a professional UI and Valter integration.

**Features:**

| Feature | Issue | Priority | Status |
|---------|-------|----------|--------|
| UI reset (Fintool/Perplexity-style, Liquid Legal design) | #273 | P0 | Planned |
| Adapter layer for external agents | New | P0 | Planned |
| Juca → Valter integration (search, verify, graph) | New | P0 | Planned |
| Fix 72 failing test files | #270 | P1 | Planned |
| Clean phantom dependencies | — | P1 | Done |
| Update README.md | New | P1 | Planned |

**Completion criteria:**
- Juca renders results from Valter API (not local backend)
- UI follows Fintool-inspired design with composer, result cards, citation panel
- Tests passing in CI (0 failures)
- README reflects hub architecture

---

## v0.4 — "Briefing Progressivo"

**Objective:** Deliver the full 4-phase briefing flow with the new UI, consuming Valter as backend.

**Features:**

| Feature | Issue | Priority | Valter Endpoint |
|---------|-------|----------|----------------|
| F1: Interactive Diagnosis | #285 | P1 | `/v1/factual/*` |
| F2: Interactive Precedents | #286 | P1 | `/v1/retrieve`, `/v1/similar_cases` |
| F3: Risks & Opportunities | #287 | P1 | `/v1/graph/optimal-argument` |
| F4: Contextual Delivery | #288 | P1 | — (client-side generation) |
| Personalized Briefing PDF | #289 | P1 | — |
| Remove duplicated backend (`src/lib/backend/`) | New | P1 | — |
| Timeout + AbortController end-to-end | #238 | P2 | — |

**Completion criteria:**
- Full F1→F2→F3→F4 flow functional with real Valter data
- PDF reflects user selections across all 4 phases
- Zero dependency on local backend for core features
- E2E tests cover the briefing flow

**Dependencies:** v0.3 (adapter layer and Valter integration must be complete)

---

## v0.5 — "Polish & Expand"

**Objective:** Stabilize, expand graph capabilities, and resolve technical debt.

**Features:**

| Feature | Issue | Priority |
|---------|-------|----------|
| Divergence/trend comparison via Valter graph | #155 | P2 |
| Advanced selection criteria | #160 | P2 |
| Export legal memo (PDF + DOCX) | #158 | P2 |
| Post-generation validation via Valter `/v1/verify` | #207 | P2 |
| Data consistency fixes | #268, #274 | P2 |
| Hallucination reduction (prompt/schema adjustments) | #210 | P2 |
| E2E tests in CI (Playwright in GitHub Actions) | — | P2 |

**Completion criteria:**
- Valter graph features accessible via UI
- Consistent data (no orphan decisions)
- E2E running in CI

---

## v0.6+ — "Multi-Agent Platform"

**Objective:** Expand the hub to support multiple agents and prepare for scale.

**Features:**

| Feature | Issue | Priority |
|---------|-------|----------|
| Leci integration (federal legislation) | — | P2 |
| KG exploration screen (MinistroProfile, CompareMinistros) | #281 | P2 |
| LLM cost ledger | #232 | P3 |
| SQLite → PostgreSQL migration | #231 | P3 |
| BOLA fix (session ownership validation) | #227 | P3 |
| Inject Q7/Q14/Q19 fields | #280 | P3 |

**Completion criteria:**
- Juca consumes 2+ agents (Valter + Leci)
- Cost tracking functional
- Sessions protected by ownership checks

---

## v1.0 — "Platform Release"

**Objective:** Production-ready product for external users.

**Features:**

| Feature | Issue | Priority |
|---------|-------|----------|
| Skills Platform (modular legal skills) | #193 | P3 |
| Multi-tenancy and billing | — | P3 |
| PWA configuration | — | P3 |
| Corpus expansion (TJs, TRFs, TST via agents) | — | P3 |
| Complete public documentation | — | P3 |

**Completion criteria:**
- External users can sign up and use the product
- Billing functional
- Documentation published

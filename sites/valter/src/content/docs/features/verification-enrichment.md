---
title: Verification & Enrichment
description: Anti-hallucination verification of legal references and IRAC-based document enrichment with knowledge graph context.
sidebar:
  order: 6
lang: en
---

# Verification & Enrichment

Valter provides two complementary features for ensuring accuracy of legal content. Verification catches hallucinated legal references before they reach users. Enrichment adds structured legal analysis (IRAC) and knowledge graph context to decisions.

## Anti-Hallucination Verification

**Endpoint**: `POST /v1/verify`

LLMs frequently hallucinate legal citations -- inventing sumula numbers, misspelling minister names, or fabricating process numbers. The `LegalVerifier` (`core/verifier.py`) validates references found in text against known datasets and computes a hallucination risk score.

### What Gets Verified

The verifier checks four categories of legal references, each toggleable via request parameters:

#### Sumulas

Validates sumula numbers against local STJ and STF reference data using `SumulaValidator`. The validation confirms:

- The sumula number exists
- The correct court is attributed (STJ vs STF)
- Current status (vigente or not)
- The associated legal area

#### Ministers

Validates minister names against a known list using `MinistroValidator`. Returns:

- `valid`: whether the name matches a known minister
- `confidence`: `exact`, `partial`, or `none`
- `is_aposentado`: whether the minister is retired
- `suggestion`: corrected name when a partial match is found

#### Process Numbers

Validates the CNJ process number format using a regex pattern:

```python
# From core/verifier.py
# CNJ format: NNNNNNN-NN.NNNN.N.NN.NNNN
PROCESSO_REGEX = re.compile(r"\b(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b")
```

This validates format only -- it does not confirm the process exists in external systems.

#### Legislation

Extracts and classifies legislation mentions using regex patterns. Recognizes both explicit references (e.g., "Lei 8.078/1990") and common aliases:

| Alias | Resolves To |
|-------|-------------|
| CDC | Lei 8.078/1990 |
| CC | Lei 10.406/2002 |
| CPC | Lei 13.105/2015 |
| CLT | Decreto-Lei 5.452/1943 |
| CP | Decreto-Lei 2.848/1940 |
| CTN | Lei 5.172/1966 |
| CF | Constituicao Federal 1988 |
| ECA | Lei 8.069/1990 |

Article references (e.g., "Art. 186") are also extracted and linked to their parent law.

:::note
Legislation references are extracted and classified but not verified for legal existence or current validity.
:::

### Hallucination Risk Metrics

The verifier computes an overall `HallucinationMetrics` object:

```python
# From core/verifier.py
@dataclass
class HallucinationMetrics:
    risk_level: str      # "low", "medium", "high"
    risk_score: float    # 0-100
    total_citations: int
    valid_count: int
    invalid_count: int
    unverified_count: int
    details: dict
```

The risk score aggregates validation results: a text with many invalid references produces a higher score, signaling that the content may contain hallucinated citations.

### Reference Data

Verification relies on golden datasets stored in the `data/reference/` directory. The project also has 810,225 STJ metadata records for broader process validation.

## IRAC Analysis & Enrichment

**Endpoint**: `POST /v1/enrich`

The `DocumentEnricher` (`core/enricher.py`) performs two operations on a legal document: heuristic IRAC classification and knowledge graph context loading.

### IRAC Components

IRAC is a standard framework for analyzing legal decisions:

| Component | What It Identifies | Example Patterns |
|-----------|-------------------|-----------------|
| **Issue** | The legal question being decided | "questao", "controversia", "discute-se", "cinge-se" |
| **Rule** | The legal norm or principle applied | "artigo", "lei", "sumula", "nos termos de" |
| **Application** | How the rule was applied to the facts | "no caso", "in casu", "verifica-se", "configurado" |
| **Conclusion** | The court's decision | "portanto", "ante o exposto", "da provimento", "nega" |

The classification is heuristic and regex-based -- it does not depend on an LLM. Each IRAC section is identified by scanning the document text (ementa, tese, razoes_decidir) against compiled regex patterns:

```python
# From core/enricher.py
IRAC_PATTERNS = {
    IRACSection.ISSUE: [
        r"\b(?:questao|problema|controversia|debate|discussao|tese|cerne)\b",
        r"\b(?:discute-se|indaga-se|pergunta-se|cinge-se)\b",
    ],
    IRACSection.RULE: [
        r"\b(?:art\.?|artigo|lei|sumula|codigo|dispositivo|norma)\b",
        r"\b(?:preve|estabelece|dispoe|prescreve|determina)\b",
    ],
    # ...
}
```

### Knowledge Graph Context

After IRAC classification, the enricher loads graph context by running 5 parallel queries against Neo4j:

| Entity Type | Method | What It Returns |
|-------------|--------|-----------------|
| Criterios | `get_criterios()` | Legal criteria connected to the decision |
| Dispositivos | `get_dispositivos()` | Legal statutes cited |
| Precedentes | `get_precedentes()` | Precedent decisions cited |
| Legislacao | `get_legislacao()` | Legislation edges with relationship metadata |
| Related Decisions | `get_related_decisions()` | Decisions connected via shared criteria |

The enrichment result includes a `kg_available` flag indicating whether the Neo4j graph contained data for this decision.

```python
# From core/enricher.py
@dataclass
class EnrichmentResult:
    document_id: str
    irac: IRACAnalysis | None = None
    features: DocumentFeatures | None = None
    criterios: list[Criterio] = field(default_factory=list)
    dispositivos: list[DispositivoLegal] = field(default_factory=list)
    precedentes: list[Precedente] = field(default_factory=list)
    legislacao: list[DecisaoLegislacaoEdge] = field(default_factory=list)
    related_decisions: list[RelatedDecision] = field(default_factory=list)
    kg_available: bool = False
```

If a `FeaturesStore` is configured, the enricher also loads the 21 AI-extracted features for the document.

## Factual Extraction

**Endpoint**: `POST /v1/factual/extract`

The `FactualExtractor` (`core/factual_extractor.py`) uses a Groq LLM to extract two independent structured representations from legal text:

### Factual Digest

A set of 10-15 factual bullets plus a condensed narrative (2-3 sentences), optimized for semantic search:

- Each bullet cites the source excerpt from the original text when identifiable
- Uncertain or contested facts are marked with `uncertainty: true`
- The `digest_text` is designed to be dense and comparable across cases

### Legal Thesis

The core legal argument extracted from the document:

- Central thesis description (1-3 sentences)
- Legal basis: statutes cited (e.g., "CDC art. 14", "CC/2002 art. 186")
- Precedents cited in the text (e.g., "REsp 1.234.567/SP", "Sumula 297/STJ")

These dense representations produce more discriminative vectors than embedding entire decisions, which suffer from topic averaging across long documents. The input is capped at 4,000 characters to align with LLM context limits.

:::note
Factual extraction requires `VALTER_GROQ_API_KEY` and `VALTER_GROQ_ENABLED=true`.
:::

## Temporal Validity

Integrated into the verifier pipeline, temporal validity checks whether referenced legal norms are still in effect. This catches references to revoked or superseded legislation, which is a common source of inaccuracy in AI-generated legal content.

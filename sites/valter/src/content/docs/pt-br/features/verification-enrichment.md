---
title: Verificacao e Enriquecimento
description: Verificacao anti-alucinacao de referencias juridicas e enriquecimento de documentos baseado em IRAC com contexto do knowledge graph.
sidebar:
  order: 6
lang: pt-BR
---

# Verificacao e Enriquecimento

O Valter oferece duas funcionalidades complementares para garantir a precisao do conteudo juridico. A verificacao identifica referencias juridicas alucinadas antes que cheguem ao usuario. O enriquecimento adiciona analise juridica estruturada (IRAC) e contexto do knowledge graph as decisoes.

## Verificacao Anti-Alucinacao

**Endpoint**: `POST /v1/verify`

LLMs frequentemente alucinam citacoes juridicas -- inventando numeros de sumula, errando nomes de ministros ou fabricando numeros de processo. O `LegalVerifier` (`core/verifier.py`) valida referencias encontradas no texto contra datasets conhecidos e calcula um score de risco de alucinacao.

### O Que e Verificado

O verificador checa quatro categorias de referencias juridicas, cada uma ativavel/desativavel via parametros da requisicao:

#### Sumulas

Valida numeros de sumula contra dados de referencia locais do STJ e STF usando `SumulaValidator`. A validacao confirma:

- O numero da sumula existe
- O tribunal correto esta atribuido (STJ vs STF)
- Status atual (vigente ou nao)
- A area juridica associada

#### Ministros

Valida nomes de ministros contra uma lista conhecida usando `MinistroValidator`. Retorna:

- `valid`: se o nome corresponde a um ministro conhecido
- `confidence`: `exact`, `partial` ou `none`
- `is_aposentado`: se o ministro esta aposentado
- `suggestion`: nome corrigido quando um match parcial e encontrado

#### Numeros de Processo

Valida o formato do numero de processo CNJ usando um padrao regex:

```python
# From core/verifier.py
# CNJ format: NNNNNNN-NN.NNNN.N.NN.NNNN
PROCESSO_REGEX = re.compile(r"\b(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b")
```

Isso valida apenas o formato -- nao confirma se o processo existe em sistemas externos.

#### Legislacao

Extrai e classifica mencoes a legislacao usando padroes regex. Reconhece tanto referencias explicitas (ex.: "Lei 8.078/1990") quanto aliases comuns:

| Alias | Resolve Para |
|-------|-------------|
| CDC | Lei 8.078/1990 |
| CC | Lei 10.406/2002 |
| CPC | Lei 13.105/2015 |
| CLT | Decreto-Lei 5.452/1943 |
| CP | Decreto-Lei 2.848/1940 |
| CTN | Lei 5.172/1966 |
| CF | Constituicao Federal 1988 |
| ECA | Lei 8.069/1990 |

Referencias a artigos (ex.: "Art. 186") tambem sao extraidas e vinculadas a lei de origem.

:::note
As referencias legislativas sao extraidas e classificadas, mas nao verificadas quanto a existencia legal ou validade atual.
:::

### Metricas de Risco de Alucinacao

O verificador calcula um objeto `HallucinationMetrics` geral:

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

O score de risco agrega os resultados de validacao: um texto com muitas referencias invalidas produz um score mais alto, sinalizando que o conteudo pode conter citacoes alucinadas.

### Dados de Referencia

A verificacao se baseia em datasets golden armazenados no diretorio `data/reference/`. O projeto tambem conta com 810.225 registros de metadados do STJ para validacao mais ampla de processos.

## Analise IRAC e Enriquecimento

**Endpoint**: `POST /v1/enrich`

O `DocumentEnricher` (`core/enricher.py`) realiza duas operacoes em um documento juridico: classificacao heuristica IRAC e carregamento de contexto do knowledge graph.

### Componentes IRAC

IRAC e um framework padrao para analise de decisoes juridicas:

| Componente | O Que Identifica | Padroes Exemplo |
|------------|-----------------|-----------------|
| **Issue** | A questao juridica sendo decidida | "questao", "controversia", "discute-se", "cinge-se" |
| **Rule** | A norma ou principio juridico aplicado | "artigo", "lei", "sumula", "nos termos de" |
| **Application** | Como a regra foi aplicada aos fatos | "no caso", "in casu", "verifica-se", "configurado" |
| **Conclusion** | A decisao do tribunal | "portanto", "ante o exposto", "da provimento", "nega" |

A classificacao e heuristica e baseada em regex -- nao depende de um LLM. Cada secao IRAC e identificada escaneando o texto do documento (ementa, tese, razoes_decidir) contra padroes regex compilados:

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

### Contexto do Knowledge Graph

Apos a classificacao IRAC, o enricher carrega contexto do grafo executando 5 queries paralelas no Neo4j:

| Tipo de Entidade | Metodo | O Que Retorna |
|------------------|--------|---------------|
| Criterios | `get_criterios()` | Criterios juridicos conectados a decisao |
| Dispositivos | `get_dispositivos()` | Dispositivos legais citados |
| Precedentes | `get_precedentes()` | Decisoes precedentes citadas |
| Legislacao | `get_legislacao()` | Arestas de legislacao com metadados de relacionamento |
| Decisoes Relacionadas | `get_related_decisions()` | Decisoes conectadas via criterios compartilhados |

O resultado do enriquecimento inclui um flag `kg_available` indicando se o grafo Neo4j continha dados para esta decisao.

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

Se um `FeaturesStore` estiver configurado, o enricher tambem carrega as 21 features extraidas por IA para o documento.

## Extracao Factual

**Endpoint**: `POST /v1/factual/extract`

O `FactualExtractor` (`core/factual_extractor.py`) usa um Groq LLM para extrair duas representacoes estruturadas independentes a partir de texto juridico:

### Resumo Factual

Um conjunto de 10-15 bullets factuais mais uma narrativa condensada (2-3 frases), otimizado para busca semantica:

- Cada bullet cita o trecho fonte do texto original quando identificavel
- Fatos incertos ou contestados sao marcados com `uncertainty: true`
- O `digest_text` e projetado para ser denso e comparavel entre casos

### Tese Juridica

O argumento juridico central extraido do documento:

- Descricao da tese central (1-3 frases)
- Base legal: dispositivos citados (ex.: "CDC art. 14", "CC/2002 art. 186")
- Precedentes citados no texto (ex.: "REsp 1.234.567/SP", "Sumula 297/STJ")

Essas representacoes densas produzem vetores mais discriminativos do que a codificacao de decisoes inteiras, que sofrem de media de topicos em documentos longos. A entrada e limitada a 4.000 caracteres para alinhar com os limites de contexto do LLM.

:::note
A extracao factual requer `VALTER_GROQ_API_KEY` e `VALTER_GROQ_ENABLED=true`.
:::

## Validade Temporal

Integrada ao pipeline do verificador, a verificacao de validade temporal checa se as normas juridicas referenciadas ainda estao em vigor. Isso captura referencias a legislacao revogada ou substituida, que e uma fonte comum de imprecisao em conteudo juridico gerado por IA.

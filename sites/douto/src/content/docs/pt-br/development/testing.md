---
title: Testes
description: Estado atual de testes e a estrategia de testes planejada para o Douto.
lang: pt-BR
sidebar:
  order: 3
---

# Testes

Estado atual de testes e a estrategia planejada para o Douto.

## Estado Atual

:::danger[Zero de cobertura de testes]
O Douto **nao possui testes automatizados**. Nao ha framework de testes configurado, nao ha diretorio de testes, nao ha pipeline de CI/CD executando testes. A cobertura de testes e **0%**.

Este e o item #1 de divida tecnica identificado no PREMORTEM (RT04). O script mais complexo do pipeline (`rechunk_v3.py` -- 890 linhas, 16 padroes regex, 5 passes de processamento) nao tem cobertura alguma. Qualquer refatoracao arrisca introduzir regressoes silenciosas que so podem ser detectadas por inspecao manual de milhares de chunks.
:::

## Estrategia de Testes Planejada

Os testes serao introduzidos em tres fases ao longo dos milestones v0.3 e v0.5.

### Fase 1: Testes do Caminho Critico (v0.3 -- F26)

**Framework:** pytest
**Alvo:** `rechunk_v3.py` -- o componente mais complexo e fragil

Funcoes prioritarias para testar:

| Funcao | Linhas | Por que e critica |
|--------|--------|-------------------|
| `smart_split()` | ~200 | O algoritmo de chunking em 5 passes. Nucleo de todo o pipeline. |
| `detect_section()` | ~20 | Usa 16 padroes regex para identificar a estrutura de documentos juridicos. Deteccao errada = fronteiras de chunk erradas. |
| `classify_title()` | ~50 | Distingue conteudo de ruido, bibliografia, resumo e running headers. Falsos positivos perdem conteudo real. |
| `aggregate_footnotes()` | ~30 | Agrupa notas de rodape com paragrafos-pai. Agrupamento quebrado = notas de rodape orfas. |
| `detect_tail()` | ~20 | Identifica conteudo final (bibliografia, indice). Deteccao incorreta = bibliografia misturada com conteudo. |
| `classify_block_content()` | ~40 | Classifica blocos como exemplo, tabela, caracteristicas, artigo de lei ou bibliografia. |

**Fixtures de teste:** Amostras reais de markdown de livros juridicos (anonimizadas se necessario por questoes de propriedade intelectual).

**Aceitacao minima:** Pelo menos um teste por funcao acima, cobrindo tanto o caminho feliz quanto pelo menos um caso de borda.

### Fase 2: Testes de Utilitarios (v0.3 -- F27)

**Alvo:** Funcoes compartilhadas (atualmente duplicadas, a serem extraidas para `utils.py` em F23)

| Funcao | Casos de borda a cobrir |
|--------|------------------------|
| `parse_frontmatter()` | Valores com dois-pontos (`titulo: "Codigo Civil: Comentado"`), simbolos de hash, valores multilinea, frontmatter ausente, YAML malformado |
| `slugify()` | Caracteres unicode, letras acentuadas, caracteres especiais, inputs propensos a colisao (ex.: "Contratos - Vol. 1" vs. "Contratos - Vol 1") |
| `extract_json()` | JSON valido em code blocks markdown, JSON com texto extra ao redor, JSON malformado, objetos aninhados |
| `compose_embedding_text()` | Campos de metadados ausentes, corpo vazio, texto muito longo (truncamento em 512 tokens) |

### Fase 3: Testes de Qualidade de Busca (v0.5 -- F40)

**Alvo:** Avaliacao de qualidade de busca end-to-end

| Componente | O que medir |
|------------|-------------|
| **Conjunto de avaliacao** | 30+ queries com chunks de resultado esperados (curados manualmente) |
| **recall@5** | Qual fracao dos resultados esperados aparece no top 5? |
| **recall@10** | Qual fracao aparece no top 10? |
| **nDCG** | Os resultados mais relevantes estao ranqueados mais alto? |
| **Deteccao de regressao** | Comparacao antes/depois quando o pipeline muda (novo modelo, novo prompt, rechunking) |

Esta fase tambem inclui validacao de qualidade de metadados (M06):
- Amostrar 200 chunks aleatorios
- Verificar `instituto`, `tipo_conteudo`, `ramo` contra o conteudo real
- Estabelecer baseline de acuracia
- **Quality gate:** se acuracia < 85%, parar e re-enriquecer antes de prosseguir

## Como Executar os Testes

:::note
Os testes ainda nao existem. Os comandos abaixo descrevem o workflow planejado apos a implementacao de F26/F27.
:::

> **Funcionalidade Planejada** -- A infraestrutura de testes esta no roadmap para v0.3 mas ainda nao foi implementada.

```bash
# Run all tests
make test
# or directly:
pytest

# Run only pipeline tests
pytest tests/pipeline/

# Run a specific test
pytest -k "test_smart_split"

# Run with coverage report
pytest --cov=pipeline --cov-report=html

# Run with verbose output
pytest -v
```

## Como Escrever Testes

### Estrutura de Diretorios (Planejada)

```
tests/
├── conftest.py                    # Shared fixtures
├── fixtures/
│   ├── markdown/                  # Sample legal markdown files
│   │   ├── contract_chapter.md
│   │   ├── cpc_commentary.md
│   │   └── bibliography.md
│   ├── frontmatter/               # Frontmatter edge cases
│   │   ├── valid.md
│   │   ├── colon_in_value.md
│   │   └── missing_frontmatter.md
│   └── json/                      # Sample JSON responses
│       ├── enrichment_response.json
│       └── malformed_response.json
├── pipeline/
│   ├── test_rechunk_v3.py
│   ├── test_enrich_chunks.py
│   ├── test_embed_doutrina.py
│   ├── test_search_doutrina.py
│   └── test_utils.py
└── evaluation/
    └── test_search_quality.py     # Phase 3 eval set
```

### Convencoes

| Convencao | Regra |
|-----------|-------|
| Nomenclatura de arquivos | `test_{module}.py` |
| Nomenclatura de funcoes | `test_{function}_{scenario}()` |
| Fixtures | Colocar em `tests/fixtures/`, usar mecanismo de fixtures do `pytest` |
| APIs externas | **Sempre mockar.** Nunca chamar MiniMax, LlamaParse ou HuggingFace em testes. |
| Assertions | Testar comportamento e output, nao detalhes de implementacao |
| Independencia | Cada teste deve ser independente -- sem estado mutavel compartilhado entre testes |

### Exemplo de Teste (Preview)

```python
# tests/pipeline/test_rechunk_v3.py
import pytest
from pipeline.rechunk_v3 import detect_section, classify_title

class TestDetectSection:
    def test_markdown_header(self):
        result = detect_section("## Responsabilidade Civil")
        assert result is not None
        title, ptype = result
        assert ptype == "md_header"
        assert "Responsabilidade Civil" in title

    def test_legal_article(self):
        result = detect_section("**Art. 481.** O vendedor obriga-se...")
        assert result is not None
        title, ptype = result
        assert ptype == "artigo"

    def test_plain_text_not_section(self):
        result = detect_section("Este principio fundamenta a boa-fe objetiva.")
        assert result is None

class TestClassifyTitle:
    def test_bibliography_detection(self):
        assert classify_title("REFERENCIAS BIBLIOGRAFICAS") == "bibliography"
        assert classify_title("Bibliografia") == "bibliography"

    def test_noise_detection(self):
        assert classify_title("Agradecimentos") == "noise"
        assert classify_title("PREFACIO") == "noise"
```

## Dados de Teste

### Criando Fixtures

- Usar **markdown juridico real** para testes de chunking (do corpus processado)
- **Anonimizar** se houver questoes de propriedade intelectual -- substituir nomes proprios, parafrasear conteudo preservando a estrutura
- Usar **frontmatter sintetico** para testes do parser (criar casos de borda especificos)
- Usar **embeddings pequenos pre-computados** para testes de busca (algumas dezenas de vetores, nao o corpus inteiro)
- **Nunca commitar dados do corpus completo** nas fixtures de teste (muito grande, potenciais questoes de PI)

### Diretrizes do Conjunto de Avaliacao (Fase 3)

Cada entrada no conjunto de avaliacao deve incluir:

```json
{
  "query": "exceptio non adimpleti contractus requisitos",
  "expected_chunks": ["contratos-orlando-gomes-cap12-003", "contratos-civil-cap08-001"],
  "area": "contratos",
  "notes": "Both chunks define the requirements for the defense"
}
```

Meta: pelo menos 30 queries cobrindo:
- Diferentes dominios juridicos (civil, processual, empresarial)
- Diferentes tipos de consulta (conceitual, artigo especifico, comparativa)
- Casos de borda (conceitos cross-domain como "boa-fe", termos muito especificos)

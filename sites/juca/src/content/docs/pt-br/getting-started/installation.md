---
title: "Instalação"
description: "Guia completo de configuração incluindo todos os serviços opcionais, armazenamentos de dados e ferramentas de desenvolvimento."
lang: pt-BR
sidebar:
  order: 3
---

# Instalação

Este é o guia de configuração completo. Para uma configuração mínima de 5 minutos, veja [Quickstart](/getting-started/quickstart).

## Requisitos do Sistema

| Requisito | Versão | Observações |
|-----------|--------|-------------|
| Node.js | 20+ | LTS recomendado. Verifique: `node -v` |
| npm | 10+ | Incluído no Node 20 |
| Git | 2.x+ | Com Git LFS para arquivos de dados grandes |
| Ferramentas de build C++ | — | Necessário para compilação nativa do `better-sqlite3` |
| Docker | — | Opcional, apenas para Neo4j local |

## Configuração Passo a Passo

### 1. Clonar o Repositório

```bash
git clone https://github.com/sensdiego/juca.git
cd juca
```

Se o repositório usa Git LFS para arquivos de dados, execute também:

```bash
git lfs install
git lfs pull
```

### 2. Instalar Dependências

```bash
npm install
```

Isso instala ~670 pacotes, incluindo o módulo nativo `better-sqlite3`. Se a compilação falhar:

- **macOS:** `xcode-select --install`
- **Linux (Debian/Ubuntu):** `sudo apt-get install build-essential python3`
- **Linux (RHEL/Fedora):** `sudo dnf groupinstall "Development Tools"`

### 3. Configuração do Ambiente

Copie o arquivo de exemplo e preencha seus valores:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias (mínimo):**

```bash
# Provedores de LLM — pelo menos Anthropic + Groq
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Bypass de autenticação em dev
ENABLE_DEV_AUTH=true
```

**Opcionais mas recomendadas:**

```bash
# Integração com o Valter (o backend principal)
VALTER_API_URL=https://valter-api-production.up.railway.app
VALTER_API_KEY=your-key

# Provedores de LLM adicionais
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=sk-...

# Grafo de Conhecimento (modo JSON por padrão)
KG_PROVIDER=json
```

Veja [Variáveis de Ambiente](/configuration/environment) para a referência completa das 30+ variáveis.

### 4. Neo4j Local (Opcional)

Se quiser usar o grafo de conhecimento Neo4j localmente em vez de arquivos JSON:

```bash
docker compose up -d
```

Isso inicia uma instância do Neo4j Community 5. Em seguida, configure:

```bash
KG_PROVIDER=neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
```

:::note
O Neo4j não é necessário se você estiver usando a API do Valter para consultas ao grafo de conhecimento, que é a abordagem recomendada daqui para frente.
:::

### 5. Git Hooks

O projeto usa git hooks customizados em `.githooks/`:

| Hook | Ação |
|------|------|
| `pre-commit` | Roda o ESLint nos arquivos em stage |
| `pre-push` | Roda a suíte de testes completa |
| `post-checkout` | Tarefas de manutenção |
| `post-commit` | Tarefas de manutenção |
| `post-merge` | Tarefas de manutenção |

Os hooks são configurados automaticamente via o script `prepare` no package.json:

```bash
npm run prepare  # Executa: git config core.hooksPath .githooks
```

### 6. Verificar a Instalação

```bash
# Iniciar o servidor de dev
npm run dev

# Em outro terminal, rodar os testes
npm test
```

Resultados esperados:
- Servidor de dev inicia em `http://localhost:3000` sem erros
- Testes são executados (alguns podem falhar devido ao problema conhecido [#270](https://github.com/sensdiego/juca/issues/270))

## Configuração com Docker (Produção)

O Juca usa um build Docker multi-stage para deploy em produção:

```bash
# Build da imagem (ATENÇÃO: apenas para CI/Railway — NÃO rode localmente)
docker build -t juca .
```

O Dockerfile:
1. **Estágio deps** — Instala as dependências npm
2. **Estágio build** — Roda `next build` com saída standalone
3. **Estágio runtime** — Imagem mínima de Node.js com apenas os artefatos de produção

O deploy no Railway acontece automaticamente ao fazer push para `main`.

:::danger
**Nunca rode `docker build` ou `next build` localmente.** Pelas regras do projeto ([CLAUDE.md](/development/contributing)), builds que consomem >50% de CPU devem ser delegados ao CI. Faça push para seu branch e deixe o GitHub Actions ou o Railway fazer o build.
:::

## Solução de Problemas

| Problema | Solução |
|----------|---------|
| Falha na compilação do `better-sqlite3` | Instale as ferramentas de build C++ (veja o passo 2) |
| Arquivos Git LFS aparecem como ponteiros | Execute `git lfs pull` |
| Erros de autenticação em todas as páginas | Defina `ENABLE_DEV_AUTH=true` no `.env.local` |
| "No API key configured" | Adicione no mínimo `ANTHROPIC_API_KEY` e `GROQ_API_KEY` |

Para outros problemas, veja [Solução de Problemas](/reference/troubleshooting).

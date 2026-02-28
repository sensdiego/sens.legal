---
title: Solução de Problemas
description: Problemas comuns e suas soluções ao trabalhar com o Juca.
lang: pt-BR
sidebar:
  order: 3
---

# Solução de Problemas

> Problemas comuns e suas soluções ao desenvolver ou rodar o Juca.

## Problemas de Instalação

### Falha na compilação do better-sqlite3

**Causa:** `better-sqlite3` é um addon nativo em C++ que requer compilação durante o `npm install`.

**Solução:**

| Plataforma | Correção |
|-----------|---------|
| macOS | `xcode-select --install` (instala as ferramentas de build C++) |
| Linux (Debian/Ubuntu) | `sudo apt-get install build-essential python3` |
| Linux (RHEL/Fedora) | `sudo dnf groupinstall "Development Tools"` |

Certifique-se também de estar usando o Node.js 20+ (a versão especificada no projeto):

```bash
node --version  # Deve ser v20.x ou superior
```

### Arquivos do Git LFS não baixados

**Causa:** O Git LFS não foi instalado ou inicializado antes do clone, então os arquivos de dados aparecem como arquivos de ponteiro.

**Solução:**

```bash
git lfs install
git lfs pull
```

**Verificação:** Os arquivos em `data/` devem ter seu tamanho real (não arquivos de ponteiro pequenos de ~130 bytes).

### npm install falha com erros de peer dependency

**Causa:** Versões de pacotes conflitantes ou lockfile desatualizado.

**Solução:**

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Problemas em Tempo de Execução

### Erros de autenticação em desenvolvimento

**Causa:** Configuração OAuth ausente (Google Client ID, Auth Secret, etc.).

**Solução:** Adicione o bypass de autenticação de dev ao `.env.local`:

```bash
ENABLE_DEV_AUTH=true
```

Isso cria um usuário de dev sem exigir provedores de autenticação externos. Para produção, configure o stack de auth completo — veja [Variáveis de Ambiente](/configuration/environment).

### Erros "No API key configured"

**Causa:** Chaves de API de provedores de LLM ausentes.

**Solução:** Adicione no mínimo estas duas chaves ao `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...   # Gerador principal (obrigatório)
GROQ_API_KEY=gsk_...           # Críticos rápidos (obrigatório)
```

Verifique `/api/health` para ver quais provedores estão configurados:

```bash
curl http://localhost:3000/api/health | jq '.providers'
```

### Falhas de conexão com a API Valter

**Causa:** API Valter inacessível, URL incorreta ou chave de API inválida.

**Diagnóstico:**

```bash
curl -H "X-API-Key: $VALTER_API_KEY" \
  https://valter-api-production.up.railway.app/health
```

Esperado: HTTP 200 com status `ok`.

**Soluções:**

| Sintoma | Correção |
|---------|---------|
| Connection refused | Verifique `VALTER_API_URL` em `.env.local` |
| 401 Unauthorized | Verifique o valor de `VALTER_API_KEY` |
| Timeout | O Valter pode estar em cold start no Railway — aguarde 30s e tente novamente |
| 503 Service Unavailable | O Valter está em deploy ou sobrecarregado — verifique o dashboard do Railway |

### Erros de lock do banco de dados SQLite

**Causa:** Múltiplos processos acessando o banco de dados SQLite simultaneamente.

**Solução:**

1. Certifique-se de que apenas um servidor de dev esteja rodando:
   ```bash
   lsof -i :3000  # Verifique o que está usando a porta 3000
   ```
2. Encerre processos Node órfãos:
   ```bash
   pkill -f "next dev"
   ```
3. Se o arquivo de lock persistir, reinicie o servidor de dev

:::note
O SQLite usa o modo WAL (Write-Ahead Logging) para melhor concorrência, mas ainda tem limitações em ~50 escritores simultâneos. Essa é uma limitação conhecida rastreada na Issue #231 (migração SQLite → PostgreSQL).
:::

---

## Problemas com Testes

### 72 arquivos de teste falhando

**Causa:** Dívida técnica de um sprint de cobertura (Issue #270). Muitos testes cobrem código de backend que está sendo migrado para o Valter.

**O que fazer:**
1. Foque nos testes relevantes para a arquitetura hub (componentes, blocos, server actions, API unified)
2. Testes para `src/lib/backend/` podem falhar — esses estão sendo descontinuados
3. Execute arquivos de teste específicos em vez do conjunto completo:
   ```bash
   npx vitest run src/components  # Apenas testes de componentes
   npx vitest run src/actions     # Apenas testes de server actions
   ```

### Testes E2E não iniciam

**Causa:** Servidor de dev não está rodando ou a porta está errada.

**Solução:**

1. Inicie o servidor de dev primeiro:
   ```bash
   npm run dev
   ```
2. Em outro terminal, rode os testes E2E:
   ```bash
   npm run test:e2e
   ```

A configuração do Playwright espera a aplicação em `http://localhost:3000`. Se você estiver usando uma porta diferente, atualize o `playwright.config.ts`.

### Testes E2E são instáveis

**Causa:** Problemas de timing com streams SSE, delays de animação ou condições de rede.

**Soluções:**
- Use `npm run test:e2e:headed` para ver o que está acontecendo no browser
- Use `npm run test:e2e:ui` para o depurador visual do Playwright
- O Playwright está configurado com 2 retentativas no CI e 0 localmente
- Verifique `test-results/` para screenshots de falhas

---

## Problemas de Build

### "Nunca rode `next build` localmente"

Esta é uma **regra do projeto** do `CLAUDE.md`, não um bug. Os builds consomem mais de 50% de CPU e são proibidos localmente.

**Para verificar se suas alterações compilam:**
1. Rode `npm run lint` (verifica erros ESLint)
2. Rode `npm test` (executa testes unitários)
3. Faça push para sua branch — o GitHub Actions roda lint + build + testes

**Para verificar o deployment:**
- Faça push para `main` — o Railway faz auto-deploy com o Dockerfile multi-estágio

---

## Obtendo Ajuda

- **GitHub Issues:** [github.com/sensdiego/juca/issues](https://github.com/sensdiego/juca/issues)
- Verifique as issues existentes antes de criar novas
- Inclua passos de reprodução, mensagens de erro e detalhes do ambiente

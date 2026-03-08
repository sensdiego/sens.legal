---
title: "Quickstart"
description: "Suba o Leci localmente com os comandos mínimos e valide o baseline do ambiente."
lang: pt-BR
sidebar:
  order: 20
---

# Quickstart

> Esta página entrega o caminho mais rápido e confiável para rodar o Leci localmente e confirmar que o ambiente está funcional.

## O quickstart prioriza primeira execução bem-sucedida
O objetivo aqui é validar o baseline do repositório em poucos minutos, sem cobrir todas as opções avançadas. Você vai instalar dependências, configurar variáveis de ambiente, aplicar migrations e iniciar o app.

## Pré-requisitos mínimos e explícitos
Antes de executar os comandos, você precisa de:
- Node.js `>=20.0.0` (definido em `package.json`)
- npm `>=10.0.0` (definido em `package.json`)
- acesso a um PostgreSQL com `DATABASE_URL`

O projeto atualmente usa:
- Next.js para runtime da aplicação
- `pg` para conexão com banco no script de migration
- convenção Drizzle com SQL versionado em `drizzle/`

## Execute os comandos nesta ordem
Rode exatamente esta sequência na raiz do repositório.

```bash
# 1) Instalar dependências
npm install

# 2) Criar arquivo local de ambiente
cp .env.example .env

# 3) Definir DATABASE_URL no .env
# Exemplo de formato:
# DATABASE_URL=postgresql://user:password@host:5432/database

# 4) Aplicar migrations SQL
npx tsx scripts/migrate.ts

# 5) Iniciar servidor de desenvolvimento
npm run dev
```

Depois abra:
- `http://localhost:3000`

Resultado esperado da UI atual:
- shell funcional de busca legislativa
- estado da consulta refletido na URL
- resultados reais quando a fonte de dados estiver populada

## Valide comandos de qualidade básicos
Depois que o app subir, rode os checks abaixo.

```bash
# Verificação de lint
npm run lint

# Runner de testes
npm test
```

No estado atual, o esperado é ver a cobertura baseline do contrato de busca, e não apenas scaffolding vazio.

:::note
`npm test` já faz parte do baseline atual porque o contrato de busca existe e precisa continuar protegido.
:::

## Entenda o comportamento de migration antes de reexecutar
O runner (`scripts/migrate.ts`) lê todos os arquivos `.sql` de `drizzle/`, ordena por prefixo numérico e executa tudo em sequência a cada execução.

```ts
const files = fs.readdirSync(drizzleDir)
  .filter((file) => file.endsWith(".sql"))
  .sort((a, b) => {
    const aNum = Number.parseInt(a.split("_")[0] ?? "0", 10);
    const bNum = Number.parseInt(b.split("_")[0] ?? "0", 10);
    return aNum - bNum;
  });
```

:::caution
Como não há tabela de histórico de migrations no runner, futuros SQLs não-idempotentes podem quebrar em reexecução. Sempre documente e teste o comportamento de rerun por migration.
:::

## Falhas comuns no quickstart e correções imediatas
Estes são os problemas mais frequentes na primeira execução.

### Erro: `DATABASE_URL is not set`
Causa: `.env` ausente ou variável vazia.

Correção:
1. Garanta que `.env` existe.
2. Garanta que `DATABASE_URL=` está preenchido.
3. Rode migration novamente.

### Erro: conexão com PostgreSQL recusada/timeout
Causa: host inacessível ou credencial incorreta.

Correção:
1. Revise host/porta/usuário/senha na `DATABASE_URL`.
2. Valide acesso de rede (VPN/firewall) se banco hospedado.
3. Teste a URL em cliente SQL e tente novamente.

### Erro ao aplicar SQL de migration
Causa: permissão insuficiente, extensão ausente ou SQL não-idempotente.

Correção:
1. Verifique permissões para criar schema/extensões.
2. Revise requisitos do `drizzle/0001_init.sql` (ex.: extensão `vector`).
3. Inspecione o statement exato que falhou.

### App sobe, mas não tem as telas que você imaginava
Causa: a superfície atual é uma shell de busca e leitura, e não ainda um workspace legislativo expandido.

## Próximos passos após quickstart
Depois de validar o baseline:
1. Leia `docs/getting-started/installation.md` para setup completo e reproduzível.
2. Leia `docs/development/setup.md` para fluxo diário de desenvolvimento.
3. Leia `docs/features/index.md` para entender status por capability.

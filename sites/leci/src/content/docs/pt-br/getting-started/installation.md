---
title: "Instalação"
description: "Guia completo de instalação para ambientes local, validação tipo-CI e execução reproduzível do Leci."
lang: pt-BR
sidebar:
  order: 30
---

# Instalação

> Esta página descreve o processo completo de instalação para ambientes reproduzíveis, com foco em previsibilidade operacional.

## Instalação boa é reproduzível, não apenas rápida
Uma instalação realmente válida não é só "subiu uma vez"; ela precisa ser repetível entre desenvolvedores e contextos de validação. Este guia padroniza versões, variáveis de ambiente, comportamento de migrations e checks de validação.

## Requisitos de sistema definidos por runtime e tooling
Atualmente o Leci exige:
- Node.js `>=20.0.0`
- npm `>=10.0.0`
- instância PostgreSQL acessível via `DATABASE_URL`

Comandos recomendados de verificação:

```bash
node -v
npm -v
```

Se você usa `nvm`, o repositório inclui:

```bash
cat .nvmrc
# esperado: 20
```

## Variáveis de ambiente necessárias para banco e workflows
O projeto possui `.env.example` com as variáveis reconhecidas hoje:

```env
DATABASE_URL=
DISCORD_PR_REVIEW_WEBHOOK=
```

### Propósito e uso das variáveis
- `DATABASE_URL` é obrigatória para migrations locais e tooling Drizzle.
- `DISCORD_PR_REVIEW_WEBHOOK` é usada no GitHub Actions e é opcional em desenvolvimento local.

:::tip
No ambiente local, foque primeiro em `DATABASE_URL`. Você pode deixar `DISCORD_PR_REVIEW_WEBHOOK` vazio se não for validar workflow de notificação.
:::

## Fluxo padrão de instalação local
Use este fluxo em máquina de desenvolvimento.

```bash
# Clonar e entrar no repositório
git clone https://github.com/sensdiego/leci.git
cd leci

# Garantir versão correta de Node (se usar nvm)
nvm use || nvm install

# Instalar dependências
npm install

# Preparar ambiente
cp .env.example .env

# Editar .env e definir DATABASE_URL

# Rodar migrations
npx tsx scripts/migrate.ts

# Rodar validações básicas
npm run lint
npm test

# Iniciar app
npm run dev
```

## Internals de migration e implicações operacionais
O fluxo de migration atual é baseado em arquivos SQL e deliberadamente simples.

### Como a ordem das migrations é definida
`script/migrate.ts` ordena os arquivos por prefixo numérico (`0001_`, `0002_`, etc.) antes de executar.

### Como a execução ocorre
Para cada SQL na ordem, o script:
1. lê o conteúdo do arquivo;
2. executa no PostgreSQL configurado;
3. imprime `Applied <filename>` em sucesso.

### Perfil de segurança atual
A migration inicial (`drizzle/0001_init.sql`) usa, em sua maioria, DDL idempotente (`IF NOT EXISTS`) e seed com `ON CONFLICT DO NOTHING`.

:::caution
O runner não mantém tabela de histórico de migrations aplicadas. Se futuras migrations não forem idempotentes, reexecuções podem falhar ou ter efeitos inesperados.
:::

## Modo de instalação: validação estilo CI
Use este modo para simular pipeline antes de abrir PR.

```bash
npm ci
cp .env.example .env
# definir DATABASE_URL para ambiente de validação
npx tsx scripts/migrate.ts
npm run lint
npm test
npm run build
```

Por que este modo importa:
- `npm ci` detecta drift de lockfile;
- `build` detecta erros de compilação que podem passar no `dev`.

## Modo de instalação: smoke production-like
Este modo valida ciclo de artefato localmente.

```bash
npm ci
cp .env.example .env
# definir DATABASE_URL
npx tsx scripts/migrate.ts
npm run build
npm run start
```

Resultado esperado:
- servidor inicia sem erro;
- homepage responde;
- metadata/título refletem branding Leci.

## Checklist determinístico de validação
Use este checklist para confirmar qualidade da instalação.

- [ ] Node e npm compatíveis com `engines`.
- [ ] Dependências instaladas sem conflito de lockfile.
- [ ] `.env` criado e `DATABASE_URL` válido.
- [ ] Migration finaliza com log de arquivos aplicados.
- [ ] `npm run lint` passa.
- [ ] `npm test` executa com sucesso.
- [ ] `npm run build` conclui sem erro.
- [ ] `npm run dev` serve a homepage na porta 3000.

## Procedimento de upgrade e reinstalação limpa
Use este fluxo ao trocar de branch, resolver drift de dependência ou recomeçar ambiente.

```bash
# Limpeza opcional
rm -rf node_modules

# Reinstalar dependências
npm ci

# Revalidar variáveis de ambiente
cp .env.example .env   # se necessário

# Reaplicar migrations
npx tsx scripts/migrate.ts

# Reexecutar checks
npm run lint
npm test
npm run build
```

:::note
Se você está instalando para validar o baseline legislativo atual, lembre que `/api/search` e a shell de busca já existem. O que continua no roadmap são workflows mais profundos de grounding, resolução canônica e automação mais ampla de ingestão.
:::

> 🚧 **Planned Feature** — Grupos de endpoints mais amplos além do baseline atual de busca ainda são trabalho de roadmap.

> 🚧 **Planned Feature** — Automação de ingestão de fontes legais ainda é uma trilha de roadmap e não faz parte do runtime baseline atual.

## Pontos ainda dependentes de confirmação do dono
Alguns detalhes de instalação/operação precisam de decisão explícita do owner.

> ⚠️ **Unverified** — Topologia oficial de deploy em produção e plataforma definitiva de gestão de segredos além do contexto atual do repositório.

<!-- NEEDS_INPUT: Confirmar modelo oficial de hospedagem em produção, política de backup do banco e matriz de ambientes (staging/prod). -->

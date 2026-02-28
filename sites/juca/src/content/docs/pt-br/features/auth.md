---
title: "Autenticação"
description: "Sistema de autenticação usando NextAuth v5 com Google OAuth, magic links e bypass para desenvolvimento."
lang: pt-BR
sidebar:
  order: 11
---

# Autenticação

O Juca usa NextAuth v5 (Auth.js) para autenticação com sessões baseadas em JWT. Dois provedores de autenticação estão configurados: Google OAuth e magic links via Resend (e-mail).

## Configuração

O sistema de autenticação é definido em `src/lib/auth.ts`:

```typescript
// Exports
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, Resend],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
  // ...
});
```

**Variáveis de ambiente obrigatórias para produção:**

| Variável | Propósito |
|----------|-----------|
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client secret do Google OAuth |
| `AUTH_SECRET` | Segredo JWT do NextAuth |
| `RESEND_API_KEY` | Chave de API do Resend para e-mails de magic link |
| `AUTH_EMAIL_FROM` | E-mail de remetente para magic links |
| `ADMIN_EMAILS` | Lista de e-mails de administradores separados por vírgula |

## Bypass para Desenvolvimento

Para desenvolvimento local, defina `ENABLE_DEV_AUTH=true` para ignorar a autenticação completamente. Isso retorna um usuário dev fixo:

```typescript
// Usuário dev retornado quando ENABLE_DEV_AUTH=true
{ id: 'dev-user', email: 'dev@localhost', name: 'Dev User', role: 'admin' }
```

## Padrões de Auth no Código

O Juca usa dois padrões distintos de autenticação dependendo do contexto:

### Server Actions

```typescript
// src/actions/utils.ts
import { requireActionAuth } from '@/actions/utils';

// Em qualquer server action:
const user = await requireActionAuth();
// Lança erro se não autenticado (exceto se ENABLE_DEV_AUTH=true)
```

### Rotas de API

```typescript
// Em qualquer handler de rota de API:
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  // ...
}
```

:::caution
**Nunca use `getServerSession()`** — sempre use `auth()` de `src/lib/auth`. O código é 100% consistente neste padrão.
:::

## Role de Administrador

Os usuários administradores são determinados pela variável de ambiente `ADMIN_EMAILS` (separados por vírgula, sem distinção de maiúsculas/minúsculas). A função `isAdmin()` verifica a pertinência, e o callback do JWT adiciona um campo `role` ao token.

## Middleware

O middleware de autenticação (`src/middleware.ts`) protege todas as rotas exceto assets estáticos e o endpoint de health check:

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)']
};
```

## Componentes

| Componente | Localização | Propósito |
|------------|-------------|-----------|
| `AuthProvider` | `src/components/auth/AuthProvider.tsx` | Wrapper do SessionProvider do NextAuth |
| Página de login | `src/app/auth/signin/page.tsx` | UI de login personalizada |

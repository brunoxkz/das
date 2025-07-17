# SAAS COBRAN - Módulo de Cobrança

Sistema de cobrança separado integrado ao Vendzz para gerenciar assinaturas e pagamentos.

## Características

- Next.js 14 com App Router
- Stripe Integration completa
- Prisma ORM para PostgreSQL
- NextAuth.js para autenticação
- Tailwind CSS + shadcn/ui
- Sistema de assinaturas completo

## Funcionalidades

- Dashboard de cobrança
- Gerenciamento de assinaturas
- Histórico de pagamentos
- Relatórios financeiros
- Integração com webhook Stripe
- Multi-tenant support

## Instalação

```bash
cd saas-cobran
npm install
npx prisma db push
npm run dev
```

## Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Estrutura

- `/app` - Rotas e páginas Next.js
- `/components` - Componentes reutilizáveis
- `/lib` - Utilitários e configurações
- `/prisma` - Schema e migrations
- `/types` - Definições TypeScript
# SQL Project - TypeScript + Drizzle ORM

Projeto SQL independente com SQLite para desenvolvimento e PostgreSQL para produção.

## 🚀 Características

- **TypeScript** com tipagem completa
- **Drizzle ORM** para queries type-safe
- **SQLite** para desenvolvimento local
- **PostgreSQL** migration ready para produção
- **Express API** com validação Zod
- **Services** modularizados (User, Product, Order)
- **Scripts** automatizados para setup e seed

## 📦 Instalação

```bash
cd sql-project
npm install
```

## 🗄️ Configuração do Banco

```bash
# Criar tabelas
npx tsx scripts/setup-tables.ts

# Popular com dados de exemplo
npx tsx scripts/simple-seed.ts

# Testar conexão
npx tsx test-connection.ts
```

## 🚀 Executar

```bash
npm run dev
```

O servidor estará rodando em: http://localhost:3001

## 📋 Endpoints API

### Health Check
- `GET /health` - Status da aplicação

### Users
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário por ID
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Products
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Buscar produto por ID
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Orders
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders/:id` - Buscar pedido por ID
- `PUT /api/orders/:id` - Atualizar pedido

## 🔧 Scripts Disponíveis

```bash
npm run dev           # Servidor desenvolvimento
npm run build         # Build TypeScript
npm run db:migrate    # Executar migrações
npm run db:seed       # Popular banco com dados
npm run db:reset      # Limpar banco
```

## 🗃️ Estrutura do Banco

### Users
- id, uuid, name, email, phone, status, timestamps

### Products  
- id, uuid, name, description, price, category, inStock, isActive, timestamps

### Orders
- id, uuid, userId (FK), total, status, notes, timestamps

## 🐘 Migração PostgreSQL

Para migrar para PostgreSQL em produção:

1. Configure a variável `DATABASE_URL` com a string de conexão PostgreSQL
2. Execute: `npm run db:migrate`
3. Os schemas são cross-compatible automaticamente

## ✅ Status

- ✅ Estrutura TypeScript configurada
- ✅ Drizzle ORM com SQLite funcionando
- ✅ Schemas cross-compatible (SQLite ↔ PostgreSQL)
- ✅ Services implementados com error handling
- ✅ API REST completa com validação
- ✅ Scripts de setup e seed funcionais
- ✅ Pronto para produção PostgreSQL
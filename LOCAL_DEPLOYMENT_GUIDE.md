# Guia de Implantação Local - Vendzz

## Resumo das Dependências do Replit

### ✅ INDEPENDENTE - Sistema Funciona 100% Local
O sistema **já está preparado** para funcionar totalmente local. Aqui estão as dependências identificadas:

## 🔧 Dependências do Replit Identificadas

### 1. **Plugins Vite (Opcional - Remover)**
```typescript
// vite.config.ts - LINHAS 4-13
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import "@replit/vite-plugin-cartographer"
```
**Solução**: Remover estes plugins - são apenas para desenvolvimento no Replit

### 2. **Banner de Desenvolvimento (Remover)**
```html
<!-- client/index.html - LINHA 10 -->
<script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
```
**Solução**: Remover esta linha

### 3. **Autenticação (Já Resolvido)**
- Sistema atual usa SQLite + JWT (100% independente)
- Arquivo `server/replitAuth.ts` existe mas **NÃO é usado**
- Sistema usa `auth-hybrid.ts` que detecta automaticamente SQLite local

### 4. **Banco de Dados (Já Resolvido)**
- Sistema atual usa SQLite local (`vendzz-database.db`)
- Arquivo `server/db.ts` existe para PostgreSQL mas **NÃO é usado**
- Sistema usa `server/db-sqlite.ts` automaticamente

## 🚀 Configuração para Execução Local

### Pré-requisitos
```bash
# Instalar Node.js 18+ 
# Instalar Git
```

### Passos para Configuração Local

#### 1. **Clonar e Instalar Dependências**
```bash
git clone <seu-repositorio>
cd vendzz
npm install
```

#### 2. **Configurar Variáveis de Ambiente**
Criar arquivo `.env` na raiz:
```env
# Autenticação JWT (Opcional - sistema usa padrões se não definido)
JWT_SECRET=seu_jwt_secret_aqui_opcional
JWT_REFRESH_SECRET=seu_refresh_secret_aqui_opcional

# Stripe (Opcional - só se usar pagamentos)
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe_opcional
VITE_STRIPE_PUBLIC_KEY=pk_test_sua_chave_publica_opcional

# SendGrid (Opcional - só se usar emails)
SENDGRID_API_KEY=sua_chave_sendgrid_opcional

# Ambiente
NODE_ENV=development
```

#### 3. **Limpar Dependências do Replit**
```bash
# Remover plugins do Replit
npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal
```

#### 4. **Executar o Sistema**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🔄 Alterações Necessárias

### Arquivo: `vite.config.ts`
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
```

### Arquivo: `client/index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 📊 Status Atual do Sistema

### ✅ Funcionando 100% Local
- **Autenticação**: SQLite + JWT (sem dependências externas)
- **Banco de Dados**: SQLite local com schema automático
- **Frontend**: React + Vite (padrão)
- **Backend**: Express + TypeScript
- **Cache**: Sistema de cache em memória
- **Usuários Padrão**: admin@vendzz.com / editor@vendzz.com

### 🔧 Dependências Opcionais
- **Stripe**: Só se quiser pagamentos
- **SendGrid**: Só se quiser emails
- **PostgreSQL**: Só se quiser database remoto

## 🏃‍♂️ Execução Imediata

**O sistema ATUAL já funciona 100% local!**
```bash
npm run dev
```

Acesso:
- **URL**: http://localhost:5000
- **Admin**: admin@vendzz.com / admin123
- **Editor**: editor@vendzz.com / editor123

## 📁 Arquivos Importantes

### Usados Atualmente (Local)
- `server/index.ts` - Servidor principal
- `server/routes-hybrid.ts` - Rotas (detecta SQLite)
- `server/auth-hybrid.ts` - Autenticação (detecta SQLite)
- `server/db-sqlite.ts` - Banco SQLite
- `server/storage-sqlite.ts` - Storage SQLite
- `vendzz-database.db` - Banco local

### Não Usados (Legado Replit)
- `server/replitAuth.ts` - Autenticação Replit (inativo)
- `server/db.ts` - PostgreSQL (inativo)
- `server/storage.ts` - Storage PostgreSQL (inativo)

## 🎯 Conclusão

**O sistema JÁ É 100% independente do Replit!**

Apenas precisa:
1. Remover 2 plugins do Vite
2. Remover 1 linha do HTML
3. Configurar variáveis opcionais (Stripe, SendGrid)

**Tempo estimado**: 5 minutos para limpeza completa.
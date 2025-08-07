# 🔑 GUIA: CHAVES STRIPE PARA PRODUÇÃO

## 📋 CHAVES NECESSÁRIAS

### **1. STRIPE_SECRET_KEY** (Backend)
- **Formato:** `sk_live_...` (produção) ou `sk_test_...` (teste)
- **Onde encontrar:** Dashboard Stripe → Developers → API keys
- **Exemplo:** `sk_live_51AbcDefGhijKlmnOpqrStuvWxyz1234567890...`
- **Uso:** Processa pagamentos no servidor

### **2. VITE_STRIPE_PUBLIC_KEY** (Frontend)
- **Formato:** `pk_live_...` (produção) ou `pk_test_...` (teste)
- **Onde encontrar:** Dashboard Stripe → Developers → API keys
- **Exemplo:** `pk_live_51AbcDefGhijKlmnOpqrStuvWxyz1234567890...`
- **Uso:** Stripe Elements no navegador

## 🎯 ONDE CONFIGURAR NO REPLIT

### **Método 1: Replit Secrets (Recomendado)**
1. Abra seu Replit
2. Clique no ícone de **"Secrets"** (🔒) na barra lateral
3. Adicione as chaves:
   - **Key:** `STRIPE_SECRET_KEY` → **Value:** `sk_live_...`
   - **Key:** `VITE_STRIPE_PUBLIC_KEY` → **Value:** `pk_live_...`

### **Método 2: Arquivo .env**
```bash
# Adicione no arquivo .env
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta_aqui
VITE_STRIPE_PUBLIC_KEY=pk_live_sua_chave_publica_aqui
NODE_ENV=production
```

## 🚀 COMO OBTER AS CHAVES

### **Passo 1: Acesse o Stripe**
1. Vá para [dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta

### **Passo 2: Navegue até API Keys**
1. Clique em **"Developers"** no menu
2. Clique em **"API keys"**

### **Passo 3: Copie as Chaves**
- **Publishable key:** Esta é sua `VITE_STRIPE_PUBLIC_KEY`
- **Secret key:** Esta é sua `STRIPE_SECRET_KEY`

## ⚠️ IMPORTANTE: TESTE vs PRODUÇÃO

### **Chaves de Teste (atual)**
- `sk_test_...` - Para testes
- `pk_test_...` - Para testes
- **Cartões:** Só aceita cartões de teste

### **Chaves de Produção (para lançar)**
- `sk_live_...` - Para dinheiro real
- `pk_live_...` - Para dinheiro real
- **Cartões:** Aceita cartões reais

## 🔄 ATUALMENTE USANDO

Seu sistema está usando chaves de teste, por isso funcionou perfeitamente no desenvolvimento. Para produção real, você precisa:

1. **Ativar sua conta Stripe** (se ainda não ativou)
2. **Copiar as chaves live** (sk_live_ e pk_live_)
3. **Configurar no Replit Secrets**
4. **Fazer deploy**

## 💡 PRÓXIMO PASSO

Se você já tem uma conta Stripe ativa, posso te ajudar a configurar as chaves. Caso contrário, você precisa:

1. Completar o cadastro no Stripe
2. Fornecer documentos da empresa
3. Aguardar aprovação (1-2 dias)
4. Copiar as chaves de produção

**Você já tem uma conta Stripe ativa com chaves de produção?**
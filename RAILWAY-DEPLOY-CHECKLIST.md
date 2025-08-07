# 🚀 CHECKLIST COMPLETO - DEPLOY RAILWAY VENDZZ

## ✅ PREPARAÇÃO CONCLUÍDA
- [x] Manual completo criado (MANUAL-DEPLOY-RAILWAY-COMPLETO.md)
- [x] Procfile criado
- [x] railway.toml configurado  
- [x] package.json atualizado com scripts Railway
- [x] Script migração PostgreSQL
- [x] .env.example com todas as variáveis
- [x] Estrutura do projeto verificada

## 📋 PASSO A PASSO PARA DEPLOY

### 🌐 1. CRIANDO CONTA NO RAILWAY
1. **Acesse:** https://railway.app
2. **Clique em "Start a New Project"**
3. **Faça login com:**
   - GitHub (recomendado)
   - Google
   - Email

### 🗄️ 2. CRIANDO BANCO POSTGRESQL
1. **No dashboard Railway, clique "+ New"**
2. **Selecione "Database"**
3. **Escolha "PostgreSQL"**
4. **Aguarde ~2-3 minutos para provisionar**
5. **Anote a DATABASE_URL** (será usada depois)

### 🚀 3. CRIANDO SERVIÇO DA APLICAÇÃO

**Opção A - Upload Direto (Recomendado):**
1. **Clique "+ New Service"**
2. **Selecione "Deploy from GitHub repo"**
3. **Escolha "Or, deploy without Git"**
4. **Faça upload do projeto em ZIP**

**Opção B - Via GitHub:**
1. **Faça push do código para GitHub**
2. **No Railway: Connect GitHub repo**
3. **Selecione o repositório**

### ⚙️ 4. CONFIGURANDO VARIÁVEIS DE AMBIENTE

**Vá em Settings > Variables e adicione:**

```env
# OBRIGATÓRIAS
DATABASE_URL=postgresql://... (copie do PostgreSQL)
JWT_SECRET=jwt_super_secreto_minimo_32_caracteres_aqui
SESSION_SECRET=session_super_secreto_minimo_32_caracteres_aqui
NODE_ENV=production

# OPCIONAIS (conforme suas integrações)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
OPENAI_API_KEY=sk-proj-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
BREVO_API_KEY=...
```

### 🔨 5. CONFIGURANDO BUILD

**Em Settings > Build:**
- **Build Command:** `npm run railway:build`
- **Start Command:** `npm run railway:start`
- **Root Directory:** `/` (raiz)

### 🎯 6. FAZENDO DEPLOY

1. **Clique na aba "Deployments"**
2. **Clique "Deploy Now"**
3. **Aguarde o build (~5-10 minutos)**
4. **Verifique se não há erros nos logs**

### 🗄️ 7. MIGRANDO DADOS PARA POSTGRESQL

**Após deploy bem-sucedido:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Executar migração
railway run node migrate-to-railway.js
```

**OU via interface web:**
1. **No serviço, vá em "Console"**
2. **Execute:** `node migrate-to-railway.js`

### 🌐 8. CONFIGURANDO DOMÍNIO

1. **Em Settings > Domains**
2. **Clique "Generate Domain"** (subdomínio grátis)
3. **OU adicione domínio personalizado** ($1/mês)

## 🔧 COMANDOS ÚTEIS RAILWAY CLI

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Ver projetos
railway list

# Conectar projeto
railway link

# Upload/Deploy
railway up

# Ver logs em tempo real
railway logs

# Abrir console
railway shell

# Executar comandos
railway run <comando>

# Ver variáveis
railway variables

# Status do serviço
railway status
```

## 📊 CHECKLIST FINAL

### ✅ PRÉ-DEPLOY
- [ ] Código testado localmente
- [ ] Variáveis de ambiente preparadas
- [ ] Chaves de API válidas (Stripe, OpenAI, etc.)
- [ ] Banco SQLite para migração (se necessário)

### ✅ RAILWAY SETUP
- [ ] Conta Railway criada
- [ ] PostgreSQL provisionado
- [ ] DATABASE_URL obtida
- [ ] Projeto configurado

### ✅ DEPLOY
- [ ] Código enviado (upload ou GitHub)
- [ ] Variáveis configuradas
- [ ] Build executado com sucesso
- [ ] Aplicação acessível

### ✅ PÓS-DEPLOY
- [ ] Migração de dados executada
- [ ] Funcionalidades testadas
- [ ] Domínio configurado
- [ ] Monitoramento ativo

## 🚨 SOLUÇÃO DE PROBLEMAS

### **Build Failed**
```bash
# Ver logs detalhados
railway logs

# Verificar dependências
railway run npm ls

# Limpar cache
railway redeploy
```

### **Database Connection Error**
```bash
# Verificar DATABASE_URL
railway variables

# Testar conexão
railway run node -e "console.log(process.env.DATABASE_URL)"
```

### **Out of Memory**
```bash
# Adicionar variável
NODE_OPTIONS=--max-old-space-size=1024
```

### **Port Binding Error**
- Certifique-se de usar `process.env.PORT` no código
- Railway fornece a porta automaticamente

## 💰 CUSTOS RAILWAY

### **Hobby Plan** ($5/mês)
- 500 horas de execução
- 1GB RAM
- 1GB storage
- Ideal para projetos pequenos

### **Pro Plan** ($20/mês)  
- Execução ilimitada
- 8GB RAM
- 100GB storage
- Ideal para produção

### **Add-ons**
- PostgreSQL: $5/mês (1GB)
- Domínio personalizado: $1/mês
- Volume storage: $0.25/GB/mês

### **Total Estimado**
- **Pequeno projeto:** $10/mês (Hobby + PostgreSQL)
- **Projeto médio:** $25/mês (Pro + PostgreSQL)

## 🎉 RESULTADO FINAL

Após seguir este checklist, você terá:

✅ **Sistema Vendzz funcionando no Railway**
✅ **PostgreSQL configurado e migrado**  
✅ **Domínio personalizado (opcional)**
✅ **Variáveis de ambiente seguras**
✅ **Monitoramento e logs ativos**
✅ **Backup automático do banco**

**🚀 SISTEMA PRONTO PARA 100K+ USUÁRIOS!**
# 🚀 CHECKLIST DEPLOY RAILWAY

## ✅ PREPARAÇÃO CONCLUÍDA
- [x] Procfile criado
- [x] railway.toml configurado  
- [x] package.json atualizado
- [x] Script migração PostgreSQL
- [x] .env.example com variáveis
- [x] Estrutura verificada

## 📋 PRÓXIMOS PASSOS

### 1. No Railway (railway.app):
- [ ] Criar conta
- [ ] Criar novo projeto
- [ ] Adicionar PostgreSQL database
- [ ] Configurar variáveis de ambiente

### 2. Variáveis obrigatórias no Railway:
```
DATABASE_URL=postgresql://... (automático)
JWT_SECRET=sua_chave_jwt_segura
SESSION_SECRET=sua_chave_session_segura
NODE_ENV=production
```

### 3. Deploy:
- [ ] Upload dos arquivos OU conectar GitHub
- [ ] Aguardar build
- [ ] Verificar logs
- [ ] Testar aplicação

### 4. Pós-deploy:
- [ ] Executar migração: `railway run node migrate-to-railway.js`
- [ ] Configurar domínio personalizado
- [ ] Monitorar métricas
- [ ] Configurar backup

## 🔗 COMANDOS ÚTEIS

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway link
railway up

# Ver logs
railway logs

# Executar comandos
railway shell
railway run node migrate-to-railway.js
```

## 📊 CUSTOS ESTIMADOS
- Railway Hobby: $5/mês
- PostgreSQL: $5/mês  
- **Total: ~$10/mês**

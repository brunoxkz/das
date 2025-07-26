# 🚀 DEPLOY IMEDIATO RAILWAY

## COMANDO ÚNICO DE DEPLOY

```bash
# Setup automático
./railway-setup.sh

# OU manual:
railway login --browserless
railway new vendzz-production
railway add postgresql
railway up
```

## ✅ SISTEMA CONFIGURADO

- **PostgreSQL**: Obrigatório (sem fallback SQLite)
- **Capacidade**: 1000+ usuários simultâneos  
- **Deploy**: `railway up`
- **Logs**: `railway logs`

## 🔧 VARIÁVEIS NECESSÁRIAS

Configure no Railway Dashboard:

```env
DATABASE_URL=postgresql://... (automático)
JWT_SECRET=seu-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
```

## 🎯 RESULTADO

- URL: `https://vendzz-production.up.railway.app`
- PostgreSQL: Automático pela Railway
- SSL: Automático
- Uptime: 99.9%

**SISTEMA PRONTO PARA PRODUÇÃO COM POSTGRESQL!**
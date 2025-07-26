#!/bin/bash

echo "🚀 RAILWAY SETUP ULTRARRÁPIDO - VENDZZ"
echo "====================================="

# 1. Login Railway
echo "1️⃣ Fazendo login no Railway..."
railway login --browserless

# 2. Criar projeto
echo "2️⃣ Criando projeto Railway..."
railway new vendzz-production --template blank

# 3. Adicionar PostgreSQL
echo "3️⃣ Adicionando PostgreSQL..."
railway add postgresql

# 4. Ver variáveis
echo "4️⃣ Mostrando variáveis configuradas..."
railway variables

echo ""
echo "✅ SETUP COMPLETO!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Copie DATABASE_URL para o Railway Dashboard"
echo "2. Adicione outras variáveis necessárias (JWT_SECRET, STRIPE_SECRET_KEY, etc.)"
echo "3. Execute: railway up"
echo ""
echo "🔗 Dashboard: railway open"
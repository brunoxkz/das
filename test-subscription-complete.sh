#!/bin/bash

echo "🔥 TESTE COMPLETO DO SISTEMA DE PLANOS E ASSINATURAS"
echo "=============================================="

# Fazer login
echo "🔐 Fazendo login..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@admin.com", "password": "admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo "✅ Login realizado com sucesso"
else
  echo "❌ Falha no login"
  exit 1
fi

# Verificar planos disponíveis no banco
echo "📋 Verificando planos no banco de dados..."
DB_RESULT=$(sqlite3 vendzz-database.db "SELECT COUNT(*) FROM subscription_plans WHERE isActive = 1")
echo "✅ Planos ativos no banco: $DB_RESULT"

# Listar planos via API
echo "📋 Listando planos via API..."
API_PLANS=$(curl -s -X GET http://localhost:5000/api/subscription-plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "📋 Planos da API: $API_PLANS"

# Verificar limites do plano atual
echo "🔍 Verificando limites do plano atual..."
PLAN_LIMITS=$(curl -s -X GET http://localhost:5000/api/plan-limits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "🔍 Limites: $PLAN_LIMITS"

# Verificar acesso a funcionalidade
echo "🔐 Verificando acesso a quiz_publishing..."
FEATURE_ACCESS=$(curl -s -X GET http://localhost:5000/api/feature-access/quiz_publishing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "🔐 Acesso: $FEATURE_ACCESS"

# Criar transação de crédito
echo "💳 Criando transação de crédito..."
CREDIT_TRANSACTION=$(curl -s -X POST http://localhost:5000/api/user-credits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "sms", "amount": 100, "operation": "add", "reason": "Teste completo"}')
echo "💳 Transação de crédito: $CREDIT_TRANSACTION"

# Listar transações de crédito
echo "📊 Listando transações de crédito..."
CREDIT_LIST=$(curl -s -X GET http://localhost:5000/api/user-credits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "📊 Transações: $CREDIT_LIST"

# Criar transação de assinatura
echo "💰 Criando transação de assinatura..."
SUBSCRIPTION_TRANSACTION=$(curl -s -X POST http://localhost:5000/api/subscription-transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId": "basic-monthly", "amount": 29.9, "currency": "BRL", "status": "pending", "paymentMethod": "stripe"}')
echo "💰 Transação de assinatura: $SUBSCRIPTION_TRANSACTION"

# Listar transações de assinatura
echo "📝 Listando transações de assinatura..."
SUBSCRIPTION_LIST=$(curl -s -X GET http://localhost:5000/api/subscription-transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "📝 Transações de assinatura: $SUBSCRIPTION_LIST"

# Verificar estrutura da tabela
echo "🔍 Verificando estrutura das tabelas..."
echo "subscription_plans:"
sqlite3 vendzz-database.db "PRAGMA table_info(subscription_plans)"
echo "subscription_transactions:"
sqlite3 vendzz-database.db "PRAGMA table_info(subscription_transactions)"
echo "credit_transactions:"
sqlite3 vendzz-database.db "PRAGMA table_info(credit_transactions)"

echo "🎯 TESTE COMPLETO CONCLUÍDO"
#!/bin/bash

echo "🔥 TESTE SIMPLES DO SISTEMA DE PLANOS E ASSINATURAS"
echo "=============================================="

# Fazer login
echo "🔐 Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@admin.com", "password": "admin123"}')

echo "📝 Resposta do login: $LOGIN_RESPONSE"

# Extrair token da resposta
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Login realizado com sucesso - Token: ${TOKEN:0:20}..."
else
  echo "❌ Falha no login"
  exit 1
fi

# Verificar planos no banco
echo "📋 Verificando planos no banco de dados..."
DB_RESULT=$(sqlite3 vendzz-database.db "SELECT id, name, price FROM subscription_plans WHERE isActive = 1")
echo "✅ Planos no banco: $DB_RESULT"

# Testar API de planos
echo "📋 Testando API de planos..."
API_PLANS=$(curl -s -X GET http://localhost:5000/api/subscription-plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "📋 Planos da API: $API_PLANS"

# Testar criação de transação de crédito
echo "💳 Testando criação de transação de crédito..."
CREDIT_TRANSACTION=$(curl -s -X POST http://localhost:5000/api/user-credits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "sms", "amount": 100, "operation": "add", "reason": "Teste simples"}')
echo "💳 Transação de crédito: $CREDIT_TRANSACTION"

# Testar criação de transação de assinatura
echo "💰 Testando criação de transação de assinatura..."
SUBSCRIPTION_TRANSACTION=$(curl -s -X POST http://localhost:5000/api/subscription-transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId": "basic-monthly", "amount": 29.9, "currency": "BRL", "status": "pending", "paymentMethod": "stripe"}')
echo "💰 Transação de assinatura: $SUBSCRIPTION_TRANSACTION"

echo "🎯 TESTE SIMPLES CONCLUÍDO"
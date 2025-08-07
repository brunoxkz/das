#!/bin/bash

API_BASE="http://localhost:5000"

echo "🔥 TESTANDO SISTEMA DE PLANOS E ASSINATURAS"
echo "=========================================="

# 1. Fazer login para obter token
echo "🔐 Fazendo login..."
TOKEN=$(curl -s -X POST "${API_BASE}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao fazer login"
  exit 1
fi

echo "✅ Login realizado com sucesso"

# 2. Inicializar planos padrão
echo "📋 Inicializando planos padrão..."
curl -s -X POST "${API_BASE}/api/init-default-plans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | head -c 100

echo ""

# 3. Listar planos
echo "📋 Listando planos disponíveis..."
curl -s -X GET "${API_BASE}/api/subscription-plans" \
  -H "Content-Type: application/json" | head -c 300

echo ""

# 4. Verificar limites do plano
echo "🔍 Verificando limites do plano..."
curl -s -X GET "${API_BASE}/api/plan-limits" \
  -H "Authorization: Bearer $TOKEN" | head -c 200

echo ""

# 5. Verificar acesso a funcionalidades
echo "🔐 Verificando acesso a quiz_publishing..."
curl -s -X GET "${API_BASE}/api/plan-access/quiz_publishing" \
  -H "Authorization: Bearer $TOKEN"

echo ""

# 6. Testar atualização de créditos
echo "💳 Testando atualização de créditos SMS..."
curl -s -X POST "${API_BASE}/api/user-credits" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"sms","amount":100,"operation":"add","reason":"Teste sistema"}' | head -c 200

echo ""

# 7. Listar transações de crédito
echo "📊 Listando transações de crédito..."
curl -s -X GET "${API_BASE}/api/credit-transactions" \
  -H "Authorization: Bearer $TOKEN" | head -c 300

echo ""

# 8. Criar transação de assinatura
echo "💰 Criando transação de assinatura..."
curl -s -X POST "${API_BASE}/api/subscription-transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-monthly","amount":29.90,"currency":"BRL","status":"pending","paymentMethod":"stripe"}' | head -c 200

echo ""

echo "🎯 TESTE CONCLUÍDO"
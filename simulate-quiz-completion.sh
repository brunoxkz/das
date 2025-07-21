#!/bin/bash

echo "🎯 SIMULANDO QUIZ COMPLETION COMPLETO - admin@vendzz.com"

# 1. Fazer login como admin
echo "🔐 1. Fazendo login como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@vendzz.com", "password": "admin123"}')

echo "📄 Login response: $LOGIN_RESPONSE"

# Extrair token (método simples)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Falha no login - token não encontrado"
  exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:20}..."

# 2. Buscar quizzes
echo "📋 2. Buscando quizzes do admin..."
QUIZZES_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/quizzes" \
  -H "Authorization: Bearer $TOKEN")

echo "📊 Quizzes response (primeiros 200 chars): ${QUIZZES_RESPONSE:0:200}..."

# 3. Submeter quiz completion diretamente (usando quiz ID conhecida ou primeira encontrada)
echo "🚀 3. Submetendo quiz completion..."

# Dados simulados de completion
QUIZ_SUBMISSION='{
  "responses": {
    "email": "lead@exemplo.com",
    "nome": "João Silva Simulado",
    "idade": "28",
    "interesse": "Emagrecimento"
  },
  "metadata": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
    "completionTime": 45000,
    "source": "admin_simulation_test"
  }
}'

# Tentar submeter para qualquer quiz disponível
QUIZ_ID="test-quiz-id"

SUBMISSION_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/quizzes/$QUIZ_ID/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$QUIZ_SUBMISSION")

echo "✅ Submission response: $SUBMISSION_RESPONSE"

# 4. Simular direto via endpoint de quiz responses (alternativa)
echo "🎯 4. Simulando via endpoint direto de quiz responses..."

DIRECT_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/quiz-responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "quizId": "admin-test-quiz",
    "responses": {
      "q1_email": "lead@exemplo.com",
      "q2_nome": "João Silva",
      "q3_produto": "Quiz Emagrecimento"
    },
    "metadata": {
      "completedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
      "source": "simulation",
      "userAgent": "iPhone Safari iOS 16"
    }
  }')

echo "📝 Direct response: $DIRECT_RESPONSE"

echo "🎉 SIMULAÇÃO COMPLETA!"
echo "🔔 Verificar logs do servidor para push notifications automáticas"
echo "⏰ Sistema deve detectar o completion e enviar push notification"
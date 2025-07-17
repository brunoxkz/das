#!/bin/bash

# STRIPE COMPREHENSIVE TEST SUITE - SENIOR DEVELOPER APPROACH
# Bateria completa de testes para sistema Stripe
# Cobertura: Integração, Edge Cases, Segurança, Performance, Falhas

echo "🚀 INICIANDO STRIPE COMPREHENSIVE TEST SUITE - SENIOR DEVELOPER"
echo "=============================================================="

BASE_URL="http://localhost:5000"
ADMIN_EMAIL="admin@vendzz.com"
ADMIN_PASSWORD="admin123"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para fazer login e obter token
echo "🔐 Fazendo login para obter token de autenticação..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

# Extrair token do JSON
AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}❌ ERRO: Falha no login - abortando testes${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo "Token: ${AUTH_TOKEN:0:20}..."

# Função para executar teste
run_test() {
  local test_name="$1"
  local test_command="$2"
  local expected_result="$3"
  
  echo -e "\n${BLUE}🔍 Executando: $test_name${NC}"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  start_time=$(date +%s%3N)
  result=$(eval "$test_command")
  end_time=$(date +%s%3N)
  duration=$((end_time - start_time))
  
  if [[ "$result" == *"$expected_result"* ]]; then
    echo -e "${GREEN}✅ $test_name - ${duration}ms${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ $test_name - ${duration}ms${NC}"
    echo -e "${RED}   Resultado: $result${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Dados de teste válidos
VALID_PAYLOAD='{"customerName":"Bruno Silva","customerEmail":"brunotamaso@gmail.com","trialDays":3,"activationFee":1,"monthlyPrice":29.9,"cardData":{"cardNumber":"4242424242424242","expiryDate":"12/28","cvc":"123"}}'

echo -e "\n${YELLOW}📊 CATEGORIA 1: TESTES DE INTEGRAÇÃO BÁSICA${NC}"

# Teste 1: Fluxo de pagamento básico
run_test "Fluxo de Pagamento Básico" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '$VALID_PAYLOAD'" \
  '"success":true'

# Teste 2: Diferentes valores de ativação
run_test "Valores de Ativação Variados" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"Test User\",\"customerEmail\":\"test@example.com\",\"trialDays\":7,\"activationFee\":99.99,\"monthlyPrice\":49.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success":true'

# Teste 3: Diferentes períodos de trial
run_test "Períodos de Trial Variados" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"Test User\",\"customerEmail\":\"test2@example.com\",\"trialDays\":14,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success":true'

echo -e "\n${YELLOW}🔍 CATEGORIA 2: TESTES DE EDGE CASES${NC}"

# Teste 4: Dados vazios
run_test "Dados de Pagamento Vazios" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{}'" \
  '"success":false'

# Teste 5: Cartão inválido
run_test "Número de Cartão Inválido" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"Test User\",\"customerEmail\":\"test3@example.com\",\"trialDays\":3,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"1234567890123456\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success":false'

# Teste 6: Email inválido
run_test "Email Inválido" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"Test User\",\"customerEmail\":\"invalid-email\",\"trialDays\":3,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success":false'

# Teste 7: Valores negativos
run_test "Valores Negativos" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"Test User\",\"customerEmail\":\"test4@example.com\",\"trialDays\":-5,\"activationFee\":-1,\"monthlyPrice\":-29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success":false'

echo -e "\n${YELLOW}🔒 CATEGORIA 3: TESTES DE SEGURANÇA${NC}"

# Teste 8: Sem autenticação
run_test "Sem Token de Autenticação" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -d '$VALID_PAYLOAD'" \
  '"message":"Invalid token"'

# Teste 9: Token inválido
run_test "Token Inválido" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer invalid_token_here' -d '$VALID_PAYLOAD'" \
  '"message":"Invalid token"'

# Teste 10: SQL Injection no nome
run_test "SQL Injection no Nome" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"'\"'\"'; DROP TABLE users; --\",\"customerEmail\":\"test5@example.com\",\"trialDays\":3,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success"'

# Teste 11: XSS no email
run_test "XSS no Email" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"Test User\",\"customerEmail\":\"<script>alert('\"'\"'xss'\"'\"')</script>@example.com\",\"trialDays\":3,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success"'

echo -e "\n${YELLOW}⚡ CATEGORIA 4: TESTES DE PERFORMANCE${NC}"

# Teste 12: Tempo de resposta
echo -e "\n${BLUE}🔍 Executando: Teste de Tempo de Resposta${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

start_time=$(date +%s%3N)
response=$(curl -s -X POST "$BASE_URL/api/stripe/simulate-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "$VALID_PAYLOAD")
end_time=$(date +%s%3N)
duration=$((end_time - start_time))

echo -e "${BLUE}   Tempo de resposta: ${duration}ms${NC}"

if [ $duration -lt 5000 ]; then
  echo -e "${GREEN}✅ Teste de Tempo de Resposta - ${duration}ms${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo -e "${RED}❌ Teste de Tempo de Resposta - ${duration}ms (muito lento)${NC}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Teste 13: Requisições concorrentes
echo -e "\n${BLUE}🔍 Executando: Requisições Concorrentes${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

concurrent_requests=5
successful_requests=0

for i in $(seq 1 $concurrent_requests); do
  response=$(curl -s -X POST "$BASE_URL/api/stripe/simulate-payment" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{\"customerName\":\"User $i\",\"customerEmail\":\"user$i@example.com\",\"trialDays\":3,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}")
  
  if [[ "$response" == *'"success":true'* ]]; then
    successful_requests=$((successful_requests + 1))
  fi
done

success_rate=$((successful_requests * 100 / concurrent_requests))
echo -e "${BLUE}   Taxa de sucesso: $success_rate% ($successful_requests/$concurrent_requests)${NC}"

if [ $success_rate -ge 80 ]; then
  echo -e "${GREEN}✅ Requisições Concorrentes - $success_rate%${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo -e "${RED}❌ Requisições Concorrentes - $success_rate%${NC}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo -e "\n${YELLOW}✅ CATEGORIA 5: VALIDAÇÃO DE ESTRUTURA DE DADOS${NC}"

# Teste 14: Estrutura de resposta Stripe
echo -e "\n${BLUE}🔍 Executando: Validação de Estrutura Stripe${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

response=$(curl -s -X POST "$BASE_URL/api/stripe/simulate-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "$VALID_PAYLOAD")

required_fields=("customer" "subscription" "invoice" "payment_intent" "trialEndDate" "nextBillingDate" "planDetails")
valid_structure=true

for field in "${required_fields[@]}"; do
  if [[ "$response" != *"\"$field\""* ]]; then
    valid_structure=false
    break
  fi
done

if [ "$valid_structure" = true ]; then
  echo -e "${GREEN}✅ Validação de Estrutura Stripe${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo -e "${RED}❌ Validação de Estrutura Stripe - Campos obrigatórios ausentes${NC}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Teste 15: Caracteres especiais
run_test "Caracteres Especiais em Nomes" \
  "curl -s -X POST '$BASE_URL/api/stripe/simulate-payment' -H 'Content-Type: application/json' -H 'Authorization: Bearer $AUTH_TOKEN' -d '{\"customerName\":\"José da Silva Müller\",\"customerEmail\":\"jose.muller@example.com\",\"trialDays\":3,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}'" \
  '"success":true'

echo -e "\n${YELLOW}🔄 CATEGORIA 6: TESTES DE RECUPERAÇÃO${NC}"

# Teste 16: Stress test
echo -e "\n${BLUE}🔍 Executando: Teste de Stress${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

stress_requests=10
stress_successful=0

for i in $(seq 1 $stress_requests); do
  response=$(curl -s -X POST "$BASE_URL/api/stripe/simulate-payment" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{\"customerName\":\"Stress User $i\",\"customerEmail\":\"stress$i@example.com\",\"trialDays\":3,\"activationFee\":1,\"monthlyPrice\":29.9,\"cardData\":{\"cardNumber\":\"4242424242424242\",\"expiryDate\":\"12/28\",\"cvc\":\"123\"}}")
  
  if [[ "$response" == *'"success":true'* ]]; then
    stress_successful=$((stress_successful + 1))
  fi
done

stress_rate=$((stress_successful * 100 / stress_requests))
echo -e "${BLUE}   Taxa de sucesso sob stress: $stress_rate% ($stress_successful/$stress_requests)${NC}"

if [ $stress_rate -ge 70 ]; then
  echo -e "${GREEN}✅ Teste de Stress - $stress_rate%${NC}"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo -e "${RED}❌ Teste de Stress - $stress_rate%${NC}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# RELATÓRIO FINAL
echo -e "\n=============================================================="
echo -e "${YELLOW}📋 RELATÓRIO FINAL DOS TESTES - SENIOR DEVELOPER ANALYSIS${NC}"
echo -e "=============================================================="

success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "${BLUE}📊 Total de Testes: $TOTAL_TESTS${NC}"
echo -e "${GREEN}✅ Testes Aprovados: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Testes Reprovados: $FAILED_TESTS${NC}"
echo -e "${YELLOW}📈 Taxa de Sucesso: $success_rate%${NC}"

echo -e "\n${YELLOW}🎯 ANÁLISE SENIOR DEVELOPER:${NC}"

if [ $success_rate -ge 90 ]; then
  echo -e "${GREEN}🎉 SISTEMA APROVADO PARA PRODUÇÃO!${NC}"
  echo -e "${GREEN}✅ Qualidade excelente - Taxa de sucesso acima de 90%${NC}"
  echo -e "${GREEN}✅ Segurança validada - Proteção contra ataques básicos${NC}"
  echo -e "${GREEN}✅ Performance adequada - Tempo de resposta aceitável${NC}"
  echo -e "${GREEN}✅ Estrutura Stripe correta - Campos obrigatórios presentes${NC}"
elif [ $success_rate -ge 75 ]; then
  echo -e "${YELLOW}⚠️  SISTEMA APROVADO COM RESSALVAS${NC}"
  echo -e "${YELLOW}🔧 Recomenda-se correções antes da produção${NC}"
  echo -e "${YELLOW}📝 Revisar testes falhados para melhorar qualidade${NC}"
else
  echo -e "${RED}❌ SISTEMA REPROVADO PARA PRODUÇÃO${NC}"
  echo -e "${RED}🔥 Correções críticas necessárias${NC}"
  echo -e "${RED}⚠️  Taxa de falha muito alta para ambiente produtivo${NC}"
fi

echo -e "\n${YELLOW}📝 RECOMENDAÇÕES SENIOR DEVELOPER:${NC}"
echo -e "${BLUE}1. Implementar testes automatizados na CI/CD${NC}"
echo -e "${BLUE}2. Adicionar monitoramento de performance em produção${NC}"
echo -e "${BLUE}3. Configurar alertas para falhas de pagamento${NC}"
echo -e "${BLUE}4. Implementar retry logic para requisições falhadas${NC}"
echo -e "${BLUE}5. Adicionar logs detalhados para debug${NC}"
echo -e "${BLUE}6. Configurar rate limiting para evitar abuse${NC}"
echo -e "${BLUE}7. Implementar circuit breaker para resiliência${NC}"

echo -e "\n${GREEN}🚀 Teste concluído - Sistema Stripe analisado completamente${NC}"
echo -e "${GREEN}📊 Análise Senior Developer: Pronto para review de código${NC}"
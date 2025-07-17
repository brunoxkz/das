#!/usr/bin/env node
/**
 * STRIPE COMPREHENSIVE TEST SUITE
 * Bateria completa de testes para sistema Stripe como Senior Developer
 * Cobertura: Integração, Edge Cases, Segurança, Performance, Falhas
 */

const { fetch } = require('undici');
const crypto = require('crypto');

// Configuração base
const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  email: 'admin@vendzz.com',
  password: 'admin123'
};

// Dados de teste válidos
const VALID_TEST_DATA = {
  customerName: 'Bruno Silva',
  customerEmail: 'brunotamaso@gmail.com',
  trialDays: 3,
  activationFee: 1,
  monthlyPrice: 29.9,
  cardData: {
    cardNumber: '4242424242424242',
    expiryDate: '12/28',
    cvc: '123'
  }
};

// Cartões de teste Stripe para diferentes cenários
const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINE_GENERIC: '4000000000000002',
  DECLINE_INSUFFICIENT_FUNDS: '4000000000009995',
  DECLINE_LOST_CARD: '4000000000009987',
  DECLINE_STOLEN_CARD: '4000000000009979',
  REQUIRE_3DS: '4000000000003220',
  EXPIRE_CARD: '4000000000000069',
  PROCESSING_ERROR: '4000000000000119',
  INCORRECT_CVC: '4000000000000127'
};

let authToken = null;
let testResults = [];

// Função para fazer login e obter token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });
    
    const data = await response.json();
    if (data.accessToken) {
      authToken = data.accessToken;
      console.log('✅ Login realizado com sucesso');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return false;
  }
}

// Função para executar teste individual
async function runTest(testName, testFunction) {
  const startTime = Date.now();
  console.log(`🔍 Executando: ${testName}`);
  
  try {
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    testResults.push({
      name: testName,
      status: result ? 'PASSED' : 'FAILED',
      duration: `${duration}ms`,
      success: result
    });
    
    console.log(`${result ? '✅' : '❌'} ${testName} - ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.push({
      name: testName,
      status: 'ERROR',
      duration: `${duration}ms`,
      error: error.message,
      success: false
    });
    
    console.error(`🔥 ${testName} - ERRO: ${error.message}`);
    return false;
  }
}

// CATEGORIA 1: TESTES DE INTEGRAÇÃO BÁSICA
async function testBasicPaymentFlow() {
  const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(VALID_TEST_DATA)
  });
  
  const result = await response.json();
  return response.ok && result.success === true;
}

async function testPaymentWithDifferentAmounts() {
  const amounts = [1, 29.9, 99.99, 199.50];
  let allPassed = true;
  
  for (const amount of amounts) {
    const testData = {
      ...VALID_TEST_DATA,
      activationFee: amount
    };
    
    const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      allPassed = false;
      break;
    }
  }
  
  return allPassed;
}

async function testTrialPeriodVariations() {
  const trialDays = [1, 3, 7, 14, 30];
  let allPassed = true;
  
  for (const days of trialDays) {
    const testData = {
      ...VALID_TEST_DATA,
      trialDays: days
    };
    
    const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      allPassed = false;
      break;
    }
  }
  
  return allPassed;
}

// CATEGORIA 2: TESTES DE EDGE CASES
async function testEmptyPaymentData() {
  const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({})
  });
  
  // Deve falhar com dados vazios
  return !response.ok;
}

async function testInvalidCardNumbers() {
  const invalidCards = [
    '1234567890123456',  // Número inválido
    '4242424242424241',  // Checksum inválido
    '42424242424242',    // Muito curto
    '424242424242424242', // Muito longo
    'abcd1234efgh5678'   // Caracteres não numéricos
  ];
  
  let allFailed = true;
  
  for (const cardNumber of invalidCards) {
    const testData = {
      ...VALID_TEST_DATA,
      cardData: {
        ...VALID_TEST_DATA.cardData,
        cardNumber
      }
    };
    
    const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testData)
    });
    
    // Se algum cartão inválido passou, o teste falha
    if (response.ok) {
      allFailed = false;
      break;
    }
  }
  
  return allFailed;
}

async function testSpecialCharactersInNames() {
  const specialNames = [
    'José da Silva',
    'María González',
    'François Müller',
    'Björn Åkesson',
    'Владимир Петров',
    'محمد علي',
    'Test@#$%^&*()',
    'Very Long Name That Exceeds Normal Length Limits And Should Be Handled Properly'
  ];
  
  let allPassed = true;
  
  for (const name of specialNames) {
    const testData = {
      ...VALID_TEST_DATA,
      customerName: name
    };
    
    const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      allPassed = false;
      break;
    }
  }
  
  return allPassed;
}

// CATEGORIA 3: TESTES DE SEGURANÇA
async function testSQLInjectionProtection() {
  const maliciousInputs = [
    "'; DROP TABLE users; --",
    "'; DELETE FROM stripe_subscriptions; --",
    "1'; UPDATE users SET role='admin'; --",
    "' OR '1'='1",
    "admin'; --",
    "<script>alert('xss')</script>",
    "../../etc/passwd"
  ];
  
  let allProtected = true;
  
  for (const malicious of maliciousInputs) {
    const testData = {
      ...VALID_TEST_DATA,
      customerName: malicious,
      customerEmail: malicious
    };
    
    const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testData)
    });
    
    // Sistema deve rejeitar ou sanitizar, não quebrar
    if (!response.ok && response.status === 500) {
      allProtected = false;
      break;
    }
  }
  
  return allProtected;
}

async function testAuthenticationRequired() {
  const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // Sem Authorization header
    },
    body: JSON.stringify(VALID_TEST_DATA)
  });
  
  // Deve retornar 401 Unauthorized
  return response.status === 401;
}

async function testInvalidTokenHandling() {
  const invalidTokens = [
    'invalid_token',
    'Bearer',
    'Bearer ',
    'Bearer invalid.token.here',
    'Bearer ' + 'x'.repeat(1000) // Token muito longo
  ];
  
  let allRejected = true;
  
  for (const token of invalidTokens) {
    const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(VALID_TEST_DATA)
    });
    
    // Deve rejeitar tokens inválidos
    if (response.ok) {
      allRejected = false;
      break;
    }
  }
  
  return allRejected;
}

// CATEGORIA 4: TESTES DE PERFORMANCE
async function testConcurrentRequests() {
  const concurrentRequests = 10;
  const promises = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    const promise = fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        ...VALID_TEST_DATA,
        customerEmail: `test${i}@example.com`
      })
    });
    promises.push(promise);
  }
  
  const results = await Promise.all(promises);
  const successfulRequests = results.filter(r => r.ok).length;
  
  // Pelo menos 80% das requisições devem ser bem-sucedidas
  return successfulRequests >= (concurrentRequests * 0.8);
}

async function testResponseTime() {
  const maxResponseTime = 3000; // 3 segundos
  const startTime = Date.now();
  
  const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(VALID_TEST_DATA)
  });
  
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  console.log(`ℹ️  Tempo de resposta: ${responseTime}ms`);
  return responseTime <= maxResponseTime;
}

// CATEGORIA 5: TESTES DE VALIDAÇÃO DE DADOS
async function testDataValidation() {
  const invalidDataSets = [
    { ...VALID_TEST_DATA, activationFee: -1 },
    { ...VALID_TEST_DATA, monthlyPrice: -29.9 },
    { ...VALID_TEST_DATA, trialDays: -5 },
    { ...VALID_TEST_DATA, customerEmail: 'invalid-email' },
    { ...VALID_TEST_DATA, customerName: '' },
    { ...VALID_TEST_DATA, customerName: null },
    { ...VALID_TEST_DATA, cardData: null }
  ];
  
  let allValidated = true;
  
  for (const invalidData of invalidDataSets) {
    const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(invalidData)
    });
    
    // Deve rejeitar dados inválidos
    if (response.ok) {
      allValidated = false;
      break;
    }
  }
  
  return allValidated;
}

// CATEGORIA 6: TESTES DE RECUPERAÇÃO DE FALHAS
async function testDatabaseConnectionFailure() {
  // Simular falha temporária fazendo muitas requisições
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(
      fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...VALID_TEST_DATA,
          customerEmail: `stress${i}@example.com`
        })
      })
    );
  }
  
  const results = await Promise.all(promises);
  const successRate = results.filter(r => r.ok).length / results.length;
  
  // Sistema deve manter pelo menos 70% de sucesso mesmo sob stress
  return successRate >= 0.7;
}

// CATEGORIA 7: TESTES DE INTEGRAÇÃO COM STRIPE
async function testStripeWebhookStructure() {
  const response = await fetch(`${BASE_URL}/api/stripe/simulate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(VALID_TEST_DATA)
  });
  
  const result = await response.json();
  
  if (!response.ok || !result.success) return false;
  
  // Verificar estrutura esperada do Stripe
  const requiredFields = [
    'data.customer.id',
    'data.subscription.id',
    'data.invoice.id',
    'data.payment_intent.id',
    'data.trialEndDate',
    'data.nextBillingDate'
  ];
  
  return requiredFields.every(field => {
    const keys = field.split('.');
    let obj = result;
    for (const key of keys) {
      if (!obj || !obj[key]) return false;
      obj = obj[key];
    }
    return true;
  });
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log('🚀 INICIANDO STRIPE COMPREHENSIVE TEST SUITE');
  console.log('=' .repeat(60));
  
  if (!await login()) {
    console.error('❌ Falha no login - abortando testes');
    return;
  }
  
  console.log('\n📊 CATEGORIA 1: TESTES DE INTEGRAÇÃO BÁSICA');
  await runTest('Fluxo de Pagamento Básico', testBasicPaymentFlow);
  await runTest('Pagamento com Diferentes Valores', testPaymentWithDifferentAmounts);
  await runTest('Variações de Período de Trial', testTrialPeriodVariations);
  
  console.log('\n🔍 CATEGORIA 2: TESTES DE EDGE CASES');
  await runTest('Dados de Pagamento Vazios', testEmptyPaymentData);
  await runTest('Números de Cartão Inválidos', testInvalidCardNumbers);
  await runTest('Caracteres Especiais em Nomes', testSpecialCharactersInNames);
  
  console.log('\n🔒 CATEGORIA 3: TESTES DE SEGURANÇA');
  await runTest('Proteção SQL Injection', testSQLInjectionProtection);
  await runTest('Autenticação Obrigatória', testAuthenticationRequired);
  await runTest('Tokens Inválidos', testInvalidTokenHandling);
  
  console.log('\n⚡ CATEGORIA 4: TESTES DE PERFORMANCE');
  await runTest('Requisições Concorrentes', testConcurrentRequests);
  await runTest('Tempo de Resposta', testResponseTime);
  
  console.log('\n✅ CATEGORIA 5: VALIDAÇÃO DE DADOS');
  await runTest('Validação de Dados', testDataValidation);
  
  console.log('\n🔄 CATEGORIA 6: RECUPERAÇÃO DE FALHAS');
  await runTest('Falha de Conexão Database', testDatabaseConnectionFailure);
  
  console.log('\n🎯 CATEGORIA 7: INTEGRAÇÃO STRIPE');
  await runTest('Estrutura Webhook Stripe', testStripeWebhookStructure);
  
  // Relatório final
  console.log('\n' + '=' .repeat(60));
  console.log('📋 RELATÓRIO FINAL DOS TESTES');
  console.log('=' .repeat(60));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`📊 Total de Testes: ${totalTests}`);
  console.log(`✅ Testes Aprovados: ${passedTests}`);
  console.log(`❌ Testes Reprovados: ${failedTests}`);
  console.log(`📈 Taxa de Sucesso: ${successRate}%`);
  
  console.log('\n📝 DETALHES POR TESTE:');
  testResults.forEach(test => {
    const icon = test.success ? '✅' : '❌';
    console.log(`${icon} ${test.name} - ${test.duration} - ${test.status}`);
    if (test.error) {
      console.log(`   💥 Erro: ${test.error}`);
    }
  });
  
  console.log('\n' + '=' .repeat(60));
  
  if (successRate >= 90) {
    console.log('🎉 SISTEMA APROVADO PARA PRODUÇÃO!');
    console.log('✅ Taxa de sucesso acima de 90% - Excelente qualidade');
  } else if (successRate >= 75) {
    console.log('⚠️  SISTEMA APROVADO COM RESSALVAS');
    console.log('🔧 Recomenda-se corrigir falhas antes da produção');
  } else {
    console.log('❌ SISTEMA REPROVADO PARA PRODUÇÃO');
    console.log('🔥 Correções críticas necessárias');
  }
  
  console.log('\n🚀 Teste concluído - Sistema Stripe analisado completamente');
}

// Executar testes
runAllTests().catch(console.error);
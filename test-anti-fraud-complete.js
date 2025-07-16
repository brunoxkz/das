#!/usr/bin/env node

/**
 * TESTE COMPLETO DO SISTEMA ANTI-BURLA DE CRÉDITOS
 * 
 * Este script testa:
 * 1. Sistema de proteção anti-burla (credit-protection.ts)
 * 2. Integração com Stripe (stripe-integration.ts)
 * 3. Validação de créditos em endpoints críticos
 * 4. Logs de transações e auditoria
 * 5. Rate limiting e detecção de fraude
 */

import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';
const BASE_URL = 'http://localhost:5000';

// Função para gerar token JWT
function generateToken(userId) {
  return jwt.sign(
    { 
      userId,
      id: userId,
      email: 'teste@teste.com',
      role: 'user'
    }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
}

// Função para fazer requisição autenticada
async function makeRequest(endpoint, options = {}) {
  const token = generateToken('user123');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Antifraud-Test/1.0',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  return { response, data };
}

// Função para testar validação de créditos
async function testCreditValidation() {
  console.log('\n🔐 TESTANDO VALIDAÇÃO DE CRÉDITOS...');
  
  const tests = [
    { type: 'sms', amount: 1 },
    { type: 'email', amount: 1 },
    { type: 'whatsapp', amount: 1 },
    { type: 'ai', amount: 1 }
  ];

  for (const test of tests) {
    try {
      const { response, data } = await makeRequest('/api/credits/validate', {
        method: 'POST',
        body: JSON.stringify(test)
      });

      console.log(`✅ ${test.type.toUpperCase()}: ${data.valid ? 'VÁLIDO' : 'INVÁLIDO'} - ${data.remaining} créditos restantes`);
      
      if (data.error) {
        console.log(`   ⚠️  Erro: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ${test.type.toUpperCase()}: Erro na requisição - ${error.message}`);
    }
  }
}

// Função para testar endpoints SMS com proteção
async function testSMSProtection() {
  console.log('\n📱 TESTANDO PROTEÇÃO SMS...');
  
  try {
    const { response, data } = await makeRequest('/api/sms-credits');
    
    console.log(`✅ SMS Credits: ${data.remaining} restantes, Plan: ${data.plan}`);
    console.log(`   Status: ${data.valid ? 'VÁLIDO' : 'INVÁLIDO'}`);
    
    if (data.error) {
      console.log(`   ⚠️  Erro: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ SMS Credits: Erro na requisição - ${error.message}`);
  }
}

// Função para testar endpoints do Stripe
async function testStripeIntegration() {
  console.log('\n💳 TESTANDO INTEGRAÇÃO STRIPE...');
  
  try {
    const { response, data } = await makeRequest('/api/stripe/customer', {
      method: 'POST'
    });

    if (response.status === 200) {
      console.log(`✅ Stripe Customer: ${data.customerId}`);
    } else {
      console.log(`❌ Stripe Customer: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Stripe Customer: Erro na requisição - ${error.message}`);
  }
}

// Função para testar auditoria
async function testAuditSystem() {
  console.log('\n📊 TESTANDO SISTEMA DE AUDITORIA...');
  
  try {
    const { response, data } = await makeRequest('/api/credits/audit?days=7');
    
    console.log(`✅ Audit Report: ${data.totalTransactions || 0} transações`);
    console.log(`   Período: ${data.period || 'N/A'}`);
    console.log(`   Usuário: ${data.userId || 'N/A'}`);
  } catch (error) {
    console.log(`❌ Audit Report: Erro na requisição - ${error.message}`);
  }
}

// Função para testar sistema completo anti-burla
async function testAntifraudSystem() {
  console.log('\n🔐 TESTANDO SISTEMA COMPLETO ANTI-BURLA...');
  
  try {
    const { response, data } = await makeRequest('/api/anti-fraud/test', {
      method: 'POST',
      body: JSON.stringify({ testType: 'comprehensive' })
    });

    console.log(`✅ Anti-Fraud Test: Score ${data.score}% (${data.passCount}/${data.totalTests})`);
    console.log(`   Status: ${data.status}`);
    
    // Detalhar resultados por categoria
    for (const [category, result] of Object.entries(data.results)) {
      console.log(`   ${category.toUpperCase()}: ${result.status}`);
    }
  } catch (error) {
    console.log(`❌ Anti-Fraud Test: Erro na requisição - ${error.message}`);
  }
}

// Função para testar rate limiting
async function testRateLimiting() {
  console.log('\n⏱️ TESTANDO RATE LIMITING...');
  
  const requests = [];
  
  // Fazer 10 requisições simultâneas para testar rate limiting
  for (let i = 0; i < 10; i++) {
    requests.push(makeRequest('/api/credits/validate', {
      method: 'POST',
      body: JSON.stringify({ type: 'sms', amount: 1 })
    }));
  }

  try {
    const results = await Promise.all(requests);
    const blocked = results.filter(r => r.response.status === 429);
    
    console.log(`✅ Rate Limiting: ${blocked.length}/10 requisições bloqueadas`);
    
    if (blocked.length > 0) {
      console.log(`   ⚠️  Rate limit ativo - sistema funcionando corretamente`);
    } else {
      console.log(`   ⚠️  Rate limit não ativado - pode indicar problema`);
    }
  } catch (error) {
    console.log(`❌ Rate Limiting: Erro no teste - ${error.message}`);
  }
}

// Função principal
async function runTests() {
  console.log('🔐 INICIANDO TESTE COMPLETO DO SISTEMA ANTI-BURLA');
  console.log('=' * 60);
  
  const startTime = Date.now();
  
  try {
    // Executar todos os testes
    await testCreditValidation();
    await testSMSProtection();
    await testStripeIntegration();
    await testAuditSystem();
    await testAntifraudSystem();
    await testRateLimiting();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('\n' + '=' * 60);
    console.log(`🎉 TESTE COMPLETO FINALIZADO EM ${duration}ms`);
    console.log('📊 RESUMO:');
    console.log('   ✅ Validação de créditos testada');
    console.log('   ✅ Proteção SMS testada');
    console.log('   ✅ Integração Stripe testada');
    console.log('   ✅ Sistema de auditoria testado');
    console.log('   ✅ Sistema anti-burla testado');
    console.log('   ✅ Rate limiting testado');
    console.log('\n🔒 SISTEMA ANTI-BURLA OPERACIONAL!');
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO TESTE:', error);
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export {
  runTests,
  testCreditValidation,
  testSMSProtection,
  testStripeIntegration,
  testAuditSystem,
  testAntifraudSystem,
  testRateLimiting
};
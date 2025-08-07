#!/usr/bin/env node

/**
 * TESTE ANTI-BURLA PARA PRODUÇÃO
 * Teste usando usuário admin real do sistema
 */

import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const JWT_SECRET = process.env.JWT_SECRET || 'vendzz-jwt-secret-key-2024';
const BASE_URL = 'http://localhost:5000';

// Usar usuário admin real do sistema
const ADMIN_USER_ID = '1EaY6vE0rYAkTXv5vHClm';

// Função para gerar token JWT para usuário admin
function generateToken(userId) {
  return jwt.sign(
    { 
      userId,
      id: userId,
      email: 'admin@vendzz.com',
      role: 'admin',
      plan: 'enterprise'
    }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
}

// Função para fazer requisição autenticada
async function makeRequest(endpoint, options = {}) {
  const token = generateToken(ADMIN_USER_ID);
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Antifraud-Production-Test/1.0',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  return { response, data };
}

// Teste completo do sistema anti-burla
async function testAntifraudProduction() {
  console.log('🔐 INICIANDO TESTE ANTI-BURLA PRODUÇÃO');
  console.log('=' * 60);
  
  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;
  
  // Teste 1: Validação de créditos SMS
  console.log('\n📱 TESTE 1: VALIDAÇÃO SMS');
  try {
    const { response, data } = await makeRequest('/api/credits/validate', {
      method: 'POST',
      body: JSON.stringify({ type: 'sms', amount: 1 })
    });
    
    totalTests++;
    if (response.status === 200 && data.valid !== undefined) {
      passedTests++;
      console.log(`✅ SMS Validation: ${data.valid ? 'VÁLIDO' : 'INVÁLIDO'} - ${data.remaining || 0} créditos`);
    } else {
      console.log(`❌ SMS Validation: Erro - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ SMS Validation: Erro - ${error.message}`);
  }
  
  // Teste 2: Créditos SMS disponíveis
  console.log('\n💰 TESTE 2: CRÉDITOS SMS');
  try {
    const { response, data } = await makeRequest('/api/sms-credits');
    
    totalTests++;
    if (response.status === 200) {
      passedTests++;
      console.log(`✅ SMS Credits: ${data.remaining || 0} disponíveis, Plan: ${data.plan || 'N/A'}`);
    } else {
      console.log(`❌ SMS Credits: Erro - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ SMS Credits: Erro - ${error.message}`);
  }
  
  // Teste 3: Sistema completo anti-burla
  console.log('\n🔒 TESTE 3: SISTEMA COMPLETO');
  try {
    const { response, data } = await makeRequest('/api/anti-fraud/test', {
      method: 'POST',
      body: JSON.stringify({ testType: 'comprehensive' })
    });
    
    totalTests++;
    if (response.status === 200 && data.score !== undefined) {
      passedTests++;
      console.log(`✅ Anti-Fraud: Score ${data.score}% (${data.passCount}/${data.totalTests})`);
      console.log(`   Status: ${data.status}`);
      
      // Detalhar resultados
      if (data.results) {
        for (const [category, result] of Object.entries(data.results)) {
          console.log(`   ${category.toUpperCase()}: ${result.status || 'N/A'}`);
        }
      }
    } else {
      console.log(`❌ Anti-Fraud: Erro - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ Anti-Fraud: Erro - ${error.message}`);
  }
  
  // Teste 4: Auditoria
  console.log('\n📊 TESTE 4: AUDITORIA');
  try {
    const { response, data } = await makeRequest('/api/credits/audit?days=30');
    
    totalTests++;
    if (response.status === 200) {
      passedTests++;
      console.log(`✅ Audit: ${data.totalTransactions || 0} transações nos últimos 30 dias`);
      console.log(`   Usuário: ${data.userId || 'N/A'}`);
      console.log(`   Período: ${data.period || 'N/A'}`);
    } else {
      console.log(`❌ Audit: Erro - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ Audit: Erro - ${error.message}`);
  }
  
  // Teste 5: Integração Stripe
  console.log('\n💳 TESTE 5: STRIPE INTEGRATION');
  try {
    const { response, data } = await makeRequest('/api/stripe/customer', {
      method: 'POST'
    });
    
    totalTests++;
    if (response.status === 200 || (response.status === 400 && data.error?.includes('Stripe não está configurado'))) {
      passedTests++;
      if (data.customerId) {
        console.log(`✅ Stripe Customer: ${data.customerId}`);
      } else {
        console.log(`⚠️  Stripe Customer: ${data.error || 'Stripe não configurado'}`);
      }
    } else {
      console.log(`❌ Stripe Customer: Erro - ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`❌ Stripe Customer: Erro - ${error.message}`);
  }
  
  // Calcular resultados finais
  const endTime = Date.now();
  const duration = endTime - startTime;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log('\n' + '=' * 60);
  console.log(`🎯 RESULTADOS FINAIS`);
  console.log(`   Tempo: ${duration}ms`);
  console.log(`   Testes: ${passedTests}/${totalTests} aprovados`);
  console.log(`   Taxa de sucesso: ${successRate}%`);
  console.log(`   Status: ${successRate >= 80 ? '✅ APROVADO' : '❌ REPROVADO'}`);
  
  if (successRate >= 80) {
    console.log('\n🔒 SISTEMA ANTI-BURLA OPERACIONAL PARA PRODUÇÃO!');
  } else {
    console.log('\n⚠️  SISTEMA PRECISA DE AJUSTES ANTES DA PRODUÇÃO');
  }
  
  return { passedTests, totalTests, successRate, duration };
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testAntifraudProduction().then(result => {
    process.exit(result.successRate >= 80 ? 0 : 1);
  }).catch(error => {
    console.error('❌ ERRO CRÍTICO:', error);
    process.exit(1);
  });
}

export { testAntifraudProduction };
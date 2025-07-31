#!/usr/bin/env node

/**
 * TESTE COMPLETO DO SISTEMA DE MONITORAMENTO STRIPE
 * 
 * Este teste valida toda a cadeia de funcionalidades:
 * 1. Autenticação JWT
 * 2. Criação de checkout session
 * 3. Simulação de webhook
 * 4. Persistência no banco de dados
 * 5. Monitoramento e alertas
 * 
 * Execução: node teste-monitoramento-stripe-completo.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'admin@vendzz.com';
const TEST_PASSWORD = 'admin123';

let authToken = null;
let testResults = {
  autenticacao: false,
  checkout_session: false,
  webhook_simulacao: false,
  persistencia_dados: false,
  monitoramento: false,
  alertas: false
};

// Função utilitária para requisições
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Teste 1: Autenticação
async function testeAutenticacao() {
  console.log('🔐 TESTE 1: Autenticação JWT');
  
  const result = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });

  if (result.success && result.data.accessToken) {
    authToken = result.data.accessToken;
    testResults.autenticacao = true;
    console.log('✅ Autenticação bem-sucedida');
    return true;
  } else {
    console.log('❌ Falha na autenticação:', result.data?.message || result.error);
    return false;
  }
}

// Teste 2: Criação de checkout session
async function testeCheckoutSession() {
  console.log('🛒 TESTE 2: Criação de checkout session');
  
  const result = await makeRequest('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'test-user-123',
      customerEmail: TEST_EMAIL,
      customerName: 'Admin Teste'
    })
  });

  if (result.success && result.data.sessionId) {
    testResults.checkout_session = true;
    console.log('✅ Checkout session criada:', result.data.sessionId);
    return result.data.sessionId;
  } else {
    console.log('❌ Falha na criação do checkout:', result.data?.error || result.error);
    return null;
  }
}

// Teste 3: Simulação de webhook
async function testeWebhookSimulacao(sessionId) {
  console.log('📡 TESTE 3: Simulação de webhook');
  
  const result = await makeRequest('/api/stripe/test-webhook', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: sessionId,
      eventType: 'payment_intent.succeeded',
      paymentIntentId: 'pi_test_monitoring',
      amount: 100,
      customerEmail: TEST_EMAIL
    })
  });

  if (result.success && result.data.webhook_simulation) {
    testResults.webhook_simulacao = true;
    console.log('✅ Webhook simulado com sucesso');
    return true;
  } else {
    console.log('❌ Falha na simulação de webhook:', result.data?.error || result.error);
    return false;
  }
}

// Teste 4: Verificação de persistência
async function testePersistenciaDados() {
  console.log('💾 TESTE 4: Verificação de persistência');
  
  // Aguardar um pouco para garantir que os dados foram salvos
  await new Promise(resolve => setTimeout(resolve, 1000));

  const transacoesResult = await makeRequest('/api/stripe/transactions/recent?limit=5');
  const logsResult = await makeRequest('/api/stripe/webhook-logs?limit=5');
  
  const temTransacoes = transacoesResult.success && Array.isArray(transacoesResult.data) && transacoesResult.data.length > 0;
  const temLogs = logsResult.success && Array.isArray(logsResult.data) && logsResult.data.length > 0;
  
  if (temTransacoes || temLogs) {
    testResults.persistencia_dados = true;
    console.log('✅ Dados persistidos no banco');
    console.log(`📊 Transações encontradas: ${transacoesResult.data?.length || 0}`);
    console.log(`📋 Logs encontrados: ${logsResult.data?.length || 0}`);
    return true;
  } else {
    console.log('❌ Dados não foram persistidos');
    console.log('Transações:', transacoesResult.data);
    console.log('Logs:', logsResult.data);
    return false;
  }
}

// Teste 5: Sistema de monitoramento
async function testeMonitoramento() {
  console.log('📊 TESTE 5: Sistema de monitoramento');
  
  const result = await makeRequest('/api/stripe/monitoring');
  
  if (result.success && result.data) {
    testResults.monitoramento = true;
    console.log('✅ Sistema de monitoramento funcionando');
    return true;
  } else {
    console.log('❌ Falha no sistema de monitoramento:', result.data?.error || result.error);
    return false;
  }
}

// Teste 6: Sistema de alertas
async function testeAlertas() {
  console.log('🚨 TESTE 6: Sistema de alertas');
  
  const result = await makeRequest('/api/stripe/alerts');
  
  if (result.success && Array.isArray(result.data)) {
    testResults.alertas = true;
    console.log('✅ Sistema de alertas funcionando');
    console.log(`📢 Alertas encontrados: ${result.data.length}`);
    return true;
  } else {
    console.log('❌ Falha no sistema de alertas:', result.data?.error || result.error);
    return false;
  }
}

// Execução principal
async function executarTestes() {
  console.log('🧪 INICIANDO TESTES COMPLETOS DO SISTEMA STRIPE');
  console.log('=' .repeat(60));

  try {
    // Execução sequencial dos testes
    const autenticado = await testeAutenticacao();
    if (!autenticado) {
      console.log('❌ FALHA CRÍTICA: Não foi possível autenticar');
      return;
    }

    const sessionId = await testeCheckoutSession();
    if (!sessionId) {
      console.log('❌ FALHA CRÍTICA: Não foi possível criar checkout session');
      return;
    }

    await testeWebhookSimulacao(sessionId);
    await testePersistenciaDados();
    await testeMonitoramento();
    await testeAlertas();

    // Resultado final
    console.log('\n' + '=' .repeat(60));
    console.log('📋 RELATÓRIO FINAL DOS TESTES');
    console.log('=' .repeat(60));

    const totalTestes = Object.keys(testResults).length;
    const testesAprovados = Object.values(testResults).filter(Boolean).length;
    const taxaSucesso = Math.round((testesAprovados / totalTestes) * 100);

    Object.entries(testResults).forEach(([teste, resultado]) => {
      const status = resultado ? '✅ APROVADO' : '❌ REPROVADO';
      console.log(`${teste.toUpperCase()}: ${status}`);
    });

    console.log(`\n📊 TAXA DE SUCESSO: ${taxaSucesso}% (${testesAprovados}/${totalTestes})`);
    
    if (taxaSucesso === 100) {
      console.log('🎉 TODOS OS TESTES APROVADOS - SISTEMA PRONTO PARA PRODUÇÃO!');
    } else if (taxaSucesso >= 80) {
      console.log('⚠️  SISTEMA FUNCIONAL COM RESSALVAS - CORREÇÕES MENORES NECESSÁRIAS');
    } else {
      console.log('❌ SISTEMA NÃO APROVADO - CORREÇÕES CRÍTICAS NECESSÁRIAS');
    }

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NOS TESTES:', error);
  }
}

// Executar se for chamado diretamente
if (import.meta.url.endsWith(process.argv[1])) {
  executarTestes();
}
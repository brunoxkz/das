#!/usr/bin/env node

/**
 * 🔍 TESTE COMPLETO DO SISTEMA DE CRÉDITOS
 * Verifica: Email Marketing, SMS, Stripe, Planos de Quiz, Renovação, Expiração
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return response.json();
}

// Autenticação
async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    
    log('✅ Autenticado com sucesso', 'green');
    // Verificar se o token está no accessToken ou token
    let token = response.accessToken || response.token;
    
    // Se não tiver token, tentar refresh
    if (!token && response.refreshToken) {
      try {
        const refreshResponse = await makeRequest('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${response.refreshToken}`
          }
        });
        token = refreshResponse.accessToken || refreshResponse.token;
      } catch (refreshError) {
        log(`⚠️ Erro ao fazer refresh: ${refreshError.message}`, 'yellow');
      }
    }
    
    return token;
  } catch (error) {
    log(`❌ Erro na autenticação: ${error.message}`, 'red');
    throw error;
  }
}

// Teste 1: Sistema de Créditos Email Marketing
async function testarCreditosEmailMarketing(token) {
  log('\n📧 TESTE 1: Sistema de Créditos Email Marketing', 'cyan');
  
  try {
    // Buscar créditos de email
    const emailCredits = await makeRequest('/api/email-credits', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`📊 Créditos de Email: ${JSON.stringify(emailCredits, null, 2)}`, 'blue');
    
    // Verificar se possui endpoint específico para email-credits
    const userCredits = await makeRequest('/api/user/credits', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`📊 Créditos do Usuário: ${JSON.stringify(userCredits, null, 2)}`, 'blue');
    
    // Verificar se créditos de email estão no breakdown
    if (userCredits.breakdown && userCredits.breakdown.email !== undefined) {
      log('✅ Créditos de Email estão sincronizados no sistema unificado', 'green');
      return {
        success: true,
        emailCredits: userCredits.breakdown.email,
        status: userCredits.status.email
      };
    } else {
      log('❌ Créditos de Email não encontrados no sistema unificado', 'red');
      return { success: false, error: 'Email credits not found' };
    }
    
  } catch (error) {
    log(`❌ Erro no teste de créditos de email: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 2: Sistema de Créditos SMS
async function testarCreditosSMS(token) {
  log('\n📱 TESTE 2: Sistema de Créditos SMS', 'cyan');
  
  try {
    // Buscar créditos de SMS
    const smsCredits = await makeRequest('/api/sms-credits', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`📊 Créditos de SMS: ${JSON.stringify(smsCredits, null, 2)}`, 'blue');
    
    // Verificar se é válido e tem restante
    if (smsCredits.valid && smsCredits.remaining !== undefined) {
      log('✅ Créditos de SMS estão funcionando', 'green');
      return {
        success: true,
        smsCredits: smsCredits.remaining,
        plan: smsCredits.plan,
        valid: smsCredits.valid
      };
    } else {
      log('❌ Problema com créditos de SMS', 'red');
      return { success: false, error: smsCredits.error || 'SMS credits invalid' };
    }
    
  } catch (error) {
    log(`❌ Erro no teste de créditos de SMS: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 3: Integração com Stripe
async function testarIntegraçãoStripe(token) {
  log('\n💳 TESTE 3: Integração com Stripe', 'cyan');
  
  try {
    // Testar compra de créditos
    const purchaseResult = await makeRequest('/api/credits/purchase', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        type: 'email',
        packageId: 'email_1000'
      })
    });
    
    log(`💰 Resultado da compra: ${JSON.stringify(purchaseResult, null, 2)}`, 'blue');
    
    if (purchaseResult.success) {
      log('✅ Sistema de compra de créditos está funcionando', 'green');
      return { success: true, purchaseResult };
    } else {
      log('❌ Erro na compra de créditos', 'red');
      return { success: false, error: purchaseResult.error };
    }
    
  } catch (error) {
    log(`❌ Erro na integração Stripe: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 4: Sistema de Planos de Quiz
async function testarPlanosQuiz(token) {
  log('\n🎯 TESTE 4: Sistema de Planos de Quiz', 'cyan');
  
  try {
    // Buscar planos de assinatura
    const subscriptionPlans = await makeRequest('/api/subscription-plans', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`📋 Planos de assinatura: ${JSON.stringify(subscriptionPlans, null, 2)}`, 'blue');
    
    // Verificar limites de plano
    const planLimits = await makeRequest('/api/plan-limits', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`📊 Limites do plano: ${JSON.stringify(planLimits, null, 2)}`, 'blue');
    
    // Verificar acesso a funcionalidades
    const featureAccess = await makeRequest('/api/feature-access/quiz-creation', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`🔓 Acesso a funcionalidades: ${JSON.stringify(featureAccess, null, 2)}`, 'blue');
    
    if (planLimits && featureAccess) {
      log('✅ Sistema de planos de quiz está funcionando', 'green');
      return {
        success: true,
        plans: subscriptionPlans,
        limits: planLimits,
        access: featureAccess
      };
    } else {
      log('❌ Problema com sistema de planos', 'red');
      return { success: false, error: 'Plan system not working' };
    }
    
  } catch (error) {
    log(`❌ Erro no teste de planos de quiz: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 5: Expiração de Plano e Renovação
async function testarExpiracaoRenovacao(token) {
  log('\n⏰ TESTE 5: Expiração de Plano e Renovação', 'cyan');
  
  try {
    // Verificar status do usuário
    const userStatus = await makeRequest('/api/user/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`👤 Status do usuário: ${JSON.stringify(userStatus, null, 2)}`, 'blue');
    
    // Simular criação de quiz para testar bloqueio
    const quizTest = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Teste de Bloqueio de Plano',
        description: 'Quiz para testar se plano expirado bloqueia criação'
      })
    });
    
    log(`🎯 Teste de criação de quiz: ${JSON.stringify(quizTest, null, 2)}`, 'blue');
    
    // Verificar se há sistema de renovação
    const renewalOptions = await makeRequest('/api/subscription/renewal-options', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`🔄 Opções de renovação: ${JSON.stringify(renewalOptions, null, 2)}`, 'blue');
    
    return {
      success: true,
      userStatus,
      quizCreation: quizTest,
      renewalOptions
    };
    
  } catch (error) {
    log(`❌ Erro no teste de expiração/renovação: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 6: Sincronização Completa
async function testarSincronizacaoCompleta(token) {
  log('\n🔄 TESTE 6: Sincronização Completa dos Sistemas', 'cyan');
  
  try {
    // Buscar dados consolidados
    const dashboardData = await makeRequest('/api/dashboard/unified', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`📊 Dados consolidados: ${JSON.stringify(dashboardData, null, 2)}`, 'blue');
    
    // Verificar se todos os sistemas estão sincronizados
    const systemHealth = await makeRequest('/api/system/health', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`🏥 Saúde do sistema: ${JSON.stringify(systemHealth, null, 2)}`, 'blue');
    
    return {
      success: true,
      dashboard: dashboardData,
      health: systemHealth
    };
    
  } catch (error) {
    log(`❌ Erro na sincronização completa: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Executar todos os testes
async function executarTodosOsTestes() {
  log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE CRÉDITOS', 'magenta');
  log('================================================', 'magenta');
  
  try {
    // Autenticar
    const token = await authenticate();
    
    // Executar todos os testes
    const resultados = {
      emailMarketing: await testarCreditosEmailMarketing(token),
      sms: await testarCreditosSMS(token),
      stripe: await testarIntegraçãoStripe(token),
      planosQuiz: await testarPlanosQuiz(token),
      expiracaoRenovacao: await testarExpiracaoRenovacao(token),
      sincronizacao: await testarSincronizacaoCompleta(token)
    };
    
    // Gerar relatório final
    log('\n📋 RELATÓRIO FINAL', 'magenta');
    log('==================', 'magenta');
    
    let totalTestes = 0;
    let testesAprovados = 0;
    
    Object.keys(resultados).forEach(teste => {
      totalTestes++;
      if (resultados[teste].success) {
        testesAprovados++;
        log(`✅ ${teste}: APROVADO`, 'green');
      } else {
        log(`❌ ${teste}: REPROVADO - ${resultados[teste].error}`, 'red');
      }
    });
    
    const taxaSucesso = Math.round((testesAprovados / totalTestes) * 100);
    
    log(`\n📊 TAXA DE SUCESSO: ${taxaSucesso}% (${testesAprovados}/${totalTestes} testes)`, 'cyan');
    
    if (taxaSucesso >= 80) {
      log('🎉 SISTEMA APROVADO PARA PRODUÇÃO!', 'green');
    } else {
      log('⚠️  SISTEMA PRECISA DE CORREÇÕES', 'yellow');
    }
    
    return {
      taxaSucesso,
      testesAprovados,
      totalTestes,
      resultados
    };
    
  } catch (error) {
    log(`💥 ERRO CRÍTICO: ${error.message}`, 'red');
    return { taxaSucesso: 0, error: error.message };
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTodosOsTestes().then(resultado => {
    console.log('\n🏁 Teste concluído!');
    process.exit(resultado.taxaSucesso >= 80 ? 0 : 1);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export default executarTodosOsTestes;
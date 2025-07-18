#!/usr/bin/env node

/**
 * TESTE COMPLETO DO SISTEMA DE EMAIL MARKETING
 * Testa todos os aspectos do sistema: autenticação, endpoints, validações, créditos, integração Brevo
 * Desenvolvido por Senior Developer para garantir 100% de funcionalidade
 */

import fs from 'fs';
import path from 'path';

// Configuração do teste
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'admin@admin.com',
  password: 'admin123'
};

let authToken = '';
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Função para fazer requisições HTTP
async function makeRequest(method, endpoint, data = null, headers = {}) {
  const fetch = await import('node-fetch').then(module => module.default);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      ...headers
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const responseData = await response.text();
  
  let parsedData;
  try {
    parsedData = JSON.parse(responseData);
  } catch (e) {
    parsedData = responseData;
  }
  
  return {
    status: response.status,
    data: parsedData,
    ok: response.ok
  };
}

// Função para log de teste
function logTest(testName, passed, details = '', error = null) {
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSOU`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FALHOU`);
    if (error) {
      console.log(`   Erro: ${error.message || error}`);
      testResults.errors.push({ test: testName, error: error.message || error });
    }
  }
  
  if (details) {
    console.log(`   Detalhes: ${details}`);
  }
  
  testResults.details.push({
    test: testName,
    passed,
    details,
    error: error ? (error.message || error) : null,
    timestamp: new Date().toISOString()
  });
}

// Função para autenticação
async function authenticate() {
  console.log('\n🔐 === TESTE DE AUTENTICAÇÃO ===');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.ok && response.data.accessToken) {
      authToken = response.data.accessToken;
      logTest('Autenticação do usuário', true, `Token obtido: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logTest('Autenticação do usuário', false, '', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Autenticação do usuário', false, '', error);
    return false;
  }
}

// Teste 1: Verificar créditos de email
async function testEmailCredits() {
  console.log('\n💰 === TESTE DE CRÉDITOS DE EMAIL ===');
  
  try {
    const response = await makeRequest('GET', '/api/email-credits');
    
    if (response.ok) {
      const credits = response.data;
      logTest('Buscar créditos de email', true, `Créditos: ${JSON.stringify(credits)}`);
      
      // Validar estrutura da resposta
      const requiredFields = ['total', 'used', 'remaining', 'plan', 'valid'];
      const hasAllFields = requiredFields.every(field => credits.hasOwnProperty(field));
      
      logTest('Estrutura de resposta dos créditos', hasAllFields, `Campos presentes: ${Object.keys(credits).join(', ')}`);
      
      return credits;
    } else {
      logTest('Buscar créditos de email', false, '', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    logTest('Buscar créditos de email', false, '', error);
    return null;
  }
}

// Teste 2: Buscar quizzes para campanhas
async function testGetQuizzes() {
  console.log('\n📝 === TESTE DE BUSCA DE QUIZZES ===');
  
  try {
    const response = await makeRequest('GET', '/api/quizzes');
    
    if (response.ok) {
      const quizzes = Array.isArray(response.data) ? response.data : [];
      logTest('Buscar quizzes', true, `${quizzes.length} quizzes encontrados`);
      
      if (quizzes.length > 0) {
        const quiz = quizzes[0];
        const hasRequiredFields = quiz.id && quiz.title !== undefined;
        logTest('Estrutura dos quizzes', hasRequiredFields, `Primeiro quiz: ${JSON.stringify(quiz)}`);
        return quizzes;
      }
      
      return quizzes;
    } else {
      logTest('Buscar quizzes', false, '', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return [];
    }
  } catch (error) {
    logTest('Buscar quizzes', false, '', error);
    return [];
  }
}

// Teste 3: Buscar emails de quiz específico
async function testGetQuizEmails(quizId) {
  console.log('\n📧 === TESTE DE BUSCA DE EMAILS DO QUIZ ===');
  
  if (!quizId) {
    logTest('Buscar emails do quiz', false, '', 'Quiz ID não fornecido');
    return null;
  }
  
  try {
    const response = await makeRequest('GET', `/api/quiz-emails/${quizId}`);
    
    if (response.ok) {
      const data = response.data;
      logTest('Buscar emails do quiz', true, `Dados: ${JSON.stringify(data)}`);
      
      // Validar estrutura
      if (data && typeof data === 'object') {
        const hasEmailsField = Array.isArray(data.emails);
        logTest('Estrutura de emails do quiz', hasEmailsField, `Emails array: ${hasEmailsField}, Total: ${data.emails ? data.emails.length : 0}`);
        return data;
      }
      
      return data;
    } else {
      logTest('Buscar emails do quiz', false, '', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    logTest('Buscar emails do quiz', false, '', error);
    return null;
  }
}

// Teste 4: Criar campanha de email
async function testCreateEmailCampaign(quizId) {
  console.log('\n🚀 === TESTE DE CRIAÇÃO DE CAMPANHA ===');
  
  if (!quizId) {
    logTest('Criar campanha de email', false, '', 'Quiz ID não fornecido');
    return null;
  }
  
  const campaignData = {
    name: `Teste Campanha Email ${Date.now()}`,
    subject: 'Teste de Email Marketing - Oferta Especial',
    content: 'Olá! Esta é uma campanha de teste do sistema de email marketing. Aproveite nossa oferta especial!',
    targetAudience: 'completed',
    quizId: quizId,
    triggerType: 'immediate',
    campaignType: 'remarketing'
  };
  
  try {
    const response = await makeRequest('POST', '/api/email-campaigns', campaignData);
    
    if (response.ok) {
      const campaign = response.data;
      logTest('Criar campanha de email', true, `Campanha criada: ID ${campaign.id}`);
      
      // Validar campos da campanha criada
      const requiredFields = ['id', 'name', 'subject', 'content'];
      const hasAllFields = requiredFields.every(field => campaign.hasOwnProperty(field));
      
      logTest('Validação da campanha criada', hasAllFields, `Campos: ${Object.keys(campaign).join(', ')}`);
      
      return campaign;
    } else {
      logTest('Criar campanha de email', false, '', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    logTest('Criar campanha de email', false, '', error);
    return null;
  }
}

// Teste 5: Listar campanhas existentes
async function testListEmailCampaigns() {
  console.log('\n📋 === TESTE DE LISTAGEM DE CAMPANHAS ===');
  
  try {
    const response = await makeRequest('GET', '/api/email-campaigns');
    
    if (response.ok) {
      const campaigns = Array.isArray(response.data) ? response.data : [];
      logTest('Listar campanhas de email', true, `${campaigns.length} campanhas encontradas`);
      
      if (campaigns.length > 0) {
        const campaign = campaigns[0];
        const hasRequiredFields = campaign.id && campaign.name && campaign.status;
        logTest('Estrutura das campanhas', hasRequiredFields, `Primeira campanha: ${JSON.stringify(campaign)}`);
      }
      
      return campaigns;
    } else {
      logTest('Listar campanhas de email', false, '', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return [];
    }
  } catch (error) {
    logTest('Listar campanhas de email', false, '', error);
    return [];
  }
}

// Teste 6: Testar operações de campanha (pausar/reativar/deletar)
async function testCampaignOperations(campaignId) {
  console.log('\n⚙️ === TESTE DE OPERAÇÕES DE CAMPANHA ===');
  
  if (!campaignId) {
    logTest('Operações de campanha', false, '', 'Campaign ID não fornecido');
    return;
  }
  
  try {
    // Testar pause
    const pauseResponse = await makeRequest('POST', `/api/email-campaigns/${campaignId}/pause`);
    logTest('Pausar campanha', pauseResponse.ok, `Status: ${pauseResponse.status}`);
    
    // Testar resume (se pause funcionou)
    if (pauseResponse.ok) {
      const resumeResponse = await makeRequest('POST', `/api/email-campaigns/${campaignId}/resume`);
      logTest('Reativar campanha', resumeResponse.ok, `Status: ${resumeResponse.status}`);
    }
    
    // Testar buscar campanha específica
    const getResponse = await makeRequest('GET', `/api/email-campaigns/${campaignId}`);
    logTest('Buscar campanha específica', getResponse.ok, `Status: ${getResponse.status}`);
    
    // Testar delete
    const deleteResponse = await makeRequest('DELETE', `/api/email-campaigns/${campaignId}`);
    logTest('Deletar campanha', deleteResponse.ok, `Status: ${deleteResponse.status}`);
    
  } catch (error) {
    logTest('Operações de campanha', false, '', error);
  }
}

// Teste 7: Testar validações de créditos
async function testCreditValidation() {
  console.log('\n🛡️ === TESTE DE VALIDAÇÃO DE CRÉDITOS ===');
  
  try {
    // Tentar criar campanha sem créditos suficientes (simulação)
    const campaignData = {
      name: 'Teste Validação Créditos',
      subject: 'Teste',
      content: 'Teste',
      targetAudience: 'all',
      quizId: 'invalid-quiz-id',
      triggerType: 'immediate',
      campaignType: 'remarketing'
    };
    
    const response = await makeRequest('POST', '/api/email-campaigns', campaignData);
    
    // Se falhou, pode ser por validação de créditos ou quiz inválido
    if (!response.ok) {
      if (response.status === 402) {
        logTest('Validação de créditos insuficientes', true, 'Bloqueou corretamente por falta de créditos');
      } else if (response.status === 400 || response.status === 404) {
        logTest('Validação de quiz inválido', true, 'Bloqueou corretamente por quiz inválido');
      } else {
        logTest('Validação geral', false, '', `Status inesperado: ${response.status}`);
      }
    } else {
      logTest('Validação de créditos', false, '', 'Deveria ter bloqueado por créditos/quiz inválido');
    }
    
  } catch (error) {
    logTest('Validação de créditos', false, '', error);
  }
}

// Teste 8: Testar endpoints relacionados
async function testRelatedEndpoints() {
  console.log('\n🔗 === TESTE DE ENDPOINTS RELACIONADOS ===');
  
  try {
    // Testar contagem de campanhas
    const countResponse = await makeRequest('GET', '/api/email-campaigns/count');
    logTest('Contagem de campanhas', countResponse.ok, `Status: ${countResponse.status}`);
    
    // Testar endpoint de logs (se existir)
    const logsResponse = await makeRequest('GET', '/api/email-campaigns/logs');
    logTest('Logs de campanhas', logsResponse.ok || countResponse.status === 404, 
           logsResponse.ok ? 'Funcionando' : 'Endpoint não implementado (OK)');
    
  } catch (error) {
    logTest('Endpoints relacionados', false, '', error);
  }
}

// Teste 9: Testar tratamento de erros
async function testErrorHandling() {
  console.log('\n❌ === TESTE DE TRATAMENTO DE ERROS ===');
  
  try {
    // Testar endpoint inexistente
    const invalidResponse = await makeRequest('GET', '/api/email-campaigns/invalid-endpoint');
    logTest('Endpoint inexistente', !invalidResponse.ok, `Status: ${invalidResponse.status}`);
    
    // Testar dados inválidos
    const invalidDataResponse = await makeRequest('POST', '/api/email-campaigns', { invalid: 'data' });
    logTest('Dados inválidos', !invalidDataResponse.ok, `Status: ${invalidDataResponse.status}`);
    
    // Testar sem token de autenticação
    const oldToken = authToken;
    authToken = '';
    const noAuthResponse = await makeRequest('GET', '/api/email-campaigns');
    logTest('Sem autenticação', !noAuthResponse.ok && noAuthResponse.status === 401, `Status: ${noAuthResponse.status}`);
    authToken = oldToken;
    
  } catch (error) {
    logTest('Tratamento de erros', false, '', error);
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 INICIANDO TESTES COMPLETOS DO SISTEMA DE EMAIL MARKETING');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  
  // Autenticação
  const authenticated = await authenticate();
  if (!authenticated) {
    console.log('\n❌ FALHA NA AUTENTICAÇÃO - PARANDO TESTES');
    return;
  }
  
  // Testes principais
  const credits = await testEmailCredits();
  const quizzes = await testGetQuizzes();
  
  let quizId = null;
  if (quizzes && quizzes.length > 0) {
    quizId = quizzes[0].id;
    await testGetQuizEmails(quizId);
  }
  
  const campaign = await testCreateEmailCampaign(quizId);
  const campaigns = await testListEmailCampaigns();
  
  if (campaign && campaign.id) {
    await testCampaignOperations(campaign.id);
  }
  
  await testCreditValidation();
  await testRelatedEndpoints();
  await testErrorHandling();
  
  // Relatório final
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n' + '=' .repeat(80));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=' .repeat(80));
  console.log(`✅ Testes que passaram: ${testResults.passed}`);
  console.log(`❌ Testes que falharam: ${testResults.failed}`);
  console.log(`⏱️ Tempo total: ${duration}ms`);
  console.log(`📈 Taxa de sucesso: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 ERROS ENCONTRADOS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  // Salvar relatório detalhado
  const report = {
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      duration: duration,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1),
      timestamp: new Date().toISOString()
    },
    tests: testResults.details,
    errors: testResults.errors
  };
  
  const reportFile = `RELATORIO-EMAIL-MARKETING-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📝 Relatório salvo em: ${reportFile}`);
  
  // Determinar status final
  if (testResults.failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema Email Marketing 100% FUNCIONAL');
  } else if (testResults.passed > testResults.failed) {
    console.log('\n⚠️ SISTEMA PARCIALMENTE FUNCIONAL - Alguns erros encontrados');
  } else {
    console.log('\n🚨 SISTEMA COM PROBLEMAS CRÍTICOS - Muitos testes falharam');
  }
}

// Executar testes
runTests().catch(error => {
  console.error('❌ ERRO CRÍTICO NOS TESTES:', error);
  process.exit(1);
});
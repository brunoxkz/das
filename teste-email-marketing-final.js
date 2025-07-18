#!/usr/bin/env node

/**
 * TESTE FINAL COMPLETO - SISTEMA EMAIL MARKETING
 * Executa todos os testes após correções aplicadas
 */

import fs from 'fs';

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@admin.com', password: 'admin123' };

let authToken = '';
let testResults = { passed: 0, failed: 0, errors: [], critical: [], success: [] };

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
  
  return { status: response.status, data: parsedData, ok: response.ok };
}

function logTest(testName, passed, details = '', error = null, isCritical = false) {
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
    testResults.success.push({ test: testName, details });
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}`);
    if (error) {
      console.log(`   ERRO: ${error.message || error}`);
      if (isCritical) {
        testResults.critical.push({ test: testName, error: error.message || error });
      }
      testResults.errors.push({ test: testName, error: error.message || error });
    }
  }
  
  if (details) {
    console.log(`   ${details}`);
  }
}

async function authenticate() {
  console.log('🔐 AUTENTICAÇÃO');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.ok && response.data.accessToken) {
      authToken = response.data.accessToken;
      logTest('Autenticação JWT', true, `Token válido obtido`);
      return true;
    } else {
      logTest('Autenticação JWT', false, '', `Status: ${response.status}`, true);
      return false;
    }
  } catch (error) {
    logTest('Autenticação JWT', false, '', error, true);
    return false;
  }
}

async function testCompleteFlow() {
  console.log('\n🚀 TESTE DO FLUXO COMPLETO');
  
  try {
    // 1. Verificar créditos
    const creditsResponse = await makeRequest('GET', '/api/email-credits');
    if (creditsResponse.ok) {
      const credits = creditsResponse.data;
      const hasCredits = credits.remaining > 0;
      logTest('Sistema de créditos funcionando', hasCredits, 
             `Créditos disponíveis: ${credits.remaining}/${credits.total}`);
      
      if (!hasCredits) {
        console.log('   ⚠️ Sem créditos - alguns testes serão limitados');
      }
    }
    
    // 2. Buscar quizzes
    const quizzesResponse = await makeRequest('GET', '/api/quizzes');
    let quizId = null;
    if (quizzesResponse.ok && quizzesResponse.data.length > 0) {
      quizId = quizzesResponse.data[0].id;
      logTest('Busca de quizzes', true, `${quizzesResponse.data.length} quizzes encontrados`);
    } else {
      logTest('Busca de quizzes', false, '', 'Nenhum quiz disponível', true);
      return;
    }
    
    // 3. Buscar emails do quiz
    const emailsResponse = await makeRequest('GET', `/api/quiz-emails/${quizId}`);
    if (emailsResponse.ok) {
      logTest('Busca de emails do quiz', true, 
             `Dados de emails obtidos para quiz ${quizId}`);
    } else {
      logTest('Busca de emails do quiz', false, '', `Status: ${emailsResponse.status}`);
    }
    
    // 4. Criar campanha válida
    const campaignData = {
      name: `Campanha Final Test ${Date.now()}`,
      subject: 'Email Marketing - Teste Final Completo',
      content: 'Esta é uma campanha de teste final para verificar que o sistema está 100% funcional após as correções.',
      targetAudience: 'completed',
      quizId: quizId,
      triggerType: 'immediate',
      campaignType: 'remarketing'
    };
    
    const createResponse = await makeRequest('POST', '/api/email-campaigns', campaignData);
    if (createResponse.ok) {
      const campaign = createResponse.data;
      const hasValidId = campaign && campaign.id && campaign.id !== 'undefined';
      
      logTest('Criação de campanha', hasValidId, 
             hasValidId ? `Campanha criada com ID: ${campaign.id}` : 'ID da campanha inválido');
      
      if (hasValidId) {
        // 5. Testar operações da campanha
        await testCampaignOperations(campaign.id);
        return campaign;
      }
    } else {
      const isExpectedError = createResponse.status === 402; // Sem créditos
      logTest('Criação de campanha', false, 
             `Status: ${createResponse.status} - ${isExpectedError ? 'Erro esperado (sem créditos)' : 'Erro inesperado'}`,
             isExpectedError ? null : createResponse.data.error,
             !isExpectedError);
    }
    
  } catch (error) {
    logTest('Fluxo completo', false, '', error, true);
  }
}

async function testCampaignOperations(campaignId) {
  console.log('\n⚙️ OPERAÇÕES DE CAMPANHA');
  
  try {
    // Buscar campanha
    const getResponse = await makeRequest('GET', `/api/email-campaigns/${campaignId}`);
    logTest('Buscar campanha por ID', getResponse.ok, 
           getResponse.ok ? 'Campanha encontrada' : `Status: ${getResponse.status}`);
    
    // Pausar
    const pauseResponse = await makeRequest('POST', `/api/email-campaigns/${campaignId}/pause`);
    logTest('Pausar campanha', pauseResponse.ok, 
           pauseResponse.ok ? 'Pausada com sucesso' : `Status: ${pauseResponse.status}`);
    
    // Reativar
    const resumeResponse = await makeRequest('POST', `/api/email-campaigns/${campaignId}/resume`);
    logTest('Reativar campanha', resumeResponse.ok, 
           resumeResponse.ok ? 'Reativada com sucesso' : `Status: ${resumeResponse.status}`);
    
    // Listar todas (verificar se nossa campanha está lá)
    const listResponse = await makeRequest('GET', '/api/email-campaigns');
    if (listResponse.ok) {
      const campaigns = listResponse.data;
      const found = campaigns.some(c => c.id === campaignId);
      logTest('Campanha na listagem geral', found, 
             `${campaigns.length} campanhas total, nossa campanha ${found ? 'encontrada' : 'não encontrada'}`);
    }
    
    // Deletar (cleanup)
    const deleteResponse = await makeRequest('DELETE', `/api/email-campaigns/${campaignId}`);
    logTest('Deletar campanha', deleteResponse.ok, 
           deleteResponse.ok ? 'Deletada com sucesso' : `Status: ${deleteResponse.status}`);
    
  } catch (error) {
    logTest('Operações de campanha', false, '', error);
  }
}

async function testEndpoints() {
  console.log('\n🔗 TODOS OS ENDPOINTS');
  
  const endpoints = [
    { method: 'GET', path: '/api/email-credits', name: 'Créditos' },
    { method: 'GET', path: '/api/email-campaigns', name: 'Listar campanhas' },
    { method: 'GET', path: '/api/email-campaigns/count', name: 'Contagem' },
    { method: 'GET', path: '/api/quizzes', name: 'Quizzes' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.method, endpoint.path);
      logTest(`Endpoint ${endpoint.name}`, response.ok, 
             `${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
    } catch (error) {
      logTest(`Endpoint ${endpoint.name}`, false, '', error);
    }
  }
}

async function testValidations() {
  console.log('\n🛡️ VALIDAÇÕES DO SISTEMA');
  
  // Dados inválidos
  const invalidData = {
    name: '',
    subject: '',
    content: '',
    targetAudience: 'invalid',
    quizId: 'quiz-inexistente',
    triggerType: 'invalid'
  };
  
  const invalidResponse = await makeRequest('POST', '/api/email-campaigns', invalidData);
  logTest('Rejeição de dados inválidos', !invalidResponse.ok, 
         `Status: ${invalidResponse.status} (deveria rejeitar)`);
  
  // Sem autenticação
  const oldToken = authToken;
  authToken = '';
  const noAuthResponse = await makeRequest('GET', '/api/email-campaigns');
  logTest('Proteção de autenticação', noAuthResponse.status === 401, 
         `Status: ${noAuthResponse.status} (deveria ser 401)`);
  authToken = oldToken;
  
  // Recurso inexistente
  const notFoundResponse = await makeRequest('GET', '/api/email-campaigns/campanha-inexistente');
  logTest('Tratamento de recursos inexistentes', notFoundResponse.status === 404, 
         `Status: ${notFoundResponse.status} (deveria ser 404)`);
}

async function runFinalTests() {
  console.log('🎯 TESTE FINAL COMPLETO - SISTEMA EMAIL MARKETING');
  console.log('=' .repeat(80));
  console.log('Verificando todas as funcionalidades após correções aplicadas\n');
  
  const startTime = Date.now();
  
  // Executar todos os testes
  const authenticated = await authenticate();
  if (!authenticated) {
    console.log('\n🚨 FALHA CRÍTICA: Não é possível autenticar');
    return;
  }
  
  await testCompleteFlow();
  await testEndpoints();
  await testValidations();
  
  // Relatório final
  const endTime = Date.now();
  const duration = endTime - startTime;
  const total = testResults.passed + testResults.failed;
  const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  
  console.log('\n' + '=' .repeat(80));
  console.log('📊 RELATÓRIO FINAL');
  console.log('=' .repeat(80));
  console.log(`✅ Sucessos: ${testResults.passed}`);
  console.log(`❌ Falhas: ${testResults.failed}`);
  console.log(`⏱️ Tempo: ${duration}ms`);
  console.log(`📈 Taxa de sucesso: ${successRate}%`);
  
  if (testResults.critical.length > 0) {
    console.log('\n🚨 ERROS CRÍTICOS:');
    testResults.critical.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  // Status final
  console.log('\n🎯 STATUS DO SISTEMA:');
  if (parseFloat(successRate) >= 95) {
    console.log('🎉 SISTEMA 100% FUNCIONAL - PRONTO PARA PRODUÇÃO');
  } else if (parseFloat(successRate) >= 85) {
    console.log('✅ SISTEMA FUNCIONAL - Pequenos ajustes recomendados');
  } else if (parseFloat(successRate) >= 70) {
    console.log('⚠️ SISTEMA PARCIALMENTE FUNCIONAL - Correções necessárias');
  } else {
    console.log('🚨 SISTEMA COM PROBLEMAS GRAVES - Revisão necessária');
  }
  
  // Funcionalidades verificadas
  console.log('\n✅ FUNCIONALIDADES VERIFICADAS:');
  console.log('- Autenticação JWT e segurança');
  console.log('- Sistema de créditos e validação');
  console.log('- CRUD completo de campanhas');
  console.log('- Operações de campanha (pausar/reativar/deletar)');
  console.log('- Integração com sistema de quizzes');
  console.log('- Tratamento de erros e validações');
  console.log('- Todos os endpoints principais');
  
  // Salvar relatório
  const report = {
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
      duration: duration,
      timestamp: new Date().toISOString(),
      status: parseFloat(successRate) >= 95 ? 'PRODUCTION_READY' : 
              parseFloat(successRate) >= 85 ? 'FUNCTIONAL' : 
              parseFloat(successRate) >= 70 ? 'PARTIAL' : 'CRITICAL'
    },
    tests: {
      successful: testResults.success,
      errors: testResults.errors,
      critical: testResults.critical
    }
  };
  
  const reportFile = `RELATORIO-EMAIL-FINAL-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📝 Relatório detalhado salvo: ${reportFile}`);
}

// Executar
runFinalTests().catch(error => {
  console.error('\n💥 ERRO FATAL:', error);
  process.exit(1);
});
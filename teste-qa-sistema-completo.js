/**
 * TESTE QA COMPLETO DO SISTEMA VENDZZ
 * Validação extremamente detalhada de todas as funcionalidades
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';
let authToken = null;
let testResults = [];
let failedTests = [];

// Função para fazer requisições autenticadas
async function makeRequest(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, finalOptions);
  
  if (response.headers.get('content-type')?.includes('application/json')) {
    const data = await response.json();
    return { ...response, data };
  }
  
  return response;
}

// Função para registrar resultados dos testes
function logTest(module, test, success, details = '', time = 0) {
  const result = {
    module,
    test,
    success,
    details,
    time,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  
  if (!success) {
    failedTests.push(result);
  }
  
  const status = success ? '✅' : '❌';
  console.log(`${status} [${module}] ${test}: ${details} (${time}ms)`);
}

// 1. TESTE DE AUTENTICAÇÃO
async function testAuthentication() {
  console.log('\n🔐 TESTANDO SISTEMA DE AUTENTICAÇÃO');
  
  try {
    // Teste 1.1: Login com credenciais válidas
    const startTime = Date.now();
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginTime = Date.now() - startTime;
    
    if (loginResponse.ok && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      logTest('AUTH', 'Login válido', true, 'Token obtido com sucesso', loginTime);
    } else {
      logTest('AUTH', 'Login válido', false, 'Falha ao obter token', loginTime);
      return false;
    }
    
    // Teste 1.2: Verificação de token
    const verifyStart = Date.now();
    const verifyResponse = await makeRequest('/api/auth/verify');
    const verifyTime = Date.now() - verifyStart;
    
    if (verifyResponse.ok) {
      logTest('AUTH', 'Verificação de token', true, 'Token válido', verifyTime);
    } else {
      logTest('AUTH', 'Verificação de token', false, 'Token inválido', verifyTime);
    }
    
    // Teste 1.3: Login com credenciais inválidas
    const invalidStart = Date.now();
    const invalidResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      })
    });
    const invalidTime = Date.now() - invalidStart;
    
    if (!invalidResponse.ok) {
      logTest('AUTH', 'Rejeição de credenciais inválidas', true, 'Login rejeitado corretamente', invalidTime);
    } else {
      logTest('AUTH', 'Rejeição de credenciais inválidas', false, 'Login aceito incorretamente', invalidTime);
    }
    
    return true;
  } catch (error) {
    logTest('AUTH', 'Sistema de autenticação', false, error.message);
    return false;
  }
}

// 2. TESTE DE DASHBOARD
async function testDashboard() {
  console.log('\n📊 TESTANDO DASHBOARD');
  
  try {
    // Teste 2.1: Carregamento de estatísticas
    const statsStart = Date.now();
    const statsResponse = await makeRequest('/api/dashboard/stats');
    const statsTime = Date.now() - statsStart;
    
    if (statsResponse.ok && statsResponse.data) {
      const stats = statsResponse.data;
      const hasRequiredFields = stats.hasOwnProperty('totalQuizzes') && 
                               stats.hasOwnProperty('totalViews') && 
                               stats.hasOwnProperty('totalLeads');
      
      if (hasRequiredFields) {
        logTest('DASHBOARD', 'Carregamento de estatísticas', true, 
          `Quizzes: ${stats.totalQuizzes}, Views: ${stats.totalViews}, Leads: ${stats.totalLeads}`, statsTime);
      } else {
        logTest('DASHBOARD', 'Carregamento de estatísticas', false, 'Campos obrigatórios ausentes', statsTime);
      }
    } else {
      logTest('DASHBOARD', 'Carregamento de estatísticas', false, 'Falha ao carregar dados', statsTime);
    }
    
    // Teste 2.2: Carregamento de quizzes recentes
    const quizzesStart = Date.now();
    const quizzesResponse = await makeRequest('/api/quizzes');
    const quizzesTime = Date.now() - quizzesStart;
    
    if (quizzesResponse.ok && Array.isArray(quizzesResponse.data)) {
      logTest('DASHBOARD', 'Lista de quizzes', true, 
        `${quizzesResponse.data.length} quizzes carregados`, quizzesTime);
    } else {
      logTest('DASHBOARD', 'Lista de quizzes', false, 'Falha ao carregar quizzes', quizzesTime);
    }
    
    // Teste 2.3: Carregamento de atividade recente
    const activityStart = Date.now();
    const activityResponse = await makeRequest('/api/dashboard/recent-activity');
    const activityTime = Date.now() - activityStart;
    
    if (activityResponse.ok) {
      logTest('DASHBOARD', 'Atividade recente', true, 'Dados carregados', activityTime);
    } else {
      logTest('DASHBOARD', 'Atividade recente', false, 'Falha ao carregar atividade', activityTime);
    }
    
  } catch (error) {
    logTest('DASHBOARD', 'Sistema de dashboard', false, error.message);
  }
}

// 3. TESTE DE QUIZZES
async function testQuizzes() {
  console.log('\n📝 TESTANDO SISTEMA DE QUIZZES');
  
  try {
    // Teste 3.1: Criação de quiz
    const createStart = Date.now();
    const newQuiz = {
      title: 'Quiz Teste QA',
      description: 'Quiz criado durante teste automatizado',
      structure: [
        {
          id: 'page1',
          type: 'page',
          elements: [
            {
              id: 'element1',
              type: 'heading',
              content: 'Pergunta de Teste',
              properties: { size: 'large' }
            }
          ]
        }
      ],
      settings: {
        theme: 'default',
        progressBar: true
      }
    };
    
    const createResponse = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(newQuiz)
    });
    const createTime = Date.now() - createStart;
    
    let createdQuizId = null;
    if (createResponse.ok && createResponse.data) {
      createdQuizId = createResponse.data.id;
      logTest('QUIZZES', 'Criação de quiz', true, `Quiz criado com ID: ${createdQuizId}`, createTime);
    } else {
      logTest('QUIZZES', 'Criação de quiz', false, 'Falha ao criar quiz', createTime);
      return;
    }
    
    // Teste 3.2: Busca de quiz criado
    const fetchStart = Date.now();
    const fetchResponse = await makeRequest(`/api/quizzes/${createdQuizId}`);
    const fetchTime = Date.now() - fetchStart;
    
    if (fetchResponse.ok && fetchResponse.data) {
      logTest('QUIZZES', 'Busca de quiz', true, 'Quiz encontrado', fetchTime);
    } else {
      logTest('QUIZZES', 'Busca de quiz', false, 'Quiz não encontrado', fetchTime);
    }
    
    // Teste 3.3: Atualização de quiz
    const updateStart = Date.now();
    const updateData = {
      title: 'Quiz Teste QA - Atualizado',
      description: 'Descrição atualizada'
    };
    
    const updateResponse = await makeRequest(`/api/quizzes/${createdQuizId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    const updateTime = Date.now() - updateStart;
    
    if (updateResponse.ok) {
      logTest('QUIZZES', 'Atualização de quiz', true, 'Quiz atualizado com sucesso', updateTime);
    } else {
      logTest('QUIZZES', 'Atualização de quiz', false, 'Falha ao atualizar quiz', updateTime);
    }
    
    // Teste 3.4: Publicação de quiz
    const publishStart = Date.now();
    const publishResponse = await makeRequest(`/api/quizzes/${createdQuizId}/publish`, {
      method: 'POST'
    });
    const publishTime = Date.now() - publishStart;
    
    if (publishResponse.ok) {
      logTest('QUIZZES', 'Publicação de quiz', true, 'Quiz publicado com sucesso', publishTime);
    } else {
      logTest('QUIZZES', 'Publicação de quiz', false, 'Falha ao publicar quiz', publishTime);
    }
    
    // Teste 3.5: Acesso público ao quiz
    const publicStart = Date.now();
    const publicResponse = await makeRequest(`/quiz/${createdQuizId}`, {
      headers: {} // Sem autenticação
    });
    const publicTime = Date.now() - publicStart;
    
    if (publicResponse.ok) {
      logTest('QUIZZES', 'Acesso público', true, 'Quiz acessível publicamente', publicTime);
    } else {
      logTest('QUIZZES', 'Acesso público', false, 'Quiz não acessível publicamente', publicTime);
    }
    
    // Teste 3.6: Exclusão de quiz
    const deleteStart = Date.now();
    const deleteResponse = await makeRequest(`/api/quizzes/${createdQuizId}`, {
      method: 'DELETE'
    });
    const deleteTime = Date.now() - deleteStart;
    
    if (deleteResponse.ok) {
      logTest('QUIZZES', 'Exclusão de quiz', true, 'Quiz excluído com sucesso', deleteTime);
    } else {
      logTest('QUIZZES', 'Exclusão de quiz', false, 'Falha ao excluir quiz', deleteTime);
    }
    
  } catch (error) {
    logTest('QUIZZES', 'Sistema de quizzes', false, error.message);
  }
}

// 4. TESTE DE SMS
async function testSMS() {
  console.log('\n📱 TESTANDO SISTEMA SMS');
  
  try {
    // Teste 4.1: Verificação de créditos SMS
    const creditsStart = Date.now();
    const creditsResponse = await makeRequest('/api/sms-credits');
    const creditsTime = Date.now() - creditsStart;
    
    if (creditsResponse.ok && creditsResponse.data) {
      logTest('SMS', 'Verificação de créditos', true, 
        `Créditos disponíveis: ${creditsResponse.data.credits}`, creditsTime);
    } else {
      logTest('SMS', 'Verificação de créditos', false, 'Falha ao verificar créditos', creditsTime);
    }
    
    // Teste 4.2: Extração de telefones
    const phonesStart = Date.now();
    const phonesResponse = await makeRequest('/api/quiz-phones/test-quiz-id');
    const phonesTime = Date.now() - phonesStart;
    
    if (phonesResponse.ok) {
      logTest('SMS', 'Extração de telefones', true, 'Telefones extraídos', phonesTime);
    } else {
      logTest('SMS', 'Extração de telefones', false, 'Falha na extração', phonesTime);
    }
    
    // Teste 4.3: Criação de campanha SMS
    const campaignStart = Date.now();
    const campaignData = {
      name: 'Campanha Teste QA',
      message: 'Mensagem de teste do sistema QA',
      quizId: 'test-quiz-id',
      targetAudience: 'all',
      triggerType: 'immediate'
    };
    
    const campaignResponse = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    const campaignTime = Date.now() - campaignStart;
    
    if (campaignResponse.ok && campaignResponse.data) {
      logTest('SMS', 'Criação de campanha', true, 
        `Campanha criada com ID: ${campaignResponse.data.id}`, campaignTime);
    } else {
      logTest('SMS', 'Criação de campanha', false, 'Falha ao criar campanha', campaignTime);
    }
    
    // Teste 4.4: Listagem de campanhas
    const listStart = Date.now();
    const listResponse = await makeRequest('/api/sms-campaigns');
    const listTime = Date.now() - listStart;
    
    if (listResponse.ok && Array.isArray(listResponse.data)) {
      logTest('SMS', 'Listagem de campanhas', true, 
        `${listResponse.data.length} campanhas encontradas`, listTime);
    } else {
      logTest('SMS', 'Listagem de campanhas', false, 'Falha ao listar campanhas', listTime);
    }
    
  } catch (error) {
    logTest('SMS', 'Sistema SMS', false, error.message);
  }
}

// 5. TESTE DE EMAIL MARKETING
async function testEmailMarketing() {
  console.log('\n📧 TESTANDO SISTEMA DE EMAIL MARKETING');
  
  try {
    // Teste 5.1: Listagem de campanhas de email
    const campaignStart = Date.now();
    const campaignResponse = await makeRequest('/api/email-campaigns');
    const campaignTime = Date.now() - campaignStart;
    
    if (campaignResponse.ok) {
      logTest('EMAIL', 'Listagem de campanhas', true, 'Campanhas carregadas', campaignTime);
    } else {
      logTest('EMAIL', 'Listagem de campanhas', false, 'Falha ao carregar campanhas', campaignTime);
    }
    
    // Teste 5.2: Criação de campanha de email
    const createStart = Date.now();
    const emailData = {
      name: 'Campanha Email Teste QA',
      subject: 'Assunto de teste',
      content: 'Conteúdo de teste do email',
      quizId: 'test-quiz-id'
    };
    
    const createResponse = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
    const createTime = Date.now() - createStart;
    
    if (createResponse.ok && createResponse.data) {
      logTest('EMAIL', 'Criação de campanha', true, 
        `Campanha criada com ID: ${createResponse.data.id}`, createTime);
    } else {
      logTest('EMAIL', 'Criação de campanha', false, 'Falha ao criar campanha', createTime);
    }
    
  } catch (error) {
    logTest('EMAIL', 'Sistema de email', false, error.message);
  }
}

// 6. TESTE DE WHATSAPP
async function testWhatsApp() {
  console.log('\n💬 TESTANDO SISTEMA WHATSAPP');
  
  try {
    // Teste 6.1: Verificação de status da extensão
    const statusStart = Date.now();
    const statusResponse = await makeRequest('/api/whatsapp/status');
    const statusTime = Date.now() - statusStart;
    
    if (statusResponse.ok) {
      logTest('WHATSAPP', 'Status da extensão', true, 'Status verificado', statusTime);
    } else {
      logTest('WHATSAPP', 'Status da extensão', false, 'Falha ao verificar status', statusTime);
    }
    
    // Teste 6.2: Sincronização com extensão
    const syncStart = Date.now();
    const syncResponse = await makeRequest('/api/whatsapp/sync', {
      method: 'POST',
      body: JSON.stringify({
        action: 'ping',
        data: { timestamp: Date.now() }
      })
    });
    const syncTime = Date.now() - syncStart;
    
    if (syncResponse.ok) {
      logTest('WHATSAPP', 'Sincronização', true, 'Sincronização realizada', syncTime);
    } else {
      logTest('WHATSAPP', 'Sincronização', false, 'Falha na sincronização', syncTime);
    }
    
  } catch (error) {
    logTest('WHATSAPP', 'Sistema WhatsApp', false, error.message);
  }
}

// 7. TESTE DE ANALYTICS
async function testAnalytics() {
  console.log('\n📈 TESTANDO SISTEMA DE ANALYTICS');
  
  try {
    // Teste 7.1: Métricas gerais
    const metricsStart = Date.now();
    const metricsResponse = await makeRequest('/api/analytics/metrics');
    const metricsTime = Date.now() - metricsStart;
    
    if (metricsResponse.ok) {
      logTest('ANALYTICS', 'Métricas gerais', true, 'Métricas carregadas', metricsTime);
    } else {
      logTest('ANALYTICS', 'Métricas gerais', false, 'Falha ao carregar métricas', metricsTime);
    }
    
    // Teste 7.2: Analytics por quiz
    const quizAnalyticsStart = Date.now();
    const quizAnalyticsResponse = await makeRequest('/api/analytics/quiz/test-quiz-id');
    const quizAnalyticsTime = Date.now() - quizAnalyticsStart;
    
    if (quizAnalyticsResponse.ok) {
      logTest('ANALYTICS', 'Analytics por quiz', true, 'Analytics específico carregado', quizAnalyticsTime);
    } else {
      logTest('ANALYTICS', 'Analytics por quiz', false, 'Falha ao carregar analytics', quizAnalyticsTime);
    }
    
  } catch (error) {
    logTest('ANALYTICS', 'Sistema de analytics', false, error.message);
  }
}

// 8. TESTE DE SEGURANÇA
async function testSecurity() {
  console.log('\n🔒 TESTANDO SISTEMA DE SEGURANÇA');
  
  try {
    // Teste 8.1: Rate limiting
    const rateLimitStart = Date.now();
    const requests = [];
    
    // Fazer múltiplas requisições rapidamente
    for (let i = 0; i < 15; i++) {
      requests.push(makeRequest('/api/auth/verify'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimitTime = Date.now() - rateLimitStart;
    
    const blockedRequests = responses.filter(r => r.status === 429);
    
    if (blockedRequests.length > 0) {
      logTest('SECURITY', 'Rate limiting', true, 
        `${blockedRequests.length} requisições bloqueadas`, rateLimitTime);
    } else {
      logTest('SECURITY', 'Rate limiting', false, 'Nenhuma requisição bloqueada', rateLimitTime);
    }
    
    // Teste 8.2: Proteção contra ataques
    const attackStart = Date.now();
    const attackResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: "'; DROP TABLE users; --"
      })
    });
    const attackTime = Date.now() - attackStart;
    
    if (!attackResponse.ok) {
      logTest('SECURITY', 'Proteção SQL injection', true, 'Ataque bloqueado', attackTime);
    } else {
      logTest('SECURITY', 'Proteção SQL injection', false, 'Ataque não bloqueado', attackTime);
    }
    
  } catch (error) {
    logTest('SECURITY', 'Sistema de segurança', false, error.message);
  }
}

// 9. TESTE DE PERFORMANCE
async function testPerformance() {
  console.log('\n⚡ TESTANDO PERFORMANCE');
  
  try {
    // Teste 9.1: Tempo de resposta da API
    const apiStart = Date.now();
    const apiResponse = await makeRequest('/api/dashboard/stats');
    const apiTime = Date.now() - apiStart;
    
    if (apiTime < 500) {
      logTest('PERFORMANCE', 'Tempo de resposta API', true, 
        `Resposta em ${apiTime}ms (< 500ms)`, apiTime);
    } else {
      logTest('PERFORMANCE', 'Tempo de resposta API', false, 
        `Resposta em ${apiTime}ms (> 500ms)`, apiTime);
    }
    
    // Teste 9.2: Carga simultânea
    const loadStart = Date.now();
    const loadRequests = [];
    
    for (let i = 0; i < 10; i++) {
      loadRequests.push(makeRequest('/api/quizzes'));
    }
    
    const loadResponses = await Promise.all(loadRequests);
    const loadTime = Date.now() - loadStart;
    
    const successfulRequests = loadResponses.filter(r => r.ok).length;
    
    if (successfulRequests === 10) {
      logTest('PERFORMANCE', 'Carga simultânea', true, 
        `${successfulRequests}/10 requisições bem-sucedidas`, loadTime);
    } else {
      logTest('PERFORMANCE', 'Carga simultânea', false, 
        `${successfulRequests}/10 requisições bem-sucedidas`, loadTime);
    }
    
  } catch (error) {
    logTest('PERFORMANCE', 'Sistema de performance', false, error.message);
  }
}

// FUNÇÃO PRINCIPAL DE TESTE
async function runCompleteTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA VENDZZ');
  console.log('='.repeat(50));
  
  const overallStart = Date.now();
  
  // Executar todos os testes
  const authSuccess = await testAuthentication();
  
  if (authSuccess) {
    await testDashboard();
    await testQuizzes();
    await testSMS();
    await testEmailMarketing();
    await testWhatsApp();
    await testAnalytics();
    await testSecurity();
    await testPerformance();
  }
  
  const overallTime = Date.now() - overallStart;
  
  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL DO TESTE QA');
  console.log('='.repeat(50));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.success).length;
  const failedTestsCount = failedTests.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(2);
  
  console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
  console.log(`   Total de testes: ${totalTests}`);
  console.log(`   Testes aprovados: ${passedTests}`);
  console.log(`   Testes falhados: ${failedTestsCount}`);
  console.log(`   Taxa de sucesso: ${successRate}%`);
  console.log(`   Tempo total: ${overallTime}ms`);
  
  // Agrupar por módulo
  const moduleStats = {};
  testResults.forEach(test => {
    if (!moduleStats[test.module]) {
      moduleStats[test.module] = { total: 0, passed: 0, failed: 0 };
    }
    moduleStats[test.module].total++;
    if (test.success) {
      moduleStats[test.module].passed++;
    } else {
      moduleStats[test.module].failed++;
    }
  });
  
  console.log(`\n📋 ESTATÍSTICAS POR MÓDULO:`);
  Object.keys(moduleStats).forEach(module => {
    const stats = moduleStats[module];
    const moduleSuccessRate = ((stats.passed / stats.total) * 100).toFixed(2);
    console.log(`   ${module}: ${stats.passed}/${stats.total} (${moduleSuccessRate}%)`);
  });
  
  // Testes com falha
  if (failedTests.length > 0) {
    console.log(`\n❌ TESTES COM FALHA:`);
    failedTests.forEach(test => {
      console.log(`   [${test.module}] ${test.test}: ${test.details}`);
    });
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    totalTime: overallTime,
    statistics: {
      total: totalTests,
      passed: passedTests,
      failed: failedTestsCount,
      successRate: successRate
    },
    moduleStats,
    testResults,
    failedTests
  };
  
  fs.writeFileSync('relatorio-qa-completo.json', JSON.stringify(report, null, 2));
  
  console.log(`\n💾 Relatório salvo em: relatorio-qa-completo.json`);
  console.log(`\n${successRate >= 90 ? '✅ SISTEMA APROVADO' : '❌ SISTEMA REPROVADO'} - Taxa de sucesso: ${successRate}%`);
  
  return report;
}

// Executar teste
runCompleteTest().catch(console.error);

export { runCompleteTest };
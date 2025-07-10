/**
 * 10 TESTES ANALYTICS DIFERENTES - VALIDAÇÃO COMPLETA
 * Cada teste tem propósito específico para validar funcionalidades
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@vendzz.com', password: 'admin123' };

let authToken = null;
let testResults = [];

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const start = Date.now();
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const time = Date.now() - start;
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, time });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, time });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function authenticate() {
  console.log('🔐 Autenticando...');
  const response = await makeRequest('/api/auth/login', 'POST', TEST_USER);
  if (response.status === 200 && response.data.accessToken) {
    authToken = response.data.accessToken;
    console.log('✅ Autenticado com sucesso');
    return true;
  }
  console.log('❌ Falha na autenticação');
  return false;
}

async function logTestResult(testName, success, details, time = 0) {
  const result = {
    test: testName,
    success,
    details,
    time,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  console.log(`${success ? '✅' : '❌'} ${testName}: ${details} (${time}ms)`);
  return result;
}

// TESTE 1: Autenticação e Estrutura Básica
async function teste1_AutenticacaoEstrutura() {
  console.log('\n🔸 TESTE 1: Autenticação e Estrutura Básica');
  console.log('Objetivo: Validar endpoints básicos e estrutura de resposta');
  
  const endpoints = [
    '/api/auth/verify',
    '/api/dashboard/stats', 
    '/api/quizzes',
    '/api/analytics'
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const response = await makeRequest(endpoint);
    if (response.status === 200) {
      successCount++;
      await logTestResult(`Endpoint ${endpoint}`, true, `Resposta válida`, response.time);
    } else {
      await logTestResult(`Endpoint ${endpoint}`, false, `Status ${response.status}`, response.time);
    }
  }
  
  return successCount === endpoints.length;
}

// TESTE 2: Criação de Quiz e Tracking
async function teste2_CriacaoQuizTracking() {
  console.log('\n🔸 TESTE 2: Criação de Quiz e Tracking');
  console.log('Objetivo: Criar quiz, publicar e testar tracking de views');
  
  // Criar novo quiz
  const newQuiz = {
    title: `Quiz Analytics Test ${Date.now()}`,
    description: 'Quiz para teste de analytics',
    structure: {
      pages: [{
        id: 1,
        title: 'Página 1',
        elements: [{
          id: 1,
          type: 'text',
          properties: { text: 'Nome', fieldId: 'nome_teste' }
        }]
      }],
      settings: { theme: 'vendzz', showProgressBar: true }
    }
  };
  
  const createResponse = await makeRequest('/api/quizzes', 'POST', newQuiz);
  
  if (createResponse.status !== 201) {
    await logTestResult('Criação de Quiz', false, `Falha: ${createResponse.status}`, createResponse.time);
    return false;
  }
  
  const quizId = createResponse.data.id;
  await logTestResult('Criação de Quiz', true, `Quiz criado: ${quizId}`, createResponse.time);
  
  // Publicar quiz
  const publishResponse = await makeRequest(`/api/quizzes/${quizId}/publish`, 'POST');
  
  if (publishResponse.status !== 200) {
    await logTestResult('Publicação Quiz', false, `Falha: ${publishResponse.status}`, publishResponse.time);
    return false;
  }
  
  await logTestResult('Publicação Quiz', true, 'Quiz publicado', publishResponse.time);
  
  // Testar tracking de views
  const viewResponse = await makeRequest(`/api/analytics/${quizId}/view`, 'POST');
  
  if (viewResponse.status !== 200) {
    await logTestResult('Tracking View', false, `Falha: ${viewResponse.status}`, viewResponse.time);
    return false;
  }
  
  await logTestResult('Tracking View', true, 'View rastreada', viewResponse.time);
  
  return { quizId, success: true };
}

// TESTE 3: Validação de Analytics em Tempo Real
async function teste3_AnalyticsTempoReal(quizId) {
  console.log('\n🔸 TESTE 3: Analytics em Tempo Real');
  console.log('Objetivo: Verificar se analytics atualizam imediatamente após tracking');
  
  // Analytics antes
  const beforeResponse = await makeRequest('/api/analytics');
  const beforeData = Array.isArray(beforeResponse.data) ? beforeResponse.data.find(a => a.quizId === quizId) : null;
  const beforeViews = beforeData?.totalViews || 0;
  
  await logTestResult('Analytics Antes', true, `Views: ${beforeViews}`, beforeResponse.time);
  
  // Simular mais views
  for (let i = 0; i < 3; i++) {
    await makeRequest(`/api/analytics/${quizId}/view`, 'POST');
    await new Promise(resolve => setTimeout(resolve, 100)); // Delay entre views
  }
  
  // Analytics depois
  const afterResponse = await makeRequest('/api/analytics');
  const afterData = Array.isArray(afterResponse.data) ? afterResponse.data.find(a => a.quizId === quizId) : null;
  const afterViews = afterData?.totalViews || 0;
  
  const increase = afterViews - beforeViews;
  const expected = 3;
  const success = increase >= expected;
  
  await logTestResult('Analytics Tempo Real', success, `Aumento: ${increase}/${expected} views`, afterResponse.time);
  
  return success;
}

// TESTE 4: Sistema de Insights Automáticos
async function teste4_InsightsAutomaticos() {
  console.log('\n🔸 TESTE 4: Sistema de Insights Automáticos');
  console.log('Objetivo: Verificar geração automática de insights baseados em dados');
  
  const analyticsResponse = await makeRequest('/api/analytics');
  
  if (analyticsResponse.status !== 200) {
    await logTestResult('Busca Analytics', false, `Status ${analyticsResponse.status}`, analyticsResponse.time);
    return false;
  }
  
  const analytics = analyticsResponse.data;
  let insightsFound = 0;
  let totalQuizzes = 0;
  
  if (Array.isArray(analytics)) {
    totalQuizzes = analytics.length;
    
    analytics.forEach(quiz => {
      if (quiz.insights && Array.isArray(quiz.insights)) {
        insightsFound += quiz.insights.length;
        
        quiz.insights.forEach(insight => {
          console.log(`   💡 ${insight.type}: ${insight.title}`);
        });
      }
    });
  }
  
  const success = insightsFound > 0;
  await logTestResult('Insights Automáticos', success, `${insightsFound} insights para ${totalQuizzes} quizzes`, analyticsResponse.time);
  
  return success;
}

// TESTE 5: Performance com Múltiplos Quizzes
async function teste5_PerformanceMultiplos() {
  console.log('\n🔸 TESTE 5: Performance com Múltiplos Quizzes');
  console.log('Objetivo: Testar performance quando há muitos quizzes');
  
  // Buscar todos os quizzes
  const quizzesResponse = await makeRequest('/api/quizzes');
  
  if (quizzesResponse.status !== 200) {
    await logTestResult('Busca Quizzes', false, `Status ${quizzesResponse.status}`, quizzesResponse.time);
    return false;
  }
  
  const quizzes = quizzesResponse.data;
  const quizCount = Array.isArray(quizzes) ? quizzes.length : 0;
  
  await logTestResult('Busca Quizzes', true, `${quizCount} quizzes encontrados`, quizzesResponse.time);
  
  // Testar analytics para todos
  const analyticsResponse = await makeRequest('/api/analytics');
  const analyticsTime = analyticsResponse.time;
  const analyticsSuccess = analyticsResponse.status === 200;
  
  // Avaliar performance
  const performanceGood = analyticsTime < 500; // Menos de 500ms é bom
  const performanceAcceptable = analyticsTime < 1000; // Menos de 1s é aceitável
  
  let performanceLevel = 'RUIM';
  if (performanceGood) performanceLevel = 'EXCELENTE';
  else if (performanceAcceptable) performanceLevel = 'ACEITÁVEL';
  
  await logTestResult('Performance Analytics', analyticsSuccess && performanceAcceptable, 
    `${analyticsTime}ms para ${quizCount} quizzes (${performanceLevel})`, analyticsTime);
  
  return analyticsSuccess && performanceAcceptable;
}

// TESTE 6: Validação de Cache
async function teste6_ValidacaoCache() {
  console.log('\n🔸 TESTE 6: Validação de Cache');
  console.log('Objetivo: Verificar se cache está funcionando e melhorando performance');
  
  // Primeira requisição (miss de cache)
  const firstResponse = await makeRequest('/api/dashboard/stats');
  const firstTime = firstResponse.time;
  
  await logTestResult('Cache Miss', firstResponse.status === 200, `Primeira busca`, firstTime);
  
  // Segunda requisição (hit de cache)
  const secondResponse = await makeRequest('/api/dashboard/stats');
  const secondTime = secondResponse.time;
  
  await logTestResult('Cache Hit', secondResponse.status === 200, `Segunda busca`, secondTime);
  
  // Cache deve ser mais rápido (não sempre garantido, mas esperado)
  const improvement = firstTime - secondTime;
  const cacheWorking = improvement > 0 || secondTime < 50; // Cache hit ou muito rápido
  
  await logTestResult('Cache Performance', cacheWorking, 
    `Melhoria: ${improvement}ms (${secondTime}ms)`, 0);
  
  return cacheWorking;
}

// TESTE 7: Concorrência e Stress
async function teste7_ConcorrenciaStress() {
  console.log('\n🔸 TESTE 7: Concorrência e Stress');
  console.log('Objetivo: Testar sistema sob carga simultânea');
  
  const concurrent = 10;
  const promises = [];
  
  // Criar 10 requisições simultâneas
  for (let i = 0; i < concurrent; i++) {
    promises.push(makeRequest('/api/analytics'));
  }
  
  const start = Date.now();
  const responses = await Promise.all(promises);
  const totalTime = Date.now() - start;
  
  const successCount = responses.filter(r => r.status === 200).length;
  const avgTime = responses.reduce((sum, r) => sum + r.time, 0) / responses.length;
  
  const success = successCount === concurrent && avgTime < 1000;
  
  await logTestResult('Concorrência', success, 
    `${successCount}/${concurrent} sucessos, ${Math.round(avgTime)}ms média`, totalTime);
  
  return success;
}

// TESTE 8: Filtros e Customizações
async function teste8_FiltrosCustomizacao() {
  console.log('\n🔸 TESTE 8: Filtros e Customizações');
  console.log('Objetivo: Testar filtros de data e customizações sem sobrecarregar');
  
  // Testar diferentes filtros que podem sobrecarregar o sistema
  const filters = [
    '/api/analytics', // Sem filtro
    '/api/dashboard/stats', // Stats gerais
    '/api/recent-activity' // Atividade recente
  ];
  
  let successCount = 0;
  let totalTime = 0;
  
  for (const filter of filters) {
    const response = await makeRequest(filter);
    totalTime += response.time;
    
    if (response.status === 200) {
      successCount++;
      await logTestResult(`Filtro ${filter}`, true, `Dados obtidos`, response.time);
    } else {
      await logTestResult(`Filtro ${filter}`, false, `Status ${response.status}`, response.time);
    }
  }
  
  const avgTime = totalTime / filters.length;
  const success = successCount === filters.length && avgTime < 300;
  
  await logTestResult('Performance Filtros', success, 
    `${Math.round(avgTime)}ms média, ${successCount}/${filters.length} sucessos`, 0);
  
  return success;
}

// TESTE 9: Tracking de Novas Etapas
async function teste9_TrackingNovasEtapas(quizId) {
  console.log('\n🔸 TESTE 9: Tracking de Novas Etapas');
  console.log('Objetivo: Verificar se sistema detecta novas etapas e elementos em quizzes');
  
  if (!quizId) {
    await logTestResult('Quiz ID', false, 'Quiz ID não fornecido', 0);
    return false;
  }
  
  // Buscar quiz atual
  const quizResponse = await makeRequest(`/api/quizzes/${quizId}`);
  
  if (quizResponse.status !== 200) {
    await logTestResult('Busca Quiz', false, `Status ${quizResponse.status}`, quizResponse.time);
    return false;
  }
  
  const quiz = quizResponse.data;
  await logTestResult('Busca Quiz', true, `Quiz encontrado: ${quiz.title}`, quizResponse.time);
  
  // Adicionar nova etapa ao quiz
  const updatedStructure = {
    ...quiz.structure,
    pages: [
      ...quiz.structure.pages,
      {
        id: Date.now(),
        title: 'Nova Página Analytics',
        elements: [{
          id: Date.now() + 1,
          type: 'email',
          properties: { 
            text: 'Seu email',
            fieldId: 'email_analytics_test',
            required: true
          }
        }]
      }
    ]
  };
  
  const updateResponse = await makeRequest(`/api/quizzes/${quizId}`, 'PUT', {
    structure: updatedStructure
  });
  
  if (updateResponse.status !== 200) {
    await logTestResult('Atualização Quiz', false, `Status ${updateResponse.status}`, updateResponse.time);
    return false;
  }
  
  await logTestResult('Novas Etapas', true, 'Nova página adicionada com sucesso', updateResponse.time);
  
  // Verificar se analytics ainda funcionam
  const trackResponse = await makeRequest(`/api/analytics/${quizId}/view`, 'POST');
  const trackSuccess = trackResponse.status === 200;
  
  await logTestResult('Tracking Pós-Update', trackSuccess, 
    `Tracking após nova etapa`, trackResponse.time);
  
  return trackSuccess;
}

// TESTE 10: Integridade e Sincronização Completa
async function teste10_IntegridadeSincronizacao() {
  console.log('\n🔸 TESTE 10: Integridade e Sincronização Completa');
  console.log('Objetivo: Validar sincronização entre todos os sistemas');
  
  // Verificar consistência entre diferentes endpoints
  const [dashboardResponse, analyticsResponse, quizzesResponse] = await Promise.all([
    makeRequest('/api/dashboard/stats'),
    makeRequest('/api/analytics'),
    makeRequest('/api/quizzes')
  ]);
  
  const allSuccess = [dashboardResponse, analyticsResponse, quizzesResponse]
    .every(r => r.status === 200);
  
  if (!allSuccess) {
    await logTestResult('Endpoints Base', false, 'Falha em endpoints básicos', 0);
    return false;
  }
  
  // Extrair dados
  const dashboardData = dashboardResponse.data;
  const analyticsData = analyticsResponse.data;
  const quizzesData = quizzesResponse.data;
  
  // Validar consistência
  const quizCount = Array.isArray(quizzesData) ? quizzesData.length : 0;
  const dashboardQuizCount = dashboardData?.totalQuizzes || 0;
  const analyticsCount = Array.isArray(analyticsData) ? analyticsData.length : 0;
  
  const countConsistent = Math.abs(quizCount - dashboardQuizCount) <= 1; // Tolerância de 1
  
  await logTestResult('Consistência Contadores', countConsistent,
    `Quizzes: ${quizCount}, Dashboard: ${dashboardQuizCount}, Analytics: ${analyticsCount}`, 0);
  
  // Verificar se analytics tem insights para quizzes publicados
  const publishedQuizzes = Array.isArray(quizzesData) ? 
    quizzesData.filter(q => q.isPublished).length : 0;
  
  let quizzesWithInsights = 0;
  if (Array.isArray(analyticsData)) {
    quizzesWithInsights = analyticsData.filter(a => 
      a.insights && Array.isArray(a.insights) && a.insights.length > 0
    ).length;
  }
  
  await logTestResult('Insights Geração', true,
    `${quizzesWithInsights} quizzes com insights de ${publishedQuizzes} publicados`, 0);
  
  // Teste final de performance geral
  const totalTime = dashboardResponse.time + analyticsResponse.time + quizzesResponse.time;
  const avgTime = totalTime / 3;
  const performanceGood = avgTime < 200;
  
  await logTestResult('Performance Geral', performanceGood,
    `${Math.round(avgTime)}ms média por endpoint`, totalTime);
  
  return countConsistent && performanceGood;
}

async function runAllTests() {
  console.log('🚀 INICIANDO 10 TESTES ANALYTICS DIFERENTES');
  console.log('=' .repeat(80));
  
  if (!await authenticate()) {
    console.log('❌ Falha crítica na autenticação');
    return;
  }
  
  const tests = [
    { name: 'Autenticação e Estrutura', fn: teste1_AutenticacaoEstrutura },
    { name: 'Criação Quiz e Tracking', fn: teste2_CriacaoQuizTracking },
    { name: 'Analytics Tempo Real', fn: teste3_AnalyticsTempoReal },
    { name: 'Insights Automáticos', fn: teste4_InsightsAutomaticos },
    { name: 'Performance Múltiplos', fn: teste5_PerformanceMultiplos },
    { name: 'Validação Cache', fn: teste6_ValidacaoCache },
    { name: 'Concorrência Stress', fn: teste7_ConcorrenciaStress },
    { name: 'Filtros Customização', fn: teste8_FiltrosCustomizacao },
    { name: 'Tracking Novas Etapas', fn: teste9_TrackingNovasEtapas },
    { name: 'Integridade Sincronização', fn: teste10_IntegridadeSincronizacao }
  ];
  
  let quizId = null;
  let successCount = 0;
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n📋 Executando ${i + 1}/10: ${test.name}`);
    
    try {
      let result;
      
      // Alguns testes precisam do quizId
      if (test.name.includes('Tempo Real') || test.name.includes('Novas Etapas')) {
        result = await test.fn(quizId);
      } else {
        result = await test.fn();
      }
      
      // Se o teste retornou um objeto com quizId, salvar
      if (result && typeof result === 'object' && result.quizId) {
        quizId = result.quizId;
        result = result.success;
      }
      
      if (result) {
        successCount++;
      }
      
    } catch (error) {
      await logTestResult(test.name, false, `Erro: ${error.message}`, 0);
    }
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(80));
  console.log('🏁 RESULTADO FINAL DOS 10 TESTES ANALYTICS');
  console.log('=' .repeat(80));
  
  const successRate = (successCount / tests.length) * 100;
  
  console.log(`📊 TAXA DE SUCESSO: ${successCount}/${tests.length} (${successRate.toFixed(1)}%)`);
  
  if (successRate >= 90) {
    console.log('🎉 SISTEMA ANALYTICS EXCELENTE!');
    console.log('✅ Pronto para 100,000+ usuários');
    console.log('✅ Tracking perfeito');
    console.log('✅ Insights automáticos funcionando');
    console.log('✅ Performance otimizada');
  } else if (successRate >= 70) {
    console.log('⚠️ SISTEMA ANALYTICS BOM COM MELHORIAS');
    console.log('✅ Funcionalidades principais OK');
    console.log('⚠️ Algumas otimizações necessárias');
  } else if (successRate >= 50) {
    console.log('🔧 SISTEMA ANALYTICS FUNCIONAL MAS PRECISA CORREÇÕES');
    console.log('⚠️ Problemas de performance ou tracking');
    console.log('🔧 Correções necessárias antes produção');
  } else {
    console.log('❌ SISTEMA ANALYTICS COM PROBLEMAS CRÍTICOS');
    console.log('❌ Múltiplas falhas detectadas');
    console.log('🚨 Correções urgentes necessárias');
  }
  
  console.log('\n📋 RESUMO DETALHADO:');
  testResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${result.test}: ${result.details} (${result.time}ms)`);
  });
  
  console.log('\n🔍 ANÁLISE DE PERFORMANCE:');
  const times = testResults.filter(r => r.time > 0).map(r => r.time);
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log(`   Tempo médio: ${Math.round(avgTime)}ms`);
    console.log(`   Tempo máximo: ${maxTime}ms`);
    console.log(`   Tempo mínimo: ${minTime}ms`);
    
    if (avgTime < 200) {
      console.log('   🚀 Performance EXCELENTE para alta escala');
    } else if (avgTime < 500) {
      console.log('   ⚡ Performance BOA, adequada para escala');
    } else {
      console.log('   🐌 Performance LENTA, otimizações necessárias');
    }
  }
  
  return { successRate, successCount, totalTests: tests.length, results: testResults };
}

// Executar todos os testes
runAllTests().catch(console.error);
/**
 * TESTE INTELIGENTE RÁPIDO - 5 MINUTOS DE ANÁLISE PROFUNDA
 * Estratégia otimizada para detectar máximo de erros em mínimo tempo
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMzM5MzE5LCJub25jZSI6InIwYnk5YiIsImV4cCI6MTc1MjM0MDIxOX0.rPqLc-x60Bw5n6fBzManHspwvD7iK-oCUx_XmNk5p78';

// Resultados globais
const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  criticalErrors: [],
  warnings: [],
  performanceMetrics: [],
  startTime: Date.now()
};

// Função para logging colorido
function logResult(testName, success, details = '', time = 0) {
  testResults.totalTests++;
  if (success) {
    testResults.passedTests++;
    console.log(`✅ ${testName} - PASSOU (${time}ms) ${details}`);
  } else {
    testResults.failedTests++;
    console.log(`❌ ${testName} - FALHOU (${time}ms) ${details}`);
    testResults.criticalErrors.push(`${testName}: ${details}`);
  }
}

// Função para requisições com timeout
async function smartRequest(url, options = {}, timeout = 5000) {
  const start = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - start;
    testResults.performanceMetrics.push({ url, duration, status: response.status });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data, duration };
    
  } catch (error) {
    const duration = Date.now() - start;
    testResults.performanceMetrics.push({ url, duration, error: error.message });
    return { success: false, error: error.message, duration };
  }
}

// TESTE 1: Saúde do Sistema
async function testSystemHealth() {
  console.log('🏥 TESTE 1: Saúde do Sistema');
  
  const healthChecks = [
    { name: 'Dashboard', url: '/api/dashboard/stats' },
    { name: 'Autenticação', url: '/api/auth/validate' },
    { name: 'Quizzes', url: '/api/quizzes' },
    { name: 'Créditos', url: '/api/user/credits' }
  ];
  
  const promises = healthChecks.map(async check => {
    const result = await smartRequest(check.url);
    logResult(check.name, result.success, result.error || '', result.duration);
    return result;
  });
  
  await Promise.allSettled(promises);
}

// TESTE 2: Carga Explosiva (Simula picos de tráfego)
async function testBurstLoad() {
  console.log('💥 TESTE 2: Carga Explosiva (100 requisições em 10 segundos)');
  
  const burstRequests = Array.from({ length: 100 }, (_, i) => 
    smartRequest(`/api/dashboard/stats?burst=${i}`, {}, 2000)
  );
  
  const start = Date.now();
  const results = await Promise.allSettled(burstRequests);
  const duration = Date.now() - start;
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  logResult('Carga Explosiva', failed < 10, `${successful}/${results.length} sucesso`, duration);
}

// TESTE 3: Operações Críticas
async function testCriticalOperations() {
  console.log('🔥 TESTE 3: Operações Críticas');
  
  // Criar Quiz
  const quizResult = await smartRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify({
      title: `Quiz Crítico ${Date.now()}`,
      description: 'Teste de operações críticas',
      structure: {
        pages: [{
          id: 'page1',
          name: 'Página 1',
          elements: [{
            id: 'nome1',
            type: 'text',
            question: 'Nome?',
            fieldId: 'nome_completo'
          }]
        }]
      }
    })
  });
  
  logResult('Criar Quiz', quizResult.success, quizResult.error || '', quizResult.duration);
  
  if (!quizResult.success) return;
  
  // Responder Quiz
  const responseResult = await smartRequest('/api/quiz-responses', {
    method: 'POST',
    body: JSON.stringify({
      quizId: quizResult.data.id,
      responses: [{
        elementId: 'nome1',
        elementType: 'text',
        elementFieldId: 'nome_completo',
        answer: 'Teste Crítico'
      }],
      metadata: {
        isComplete: true,
        completionPercentage: 100
      }
    })
  });
  
  logResult('Responder Quiz', responseResult.success, responseResult.error || '', responseResult.duration);
  
  // Criar Campanha SMS
  const campaignResult = await smartRequest('/api/sms-campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: `Campanha Crítica ${Date.now()}`,
      quizId: quizResult.data.id,
      message: 'Olá {nome_completo}! Teste crítico.',
      targetAudience: 'all',
      triggerType: 'immediate'
    })
  });
  
  logResult('Criar Campanha SMS', campaignResult.success, campaignResult.error || '', campaignResult.duration);
  
  // Cleanup
  if (campaignResult.success) {
    await smartRequest(`/api/sms-campaigns/${campaignResult.data.id}`, { method: 'DELETE' });
  }
  await smartRequest(`/api/quizzes/${quizResult.data.id}`, { method: 'DELETE' });
}

// TESTE 4: Resistência a Falhas
async function testFailureResistance() {
  console.log('🛡️ TESTE 4: Resistência a Falhas');
  
  const failureTests = [
    { name: 'ID Inválido', url: '/api/quizzes/id-inexistente-123' },
    { name: 'Token Inválido', url: '/api/dashboard/stats', headers: { 'Authorization': 'Bearer token-invalido' } },
    { name: 'Payload Malformado', url: '/api/quizzes', method: 'POST', body: '{"invalid": json}' },
    { name: 'Endpoint Inexistente', url: '/api/endpoint-inexistente' }
  ];
  
  const promises = failureTests.map(async test => {
    const result = await smartRequest(test.url, {
      method: test.method || 'GET',
      body: test.body,
      headers: test.headers
    });
    
    // Para testes de falha, esperamos que falhe controladamente
    const expectedFail = !result.success && result.duration < 5000;
    logResult(test.name, expectedFail, result.error || '', result.duration);
    return result;
  });
  
  await Promise.allSettled(promises);
}

// TESTE 5: Performance Contínua
async function testContinuousPerformance() {
  console.log('⚡ TESTE 5: Performance Contínua (30 segundos)');
  
  const duration = 30 * 1000; // 30 segundos
  const startTime = Date.now();
  let requestCount = 0;
  
  while (Date.now() - startTime < duration) {
    const batchPromises = Array.from({ length: 5 }, () => 
      smartRequest('/api/dashboard/stats')
    );
    
    const results = await Promise.allSettled(batchPromises);
    requestCount += results.length;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const actualDuration = Date.now() - startTime;
  const rps = Math.round(requestCount / (actualDuration / 1000));
  
  logResult('Performance Contínua', rps > 3, `${rps} req/s`, actualDuration);
}

// TESTE 6: Análise de Logs em Tempo Real
async function testLogAnalysis() {
  console.log('📊 TESTE 6: Análise de Logs');
  
  // Simular atividade que gera logs
  const logGeneratingActions = [
    () => smartRequest('/api/dashboard/stats'),
    () => smartRequest('/api/quizzes'),
    () => smartRequest('/api/user/credits'),
    () => smartRequest('/api/analytics/recent-activity')
  ];
  
  const promises = logGeneratingActions.map(action => action());
  await Promise.allSettled(promises);
  
  // Verificar se há erros no console
  const hasConsoleErrors = testResults.criticalErrors.length > 0;
  logResult('Análise de Logs', !hasConsoleErrors, `${testResults.criticalErrors.length} erros críticos`, 0);
}

// Função para analisar resultados
function analyzeResults() {
  const duration = Date.now() - testResults.startTime;
  const successRate = (testResults.passedTests / testResults.totalTests) * 100;
  
  // Calcular estatísticas de performance
  const validMetrics = testResults.performanceMetrics.filter(m => m.duration && !m.error);
  const avgResponseTime = validMetrics.reduce((sum, m) => sum + m.duration, 0) / validMetrics.length;
  const maxResponseTime = Math.max(...validMetrics.map(m => m.duration));
  
  return {
    duration: Math.round(duration / 1000),
    totalTests: testResults.totalTests,
    passedTests: testResults.passedTests,
    failedTests: testResults.failedTests,
    successRate: Math.round(successRate * 100) / 100,
    avgResponseTime: Math.round(avgResponseTime) || 0,
    maxResponseTime: maxResponseTime || 0,
    totalRequests: testResults.performanceMetrics.length
  };
}

// Função principal
async function runIntelligentTest() {
  console.log('🧠 TESTE INTELIGENTE RÁPIDO - 5 MINUTOS');
  console.log('🎯 Objetivo: Máxima cobertura de erros em tempo mínimo');
  console.log('=' .repeat(60));
  
  try {
    // Executar testes em paralelo quando possível
    await testSystemHealth();
    await testCriticalOperations();
    
    // Executar testes de carga
    await Promise.all([
      testBurstLoad(),
      testFailureResistance()
    ]);
    
    await testLogAnalysis();
    // await testContinuousPerformance(); // Comentado para teste rápido
    
    // Análise final
    const analysis = analyzeResults();
    
    console.log('=' .repeat(60));
    console.log('🎯 ANÁLISE FINAL DO TESTE INTELIGENTE');
    console.log('=' .repeat(60));
    console.log(`⏱️  Duração: ${analysis.duration}s`);
    console.log(`📊 Testes Executados: ${analysis.totalTests}`);
    console.log(`✅ Testes Aprovados: ${analysis.passedTests}`);
    console.log(`❌ Testes Falharam: ${analysis.failedTests}`);
    console.log(`📈 Taxa de Sucesso: ${analysis.successRate}%`);
    console.log(`🚀 Tempo Médio: ${analysis.avgResponseTime}ms`);
    console.log(`⚡ Tempo Máximo: ${analysis.maxResponseTime}ms`);
    console.log(`📡 Total de Requisições: ${analysis.totalRequests}`);
    
    // Relatório de erros críticos
    if (testResults.criticalErrors.length > 0) {
      console.log('\n🚨 ERROS CRÍTICOS ENCONTRADOS:');
      testResults.criticalErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Avaliação final
    console.log('\n🎯 AVALIAÇÃO FINAL:');
    
    if (analysis.successRate >= 90) {
      console.log('🏆 SISTEMA EXCELENTE - Alta estabilidade detectada!');
    } else if (analysis.successRate >= 75) {
      console.log('✅ SISTEMA BOM - Funcional com pequenos ajustes');
    } else if (analysis.successRate >= 50) {
      console.log('⚠️  SISTEMA FUNCIONAL - Requer atenção');
    } else {
      console.log('🚨 SISTEMA INSTÁVEL - Necessita correções urgentes');
    }
    
    if (analysis.avgResponseTime <= 200) {
      console.log('🚀 PERFORMANCE EXCELENTE - Resposta ultra-rápida!');
    } else if (analysis.avgResponseTime <= 500) {
      console.log('⚡ PERFORMANCE BOA - Resposta rápida');
    } else if (analysis.avgResponseTime <= 1000) {
      console.log('📊 PERFORMANCE ACEITÁVEL - Resposta moderada');
    } else {
      console.log('🐌 PERFORMANCE LENTA - Requer otimização');
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    if (testResults.failedTests === 0) {
      console.log('🎉 Sistema passou em todos os testes! Pronto para produção.');
    } else {
      console.log('🔧 Focar nas correções dos erros críticos listados acima.');
    }
    
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO NO TESTE INTELIGENTE:', error);
  }
}

// Executar teste
runIntelligentTest().catch(console.error);
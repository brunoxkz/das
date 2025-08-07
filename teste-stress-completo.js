/**
 * TESTE DE STRESS COMPLETO - MÚLTIPLAS ESTRATÉGIAS SIMULTÂNEAS
 * Combina várias abordagens para detectar erros rapidamente
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMzM4MDE1LCJub25jZSI6ImxhZGhsIiwiZXhwIjoxNzUyMzM4OTE1fQ.vuu_CT_1-cHHeiVMCJKrBcND3QSnn3G1nDq3qRTeYe0';

// Contadores globais
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  errors: [],
  responseTimesMs: [],
  startTime: Date.now()
};

// Função para fazer requisições com métricas
async function makeRequest(url, options = {}) {
  stats.totalRequests++;
  const start = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...options.headers
      }
    });
    
    const duration = Date.now() - start;
    stats.responseTimesMs.push(duration);
    
    if (!response.ok) {
      stats.failedRequests++;
      const error = `${response.status} - ${url}`;
      stats.errors.push(error);
      console.error(`❌ ${error} (${duration}ms)`);
      return null;
    }
    
    stats.successfulRequests++;
    const data = await response.json();
    console.log(`✅ ${url} - ${response.status} (${duration}ms)`);
    return data;
    
  } catch (error) {
    const duration = Date.now() - start;
    stats.responseTimesMs.push(duration);
    stats.failedRequests++;
    stats.errors.push(`${error.message} - ${url}`);
    console.error(`❌ ${url} - ${error.message} (${duration}ms)`);
    return null;
  }
}

// ESTRATÉGIA 1: Teste de Endpoints Críticos
async function testCriticalEndpoints() {
  console.log('🎯 TESTE 1: Endpoints Críticos');
  
  const endpoints = [
    '/api/dashboard/stats',
    '/api/quizzes',
    '/api/user/credits',
    '/api/analytics/recent-activity',
    '/api/sms-campaigns',
    '/api/email-campaigns',
    '/api/quiz-responses',
    '/api/admin/users'
  ];
  
  const promises = endpoints.map(endpoint => makeRequest(endpoint));
  await Promise.allSettled(promises);
}

// ESTRATÉGIA 2: Teste de Concorrência
async function testConcurrency() {
  console.log('🚀 TESTE 2: Concorrência (50 requisições simultâneas)');
  
  const concurrentRequests = Array.from({length: 50}, (_, i) => 
    makeRequest(`/api/dashboard/stats?cache=${i}`)
  );
  
  await Promise.allSettled(concurrentRequests);
}

// ESTRATÉGIA 3: Teste de Operações CRUD
async function testCRUDOperations() {
  console.log('📝 TESTE 3: Operações CRUD');
  
  // Criar Quiz
  const quizData = {
    title: `Quiz Teste CRUD ${Date.now()}`,
    description: 'Teste de operações CRUD',
    structure: {
      pages: [{
        id: 'page1',
        name: 'Página 1',
        elements: [{
          id: 'text1',
          type: 'text',
          question: 'Nome?',
          fieldId: 'nome_completo'
        }]
      }]
    }
  };
  
  const quiz = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
  
  if (quiz) {
    // Atualizar Quiz
    await makeRequest(`/api/quizzes/${quiz.id}`, {
      method: 'PUT',
      body: JSON.stringify({...quizData, title: 'Quiz Atualizado'})
    });
    
    // Ler Quiz
    await makeRequest(`/api/quizzes/${quiz.id}`);
    
    // Deletar Quiz
    await makeRequest(`/api/quizzes/${quiz.id}`, {
      method: 'DELETE'
    });
  }
}

// ESTRATÉGIA 4: Teste de Edge Cases
async function testEdgeCases() {
  console.log('🔍 TESTE 4: Edge Cases');
  
  const edgeCases = [
    // Payload muito grande
    {
      url: '/api/quizzes',
      method: 'POST',
      body: JSON.stringify({
        title: 'A'.repeat(10000),
        description: 'B'.repeat(50000),
        structure: { pages: [] }
      })
    },
    // ID inexistente
    {
      url: '/api/quizzes/id-inexistente-123',
      method: 'GET'
    },
    // Dados inválidos
    {
      url: '/api/quiz-responses',
      method: 'POST',
      body: JSON.stringify({
        quizId: null,
        responses: 'invalid'
      })
    },
    // Token inválido
    {
      url: '/api/dashboard/stats',
      method: 'GET',
      headers: { 'Authorization': 'Bearer token-invalido' }
    }
  ];
  
  const promises = edgeCases.map(test => 
    makeRequest(test.url, {
      method: test.method || 'GET',
      body: test.body,
      headers: test.headers
    })
  );
  
  await Promise.allSettled(promises);
}

// ESTRATÉGIA 5: Teste de Performance Sustentada
async function testSustainedPerformance() {
  console.log('⚡ TESTE 5: Performance Sustentada (2 minutos)');
  
  const duration = 2 * 60 * 1000; // 2 minutos
  const startTime = Date.now();
  
  while (Date.now() - startTime < duration) {
    const batch = Array.from({length: 10}, () => 
      makeRequest('/api/dashboard/stats')
    );
    await Promise.allSettled(batch);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo entre lotes
  }
}

// ESTRATÉGIA 6: Teste de Fluxo Completo
async function testCompleteFlow() {
  console.log('🔄 TESTE 6: Fluxo Completo');
  
  // 1. Criar Quiz
  const quiz = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify({
      title: `Quiz Fluxo ${Date.now()}`,
      description: 'Teste de fluxo completo',
      structure: {
        pages: [{
          id: 'page1',
          name: 'Página 1',
          elements: [{
            id: 'nome1',
            type: 'text',
            question: 'Seu nome?',
            fieldId: 'nome_completo'
          }, {
            id: 'email1',
            type: 'email',
            question: 'Seu email?',
            fieldId: 'email_contato'
          }]
        }]
      }
    })
  });
  
  if (!quiz) return;
  
  // 2. Responder Quiz
  const response = await makeRequest('/api/quiz-responses', {
    method: 'POST',
    body: JSON.stringify({
      quizId: quiz.id,
      responses: [
        {
          elementId: 'nome1',
          elementType: 'text',
          elementFieldId: 'nome_completo',
          answer: 'Teste Fluxo'
        },
        {
          elementId: 'email1',
          elementType: 'email',
          elementFieldId: 'email_contato',
          answer: 'teste@fluxo.com'
        }
      ],
      metadata: {
        isComplete: true,
        completionPercentage: 100
      }
    })
  });
  
  if (!response) return;
  
  // 3. Criar Campanha SMS
  const campaign = await makeRequest('/api/sms-campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: `Campanha Fluxo ${Date.now()}`,
      quizId: quiz.id,
      message: 'Olá {nome_completo}! Seu email: {email_contato}',
      targetAudience: 'all',
      triggerType: 'immediate'
    })
  });
  
  if (!campaign) return;
  
  // 4. Verificar Analytics
  await makeRequest(`/api/analytics/quiz/${quiz.id}`);
  
  // 5. Limpar dados
  await makeRequest(`/api/sms-campaigns/${campaign.id}`, {
    method: 'DELETE'
  });
  
  await makeRequest(`/api/quizzes/${quiz.id}`, {
    method: 'DELETE'
  });
}

// Função para calcular estatísticas
function calculateStats() {
  const duration = Date.now() - stats.startTime;
  const avgResponseTime = stats.responseTimesMs.reduce((a, b) => a + b, 0) / stats.responseTimesMs.length;
  const maxResponseTime = Math.max(...stats.responseTimesMs);
  const minResponseTime = Math.min(...stats.responseTimesMs);
  const successRate = (stats.successfulRequests / stats.totalRequests) * 100;
  
  return {
    duration: Math.round(duration / 1000),
    totalRequests: stats.totalRequests,
    successfulRequests: stats.successfulRequests,
    failedRequests: stats.failedRequests,
    successRate: Math.round(successRate * 100) / 100,
    avgResponseTime: Math.round(avgResponseTime),
    maxResponseTime,
    minResponseTime,
    requestsPerSecond: Math.round(stats.totalRequests / (duration / 1000))
  };
}

// Função principal
async function runStressTest() {
  console.log('🎯 INICIANDO TESTE DE STRESS COMPLETO');
  console.log('=' .repeat(60));
  
  try {
    // Executar todos os testes
    await testCriticalEndpoints();
    await testConcurrency();
    await testCRUDOperations();
    await testEdgeCases();
    await testCompleteFlow();
    // await testSustainedPerformance(); // Comentado para teste rápido
    
    // Calcular estatísticas finais
    const finalStats = calculateStats();
    
    console.log('=' .repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('=' .repeat(60));
    console.log(`⏱️  Duração: ${finalStats.duration}s`);
    console.log(`📈 Total de Requisições: ${finalStats.totalRequests}`);
    console.log(`✅ Sucessos: ${finalStats.successfulRequests}`);
    console.log(`❌ Falhas: ${finalStats.failedRequests}`);
    console.log(`📊 Taxa de Sucesso: ${finalStats.successRate}%`);
    console.log(`⚡ Requisições/segundo: ${finalStats.requestsPerSecond}`);
    console.log(`🚀 Tempo médio: ${finalStats.avgResponseTime}ms`);
    console.log(`🔥 Tempo máximo: ${finalStats.maxResponseTime}ms`);
    console.log(`💨 Tempo mínimo: ${finalStats.minResponseTime}ms`);
    
    if (stats.errors.length > 0) {
      console.log('\n🚨 ERROS ENCONTRADOS:');
      stats.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    console.log('\n💡 AVALIAÇÃO:');
    if (finalStats.successRate >= 95) {
      console.log('🎉 SISTEMA ESTÁVEL - Taxa de sucesso excelente!');
    } else if (finalStats.successRate >= 80) {
      console.log('⚠️  SISTEMA FUNCIONAL - Alguns erros detectados');
    } else {
      console.log('🚨 SISTEMA INSTÁVEL - Muitos erros encontrados');
    }
    
    if (finalStats.avgResponseTime <= 500) {
      console.log('🚀 PERFORMANCE EXCELENTE - Tempo de resposta ótimo!');
    } else if (finalStats.avgResponseTime <= 1000) {
      console.log('⚡ PERFORMANCE BOA - Tempo de resposta aceitável');
    } else {
      console.log('🐌 PERFORMANCE LENTA - Tempo de resposta alto');
    }
    
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO NO TESTE:', error);
  }
}

// Executar teste
runStressTest().catch(console.error);
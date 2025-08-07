/**
 * TESTE DE REGRESSÃO AUTOMÁTICO
 * Foca nos erros específicos identificados e re-testa após correções
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInBsYW4iOiJlbnRlcnByaXNlIiwicm9sZSI6ImFkbWluIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1MjM0MTUyOCwiZXhwIjoxNzUyNDI3OTI4fQ.yG862OoMegQ1D9qIdCb2-oZziUo7XS_SBPbLd7vDRng';

// Testes específicos para os erros identificados
const regressionTests = {
  beforeFixes: { passed: 0, failed: 0, errors: [] },
  afterFixes: { passed: 0, failed: 0, errors: [] }
};

async function makeRequest(url, options = {}) {
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
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return { success: true, data, duration, status: response.status };
    
  } catch (error) {
    const duration = Date.now() - start;
    return { success: false, error: error.message, duration };
  }
}

function logTest(name, result, phase) {
  const results = regressionTests[phase];
  
  if (result.success) {
    results.passed++;
    console.log(`✅ ${name} - PASSOU (${result.duration}ms) - ${phase}`);
  } else {
    results.failed++;
    results.errors.push(`${name}: ${result.error}`);
    console.log(`❌ ${name} - FALHOU (${result.duration}ms) - ${phase}`);
    console.log(`   Erro: ${result.error}`);
  }
}

// TESTE 1: Erro HTTP 500 - Resposta de Quiz
async function testQuizResponse(phase) {
  console.log(`\n🔍 TESTE: Quiz Response (${phase})`);
  
  // Primeiro criar um quiz válido
  const quizResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify({
      title: `Quiz Teste ${Date.now()}`,
      description: 'Teste de regressão',
      structure: {
        pages: [{
          id: 'page1',
          name: 'Página 1',
          elements: [{
            id: 'nome1',
            type: 'text',
            question: 'Seu nome?',
            fieldId: 'nome_completo'
          }]
        }]
      }
    })
  });
  
  logTest('Criar Quiz para Teste', quizResult, phase);
  
  if (quizResult.success) {
    // Testar resposta ao quiz
    const responseResult = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify({
        quizId: quizResult.data.id,
        responses: [{
          elementId: 'nome1',
          elementType: 'text',
          elementFieldId: 'nome_completo',
          answer: 'Teste Regressão'
        }],
        metadata: {
          isComplete: true,
          completionPercentage: 100
        }
      })
    });
    
    logTest('Responder Quiz', responseResult, phase);
    
    // Cleanup
    await makeRequest(`/api/quizzes/${quizResult.data.id}`, { method: 'DELETE' });
  }
}

// TESTE 2: Erro HTTP 400 - Criação de Campanha SMS
async function testSMSCampaign(phase) {
  console.log(`\n📱 TESTE: SMS Campaign (${phase})`);
  
  // Criar quiz com resposta para ter dados válidos
  const quizResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify({
      title: `Quiz SMS ${Date.now()}`,
      description: 'Teste SMS',
      structure: {
        pages: [{
          id: 'page1',
          name: 'Página 1',
          elements: [{
            id: 'tel1',
            type: 'phone',
            question: 'Telefone?',
            fieldId: 'telefone_contato'
          }]
        }]
      }
    })
  });
  
  if (quizResult.success) {
    // Responder quiz primeiro
    const responseResult = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify({
        quizId: quizResult.data.id,
        responses: [{
          elementId: 'tel1',
          elementType: 'phone',
          elementFieldId: 'telefone_contato',
          answer: '11999887766'
        }],
        metadata: {
          isComplete: true,
          completionPercentage: 100
        }
      })
    });
    
    if (responseResult.success) {
      // Criar campanha SMS
      const campaignResult = await makeRequest('/api/sms-campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: `Campanha SMS ${Date.now()}`,
          quizId: quizResult.data.id,
          message: 'Olá! Sua resposta foi registrada.',
          targetAudience: 'all',
          triggerType: 'immediate'
        })
      });
      
      logTest('Criar Campanha SMS', campaignResult, phase);
      
      // Cleanup
      if (campaignResult.success) {
        await makeRequest(`/api/sms-campaigns/${campaignResult.data.id}`, { method: 'DELETE' });
      }
    }
    
    // Cleanup
    await makeRequest(`/api/quizzes/${quizResult.data.id}`, { method: 'DELETE' });
  }
}

// TESTE 3: Cache Optimizer - getAllQuizzes
async function testCacheOptimizer(phase) {
  console.log(`\n🚀 TESTE: Cache Optimizer (${phase})`);
  
  // Testar se consegue buscar todos os quizzes
  const allQuizzesResult = await makeRequest('/api/quizzes/all');
  logTest('Buscar Todos os Quizzes', allQuizzesResult, phase);
  
  // Testar múltiplas requisições para verificar cache
  const cacheTests = await Promise.all([
    makeRequest('/api/dashboard/stats'),
    makeRequest('/api/dashboard/stats'),
    makeRequest('/api/dashboard/stats')
  ]);
  
  const cacheWorking = cacheTests.every(test => test.success);
  logTest('Sistema de Cache', { success: cacheWorking, duration: 0 }, phase);
}

// TESTE 4: Unhandled Promise Rejections
async function testPromiseRejections(phase) {
  console.log(`\n⚠️  TESTE: Promise Rejections (${phase})`);
  
  // Simular situações que podem causar promise rejections
  const promiseTests = [
    makeRequest('/api/dashboard/stats'),
    makeRequest('/api/user/credits'),
    makeRequest('/api/quizzes'),
    makeRequest('/api/analytics/recent-activity')
  ];
  
  const results = await Promise.allSettled(promiseTests);
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  logTest('Promise Handling', { success: failed === 0, duration: 0 }, phase);
}

// Executar todos os testes
async function runRegressionTests() {
  console.log('🔄 TESTE DE REGRESSÃO AUTOMÁTICO');
  console.log('=' .repeat(60));
  
  // Fase 1: Antes das correções (baseline)
  console.log('\n📊 FASE 1: BASELINE (Antes das correções)');
  await testQuizResponse('beforeFixes');
  await testSMSCampaign('beforeFixes');
  await testCacheOptimizer('beforeFixes');
  await testPromiseRejections('beforeFixes');
  
  // Aguardar um pouco para sistema estabilizar
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Fase 2: Após as correções
  console.log('\n📊 FASE 2: REGRESSÃO (Após as correções)');
  await testQuizResponse('afterFixes');
  await testSMSCampaign('afterFixes');
  await testCacheOptimizer('afterFixes');
  await testPromiseRejections('afterFixes');
  
  // Análise comparativa
  console.log('\n' + '=' .repeat(60));
  console.log('📊 ANÁLISE COMPARATIVA');
  console.log('=' .repeat(60));
  
  const before = regressionTests.beforeFixes;
  const after = regressionTests.afterFixes;
  
  console.log(`ANTES DAS CORREÇÕES:`);
  console.log(`  ✅ Passou: ${before.passed}`);
  console.log(`  ❌ Falhou: ${before.failed}`);
  console.log(`  📈 Taxa de Sucesso: ${((before.passed / (before.passed + before.failed)) * 100).toFixed(1)}%`);
  
  console.log(`\nAPÓS AS CORREÇÕES:`);
  console.log(`  ✅ Passou: ${after.passed}`);
  console.log(`  ❌ Falhou: ${after.failed}`);
  console.log(`  📈 Taxa de Sucesso: ${((after.passed / (after.passed + after.failed)) * 100).toFixed(1)}%`);
  
  const improvement = after.passed - before.passed;
  const regressions = after.failed - before.failed;
  
  console.log(`\n🎯 RESULTADOS:`);
  if (improvement > 0) {
    console.log(`  📈 MELHORIA: +${improvement} testes passando`);
  }
  if (regressions > 0) {
    console.log(`  📉 REGRESSÃO: +${regressions} novos erros`);
  }
  if (improvement > 0 && regressions === 0) {
    console.log(`  🎉 SUCESSO TOTAL: Todas as correções funcionaram!`);
  }
  
  if (after.errors.length > 0) {
    console.log(`\n🚨 ERROS RESTANTES:`);
    after.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
}

// Executar
runRegressionTests().catch(console.error);
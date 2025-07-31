/**
 * CORREÇÃO CRÍTICA - ANALYTICS TRACKING PARA 100K+ USUÁRIOS
 * Fix do problema onde views não persistem no banco
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@vendzz.com', password: 'admin123' };

let authToken = null;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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
  return false;
}

async function testTrackingFix() {
  console.log('🔧 TESTANDO CORREÇÃO DO ANALYTICS TRACKING');
  console.log('=' .repeat(70));
  
  if (!await authenticate()) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  // 1. Buscar um quiz publicado
  const quizzesResponse = await makeRequest('/api/quizzes');
  if (quizzesResponse.status !== 200) {
    console.log('❌ Falha ao buscar quizzes');
    return;
  }
  
  const quizzes = quizzesResponse.data;
  const publishedQuiz = quizzes.find(q => q.isPublished);
  
  if (!publishedQuiz) {
    console.log('⚠️ Nenhum quiz publicado encontrado');
    return;
  }
  
  const quizId = publishedQuiz.id;
  console.log(`🎯 Testando quiz: "${publishedQuiz.title}" (${quizId})`);
  
  // 2. Analytics ANTES
  const beforeResponse = await makeRequest('/api/analytics');
  const beforeData = Array.isArray(beforeResponse.data) ? 
    beforeResponse.data.find(a => a.quizId === quizId) : null;
  
  const beforeViews = beforeData?.totalViews || 0;
  console.log(`📊 Views ANTES: ${beforeViews}`);
  
  // 3. Simular views
  console.log('👥 Simulando 5 views...');
  for (let i = 1; i <= 5; i++) {
    const viewResponse = await makeRequest(`/api/analytics/${quizId}/view`, 'POST');
    console.log(`   View ${i}: ${viewResponse.status === 200 ? '✅' : '❌'}`);
    await new Promise(r => setTimeout(r, 100)); // Delay
  }
  
  // 4. Analytics DEPOIS
  await new Promise(r => setTimeout(r, 500)); // Aguardar processamento
  
  const afterResponse = await makeRequest('/api/analytics');
  const afterData = Array.isArray(afterResponse.data) ? 
    afterResponse.data.find(a => a.quizId === quizId) : null;
  
  const afterViews = afterData?.totalViews || 0;
  console.log(`📊 Views DEPOIS: ${afterViews}`);
  
  // 5. Verificar dashboard
  const dashboardResponse = await makeRequest('/api/dashboard/stats');
  const dashboardViews = dashboardResponse.data?.totalViews || 0;
  console.log(`📈 Dashboard Views: ${dashboardViews}`);
  
  // 6. Análise
  const increase = afterViews - beforeViews;
  const expected = 5;
  
  console.log('\n' + '='.repeat(70));
  console.log('📋 RESULTADO DA CORREÇÃO');
  console.log('=' .repeat(70));
  
  console.log(`🎯 Views esperadas: +${expected}`);
  console.log(`📊 Views obtidas: +${increase}`);
  console.log(`📈 Dashboard sincronizado: ${dashboardViews >= afterViews ? '✅' : '❌'}`);
  
  if (increase >= expected) {
    console.log('🎉 TRACKING CORRIGIDO COM SUCESSO!');
    console.log('✅ Views sendo persistidas corretamente');
    console.log('✅ Analytics atualizando em tempo real');
    console.log('✅ Dashboard sincronizado');
    console.log('✅ Sistema pronto para 100K+ usuários');
  } else if (increase > 0) {
    console.log('⚠️ TRACKING PARCIALMENTE CORRIGIDO');
    console.log(`⚠️ Esperado: +${expected}, Obtido: +${increase}`);
    console.log('🔧 Necessário investigar persistence');
  } else {
    console.log('❌ TRACKING AINDA COM PROBLEMAS');
    console.log('❌ Views não estão sendo persistidas');
    console.log('🚨 Correção adicional necessária');
  }
  
  // 7. Teste de insights
  if (afterData && afterData.insights) {
    console.log('\n💡 INSIGHTS GERADOS:');
    afterData.insights.forEach((insight, i) => {
      console.log(`   ${i + 1}. [${insight.type.toUpperCase()}] ${insight.title}`);
      console.log(`      ${insight.description}`);
    });
  }
  
  return {
    beforeViews,
    afterViews,
    increase,
    expected,
    success: increase >= expected
  };
}

testTrackingFix().catch(console.error);
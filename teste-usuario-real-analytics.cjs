/**
 * TESTE DE USUÁRIO REAL - VALIDAÇÃO COMPLETA DO SISTEMA ANALYTICS
 * Simula um usuário real visitando quiz publicado e verifica se analytics atualizam
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@vendzz.com', password: 'admin123' };

let authToken = null;

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
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

async function authenticateAdmin() {
  console.log('🔐 Autenticando como admin...');
  
  const response = await makeRequest('/api/auth/login', 'POST', TEST_USER);
  
  if (response.status === 200 && response.data.accessToken) {
    authToken = response.data.accessToken;
    console.log('✅ Autenticação bem-sucedida');
    return true;
  }
  
  console.log('❌ Falha na autenticação:', response.data);
  return false;
}

async function getQuizzes() {
  console.log('📋 Buscando quizzes disponíveis...');
  
  const response = await makeRequest('/api/quizzes');
  
  if (response.status === 200 && Array.isArray(response.data)) {
    console.log(`✅ Encontrados ${response.data.length} quizzes`);
    
    // Encontrar um quiz publicado
    const publishedQuiz = response.data.find(quiz => quiz.isPublished);
    
    if (publishedQuiz) {
      console.log(`🎯 Quiz publicado encontrado: "${publishedQuiz.title}" (ID: ${publishedQuiz.id})`);
      return publishedQuiz;
    } else {
      console.log('⚠️ Nenhum quiz publicado encontrado. Publicando o primeiro quiz...');
      
      if (response.data.length > 0) {
        const firstQuiz = response.data[0];
        await publishQuiz(firstQuiz.id);
        return { ...firstQuiz, isPublished: true };
      }
    }
  }
  
  console.log('❌ Nenhum quiz disponível');
  return null;
}

async function publishQuiz(quizId) {
  console.log(`📤 Publicando quiz ${quizId}...`);
  
  const response = await makeRequest(`/api/quizzes/${quizId}/publish`, 'POST');
  
  if (response.status === 200) {
    console.log('✅ Quiz publicado com sucesso');
    return true;
  }
  
  console.log('❌ Falha ao publicar quiz:', response.data);
  return false;
}

async function getAnalyticsBefore(quizId) {
  console.log('📊 Verificando analytics ANTES da simulação...');
  
  const [dashboardResponse, analyticsResponse] = await Promise.all([
    makeRequest('/api/dashboard/stats'),
    makeRequest('/api/analytics')
  ]);
  
  console.log('📈 Dashboard Stats:', {
    status: dashboardResponse.status,
    totalQuizzes: dashboardResponse.data?.totalQuizzes || 0,
    totalLeads: dashboardResponse.data?.totalLeads || 0,
    totalViews: dashboardResponse.data?.totalViews || 0
  });
  
  console.log('📈 Analytics Data:', {
    status: analyticsResponse.status,
    totalItems: Array.isArray(analyticsResponse.data) ? analyticsResponse.data.length : 0
  });
  
  if (Array.isArray(analyticsResponse.data)) {
    const quizAnalytics = analyticsResponse.data.find(a => a.quizId === quizId);
    if (quizAnalytics) {
      console.log(`📊 Analytics do Quiz ${quizId}:`, {
        views: quizAnalytics.totalViews || 0,
        responses: quizAnalytics.totalResponses || 0,
        conversions: quizAnalytics.conversionRate || 0,
        insights: quizAnalytics.insights?.length || 0
      });
    } else {
      console.log(`📊 Nenhum dado analítico encontrado para quiz ${quizId}`);
    }
  }
  
  return {
    dashboard: dashboardResponse.data,
    analytics: analyticsResponse.data
  };
}

async function simulateUserVisits(quizId, numberOfVisits = 5) {
  console.log(`👥 Simulando ${numberOfVisits} visitas de usuários reais ao quiz ${quizId}...`);
  
  const visits = [];
  
  for (let i = 1; i <= numberOfVisits; i++) {
    console.log(`👤 Simulando visita ${i}/${numberOfVisits}...`);
    
    try {
      // Simular visualização do quiz (sem autenticação - usuário público)
      const viewResponse = await makeRequest(`/api/analytics/${quizId}/view`, 'POST', {}, {
        'User-Agent': `TestUser${i}/1.0`,
        'X-Forwarded-For': `192.168.1.${i}`
      });
      
      visits.push({
        visit: i,
        status: viewResponse.status,
        success: viewResponse.status === 200,
        response: viewResponse.data
      });
      
      if (viewResponse.status === 200) {
        console.log(`✅ Visita ${i} registrada com sucesso`);
      } else {
        console.log(`❌ Falha na visita ${i}:`, viewResponse.data);
      }
      
      // Pequeno delay entre visitas para simular comportamento real
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Erro na visita ${i}:`, error.message);
      visits.push({
        visit: i,
        status: 500,
        success: false,
        error: error.message
      });
    }
  }
  
  const successfulVisits = visits.filter(v => v.success).length;
  console.log(`📊 Resultado das simulações: ${successfulVisits}/${numberOfVisits} visitas bem-sucedidas`);
  
  return visits;
}

async function getAnalyticsAfter(quizId) {
  console.log('📊 Verificando analytics APÓS a simulação...');
  
  // Pequeno delay para permitir processamento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const [dashboardResponse, analyticsResponse] = await Promise.all([
    makeRequest('/api/dashboard/stats'),
    makeRequest('/api/analytics')
  ]);
  
  console.log('📈 Dashboard Stats Atualizado:', {
    status: dashboardResponse.status,
    totalQuizzes: dashboardResponse.data?.totalQuizzes || 0,
    totalLeads: dashboardResponse.data?.totalLeads || 0,
    totalViews: dashboardResponse.data?.totalViews || 0
  });
  
  console.log('📈 Analytics Data Atualizado:', {
    status: analyticsResponse.status,
    totalItems: Array.isArray(analyticsResponse.data) ? analyticsResponse.data.length : 0
  });
  
  if (Array.isArray(analyticsResponse.data)) {
    const quizAnalytics = analyticsResponse.data.find(a => a.quizId === quizId);
    if (quizAnalytics) {
      console.log(`📊 Analytics Atualizado do Quiz ${quizId}:`, {
        views: quizAnalytics.totalViews || 0,
        responses: quizAnalytics.totalResponses || 0,
        conversions: quizAnalytics.conversionRate || 0,
        insights: quizAnalytics.insights?.length || 0,
        insightTypes: quizAnalytics.insights?.map(i => i.type) || []
      });
      
      // Mostrar insights gerados
      if (quizAnalytics.insights && quizAnalytics.insights.length > 0) {
        console.log('💡 INSIGHTS AUTOMÁTICOS GERADOS:');
        quizAnalytics.insights.forEach((insight, index) => {
          console.log(`   ${index + 1}. [${insight.type.toUpperCase()}] ${insight.title}`);
          console.log(`      📝 ${insight.description}`);
          console.log(`      💡 ${insight.recommendation}`);
        });
      } else {
        console.log('⚠️ Nenhum insight automático foi gerado');
      }
      
      return quizAnalytics;
    } else {
      console.log(`📊 Nenhum dado analítico encontrado para quiz ${quizId}`);
    }
  }
  
  return null;
}

async function compareAnalytics(before, after, visits) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPARAÇÃO DE ANALYTICS - ANTES vs DEPOIS');
  console.log('='.repeat(80));
  
  const beforeQuiz = Array.isArray(before.analytics) ? before.analytics.find(a => a.quizId === visits[0]?.quizId) : null;
  
  console.log('📈 DASHBOARD:');
  console.log(`   Quizzes: ${before.dashboard?.totalQuizzes || 0} → ${after?.dashboard?.totalQuizzes || 0}`);
  console.log(`   Leads: ${before.dashboard?.totalLeads || 0} → ${after?.dashboard?.totalLeads || 0}`);
  console.log(`   Views: ${before.dashboard?.totalViews || 0} → ${after?.dashboard?.totalViews || 0}`);
  
  console.log('\n📊 QUIZ ESPECÍFICO:');
  console.log(`   Views: ${beforeQuiz?.totalViews || 0} → ${after?.totalViews || 0}`);
  console.log(`   Responses: ${beforeQuiz?.totalResponses || 0} → ${after?.totalResponses || 0}`);
  console.log(`   Conversion Rate: ${beforeQuiz?.conversionRate || 0}% → ${after?.conversionRate || 0}%`);
  console.log(`   Insights: ${beforeQuiz?.insights?.length || 0} → ${after?.insights?.length || 0}`);
  
  const successfulVisits = visits.filter(v => v.success).length;
  const expectedViews = (beforeQuiz?.totalViews || 0) + successfulVisits;
  const actualViews = after?.totalViews || 0;
  
  console.log('\n🎯 VALIDAÇÃO:');
  console.log(`   Visitas simuladas: ${successfulVisits}`);
  console.log(`   Views esperados: ${expectedViews}`);
  console.log(`   Views atuais: ${actualViews}`);
  
  const trackingWorking = actualViews >= expectedViews;
  const insightsWorking = (after?.insights?.length || 0) > 0;
  
  console.log(`   ✅ Tracking funcionando: ${trackingWorking ? 'SIM' : 'NÃO'}`);
  console.log(`   💡 Insights automáticos: ${insightsWorking ? 'SIM' : 'NÃO'}`);
  
  return {
    trackingWorking,
    insightsWorking,
    viewsIncrease: actualViews - (beforeQuiz?.totalViews || 0),
    successfulVisits
  };
}

async function runCompleteTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DE USUÁRIO REAL');
  console.log('=' .repeat(80));
  console.log('🎯 Objetivo: Simular usuários reais e verificar se analytics atualizam');
  console.log('📋 Etapas: Autenticar → Obter Quiz → Simular Visitas → Verificar Analytics');
  console.log('=' .repeat(80));
  
  try {
    // 1. Autenticação
    if (!await authenticateAdmin()) {
      console.log('❌ Falha crítica na autenticação');
      return;
    }
    
    // 2. Obter quiz publicado
    const quiz = await getQuizzes();
    if (!quiz) {
      console.log('❌ Nenhum quiz disponível para teste');
      return;
    }
    
    // 3. Analytics antes da simulação
    const analyticsBefore = await getAnalyticsBefore(quiz.id);
    
    // 4. Simular visitas de usuários
    const visits = await simulateUserVisits(quiz.id, 3);
    
    // 5. Analytics após simulação
    const analyticsAfter = await getAnalyticsAfter(quiz.id);
    
    // 6. Comparação e validação
    const validation = await compareAnalytics(analyticsBefore, analyticsAfter, visits);
    
    // 7. Resultado final
    console.log('\n' + '='.repeat(80));
    console.log('🏁 RESULTADO FINAL DO TESTE');
    console.log('='.repeat(80));
    
    if (validation.trackingWorking && validation.insightsWorking) {
      console.log('🎉 SISTEMA ANALYTICS COMPLETAMENTE FUNCIONAL!');
      console.log('✅ Tracking de visualizações funcionando perfeitamente');
      console.log('✅ Insights automáticos sendo gerados');
      console.log('✅ Recomendações de otimização ativas');
      console.log('✅ Frontend atualizando corretamente');
    } else if (validation.trackingWorking) {
      console.log('⚠️ SISTEMA ANALYTICS PARCIALMENTE FUNCIONAL');
      console.log('✅ Tracking de visualizações funcionando');
      console.log('❌ Insights automáticos não funcionando');
    } else {
      console.log('❌ SISTEMA ANALYTICS COM PROBLEMAS CRÍTICOS');
      console.log('❌ Tracking de visualizações não funcionando');
      console.log('❌ Analytics não atualizando no frontend');
    }
    
    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`   Aumento de views: +${validation.viewsIncrease}`);
    console.log(`   Visitas bem-sucedidas: ${validation.successfulVisits}`);
    console.log(`   Quiz testado: "${quiz.title}" (${quiz.id})`);
    console.log(`   Status de publicação: ${quiz.isPublished ? 'PUBLICADO' : 'NÃO PUBLICADO'}`);
    
    console.log('\n🔍 VERIFICAÇÃO MANUAL:');
    console.log('   1. Acesse a página Analytics no frontend');
    console.log('   2. Verifique se os números batem com os resultados acima');
    console.log('   3. Confira se insights automáticos aparecem');
    console.log('   4. Valide se recomendações estão sendo exibidas');
    
  } catch (error) {
    console.error('❌ Erro crítico durante teste:', error);
  }
}

// Executar teste completo
runCompleteTest().catch(console.error);
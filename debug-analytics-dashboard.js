/**
 * DEBUG ANALYTICS DASHBOARD - Investigar valores zerados
 */

async function makeRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    console.log('✅ Autenticado com sucesso');
    console.log('🔑 Resposta completa:', JSON.stringify(response, null, 2));
    
    // O token pode estar em diferentes campos
    const token = response.token || response.accessToken || response.jwt;
    console.log('🔑 Token extraído:', token ? 'SIM' : 'NÃO');
    
    if (!token) {
      throw new Error('Token não encontrado na resposta de login');
    }
    
    return token;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    throw error;
  }
}

async function debugAnalytics() {
  console.log('🚀 DEBUG ANALYTICS DASHBOARD - Investigando valores zerados');
  console.log('================================================================================');
  
  try {
    // 1. Autenticar
    const token = await authenticate();
    
    // 2. Verificar dados diretos no SQLite
    console.log('\n📊 VERIFICAÇÃO DIRETA NO BANCO:');
    console.log('SELECT * FROM quiz_analytics;');
    console.log('Resultado esperado: test_1752139288018|ttaa_3bnFIXAAQq37ECpn|2025-07-10|4|0|0.0|');
    
    // 3. Testar endpoint dashboard/stats
    console.log('\n📈 TESTANDO /api/dashboard/stats:');
    const dashboardStats = await makeRequest('/api/dashboard/stats', { token });
    console.log('Dashboard Stats:', JSON.stringify(dashboardStats, null, 2));
    
    // 4. Testar endpoint analytics
    console.log('\n📊 TESTANDO /api/analytics:');
    const allAnalytics = await makeRequest('/api/analytics', { token });
    console.log('All Analytics:', JSON.stringify(allAnalytics, null, 2));
    
    // 5. Testar endpoint quizzes
    console.log('\n📝 TESTANDO /api/quizzes:');
    const quizzes = await makeRequest('/api/quizzes', { token });
    console.log(`Quizzes encontrados: ${quizzes?.length || 0}`);
    if (quizzes?.[0]) {
      console.log('Primeiro quiz:', {
        id: quizzes[0].id,
        title: quizzes[0].title,
        isPublished: quizzes[0].isPublished
      });
    }
    
    // 6. Testar analytics específico do quiz
    console.log('\n🎯 TESTANDO /api/analytics específico:');
    const testQuizId = 'ttaa_3bnFIXAAQq37ECpn';
    try {
      const specificAnalytics = await makeRequest(`/api/analytics/${testQuizId}`, { token });
      console.log(`Analytics específico para ${testQuizId}:`, JSON.stringify(specificAnalytics, null, 2));
    } catch (error) {
      console.log(`Erro ao buscar analytics específico: ${error.message}`);
    }
    
    // 7. Análise dos dados
    console.log('\n================================================================================');
    console.log('📋 ANÁLISE DOS DADOS:');
    console.log('================================================================================');
    
    console.log(`Dashboard - Total Views: ${dashboardStats?.totalViews || 0}`);
    console.log(`Dashboard - Total Leads: ${dashboardStats?.totalLeads || 0}`);
    console.log(`Dashboard - Total Quizzes: ${dashboardStats?.totalQuizzes || 0}`);
    console.log(`Analytics - Itens retornados: ${allAnalytics?.length || 0}`);
    
    if (allAnalytics && allAnalytics.length > 0) {
      const testQuizAnalytics = allAnalytics.find(a => a.quizId === testQuizId);
      if (testQuizAnalytics) {
        console.log(`\n🎯 Analytics do quiz teste:`, {
          quizId: testQuizAnalytics.quizId,
          totalViews: testQuizAnalytics.totalViews,
          totalResponses: testQuizAnalytics.totalResponses,
          conversionRate: testQuizAnalytics.conversionRate
        });
      } else {
        console.log(`❌ Quiz ${testQuizId} não encontrado nos analytics`);
      }
    }
    
    // 8. Diagnóstico final
    console.log('\n🔍 DIAGNÓSTICO:');
    if (dashboardStats?.totalViews === 0 && allAnalytics?.length === 0) {
      console.log('❌ PROBLEMA: Ambos endpoints retornam 0 - possível problema na query SQL');
    } else if (dashboardStats?.totalViews > 0 && allAnalytics?.length === 0) {
      console.log('⚠️ PROBLEMA: Dashboard tem dados mas /api/analytics está vazio');
    } else if (dashboardStats?.totalViews === 0 && allAnalytics?.length > 0) {
      console.log('⚠️ PROBLEMA: Analytics tem dados mas dashboard está zerado');
    } else {
      console.log('✅ Dados consistentes entre endpoints');
    }
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar debug
debugAnalytics().catch(console.error);
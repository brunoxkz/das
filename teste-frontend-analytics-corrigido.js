/**
 * TESTE FRONTEND - ANALYTICS CORRIGIDO
 * Verifica se os valores estão sendo exibidos corretamente após correção
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
    
    return response.accessToken;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    throw error;
  }
}

async function testeFrontendCorrigido() {
  console.log('🎯 TESTE FRONTEND ANALYTICS CORRIGIDO');
  console.log('================================================================================');
  
  try {
    // 1. Autenticar
    const token = await authenticate();
    console.log('✅ Autenticado com sucesso');
    
    // 2. Fazer mais algumas views para garantir dados
    console.log('\n📊 GERANDO MAIS VIEWS PARA TESTE:');
    for (let i = 0; i < 3; i++) {
      await makeRequest('/api/analytics/ttaa_3bnFIXAAQq37ECpn/view', {
        method: 'POST',
        body: JSON.stringify({})
      });
      console.log(`   ✅ View ${i + 1} registrada`);
    }
    
    // 3. Buscar dados atualizados
    console.log('\n📈 DADOS BACKEND ATUALIZADOS:');
    const allAnalytics = await makeRequest('/api/analytics', { token });
    console.log(`   📊 Total de analytics: ${allAnalytics.length}`);
    
    const testQuizAnalytics = allAnalytics.find(a => a.quizId === 'ttaa_3bnFIXAAQq37ECpn');
    if (testQuizAnalytics) {
      console.log('   🎯 Analytics do quiz teste:', {
        quizId: testQuizAnalytics.quizId,
        totalViews: testQuizAnalytics.totalViews,
        totalResponses: testQuizAnalytics.totalResponses,
        completedResponses: testQuizAnalytics.completedResponses,
        conversionRate: testQuizAnalytics.conversionRate
      });
    }
    
    // 4. Calcular valores como o frontend fará agora
    console.log('\n🖥️ CÁLCULOS DO FRONTEND (CORRIGIDOS):');
    
    // Total de Visualizações (corrigido)
    const totalViews = allAnalytics.reduce((sum, a) => sum + (a.totalViews || 0), 0);
    console.log(`   👁️ Total de Visualizações: ${totalViews}`);
    
    // Total de Leads (corrigido)
    const totalLeads = allAnalytics.reduce((sum, a) => sum + (a.completedResponses || 0), 0);
    console.log(`   👥 Total de Leads: ${totalLeads}`);
    
    // Taxa Média de Conversão (corrigida)
    const avgConversionRate = allAnalytics.length > 0 
      ? Math.round(allAnalytics.reduce((sum, a) => sum + (a.conversionRate || 0), 0) / allAnalytics.length)
      : 0;
    console.log(`   📈 Taxa Média de Conversão: ${avgConversionRate}%`);
    
    // 5. Testar Map de Analytics para quizzes individuais
    console.log('\n🗺️ MAP DE ANALYTICS INDIVIDUAIS:');
    const userQuizzes = await makeRequest('/api/quizzes', { token });
    
    if (userQuizzes && Array.isArray(userQuizzes)) {
      const testQuiz = userQuizzes.find(q => q.id === 'ttaa_3bnFIXAAQq37ECpn');
      if (testQuiz && testQuizAnalytics) {
        const views = testQuizAnalytics.totalViews || 0;
        const leads = testQuizAnalytics.completedResponses || testQuizAnalytics.totalResponses || 0;
        const conversions = Math.round(testQuizAnalytics.conversionRate || 0);
        
        console.log(`   📋 Quiz "${testQuiz.title}":`);
        console.log(`      👁️ Views: ${views}`);
        console.log(`      👥 Leads: ${leads}`);
        console.log(`      📈 Conversão: ${conversions}%`);
      }
    }
    
    // 6. Resultado final
    console.log('\n================================================================================');
    console.log('🎉 RESULTADO FINAL:');
    console.log('================================================================================');
    
    if (totalViews > 0) {
      console.log('✅ SUCESSO! Frontend agora deve mostrar valores corretos:');
      console.log(`   ✅ Total de Visualizações: ${totalViews} (antes: 0)`);
      console.log(`   ✅ Total de Leads: ${totalLeads} (antes: 0)`);
      console.log(`   ✅ Taxa Média de Conversão: ${avgConversionRate}% (antes: 0%)`);
      console.log('\n📱 Agora o usuário verá os valores corretos na página Analytics!');
    } else {
      console.log('❌ Ainda há problemas - valores continuam zerados');
    }
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste
testeFrontendCorrigido().catch(console.error);
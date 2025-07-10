/**
 * TESTE SUPER ANALYTICS CORRIGIDO
 * Valida se as correções nos analytics estão funcionando
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

async function testeAnalyticsCompleto() {
  console.log('🔍 TESTE ANALYTICS COMPLETO - VERIFICAÇÃO APÓS CORREÇÕES');
  console.log('================================================================================');
  
  try {
    // 1. Autenticar
    const token = await authenticate();
    console.log('✅ Autenticado com sucesso');
    
    const testQuizId = 'ttaa_3bnFIXAAQq37ECpn';
    
    // 2. Testar Analytics Principal
    console.log('\n📊 ANALYTICS PRINCIPAL (/api/analytics):');
    const allAnalytics = await makeRequest('/api/analytics', { token });
    const mainQuizAnalytics = allAnalytics.find(a => a.quizId === testQuizId);
    
    if (mainQuizAnalytics) {
      console.log('   ✅ Analytics Principal:', {
        totalViews: mainQuizAnalytics.totalViews,
        leadsWithContact: mainQuizAnalytics.leadsWithContact,
        completedResponses: mainQuizAnalytics.completedResponses,
        conversionRate: mainQuizAnalytics.conversionRate
      });
    } else {
      console.log('   ❌ Quiz não encontrado no analytics principal');
    }
    
    // 3. Testar Super Analytics
    console.log('\n🎯 SUPER ANALYTICS (/api/analytics/:quizId):');
    const superAnalytics = await makeRequest(`/api/analytics/${testQuizId}`, { token });
    
    if (superAnalytics && superAnalytics.length > 0) {
      console.log('   ✅ Super Analytics:', {
        id: superAnalytics[0].id,
        views: superAnalytics[0].views,
        completions: superAnalytics[0].completions,
        conversionRate: superAnalytics[0].conversionRate
      });
    } else {
      console.log('   ❌ Super Analytics não retornou dados');
    }
    
    // 4. Comparação dos resultados
    console.log('\n🔄 COMPARAÇÃO DE RESULTADOS:');
    console.log('================================================================================');
    
    if (mainQuizAnalytics && superAnalytics?.[0]) {
      const main = mainQuizAnalytics;
      const super_ = superAnalytics[0];
      
      console.log('📊 VIEWS:');
      console.log(`   Principal: ${main.totalViews} | Super: ${super_.views} | ${main.totalViews === super_.views ? '✅ IGUAL' : '❌ DIFERENTE'}`);
      
      console.log('👥 LEADS:');
      console.log(`   Principal (com contato): ${main.leadsWithContact}`);
      console.log(`   Principal (completados): ${main.completedResponses}`);
      console.log(`   Super (completions): ${super_.completions}`);
      console.log(`   ${main.completedResponses === super_.completions ? '✅ COMPLETIONS IGUAIS' : '❌ COMPLETIONS DIFERENTES'}`);
      
      console.log('📈 CONVERSÃO:');
      console.log(`   Principal: ${main.conversionRate}% | Super: ${super_.conversionRate}% | ${Math.abs(main.conversionRate - super_.conversionRate) < 0.1 ? '✅ SIMILAR' : '❌ DIFERENTE'}`);
      
      // 5. Status final
      console.log('\n🎯 STATUS FINAL:');
      const viewsOk = main.totalViews === super_.views;
      const completionsOk = main.completedResponses === super_.completions;
      const conversionOk = Math.abs(main.conversionRate - super_.conversionRate) < 0.1;
      
      if (viewsOk && completionsOk && conversionOk) {
        console.log('✅ TODOS OS ANALYTICS ESTÃO SINCRONIZADOS!');
        console.log('✅ Sistema pronto para produção');
      } else {
        console.log('❌ Ainda existem inconsistências entre os analytics');
        console.log(`   Views: ${viewsOk ? '✅' : '❌'}`);
        console.log(`   Completions: ${completionsOk ? '✅' : '❌'}`);
        console.log(`   Conversion: ${conversionOk ? '✅' : '❌'}`);
      }
    }
    
    // 6. Definições clarificadas
    console.log('\n📚 DEFINIÇÕES FINAIS IMPLEMENTADAS:');
    console.log('================================================================================');
    console.log('📊 VISUALIZAÇÕES: Contador de views públicas do quiz (trackings)');
    console.log('👥 LEADS: Respostas que captaram EMAIL ou TELEFONE (dados de contato)');
    console.log('✅ CONVERSÕES: Usuários que chegaram até a ÚLTIMA PÁGINA do quiz');
    console.log('   └─ Nota: Cada quiz pode ter uma última página diferente');
    console.log('📈 TAXA DE CONVERSÃO: (Conversões / Total de Views) * 100');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste
testeAnalyticsCompleto().catch(console.error);
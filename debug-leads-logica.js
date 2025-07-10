/**
 * DEBUG - LÓGICA DE LEADS E CONVERSÕES
 * Investiga como leads são contados e o que representa cada métrica
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

async function debugLeadsLogica() {
  console.log('🔍 DEBUG - LÓGICA DE LEADS E CONVERSÕES');
  console.log('================================================================================');
  
  try {
    // 1. Autenticar
    const token = await authenticate();
    console.log('✅ Autenticado com sucesso');
    
    // 2. Buscar respostas do quiz teste
    console.log('\n📊 INVESTIGANDO QUIZ DE TESTE:');
    const testQuizId = 'ttaa_3bnFIXAAQq37ECpn';
    
    try {
      const responses = await makeRequest(`/api/quiz-responses?quizId=${testQuizId}`, { token });
      console.log(`   📝 Total de respostas encontradas: ${responses?.length || 0}`);
      
      if (responses && responses.length > 0) {
        responses.forEach((response, index) => {
          console.log(`   📋 Resposta ${index + 1}:`, {
            id: response.id,
            quizId: response.quizId,
            hasEmail: response.responses ? 'SIM' : 'NÃO',
            hasPhone: response.responses ? 'SIM' : 'NÃO',
            metadata: response.metadata
          });
        });
      }
    } catch (error) {
      console.log(`   ❌ Erro ao buscar respostas: ${error.message}`);
    }
    
    // 3. Criar uma resposta de teste com email e telefone
    console.log('\n🧪 CRIANDO RESPOSTA DE TESTE COM EMAIL E TELEFONE:');
    
    const testResponse = {
      quizId: testQuizId,
      responses: [
        {
          elementId: 1,
          elementFieldId: "nome_teste",
          answer: "João Silva Teste"
        },
        {
          elementId: 2,
          elementFieldId: "email_analytics_test",
          answer: "joao.teste@vendzz.com"
        },
        {
          elementId: 3,
          elementFieldId: "telefone_teste",
          answer: "11999888777"
        }
      ],
      metadata: {
        isComplete: true,
        isPartial: false,
        completionPercentage: 100,
        completedAt: new Date().toISOString()
      }
    };
    
    try {
      const newResponse = await makeRequest('/api/quiz-responses', {
        method: 'POST',
        token,
        body: JSON.stringify(testResponse)
      });
      console.log('   ✅ Resposta de teste criada:', newResponse.id);
    } catch (error) {
      console.log(`   ⚠️ Erro ao criar resposta de teste: ${error.message}`);
    }
    
    // 4. Buscar analytics atualizados
    console.log('\n📈 ANALYTICS ATUALIZADOS:');
    const analytics = await makeRequest('/api/analytics', { token });
    const testQuizAnalytics = analytics.find(a => a.quizId === testQuizId);
    
    if (testQuizAnalytics) {
      console.log('   🎯 Analytics do quiz teste:', {
        totalViews: testQuizAnalytics.totalViews,
        totalResponses: testQuizAnalytics.totalResponses,
        completedResponses: testQuizAnalytics.completedResponses,
        conversionRate: testQuizAnalytics.conversionRate
      });
    }
    
    // 5. Explicar lógica atual
    console.log('\n📚 LÓGICA ATUAL DO SISTEMA:');
    console.log('================================================================================');
    console.log('📊 VISUALIZAÇÕES: Contador de views públicas do quiz (tracking /api/analytics/:id/view)');
    console.log('👥 LEADS (Total de Respostas): Qualquer resposta salva no quiz, completa ou não');
    console.log('✅ LEADS COMPLETOS (Completed Responses): Respostas com isComplete=true OU completionPercentage=100');
    console.log('📈 TAXA DE CONVERSÃO: (Respostas Completas / Total de Views) * 100');
    
    console.log('\n🔍 DEFINIÇÕES SUGERIDAS:');
    console.log('================================================================================');
    console.log('👥 LEADS = Respostas que captaram EMAIL ou TELEFONE (dados de contato)');
    console.log('✅ CONVERSÕES = Usuários que chegaram até a ÚLTIMA PÁGINA do quiz');
    console.log('📈 TAXA DE CONVERSÃO = (Conversões / Total de Views) * 100');
    
    // 6. Testar Super Analytics
    console.log('\n🎯 TESTANDO SUPER ANALYTICS:');
    try {
      const superAnalytics = await makeRequest(`/api/analytics/${testQuizId}`, { token });
      console.log('   📊 Super Analytics atual:', {
        total: superAnalytics?.length || 0,
        dados: superAnalytics?.[0] || 'NENHUM DADO'
      });
    } catch (error) {
      console.log(`   ❌ Erro no Super Analytics: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ ERRO NO DEBUG:', error.message);
  }
}

// Executar debug
debugLeadsLogica().catch(console.error);
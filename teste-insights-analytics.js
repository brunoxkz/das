/**
 * TESTE INSIGHTS ANALYTICS - Verificar funcionamento dos insights
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

async function testarInsights() {
  console.log('🔍 TESTE COMPLETO - INSIGHTS ANALYTICS');
  console.log('================================================================================');
  
  try {
    // 1. Autenticar
    const token = await authenticate();
    console.log('✅ Autenticação realizada');
    
    // 2. Buscar analytics completos
    console.log('\n📊 BUSCANDO ANALYTICS COMPLETOS:');
    const analytics = await makeRequest('/api/analytics', { token });
    
    console.log(`   📈 Total de quizzes analisados: ${analytics.length}`);
    
    // 3. Analisar insights de cada quiz
    console.log('\n🎯 INSIGHTS POR QUIZ:');
    analytics.forEach((quiz, index) => {
      console.log(`\n   Quiz ${index + 1}: ${quiz.quizTitle}`);
      console.log(`   📊 Views: ${quiz.totalViews}`);
      console.log(`   👥 Leads: ${quiz.leadsWithContact || quiz.totalResponses}`);
      console.log(`   ✅ Conversões: ${quiz.completedResponses}`);
      console.log(`   📈 Taxa: ${quiz.conversionRate}%`);
      
      // Verificar se tem insights
      if (quiz.insights && quiz.insights.length > 0) {
        console.log(`   💡 INSIGHTS (${quiz.insights.length}):`);
        quiz.insights.forEach((insight, i) => {
          console.log(`      ${i + 1}. Tipo: ${insight.type}`);
          console.log(`         Título: ${insight.title}`);
          console.log(`         Descrição: ${insight.description}`);
          if (insight.recommendation) {
            console.log(`         Recomendação: ${insight.recommendation}`);
          }
        });
      } else {
        console.log(`   ⚠️ NENHUM INSIGHT GERADO`);
      }
    });
    
    // 4. Verificar lógica de geração
    console.log('\n🤖 ANÁLISE DA LÓGICA DE INSIGHTS:');
    console.log('================================================================================');
    
    const insightsTypes = new Set();
    let totalInsights = 0;
    
    analytics.forEach(quiz => {
      if (quiz.insights) {
        totalInsights += quiz.insights.length;
        quiz.insights.forEach(insight => {
          insightsTypes.add(insight.type);
        });
      }
    });
    
    console.log(`📊 Total de insights gerados: ${totalInsights}`);
    console.log(`🔖 Tipos de insights encontrados: ${Array.from(insightsTypes).join(', ')}`);
    
    // 5. Testar cenários específicos
    console.log('\n🧪 CENÁRIOS DE INSIGHTS:');
    analytics.forEach(quiz => {
      const rate = quiz.conversionRate;
      const views = quiz.totalViews;
      const leads = quiz.leadsWithContact || quiz.totalResponses;
      
      console.log(`\n   ${quiz.quizTitle}:`);
      console.log(`   • Taxa de conversão: ${rate}%`);
      
      if (rate > 40) {
        console.log(`   ✅ ALTA CONVERSÃO: Deveria ter insight de "otimização para volume"`);
      } else if (rate < 15) {
        console.log(`   ❌ BAIXA CONVERSÃO: Deveria ter insight de "melhoria necessária"`);
      } else {
        console.log(`   📊 CONVERSÃO NORMAL: Deveria ter insight de "análise comparativa"`);
      }
      
      if (views < 10) {
        console.log(`   👀 POUCAS VIEWS: Deveria ter insight de "aumentar tráfego"`);
      } else if (views > 50) {
        console.log(`   🔥 MUITAS VIEWS: Deveria ter insight de "quiz popular"`);
      }
      
      if (leads === 0) {
        console.log(`   ⚠️ SEM LEADS: Deveria ter insight de "problema crítico"`);
      }
    });
    
    // 6. Verificar se insights são automáticos
    console.log('\n🔄 VERIFICAÇÃO DE AUTOMATIZAÇÃO:');
    console.log('================================================================================');
    
    console.log('1. GERAÇÃO AUTOMÁTICA:');
    console.log('   • Os insights são gerados no backend durante a consulta de analytics?');
    console.log('   • Existem regras baseadas nos dados (conversão, views, leads)?');
    console.log('   • São persistidos no banco ou calculados dinamicamente?');
    
    console.log('\n2. ATUALIZAÇÃO:');
    console.log('   • Os insights mudam conforme novos dados chegam?');
    console.log('   • Há cache dos insights ou são sempre recalculados?');
    
    console.log('\n3. PERSONALIZAÇÃO:');
    console.log('   • Insights variam baseado no tipo de quiz?');
    console.log('   • Consideram histórico do usuário?');
    console.log('   • Adaptam-se ao setor/nicho?');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste
testarInsights().catch(console.error);
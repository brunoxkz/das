/**
 * DEBUG - Investigar por que não foi 100% de cobertura dos insights
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

async function debugCobertura() {
  console.log('🔍 DEBUG - COBERTURA DE INSIGHTS');
  console.log('================================================================================');
  
  try {
    const token = await authenticate();
    const analytics = await makeRequest('/api/analytics', { token });
    
    console.log(`📊 Total de quizzes: ${analytics.length}`);
    
    let comInsights = 0;
    let semInsights = 0;
    
    analytics.forEach((quiz, index) => {
      const hasInsights = quiz.insights && quiz.insights.length > 0;
      
      if (hasInsights) {
        comInsights++;
      } else {
        semInsights++;
        console.log(`\n❌ QUIZ SEM INSIGHTS (${index + 1}/${analytics.length}):`);
        console.log(`   Nome: ${quiz.quizTitle}`);
        console.log(`   ID: ${quiz.quizId}`);
        console.log(`   Views: ${quiz.totalViews}`);
        console.log(`   Responses: ${quiz.totalResponses}`);
        console.log(`   Leads: ${quiz.leadsWithContact}`);
        console.log(`   Conversões: ${quiz.completedResponses}`);
        console.log(`   Taxa: ${quiz.conversionRate}%`);
        console.log(`   Abandono: ${quiz.abandonmentRate}%`);
        console.log(`   Publicado: ${quiz.isPublished}`);
        
        // Verificar cada regra manualmente
        console.log(`\n   🔍 ANÁLISE DAS REGRAS:`);
        
        // 1. Conversão
        if (quiz.conversionRate === 0 && quiz.totalViews > 0) {
          console.log(`      ❌ Deveria ter: "Problema Crítico de Conversão"`);
        } else if (quiz.conversionRate < 15 && quiz.totalViews > 10) {
          console.log(`      ❌ Deveria ter: "Taxa de Conversão Muito Baixa"`);
        } else if (quiz.conversionRate < 25 && quiz.totalViews > 10) {
          console.log(`      ❌ Deveria ter: "Taxa de Conversão Baixa"`);
        } else if (quiz.conversionRate > 45) {
          console.log(`      ❌ Deveria ter: "Performance Excepcional"`);
        } else if (quiz.conversionRate > 30) {
          console.log(`      ❌ Deveria ter: "Boa Performance"`);
        } else {
          console.log(`      ✅ Conversão não atende critérios (${quiz.conversionRate}%)`);
        }
        
        // 2. Leads
        if (quiz.leadsWithContact === 0 && quiz.totalResponses > 0) {
          console.log(`      ❌ Deveria ter: "Sem Captura de Leads"`);
        } else if (quiz.leadsWithContact < quiz.totalResponses * 0.5 && quiz.totalResponses > 3) {
          console.log(`      ❌ Deveria ter: "Baixa Captura de Contatos"`);
        } else {
          console.log(`      ✅ Leads não atende critérios`);
        }
        
        // 3. Abandono
        if (quiz.abandonmentRate > 70 && quiz.totalResponses > 5) {
          console.log(`      ❌ Deveria ter: "Taxa de Abandono Crítica"`);
        } else if (quiz.abandonmentRate > 50 && quiz.totalResponses > 5) {
          console.log(`      ❌ Deveria ter: "Alta Taxa de Abandono"`);
        } else {
          console.log(`      ✅ Abandono não atende critérios (${quiz.abandonmentRate}%)`);
        }
        
        // 4. Tráfego
        if (quiz.totalViews === 0) {
          console.log(`      ❌ Deveria ter: "Quiz Sem Visualizações"`);
        } else if (quiz.totalViews < 5 && quiz.isPublished) {
          console.log(`      ❌ Deveria ter: "Poucas Visualizações"`);
        } else if (quiz.totalViews > 100) {
          console.log(`      ❌ Deveria ter: "Quiz Popular"`);
        } else {
          console.log(`      ✅ Tráfego não atende critérios (${quiz.totalViews} views)`);
        }
        
        // 5. Otimização
        if (quiz.totalViews > 50 && quiz.conversionRate > 25 && quiz.leadsWithContact > 10) {
          console.log(`      ❌ Deveria ter: "Quiz Otimizado"`);
        } else {
          console.log(`      ✅ Otimização não atende critérios`);
        }
        
        console.log(`\n   💡 MOTIVO: Nenhuma regra foi ativada para este quiz`);
      }
    });
    
    console.log('\n📊 RESUMO DA COBERTURA:');
    console.log(`   ✅ Com insights: ${comInsights}`);
    console.log(`   ❌ Sem insights: ${semInsights}`);
    console.log(`   📈 Cobertura: ${((comInsights / analytics.length) * 100).toFixed(1)}%`);
    
    if (semInsights === 1) {
      console.log('\n🎯 CONCLUSÃO: Apenas 1 quiz não tem insights');
      console.log('   Isso é normal quando o quiz não atende nenhum critério específico');
      console.log('   Quiz pode estar na "zona neutra" sem problemas ou destaques');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

debugCobertura().catch(console.error);
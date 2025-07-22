const { execSync } = require('child_process');

async function completarQuizComFormatoArray() {
  console.log('🧪 TESTE: COMPLETAR QUIZ COM FORMATO DE ARRAY');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:5000';
  const quizId = 'Xj7jELWEJHHhM14Ky-nhW';
  
  // Função auxiliar para fazer requests
  async function request(method, url, data = null) {
    const fetch = (await import('node-fetch')).default;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${baseUrl}${url}`, options);
    const text = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = text;
    }
    
    return { status: response.status, data: parsedData };
  }
  
  console.log(`📝 Quiz ID: ${quizId}`);
  console.log('🎯 Objetivo: Testar formato de array para responses');
  console.log('🔧 Baseado na validação: !Array.isArray(req.body.responses)\n');
  
  let sucessos = 0;
  let falhas = 0;
  
  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`${i.toString().padStart(2, '0')}. Completando quiz (${i}/10):`);
      
      // Formato correto com responses como ARRAY
      const submissionData = {
        responses: [
          {
            questionId: 'question_1',
            answer: `Resposta ${i}`,
            type: 'text'
          },
          {
            questionId: 'question_2', 
            answer: `Escolha ${i % 3 + 1}`,
            type: 'multiple_choice'
          },
          {
            questionId: 'nome',
            answer: `Teste Usuario ${i}`,
            type: 'text'
          },
          {
            questionId: 'email',
            answer: `teste${i}@vendzz.com`,
            type: 'email'
          }
        ],
        metadata: {
          sessionId: `session_${Date.now()}_${i}`,
          userAgent: 'VendzzTestBot/1.0',
          startTime: Date.now() - 60000,
          completedAt: new Date().toISOString(),
          timeSpent: 60000 + Math.random() * 30000,
          totalPages: 4,
          completionPercentage: 100
        },
        leadData: {
          nome: `Teste Usuario ${i}`,
          email: `teste${i}@vendzz.com`,
          score: Math.floor(Math.random() * 100) + 1
        },
        totalPages: 4,
        timeSpent: 60000 + Math.random() * 30000
      };
      
      console.log(`   📤 Enviando com responses[${submissionData.responses.length}]...`);
      const result = await request('POST', `/api/quizzes/${quizId}/submit`, submissionData);
      
      if (result.status === 201 || result.status === 200) {
        console.log(`   ✅ SUCESSO! Status: ${result.status}`);
        console.log(`   🆔 Response ID: ${result.data.responseId || 'N/A'}`);
        console.log(`   ⏱️  Tempo processamento: ${result.data.processingTime || 'N/A'}`);
        console.log(`   🔔 Notificação automática processada!`);
        sucessos++;
        
      } else {
        console.log(`   ❌ Falha: Status ${result.status}`);
        if (typeof result.data === 'string') {
          console.log(`   📄 Erro: ${result.data.substring(0, 80)}...`);
        } else {
          console.log(`   📄 Erro: ${JSON.stringify(result.data).substring(0, 80)}...`);
        }
        falhas++;
      }
      
      // Pausa de 1.5s entre submissions para ver rotação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`   ❌ Erro na tentativa ${i}: ${error.message}`);
      falhas++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADOS FINAIS');
  console.log('=' .repeat(60));
  console.log(`✅ Sucessos: ${sucessos}/10`);
  console.log(`❌ Falhas: ${falhas}/10`);
  console.log(`📈 Taxa de Sucesso: ${((sucessos/10) * 100).toFixed(1)}%`);
  
  if (sucessos > 0) {
    console.log('\n🎉 SISTEMA DE MENSAGENS ROTATIVAS ATIVADO!');
    console.log('🔔 Notificações push enviadas automaticamente');
    console.log('🔄 Mensagens devem ter rotacionado entre as 6 configuradas');
    console.log('📱 Verifique dispositivos para confirmar recebimento');
    console.log('\n💡 Acesse /admin/adm-push para ver estatísticas');
  }
  
  // Verificar estatísticas final
  try {
    console.log('\n📊 ESTATÍSTICAS PUSH NOTIFICATIONS:');
    console.log('-' .repeat(40));
    
    const statsResult = await request('GET', '/api/admin/push-stats');
    if (statsResult.status === 200) {
      const stats = statsResult.data;
      console.log(`📊 Total dispositivos: ${stats.total || 0}`);
      console.log(`🔥 Enviadas hoje: ${stats.sentToday || 0}`);  
      console.log(`⚡ Recentes (24h): ${stats.recent || 0}`);
    } else {
      console.log(`❌ Erro ao buscar stats: ${statsResult.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro stats: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🚀 TESTE FINALIZADO - SISTEMA DE ROTAÇÃO TESTADO!');
  console.log('=' .repeat(60));
}

// Executar teste
completarQuizComFormatoArray().catch(console.error);
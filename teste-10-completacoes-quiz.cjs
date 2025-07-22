const { execSync } = require('child_process');

async function completarQuiz10Vezes() {
  console.log('🧪 TESTE: COMPLETANDO QUIZ 10 VEZES PARA TESTAR MENSAGENS ROTATIVAS');
  console.log('=' .repeat(70));
  
  const baseUrl = 'http://localhost:5000';
  const quizId = 'Xj7jELWEJHHhM14Ky-nhW';
  
  // Função auxiliar para fazer requests
  async function request(method, url, data = null, headers = {}) {
    const fetch = (await import('node-fetch')).default;
    const options = {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${baseUrl}${url}`, options);
    return { status: response.status, data: await response.text() };
  }
  
  console.log(`📝 Quiz ID: ${quizId}`);
  console.log(`🎯 Objetivo: Completar quiz 10 vezes e verificar rotação de mensagens`);
  console.log('\n🚀 Iniciando completações...\n');
  
  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`${i.toString().padStart(2, '0')}. Completando quiz (tentativa ${i}/10)...`);
      
      // Dados de exemplo para submission do quiz
      const submissionData = {
        answers: {
          'question_1': 'Resposta exemplo ' + i,
          'question_2': 'Opção ' + (i % 3 + 1),
          'email': `teste${i}@exemplo.com`,
          'nome': `Usuário Teste ${i}`
        },
        completedAt: new Date().toISOString(),
        submissionId: `test_submission_${i}_${Date.now()}`
      };
      
      // Fazer submission do quiz
      const result = await request('POST', `/api/quizzes/${quizId}/submit`, submissionData);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`    ✅ Quiz completado com sucesso (Status: ${result.status})`);
        
        // Verificar se houve notificação push
        try {
          const responseData = JSON.parse(result.data);
          if (responseData.pushNotificationSent) {
            console.log(`    🔔 Notificação push enviada automaticamente`);
            if (responseData.rotatingMessage) {
              console.log(`    🔄 Mensagem rotativa: "${responseData.rotatingMessage.title}"`);
              console.log(`    💬 Conteúdo: "${responseData.rotatingMessage.message}"`);
            }
          }
        } catch (e) {
          // Resposta pode não ser JSON, tudo bem
        }
        
        // Pequena pausa entre as completações
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } else {
        console.log(`    ❌ Erro ao completar quiz (Status: ${result.status})`);
        console.log(`    📄 Resposta: ${result.data.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`    ❌ Erro na tentativa ${i}: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('📊 VERIFICANDO ESTATÍSTICAS DE PUSH NOTIFICATIONS');
  console.log('=' .repeat(70));
  
  // Verificar estatísticas do sistema push
  try {
    const statsResult = await request('GET', '/api/admin/push-stats');
    if (statsResult.status === 200) {
      const stats = JSON.parse(statsResult.data);
      console.log(`📈 Total de dispositivos: ${stats.total || 0}`);
      console.log(`🔔 Notificações enviadas hoje: ${stats.sentToday || 0}`);
      console.log(`⚡ Notificações recentes (24h): ${stats.recent || 0}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar estatísticas: ${error.message}`);
  }
  
  // Verificar configuração de mensagens rotativas
  try {
    console.log('\n🔄 VERIFICANDO SISTEMA DE MENSAGENS ROTATIVAS');
    console.log('-' .repeat(50));
    
    const configResult = await request('GET', '/api/admin/push-config');
    if (configResult.status === 200) {
      const config = JSON.parse(configResult.data);
      console.log(`🔄 Rotação ativada: ${config.rotationEnabled ? 'SIM' : 'NÃO'}`);
      console.log(`📝 Total de mensagens configuradas: ${config.messages?.length || 0}`);
      
      if (config.messages && config.messages.length > 0) {
        console.log('\n📋 Mensagens configuradas:');
        config.messages.forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg.active ? '✅' : '❌'} "${msg.title}" - ${msg.message}`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar configuração: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('🎉 TESTE DE 10 COMPLETAÇÕES FINALIZADO!');
  console.log('=' .repeat(70));
  console.log('📱 Verifique o painel admin em /admin/adm-push para ver as estatísticas atualizadas');
  console.log('🔔 Se você tiver push notifications ativadas, deve ter recebido notificações rotativas');
  console.log('💡 O sistema alterna automaticamente entre as mensagens configuradas');
}

// Executar teste
completarQuiz10Vezes().catch(console.error);
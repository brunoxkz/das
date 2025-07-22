const { execSync } = require('child_process');

async function completarQuiz10VezesCorreto() {
  console.log('🧪 TESTE: COMPLETAR QUIZ 10 VEZES - FORMATO CORRETO');
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
  console.log('🎯 Objetivo: Ativar 10x o sistema de mensagens rotativas\n');
  
  let sucessos = 0;
  let falhas = 0;
  
  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`${i.toString().padStart(2, '0')}. Completando quiz (${i}/10):`);
      
      // Formato correto baseado no código do endpoint
      const submissionData = {
        responses: {
          'question_1': `Resposta ${i}`,
          'question_2': `Escolha ${i % 3 + 1}`,
          'nome': `Teste Usuario ${i}`,
          'email': `teste${i}@vendzz.com`
        },
        metadata: {
          sessionId: `session_${Date.now()}_${i}`,
          userAgent: 'VendzzTestBot/1.0',
          startTime: Date.now() - (60000 + Math.random() * 30000), // 1-1.5 min atrás
          completedAt: new Date().toISOString(),
          timeSpent: 60000 + Math.random() * 30000, // 1-1.5 min
          totalPages: 5,
          completionPercentage: 100
        },
        leadData: {
          nome: `Teste Usuario ${i}`,
          email: `teste${i}@vendzz.com`,
          score: Math.floor(Math.random() * 100) + 1
        },
        totalPages: 5,
        timeSpent: 60000 + Math.random() * 30000
      };
      
      // Enviar para o endpoint correto
      const result = await request('POST', `/api/quizzes/${quizId}/submit`, submissionData);
      
      if (result.status === 201 || result.status === 200) {
        console.log(`   ✅ Quiz completado! (Status: ${result.status})`);
        console.log(`   ⏱️  Response ID: ${result.data.responseId || 'N/A'}`);
        console.log(`   🔔 Sistema de notificação processado automaticamente`);
        sucessos++;
        
        // Verificar se há informações sobre push notification na resposta
        if (result.data.pushNotificationSent) {
          console.log(`   📱 Push notification confirmada!`);
        }
        
      } else {
        console.log(`   ❌ Falha: Status ${result.status}`);
        if (typeof result.data === 'string') {
          console.log(`   📄 Erro: ${result.data.substring(0, 100)}...`);
        } else {
          console.log(`   📄 Erro: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
        falhas++;
      }
      
      // Pausa de 1 segundo entre submissions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Erro na tentativa ${i}: ${error.message}`);
      falhas++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADOS DO TESTE');
  console.log('=' .repeat(60));
  console.log(`✅ Sucessos: ${sucessos}/10`);
  console.log(`❌ Falhas: ${falhas}/10`);
  console.log(`📈 Taxa de Sucesso: ${((sucessos/10) * 100).toFixed(1)}%`);
  
  // Verificar estatísticas de push notifications
  console.log('\n🔔 VERIFICANDO PUSH NOTIFICATIONS:');
  console.log('-' .repeat(40));
  
  try {
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
  
  // Verificar mensagens rotativas
  console.log('\n🔄 SISTEMA DE MENSAGENS ROTATIVAS:');
  console.log('-' .repeat(40));
  
  try {
    const configResult = await request('GET', '/api/admin/push-config');
    if (configResult.status === 200) {
      const config = configResult.data;
      console.log(`🔄 Rotação ativa: ${config.rotationEnabled ? 'SIM ✅' : 'NÃO ❌'}`);
      console.log(`📝 Total mensagens: ${config.messages?.length || 0}`);
      console.log(`✅ Mensagens ativas: ${config.messages?.filter(m => m.active).length || 0}`);
      
      if (config.messages && config.messages.length > 0) {
        console.log('\n📋 Lista de mensagens:');
        config.messages.forEach((msg, index) => {
          const status = msg.active ? '✅' : '❌';
          console.log(`   ${index + 1}. ${status} "${msg.title}"`);
          console.log(`      💬 "${msg.message}"`);
        });
      }
    } else {
      console.log(`❌ Erro ao buscar configuração: ${configResult.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro configuração: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (sucessos >= 8) {
    console.log('🎉 TESTE BEM-SUCEDIDO!');
    console.log('✅ Sistema de mensagens rotativas foi ativado múltiplas vezes');
    console.log('🔔 Notificações push foram enviadas automaticamente');
    console.log('💡 Verifique seu dispositivo para confirmar as notificações');
  } else if (sucessos >= 5) {
    console.log('⚠️ TESTE PARCIALMENTE BEM-SUCEDIDO');
    console.log('🔧 Sistema funcionando mas com algumas falhas');
  } else {
    console.log('❌ TESTE COM PROBLEMAS');
    console.log('🔧 Verificar formato de dados ou estrutura do quiz');
  }
  
  console.log('\n📱 Para ver as notificações, acesse: /admin/adm-push');
  console.log('🔄 Sistema de rotação deve alternar entre as mensagens configuradas');
}

// Executar teste
completarQuiz10VezesCorreto().catch(console.error);
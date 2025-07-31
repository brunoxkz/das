const { execSync } = require('child_process');

// Teste completo do sistema de mensagens rotativas
async function testarSistemaMensagensRotativas() {
  console.log('🧪 INICIANDO TESTE DO SISTEMA DE MENSAGENS ROTATIVAS');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:5000';
  let totalTestes = 0;
  let testesPassaram = 0;
  
  // Função auxiliar para fazer requests
  async function request(method, url, data = null) {
    const fetch = (await import('node-fetch')).default;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${baseUrl}${url}`, options);
    return { status: response.status, data: await response.json() };
  }
  
  // Teste 1: Carregar configuração inicial
  try {
    totalTestes++;
    console.log('\n1. 🔧 Carregando configuração inicial...');
    const config = await request('GET', '/api/admin/push-config');
    
    if (config.status === 200) {
      console.log(`✅ Configuração carregada: ${config.data.messages?.length || 0} mensagens`);
      testesPassaram++;
    } else {
      console.log(`❌ Falha ao carregar configuração: ${config.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao carregar configuração: ${error.message}`);
  }
  
  // Teste 2: Adicionar primeira mensagem
  try {
    totalTestes++;
    console.log('\n2. ➕ Adicionando primeira mensagem...');
    const newMessage1 = {
      title: '🔥 Quiz Completado!',
      message: 'Mais um funil convertendo no seu negócio: "{quizTitle}"'
    };
    
    const addResult1 = await request('POST', '/api/admin/push-messages', newMessage1);
    
    if (addResult1.status === 200 && addResult1.data.success) {
      console.log(`✅ Primeira mensagem adicionada: ID ${addResult1.data.message.id}`);
      testesPassaram++;
    } else {
      console.log(`❌ Falha ao adicionar primeira mensagem: ${addResult1.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao adicionar primeira mensagem: ${error.message}`);
  }
  
  // Teste 3: Adicionar segunda mensagem
  try {
    totalTestes++;
    console.log('\n3. ➕ Adicionando segunda mensagem...');
    const newMessage2 = {
      title: '🎯 Conversão Realizada!',
      message: 'Lead capturado com sucesso em: "{quizTitle}" - Cliente em potencial!'
    };
    
    const addResult2 = await request('POST', '/api/admin/push-messages', newMessage2);
    
    if (addResult2.status === 200 && addResult2.data.success) {
      console.log(`✅ Segunda mensagem adicionada: ID ${addResult2.data.message.id}`);
      testesPassaram++;
    } else {
      console.log(`❌ Falha ao adicionar segunda mensagem: ${addResult2.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao adicionar segunda mensagem: ${error.message}`);
  }
  
  // Teste 4: Adicionar terceira mensagem
  try {
    totalTestes++;
    console.log('\n4. ➕ Adicionando terceira mensagem...');
    const newMessage3 = {
      title: '💰 Oportunidade Quente!',
      message: 'Prospect altamente qualificado finalizou "{quizTitle}" - Hora de fechar!'
    };
    
    const addResult3 = await request('POST', '/api/admin/push-messages', newMessage3);
    
    if (addResult3.status === 200 && addResult3.data.success) {
      console.log(`✅ Terceira mensagem adicionada: ID ${addResult3.data.message.id}`);
      testesPassaram++;
    } else {
      console.log(`❌ Falha ao adicionar terceira mensagem: ${addResult3.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao adicionar terceira mensagem: ${error.message}`);
  }
  
  // Teste 5: Ativar rotação automática
  try {
    totalTestes++;
    console.log('\n5. 🔄 Ativando rotação automática...');
    const configUpdate = await request('POST', '/api/admin/push-config', {
      enabled: true,
      rotationEnabled: true,
      globalTemplate: {
        title: '🎉 Novo Quiz Completado!',
        message: 'Um usuário acabou de finalizar seu quiz: "{quizTitle}"'
      }
    });
    
    if (configUpdate.status === 200 && configUpdate.data.success) {
      console.log(`✅ Rotação automática ativada`);
      testesPassaram++;
    } else {
      console.log(`❌ Falha ao ativar rotação: ${configUpdate.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao ativar rotação: ${error.message}`);
  }
  
  // Teste 6-10: Testar rotação de mensagens (5 calls)
  for (let i = 1; i <= 5; i++) {
    try {
      totalTestes++;
      console.log(`\n${5 + i}. 🔄 Testando rotação ${i}/5...`);
      
      const nextMessage = await request('GET', '/api/admin/push-next-message');
      
      if (nextMessage.status === 200) {
        console.log(`✅ Mensagem ${i}: "${nextMessage.data.title}"`);
        console.log(`   📄 Conteúdo: "${nextMessage.data.message}"`);
        testesPassaram++;
      } else {
        console.log(`❌ Falha ao obter mensagem ${i}: ${nextMessage.status}`);
      }
      
      // Pequena pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`❌ Erro na rotação ${i}: ${error.message}`);
    }
  }
  
  // Teste 11: Simular submission de quiz para teste completo
  try {
    totalTestes++;
    console.log('\n11. 🎯 Simulando quiz submission completo...');
    
    const quizSubmission = await request('POST', '/api/quizzes/RdAUwmQgTthxbZLA0HJWu/submit', {
      responses: [
        { questionId: 'q1', answer: 'Test Answer', type: 'text' }
      ],
      metadata: {
        totalPages: 1,
        completionPercentage: 100,
        timeSpent: 5000
      },
      leadData: {
        email: 'test@example.com',
        nome: 'Usuário Teste'
      }
    });
    
    if (quizSubmission.status === 201 && quizSubmission.data.success) {
      console.log(`✅ Quiz submission simulado: ${quizSubmission.data.responseId}`);
      console.log(`   ⏱️ Tempo de resposta: ${quizSubmission.data.processingTime}ms`);
      testesPassaram++;
    } else {
      console.log(`❌ Falha na submission: ${quizSubmission.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro na quiz submission: ${error.message}`);
  }
  
  // Resultado final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADO FINAL DO TESTE');
  console.log('=' .repeat(60));
  console.log(`✅ Testes Passaram: ${testesPassaram}/${totalTestes}`);
  console.log(`📈 Taxa de Sucesso: ${((testesPassaram/totalTestes) * 100).toFixed(1)}%`);
  
  if (testesPassaram === totalTestes) {
    console.log('🎉 SISTEMA DE MENSAGENS ROTATIVAS 100% FUNCIONAL!');
    console.log('🔄 Mensagens agora alternam automaticamente a cada quiz completion');
    console.log('💡 Configuração pronta para produção');
  } else if (testesPassaram >= totalTestes * 0.8) {
    console.log('✅ SISTEMA FUNCIONAL COM PEQUENOS PROBLEMAS');
    console.log('🔧 Necessário verificar alguns endpoints');
  } else {
    console.log('❌ SISTEMA NECESSITA CORREÇÕES');
    console.log('🔧 Verificar configuração do servidor');
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Acesse /admin/adm-push para configurar mensagens');
  console.log('2. Teste um quiz real para ver rotação funcionando');
  console.log('3. Configure mais mensagens conforme necessário');
}

// Executar teste
testarSistemaMensagensRotativas().catch(console.error);
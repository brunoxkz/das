const fs = require('fs');

/**
 * TESTE COMPLETO DOS 5 TIPOS DE CAMPANHAS
 * Disparo real para brunotamaso@gmail.com
 */

console.log('🚀 TESTE COMPLETO - 5 TIPOS DE CAMPANHAS');
console.log('📧 Disparo para: brunotamaso@gmail.com');
console.log('=' .repeat(60));

let authToken = '';

// Login e obter token
async function login() {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    if (data.accessToken) {
      authToken = data.accessToken;
      console.log('✅ Login realizado com sucesso');
      return true;
    } else {
      console.error('❌ Erro no login:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro de conexão no login:', error.message);
    return false;
  }
}

// Teste 1: SMS Campaign
async function testSMSCampaign() {
  console.log('\n📱 TESTE 1: SMS CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/sms-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste SMS - brunotamaso@gmail.com',
        message: 'Teste de disparo SMS para validação do sistema Vendzz',
        quizId: global.testQuizId || 'quiz-test-id',
        phones: ['5511999887766'],
        scheduled: false
      })
    });

    const data = await response.json();
    console.log('📱 SMS Response:', data.success ? '✅ SUCESSO' : '❌ FALHA', data);
    return data.success;
  } catch (error) {
    console.error('❌ Erro SMS:', error.message);
    return false;
  }
}

// Teste 2: Email Campaign  
async function testEmailCampaign() {
  console.log('\n📧 TESTE 2: EMAIL CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/email-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste Email - Sistema Vendzz',
        subject: 'Teste de Disparo Email - Sistema Funcionando',
        content: '<h1>Sistema Vendzz</h1><p>Teste de disparo de email para validação completa do sistema.</p><p>Email de teste enviado para: brunotamaso@gmail.com</p>',
        quizId: global.testQuizId || 'quiz-test-id',
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    console.log('📧 Email Response:', data.success ? '✅ SUCESSO' : '❌ FALHA', data);
    return data.success;
  } catch (error) {
    console.error('❌ Erro Email:', error.message);
    return false;
  }
}

// Teste 3: WhatsApp Campaign
async function testWhatsAppCampaign() {
  console.log('\n💬 TESTE 3: WHATSAPP CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/whatsapp-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste WhatsApp - Sistema Vendzz',
        messages: ['Teste de disparo WhatsApp para validação do sistema Vendzz'],
        quizId: global.testQuizId || 'quiz-test-id',
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    console.log('💬 WhatsApp Response:', data.success ? '✅ SUCESSO' : '❌ FALHA', data);
    return data.success;
  } catch (error) {
    console.error('❌ Erro WhatsApp:', error.message);
    return false;
  }
}

// Teste 4: Telegram Campaign
async function testTelegramCampaign() {
  console.log('\n✈️ TESTE 4: TELEGRAM CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/telegram-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste Telegram - Sistema Vendzz',
        messages: ['Teste de disparo Telegram para validação do sistema Vendzz'],
        quizId: global.testQuizId || 'quiz-test-id',
        chatIds: ['@brunotamaso'],
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    console.log('✈️ Telegram Response:', data.success ? '✅ SUCESSO' : '❌ FALHA', data);
    return data.success;
  } catch (error) {
    console.error('❌ Erro Telegram:', error.message);
    return false;
  }
}

// Teste 5: Voice Campaign
async function testVoiceCampaign() {
  console.log('\n📞 TESTE 5: VOICE CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/voice-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste Voice - Sistema Vendzz',
        voiceMessage: 'Olá, este é um teste de disparo de voz do sistema Vendzz para validação completa.',
        quizId: global.testQuizId || 'quiz-test-id',
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    console.log('📞 Voice Response:', data.success ? '✅ SUCESSO' : '❌ FALHA', data);
    return data.success;
  } catch (error) {
    console.error('❌ Erro Voice:', error.message);
    return false;
  }
}

// Teste de Status dos Créditos
async function testUserCredits() {
  console.log('\n💳 TESTE: VERIFICAÇÃO DE CRÉDITOS');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/user-credits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    console.log('💳 Créditos:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro Créditos:', error.message);
    return false;
  }
}

// Criar quiz de teste
async function createTestQuiz() {
  console.log('\n📋 CRIANDO QUIZ DE TESTE');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/api/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Quiz Teste para Campanhas',
        description: 'Quiz criado automaticamente para testes de campanhas',
        pages: [
          {
            id: 'page1',
            title: 'Teste',
            elements: [
              {
                id: 'email_field',
                type: 'email',
                properties: { label: 'Seu email:', placeholder: 'email@exemplo.com', required: true }
              },
              {
                id: 'phone_field', 
                type: 'phone',
                properties: { label: 'Seu telefone:', placeholder: '(11) 99999-9999', required: true }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (data.success && data.quiz) {
      console.log('✅ Quiz criado:', data.quiz.id);
      return data.quiz.id;
    } else {
      console.error('❌ Erro ao criar quiz:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar quiz:', error.message);
    return null;
  }
}

// Função principal
async function runCompleteTest() {
  console.log('🔐 Fazendo login...');
  const loginSuccess = await login();
  
  if (!loginSuccess) {
    console.log('❌ TESTE FALHOU: Não foi possível fazer login');
    return;
  }

  // Usar quiz válido do usuário admin
  const existingQuizId = 'G6_IWD6lNpzIlnqb6EVnm'; // Quiz confirmado do admin
  console.log('📋 Usando quiz válido do admin:', existingQuizId);
  global.testQuizId = existingQuizId;

  // Array para armazenar resultados
  const results = [];

  // Executar todos os testes
  console.log('\n🔍 Verificando créditos do usuário...');
  await testUserCredits();

  console.log('\n🚀 Iniciando testes de disparo...');
  
  results.push({ type: 'SMS', success: await testSMSCampaign() });
  results.push({ type: 'Email', success: await testEmailCampaign() });
  results.push({ type: 'WhatsApp', success: await testWhatsAppCampaign() });
  results.push({ type: 'Telegram', success: await testTelegramCampaign() });
  results.push({ type: 'Voice', success: await testVoiceCampaign() });

  // Relatório final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=' .repeat(60));

  const successful = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.type}: ${result.success ? 'FUNCIONANDO' : 'FALHOU'}`);
  });

  console.log(`\n📈 Taxa de Sucesso: ${successful}/${total} (${((successful/total)*100).toFixed(1)}%)`);
  console.log(`📧 Email de teste: brunotamaso@gmail.com`);
  console.log(`🔄 Status: ${successful === total ? 'TODOS OS SISTEMAS FUNCIONANDO' : 'ALGUNS SISTEMAS REQUEREM CORREÇÃO'}`);

  if (successful === total) {
    console.log('\n🎉 SISTEMA COMPLETO 100% FUNCIONAL');
    console.log('✅ Todas as campanhas foram criadas com sucesso');
    console.log('📧 Verificar email brunotamaso@gmail.com para confirmação');
  } else {
    console.log('\n⚠️ ALGUNS SISTEMAS REQUEREM ATENÇÃO');
    console.log('🔧 Revisar logs acima para identificar problemas');
  }
}

runCompleteTest();
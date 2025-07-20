const TEST_CONFIG = {
  EMAIL: 'brunotamaso@gmail.com',
  QUIZ_ID: 'G6_IWD6lNpzIlnqb6EVnm', // Quiz existente do admin
  BASE_URL: 'http://localhost:5000'
};

let authToken = null;

// Login function
async function login() {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    if (data.accessToken || data.token || data.access_token) {
      authToken = data.accessToken || data.token || data.access_token;
      console.log('✅ Login realizado com sucesso');
      return true;
    } else {
      console.log('❌ Falha no login:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
    return false;
  }
}

// Test SMS Campaign (correção baseada nos logs)
async function testSMSCampaign() {
  console.log('\n📱 TESTE SMS CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/sms-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste SMS Sistema Vendzz',
        message: 'SMS de teste do sistema Vendzz - funcionando perfeitamente!',
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    return { success: data.success || !data.error, response: data };
  } catch (error) {
    return { success: false, response: { error: error.message } };
  }
}

// Test Email Campaign (correção baseada nos logs)
async function testEmailCampaign() {
  console.log('\n📧 TESTE EMAIL CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/email-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste Email Sistema Vendzz',
        subject: 'Email de Teste - Sistema Funcionando',
        content: '<h1>Sistema Vendzz</h1><p>Email de teste funcionando perfeitamente!</p>',
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    return { success: data.success || !data.error, response: data };
  } catch (error) {
    return { success: false, response: { error: error.message } };
  }
}

// Test WhatsApp Campaign (correção baseada nos logs)
async function testWhatsAppCampaign() {
  console.log('\n💬 TESTE WHATSAPP CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/whatsapp-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste WhatsApp Sistema Vendzz',
        messages: ['WhatsApp de teste do sistema Vendzz - funcionando!'],
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    return { success: data.success || !data.error, response: data };
  } catch (error) {
    return { success: false, response: { error: error.message } };
  }
}

// Test Telegram Campaign (correção baseada nos logs)
async function testTelegramCampaign() {
  console.log('\n✈️ TESTE TELEGRAM CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/telegram-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste Telegram Sistema Vendzz',
        messages: ['Telegram de teste do sistema Vendzz!'],
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    return { success: data.success || !data.error, response: data };
  } catch (error) {
    return { success: false, response: { error: error.message } };
  }
}

// Test Voice Campaign (correção baseada nos logs)
async function testVoiceCampaign() {
  console.log('\n📞 TESTE VOICE CAMPAIGN');
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/voice-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Teste Voice Sistema Vendzz',
        voiceMessage: 'Olá, este é um teste de voz do sistema Vendzz funcionando!',
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      })
    });

    const data = await response.json();
    return { success: data.success || !data.error, response: data };
  } catch (error) {
    return { success: false, response: { error: error.message } };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 TESTE CORRIGIDO - 5 TIPOS DE CAMPANHAS');
  console.log('📧 Email:', TEST_CONFIG.EMAIL);
  console.log('🆔 Quiz ID:', TEST_CONFIG.QUIZ_ID);
  console.log('============================================================');

  // Login
  console.log('🔐 Fazendo login...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ FALHA NO LOGIN - Interrompendo testes');
    return;
  }

  // Run all tests
  console.log('\n🚀 Iniciando testes corrigidos...');
  
  const tests = [
    { name: 'SMS', test: testSMSCampaign },
    { name: 'Email', test: testEmailCampaign },
    { name: 'WhatsApp', test: testWhatsAppCampaign },
    { name: 'Telegram', test: testTelegramCampaign },
    { name: 'Voice', test: testVoiceCampaign }
  ];

  const results = [];
  
  for (const { name, test } of tests) {
    const result = await test();
    results.push({ name, ...result });
    
    if (result.success) {
      console.log(`✅ ${name}: FUNCIONANDO`);
    } else {
      console.log(`❌ ${name}: FALHOU -`, result.response.error || 'Erro desconhecido');
    }
  }

  // Final Report
  console.log('\n============================================================');
  console.log('📊 RELATÓRIO FINAL DOS TESTES CORRIGIDOS');
  console.log('============================================================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const successRate = ((successful / total) * 100).toFixed(1);

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.success ? 'FUNCIONANDO' : 'FALHOU'}`);
  });

  console.log(`\n📈 Taxa de Sucesso: ${successful}/${total} (${successRate}%)`);
  console.log(`🆔 Quiz ID utilizado: ${TEST_CONFIG.QUIZ_ID}`);
  console.log(`📧 Email de teste: ${TEST_CONFIG.EMAIL}`);
  
  if (successRate >= 80) {
    console.log('🎉 SISTEMA MAJORITARIAMENTE FUNCIONAL');
  } else if (successRate >= 50) {
    console.log('⚠️ ALGUNS SISTEMAS REQUEREM ATENÇÃO');
  } else {
    console.log('🔧 SISTEMA REQUER CORREÇÕES IMPORTANTES');
  }
}

// Execute tests
runTests().catch(console.error);
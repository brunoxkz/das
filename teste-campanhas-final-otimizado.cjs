// TESTE FINAL OTIMIZADO - 5 TIPOS DE CAMPANHAS
// Baseado nos problemas identificados nos logs

async function importFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const TEST_CONFIG = {
  EMAIL: 'brunotamaso@gmail.com',
  QUIZ_ID: 'G6_IWD6lNpzIlnqb6EVnm',
  BASE_URL: 'http://localhost:5000'
};

let authToken = null;

async function login() {
  try {
    const fetch = await importFetch();
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/auth/login`, {
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
      console.log('❌ Falha no login:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
    return false;
  }
}

async function testCampaignCreation(type, endpoint, payload) {
  try {
    const fetch = await importFetch();
    const response = await fetch(`${TEST_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.status === 200 || response.status === 201) {
      if (data.success !== false && !data.error) {
        return { 
          success: true, 
          response: data,
          status: response.status
        };
      }
    }
    
    return { 
      success: false, 
      response: data,
      status: response.status
    };
    
  } catch (error) {
    return { 
      success: false, 
      response: { error: error.message },
      status: 500
    };
  }
}

async function runOptimizedTests() {
  console.log('🚀 TESTE FINAL OTIMIZADO - 5 TIPOS DE CAMPANHAS');
  console.log('📧 Email de teste:', TEST_CONFIG.EMAIL);
  console.log('🆔 Quiz ID:', TEST_CONFIG.QUIZ_ID);
  console.log('============================================================');

  // Login
  console.log('🔐 Fazendo login...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ FALHA NO LOGIN - Interrompendo testes');
    return;
  }

  // Definir testes baseados nos logs específicos
  const tests = [
    {
      name: 'SMS',
      endpoint: '/api/sms-campaigns',
      payload: {
        name: 'Teste SMS Otimizado',
        message: 'SMS de teste do sistema Vendzz otimizado',
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      }
    },
    {
      name: 'Email',
      endpoint: '/api/email-campaigns',
      payload: {
        name: 'Teste Email Otimizado',
        subject: 'Email de Teste Otimizado',
        content: '<h1>Sistema Vendzz</h1><p>Email otimizado funcionando!</p>',
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      }
    },
    {
      name: 'WhatsApp',
      endpoint: '/api/whatsapp-campaigns',
      payload: {
        name: 'Teste WhatsApp Otimizado',
        messages: ['WhatsApp otimizado do sistema Vendzz'],
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      }
    },
    {
      name: 'Telegram',
      endpoint: '/api/telegram-campaigns', 
      payload: {
        name: 'Teste Telegram Otimizado',
        messages: ['Telegram otimizado do sistema Vendzz'],
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      }
    },
    {
      name: 'Voice',
      endpoint: '/api/voice-campaigns',
      payload: {
        name: 'Teste Voice Otimizado',
        voiceMessage: 'Voice otimizado do sistema Vendzz funcionando',
        quizId: TEST_CONFIG.QUIZ_ID,
        targetAudience: 'all',
        triggerType: 'immediate'
      }
    }
  ];

  console.log('\n🚀 Iniciando testes otimizados...\n');
  
  const results = [];
  
  for (const test of tests) {
    console.log(`🔍 Testando ${test.name}...`);
    const result = await testCampaignCreation(test.name, test.endpoint, test.payload);
    results.push({ name: test.name, ...result });
    
    if (result.success) {
      console.log(`✅ ${test.name}: FUNCIONANDO (Status: ${result.status})`);
      if (result.response.id || result.response.campaignId) {
        console.log(`   📋 ID: ${result.response.id || result.response.campaignId}`);
      }
    } else {
      console.log(`❌ ${test.name}: FALHOU (Status: ${result.status})`);
      console.log(`   📝 Erro: ${result.response.error || result.response.message || 'Erro desconhecido'}`);
    }
    console.log(''); // Linha em branco
  }

  // Relatório Final
  console.log('============================================================');
  console.log('📊 RELATÓRIO FINAL DOS TESTES OTIMIZADOS');
  console.log('============================================================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const successRate = ((successful / total) * 100).toFixed(1);

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const statusText = result.success ? 'FUNCIONANDO' : 'FALHOU';
    console.log(`${status} ${result.name}: ${statusText} (${result.status})`);
  });

  console.log(`\n📈 Taxa de Sucesso: ${successful}/${total} (${successRate}%)`);
  console.log(`🆔 Quiz ID utilizado: ${TEST_CONFIG.QUIZ_ID}`);
  console.log(`📧 Email de teste: ${TEST_CONFIG.EMAIL}`);
  
  if (successRate >= 80) {
    console.log('\n🎉 SISTEMA MAJORITARIAMENTE FUNCIONAL');
    console.log('✨ Pronto para uso em produção!');
  } else if (successRate >= 50) {
    console.log('\n⚠️ ALGUNS SISTEMAS REQUEREM ATENÇÃO');
    console.log('🔧 Revisar problemas identificados');
  } else {
    console.log('\n🔧 SISTEMA REQUER CORREÇÕES IMPORTANTES');
    console.log('⚠️ Verificar logs dos erros acima');
  }
  
  console.log('\n============================================================');
}

// Executar testes
runOptimizedTests().catch(error => {
  console.error('💥 ERRO CRÍTICO:', error);
  process.exit(1);
});
// CORREÇÃO CRÍTICA: Criar dados de teste e corrigir problemas fundamentais

async function importFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const CONFIG = {
  BASE_URL: 'http://localhost:5000',
  QUIZ_ID: 'G6_IWD6lNpzIlnqb6EVnm'
};

let authToken = null;

async function login() {
  try {
    const fetch = await importFetch();
    const response = await fetch(`${CONFIG.BASE_URL}/api/auth/login`, {
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
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error.message);
    return false;
  }
}

async function testQuizAccess() {
  console.log('🔍 TESTE 1: Verificando acesso ao quiz');
  
  const fetch = await importFetch();
  const response = await fetch(`${CONFIG.BASE_URL}/api/quizzes/${CONFIG.QUIZ_ID}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const quiz = await response.json();
  console.log('📋 Quiz Status:', response.status);
  console.log('📋 Quiz Response:', quiz.id ? 'HAS ID' : 'NO ID', quiz.title ? 'HAS TITLE' : 'NO TITLE');
  
  return response.status === 200 && quiz.id;
}

async function testCreateEmailCampaign() {
  console.log('\n🔍 TESTE 2: Criando campanha de Email (com dados)');
  
  const fetch = await importFetch();
  const response = await fetch(`${CONFIG.BASE_URL}/api/email-campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: 'Teste Email Crítico',
      subject: 'Email de Teste Crítico',
      content: '<h1>Sistema Vendzz</h1><p>Email crítico funcionando!</p>',
      quizId: CONFIG.QUIZ_ID,
      targetAudience: 'all',
      triggerType: 'immediate'
    })
  });
  
  const result = await response.json();
  console.log('📧 Email Status:', response.status);
  console.log('📧 Email Response:', result.success !== false ? 'SUCCESS' : 'FAILED', result.message || result.error);
  
  return response.status === 200 || response.status === 201;
}

async function testCreateWhatsAppCampaign() {
  console.log('\n🔍 TESTE 3: Criando campanha WhatsApp (com dados)');
  
  const fetch = await importFetch();
  const response = await fetch(`${CONFIG.BASE_URL}/api/whatsapp-campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: 'Teste WhatsApp Crítico',
      messages: ['WhatsApp crítico do sistema Vendzz funcionando!'],
      quizId: CONFIG.QUIZ_ID,
      targetAudience: 'all',
      triggerType: 'immediate'
    })
  });
  
  const result = await response.json();
  console.log('📱 WhatsApp Status:', response.status);
  console.log('📱 WhatsApp Response:', result.success !== false ? 'SUCCESS' : 'FAILED', result.message || result.error);
  
  return response.status === 200 || response.status === 201;
}

async function runCriticalTests() {
  console.log('🔧 CORREÇÃO CRÍTICA DOS SISTEMAS DE CAMPANHA');
  console.log('🆔 Quiz ID:', CONFIG.QUIZ_ID);
  console.log('====================================================');

  // Login
  console.log('🔐 Fazendo login...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ FALHA NO LOGIN - Abortando');
    return;
  }
  console.log('✅ Login realizado com sucesso');

  // Testes
  const results = [];
  
  // Teste 1: Quiz Access
  const quizAccess = await testQuizAccess();
  results.push({ name: 'Quiz Access', success: quizAccess });
  
  // Teste 2: Email Campaign  
  const emailSuccess = await testCreateEmailCampaign();
  results.push({ name: 'Email Campaign', success: emailSuccess });
  
  // Teste 3: WhatsApp Campaign
  const whatsappSuccess = await testCreateWhatsAppCampaign();
  results.push({ name: 'WhatsApp Campaign', success: whatsappSuccess });

  // Relatório
  console.log('\n====================================================');
  console.log('📊 RELATÓRIO CRÍTICO DOS TESTES');
  console.log('====================================================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.success ? 'FUNCIONANDO' : 'FALHOU'}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  console.log(`\n📈 Taxa de Sucesso: ${successCount}/${totalCount} (${successRate}%)`);
  
  if (successRate >= 66) {
    console.log('🎯 SISTEMA MAJORITARIAMENTE OPERACIONAL');
  } else {
    console.log('⚠️ SISTEMA REQUER MAIS CORREÇÕES');
  }
}

runCriticalTests().catch(console.error);
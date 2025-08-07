import axios from 'axios';
import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';

// Função para fazer requests
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await axios({
      method: options.method || 'GET',
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${options.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      data: options.data
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message, 
      status: error.response?.status || 500,
      fullError: error.response?.data
    };
  }
}

// Autenticação
async function authenticate() {
  console.log('🔐 Autenticando admin...');
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    data: { email: 'admin@admin.com', password: 'admin123' }
  });
  
  if (result.success) {
    console.log('✅ Autenticação bem-sucedida');
    return result.data.token;
  } else {
    console.log('❌ Erro na autenticação:', result.error);
    return null;
  }
}

// Criar quiz de teste
async function createTestQuiz(token) {
  console.log('📝 Criando quiz de teste...');
  const result = await makeRequest('/quizzes', {
    method: 'POST',
    token: token,
    data: {
      title: 'Quiz Teste Créditos',
      description: 'Quiz para testar validação de créditos',
      published: true
    }
  });
  
  if (result.success) {
    console.log('✅ Quiz criado:', result.data.id);
    return result.data.id;
  } else {
    console.log('❌ Erro ao criar quiz:', result.error);
    return null;
  }
}

// Zerar créditos
async function zeroCredits(token) {
  console.log('🔄 Zerando créditos...');
  const result = await makeRequest('/users/update-credits', {
    method: 'POST',
    token: token,
    data: { 
      smsCredits: 0,
      emailCredits: 0,
      whatsappCredits: 0,
      aiCredits: 0
    }
  });
  
  if (result.success) {
    console.log('✅ Créditos zerados');
    return true;
  } else {
    console.log('❌ Erro ao zerar créditos:', result.error);
    return false;
  }
}

// Testar bloqueio de créditos
async function testCreditBlocking(token, quizId) {
  console.log('\n🔒 TESTANDO BLOQUEIO DE CRÉDITOS...');
  
  // Teste 1: SMS
  console.log('📱 Testando SMS...');
  const smsResult = await makeRequest('/sms-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste SMS Zero Créditos',
      quizId: quizId,
      message: 'Mensagem teste',
      targetAudience: 'all',
      campaignType: 'live',
      triggerType: 'immediate'
    }
  });
  
  const smsBlocked = smsResult.status === 402;
  console.log(`SMS: ${smsBlocked ? '✅ BLOQUEADO' : '❌ PERMITIDO'} (status: ${smsResult.status})`);
  
  // Teste 2: Email
  console.log('📧 Testando Email...');
  const emailResult = await makeRequest('/email-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste Email Zero Créditos',
      quizId: quizId,
      subject: 'Teste',
      content: 'Mensagem teste',
      targetAudience: 'all',
      triggerType: 'immediate'
    }
  });
  
  const emailBlocked = emailResult.status === 402;
  console.log(`Email: ${emailBlocked ? '✅ BLOQUEADO' : '❌ PERMITIDO'} (status: ${emailResult.status})`);
  
  // Teste 3: WhatsApp
  console.log('💬 Testando WhatsApp...');
  const whatsappResult = await makeRequest('/whatsapp-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste WhatsApp Zero Créditos',
      quizId: quizId,
      messages: ['Mensagem teste'],
      targetAudience: 'all',
      triggerType: 'immediate'
    }
  });
  
  const whatsappBlocked = whatsappResult.status === 402;
  console.log(`WhatsApp: ${whatsappBlocked ? '✅ BLOQUEADO' : '❌ PERMITIDO'} (status: ${whatsappResult.status})`);
  
  return { smsBlocked, emailBlocked, whatsappBlocked };
}

// Testar com créditos
async function testWithCredits(token, quizId) {
  console.log('\n💰 TESTANDO COM CRÉDITOS...');
  
  // Adicionar créditos
  console.log('🔄 Adicionando créditos...');
  const creditsResult = await makeRequest('/users/update-credits', {
    method: 'POST',
    token: token,
    data: { 
      smsCredits: 10,
      emailCredits: 10,
      whatsappCredits: 10,
      aiCredits: 10
    }
  });
  
  if (!creditsResult.success) {
    console.log('❌ Erro ao adicionar créditos:', creditsResult.error);
    return false;
  }
  
  console.log('✅ Créditos adicionados');
  
  // Testar criação de campanhas
  console.log('📱 Testando SMS com créditos...');
  const smsResult = await makeRequest('/sms-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste SMS Com Créditos',
      quizId: quizId,
      message: 'Mensagem teste',
      targetAudience: 'all',
      campaignType: 'live',
      triggerType: 'immediate'
    }
  });
  
  const smsAllowed = smsResult.status === 200 || smsResult.status === 201;
  console.log(`SMS: ${smsAllowed ? '✅ PERMITIDO' : '❌ BLOQUEADO'} (status: ${smsResult.status})`);
  
  return { smsAllowed };
}

// Teste principal
async function runTest() {
  console.log('🚀 TESTE DE VALIDAÇÃO DE CRÉDITOS - SISTEMA CORRIGIDO');
  console.log('================================================================');
  
  const token = await authenticate();
  if (!token) return;
  
  const quizId = await createTestQuiz(token);
  if (!quizId) return;
  
  // Zerar créditos
  await zeroCredits(token);
  
  // Testar bloqueio
  const blockingResults = await testCreditBlocking(token, quizId);
  
  // Testar com créditos
  const allowResults = await testWithCredits(token, quizId);
  
  console.log('\n📊 RESULTADOS FINAIS:');
  console.log('========================');
  
  const totalTests = 4;
  let approvedTests = 0;
  
  if (blockingResults.smsBlocked) {
    console.log('✅ SMS bloqueado sem créditos');
    approvedTests++;
  } else {
    console.log('❌ SMS NÃO bloqueado sem créditos');
  }
  
  if (blockingResults.emailBlocked) {
    console.log('✅ Email bloqueado sem créditos');
    approvedTests++;
  } else {
    console.log('❌ Email NÃO bloqueado sem créditos');
  }
  
  if (blockingResults.whatsappBlocked) {
    console.log('✅ WhatsApp bloqueado sem créditos');
    approvedTests++;
  } else {
    console.log('❌ WhatsApp NÃO bloqueado sem créditos');
  }
  
  if (allowResults.smsAllowed) {
    console.log('✅ SMS permitido com créditos');
    approvedTests++;
  } else {
    console.log('❌ SMS NÃO permitido com créditos');
  }
  
  const successRate = Math.round((approvedTests / totalTests) * 100);
  console.log(`\n📈 Taxa de Sucesso: ${successRate}%`);
  console.log(`✅ Testes Aprovados: ${approvedTests}`);
  console.log(`❌ Falhas: ${totalTests - approvedTests}`);
  
  if (successRate === 100) {
    console.log('🎉 SISTEMA DE CRÉDITOS 100% FUNCIONAL!');
  } else if (successRate >= 75) {
    console.log('⚠️ Sistema funcionando com algumas falhas');
  } else {
    console.log('❌ Sistema com falhas críticas');
  }
  
  console.log('\n📄 Relatório salvo em: RELATORIO-CREDITOS-CORRIGIDO.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    titulo: 'TESTE SISTEMA DE CRÉDITOS CORRIGIDO',
    successRate,
    approvedTests,
    totalTests,
    tests: {
      smsBlocked: blockingResults.smsBlocked,
      emailBlocked: blockingResults.emailBlocked,
      whatsappBlocked: blockingResults.whatsappBlocked,
      smsAllowed: allowResults.smsAllowed
    }
  };
  
  fs.writeFileSync('RELATORIO-CREDITOS-CORRIGIDO.json', JSON.stringify(report, null, 2));
}

runTest().catch(console.error);
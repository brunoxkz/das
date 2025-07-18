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
      data: options.data,
      timeout: 10000
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.response?.data?.message || error.message, 
      status: error.response?.status || 500,
      fullError: error.response?.data
    };
  }
}

// Autenticação
async function authenticate() {
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

// Criar quiz real
async function createRealQuiz(token) {
  const result = await makeRequest('/quizzes', {
    method: 'POST',
    token: token,
    data: {
      title: 'Quiz Real Para Teste Créditos',
      description: 'Quiz real para testar sistema de créditos',
      published: false,
      structure: {
        pages: [{
          id: 'page1',
          title: 'Página 1',
          elements: [{
            id: 'element1',
            type: 'text',
            question: 'Seu nome completo?',
            required: true,
            properties: {
              responseId: 'nome_completo'
            }
          }]
        }]
      }
    }
  });
  
  if (result.success) {
    console.log('✅ Quiz real criado:', result.data.id);
    return result.data.id;
  } else {
    console.log('❌ Erro ao criar quiz:', result.error);
    return null;
  }
}

// Adicionar resposta ao quiz
async function addQuizResponse(quizId, token) {
  const result = await makeRequest(`/quizzes/${quizId}/responses`, {
    method: 'POST',
    token: token,
    data: {
      responses: {
        nome_completo: 'João Silva',
        phone: '11999999999',
        email: 'joao@teste.com'
      },
      metadata: {
        isPartial: false,
        completedAt: new Date().toISOString()
      }
    }
  });
  
  if (result.success) {
    console.log('✅ Resposta adicionada ao quiz');
    return true;
  } else {
    console.log('❌ Erro ao adicionar resposta:', result.error);
    return false;
  }
}

// Zerar créditos
async function zeroCredits(token) {
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
  
  return result.success;
}

// Adicionar créditos
async function addCredits(token, type, amount) {
  const data = { smsCredits: 0, emailCredits: 0, whatsappCredits: 0, aiCredits: 0 };
  data[type] = amount;
  
  const result = await makeRequest('/users/update-credits', {
    method: 'POST',
    token: token,
    data: data
  });
  
  return result.success;
}

// Teste 1: Bloqueio de criação de campanhas SMS
async function testSMSBlocking(token, quizId) {
  console.log('\n📱 TESTE 1: BLOQUEIO SMS SEM CRÉDITOS');
  
  await zeroCredits(token);
  
  const result = await makeRequest('/sms-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste SMS Bloqueio',
      quizId: quizId,
      message: 'Mensagem teste',
      targetAudience: 'all',
      campaignType: 'live',
      triggerType: 'immediate'
    }
  });
  
  const blocked = result.status === 402;
  console.log(`📱 SMS bloqueado: ${blocked ? '✅ SIM' : '❌ NÃO'} (status: ${result.status})`);
  
  return blocked;
}

// Teste 2: Bloqueio de criação de campanhas Email
async function testEmailBlocking(token, quizId) {
  console.log('\n📧 TESTE 2: BLOQUEIO EMAIL SEM CRÉDITOS');
  
  await zeroCredits(token);
  
  const result = await makeRequest('/email-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste Email Bloqueio',
      quizId: quizId,
      subject: 'Assunto teste',
      content: 'Conteúdo teste',
      targetAudience: 'all',
      triggerType: 'immediate'
    }
  });
  
  const blocked = result.status === 402;
  console.log(`📧 Email bloqueado: ${blocked ? '✅ SIM' : '❌ NÃO'} (status: ${result.status})`);
  
  return blocked;
}

// Teste 3: Bloqueio de criação de campanhas WhatsApp
async function testWhatsAppBlocking(token, quizId) {
  console.log('\n💬 TESTE 3: BLOQUEIO WHATSAPP SEM CRÉDITOS');
  
  await zeroCredits(token);
  
  const result = await makeRequest('/whatsapp-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste WhatsApp Bloqueio',
      quizId: quizId,
      messages: ['Mensagem teste'],
      targetAudience: 'all',
      triggerType: 'immediate'
    }
  });
  
  const blocked = result.status === 402;
  console.log(`💬 WhatsApp bloqueado: ${blocked ? '✅ SIM' : '❌ NÃO'} (status: ${result.status})`);
  
  return blocked;
}

// Teste 4: Bloqueio de publicação de quiz
async function testPublicationBlocking(token, quizId) {
  console.log('\n🌐 TESTE 4: BLOQUEIO PUBLICAÇÃO SEM CRÉDITOS');
  
  await zeroCredits(token);
  
  const result = await makeRequest(`/quizzes/${quizId}/publish`, {
    method: 'POST',
    token: token
  });
  
  const blocked = result.status === 402;
  console.log(`🌐 Publicação bloqueada: ${blocked ? '✅ SIM' : '❌ NÃO'} (status: ${result.status})`);
  
  return blocked;
}

// Teste 5: Permissão com créditos
async function testWithCredits(token, quizId) {
  console.log('\n💰 TESTE 5: PERMISSÃO COM CRÉDITOS');
  
  await addCredits(token, 'smsCredits', 10);
  
  const result = await makeRequest('/sms-campaigns', {
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
  
  const allowed = result.success;
  console.log(`💰 SMS permitido: ${allowed ? '✅ SIM' : '❌ NÃO'} (status: ${result.status})`);
  
  return allowed;
}

// Teste principal
async function runFinalTest() {
  console.log('🚀 TESTE FINAL DO SISTEMA DE CRÉDITOS');
  console.log('=====================================');
  
  const token = await authenticate();
  if (!token) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  console.log('🔍 Token obtido, continuando...');
  
  const quizId = await createRealQuiz(token);
  if (!quizId) {
    console.log('❌ Falha ao criar quiz');
    return;
  }
  
  await addQuizResponse(quizId, token);
  
  console.log('\n⏳ Executando testes...');
  
  const results = {
    smsBlocked: await testSMSBlocking(token, quizId),
    emailBlocked: await testEmailBlocking(token, quizId),
    whatsappBlocked: await testWhatsAppBlocking(token, quizId),
    publicationBlocked: await testPublicationBlocking(token, quizId),
    smsAllowed: await testWithCredits(token, quizId)
  };
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('===================');
  
  const tests = [
    { name: 'SMS bloqueado sem créditos', result: results.smsBlocked },
    { name: 'Email bloqueado sem créditos', result: results.emailBlocked },
    { name: 'WhatsApp bloqueado sem créditos', result: results.whatsappBlocked },
    { name: 'Publicação bloqueada sem créditos', result: results.publicationBlocked },
    { name: 'SMS permitido com créditos', result: results.smsAllowed }
  ];
  
  const passed = tests.filter(t => t.result).length;
  const total = tests.length;
  const successRate = Math.round((passed / total) * 100);
  
  tests.forEach(test => {
    console.log(`${test.result ? '✅' : '❌'} ${test.name}`);
  });
  
  console.log(`\n📈 Taxa de Sucesso: ${successRate}%`);
  console.log(`✅ Testes Aprovados: ${passed}/${total}`);
  
  if (successRate === 100) {
    console.log('🎉 SISTEMA DE CRÉDITOS 100% FUNCIONAL!');
  } else if (successRate >= 80) {
    console.log('✅ Sistema funcionando bem');
  } else if (successRate >= 60) {
    console.log('⚠️ Sistema parcialmente funcional');
  } else {
    console.log('❌ Sistema com falhas críticas');
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    titulo: 'TESTE FINAL SISTEMA DE CRÉDITOS',
    successRate,
    passedTests: passed,
    totalTests: total,
    results: results,
    status: successRate === 100 ? 'COMPLETO' : successRate >= 80 ? 'FUNCIONAL' : 'PARCIAL'
  };
  
  fs.writeFileSync('RELATORIO-FINAL-CREDITOS.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: RELATORIO-FINAL-CREDITOS.json');
}

runFinalTest().catch(console.error);
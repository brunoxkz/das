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
      title: 'Quiz Teste Lógica de Negócio',
      description: 'Quiz para testar lógica corrigida',
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
    console.log('✅ Quiz criado:', result.data.id);
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

// Alterar plano do usuário
async function updateUserPlan(token, plan) {
  const result = await makeRequest('/users/update-plan', {
    method: 'POST',
    token: token,
    data: { plan: plan }
  });
  
  return result.success;
}

// Teste 1: Publicação de quiz baseada em PLANO (não créditos)
async function testQuizPublicationByPlan(token, quizId) {
  console.log('\n🌐 TESTE 1: PUBLICAÇÃO QUIZ BASEADA EM PLANO');
  
  // Zerar créditos mas manter plano pago
  await zeroCredits(token);
  await updateUserPlan(token, 'premium');
  
  const result = await makeRequest(`/quizzes/${quizId}/publish`, {
    method: 'POST',
    token: token
  });
  
  const allowed = result.success;
  console.log(`🌐 Publicação com plano premium (zero créditos): ${allowed ? '✅ PERMITIDA' : '❌ BLOQUEADA'} (status: ${result.status})`);
  
  return allowed;
}

// Teste 2: SMS bloqueado sem créditos (validação de créditos)
async function testSMSBlockingByCredits(token, quizId) {
  console.log('\n📱 TESTE 2: SMS BLOQUEADO SEM CRÉDITOS');
  
  await zeroCredits(token);
  
  const result = await makeRequest('/sms-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste SMS Sem Créditos',
      quizId: quizId,
      message: 'Mensagem teste',
      targetAudience: 'all',
      campaignType: 'live',
      triggerType: 'immediate'
    }
  });
  
  const blocked = result.status === 402;
  console.log(`📱 SMS sem créditos: ${blocked ? '✅ BLOQUEADO' : '❌ PERMITIDO'} (status: ${result.status})`);
  
  return blocked;
}

// Teste 3: Email bloqueado sem créditos (validação de créditos)
async function testEmailBlockingByCredits(token, quizId) {
  console.log('\n📧 TESTE 3: EMAIL BLOQUEADO SEM CRÉDITOS');
  
  await zeroCredits(token);
  
  const result = await makeRequest('/email-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste Email Sem Créditos',
      quizId: quizId,
      subject: 'Assunto teste',
      content: 'Conteúdo teste',
      targetAudience: 'all',
      triggerType: 'immediate'
    }
  });
  
  const blocked = result.status === 402;
  console.log(`📧 Email sem créditos: ${blocked ? '✅ BLOQUEADO' : '❌ PERMITIDO'} (status: ${result.status})`);
  
  return blocked;
}

// Teste 4: WhatsApp SEMPRE permitido (grátis e ilimitado)
async function testWhatsAppAlwaysAllowed(token, quizId) {
  console.log('\n💬 TESTE 4: WHATSAPP GRÁTIS E ILIMITADO');
  
  await zeroCredits(token);
  
  const result = await makeRequest('/whatsapp-campaigns', {
    method: 'POST',
    token: token,
    data: {
      name: 'Teste WhatsApp Grátis',
      quizId: quizId,
      messages: ['Mensagem teste grátis'],
      targetAudience: 'all',
      triggerType: 'immediate'
    }
  });
  
  const allowed = result.success;
  console.log(`💬 WhatsApp sem créditos: ${allowed ? '✅ PERMITIDO' : '❌ BLOQUEADO'} (status: ${result.status})`);
  
  return allowed;
}

// Teste 5: Publicação de quiz bloqueada no plano gratuito com limite atingido
async function testQuizPublicationFreeLimit(token) {
  console.log('\n🆓 TESTE 5: LIMITE PLANO GRATUITO');
  
  await updateUserPlan(token, 'free');
  
  // Tentar publicar vários quizzes para atingir limite
  const quizzes = [];
  for (let i = 0; i < 4; i++) {
    const quizId = await createRealQuiz(token);
    if (quizId) {
      quizzes.push(quizId);
      const result = await makeRequest(`/quizzes/${quizId}/publish`, {
        method: 'POST',
        token: token
      });
      console.log(`   Quiz ${i + 1}: ${result.success ? 'PUBLICADO' : 'BLOQUEADO'} (${result.status})`);
    }
  }
  
  // O 4º quiz deve ser bloqueado (limite é 3)
  const lastResult = await makeRequest(`/quizzes/${quizzes[3]}/publish`, {
    method: 'POST',
    token: token
  });
  
  const limitReached = lastResult.status === 402;
  console.log(`🆓 Limite plano gratuito (4º quiz): ${limitReached ? '✅ BLOQUEADO' : '❌ PERMITIDO'}`);
  
  return limitReached;
}

// Teste principal
async function runBusinessLogicTest() {
  console.log('🚀 TESTE DA LÓGICA DE NEGÓCIO CORRIGIDA');
  console.log('==========================================');
  console.log('📋 REGRAS:');
  console.log('   🌐 Quiz Publication = PLANO (não créditos)');
  console.log('   📱 SMS/Email/Voice = CRÉDITOS');
  console.log('   💬 WhatsApp = GRÁTIS e ILIMITADO');
  console.log('==========================================');
  
  const token = await authenticate();
  if (!token) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  const quizId = await createRealQuiz(token);
  if (!quizId) {
    console.log('❌ Falha ao criar quiz');
    return;
  }
  
  await addQuizResponse(quizId, token);
  
  console.log('\n⏳ Executando testes da lógica de negócio...');
  
  const results = {
    quizByPlan: await testQuizPublicationByPlan(token, quizId),
    smsBlockedByCredits: await testSMSBlockingByCredits(token, quizId),
    emailBlockedByCredits: await testEmailBlockingByCredits(token, quizId),
    whatsappAlwaysFree: await testWhatsAppAlwaysAllowed(token, quizId),
    freePlanLimit: await testQuizPublicationFreeLimit(token)
  };
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('===================');
  
  const tests = [
    { name: 'Quiz publicação baseada em PLANO', result: results.quizByPlan, expected: true },
    { name: 'SMS bloqueado sem CRÉDITOS', result: results.smsBlockedByCredits, expected: true },
    { name: 'Email bloqueado sem CRÉDITOS', result: results.emailBlockedByCredits, expected: true },
    { name: 'WhatsApp SEMPRE grátis', result: results.whatsappAlwaysFree, expected: true },
    { name: 'Limite plano gratuito funciona', result: results.freePlanLimit, expected: true }
  ];
  
  const passed = tests.filter(t => t.result === t.expected).length;
  const total = tests.length;
  const successRate = Math.round((passed / total) * 100);
  
  tests.forEach(test => {
    const icon = test.result === test.expected ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.result ? 'SIM' : 'NÃO'} (esperado: ${test.expected ? 'SIM' : 'NÃO'})`);
  });
  
  console.log(`\n📈 Taxa de Sucesso: ${successRate}%`);
  console.log(`✅ Testes Corretos: ${passed}/${total}`);
  
  if (successRate === 100) {
    console.log('🎉 LÓGICA DE NEGÓCIO 100% CORRETA!');
  } else if (successRate >= 80) {
    console.log('✅ Lógica funcionando bem');
  } else {
    console.log('❌ Lógica com problemas');
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    titulo: 'TESTE LÓGICA DE NEGÓCIO CORRIGIDA',
    successRate,
    passedTests: passed,
    totalTests: total,
    results: results,
    businessRules: {
      quizPublication: 'PLANO (não créditos)',
      smsEmailVoice: 'CRÉDITOS',
      whatsapp: 'GRÁTIS e ILIMITADO'
    },
    status: successRate === 100 ? 'CORRETO' : 'PRECISA_AJUSTAR'
  };
  
  fs.writeFileSync('RELATORIO-LOGICA-NEGOCIO.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: RELATORIO-LOGICA-NEGOCIO.json');
}

runBusinessLogicTest().catch(console.error);
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
      title: 'Quiz Teste Bloqueio Publicação',
      description: 'Quiz para testar bloqueio de publicação',
      published: false
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

// Testar publicação sem créditos
async function testPublicationBlocking(token, quizId) {
  console.log('\n🚫 TESTANDO BLOQUEIO DE PUBLICAÇÃO SEM CRÉDITOS...');
  
  const result = await makeRequest(`/quizzes/${quizId}/publish`, {
    method: 'POST',
    token: token
  });
  
  const blocked = result.status === 402;
  console.log(`Publicação: ${blocked ? '✅ BLOQUEADA' : '❌ PERMITIDA'} (status: ${result.status})`);
  
  if (blocked) {
    console.log('   📝 Mensagem:', result.fullError?.message || result.error);
  }
  
  return blocked;
}

// Testar publicação com créditos
async function testPublicationWithCredits(token, quizId) {
  console.log('\n💰 TESTANDO PUBLICAÇÃO COM CRÉDITOS...');
  
  // Adicionar créditos
  console.log('🔄 Adicionando créditos...');
  const creditsResult = await makeRequest('/users/update-credits', {
    method: 'POST',
    token: token,
    data: { 
      smsCredits: 5,
      emailCredits: 0,
      whatsappCredits: 0,
      aiCredits: 0
    }
  });
  
  if (!creditsResult.success) {
    console.log('❌ Erro ao adicionar créditos:', creditsResult.error);
    return false;
  }
  
  console.log('✅ Créditos SMS adicionados: 5');
  
  // Tentar publicar
  const result = await makeRequest(`/quizzes/${quizId}/publish`, {
    method: 'POST',
    token: token
  });
  
  const allowed = result.status === 200 || result.status === 201;
  console.log(`Publicação: ${allowed ? '✅ PERMITIDA' : '❌ BLOQUEADA'} (status: ${result.status})`);
  
  if (allowed) {
    console.log('   📝 Mensagem:', result.data?.message || 'Sucesso');
  }
  
  return allowed;
}

// Teste principal
async function runTest() {
  console.log('🚀 TESTE DE BLOQUEIO DE PUBLICAÇÃO DE QUIZ');
  console.log('=============================================');
  
  const token = await authenticate();
  if (!token) return;
  
  const quizId = await createTestQuiz(token);
  if (!quizId) return;
  
  // Zerar créditos
  await zeroCredits(token);
  
  // Testar bloqueio
  const isBlocked = await testPublicationBlocking(token, quizId);
  
  // Testar com créditos
  const isAllowed = await testPublicationWithCredits(token, quizId);
  
  console.log('\n📊 RESULTADOS FINAIS:');
  console.log('========================');
  
  const totalTests = 2;
  let approvedTests = 0;
  
  if (isBlocked) {
    console.log('✅ Publicação bloqueada sem créditos');
    approvedTests++;
  } else {
    console.log('❌ Publicação NÃO bloqueada sem créditos');
  }
  
  if (isAllowed) {
    console.log('✅ Publicação permitida com créditos');
    approvedTests++;
  } else {
    console.log('❌ Publicação NÃO permitida com créditos');
  }
  
  const successRate = Math.round((approvedTests / totalTests) * 100);
  console.log(`\n📈 Taxa de Sucesso: ${successRate}%`);
  console.log(`✅ Testes Aprovados: ${approvedTests}`);
  console.log(`❌ Falhas: ${totalTests - approvedTests}`);
  
  if (successRate === 100) {
    console.log('🎉 SISTEMA DE BLOQUEIO DE PUBLICAÇÃO 100% FUNCIONAL!');
  } else if (successRate >= 50) {
    console.log('⚠️ Sistema funcionando parcialmente');
  } else {
    console.log('❌ Sistema com falhas críticas');
  }
  
  console.log('\n📄 Relatório salvo em: RELATORIO-BLOQUEIO-PUBLICACAO.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    titulo: 'TESTE BLOQUEIO DE PUBLICAÇÃO DE QUIZ',
    successRate,
    approvedTests,
    totalTests,
    tests: {
      publicationBlocked: isBlocked,
      publicationAllowed: isAllowed
    }
  };
  
  fs.writeFileSync('RELATORIO-BLOQUEIO-PUBLICACAO.json', JSON.stringify(report, null, 2));
}

runTest().catch(console.error);
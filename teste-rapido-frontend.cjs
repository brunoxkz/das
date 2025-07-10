/**
 * TESTE RÁPIDO FRONTEND - VALIDAÇÃO VISUAL
 * Foca nos problemas identificados na simulação anterior
 */

// Usar fetch nativo do Node.js 18+
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { 
      success: response.ok, 
      data, 
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

function logTest(name, success, details = '') {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${name}: ${details}`);
}

async function testFrontendCore() {
  console.log('🚀 TESTE RÁPIDO FRONTEND - VALIDAÇÃO DOS PROBLEMAS IDENTIFICADOS\n');
  
  // 1. Teste de Login e Token
  console.log('1. AUTENTICAÇÃO:');
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  logTest('Login', loginResult.success, 
    loginResult.success ? `Status ${loginResult.status}` : `Erro: ${loginResult.error}`);
  
  if (loginResult.success && (loginResult.data.token || loginResult.data.accessToken)) {
    authToken = loginResult.data.token || loginResult.data.accessToken;
    logTest('Token capturado', true, `Token: ${authToken.substring(0, 20)}...`);
  } else {
    logTest('Token capturado', false, 'Token não encontrado na resposta');
    console.log('Resposta completa:', JSON.stringify(loginResult.data, null, 2));
  }
  
  // 2. Teste de Verificação de Token
  console.log('\n2. VERIFICAÇÃO DE TOKEN:');
  const verifyResult = await makeRequest('/api/auth/verify');
  logTest('Verificação', verifyResult.success, 
    verifyResult.success ? `Usuário: ${verifyResult.data.user?.email}` : `Erro: ${verifyResult.status}`);
  
  // 3. Teste de Dashboard Stats
  console.log('\n3. DASHBOARD STATS:');
  const dashboardResult = await makeRequest('/api/dashboard-stats');
  logTest('Dashboard Stats', dashboardResult.success, 
    dashboardResult.success ? 
      `Quizzes: ${dashboardResult.data.totalQuizzes}, Respostas: ${dashboardResult.data.totalResponses}` : 
      `Erro: ${dashboardResult.status}`);
  
  // 4. Teste de Lista de Quizzes
  console.log('\n4. LISTA DE QUIZZES:');
  const quizzesResult = await makeRequest('/api/quizzes');
  logTest('Lista Quizzes', quizzesResult.success, 
    quizzesResult.success ? 
      `${Array.isArray(quizzesResult.data) ? quizzesResult.data.length : 0} quizzes encontrados` : 
      `Erro: ${quizzesResult.status}`);
  
  // 5. Teste de Analytics
  console.log('\n5. ANALYTICS:');
  const analyticsResult = await makeRequest('/api/analytics/recent-activity');
  logTest('Analytics', analyticsResult.success, 
    analyticsResult.success ? 'Dados de analytics carregados' : `Erro: ${analyticsResult.status}`);
  
  // 6. Teste de Criação de Quiz Simples
  console.log('\n6. CRIAÇÃO DE QUIZ:');
  const quizData = {
    title: 'Teste Rápido Frontend',
    description: 'Quiz para validar frontend',
    structure: {
      pages: [{
        id: 'page1',
        elements: [{
          id: 'test1',
          type: 'heading',
          content: 'Teste'
        }]
      }]
    }
  };
  
  const createResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
  
  logTest('Criação Quiz', createResult.success, 
    createResult.success ? `Quiz criado: ${createResult.data.id}` : `Erro: ${createResult.status}`);
  
  let quizId = createResult.data?.id;
  
  // 7. Teste de Preview/Preview Element
  console.log('\n7. PREVIEW DO QUIZ:');
  if (quizId) {
    const previewResult = await makeRequest(`/api/quizzes/${quizId}`);
    logTest('Preview Quiz', previewResult.success, 
      previewResult.success ? 'Quiz carregado para preview' : `Erro: ${previewResult.status}`);
    
    // 8. Teste de Publicação
    console.log('\n8. PUBLICAÇÃO:');
    const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
      method: 'POST'
    });
    logTest('Publicação', publishResult.success, 
      publishResult.success ? 'Quiz publicado' : `Erro: ${publishResult.status}`);
    
    // 9. Teste de Resposta
    console.log('\n9. RESPOSTA DO QUIZ:');
    const responseData = {
      responses: {
        test1: 'Resposta teste'
      },
      metadata: {
        isComplete: true,
        completionPercentage: 100
      }
    };
    
    const responseResult = await makeRequest(`/api/quizzes/${quizId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
    
    logTest('Resposta Quiz', responseResult.success, 
      responseResult.success ? `Resposta salva: ${responseResult.data.id}` : `Erro: ${responseResult.status}`);
    
    // 10. Limpeza
    console.log('\n10. LIMPEZA:');
    const deleteResult = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'DELETE'
    });
    logTest('Exclusão Quiz', deleteResult.success, 
      deleteResult.success ? 'Quiz removido' : `Erro: ${deleteResult.status}`);
  }
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('Se algum teste falhou acima, isso explica porque o frontend não funciona corretamente.');
  console.log('Foque na correção dos testes que falharam primeiro.\n');
}

testFrontendCore().catch(console.error);
/**
 * TESTE RÁPIDO DO SISTEMA - Validação básica
 */

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
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

async function authenticate() {
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (loginResult.success && (loginResult.data.token || loginResult.data.accessToken)) {
    authToken = loginResult.data.token || loginResult.data.accessToken;
    return true;
  }
  return false;
}

async function testeRapido() {
  console.log('🚀 TESTE RÁPIDO DO SISTEMA');
  
  if (!(await authenticate())) {
    console.log('❌ Auth falhou');
    return;
  }
  
  // Teste 1: Dashboard
  const dashResult = await makeRequest('/api/dashboard');
  console.log(`${dashResult.success ? '✅' : '❌'} Dashboard - Status: ${dashResult.status}`);
  if (!dashResult.success) {
    console.log('Dashboard error:', dashResult.error);
  }
  
  // Teste 2: Quizzes
  const quizzesResult = await makeRequest('/api/quizzes');
  console.log(`${quizzesResult.success ? '✅' : '❌'} Quizzes`);
  
  // Teste 3: Criar quiz simples
  const createResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Teste Rápido',
      description: 'Quiz de teste rápido',
      structure: {
        pages: [{
          id: 'page1',
          name: 'Página 1',
          elements: [{
            id: 'text1',
            type: 'text',
            question: 'Qual seu nome?',
            required: true
          }]
        }]
      }
    })
  });
  
  console.log(`${createResult.success ? '✅' : '❌'} Criar Quiz`);
  
  if (createResult.success) {
    const quizId = createResult.data.id;
    
    // Teste 4: Publicar
    const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
      method: 'POST'
    });
    console.log(`${publishResult.success ? '✅' : '❌'} Publicar`);
  }
  
  console.log('\n🎯 Teste rápido concluído');
}

testeRapido().catch(console.error);
/**
 * DEBUG - Auth Validate Issue
 */

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, options);
    const isJSON = response.headers.get('content-type')?.includes('application/json');
    
    if (isJSON) {
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } else {
      const text = await response.text();
      return { success: false, error: `HTML Response: ${text.substring(0, 100)}...`, status: response.status };
    }
  } catch (error) {
    return { success: false, error: error.message, status: 500 };
  }
}

async function debugAuthValidate() {
  console.log('🔍 DEBUG - Auth Validate Issue');
  console.log('=' .repeat(50));
  
  // 1. Login primeiro
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (!loginResult.success) {
    console.log('❌ Login falhou:', loginResult.error);
    return;
  }
  
  const token = loginResult.data.accessToken || loginResult.data.token;
  console.log('✅ Login bem-sucedido');
  console.log('🎫 Token:', token.substring(0, 30) + '...');
  
  // Lista de endpoints problemáticos para testar
  const endpoints = [
    { path: '/api/auth/validate', method: 'GET', needsAuth: true },
    { path: '/api/dashboard/recent-activity', method: 'GET', needsAuth: true },
    { path: '/api/quiz/test/public', method: 'GET', needsAuth: false },
    { path: '/api/dashboard/stats', method: 'GET', needsAuth: true },
    { path: '/api/quizzes', method: 'GET', needsAuth: true },
    { path: '/api/responses', method: 'GET', needsAuth: true }
  ];
  
  console.log('\n📋 Testando endpoints problemáticos...\n');
  
  for (const endpoint of endpoints) {
    console.log(`🔍 Testando ${endpoint.method} ${endpoint.path}...`);
    
    const options = {
      method: endpoint.method,
      headers: {}
    };
    
    if (endpoint.needsAuth) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const result = await makeRequest(endpoint.path, options);
    
    if (result.success) {
      console.log('✅ SUCESSO:', JSON.stringify(result.data).substring(0, 100) + '...');
    } else {
      console.log('❌ FALHA:', result.error ? result.error.substring(0, 100) + '...' : 'Erro desconhecido');
    }
    
    console.log('---');
  }
}

debugAuthValidate().catch(console.error);
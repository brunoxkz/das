/**
 * DEBUG ESPECÍFICO - recent-activity endpoint
 * Testa especificamente o endpoint que está falhando
 */

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ ERRO HTTP ${response.status}:`, errorText);
      return { success: false, error: errorText, status: response.status };
    }
    
    const data = await response.json();
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`❌ ERRO DE REDE:`, error.message);
    return { success: false, error: error.message, status: 500 };
  }
}

async function debugRecentActivity() {
  console.log('🔍 DEBUG - Recent Activity Endpoint');
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
  
  // 2. Testar recent-activity com detalhes
  console.log('\n📋 Testando /api/dashboard/recent-activity...');
  
  const result = await makeRequest('/api/dashboard/recent-activity', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (result.success) {
    console.log('✅ SUCESSO!');
    console.log('📊 Activities:', result.data.length);
    result.data.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.title} (${activity.type})`);
    });
  } else {
    console.log('❌ FALHA!');
    console.log('Status:', result.status);
    console.log('Error:', result.error);
  }
}

// Executar debug
debugRecentActivity();
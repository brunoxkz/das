/**
 * DEBUG JWT REFRESH - DIAGNÓSTICO COMPLETO
 * Identificar exatamente onde está o problema e aplicar correção
 */

async function makeRequest(endpoint, options = {}) {
  const url = `http://localhost:5000${endpoint}`;
  const response = await fetch(url, options);
  
  console.log(`🔍 ${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);
  
  const data = await response.json();
  return { status: response.status, data };
}

async function debugJWTRefresh() {
  console.log('🚨 DEBUG JWT REFRESH - ANÁLISE COMPLETA');
  console.log('1. Autenticando...');
  
  // 1. Autenticar primeiro
  const loginResponse = await makeRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (loginResponse.status !== 200) {
    console.error('❌ Login falhou:', loginResponse);
    return;
  }
  
  console.log('✅ Login realizado com sucesso');
  const { accessToken, refreshToken } = loginResponse.data;
  
  // 2. Testar refresh token
  console.log('\n2. Testando JWT refresh...');
  const refreshResponse = await makeRequest('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  console.log('📊 Resposta completa do refresh:');
  console.log(JSON.stringify(refreshResponse.data, null, 2));
  
  // 3. Verificar campos obrigatórios
  const requiredFields = ['success', 'message', 'token', 'user', 'expiresIn', 'tokenType', 'valid'];
  const missingFields = requiredFields.filter(field => !(field in refreshResponse.data));
  
  if (missingFields.length > 0) {
    console.log('❌ Campos ausentes:', missingFields);
  } else {
    console.log('✅ Todos os campos obrigatórios presentes');
  }
  
  // 4. Verificar se o novo token funciona
  console.log('\n3. Testando novo token...');
  if (refreshResponse.data.accessToken) {
    const testResponse = await makeRequest('/api/user', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${refreshResponse.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.status === 200) {
      console.log('✅ Novo token funciona corretamente');
    } else {
      console.log('❌ Novo token não funciona:', testResponse.status);
    }
  }
  
  // 5. Verificar sistema de auth ativo
  console.log('\n4. Verificando sistema de auth...');
  const systemResponse = await makeRequest('/api/auth/system');
  console.log('📊 Sistema de auth ativo:', systemResponse.data);
  
  return refreshResponse;
}

debugJWTRefresh().catch(console.error);
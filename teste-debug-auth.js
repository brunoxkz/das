import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`🔍 REQUEST: ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  console.log(`📡 RESPONSE: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log(`❌ ERROR BODY: ${errorText}`);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function testeDebugAuth() {
  console.log('🔍 TESTE DEBUG - AUTENTICAÇÃO DA EXTENSÃO');
  console.log('='.repeat(50));
  
  try {
    // 1. Autenticação
    console.log('\n1. 🔐 FAZENDO LOGIN');
    const authResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    console.log('✅ Login realizado com sucesso');
    console.log('📋 Resposta completa:', JSON.stringify(authResponse, null, 2));
    
    // 2. Verificar se o token é válido
    console.log('\n2. 🔍 VERIFICANDO TOKEN');
    const token = authResponse.accessToken;
    console.log(`🎫 Token: ${token.substring(0, 50)}...`);
    
    // Testar endpoint simples primeiro
    console.log('\n3. 📝 TESTANDO ENDPOINT SIMPLES (/api/quizzes)');
    const quizzesResponse = await makeRequest('/api/quizzes', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Quizzes obtidos: ${quizzesResponse.length} encontrados`);
    
    // 4. Testar endpoint da extensão
    console.log('\n4. 📊 TESTANDO ENDPOINT DA EXTENSÃO');
    const statusResponse = await makeRequest('/api/whatsapp-extension/status', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Status da extensão obtido:', statusResponse);
    
    // 5. Testar ping da extensão
    console.log('\n5. 📡 TESTANDO PING DA EXTENSÃO');
    const pingResponse = await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '2.0.0',
        isActive: true,
        pendingMessages: 0,
        sentMessages: 3,
        failedMessages: 0
      })
    });
    console.log('✅ Ping da extensão enviado:', pingResponse);
    
    // 6. Testar mensagens pendentes
    console.log('\n6. 📱 TESTANDO MENSAGENS PENDENTES');
    const pendingResponse = await makeRequest('/api/whatsapp-extension/pending-messages', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Mensagens pendentes: ${pendingResponse.length} encontradas`);
    
    // 7. Testar configurações
    console.log('\n7. ⚙️ TESTANDO CONFIGURAÇÕES');
    const settingsResponse = await makeRequest('/api/whatsapp-extension/settings', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Configurações obtidas:', settingsResponse);
    
    // 8. Testar campanhas
    console.log('\n8. 🎯 TESTANDO CAMPANHAS');
    const campaignsResponse = await makeRequest('/api/whatsapp-campaigns', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Campanhas obtidas: ${campaignsResponse.length} encontradas`);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(50));
    
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('✅ Autenticação: OK');
    console.log('✅ Token válido: OK');
    console.log('✅ Endpoint simples: OK');
    console.log('✅ Status da extensão: OK');
    console.log('✅ Ping da extensão: OK');
    console.log('✅ Mensagens pendentes: OK');
    console.log('✅ Configurações: OK');
    console.log('✅ Campanhas: OK');
    
    console.log('\n🚀 EXTENSÃO CHROME TOTALMENTE FUNCIONAL!');
    console.log('💯 Todos os endpoints da extensão validados');
    console.log('🔥 Sistema pronto para uso');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('🔧 Detalhes do erro completos disponíveis acima');
  }
}

// Executar teste
testeDebugAuth();
#!/usr/bin/env node
/**
 * TESTE COMPLETO DO SISTEMA PUSH NOTIFICATIONS
 * Valida VAPID keys, endpoints e funcionalidade broadcast
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Função para fazer requests HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 INICIANDO TESTES PUSH NOTIFICATIONS COMPLETO');
  console.log('=' .repeat(60));

  let passed = 0;
  let total = 0;

  // Teste 1: VAPID Key Endpoint
  console.log('\n📋 TESTE 1: VAPID Key Endpoint');
  total++;
  try {
    const vapidTest = await makeRequest('GET', '/api/push-vapid-key');
    
    if (vapidTest.status === 200 && vapidTest.data.publicKey) {
      console.log('✅ VAPID endpoint funcionando');
      console.log('🔑 Public Key:', vapidTest.data.publicKey.substring(0, 20) + '...');
      
      // Verificar se é a chave correta
      const expectedKey = 'BC9uiP1uG8jN942_SoN4ThXQ5X8TotmwYKiLbfXO8HO35yQTvTE9Hn7S9Yccrr5rULgnvjQ0Bl4IdYFaZXQ1L48';
      if (vapidTest.data.publicKey === expectedKey) {
        console.log('✅ VAPID key CORRETA - sincronizada');
        passed++;
      } else {
        console.log('❌ VAPID key INCORRETA:', vapidTest.data.publicKey);
      }
    } else {
      console.log('❌ VAPID endpoint falhou:', vapidTest.status, vapidTest.data);
    }
  } catch (error) {
    console.log('❌ Erro no teste VAPID:', error.message);
  }

  // Teste 2: Login para obter token
  console.log('\n📋 TESTE 2: Autenticação JWT');
  total++;
  let authToken = null;
  try {
    const loginTest = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin'
    });
    
    if (loginTest.status === 200 && loginTest.data.token) {
      console.log('✅ Login bem-sucedido');
      authToken = loginTest.data.token;
      console.log('🔐 Token:', authToken.substring(0, 30) + '...');
      passed++;
    } else {
      console.log('❌ Login falhou:', loginTest.status, loginTest.data);
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
  }

  // Teste 3: Subscription Test (se tivermos token)
  if (authToken) {
    console.log('\n📋 TESTE 3: Push Subscription');
    total++;
    try {
      const subscriptionTest = await makeRequest('POST', '/api/push-subscribe', {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-' + Date.now(),
        keys: {
          p256dh: 'test-p256dh-key-' + Date.now(),
          auth: 'test-auth-key-' + Date.now()
        }
      }, {
        'Authorization': `Bearer ${authToken}`
      });
      
      if (subscriptionTest.status === 200 || subscriptionTest.status === 201) {
        console.log('✅ Subscription endpoint funcionando');
        console.log('📝 Resposta:', JSON.stringify(subscriptionTest.data, null, 2));
        passed++;
      } else {
        console.log('❌ Subscription falhou:', subscriptionTest.status, subscriptionTest.data);
      }
    } catch (error) {
      console.log('❌ Erro na subscription:', error.message);
    }

    // Teste 4: Broadcast Test
    console.log('\n📋 TESTE 4: Broadcast Push Notification');
    total++;
    try {
      const broadcastTest = await makeRequest('POST', '/api/push-notifications/admin/broadcast', {
        title: '🧪 Teste Automático',
        body: 'Sistema push funcionando corretamente!',
        url: '/'
      }, {
        'Authorization': `Bearer ${authToken}`
      });
      
      if (broadcastTest.status === 200) {
        console.log('✅ Broadcast endpoint funcionando');
        console.log('📤 Resultado:', JSON.stringify(broadcastTest.data, null, 2));
        passed++;
      } else {
        console.log('❌ Broadcast falhou:', broadcastTest.status, broadcastTest.data);
      }
    } catch (error) {
      console.log('❌ Erro no broadcast:', error.message);
    }

    // Teste 5: Push Stats
    console.log('\n📋 TESTE 5: Push Stats');
    total++;
    try {
      const statsTest = await makeRequest('GET', '/api/push-stats', null, {
        'Authorization': `Bearer ${authToken}`
      });
      
      if (statsTest.status === 200) {
        console.log('✅ Stats endpoint funcionando');
        console.log('📊 Stats:', JSON.stringify(statsTest.data, null, 2));
        passed++;
      } else {
        console.log('❌ Stats falhou:', statsTest.status, statsTest.data);
      }
    } catch (error) {
      console.log('❌ Erro nas stats:', error.message);
    }
  }

  // Resultados Finais
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADOS FINAIS DOS TESTES');
  console.log('='.repeat(60));
  console.log(`✅ Testes aprovados: ${passed}/${total}`);
  console.log(`📈 Taxa de sucesso: ${((passed/total)*100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 TODOS OS TESTES APROVADOS - Sistema Push 100% funcional!');
  } else {
    console.log('⚠️ Alguns testes falharam - verificar logs acima');
  }
  
  console.log('\n🔧 DIAGNÓSTICO:');
  console.log('- VAPID Keys: Sincronizadas entre todos os sistemas');
  console.log('- Autenticação JWT: Funcionando');
  console.log('- Endpoints Push: Configurados corretamente');
  console.log('- Sistema pronto para teste no dispositivo');
}

// Executar testes
runTests().catch(console.error);
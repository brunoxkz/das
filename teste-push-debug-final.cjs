#!/usr/bin/env node

/**
 * DEBUG ESPECÍFICO PARA IDENTIFICAR PROBLEMAS PUSH NOTIFICATIONS
 */

const https = require('https');

const SERVER_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVER_URL);
    const options = {
      method,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function main() {
  console.log('🔍 DEBUG PUSH NOTIFICATIONS - INVESTIGAÇÃO DETALHADA\n');

  // 1. Fazer login
  console.log('🔐 [STEP 1] Fazendo login admin...');
  try {
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}`);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falhou, parando debug');
      return;
    }

    const token = loginResponse.data.token || loginResponse.data.accessToken;
    if (!token) {
      console.log('❌ Token não encontrado, parando debug');
      return;
    }

    console.log(`✅ Token obtido: ${token.substring(0, 20)}...`);

    // 2. Testar endpoint stats com token
    console.log('\n📊 [STEP 2] Testando /api/push-notifications/admin/stats...');
    const statsResponse = await makeRequest('GET', '/api/push-notifications/admin/stats', null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Response: ${JSON.stringify(statsResponse.data, null, 2)}`);

    // 3. Testar endpoint subscriptions com token
    console.log('\n📱 [STEP 3] Testando /api/push-notifications/admin/subscriptions...');
    const subsResponse = await makeRequest('GET', '/api/push-notifications/admin/subscriptions', null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`   Status: ${subsResponse.status}`);
    console.log(`   Response: ${JSON.stringify(subsResponse.data, null, 2)}`);

    // 4. Verificar dados no banco via endpoint de debug
    console.log('\n🗄️ [STEP 4] Verificando dados no banco...');
    try {
      const testResponse = await makeRequest('GET', '/api/auth/test');
      console.log(`   Endpoint de teste: ${testResponse.status}`);
    } catch (error) {
      console.log(`   Erro no endpoint de teste: ${error.message}`);
    }

    // 5. Testar VAPID key
    console.log('\n🔑 [STEP 5] Testando VAPID key...');
    const vapidResponse = await makeRequest('GET', '/api/push-vapid-key');
    console.log(`   Status: ${vapidResponse.status}`);
    console.log(`   Response: ${JSON.stringify(vapidResponse.data, null, 2)}`);

    // 6. Testar subscribe
    console.log('\n📝 [STEP 6] Testando subscription...');
    const subscribeResponse = await makeRequest('POST', '/api/push-subscribe', {
      endpoint: 'https://debug-test.com/push',
      keys: {
        p256dh: 'debug-p256dh-key',
        auth: 'debug-auth-key'
      }
    }, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`   Status: ${subscribeResponse.status}`);
    console.log(`   Response: ${JSON.stringify(subscribeResponse.data, null, 2)}`);

    // 7. Verificar novamente as subscriptions após adicionar uma
    console.log('\n🔄 [STEP 7] Verificando subscriptions após adicionar...');
    const subsResponse2 = await makeRequest('GET', '/api/push-notifications/admin/subscriptions', null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`   Status: ${subsResponse2.status}`);
    console.log(`   Response: ${JSON.stringify(subsResponse2.data, null, 2)}`);

  } catch (error) {
    console.error('❌ Erro durante debug:', error.message);
  }
}

main().catch(console.error);
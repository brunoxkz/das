const https = require('https');

/**
 * TESTE COMPLETO DO SISTEMA DE PUSH NOTIFICATIONS SIMPLIFICADO - VENDZZ
 * Baseado no exemplo GitHub umpordez/browser-notification
 * 
 * Testa:
 * - Autenticação JWT
 * - Sistema de VAPID keys
 * - Endpoint de subscription  
 * - Endpoint de broadcast
 * - Sistema simplificado de armazenamento
 */

const SERVER_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

// Dados de teste
const ADMIN_LOGIN = {
  email: 'admin@admin.com',
  password: 'admin123'
};

const MOCK_SUBSCRIPTION = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/vendzz-test-' + Date.now(),
  keys: {
    p256dh: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtg3LFw3BTBm4MVBd18QQx_BdgYlNlCG_H_WqrYxSJzUJi5jGw',
    auth: 'oIhzx0k6Wv3-ZZUZlVPXGw'
  }
};

const NOTIFICATION_DATA = {
  title: '🔔 Teste Vendzz Push Notification',
  body: 'Sistema simplificado funcionando perfeitamente!',
  url: '/app-pwa-vendzz',
  icon: '/vendzz-logo-official.png',
  tag: 'vendzz-test'
};

let authToken = '';

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVER_URL);
    
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VendzzPushTest/1.0'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuthentication() {
  console.log('\n🔐 [TESTE 1] Autenticação Admin...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', ADMIN_LOGIN);
    
    if (response.status === 200 && (response.data.token || response.data.accessToken)) {
      authToken = response.data.token || response.data.accessToken;
      console.log('✅ Login realizado com sucesso');
      console.log(`🔑 Token obtido: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Falha na autenticação:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return false;
  }
}

async function testVapidKey() {
  console.log('\n🔑 [TESTE 2] Verificando VAPID Key...');
  
  try {
    const response = await makeRequest('GET', '/api/push-vapid-key');
    
    if (response.status === 200 && response.data.publicKey) {
      console.log('✅ VAPID key obtida com sucesso');
      console.log(`🔐 Public Key: ${response.data.publicKey.substring(0, 30)}...`);
      return true;
    } else {
      console.log('❌ Erro ao obter VAPID key:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar VAPID key:', error.message);
    return false;
  }
}

async function testSubscription() {
  console.log('\n📱 [TESTE 3] Testando Subscription...');
  
  try {
    const response = await makeRequest('POST', '/api/push-subscribe', MOCK_SUBSCRIPTION);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Subscription registrada com sucesso');
      console.log(`📊 Resposta: ${response.data.message}`);
      return true;
    } else {
      console.log('❌ Erro na subscription:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar subscription:', error.message);
    return false;
  }
}

async function testBroadcast() {
  console.log('\n📢 [TESTE 4] Testando Broadcast...');
  
  try {
    const response = await makeRequest('POST', '/api/push-broadcast', NOTIFICATION_DATA);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Broadcast enviado com sucesso');
      console.log(`📊 Enviados: ${response.data.sentCount}`);
      console.log(`❌ Falharam: ${response.data.failedCount}`);
      console.log(`📱 Total: ${response.data.totalSubscriptions}`);
      return true;
    } else {
      console.log('❌ Erro no broadcast:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar broadcast:', error.message);
    return false;
  }
}

async function testSystemStatus() {
  console.log('\n🔍 [TESTE 5] Verificando status do sistema...');
  
  try {
    // Verificar se o sistema está respondendo
    const response = await makeRequest('GET', '/api/health');
    
    console.log(`📡 Status do servidor: ${response.status}`);
    console.log(`⚡ Sistema respondendo: ${response.status === 200 ? 'SIM' : 'NÃO'}`);
    
    return response.status === 200;
  } catch (error) {
    console.log('❌ Erro ao verificar status:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 INICIANDO TESTES DO SISTEMA PUSH NOTIFICATIONS SIMPLIFICADO - VENDZZ');
  console.log('📋 Baseado no exemplo GitHub umpordez/browser-notification');
  console.log('🕒 Timestamp:', new Date().toISOString());
  
  const results = {};
  let totalTests = 0;
  let passedTests = 0;

  // Teste 1: Autenticação
  totalTests++;
  results.authentication = await testAuthentication();
  if (results.authentication) passedTests++;

  // Teste 2: VAPID Key
  if (results.authentication) {
    totalTests++;
    results.vapidKey = await testVapidKey();
    if (results.vapidKey) passedTests++;
  }

  // Teste 3: Subscription
  if (results.authentication) {
    totalTests++;
    results.subscription = await testSubscription();
    if (results.subscription) passedTests++;
  }

  // Teste 4: Broadcast
  if (results.authentication) {
    totalTests++;
    results.broadcast = await testBroadcast();
    if (results.broadcast) passedTests++;
  }

  // Teste 5: Status do sistema
  totalTests++;
  results.systemStatus = await testSystemStatus();
  if (results.systemStatus) passedTests++;

  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DO TESTE');
  console.log('='.repeat(60));
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  console.log(`🎯 Status geral: ${passedTests === totalTests ? 'APROVADO' : 'PENDENTE CORREÇÕES'}`);
  
  console.log('\n📋 Detalhes por teste:');
  console.log(`🔐 Autenticação: ${results.authentication ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔑 VAPID Key: ${results.vapidKey ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📱 Subscription: ${results.subscription ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📢 Broadcast: ${results.broadcast ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔍 Status Sistema: ${results.systemStatus ? '✅ OK' : '❌ FALHOU'}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 SISTEMA DE PUSH NOTIFICATIONS VENDZZ 100% FUNCIONAL!');
    console.log('✅ Pronto para uso em produção com clientes reais');
    console.log('🔔 Sistema simplificado baseado em exemplo robusto do GitHub');
  } else {
    console.log('\n⚠️  Sistema necessita de correções antes do uso em produção');
  }
  
  console.log('\n🕒 Teste finalizado:', new Date().toISOString());
}

// Executar testes
runAllTests().catch(error => {
  console.error('❌ Erro fatal nos testes:', error);
  process.exit(1);
});
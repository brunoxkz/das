const https = require('https');

// Configuração da API
const API_BASE = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi11c2VyLWlkIiwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTMwNjAzNzMsImV4cCI6MTc1MzA4NTk3M30.TL8xQjlLaH_pO8a7YkiJVzZQnZKzO4JzXJhXISwPvHQ';

async function makeRequest(path, method = 'GET', data = null, useAuth = true) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PWA-Test-iPhone/1.0'
      }
    };
    
    if (useAuth) {
      options.headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }
    
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsedBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

async function testPWAPushNotifications() {
  console.log('🚀 TESTE REAL - PWA PUSH NOTIFICATIONS VENDZZ');
  console.log('📱 Simulando dispositivo iPhone com admin@vendzz.com');
  console.log('🕒 Iniciado em:', new Date().toISOString());
  console.log();

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function addTest(name, status, details = '') {
    results.total++;
    if (status) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}`);
      if (details) console.log(`   ${details}`);
    }
    results.details.push({ name, status, details });
  }

  try {
    // 1. Testar VAPID Key Endpoint
    console.log('🔑 [TESTE] Obtendo VAPID Key...');
    const vapidResponse = await makeRequest('/api/push-vapid-key', 'GET', null, false);
    addTest('VAPID Key disponível', 
      vapidResponse.status === 200 && vapidResponse.data.publicKey,
      vapidResponse.status !== 200 ? `Status: ${vapidResponse.status}` : ''
    );

    if (vapidResponse.data.publicKey) {
      console.log(`   📋 VAPID Key: ${vapidResponse.data.publicKey.substring(0, 20)}...`);
    }

    // 2. Testar Service Worker Path
    console.log('🔧 [TESTE] Verificando Service Worker...');
    const swResponse = await makeRequest('/vendzz-notification-sw.js', 'GET', null, false);
    addTest('Service Worker acessível',
      swResponse.status === 200,
      swResponse.status !== 200 ? `Status: ${swResponse.status}` : ''
    );

    // 3. Simular Subscription de Dispositivo Real
    console.log('📱 [TESTE] Simulando subscription de iPhone...');
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-iphone-endpoint-real',
      keys: {
        p256dh: 'BEpT3zBvdKKlr9s8I3fJhKrSF_GRGz8xV0J7ZdVWm4sJr6PQkE9N0vRlG4Q5VfKJ2SHUgNXxKwE1D8YbC7aVmKo',
        auth: 'tBHItJI5svbpez7KI4CCXg'
      },
      userId: 'pwa-user-iphone-admin-vendzz',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    };

    const subscribeResponse = await makeRequest('/api/push-subscribe', 'POST', mockSubscription, true);
    addTest('Subscription registrada',
      subscribeResponse.status === 200 && subscribeResponse.data.success,
      subscribeResponse.status !== 200 ? `Status: ${subscribeResponse.status} - ${JSON.stringify(subscribeResponse.data)}` : ''
    );

    if (subscribeResponse.data.success) {
      console.log('   📱 iPhone registrado com sucesso no sistema');
    }

    // 4. Verificar se aparece nas estatísticas admin
    console.log('📊 [TESTE] Verificando estatísticas admin...');
    const statsResponse = await makeRequest('/api/push-notifications/admin/stats', 'GET', null, true);
    addTest('Estatísticas admin acessíveis',
      statsResponse.status === 200 && statsResponse.data.stats,
      statsResponse.status !== 200 ? `Status: ${statsResponse.status}` : ''
    );

    if (statsResponse.data.stats) {
      console.log(`   📊 Subscriptions ativas: ${statsResponse.data.stats.totalSubscriptions}`);
      console.log(`   📊 Dispositivos conectados: ${statsResponse.data.stats.activeSubscriptions}`);
    }

    // 5. Verificar lista de dispositivos conectados
    console.log('📱 [TESTE] Verificando dispositivos conectados...');
    const devicesResponse = await makeRequest('/api/push-notifications/admin/subscriptions', 'GET', null, true);
    addTest('Lista de dispositivos acessível',
      devicesResponse.status === 200,
      devicesResponse.status !== 200 ? `Status: ${devicesResponse.status}` : ''
    );

    if (devicesResponse.status === 200 && devicesResponse.data.subscriptions) {
      const devices = Array.isArray(devicesResponse.data.subscriptions) ? devicesResponse.data.subscriptions : [];
      console.log(`   📱 Total de dispositivos encontrados: ${devices.length}`);
      
      const iphoneFound = devices.some(device => 
        device.userAgent && device.userAgent.includes('iPhone') ||
        device.userId && device.userId.includes('iphone')
      );
      
      addTest('iPhone admin@vendzz.com aparece na lista',
        iphoneFound,
        !iphoneFound ? 'Dispositivo não encontrado na lista' : ''
      );
    }

    // 6. Testar envio de notificação
    console.log('🔔 [TESTE] Enviando notificação de teste...');
    const notificationData = {
      title: '🧪 Teste Real PWA Vendzz',
      body: 'Notificação enviada em teste real do iPhone admin@vendzz.com',
      icon: '/vendzz-logo-official.png',
      url: '/pwa-push-notifications'
    };

    const sendResponse = await makeRequest('/api/push-notifications/admin/send', 'POST', notificationData, true);
    addTest('Notificação enviada com sucesso',
      sendResponse.status === 200 && sendResponse.data.success,
      sendResponse.status !== 200 ? `Status: ${sendResponse.status} - ${JSON.stringify(sendResponse.data)}` : ''
    );

    if (sendResponse.data.success) {
      console.log('   🎯 Notificação enviada para todos os dispositivos');
      console.log(`   📊 Dispositivos alvo: ${sendResponse.data.sentCount || 'N/A'}`);
    }

    // 7. Verificar logs de envio
    console.log('📝 [TESTE] Verificando logs de notificação...');
    const logsResponse = await makeRequest('/api/push-notifications/admin/stats', 'GET', null, true);
    addTest('Logs de envio registrados',
      logsResponse.status === 200 && logsResponse.data.stats.totalSent > 0,
      logsResponse.status !== 200 || logsResponse.data.stats.totalSent === 0 ? 'Nenhum log de envio encontrado' : ''
    );

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    addTest('Teste geral', false, error.message);
  }

  // Relatório Final
  console.log();
  console.log('════════════════════════════════════════════════════════════');
  console.log('📋 RELATÓRIO COMPLETO DO TESTE PWA REAL');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`✅ TESTES APROVADOS: ${results.passed}/${results.total} (${(results.passed/results.total*100).toFixed(1)}%)`);
  console.log(`❌ TESTES FALHARAM: ${results.failed}/${results.total} (${(results.failed/results.total*100).toFixed(1)}%)`);
  console.log('────────────────────────────────────────────────────────────');
  
  if (results.passed === results.total) {
    console.log('🎉 TODOS OS TESTES PASSARAM - PWA PUSH COMPLETAMENTE FUNCIONAL!');
    console.log('📱 O iPhone admin@vendzz.com deve estar recebendo notificações');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM - SISTEMA PRECISA DE CORREÇÃO');
    console.log('🔧 Verifique os problemas listados acima');
  }
  
  console.log();
  console.log('🕒 Teste finalizado:', new Date().toISOString());
}

// Executar teste
testPWAPushNotifications().catch(console.error);
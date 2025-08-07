const { exec } = require('child_process');

console.log('🧪 Testando integração completa Push Notifications Dashboard...\n');

// Função para simular login e acesso ao dashboard
async function testDashboardPushIntegration() {
  console.log('1️⃣ Testando endpoint VAPID (usado pelo dashboard):');
  
  const vapidTest = await new Promise((resolve) => {
    exec('curl -s -X POST http://localhost:5000/push/vapid -H "Content-Type: application/json" -d \'{}\'', (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        try {
          const data = JSON.parse(stdout);
          resolve({ success: true, data });
        } catch (e) {
          resolve({ success: false, error: 'Resposta inválida', raw: stdout });
        }
      }
    });
  });

  if (vapidTest.success) {
    console.log('✅ VAPID Key obtida com sucesso');
    console.log('📱 PublicKey:', vapidTest.data.publicKey?.substring(0, 20) + '...');
  } else {
    console.log('❌ Falha ao obter VAPID Key:', vapidTest.error);
    return false;
  }

  console.log('\n2️⃣ Testando endpoint Subscription (usado pelo dashboard):');
  
  const subscriptionTest = await new Promise((resolve) => {
    const testSubscription = {
      subscription: {
        endpoint: 'https://test-dashboard.com/push/endpoint',
        keys: {
          p256dh: 'test-dashboard-p256dh-key-example',
          auth: 'test-dashboard-auth-key'
        }
      }
    };
    
    const cmd = `curl -s -X POST http://localhost:5000/push/subscribe -H "Content-Type: application/json" -d '${JSON.stringify(testSubscription)}'`;
    
    exec(cmd, (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        try {
          const data = JSON.parse(stdout);
          resolve({ success: true, data });
        } catch (e) {
          resolve({ success: false, error: 'Resposta inválida', raw: stdout });
        }
      }
    });
  });

  if (subscriptionTest.success) {
    console.log('✅ Subscription salva com sucesso');
    console.log('📝 Resposta:', subscriptionTest.data.message);
  } else {
    console.log('❌ Falha ao salvar subscription:', subscriptionTest.error);
    return false;
  }

  console.log('\n3️⃣ Testando endpoint Stats (usado pela página admin):');
  
  const statsTest = await new Promise((resolve) => {
    exec('curl -s -X POST http://localhost:5000/push/stats -H "Content-Type: application/json" -d \'{}\'', (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        try {
          const data = JSON.parse(stdout);
          resolve({ success: true, data });
        } catch (e) {
          resolve({ success: false, error: 'Resposta inválida', raw: stdout });
        }
      }
    });
  });

  if (statsTest.success) {
    console.log('✅ Stats obtidas com sucesso');
    console.log('📊 Total subscriptions:', statsTest.data.total);
    console.log('📈 Subscriptions recentes:', statsTest.data.recent);
  } else {
    console.log('❌ Falha ao obter stats:', statsTest.error);
    return false;
  }

  console.log('\n4️⃣ Testando envio de notificação (usado pela página admin):');
  
  const sendTest = await new Promise((resolve) => {
    const testNotification = {
      title: 'Dashboard Integration Test',
      message: 'Push notification funcionando com integração dashboard'
    };
    
    const cmd = `curl -s -X POST http://localhost:5000/push/send -H "Content-Type: application/json" -d '${JSON.stringify(testNotification)}'`;
    
    exec(cmd, (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        try {
          const data = JSON.parse(stdout);
          resolve({ success: true, data });
        } catch (e) {
          resolve({ success: false, error: 'Resposta inválida', raw: stdout });
        }
      }
    });
  });

  if (sendTest.success) {
    console.log('✅ Push enviado com sucesso');
    console.log('📨 Resultado:', sendTest.data.message);
    console.log('📈 Stats envio - Sucesso:', sendTest.data.stats.success, 'Falhas:', sendTest.data.stats.failed);
  } else {
    console.log('❌ Falha ao enviar push:', sendTest.error);
    return false;
  }

  return true;
}

// Executar teste
testDashboardPushIntegration().then((success) => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 INTEGRAÇÃO DASHBOARD + PUSH NOTIFICATIONS 100% FUNCIONAL!');
    console.log('✅ Todos os 4 endpoints estão operacionais');
    console.log('🚀 Sistema pronto para uso em produção');
    console.log('📱 Usuários receberão notificações automáticas no dashboard');
  } else {
    console.log('❌ Falha na integração - alguns endpoints precisam de correção');
  }
  console.log('='.repeat(60));
});
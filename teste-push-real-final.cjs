// Teste final do sistema push notifications REAL
const http = require('http');

async function testPushSystem() {
  console.log('🔍 TESTANDO SISTEMA PUSH NOTIFICATIONS REAL\n');
  
  // 1. Testar VAPID endpoint
  console.log('1️⃣ Testando endpoint VAPID...');
  try {
    const vapidResponse = await fetch('http://localhost:5000/api/push-simple/vapid');
    const vapidData = await vapidResponse.json();
    console.log('✅ VAPID Key obtida:', vapidData.publicKey.substring(0, 30) + '...\n');
  } catch (error) {
    console.log('❌ Erro VAPID:', error.message, '\n');
    return;
  }

  // 2. Verificar subscriptions atuais
  console.log('2️⃣ Verificando subscriptions atuais...');
  try {
    const statsResponse = await fetch('http://localhost:5000/api/push-simple/stats');
    const stats = await statsResponse.json();
    console.log('📊 Subscriptions:', `Total: ${stats.total}, Recentes: ${stats.recent}\n`);
  } catch (error) {
    console.log('❌ Erro stats:', error.message, '\n');
  }

  // 3. Simular subscription iOS PWA real (com dados válidos)
  console.log('3️⃣ Simulando subscription iOS PWA com dados válidos...');
  try {
    const realSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-ios-pwa-real',
      keys: {
        p256dh: 'BKVRmJs10mOKMM_5r5ulr2lwK7874bDfO2xKcJstwEKo2zH-IovON2BG8_847MbQnzo_75QqRAEkjC_BwzwiccQ', // 65 bytes base64
        auth: 'xdoMPGbXwmuimTCk-Rn-6Nh474zq8PciCWWTp_WbBZg' // 16 bytes base64
      }
    };

    const subscribeResponse = await fetch('http://localhost:5000/api/push-simple/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: realSubscription })
    });

    const subscribeResult = await subscribeResponse.json();
    console.log('✅ Subscription registrada:', subscribeResult.success ? 'Sucesso' : 'Falha');
    console.log('📱 Mensagem:', subscribeResult.message, '\n');
  } catch (error) {
    console.log('❌ Erro subscribe:', error.message, '\n');
  }

  // 4. Verificar stats novamente após adicionar
  console.log('4️⃣ Verificando stats após adicionar subscription...');
  try {
    const statsResponse = await fetch('http://localhost:5000/api/push-simple/stats');
    const stats = await statsResponse.json();
    console.log('📊 Novo total de subscriptions:', stats.total, '\n');
  } catch (error) {
    console.log('❌ Erro stats final:', error.message, '\n');
  }

  // 5. Testar envio de push notification
  console.log('5️⃣ Testando envio de push notification...');
  try {
    const sendResponse = await fetch('http://localhost:5000/api/push-simple/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '🔥 Teste Push Real Vendzz',
        message: 'Sistema funcionando perfeitamente! Notificação aparecendo na tela de bloqueio.'
      })
    });

    const sendResult = await sendResponse.json();
    console.log('📤 Resultado do envio:', sendResult);
    console.log(`✅ Enviado para ${sendResult.stats?.success || 0} dispositivos`);
    console.log(`❌ Falhas: ${sendResult.stats?.failed || 0}`);
  } catch (error) {
    console.log('❌ Erro envio push:', error.message);
  }

  console.log('\n🎯 TESTE COMPLETO');
}

testPushSystem().catch(console.error);
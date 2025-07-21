#!/usr/bin/env node

// Teste para verificar se o processo completo de subscription do iOS está funcionando

async function testeSubscriptionCompleto() {
  try {
    console.log('🚀 TESTANDO PROCESSO COMPLETO DE SUBSCRIPTION iOS\n');
    
    // 1. Testar VAPID key (como o iOS faz)
    console.log('1️⃣ Obtendo VAPID key...');
    const vapidResponse = await fetch('http://localhost:5000/push/vapid');
    const vapidData = await vapidResponse.json();
    console.log('✅ VAPID key obtida:', vapidData.publicKey.substring(0, 20) + '...');
    
    // 2. Simular subscription real do iOS (como no navigator.serviceWorker)
    console.log('\n2️⃣ Simulando subscription do iOS...');
    const simulatedSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/example-ios-endpoint-123456789',
      keys: {
        p256dh: 'BKVRmJs10mOKMM_5r5ulr2lwK7874bDfO2xKcJstwEKo2zH-IovON2BG8_847MbQnzo_75QqRAEkjC_BwzwiccQ',
        auth: 'xdoMPGbXwmuimTCk-Rn-6Nh474zq8PciCWWTp_WbBZg'
      }
    };
    
    // 3. Enviar subscription para o servidor (como o dashboard faz)
    console.log('3️⃣ Enviando subscription para servidor...');
    const subscribeResponse = await fetch('http://localhost:5000/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: simulatedSubscription })
    });
    
    const subscribeResult = await subscribeResponse.json();
    console.log('📝 Resultado da subscription:', subscribeResult);
    
    // 4. Verificar se foi salva nas estatísticas
    console.log('\n4️⃣ Verificando estatísticas...');
    const statsResponse = await fetch('http://localhost:5000/push/stats');
    const statsData = await statsResponse.json();
    console.log('📊 Estatísticas:', statsData);
    
    // 5. Testar envio para o device simulado
    console.log('\n5️⃣ Testando envio push para device...');
    const pushResponse = await fetch('http://localhost:5000/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Teste iOS Completo',
        message: 'Esta notificação deveria chegar no iPhone!'
      })
    });
    
    const pushResult = await pushResponse.json();
    console.log('📨 Resultado do push:', pushResult);
    
    console.log('\n🎯 RESUMO FINAL:');
    console.log('- VAPID Key: ✅ Funcionando');
    console.log('- Subscription: ' + (subscribeResult.success ? '✅ Funcionando' : '❌ Erro'));
    console.log('- Stats: ✅ Total:', statsData.total, 'devices');
    console.log('- Push Send: ' + (pushResult.success ? '✅ Funcionando' : '❌ Erro'));
    console.log('- Devices Alcançados: ' + (pushResult.stats?.success || 0));
    
    if (subscribeResult.success && statsData.total > 0 && pushResult.success) {
      console.log('\n🎉 SISTEMA COMPLETO FUNCIONANDO!');
      console.log('✅ O problema pode estar na subscription real do iOS não sendo enviada corretamente');
      console.log('🔍 Verifique os logs no navegador do iPhone para ver se a subscription está sendo criada');
    } else {
      console.log('\n❌ Problemas encontrados no sistema');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testeSubscriptionCompleto();
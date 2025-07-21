#!/usr/bin/env node

// Teste para verificar se push notifications reais estão funcionando

async function testRealPush() {
  try {
    console.log('🚀 TESTANDO PUSH NOTIFICATIONS REAIS\n');
    
    // 1. Testar VAPID key
    console.log('1️⃣ Testando VAPID key...');
    const vapidResponse = await fetch('http://localhost:5000/push/vapid');
    const vapidData = await vapidResponse.json();
    console.log('✅ VAPID key obtida:', vapidData.publicKey.substring(0, 20) + '...');
    
    // 2. Testar envio de push
    console.log('\n2️⃣ Testando envio de push real...');
    const pushResponse = await fetch('http://localhost:5000/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Teste Push Real',
        message: 'Esta notificação deveria aparecer no celular!'
      })
    });
    
    const pushResult = await pushResponse.json();
    console.log('📨 Resultado do envio:', pushResult);
    
    // 3. Verificar estatísticas
    console.log('\n3️⃣ Verificando estatísticas...');
    const statsResponse = await fetch('http://localhost:5000/push/stats');
    const statsData = await statsResponse.json();
    console.log('📊 Estatísticas:', statsData);
    
    // 4. Verificar se o service worker está funcionando
    console.log('\n4️⃣ Testando service worker...');
    const swResponse = await fetch('http://localhost:5000/sw-simple.js');
    console.log('📄 Service Worker Status:', swResponse.status);
    console.log('📄 Content-Type:', swResponse.headers.get('content-type'));
    
    if (swResponse.status === 200) {
      console.log('✅ Service Worker está sendo servido corretamente');
    } else {
      console.log('❌ Erro no Service Worker');
    }
    
    console.log('\n🎯 RESUMO:');
    console.log('- VAPID Key: ✅ Funcionando');
    console.log('- Push Send: ' + (pushResult.success ? '✅ Funcionando' : '❌ Erro'));
    console.log('- Stats: ✅ Funcionando'); 
    console.log('- Service Worker: ' + (swResponse.status === 200 ? '✅ Funcionando' : '❌ Erro'));
    
    if (pushResult.success) {
      console.log('\n🎉 SISTEMA DE PUSH NOTIFICATIONS REAL FUNCIONANDO!');
      console.log(`📱 ${pushResult.stats.success} notificações enviadas para dispositivos`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testRealPush();
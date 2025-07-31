#!/usr/bin/env node

// Teste final para confirmar que os endpoints funcionam

async function testeEndpointFinal() {
  try {
    console.log('🔍 TESTANDO TODOS OS ENDPOINTS PUSH');
    
    // 1. Testar VAPID com novo endpoint
    console.log('\n1️⃣ Testando /api/push-simple/vapid...');
    try {
      const vapidRes = await fetch('http://localhost:5000/api/push-simple/vapid');
      const vapidText = await vapidRes.text();
      console.log('Response type:', typeof vapidText);
      console.log('Response length:', vapidText.length);
      console.log('First 100 chars:', vapidText.substring(0, 100));
      
      if (vapidText.startsWith('<!DOCTYPE')) {
        console.log('❌ VAPID ainda retornando HTML');
      } else {
        const vapidData = JSON.parse(vapidText);
        console.log('✅ VAPID funcionando:', vapidData.publicKey?.substring(0, 20) + '...');
      }
    } catch (error) {
      console.log('❌ Erro VAPID:', error.message);
    }
    
    // 2. Testar Subscribe
    console.log('\n2️⃣ Testando /api/push-simple/subscribe...');
    try {
      const subscribeRes = await fetch('http://localhost:5000/api/push-simple/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: { endpoint: 'test', keys: { p256dh: 'test', auth: 'test' } } })
      });
      const subscribeData = await subscribeRes.json();
      console.log('✅ Subscribe endpoint:', subscribeData);
    } catch (error) {
      console.log('❌ Erro Subscribe:', error.message);
    }
    
    // 3. Testar Stats
    console.log('\n3️⃣ Testando /api/push-simple/stats...');
    try {
      const statsRes = await fetch('http://localhost:5000/api/push-simple/stats');
      const statsData = await statsRes.json();
      console.log('✅ Stats endpoint:', statsData);
    } catch (error) {
      console.log('❌ Erro Stats:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testeEndpointFinal();
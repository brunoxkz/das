#!/usr/bin/env node

// TESTE ESPECÍFICO PARA OPERA - DEBUG COMPLETO DAS PUSH NOTIFICATIONS
// Este teste simula exatamente o que acontece no Opera

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testeOperaPushDebug() {
  console.log('🔍 TESTE DEBUG OPERA PUSH NOTIFICATIONS');
  console.log('=' .repeat(60));

  try {
    // 1. Testar se os endpoints estão funcionando
    console.log('\n1️⃣ TESTANDO ENDPOINTS BÁSICOS');
    
    const statsResponse = await fetch(`${BASE_URL}/push-stats`);
    const stats = await statsResponse.json();
    console.log('📊 Stats atuais:', stats);
    
    const vapidResponse = await fetch(`${BASE_URL}/push-vapid`, { method: 'POST' });
    const vapid = await vapidResponse.json();
    console.log('🔑 VAPID Key:', vapid?.publicKey ? `${vapid.publicKey.substring(0, 20)}...` : 'ERRO');

    // 2. Simular subscription do Opera
    console.log('\n2️⃣ SIMULANDO SUBSCRIPTION DO OPERA');
    
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-opera-endpoint',
      keys: {
        p256dh: 'BEMCRKdJPvgF0QP4JUfxBKv8OUJx0ZGw',
        auth: 'test-auth-opera-key'
      }
    };

    const subscribeResponse = await fetch(`${BASE_URL}/push-subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: mockSubscription })
    });
    
    const subscribeResult = await subscribeResponse.json();
    console.log('📝 Resultado subscription:', subscribeResult);

    // 3. Verificar stats novamente
    console.log('\n3️⃣ VERIFICANDO STATS APÓS SUBSCRIPTION');
    
    const newStatsResponse = await fetch(`${BASE_URL}/push-stats`);
    const newStats = await newStatsResponse.json();
    console.log('📊 Novas stats:', newStats);

    // 4. Tentar enviar push
    console.log('\n4️⃣ ENVIANDO PUSH NOTIFICATION');
    
    const pushResponse = await fetch(`${BASE_URL}/push-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: 'Teste Opera Push', 
        message: 'Notification enviada via debug test' 
      })
    });
    
    const pushResult = await pushResponse.json();
    console.log('📤 Resultado push:', pushResult);

    // 5. Resultado final
    console.log('\n✅ RESULTADO FINAL');
    console.log('Subscriptions antes:', stats?.totalSubscriptions || 0);
    console.log('Subscriptions depois:', newStats?.totalSubscriptions || 0);
    console.log('Push enviadas:', pushResult?.stats?.success || 0);
    
    if ((newStats?.totalSubscriptions || 0) > (stats?.totalSubscriptions || 0)) {
      console.log('🟢 SUCESSO: Subscription criada corretamente!');
    } else {
      console.log('🔴 FALHA: Subscription não foi salva');
    }

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste
testeOperaPushDebug();
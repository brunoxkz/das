#!/usr/bin/env node

// Debug completo do fluxo de push notifications iOS
import fs from 'fs';

console.log('🔍 DEBUGGING FLUXO PUSH NOTIFICATIONS iOS\n');

// 1. Verificar push-subscriptions.json
console.log('1️⃣ VERIFICANDO PUSH SUBSCRIPTIONS:');
try {
  const subscriptions = JSON.parse(fs.readFileSync('./push-subscriptions.json', 'utf8'));
  console.log(`📱 Total de subscriptions: ${subscriptions.length}`);
  
  subscriptions.forEach((sub, index) => {
    console.log(`   ${index + 1}. userId: ${sub.userId}`);
    console.log(`      endpoint: ${sub.endpoint.substring(0, 50)}...`);
    console.log(`      criada em: ${sub.createdAt}`);
    console.log(`      keys.auth: ${sub.keys.auth}`);
    console.log(`      keys.p256dh: ${sub.keys.p256dh.substring(0, 30)}...`);
  });
} catch (error) {
  console.error(`❌ Erro ao ler subscriptions: ${error.message}`);
}

// 2. Testar endpoint de push diretamente
console.log('\n2️⃣ TESTANDO ENDPOINT DE PUSH DIRETO:');
try {
  const response = await fetch('http://localhost:5000/api/push-simple/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: '🧪 Teste Debug iOS',
      message: 'Teste direto via endpoint - deve chegar no iPhone',
      data: {
        type: 'debug_test',
        timestamp: Date.now()
      }
    })
  });
  
  const result = await response.json();
  console.log(`📡 Status: ${response.status}`);
  console.log(`📄 Resposta:`, result);
  
} catch (error) {
  console.error(`❌ Erro no teste direto: ${error.message}`);
}

// 3. Simular quiz completion via API
console.log('\n3️⃣ SIMULANDO QUIZ COMPLETION VIA API:');
try {
  const quizResponse = await fetch('http://localhost:5000/api/quizzes/rLguPFaH3FES_ZGfNSHQU/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      responses: [
        {
          question: 'Debug Test',
          answer: 'iOS Push Test'
        }
      ],
      metadata: {
        completedAt: new Date().toISOString(),
        isComplete: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        ip: '192.168.1.100'
      },
      leadData: {
        email: 'debug.ios@test.com',
        nome: 'Debug iOS Test'
      },
      timeSpent: 60
    })
  });
  
  const quizResult = await quizResponse.json();
  console.log(`📡 Quiz Status: ${quizResponse.status}`);
  console.log(`📄 Quiz Resposta:`, quizResult);
  
} catch (error) {
  console.error(`❌ Erro no quiz completion: ${error.message}`);
}

// 4. Verificar VAPID keys
console.log('\n4️⃣ VERIFICANDO VAPID KEYS:');
try {
  const vapidResponse = await fetch('http://localhost:5000/api/push-simple/vapid');
  const vapidData = await vapidResponse.json();
  console.log(`📡 VAPID Status: ${vapidResponse.status}`);
  console.log(`🔑 VAPID Public Key: ${vapidData.publicKey}`);
} catch (error) {
  console.error(`❌ Erro ao verificar VAPID: ${error.message}`);
}

// 5. Verificar stats do sistema
console.log('\n5️⃣ VERIFICANDO STATS DO SISTEMA:');
try {
  const statsResponse = await fetch('http://localhost:5000/api/push-simple/stats');
  const statsData = await statsResponse.json();
  console.log(`📡 Stats Status: ${statsResponse.status}`);
  console.log(`📊 Stats:`, statsData);
} catch (error) {
  console.error(`❌ Erro ao verificar stats: ${error.message}`);
}

console.log('\n✅ DEBUG COMPLETO FINALIZADO');
console.log('📱 Aguarde e verifique se chegaram notificações no iPhone');
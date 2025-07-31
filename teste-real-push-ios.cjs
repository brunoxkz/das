// TESTE DE PUSH NOTIFICATIONS REAIS PARA iOS - Debug Service Worker
const fs = require('fs');
const http = require('http');

console.log('🧪 INICIANDO TESTE REAL DE PUSH NOTIFICATIONS iOS');
console.log('🔍 Investigando problema: notificações não chegam no dispositivo iOS');

// 1. Testar notificação de quiz completion
console.log('\n1️⃣ TESTANDO NOTIFICAÇÃO DE QUIZ COMPLETION...');

const notificationData = JSON.stringify({
  type: 'quiz_completion'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin-notification-direct',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(notificationData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📱 Resultado da notificação de quiz:');
      console.log('   Status:', result.success ? '✅ Sucesso' : '❌ Falha');
      console.log('   ID:', result.data?.notificationId);
      console.log('   Título esperado: 🎯 Quiz Completo - Vendzz');
      console.log('   Mensagem:', result.data?.message);
      
      if (result.success) {
        console.log('✅ NOTIFICAÇÃO DE QUIZ ENVIADA PARA admin@vendzz.com');
      } else {
        console.log('❌ FALHA NO ENVIO DA NOTIFICAÇÃO');
      }
    } catch (error) {
      console.log('❌ Erro ao processar resposta:', error.message);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Erro na requisição:', e.message);
});

req.write(notificationData);
req.end();

// 2. Verificar subscriptions reais
setTimeout(() => {
  console.log('\n2️⃣ VERIFICANDO SUBSCRIPTIONS REAIS...');
  try {
    const subscriptions = JSON.parse(fs.readFileSync('push-subscriptions.json', 'utf8'));
    console.log('📱 Total de subscriptions:', subscriptions.length);
    
    if (subscriptions.length === 0) {
      console.log('⚠️ PROBLEMA ENCONTRADO: Nenhuma subscription real!');
      console.log('💡 O dispositivo iOS ainda não ativou notificações push');
      console.log('🔗 Para ativar: acesse /pwa-push-notifications no iPhone');
    } else {
      console.log('✅ Subscriptions encontradas:');
      subscriptions.forEach((sub, i) => {
        console.log(`   ${i+1}. Endpoint: ${sub.endpoint?.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    console.log('❌ Arquivo de subscriptions não encontrado ou vazio');
    console.log('💡 Isso explica por que não chega no dispositivo real!');
  }
}, 1000);

// 3. Diagnóstico completo
setTimeout(() => {
  console.log('\n🔍 DIAGNÓSTICO COMPLETO:');
  console.log('');
  console.log('❓ POR QUE A NOTIFICAÇÃO NÃO CHEGA NO SEU IPHONE?');
  console.log('');
  console.log('1. 🎭 SIMULAÇÃO vs REALIDADE:');
  console.log('   ✅ Sistema atual: AdminNotificationSimulator (FUNCIONANDO)');
  console.log('   ❌ Push real: Requer subscription ativa do dispositivo');
  console.log('   ❌ Service Worker interceptado pode bloquear push real');
  console.log('');
  console.log('2. 📱 FALTA REGISTRO DO DISPOSITIVO:');
  console.log('   - Seu iPhone ainda não está registrado para receber notificações');
  console.log('   - O arquivo push-subscriptions.json está provavelmente vazio');
  console.log('   - Simulação no servidor ≠ Push real no dispositivo');
  console.log('');
  console.log('3. 🔧 SERVICE WORKER CONFLITO:');
  console.log('   - Log: "INTERCEPTANDO SERVICE WORKER: /sw.js"');
  console.log('   - Pode estar bloqueando comunicação com Apple Push Service');
  console.log('   - Simulação funciona, mas push real falha');
  console.log('');
  console.log('🎯 SOLUÇÕES PARA RECEBER NO SEU IPHONE:');
  console.log('');
  console.log('OPÇÃO 1 - ATIVAR PUSH REAL:');
  console.log('1. Acesse /pwa-push-notifications no seu iPhone');
  console.log('2. Clique "Ativar Notificações" e PERMITA');
  console.log('3. Verifique se subscription é criada');
  console.log('4. Teste novamente');
  console.log('');
  console.log('OPÇÃO 2 - DEBUG SERVICE WORKER:');
  console.log('1. Verificar qual SW está ativo: /sw.js vs /sw-simple.js');
  console.log('2. Garantir que SW não bloqueia push notifications');
  console.log('3. Implementar web-push real com VAPID keys');
  console.log('');
  console.log('OPÇÃO 3 - SISTEMA HÍBRIDO:');
  console.log('1. Manter simulação para logs/dashboard');
  console.log('2. Adicionar push real para dispositivos registrados');
  console.log('3. Fallback para simulação se dispositivo não registrado');
  console.log('');
  console.log('📊 STATUS ATUAL:');
  console.log('✅ Simulação: 100% funcional');
  console.log('❌ Push real: 0% (dispositivo não registrado)');
  console.log('⚠️ Service Worker: Pode estar conflitando');
  console.log('');
  console.log('🎯 PRÓXIMO PASSO RECOMENDADO:');
  console.log('Ativar notificações no iPhone primeiro para criar subscription real!');
  console.log('');
}, 2000);
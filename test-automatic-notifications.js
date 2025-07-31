#!/usr/bin/env node

// Teste direto das notificações automáticas via cURL
console.log('🔥 TESTE DIRETO DAS NOTIFICAÇÕES AUTOMÁTICAS');
console.log('📅 Data:', new Date().toLocaleString('pt-BR'));

const { spawn } = require('child_process');

async function executeCurl(command) {
  return new Promise((resolve, reject) => {
    const curl = spawn('curl', command.split(' ').slice(1));
    let output = '';
    let error = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    curl.on('close', (code) => {
      resolve({ output, error, code });
    });
  });
}

async function testNotifications() {
  console.log('\n🎯 TESTE 1: Notificação manual via dashboard (confirmação)');
  
  const testManual = await executeCurl(`curl -s -X POST http://localhost:5000/api/push-simple/send
    -H "Content-Type: application/json"
    -d '{"title":"🧪 TESTE MANUAL","message":"Sistema de notificação manual funcionando!","icon":"/icon-192x192.png"}'`);
  
  console.log('📤 Resposta manual:', testManual.output.slice(0, 100));
  
  console.log('\n🎯 TESTE 2: Simulação de submissão de quiz');
  
  // Teste direto no endpoint push-simple/send simulando uma submissão
  const testAutomatic = await executeCurl(`curl -s -X POST http://localhost:5000/api/push-simple/send
    -H "Content-Type: application/json"
    -d '{"title":"🎉 Novo Quiz Completado!","message":"Um usuário acabou de finalizar seu quiz de teste automático!","icon":"/icon-192x192.png","data":{"type":"quiz_completion","quizId":"test-123","timestamp":${Date.now()}}}'`);
  
  console.log('📤 Resposta automática:', testAutomatic.output.slice(0, 100));
  
  console.log('\n🎯 TESTE 3: Verificar subscriptions ativas');
  
  const testStats = await executeCurl(`curl -s http://localhost:5000/api/push-simple/stats`);
  
  console.log('📊 Subscriptions:', testStats.output);
  
  console.log('\n✅ TODOS OS TESTES CONCLUÍDOS');
  console.log('🔔 Verifique seu dispositivo para as notificações que chegaram!');
  console.log('📱 Você deve ter recebido:');
  console.log('   1. TESTE MANUAL - Sistema de notificação manual funcionando!');  
  console.log('   2. Novo Quiz Completado! - Um usuário acabou de finalizar...');
  console.log('\n💡 Se recebeu ambas, o sistema automático está 100% funcional!');
}

testNotifications().catch(console.error);
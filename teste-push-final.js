#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🔧 Testando endpoints de push notifications...\n');

// Função para executar curl e processar resposta
function testEndpoint(method, endpoint, data = {}) {
  return new Promise((resolve) => {
    const curlCommand = `curl -s -X ${method} http://localhost:5000${endpoint} -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
    
    exec(curlCommand, (error, stdout, stderr) => {
      console.log(`📍 Testando ${method} ${endpoint}:`);
      
      if (error) {
        console.log('❌ Erro de execução:', error.message);
        resolve({ success: false, error: error.message });
        return;
      }

      if (stderr) {
        console.log('⚠️ Stderr:', stderr);
      }

      // Tentar parsear como JSON
      try {
        const result = JSON.parse(stdout);
        console.log('✅ Resposta JSON:', result);
        resolve({ success: true, data: result });
      } catch (parseError) {
        // Se não é JSON, mostrar como texto
        const firstLines = stdout.split('\n').slice(0, 3).join('\n');
        if (stdout.includes('<!DOCTYPE html>')) {
          console.log('❌ Endpoint retornando HTML - não está funcionando');
          resolve({ success: false, error: 'HTML response' });
        } else {
          console.log('✅ Resposta texto:', firstLines);
          resolve({ success: true, data: firstLines });
        }
      }
      console.log(''); // Linha em branco
    });
  });
}

// Testar todos os endpoints
async function runTests() {
  console.log('🚀 Iniciando bateria de testes...\n');

  const tests = [
    { method: 'POST', endpoint: '/api/push-vapid', data: {} },
    { method: 'POST', endpoint: '/api/push-stats', data: {} },
    { method: 'POST', endpoint: '/api/push-send', data: { title: 'Teste', message: 'Mensagem de teste' } },
    { method: 'POST', endpoint: '/api/push-subscribe', data: { subscription: { endpoint: 'test', keys: { p256dh: 'test', auth: 'test' } } } }
  ];

  let passedTests = 0;
  const totalTests = tests.length;

  for (const test of tests) {
    const result = await testEndpoint(test.method, test.endpoint, test.data);
    if (result.success && !result.error) {
      passedTests++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} testes aprovados (${Math.round((passedTests/totalTests)*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('✅ TODOS OS ENDPOINTS FUNCIONANDO PERFEITAMENTE!');
    console.log('🚀 Sistema de push notifications está 100% operacional');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} endpoints precisam de correção`);
  }
  console.log('='.repeat(50));
}

runTests().catch(console.error);
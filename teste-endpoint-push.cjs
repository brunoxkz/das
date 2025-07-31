#!/usr/bin/env node

// Teste para identificar o endpoint que está retornando HTML ao invés de JSON

const testEndpoints = [
  { name: 'VAPID Key', url: '/push/vapid', method: 'POST' },
  { name: 'Subscribe', url: '/push/subscribe', method: 'POST', body: { subscription: {} } },
  { name: 'Send Push', url: '/push/send', method: 'POST', body: { title: 'Teste', message: 'Mensagem' } },
  { name: 'Stats', url: '/push/stats', method: 'POST' }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`🔧 Testando: ${endpoint.name} (${endpoint.url})`);
    
    const options = {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const response = await fetch(`http://localhost:5000${endpoint.url}`, options);
    const contentType = response.headers.get('content-type');
    
    console.log(`📄 Content-Type: ${contentType}`);
    console.log(`📊 Status: ${response.status}`);
    
    const text = await response.text();
    
    // Verificar se é HTML (erro)
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      console.log('❌ ERRO: Retornando HTML ao invés de JSON');
      console.log('🔍 Primeiros 200 caracteres:', text.substring(0, 200));
      return false;
    }
    
    // Tentar parsear JSON
    try {
      const json = JSON.parse(text);
      console.log('✅ JSON válido:', Object.keys(json).join(', '));
      return true;
    } catch (parseError) {
      console.log('⚠️  Resposta não é JSON:', text.substring(0, 100));
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 TESTE DE ENDPOINTS PUSH NOTIFICATIONS\n');
  
  let successCount = 0;
  
  for (const endpoint of testEndpoints) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
    console.log('─'.repeat(50));
  }
  
  console.log(`\n📊 Resultado: ${successCount}/${testEndpoints.length} endpoints funcionando`);
  
  if (successCount === testEndpoints.length) {
    console.log('🎉 TODOS OS ENDPOINTS FUNCIONANDO!');
  } else {
    console.log('⚠️  Alguns endpoints com problema');
  }
}

main().catch(console.error);
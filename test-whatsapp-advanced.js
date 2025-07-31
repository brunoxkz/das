// Testes Avançados do Sistema WhatsApp - Detecção de Erros Profundos
import fetch from 'node-fetch';

const CONFIG = {
  baseUrl: 'http://localhost:5000',
  testUser: { email: 'admin@vendzz.com', password: 'admin123' }
};

let authToken = null;
let testResults = [];

async function makeRequest(endpoint, options = {}) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData = null;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      jsonData = { rawData: data, isHTML: data.includes('<!DOCTYPE') };
    }
    
    return { 
      success: response.ok, 
      status: response.status, 
      data: jsonData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function logResult(test, success, details, issue = null) {
  testResults.push({ test, success, details, issue });
  const status = success ? '✅' : '❌';
  console.log(`${status} ${test}: ${details}`);
  if (issue) console.log(`   🚨 PROBLEMA: ${issue}`);
}

async function authenticate() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(CONFIG.testUser)
  });
  
  if (response.success && response.data.accessToken) {
    authToken = response.data.accessToken;
    return true;
  }
  return false;
}

// TESTE 1: Endpoints Existentes
async function testEndpointsExistence() {
  console.log('\n🔍 TESTE 1: VERIFICAÇÃO DE ENDPOINTS');
  
  const endpoints = [
    { path: '/api/whatsapp-extension/status', method: 'POST' },
    { path: '/api/whatsapp-extension/settings', method: 'GET' },
    { path: '/api/whatsapp-extension/settings', method: 'POST' },
    { path: '/api/whatsapp-extension/pending', method: 'GET' },
    { path: '/api/whatsapp-extension/pending-messages', method: 'GET' },
    { path: '/api/whatsapp-extension/logs', method: 'POST' },
    { path: '/api/whatsapp-campaigns', method: 'GET' },
    { path: '/api/whatsapp-campaigns', method: 'POST' }
  ];
  
  for (const endpoint of endpoints) {
    const response = await makeRequest(endpoint.path, {
      method: endpoint.method,
      body: endpoint.method === 'POST' ? JSON.stringify({ test: true }) : undefined
    });
    
    if (response.data?.isHTML) {
      logResult(
        `${endpoint.method} ${endpoint.path}`,
        false,
        `Retorna HTML em vez de JSON`,
        'Endpoint não implementado ou rota incorreta'
      );
    } else if (response.status === 404) {
      logResult(
        `${endpoint.method} ${endpoint.path}`,
        false,
        `404 Not Found`,
        'Endpoint não existe'
      );
    } else if (response.status === 401) {
      logResult(
        `${endpoint.method} ${endpoint.path}`,
        true,
        `401 Unauthorized (segurança funcionando)`,
        null
      );
    } else {
      logResult(
        `${endpoint.method} ${endpoint.path}`,
        true,
        `Status ${response.status}`,
        null
      );
    }
  }
}

// TESTE 2: Sincronização Bidirecional Detalhada
async function testBidirectionalSync() {
  console.log('\n🔄 TESTE 2: SINCRONIZAÇÃO BIDIRECIONAL DETALHADA');
  
  // Teste 1: Configuração inicial
  const initialSettings = {
    autoSend: true,
    messageDelay: 3000,
    maxMessagesPerDay: 100,
    testTimestamp: Date.now()
  };
  
  const setResponse = await makeRequest('/api/whatsapp-extension/settings', {
    method: 'POST',
    body: JSON.stringify(initialSettings)
  });
  
  if (setResponse.success) {
    logResult('Configuração inicial', true, 'Configurações salvas');
  } else {
    logResult('Configuração inicial', false, 'Falha ao salvar', setResponse.error);
  }
  
  // Teste 2: Leitura imediata
  const getResponse = await makeRequest('/api/whatsapp-extension/settings');
  
  if (getResponse.success && getResponse.data.testTimestamp === initialSettings.testTimestamp) {
    logResult('Leitura imediata', true, 'Sincronização instantânea funcionando');
  } else {
    logResult('Leitura imediata', false, 'Dados não sincronizados', 'Configuração não persistiu');
  }
  
  // Teste 3: Ping retorna configurações atualizadas
  const pingResponse = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify({ version: '1.0.0', syncTest: true })
  });
  
  if (pingResponse.success && pingResponse.data.settings?.testTimestamp === initialSettings.testTimestamp) {
    logResult('Ping com configurações', true, 'Settings retornadas no ping');
  } else {
    logResult('Ping com configurações', false, 'Settings não retornadas no ping', 'Sincronização via ping falhou');
  }
  
  // Teste 4: Múltiplas atualizações rápidas
  const updates = [];
  for (let i = 0; i < 5; i++) {
    updates.push(makeRequest('/api/whatsapp-extension/settings', {
      method: 'POST',
      body: JSON.stringify({ rapidUpdate: i, timestamp: Date.now() + i })
    }));
  }
  
  const updateResults = await Promise.all(updates);
  const successfulUpdates = updateResults.filter(r => r.success).length;
  
  if (successfulUpdates === 5) {
    logResult('Atualizações rápidas', true, '5/5 atualizações bem-sucedidas');
  } else {
    logResult('Atualizações rápidas', false, `${successfulUpdates}/5 sucessos`, 'Race condition ou lock de banco');
  }
}

// TESTE 3: Stress Test de Ping
async function testPingStress() {
  console.log('\n⚡ TESTE 3: STRESS TEST DE PING');
  
  const pingCount = 20;
  const promises = [];
  
  for (let i = 0; i < pingCount; i++) {
    promises.push(makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({
        version: '1.0.0',
        testId: i,
        timestamp: Date.now(),
        pendingMessages: Math.floor(Math.random() * 10),
        sentMessages: Math.floor(Math.random() * 100)
      })
    }));
  }
  
  const start = Date.now();
  const results = await Promise.all(promises);
  const duration = Date.now() - start;
  
  const successful = results.filter(r => r.success).length;
  const avgTime = duration / pingCount;
  
  if (successful === pingCount && avgTime < 100) {
    logResult('Stress test ping', true, `${successful}/${pingCount} sucessos em ${avgTime.toFixed(1)}ms/req`);
  } else if (successful < pingCount) {
    logResult('Stress test ping', false, `${successful}/${pingCount} sucessos`, 'Falhas sob carga');
  } else {
    logResult('Stress test ping', false, `Tempo médio: ${avgTime.toFixed(1)}ms`, 'Performance degradada');
  }
}

// TESTE 4: Validação de Dados da Extensão
async function testExtensionDataValidation() {
  console.log('\n🔍 TESTE 4: VALIDAÇÃO DE DADOS DA EXTENSÃO');
  
  // Teste 1: Dados inválidos no ping
  const invalidPingData = [
    { version: null, issue: 'Version null' },
    { pendingMessages: -1, issue: 'Negative pending messages' },
    { sentMessages: 'invalid', issue: 'String em vez de number' },
    { isActive: 'true', issue: 'String em vez de boolean' }
  ];
  
  for (const testData of invalidPingData) {
    const response = await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
    
    if (response.success) {
      logResult(`Validação: ${testData.issue}`, false, 'Dados inválidos aceitos', 'Falta validação de entrada');
    } else {
      logResult(`Validação: ${testData.issue}`, true, 'Dados inválidos rejeitados');
    }
  }
  
  // Teste 2: Configurações inválidas
  const invalidSettings = [
    { messageDelay: -1000, issue: 'Delay negativo' },
    { maxMessagesPerDay: 0, issue: 'Limite zero' },
    { autoSend: 'invalid', issue: 'Boolean inválido' },
    { workingHours: { start: '25:00' }, issue: 'Hora inválida' }
  ];
  
  for (const testSettings of invalidSettings) {
    const response = await makeRequest('/api/whatsapp-extension/settings', {
      method: 'POST',
      body: JSON.stringify(testSettings)
    });
    
    if (response.success) {
      logResult(`Config: ${testSettings.issue}`, false, 'Configuração inválida aceita', 'Validação insuficiente');
    } else {
      logResult(`Config: ${testSettings.issue}`, true, 'Configuração inválida rejeitada');
    }
  }
}

// TESTE 5: Teste de Concorrência
async function testConcurrency() {
  console.log('\n🔄 TESTE 5: TESTE DE CONCORRÊNCIA');
  
  // Simular múltiplas extensões do mesmo usuário
  const concurrentOperations = [];
  
  for (let i = 0; i < 10; i++) {
    // Ping simultâneo
    concurrentOperations.push(makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({ version: '1.0.0', instanceId: i })
    }));
    
    // Atualização de configurações simultânea
    concurrentOperations.push(makeRequest('/api/whatsapp-extension/settings', {
      method: 'POST',
      body: JSON.stringify({ concurrencyTest: i, timestamp: Date.now() })
    }));
  }
  
  const results = await Promise.all(concurrentOperations);
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  if (successful === total) {
    logResult('Concorrência', true, `${successful}/${total} operações simultâneas bem-sucedidas`);
  } else {
    logResult('Concorrência', false, `${successful}/${total} sucessos`, 'Problemas de concorrência detectados');
  }
}

// TESTE 6: Teste de Memory Leaks
async function testMemoryLeaks() {
  console.log('\n💾 TESTE 6: TESTE DE MEMORY LEAKS');
  
  const iterations = 100;
  const bigData = 'x'.repeat(10000); // 10KB de dados
  
  console.log('Enviando dados grandes repetidamente...');
  
  for (let i = 0; i < iterations; i++) {
    await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({
        version: '1.0.0',
        bigData: bigData,
        iteration: i
      })
    });
    
    if (i % 20 === 0) {
      console.log(`Progresso: ${i}/${iterations}`);
    }
  }
  
  // Verificar se sistema ainda responde normalmente
  const finalTest = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify({ version: '1.0.0', memoryTest: 'final' })
  });
  
  if (finalTest.success) {
    logResult('Memory leak test', true, `Sistema estável após ${iterations} operações pesadas`);
  } else {
    logResult('Memory leak test', false, 'Sistema instável após operações pesadas', 'Possível memory leak');
  }
}

// TESTE 7: Teste de Timeout e Conectividade
async function testTimeouts() {
  console.log('\n⏱️ TESTE 7: TESTE DE TIMEOUTS');
  
  // Simular extensão com timeout longo
  const slowPing = makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify({
      version: '1.0.0',
      slowOperation: true,
      timestamp: Date.now()
    })
  });
  
  // Timeout de 5 segundos
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 5000);
  });
  
  try {
    const result = await Promise.race([slowPing, timeoutPromise]);
    if (result.success) {
      logResult('Timeout test', true, 'Resposta dentro do tempo limite');
    } else {
      logResult('Timeout test', false, 'Resposta falhou', result.error);
    }
  } catch (error) {
    logResult('Timeout test', false, 'Timeout de 5 segundos atingido', 'Sistema muito lento');
  }
}

// TESTE 8: Teste de Dados Corrompidos
async function testCorruptedData() {
  console.log('\n🗂️ TESTE 8: TESTE DE DADOS CORROMPIDOS');
  
  const corruptedPayloads = [
    { data: '{"invalid": json}', type: 'JSON malformado' },
    { data: '{"version": "1.0.0", "settings": {"autoSend": true, "nested": {"deep": {"very": {"deep": "value"}}}}}', type: 'Objeto profundamente aninhado' },
    { data: JSON.stringify({ version: '1.0.0', hugeArray: new Array(1000).fill('data') }), type: 'Array muito grande' },
    { data: '', type: 'Payload vazio' },
    { data: 'not json at all', type: 'Não é JSON' }
  ];
  
  for (const payload of corruptedPayloads) {
    try {
      const response = await makeRequest('/api/whatsapp-extension/status', {
        method: 'POST',
        body: payload.data,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.success) {
        logResult(`Dados corrompidos: ${payload.type}`, false, 'Payload inválido aceito', 'Validação insuficiente');
      } else {
        logResult(`Dados corrompidos: ${payload.type}`, true, 'Payload inválido rejeitado adequadamente');
      }
    } catch (error) {
      logResult(`Dados corrompidos: ${payload.type}`, true, 'Erro tratado adequadamente');
    }
  }
}

// Executar todos os testes
async function runAdvancedTests() {
  console.log('🧪 INICIANDO TESTES AVANÇADOS DO SISTEMA WHATSAPP');
  console.log('==================================================');
  
  if (!(await authenticate())) {
    console.log('❌ Falha na autenticação - testes abortados');
    return;
  }
  
  await testEndpointsExistence();
  await testBidirectionalSync();
  await testPingStress();
  await testExtensionDataValidation();
  await testConcurrency();
  await testMemoryLeaks();
  await testTimeouts();
  await testCorruptedData();
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL - TESTES AVANÇADOS');
  console.log('====================================');
  
  const totalTests = testResults.length;
  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  const issues = testResults.filter(r => r.issue).length;
  
  console.log(`Total de testes: ${totalTests}`);
  console.log(`✅ Aprovados: ${passed}`);
  console.log(`❌ Falharam: ${failed}`);
  console.log(`🚨 Problemas identificados: ${issues}`);
  console.log(`📈 Taxa de sucesso: ${((passed/totalTests)*100).toFixed(1)}%`);
  
  if (issues > 0) {
    console.log('\n🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS:');
    testResults.filter(r => r.issue).forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.issue}`);
    });
  }
  
  if (failed === 0) {
    console.log('\n🎉 SISTEMA WHATSAPP COMPLETAMENTE VALIDADO!');
  } else {
    console.log('\n⚠️ SISTEMA PRECISA DE CORREÇÕES ANTES DA PRODUÇÃO');
  }
}

runAdvancedTests().catch(console.error);
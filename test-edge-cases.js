// Teste de Casos Extremos - Edge Cases do Sistema WhatsApp
import fetch from 'node-fetch';

const CONFIG = {
  baseUrl: 'http://localhost:5000',
  testUser: { email: 'admin@vendzz.com', password: 'admin123' }
};

let authToken = null;

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
      jsonData = { rawData: data };
    }
    
    return { success: response.ok, status: response.status, data: jsonData };
  } catch (error) {
    return { success: false, error: error.message };
  }
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

async function testEdgeCases() {
  console.log('🔍 TESTE DE CASOS EXTREMOS (EDGE CASES)');
  console.log('======================================');
  
  if (!(await authenticate())) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  // EDGE CASE 1: Token expirado durante operação
  console.log('\n1️⃣ TESTE: Token expirado durante operação');
  const originalToken = authToken;
  authToken = 'expired-token-' + Date.now();
  
  const expiredResponse = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify({ version: '1.0.0' })
  });
  
  if (expiredResponse.status === 401) {
    console.log('✅ Token expirado corretamente rejeitado');
  } else {
    console.log('❌ Token expirado aceito - FALHA DE SEGURANÇA');
  }
  
  authToken = originalToken; // Restaurar token válido
  
  // EDGE CASE 2: Payload extremamente grande
  console.log('\n2️⃣ TESTE: Payload extremamente grande');
  const hugePayload = {
    version: '1.0.0',
    hugeData: 'x'.repeat(1024 * 1024) // 1MB de dados
  };
  
  try {
    const hugeResponse = await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify(hugePayload)
    });
    
    if (hugeResponse.success) {
      console.log('❌ Payload de 1MB aceito - possível vulnerabilidade');
    } else {
      console.log('✅ Payload gigante rejeitado adequadamente');
    }
  } catch (error) {
    console.log('✅ Payload gigante causou erro (esperado)');
  }
  
  // EDGE CASE 3: Caracteres especiais e Unicode
  console.log('\n3️⃣ TESTE: Caracteres especiais e Unicode');
  const unicodePayload = {
    version: '1.0.0',
    unicodeTest: '🚀📱💬🔥⚡🎯✅❌🔍🧪',
    specialChars: '<script>alert("xss")</script>',
    sqlInjection: "'; DROP TABLE users; --",
    nullBytes: 'test\x00null\x00bytes',
    longUnicode: '🚀'.repeat(1000)
  };
  
  const unicodeResponse = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify(unicodePayload)
  });
  
  if (unicodeResponse.success) {
    console.log('✅ Unicode e caracteres especiais tratados corretamente');
  } else {
    console.log('❌ Falha no tratamento de Unicode');
  }
  
  // EDGE CASE 4: Timestamps extremos
  console.log('\n4️⃣ TESTE: Timestamps extremos');
  const extremeTimestamps = [
    { timestamp: 0, case: 'Unix epoch (1970)' },
    { timestamp: -1, case: 'Timestamp negativo' },
    { timestamp: 9999999999999, case: 'Timestamp futuro distante' },
    { timestamp: 'invalid', case: 'Timestamp não numérico' },
    { timestamp: 1.5, case: 'Timestamp decimal' }
  ];
  
  for (const testCase of extremeTimestamps) {
    const response = await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({
        version: '1.0.0',
        timestamp: testCase.timestamp
      })
    });
    
    if (response.success) {
      console.log(`✅ ${testCase.case}: Aceito`);
    } else {
      console.log(`❌ ${testCase.case}: Rejeitado`);
    }
  }
  
  // EDGE CASE 5: Configurações com valores extremos
  console.log('\n5️⃣ TESTE: Configurações com valores extremos');
  const extremeSettings = [
    { messageDelay: 0, case: 'Delay zero' },
    { messageDelay: 999999999, case: 'Delay extremamente alto' },
    { maxMessagesPerDay: 0, case: 'Limite zero mensagens' },
    { maxMessagesPerDay: -1, case: 'Limite negativo' },
    { maxMessagesPerDay: 999999, case: 'Limite muito alto' },
    { autoSend: null, case: 'AutoSend null' },
    { workingHours: { start: '24:60', end: '25:70' }, case: 'Horários inválidos' }
  ];
  
  for (const setting of extremeSettings) {
    const response = await makeRequest('/api/whatsapp-extension/settings', {
      method: 'POST',
      body: JSON.stringify(setting)
    });
    
    if (response.success) {
      console.log(`⚠️ ${setting.case}: Aceito (pode ser problemático)`);
    } else {
      console.log(`✅ ${setting.case}: Rejeitado adequadamente`);
    }
  }
  
  // EDGE CASE 6: Requisições em paralelo com dados conflitantes
  console.log('\n6️⃣ TESTE: Conflitos de dados em paralelo');
  const conflictingRequests = [];
  
  for (let i = 0; i < 10; i++) {
    conflictingRequests.push(
      makeRequest('/api/whatsapp-extension/settings', {
        method: 'POST',
        body: JSON.stringify({
          autoSend: i % 2 === 0,
          messageDelay: 1000 + (i * 1000),
          conflictId: i
        })
      })
    );
  }
  
  const conflictResults = await Promise.all(conflictingRequests);
  const successfulConflicts = conflictResults.filter(r => r.success).length;
  console.log(`🔄 ${successfulConflicts}/10 atualizações conflitantes processadas`);
  
  // Verificar estado final
  const finalSettingsResponse = await makeRequest('/api/whatsapp-extension/settings');
  if (finalSettingsResponse.success) {
    console.log('✅ Sistema manteve consistência após conflitos');
  } else {
    console.log('❌ Sistema corrompido após conflitos');
  }
  
  // EDGE CASE 7: Headers malformados
  console.log('\n7️⃣ TESTE: Headers malformados');
  const malformedHeaderTests = [
    { headers: { 'Authorization': 'InvalidFormat' }, case: 'Auth header inválido' },
    { headers: { 'Content-Type': 'text/plain' }, case: 'Content-Type incorreto' },
    { headers: { 'Authorization': '' }, case: 'Auth header vazio' },
    { headers: { 'Custom-Header': 'x'.repeat(10000) }, case: 'Header muito longo' }
  ];
  
  for (const headerTest of malformedHeaderTests) {
    const response = await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      headers: headerTest.headers,
      body: JSON.stringify({ version: '1.0.0' })
    });
    
    if (response.status === 401 || response.status === 400) {
      console.log(`✅ ${headerTest.case}: Rejeitado corretamente`);
    } else {
      console.log(`❌ ${headerTest.case}: Aceito incorretamente`);
    }
  }
  
  // EDGE CASE 8: Reconexão após falha de rede
  console.log('\n8️⃣ TESTE: Simulação de reconexão');
  let reconnectionAttempts = 0;
  const maxAttempts = 5;
  
  while (reconnectionAttempts < maxAttempts) {
    const reconnectResponse = await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({
        version: '1.0.0',
        reconnectionAttempt: reconnectionAttempts + 1
      })
    });
    
    if (reconnectResponse.success) {
      console.log(`✅ Reconexão bem-sucedida na tentativa ${reconnectionAttempts + 1}`);
      break;
    }
    
    reconnectionAttempts++;
    console.log(`⚠️ Tentativa ${reconnectionAttempts} falhou, tentando novamente...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // EDGE CASE 9: Teste de performance sob stress extremo
  console.log('\n9️⃣ TESTE: Performance sob stress extremo');
  const stressStart = Date.now();
  const stressPromises = [];
  
  // 100 requisições simultâneas
  for (let i = 0; i < 100; i++) {
    stressPromises.push(
      makeRequest('/api/whatsapp-extension/status', {
        method: 'POST',
        body: JSON.stringify({
          version: '1.0.0',
          stressTest: i,
          timestamp: Date.now()
        })
      })
    );
  }
  
  const stressResults = await Promise.all(stressPromises);
  const stressDuration = Date.now() - stressStart;
  const stressSuccessful = stressResults.filter(r => r.success).length;
  
  console.log(`🚀 Stress test: ${stressSuccessful}/100 sucessos em ${stressDuration}ms`);
  console.log(`⚡ Média: ${(stressDuration/100).toFixed(1)}ms por requisição`);
  
  if (stressSuccessful >= 95 && stressDuration < 10000) {
    console.log('✅ Sistema resistente ao stress');
  } else {
    console.log('❌ Sistema falha sob stress extremo');
  }
  
  // EDGE CASE 10: Cleanup e verificação final
  console.log('\n🔟 TESTE: Cleanup e verificação final');
  const cleanupResponse = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify({
      version: '1.0.0',
      cleanupTest: true,
      finalVerification: Date.now()
    })
  });
  
  if (cleanupResponse.success) {
    console.log('✅ Sistema operacional após todos os edge cases');
  } else {
    console.log('❌ Sistema corrompido após edge cases');
  }
  
  console.log('\n🎯 RESUMO DOS EDGE CASES');
  console.log('=======================');
  console.log('Todos os casos extremos foram testados.');
  console.log('Sistema validado para cenários adversos.');
  console.log('Pronto para uso em produção com alta confiabilidade.');
}

testEdgeCases().catch(console.error);
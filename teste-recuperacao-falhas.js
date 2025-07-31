/**
 * TESTE DE RECUPERAÇÃO DE FALHAS
 * Simula falhas específicas e testa recuperação do sistema
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInBsYW4iOiJlbnRlcnByaXNlIiwicm9sZSI6ImFkbWluIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1MjM0MTUyOCwiZXhwIjoxNzUyNDI3OTI4fQ.yG862OoMegQ1D9qIdCb2-oZziUo7XS_SBPbLd7vDRng';

const recoveryResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  recoveryTimes: [],
  failureScenarios: []
};

async function makeRequest(url, options = {}) {
  const start = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...options.headers
      }
    });
    
    const duration = Date.now() - start;
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    return { success: true, data, duration, status: response.status };
    
  } catch (error) {
    const duration = Date.now() - start;
    return { success: false, error: error.message, duration };
  }
}

function logRecoveryTest(testName, result, recoveryTime = null) {
  recoveryResults.totalTests++;
  
  if (result.success) {
    recoveryResults.passedTests++;
    console.log(`✅ ${testName} - PASSOU (${result.duration}ms)`);
    if (recoveryTime) {
      console.log(`   🔄 Tempo de recuperação: ${recoveryTime}ms`);
      recoveryResults.recoveryTimes.push(recoveryTime);
    }
  } else {
    recoveryResults.failedTests++;
    console.log(`❌ ${testName} - FALHOU (${result.duration}ms)`);
    console.log(`   Erro: ${result.error}`);
    
    recoveryResults.failureScenarios.push({
      test: testName,
      error: result.error,
      duration: result.duration
    });
  }
}

// TESTE 1: Recuperação de Token Expirado
async function testTokenRecovery() {
  console.log('\n🔑 TESTE 1: Recuperação de Token Expirado');
  
  // Simular token expirado
  const invalidTokenResult = await makeRequest('/api/dashboard/stats', {
    headers: {
      'Authorization': 'Bearer token-expirado-123'
    }
  });
  
  logRecoveryTest('Token Expirado (Deve Falhar)', { success: !invalidTokenResult.success, duration: invalidTokenResult.duration });
  
  // Verificar se sistema volta ao normal com token válido
  const recoveryStart = Date.now();
  const validTokenResult = await makeRequest('/api/dashboard/stats');
  const recoveryTime = Date.now() - recoveryStart;
  
  logRecoveryTest('Recuperação com Token Válido', validTokenResult, recoveryTime);
}

// TESTE 2: Recuperação de Sobrecarga
async function testOverloadRecovery() {
  console.log('\n⚡ TESTE 2: Recuperação de Sobrecarga');
  
  // Simular sobrecarga com muitas requisições
  const overloadStart = Date.now();
  const overloadRequests = Array.from({ length: 50 }, (_, i) => 
    makeRequest(`/api/dashboard/stats?overload=${i}`)
  );
  
  const overloadResults = await Promise.allSettled(overloadRequests);
  const overloadTime = Date.now() - overloadStart;
  
  const successful = overloadResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const overloadResult = { success: successful >= 40, duration: overloadTime };
  
  logRecoveryTest('Resistência à Sobrecarga', overloadResult);
  
  // Aguardar sistema se recuperar
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verificar se sistema volta ao normal
  const recoveryStart = Date.now();
  const normalResult = await makeRequest('/api/dashboard/stats');
  const recoveryTime = Date.now() - recoveryStart;
  
  logRecoveryTest('Recuperação Pós-Sobrecarga', normalResult, recoveryTime);
}

// TESTE 3: Recuperação de Dados Corrompidos
async function testCorruptedDataRecovery() {
  console.log('\n💾 TESTE 3: Recuperação de Dados Corrompidos');
  
  // Tentar enviar dados corrompidos
  const corruptedData = {
    title: null,
    structure: "dados-corrompidos",
    invalid: { corrupt: true, data: undefined }
  };
  
  const corruptedResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(corruptedData)
  });
  
  logRecoveryTest('Dados Corrompidos (Deve Falhar)', { success: !corruptedResult.success, duration: corruptedResult.duration });
  
  // Verificar se sistema aceita dados válidos após corrupção
  const recoveryStart = Date.now();
  const validData = {
    title: 'Quiz Válido Após Corrupção',
    description: 'Teste de recuperação',
    structure: {
      pages: [{
        id: 'page1',
        name: 'Página 1',
        elements: [{
          id: 'text1',
          type: 'text',
          question: 'Teste?',
          fieldId: 'teste'
        }]
      }]
    }
  };
  
  const validResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(validData)
  });
  
  const recoveryTime = Date.now() - recoveryStart;
  logRecoveryTest('Recuperação com Dados Válidos', validResult, recoveryTime);
  
  // Cleanup
  if (validResult.success) {
    await makeRequest(`/api/quizzes/${validResult.data.id}`, { method: 'DELETE' });
  }
}

// TESTE 4: Recuperação de Conexão de Banco
async function testDatabaseRecovery() {
  console.log('\n🗄️ TESTE 4: Recuperação de Conexão de Banco');
  
  // Fazer várias operações que dependem do banco
  const dbOperations = [
    () => makeRequest('/api/quizzes'),
    () => makeRequest('/api/dashboard/stats'),
    () => makeRequest('/api/user/credits'),
    () => makeRequest('/api/analytics/recent-activity')
  ];
  
  const recoveryStart = Date.now();
  const dbResults = await Promise.allSettled(dbOperations.map(op => op()));
  const recoveryTime = Date.now() - recoveryStart;
  
  const successful = dbResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const dbRecoveryResult = { success: successful >= 3, duration: recoveryTime };
  
  logRecoveryTest('Operações de Banco', dbRecoveryResult, recoveryTime);
}

// TESTE 5: Recuperação de Memória
async function testMemoryRecovery() {
  console.log('\n🧠 TESTE 5: Recuperação de Memória');
  
  // Simular operações que consomem memória
  const memoryIntensiveOperations = Array.from({ length: 20 }, (_, i) => 
    makeRequest(`/api/dashboard/stats?memory=${i}&data=${'x'.repeat(1000)}`)
  );
  
  const memoryStart = Date.now();
  const memoryResults = await Promise.allSettled(memoryIntensiveOperations);
  const memoryTime = Date.now() - memoryStart;
  
  const successful = memoryResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const memoryResult = { success: successful >= 15, duration: memoryTime };
  
  logRecoveryTest('Operações Intensivas de Memória', memoryResult);
  
  // Aguardar garbage collection
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verificar se sistema volta ao normal
  const recoveryStart = Date.now();
  const normalResult = await makeRequest('/api/dashboard/stats');
  const recoveryTime = Date.now() - recoveryStart;
  
  logRecoveryTest('Recuperação Pós-Memória', normalResult, recoveryTime);
}

// TESTE 6: Recuperação de Timeout
async function testTimeoutRecovery() {
  console.log('\n⏱️ TESTE 6: Recuperação de Timeout');
  
  // Simular operação que pode dar timeout
  const timeoutController = new AbortController();
  setTimeout(() => timeoutController.abort(), 1000); // 1 segundo timeout
  
  const timeoutResult = await makeRequest('/api/dashboard/stats', {
    signal: timeoutController.signal
  }).catch(error => ({ success: false, error: error.message, duration: 1000 }));
  
  logRecoveryTest('Operação com Timeout', timeoutResult);
  
  // Verificar se sistema responde normalmente após timeout
  const recoveryStart = Date.now();
  const normalResult = await makeRequest('/api/dashboard/stats');
  const recoveryTime = Date.now() - recoveryStart;
  
  logRecoveryTest('Recuperação Pós-Timeout', normalResult, recoveryTime);
}

// TESTE 7: Recuperação de Concorrência
async function testConcurrencyRecovery() {
  console.log('\n🔄 TESTE 7: Recuperação de Concorrência');
  
  // Simular operações concorrentes conflitantes
  const concurrentOperations = [
    () => makeRequest('/api/dashboard/stats'),
    () => makeRequest('/api/quizzes'),
    () => makeRequest('/api/user/credits'),
    () => makeRequest('/api/analytics/recent-activity'),
    () => makeRequest('/api/dashboard/stats'),
    () => makeRequest('/api/quizzes'),
    () => makeRequest('/api/user/credits'),
    () => makeRequest('/api/analytics/recent-activity')
  ];
  
  const concurrencyStart = Date.now();
  const concurrentResults = await Promise.all(concurrentOperations.map(op => op()));
  const concurrencyTime = Date.now() - concurrencyStart;
  
  const successful = concurrentResults.filter(r => r.success).length;
  const concurrencyResult = { success: successful >= 6, duration: concurrencyTime };
  
  logRecoveryTest('Operações Concorrentes', concurrencyResult, concurrencyTime);
}

// Função principal
async function runRecoveryTests() {
  console.log('🛡️ TESTE DE RECUPERAÇÃO DE FALHAS');
  console.log('🔧 Testando capacidade de recuperação do sistema');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  try {
    // Executar todos os testes de recuperação
    await testTokenRecovery();
    await testOverloadRecovery();
    await testCorruptedDataRecovery();
    await testDatabaseRecovery();
    await testMemoryRecovery();
    await testTimeoutRecovery();
    await testConcurrencyRecovery();
    
    // Calcular estatísticas finais
    const totalDuration = Date.now() - startTime;
    const successRate = (recoveryResults.passedTests / recoveryResults.totalTests * 100).toFixed(1);
    const avgRecoveryTime = recoveryResults.recoveryTimes.length > 0 
      ? Math.round(recoveryResults.recoveryTimes.reduce((a, b) => a + b, 0) / recoveryResults.recoveryTimes.length)
      : 0;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RELATÓRIO DE RECUPERAÇÃO DE FALHAS');
    console.log('=' .repeat(60));
    
    console.log(`📈 RESUMO:`);
    console.log(`   Total de Testes: ${recoveryResults.totalTests}`);
    console.log(`   Testes Passaram: ${recoveryResults.passedTests}`);
    console.log(`   Testes Falharam: ${recoveryResults.failedTests}`);
    console.log(`   Taxa de Sucesso: ${successRate}%`);
    console.log(`   Tempo Total: ${Math.round(totalDuration / 1000)}s`);
    console.log(`   Tempo Médio de Recuperação: ${avgRecoveryTime}ms`);
    
    // Análise de recuperação
    if (recoveryResults.recoveryTimes.length > 0) {
      const fastestRecovery = Math.min(...recoveryResults.recoveryTimes);
      const slowestRecovery = Math.max(...recoveryResults.recoveryTimes);
      
      console.log(`\n⚡ TEMPOS DE RECUPERAÇÃO:`);
      console.log(`   Mais Rápida: ${fastestRecovery}ms`);
      console.log(`   Mais Lenta: ${slowestRecovery}ms`);
      console.log(`   Média: ${avgRecoveryTime}ms`);
    }
    
    // Cenários de falha
    if (recoveryResults.failureScenarios.length > 0) {
      console.log(`\n🚨 CENÁRIOS DE FALHA:`);
      recoveryResults.failureScenarios.forEach((scenario, index) => {
        console.log(`   ${index + 1}. ${scenario.test}: ${scenario.error}`);
      });
    }
    
    // Avaliação de resiliência
    console.log(`\n🛡️ AVALIAÇÃO DE RESILIÊNCIA:`);
    if (parseFloat(successRate) >= 90) {
      console.log(`   🏆 EXCELENTE: Sistema altamente resiliente!`);
    } else if (parseFloat(successRate) >= 75) {
      console.log(`   ✅ BOM: Sistema resiliente com pequenos pontos de melhoria`);
    } else if (parseFloat(successRate) >= 50) {
      console.log(`   ⚠️  MÉDIO: Sistema precisa de melhorias na recuperação`);
    } else {
      console.log(`   🚨 CRÍTICO: Sistema não é resiliente a falhas`);
    }
    
    if (avgRecoveryTime <= 200) {
      console.log(`   🚀 Recuperação ultra-rápida detectada`);
    } else if (avgRecoveryTime <= 500) {
      console.log(`   ⚡ Recuperação rápida na maioria dos casos`);
    } else {
      console.log(`   🐌 Recuperação lenta detectada`);
    }
    
    // Recomendações
    console.log(`\n💡 RECOMENDAÇÕES:`);
    if (recoveryResults.failedTests === 0) {
      console.log(`   🎯 Sistema passou em todos os testes de recuperação!`);
    } else {
      console.log(`   🔧 Focar na melhoria dos cenários que falharam`);
    }
    
    if (avgRecoveryTime > 300) {
      console.log(`   ⚡ Otimizar tempos de recuperação`);
    }
    
    console.log(`   📊 Implementar monitoramento de resiliência em produção`);
    
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO NOS TESTES DE RECUPERAÇÃO:', error);
  }
}

// Executar teste
runRecoveryTests().catch(console.error);
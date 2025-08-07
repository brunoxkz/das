// Teste de Carga para 1.000 Usuários Simultâneos
// Execute: node stress-test-1000-users.js

const crypto = require('crypto');

// Configurações do teste
const CONFIG = {
  baseUrl: 'http://localhost:5000',
  totalUsers: 1000,
  batchSize: 50, // Usuários por batch
  testDuration: 60000, // 1 minuto
  scenarios: {
    login: 0.3,      // 30% fazendo login
    dashboard: 0.4,   // 40% acessando dashboard  
    whatsapp: 0.2,    // 20% usando WhatsApp
    extension: 0.1    // 10% extensão ativa
  }
};

// Métricas de performance
const metrics = {
  requests: 0,
  errors: 0,
  timeouts: 0,
  responseTimes: [],
  errorTypes: {},
  concurrentUsers: 0
};

// Simular requisição HTTP
async function makeRequest(url, options = {}) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      timeout: 10000, // 10s timeout
      ...options
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    metrics.requests++;
    metrics.responseTimes.push(responseTime);
    
    if (!response.ok) {
      metrics.errors++;
      const errorType = `HTTP_${response.status}`;
      metrics.errorTypes[errorType] = (metrics.errorTypes[errorType] || 0) + 1;
    }
    
    return { success: response.ok, responseTime, status: response.status };
    
  } catch (error) {
    metrics.errors++;
    
    if (error.name === 'AbortError') {
      metrics.timeouts++;
      metrics.errorTypes['TIMEOUT'] = (metrics.errorTypes['TIMEOUT'] || 0) + 1;
    } else {
      metrics.errorTypes['CONNECTION_ERROR'] = (metrics.errorTypes['CONNECTION_ERROR'] || 0) + 1;
    }
    
    return { success: false, error: error.message };
  }
}

// Simular usuário fazendo login
async function simulateLogin(userId) {
  return await makeRequest(`${CONFIG.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `user${userId}@test.com`,
      password: 'test123'
    })
  });
}

// Simular acesso ao dashboard
async function simulateDashboard(token) {
  return await makeRequest(`${CONFIG.baseUrl}/api/user`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// Simular ping da extensão WhatsApp
async function simulateExtensionPing(token) {
  return await makeRequest(`${CONFIG.baseUrl}/api/whatsapp-extension/status`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '1.0.0',
      pendingMessages: Math.floor(Math.random() * 10),
      sentMessages: Math.floor(Math.random() * 50),
      failedMessages: Math.floor(Math.random() * 3),
      isActive: true
    })
  });
}

// Simular WhatsApp campaign access
async function simulateWhatsappCampaign(token) {
  return await makeRequest(`${CONFIG.baseUrl}/api/whatsapp-campaigns`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// Simular comportamento de um usuário
async function simulateUser(userId) {
  metrics.concurrentUsers++;
  
  try {
    const scenario = Math.random();
    
    if (scenario < CONFIG.scenarios.login) {
      // Cenário: Login + Dashboard
      const login = await simulateLogin(userId);
      if (login.success) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa realista
        await simulateDashboard('fake-token');
      }
      
    } else if (scenario < CONFIG.scenarios.login + CONFIG.scenarios.dashboard) {
      // Cenário: Dashboard browsing
      await simulateDashboard('fake-token');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await simulateWhatsappCampaign('fake-token');
      
    } else if (scenario < CONFIG.scenarios.login + CONFIG.scenarios.dashboard + CONFIG.scenarios.whatsapp) {
      // Cenário: WhatsApp campaigns
      await simulateWhatsappCampaign('fake-token');
      await new Promise(resolve => setTimeout(resolve, 1500));
      await simulateWhatsappCampaign('fake-token');
      
    } else {
      // Cenário: Extensão ativa (ping contínuo)
      for (let i = 0; i < 3; i++) {
        await simulateExtensionPing('fake-token');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
  } catch (error) {
    console.error(`❌ Erro usuário ${userId}:`, error.message);
  } finally {
    metrics.concurrentUsers--;
  }
}

// Executar teste em batches para evitar sobrecarregar sistema local
async function runStressTest() {
  console.log('🚀 INICIANDO TESTE DE CARGA PARA 1.000 USUÁRIOS');
  console.log('===============================================');
  
  const startTime = Date.now();
  const batches = Math.ceil(CONFIG.totalUsers / CONFIG.batchSize);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * CONFIG.batchSize;
    const batchEnd = Math.min(batchStart + CONFIG.batchSize, CONFIG.totalUsers);
    
    console.log(`📦 Batch ${batch + 1}/${batches}: Usuários ${batchStart}-${batchEnd - 1}`);
    
    // Executar batch de usuários simultâneos
    const promises = [];
    for (let userId = batchStart; userId < batchEnd; userId++) {
      promises.push(simulateUser(userId));
    }
    
    await Promise.all(promises);
    
    // Pausa entre batches para simular chegada gradual
    if (batch < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Calcular estatísticas
  const avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length || 0;
  const p95ResponseTime = metrics.responseTimes.sort((a, b) => a - b)[Math.floor(metrics.responseTimes.length * 0.95)] || 0;
  const successRate = ((metrics.requests - metrics.errors) / metrics.requests * 100) || 0;
  const requestsPerSecond = metrics.requests / (totalTime / 1000);
  
  // Relatório final
  console.log('\n📊 RELATÓRIO DE PERFORMANCE');
  console.log('============================');
  console.log(`⏱️  Tempo total: ${totalTime}ms`);
  console.log(`📈 Total requisições: ${metrics.requests}`);
  console.log(`✅ Taxa de sucesso: ${successRate.toFixed(2)}%`);
  console.log(`❌ Total erros: ${metrics.errors}`);
  console.log(`⏱️  Timeout: ${metrics.timeouts}`);
  console.log(`📊 Req/segundo: ${requestsPerSecond.toFixed(2)}`);
  console.log(`⚡ Tempo médio resposta: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`🔥 P95 resposta: ${p95ResponseTime}ms`);
  
  if (Object.keys(metrics.errorTypes).length > 0) {
    console.log('\n🚨 TIPOS DE ERRO:');
    Object.entries(metrics.errorTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  }
  
  // Análise crítica
  console.log('\n🎯 ANÁLISE CRÍTICA:');
  
  if (successRate < 95) {
    console.log('❌ CRÍTICO: Taxa de sucesso < 95% - Sistema instável');
  }
  
  if (avgResponseTime > 2000) {
    console.log('⚠️  ALERTA: Tempo médio > 2s - Performance inadequada');
  }
  
  if (metrics.timeouts > 0) {
    console.log('🚨 CRÍTICO: Timeouts detectados - Sistema sobrecarregado');
  }
  
  if (requestsPerSecond < 100) {
    console.log('⚠️  ALERTA: Throughput baixo < 100 req/s');
  }
  
  console.log('\n💡 RECOMENDAÇÕES:');
  if (successRate < 99) {
    console.log('- Implementar connection pooling');
    console.log('- Migrar SQLite → PostgreSQL');
    console.log('- Adicionar rate limiting distribuído');
  }
  
  if (avgResponseTime > 500) {
    console.log('- Implementar cache distribuído (Redis)');
    console.log('- Otimizar queries do banco');
    console.log('- Adicionar CDN para assets');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runStressTest().catch(console.error);
}

module.exports = { runStressTest, metrics };
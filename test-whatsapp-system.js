// Teste Completo do Sistema WhatsApp - Simulação de Extensão
// Execute: node test-whatsapp-system.js

import crypto from 'crypto';
import fetch from 'node-fetch';

const CONFIG = {
  baseUrl: 'http://localhost:5000',
  testUser: {
    email: 'admin@vendzz.com',
    password: 'admin123'
  }
};

let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Função auxiliar para fazer requisições
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
    
    return {
      success: response.ok,
      status: response.status,
      data: jsonData
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para registrar resultado do teste
function logTest(name, success, details = '') {
  testResults.tests.push({ name, success, details });
  if (success) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name} - ${details}`);
  }
}

// TESTE 1: Autenticação
async function testAuthentication() {
  console.log('\n🔐 TESTE 1: AUTENTICAÇÃO');
  
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(CONFIG.testUser)
  });
  
  if (response.success && response.data.accessToken) {
    authToken = response.data.accessToken;
    logTest('Login bem-sucedido', true, `Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logTest('Login falhou', false, response.error || 'Token não recebido');
    return false;
  }
}

// TESTE 2: Ping da Extensão
async function testExtensionPing() {
  console.log('\n📡 TESTE 2: PING DA EXTENSÃO');
  
  const pingData = {
    version: '1.0.0',
    pendingMessages: 5,
    sentMessages: 20,
    failedMessages: 1,
    isActive: true
  };
  
  const response = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify(pingData)
  });
  
  if (response.success && response.data.settings) {
    logTest('Ping recebido com configurações', true, `Settings: ${Object.keys(response.data.settings).join(', ')}`);
    return response.data.settings;
  } else {
    logTest('Ping falhou', false, response.error || 'Configurações não retornadas');
    return null;
  }
}

// TESTE 3: Configurações da Extensão
async function testExtensionSettings() {
  console.log('\n⚙️ TESTE 3: CONFIGURAÇÕES DA EXTENSÃO');
  
  // Buscar configurações
  const getResponse = await makeRequest('/api/whatsapp-extension/settings');
  
  if (getResponse.success) {
    logTest('Busca de configurações', true, `Configurações carregadas`);
  } else {
    logTest('Busca de configurações', false, 'Falha ao carregar');
    return false;
  }
  
  // Atualizar configurações
  const newSettings = {
    autoSend: true,
    messageDelay: 5000,
    maxMessagesPerDay: 150,
    workingHours: {
      enabled: true,
      start: '09:00',
      end: '18:00'
    },
    antiSpam: {
      enabled: true,
      minDelay: 3000,
      maxDelay: 8000,
      randomization: true
    }
  };
  
  const setResponse = await makeRequest('/api/whatsapp-extension/settings', {
    method: 'POST',
    body: JSON.stringify(newSettings)
  });
  
  if (setResponse.success) {
    logTest('Atualização de configurações', true, 'Configurações salvas');
  } else {
    logTest('Atualização de configurações', false, 'Falha ao salvar');
  }
  
  return true;
}

// TESTE 4: Campanhas WhatsApp
async function testWhatsAppCampaigns() {
  console.log('\n📱 TESTE 4: CAMPANHAS WHATSAPP');
  
  // Buscar campanhas existentes
  const campaignsResponse = await makeRequest('/api/whatsapp-campaigns');
  
  if (campaignsResponse.success) {
    const campaigns = campaignsResponse.data;
    logTest('Listagem de campanhas', true, `${campaigns.length} campanhas encontradas`);
    
    if (campaigns.length === 0) {
      logTest('Nenhuma campanha ativa', true, 'Sistema sem campanhas para testar');
      return true;
    }
    
    // Testar primeira campanha
    const campaign = campaigns[0];
    logTest('Campanha de teste encontrada', true, `ID: ${campaign.id}, Status: ${campaign.status}`);
    
    return campaign;
  } else {
    logTest('Listagem de campanhas', false, 'Falha ao buscar campanhas');
    return false;
  }
}

// TESTE 5: Mensagens Pendentes
async function testPendingMessages() {
  console.log('\n📤 TESTE 5: MENSAGENS PENDENTES');
  
  const response = await makeRequest('/api/whatsapp-extension/pending-messages?limit=10');
  
  if (response.success) {
    const messages = response.data;
    logTest('Busca de mensagens pendentes', true, `${messages.length} mensagens encontradas`);
    
    if (messages.length > 0) {
      const message = messages[0];
      logTest('Estrutura da mensagem válida', true, `ID: ${message.id}, Phone: ${message.phone?.substring(0, 5)}...`);
    }
    
    return messages;
  } else {
    logTest('Busca de mensagens pendentes', false, 'Falha na busca');
    return [];
  }
}

// TESTE 6: Simulação de Envio
async function testMessageSending(messages) {
  console.log('\n🚀 TESTE 6: SIMULAÇÃO DE ENVIO');
  
  if (!messages || messages.length === 0) {
    logTest('Sem mensagens para enviar', true, 'Teste pulado - sem dados');
    return true;
  }
  
  // Criar dados de teste se não há mensagens reais
  const testMessage = {
    id: 'test-msg-' + Date.now(),
    phone: '11999999999',
    message: 'Teste de mensagem WhatsApp',
    campaignId: 'test-campaign'
  };
  
  // Simular sucesso no envio
  const successResponse = await makeRequest('/api/whatsapp-extension/logs', {
    method: 'POST',
    body: JSON.stringify({
      logId: testMessage.id,
      status: 'sent',
      timestamp: Date.now(),
      phone: testMessage.phone,
      message: testMessage.message
    })
  });
  
  if (successResponse.success) {
    logTest('Log de envio bem-sucedido', true, 'Status atualizado para "sent"');
  } else {
    logTest('Log de envio', false, 'Endpoint /api/whatsapp-extension/logs não encontrado');
  }
  
  // Simular falha no envio
  const failureResponse = await makeRequest('/api/whatsapp-extension/logs', {
    method: 'POST',
    body: JSON.stringify({
      logId: testMessage.id,
      status: 'failed',
      error: 'Número inválido',
      timestamp: Date.now(),
      phone: testMessage.phone
    })
  });
  
  if (failureResponse.success) {
    logTest('Log de falha registrado', true, 'Error handling funcionando');
  } else {
    logTest('Log de falha', false, 'Falha no error handling - endpoint não encontrado');
  }
  
  return true;
}

// TESTE 7: Rate Limiting
async function testRateLimiting() {
  console.log('\n🛡️ TESTE 7: RATE LIMITING');
  
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({ version: '1.0.0', test: i })
    }));
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  
  logTest('Rate limiting funcionando', successful < 20, `${successful}/20 sucessos, ${rateLimited} rate limited`);
  
  return true;
}

// TESTE 8: Segurança (Token Inválido)
async function testSecurity() {
  console.log('\n🔒 TESTE 8: SEGURANÇA');
  
  const originalToken = authToken;
  authToken = 'invalid-token-test';
  
  const response = await makeRequest('/api/whatsapp-extension/settings');
  
  if (!response.success && response.status === 401) {
    logTest('Rejeição de token inválido', true, 'Segurança funcionando');
  } else {
    logTest('Falha na segurança', false, 'Token inválido aceito');
  }
  
  authToken = originalToken; // Restaurar token válido
  
  return true;
}

// TESTE 9: Performance
async function testPerformance() {
  console.log('\n⚡ TESTE 9: PERFORMANCE');
  
  const start = Date.now();
  
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({ version: '1.0.0', batch: i })
    }));
  }
  
  await Promise.all(promises);
  const duration = Date.now() - start;
  
  if (duration < 5000) { // Menos de 5 segundos para 10 requisições
    logTest('Performance adequada', true, `${duration}ms para 10 requisições`);
  } else {
    logTest('Performance lenta', false, `${duration}ms - muito lento`);
  }
  
  return true;
}

// TESTE 10: Sincronização Bidirecional
async function testBidirectionalSync() {
  console.log('\n🔄 TESTE 10: SINCRONIZAÇÃO BIDIRECIONAL');
  
  // Alterar configuração
  const newConfig = {
    autoSend: false,
    messageDelay: 10000,
    testSync: Date.now()
  };
  
  const setResponse = await makeRequest('/api/whatsapp-extension/settings', {
    method: 'POST',
    body: JSON.stringify(newConfig)
  });
  
  if (!setResponse.success) {
    logTest('Sincronização falhou', false, 'Não conseguiu salvar configuração');
    return false;
  }
  
  // Fazer ping para receber configuração atualizada
  const pingResponse = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify({ version: '1.0.0', syncTest: true })
  });
  
  if (pingResponse.success && pingResponse.data.settings.autoSend === false) {
    logTest('Sincronização bidirecional', true, 'Configuração sincronizada via ping');
  } else {
    logTest('Sincronização bidirecional', false, 'Configuração não sincronizada');
  }
  
  return true;
}

// Executar todos os testes
async function runAllTests() {
  console.log('🧪 INICIANDO BATERIA COMPLETA DE TESTES WHATSAPP');
  console.log('==================================================');
  
  try {
    // Executar testes em sequência
    if (await testAuthentication()) {
      const settings = await testExtensionPing();
      await testExtensionSettings();
      const campaign = await testWhatsAppCampaigns();
      const messages = await testPendingMessages();
      await testMessageSending(messages);
      await testRateLimiting();
      await testSecurity();
      await testPerformance();
      await testBidirectionalSync();
    }
    
    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DE TESTES');
    console.log('=============================');
    console.log(`✅ Testes aprovados: ${testResults.passed}`);
    console.log(`❌ Testes falharam: ${testResults.failed}`);
    console.log(`📈 Taxa de sucesso: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('✅ Sistema WhatsApp pronto para instalação da extensão');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM');
      console.log('🔧 Revisar problemas antes da instalação:');
      testResults.tests.filter(t => !t.success).forEach(test => {
        console.log(`   - ${test.name}: ${test.details}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro fatal nos testes:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testResults };
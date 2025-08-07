// Teste da Extensão Vendzz WhatsApp
// Execute este arquivo no console do Chrome para testar a extensão

console.log('🧪 INICIANDO TESTE DA EXTENSÃO VENDZZ WHATSAPP');

// Configuração de teste
const testConfig = {
  serverUrl: 'http://localhost:5000',
  token: 'admin123' // Token de teste do admin
};

// Função para testar API
async function testAPI(endpoint, options = {}) {
  try {
    const url = `${testConfig.serverUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testConfig.token}`
    };

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint}:`, data);
      return data;
    } else {
      console.error(`❌ ${endpoint}:`, data);
      return null;
    }
  } catch (error) {
    console.error(`❌ ERRO ${endpoint}:`, error);
    return null;
  }
}

// Testes sequenciais
async function runTests() {
  console.log('\n🔌 1. Testando conexão com servidor...');
  await testAPI('/api/whatsapp-extension/status');

  console.log('\n📤 2. Testando busca de mensagens pendentes...');
  await testAPI('/api/whatsapp-extension/pending');

  console.log('\n📊 3. Testando envio de log...');
  await testAPI('/api/whatsapp-extension/logs', {
    method: 'POST',
    body: JSON.stringify({
      logId: 'test-log-123',
      status: 'sent',
      phone: '11999999999',
      timestamp: new Date().toISOString()
    })
  });

  console.log('\n📱 4. Testando ping da extensão...');
  await testAPI('/api/whatsapp-extension/status', {
    method: 'POST',
    body: JSON.stringify({
      version: '1.0.0',
      pendingMessages: 0,
      sentMessages: 1,
      failedMessages: 0,
      isActive: true
    })
  });

  console.log('\n🎯 5. Testando campanhas WhatsApp...');
  await testAPI('/api/whatsapp-campaigns');

  console.log('\n📋 6. Testando templates WhatsApp...');
  await testAPI('/api/whatsapp-templates');

  console.log('\n✅ TESTES CONCLUÍDOS!');
}

// Executar testes
runTests().then(() => {
  console.log('\n🎉 Todos os testes da extensão foram executados!');
  console.log('📝 Verifique os resultados acima para identificar problemas.');
});

// Função para simular extensão
function simulateExtension() {
  console.log('\n🤖 SIMULANDO COMPORTAMENTO DA EXTENSÃO...');
  
  // Simular verificação de mensagens pendentes a cada 30s
  const checkMessages = async () => {
    console.log('🔍 Verificando mensagens pendentes...');
    const messages = await testAPI('/api/whatsapp-extension/pending');
    
    if (messages && messages.length > 0) {
      console.log(`📱 ${messages.length} mensagens encontradas!`);
      
      // Simular envio de cada mensagem
      for (const message of messages) {
        console.log(`📤 Enviando para ${message.phone}: ${message.message.substring(0, 50)}...`);
        
        // Simular delay de envio
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reportar sucesso
        await testAPI('/api/whatsapp-extension/logs', {
          method: 'POST',
          body: JSON.stringify({
            logId: message.logId,
            status: 'sent',
            phone: message.phone,
            timestamp: new Date().toISOString()
          })
        });
        
        console.log(`✅ Mensagem enviada para ${message.phone}`);
      }
    } else {
      console.log('📭 Nenhuma mensagem pendente');
    }
  };

  // Executar uma vez imediatamente
  checkMessages();
  
  // Configurar verificação periódica (opcional, descomente para testar)
  // setInterval(checkMessages, 30000);
}

// Função para testar criação de campanha
async function testCampaignCreation() {
  console.log('\n📊 TESTANDO CRIAÇÃO DE CAMPANHA...');
  
  const campaignData = {
    name: 'Teste Extensão WhatsApp',
    quizId: 'Qm4wxpfPgkMrwoMhDFNLZ',
    quizTitle: 'Quiz de Teste',
    messages: [
      'Oi! Vi que você respondeu nosso quiz. Obrigado!',
      'Ei, que tal finalizar o que começou?',
      'Última chance de participar!'
    ],
    targetAudience: 'abandoned',
    triggerType: 'delayed',
    triggerDelay: 1,
    triggerUnit: 'minutes'
  };

  const campaign = await testAPI('/api/whatsapp-campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignData)
  });

  if (campaign) {
    console.log('✅ Campanha criada com sucesso!');
    console.log('🔥 Aguarde 1 minuto e execute simulateExtension() para ver mensagens pendentes');
  }
}

// Exportar funções para uso manual
window.vendzz = {
  testAPI,
  runTests,
  simulateExtension,
  testCampaignCreation,
  config: testConfig
};

console.log('\n🎮 FUNÇÕES DISPONÍVEIS:');
console.log('📝 vendzz.runTests() - Executar todos os testes');
console.log('🤖 vendzz.simulateExtension() - Simular comportamento da extensão');
console.log('📊 vendzz.testCampaignCreation() - Criar campanha de teste');
console.log('🔧 vendzz.testAPI(endpoint, options) - Testar endpoint específico');
console.log('\n💡 Exemplo: vendzz.testCampaignCreation()');
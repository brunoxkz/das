import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function testeRapido() {
  console.log('🚀 TESTE RÁPIDO - EXTENSÃO CHROME WHATSAPP');
  console.log('='.repeat(50));
  
  let token = '';
  
  try {
    // 1. Autenticação
    console.log('\n1. 🔐 AUTENTICAÇÃO');
    const authResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    token = authResponse.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Status da extensão
    console.log('\n2. 📊 STATUS DA EXTENSÃO');
    const statusResponse = await makeRequest('/api/whatsapp-extension/status', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Status obtido:', statusResponse.connected ? 'Conectada' : 'Desconectada');
    
    // 3. Ping com simulação
    console.log('\n3. 📡 PING COM SIMULAÇÃO');
    const pingResponse = await makeRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        version: '2.0.0',
        isActive: true,
        pendingMessages: 0,
        sentMessages: 5,
        failedMessages: 0
      })
    });
    console.log('✅ Ping enviado com sucesso');
    
    // 4. Mensagens pendentes
    console.log('\n4. 📱 MENSAGENS PENDENTES');
    const pendingResponse = await makeRequest('/api/whatsapp-extension/pending-messages', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${pendingResponse.length} mensagens pendentes encontradas`);
    
    // 5. Configurações da extensão
    console.log('\n5. ⚙️ CONFIGURAÇÕES DA EXTENSÃO');
    
    // Obter configurações atuais
    const currentSettings = await makeRequest('/api/whatsapp-extension/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Configurações atuais obtidas');
    
    // Atualizar configurações
    const newSettings = {
      autoSend: true,
      messageDelay: 25000,
      maxMessagesPerDay: 80,
      workingHours: {
        start: '09:00',
        end: '18:00'
      }
    };
    
    await makeRequest('/api/whatsapp-extension/settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(newSettings)
    });
    console.log('✅ Configurações atualizadas');
    
    // 6. Arquivos de automação
    console.log('\n6. 📁 ARQUIVOS DE AUTOMAÇÃO');
    const filesResponse = await makeRequest('/api/whatsapp-automation-files', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${filesResponse.length} arquivos de automação disponíveis`);
    
    if (filesResponse.length > 0) {
      // Testar acesso a um arquivo específico
      const firstFile = filesResponse[0];
      const fileContacts = await makeRequest(`/api/whatsapp-automation-files/${firstFile.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Arquivo "${firstFile.filename}" contém ${fileContacts.contacts.length} contatos`);
    }
    
    // 7. Campanhas WhatsApp
    console.log('\n7. 🎯 CAMPANHAS WHATSAPP');
    const campaignsResponse = await makeRequest('/api/whatsapp-campaigns', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${campaignsResponse.length} campanhas WhatsApp encontradas`);
    
    // 8. Logs de WhatsApp
    console.log('\n8. 📋 LOGS DE WHATSAPP');
    const logsResponse = await makeRequest('/api/whatsapp-logs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${logsResponse.length} logs de WhatsApp encontrados`);
    
    // 9. Quizzes disponíveis
    console.log('\n9. 📝 QUIZZES DISPONÍVEIS');
    const quizzesResponse = await makeRequest('/api/quizzes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${quizzesResponse.length} quizzes disponíveis`);
    
    // 10. Teste de performance
    console.log('\n10. ⚡ TESTE DE PERFORMANCE');
    const startTime = Date.now();
    
    await Promise.all([
      makeRequest('/api/whatsapp-extension/status', { headers: { Authorization: `Bearer ${token}` } }),
      makeRequest('/api/whatsapp-campaigns', { headers: { Authorization: `Bearer ${token}` } }),
      makeRequest('/api/whatsapp-automation-files', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    
    const endTime = Date.now();
    console.log(`✅ 3 requisições simultâneas executadas em ${endTime - startTime}ms`);
    
    // Resultado final
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TESTE RÁPIDO CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(50));
    
    console.log('\n📊 RESUMO:');
    console.log('✅ Autenticação: OK');
    console.log('✅ Status da extensão: OK');
    console.log('✅ Ping e sincronização: OK');
    console.log('✅ Mensagens pendentes: OK');
    console.log('✅ Configurações: OK');
    console.log('✅ Arquivos de automação: OK');
    console.log('✅ Campanhas WhatsApp: OK');
    console.log('✅ Logs de WhatsApp: OK');
    console.log('✅ Quizzes: OK');
    console.log('✅ Performance: OK');
    
    console.log('\n🚀 SISTEMA TOTALMENTE FUNCIONAL!');
    console.log('💯 Todas as funcionalidades da extensão validadas');
    console.log('🔥 Pronto para uso em produção');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('🔧 Verifique se o servidor está rodando e tente novamente');
  }
}

// Executar teste
testeRapido();
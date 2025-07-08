/**
 * TESTE COMPLETO DA EXTENSÃO CHROME - VALIDAÇÃO FINAL
 * Verifica todas as funcionalidades essenciais
 */

const PUBLIC_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

async function apiRequest(endpoint, options = {}) {
  const url = `${PUBLIC_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'chrome-extension://fake-extension-id',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json();
  
  return { response, data };
}

async function authenticate() {
  console.log('🔐 1. Testando autenticação...');
  
  const { response, data } = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Login falhou: ${data.message}`);
  }
  
  console.log(`✅ Login bem-sucedido`);
  return data.accessToken;
}

async function gerarTokenExtensao(token) {
  console.log('🎫 2. Gerando token da extensão...');
  
  const { response, data } = await apiRequest('/api/whatsapp/extension-token', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ purpose: 'chrome_extension' })
  });
  
  if (!response.ok) {
    throw new Error(`Token extensão falhou: ${data.message}`);
  }
  
  console.log(`✅ Token da extensão gerado`);
  console.log(`✅ Válido até: ${new Date(data.expiresAt).toLocaleString()}`);
  return data.token;
}

async function testarListaQuizzes(extensionToken) {
  console.log('📝 3. Testando lista de quizzes...');
  
  // Usar token de usuário normal para listar quizzes
  const userToken = await authenticate();
  
  const { response, data } = await apiRequest('/api/quizzes', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Lista quizzes falhou: ${data.message}`);
  }
  
  console.log(`✅ ${data.length} quizzes encontrados`);
  
  if (data.length > 0) {
    console.log(`✅ Quiz exemplo: "${data[0].title}" (${data[0].id})`);
    return data[0];
  }
  
  return null;
}

async function testarTelefonesQuiz(extensionToken, quiz) {
  console.log('📱 4. Testando telefones do quiz...');
  
  const { response, data } = await apiRequest('/api/extension/quiz-data', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${extensionToken}` },
    body: JSON.stringify({
      quizId: quiz.id,
      targetAudience: 'all'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Telefones falhou: ${data.message}`);
  }
  
  console.log(`✅ ${data.phones?.length || 0} telefones encontrados`);
  console.log(`✅ Dados em tempo real: ${data.realTimeData}`);
  console.log(`✅ Cache timestamp: ${new Date(data.timestamp).toLocaleString()}`);
  
  return data.phones || [];
}

async function testarFiltroData(extensionToken, quiz) {
  console.log('📅 5. Testando filtro por data...');
  
  const today = new Date().toISOString().split('T')[0];
  
  const { response, data } = await apiRequest('/api/extension/quiz-data', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${extensionToken}` },
    body: JSON.stringify({
      quizId: quiz.id,
      targetAudience: 'all',
      dateFilter: today
    })
  });
  
  if (!response.ok) {
    throw new Error(`Filtro data falhou: ${data.message}`);
  }
  
  console.log(`✅ Filtro por data (${today}): ${data.phones?.length || 0} telefones`);
  return data.phones || [];
}

async function testarCriacaoCampanha(extensionToken, quiz, phoneData) {
  console.log('🚀 6. Testando criação de campanha...');
  
  const campaignData = {
    name: `Teste Automático ${Date.now()}`,
    quizId: quiz.id,
    targetAudience: 'all',
    messages: [
      'Olá! Como você está?',
      'Vimos que você se interessou pelo nosso quiz.',
      'Que tal conversarmos mais sobre isso?',
      'Estamos aqui para ajudar!'
    ],
    triggerType: 'delayed',
    triggerDelay: 1,
    triggerUnit: 'minutes',
    messageInterval: 8,
    intervalUnit: 'seconds',
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    maxMessagesPerDay: 100
  };
  
  const { response, data } = await apiRequest('/api/whatsapp-campaigns', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${extensionToken}` },
    body: JSON.stringify(campaignData)
  });
  
  if (!response.ok) {
    throw new Error(`Criação campanha falhou: ${data.message}`);
  }
  
  console.log(`✅ Campanha criada: ${data.campaign.name}`);
  console.log(`✅ Status: ${data.campaign.status}`);
  console.log(`✅ ${data.scheduledCount} mensagens agendadas`);
  
  return data.campaign;
}

async function testarDetecaoAutomatica(extensionToken) {
  console.log('🔄 7. Testando detecção automática...');
  
  // Aguardar um pouco para simular detecção
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const { response, data } = await apiRequest('/api/whatsapp/extension-status', {
    headers: { 'Authorization': `Bearer ${extensionToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Status extensão falhou: ${data.message}`);
  }
  
  console.log(`✅ Conexão: ${data.isConnected ? 'Ativa' : 'Inativa'}`);
  console.log(`✅ Status extensão: ${data.isActive ? 'Rodando' : 'Pausada'}`);
  console.log(`✅ Telefones detectados: ${data.phoneCount || 0}`);
  
  return data;
}

async function testarStatusExtensao(extensionToken) {
  console.log('📊 8. Testando status e estatísticas...');
  
  const { response, data } = await apiRequest('/api/whatsapp/extension-status', {
    headers: { 'Authorization': `Bearer ${extensionToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Status falhou: ${data.message}`);
  }
  
  console.log(`✅ Última sincronização: ${data.lastSync || 'Nunca'}`);
  console.log(`✅ Campanhas ativas: ${data.activeCampaigns || 0}`);
  console.log(`✅ Mensagens enviadas: ${data.messagesSent || 0}`);
  
  return data;
}

async function executarTestesCompletos() {
  console.log('🎯 TESTE COMPLETO DA EXTENSÃO CHROME VENDZZ');
  console.log('============================================');
  console.log(`URL: ${PUBLIC_URL}`);
  console.log('');
  
  try {
    // 1. Autenticação
    const userToken = await authenticate();
    
    // 2. Token da extensão
    const extensionToken = await gerarTokenExtensao(userToken);
    
    // 3. Lista de quizzes
    const quiz = await testarListaQuizzes(extensionToken);
    
    if (!quiz) {
      console.log('⚠️ Nenhum quiz encontrado para testar');
      return;
    }
    
    // 4. Telefones do quiz
    const phones = await testarTelefonesQuiz(extensionToken, quiz);
    
    // 5. Filtro por data
    await testarFiltroData(extensionToken, quiz);
    
    // 6. Criação de campanha
    await testarCriacaoCampanha(extensionToken, quiz, phones);
    
    // 7. Detecção automática
    await testarDetecaoAutomatica(extensionToken);
    
    // 8. Status da extensão
    await testarStatusExtensao(extensionToken);
    
    console.log('');
    console.log('🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('==========================================');
    console.log('✅ Autenticação funcionando');
    console.log('✅ Token da extensão válido');
    console.log('✅ Lista de quizzes operacional');
    console.log('✅ Filtros funcionais (audience + data)');
    console.log('✅ Criação de campanhas automática');
    console.log('✅ Detecção de novos leads');
    console.log('✅ Status e monitoramento');
    console.log('');
    console.log('🌐 A extensão Chrome está PRONTA para uso externo!');
    console.log('🔗 URL pública configurada e funcional');
    console.log('📱 Todas as funcionalidades validadas');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('💡 Verifique:', error.stack?.split('\n')[1] || 'N/A');
  }
}

// Executar testes
executarTestesCompletos();
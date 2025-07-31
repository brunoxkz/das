// Script de teste para sincronização automática de leads na extensão Chrome
// Simula o fluxo real: criar campanha → novos leads chegam → extensão detecta automaticamente

const config = {
  serverUrl: 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev',
  userEmail: 'admin@vendzz.com',
  userPassword: 'admin123'
};

let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${config.serverUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function authenticate() {
  console.log('🔐 Fazendo login...');
  
  const loginData = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: config.userEmail,
      password: config.userPassword
    })
  });

  authToken = loginData.token;
  console.log('✅ Login realizado com sucesso');
  return authToken;
}

async function criarQuizResposta(quizId, telefone, nome = 'Usuário Teste', isComplete = true) {
  console.log(`📝 Criando resposta para quiz ${quizId}...`);
  
  const responses = {
    nome: { type: 'text', value: nome },
    telefone_principal: { type: 'phone', value: telefone },
    email: { type: 'email', value: `${telefone}@teste.com` },
    idade: { type: 'number', value: '25' }
  };

  const metadata = {
    isComplete: isComplete,
    completionPercentage: isComplete ? 100 : 50,
    isPartial: false
  };

  const responseData = await makeRequest(`/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      responses,
      metadata
    })
  });

  console.log(`✅ Resposta criada para ${telefone} (${isComplete ? 'completa' : 'abandonada'})`);
  return responseData;
}

async function verificarArquivoAutomacao(quizId) {
  console.log(`📁 Verificando arquivo de automação para quiz ${quizId}...`);
  
  const files = await makeRequest('/api/whatsapp-automation-files');
  const file = files.find(f => f.quiz_id === quizId);
  
  if (!file) {
    console.log('❌ Arquivo de automação não encontrado');
    return null;
  }
  
  console.log(`✅ Arquivo encontrado: ${file.id} - ${file.quiz_title}`);
  console.log(`📊 Contatos no arquivo: ${file.contacts?.length || 0}`);
  
  return file;
}

async function testarSincronizacaoExtensao(userId, quizId, lastSync) {
  console.log(`🔄 Testando sincronização para usuário ${userId}, quiz ${quizId}...`);
  
  const syncData = await makeRequest(`/api/whatsapp-automation-file/${userId}/${quizId}/sync?lastSync=${lastSync}`);
  
  console.log(`📊 Resultado da sincronização:`, {
    hasUpdates: syncData.hasUpdates,
    newLeads: syncData.newLeads?.length || 0,
    lastUpdate: syncData.lastUpdate
  });
  
  if (syncData.hasUpdates && syncData.newLeads?.length > 0) {
    console.log('🆕 Novos leads encontrados:');
    syncData.newLeads.forEach((lead, index) => {
      console.log(`  ${index + 1}. ${lead.phone} - ${lead.nome} (${lead.isComplete ? 'completo' : 'abandonado'})`);
    });
  }
  
  return syncData;
}

async function executarTesteSincronizacao() {
  try {
    console.log('🚀 INICIANDO TESTE DE SINCRONIZAÇÃO AUTOMÁTICA');
    console.log('=' .repeat(60));
    
    // 1. Autenticar
    await authenticate();
    
    // 2. Buscar um quiz com automação WhatsApp habilitada
    const quizzes = await makeRequest('/api/quizzes');
    const quizComAutomacao = quizzes.find(q => q.enableWhatsappAutomation);
    
    if (!quizComAutomacao) {
      console.log('❌ Nenhum quiz com automação WhatsApp encontrado');
      return;
    }
    
    console.log(`✅ Quiz encontrado: ${quizComAutomacao.id} - ${quizComAutomacao.title}`);
    
    // 3. Verificar arquivo de automação existente
    const arquivoAntes = await verificarArquivoAutomacao(quizComAutomacao.id);
    
    if (!arquivoAntes) {
      console.log('❌ Arquivo de automação não existe para este quiz');
      return;
    }
    
    const contatosAntes = arquivoAntes.contacts?.length || 0;
    console.log(`📊 Contatos antes: ${contatosAntes}`);
    
    // 4. Simular timestamp de última sincronização (1 minuto atrás)
    const lastSyncTime = new Date(Date.now() - 60000).toISOString();
    console.log(`⏰ Timestamp da última sincronização: ${lastSyncTime}`);
    
    // 5. Criar uma nova resposta no quiz (simulando novo lead)
    const novoTelefone = `11${Math.floor(Math.random() * 100000000)}`;
    await criarQuizResposta(quizComAutomacao.id, novoTelefone, 'Novo Lead Teste', true);
    
    // 6. Aguardar um pouco para garantir que a resposta foi salva
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 7. Testar sincronização (simulando a extensão)
    const syncResult = await testarSincronizacaoExtensao(
      arquivoAntes.user_id,
      quizComAutomacao.id,
      lastSyncTime
    );
    
    // 8. Verificar se o novo lead foi detectado
    if (syncResult.hasUpdates) {
      console.log('🎉 SUCESSO: Novo lead detectado pela sincronização!');
      console.log(`📈 Leads novos: ${syncResult.newLeads.length}`);
      
      // Verificar se o telefone criado está nos novos leads
      const leadEncontrado = syncResult.newLeads.find(lead => lead.phone === novoTelefone);
      if (leadEncontrado) {
        console.log('✅ Lead específico encontrado na sincronização!');
        console.log(`📱 Telefone: ${leadEncontrado.phone}`);
        console.log(`👤 Nome: ${leadEncontrado.nome}`);
        console.log(`✅ Status: ${leadEncontrado.isComplete ? 'Completo' : 'Abandonado'}`);
      } else {
        console.log('⚠️ Lead criado não encontrado na sincronização');
      }
    } else {
      console.log('❌ FALHA: Nenhum novo lead detectado pela sincronização');
    }
    
    // 9. Criar outro lead para testar sincronização contínua
    console.log('\n🔄 Testando segundo lead...');
    const segundoTelefone = `11${Math.floor(Math.random() * 100000000)}`;
    await criarQuizResposta(quizComAutomacao.id, segundoTelefone, 'Segundo Lead Teste', false);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 10. Sincronizar novamente usando o timestamp da primeira sincronização
    const syncResult2 = await testarSincronizacaoExtensao(
      arquivoAntes.user_id,
      quizComAutomacao.id,
      syncResult.lastUpdate
    );
    
    if (syncResult2.hasUpdates) {
      console.log('🎉 SUCESSO: Segundo lead também detectado!');
      console.log(`📈 Leads novos na segunda sincronização: ${syncResult2.newLeads.length}`);
    } else {
      console.log('❌ FALHA: Segundo lead não detectado');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ TESTE DE SINCRONIZAÇÃO AUTOMÁTICA CONCLUÍDO');
    console.log('🎯 A extensão Chrome deve funcionar da mesma forma');
    console.log('🔄 Novos leads serão detectados automaticamente a cada 30 segundos');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
executarTesteSincronizacao();
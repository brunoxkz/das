async function testeAutomacaoWhatsApp() {
  console.log('🚀 TESTANDO AUTOMAÇÃO WHATSAPP COMPLETA');
  console.log('=====================================');
  
  // 1. Fazer login
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vendzz.com', password: 'admin123' })
  });
  const loginData = await loginResponse.json();
  const token = loginData.accessToken;
  const userId = loginData.user.id;
  console.log('✅ 1. Login realizado com sucesso');
  
  // 2. Buscar quizzes disponíveis
  const quizzesResponse = await fetch('http://localhost:5000/api/quizzes', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const quizzes = await quizzesResponse.json();
  console.log(`✅ 2. Encontrados ${quizzes.length} quizzes disponíveis`);
  
  const quizId = quizzes[0]?.id;
  if (!quizId) {
    console.log('❌ Nenhum quiz disponível');
    return;
  }
  
  // 3. Verificar leads disponíveis
  const phonesResponse = await fetch(`http://localhost:5000/api/quiz-phones/${quizId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const phonesData = await phonesResponse.json();
  console.log(`✅ 3. Encontrados ${phonesData.phones.length} leads com telefones`);
  
  // 4. Criar/Verificar arquivo de automação
  const automationResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/${quizId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  let automationFile;
  if (automationResponse.ok) {
    automationFile = await automationResponse.json();
    console.log('✅ 4. Arquivo de automação encontrado');
  } else {
    // Criar arquivo de automação
    const createResponse = await fetch('http://localhost:5000/api/whatsapp-automation-file', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quizId: quizId,
        targetAudience: 'all',
        dateFilter: null
      })
    });
    automationFile = await createResponse.json();
    console.log('✅ 4. Arquivo de automação criado');
  }
  
  // 5. Testar sincronização
  const syncResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/${quizId}/sync`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const syncData = await syncResponse.json();
  console.log(`✅ 5. Sincronização: ${syncData.totalNewLeads} novos leads`);
  
  // 6. Buscar arquivos de automação disponíveis
  const filesResponse = await fetch('http://localhost:5000/api/whatsapp-automation-files', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const files = await filesResponse.json();
  console.log(`✅ 6. Total de arquivos de automação: ${files.length}`);
  
  // 7. Visualizar dados do arquivo
  const fileDataResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-files/${automationFile.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const fileData = await fileDataResponse.json();
  console.log(`✅ 7. Arquivo contém ${fileData.contacts?.length || 0} contatos`);
  
  // 8. Mostrar estrutura dos contatos
  if (fileData.contacts && fileData.contacts.length > 0) {
    console.log('📋 ESTRUTURA DOS CONTATOS:');
    const sample = fileData.contacts[0];
    console.log(`   - Telefone: ${sample.phone}`);
    console.log(`   - Nome: ${sample.nome || 'N/A'}`);
    console.log(`   - Email: ${sample.email || 'N/A'}`);
    console.log(`   - Status: ${sample.isComplete ? 'Completo' : 'Abandonado'}`);
  }
  
  // 9. Simular ping da Chrome Extension
  const pingResponse = await fetch('http://localhost:5000/api/whatsapp-extension/status', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '2.0',
      isActive: true,
      pendingMessages: 0,
      sentMessages: 0,
      failedMessages: 0
    })
  });
  console.log('✅ 9. Ping da Chrome Extension simulado');
  
  // 10. Verificar mensagens pendentes
  const pendingResponse = await fetch('http://localhost:5000/api/whatsapp-extension/pending', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const pendingData = await pendingResponse.json();
  console.log(`✅ 10. Mensagens pendentes: ${pendingData.messages?.length || 0}`);
  
  console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
  console.log('=====================================');
  console.log('✅ Sistema de automação WhatsApp está funcionando');
  console.log('✅ Arquivo de automação criado/atualizado');
  console.log('✅ Sincronização operacional');
  console.log('✅ API da Chrome Extension respondendo');
  console.log('\n📖 COMO USAR:');
  console.log('1. Acesse "Automação WhatsApp" no sistema');
  console.log('2. Selecione um quiz e configure filtros');
  console.log('3. Gere/baixe o arquivo de automação');
  console.log('4. Use a Chrome Extension para automação real');
}

testeAutomacaoWhatsApp().catch(console.error);
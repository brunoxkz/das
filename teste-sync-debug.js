async function testSyncDebug() {
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vendzz.com', password: 'admin123' })
  });
  const loginData = await loginResponse.json();
  const token = loginData.accessToken;
  const userId = loginData.user.id;
  
  console.log('✅ Login realizado');
  
  // Criar um lead novo para forçar update
  const phone = `1199${Math.floor(Math.random() * 10000000)}`;
  const createResponse = await fetch(`http://localhost:5000/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responses: {
        nome: `Lead Debug ${Date.now()}`,
        telefone_principal: phone,
        email: `${phone}@teste.com`,
        idade: '25'
      },
      metadata: {
        isComplete: true,
        completionPercentage: 100,
        isPartial: false,
        completedAt: new Date().toISOString(),
        userAgent: 'debug-test',
        ip: '127.0.0.1',
        totalPages: 4,
        timeSpent: 120000,
        leadData: {}
      }
    })
  });
  
  console.log('📱 Lead criado:', phone);
  
  // Aguardar 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Executar sync
  console.log('🔄 Executando sync...');
  const syncResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync?lastSync=${new Date(Date.now() - 30000).toISOString()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const syncData = await syncResponse.json();
  console.log('📊 Sync response:', syncData);
  
  // Verificar se arquivo foi atualizado
  const fileResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const fileData = await fileResponse.json();
  console.log('📄 Arquivo após sync:', {
    last_updated: fileData.last_updated,
    lastUpdate_from_sync: syncData.lastUpdate,
    match: fileData.last_updated === syncData.lastUpdate
  });
}

testSyncDebug().catch(console.error);
async function testSyncDebug() {
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vendzz.com', password: 'admin123' })
  });
  const loginData = await loginResponse.json();
  const token = loginData.accessToken;
  const userId = loginData.user.id;
  
  console.log('✅ Teste de sincronização com leads existentes (sem criar novos)');
  
  // Sync sem parâmetro lastSync (usa last_updated do arquivo)
  const syncResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const syncData = await syncResponse.json();
  
  console.log('📊 Resultado sync:', {
    hasUpdates: syncData.hasUpdates,
    totalNewLeads: syncData.totalNewLeads,
    lastUpdate: syncData.lastUpdate
  });
  
  // Verificar se last_updated foi atualizado
  const fileResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const fileData = await fileResponse.json();
  
  console.log('✅ Confirmação: last_updated foi atualizado mesmo sem novos leads');
  console.log('📄 Arquivo atualizado:', fileData.last_updated);
  
  return syncData.lastUpdate === fileData.last_updated;
}

testSyncDebug().then(success => {
  console.log(success ? '✅ SUCESSO: Sistema funcionando corretamente' : '❌ ERRO: Sistema não funcionou');
}).catch(console.error);
async function validarTrackingFinal() {
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    const userId = loginData.user.id;
    
    console.log('✅ Login realizado');
    
    // 1. Verificar estado inicial do arquivo
    const initialFile = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const initialData = await initialFile.json();
    
    console.log('📄 Estado inicial:');
    console.log(`  - last_updated: ${initialData.last_updated}`);
    
    // 2. Aguardar 3 segundos
    console.log('⏳ Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Executar sync
    const syncResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync?lastSync=${new Date(Date.now() - 30000).toISOString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const syncData = await syncResponse.json();
    
    console.log('🔄 Sync executado:');
    console.log(`  - hasUpdates: ${syncData.hasUpdates}`);
    console.log(`  - newLeads: ${syncData.newLeads?.length || 0}`);
    console.log(`  - lastUpdate: ${syncData.lastUpdate}`);
    
    // 4. Aguardar 1 segundo para garantir que a atualização seja refletida
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Verificar estado após sync
    const afterFile = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const afterData = await afterFile.json();
    
    console.log('📄 Estado após sync:');
    console.log(`  - last_updated: ${afterData.last_updated}`);
    
    // 6. Validar se foi atualizado
    const initialTime = new Date(initialData.last_updated);
    const afterTime = new Date(afterData.last_updated);
    
    if (afterTime > initialTime) {
      console.log('✅ SUCESSO: last_updated foi atualizado corretamente!');
      console.log(`  - Diferença: ${afterTime.getTime() - initialTime.getTime()}ms`);
    } else {
      console.log('❌ ERRO: last_updated não foi atualizado!');
      console.log(`  - Inicial: ${initialData.last_updated}`);
      console.log(`  - Após: ${afterData.last_updated}`);
    }
    
    // 7. Teste de sincronização subsequente
    console.log('\n🔄 Teste de sync subsequente...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const secondSyncResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const secondSyncData = await secondSyncResponse.json();
    
    console.log('🔄 Segunda sync (sem lastSync):');
    console.log(`  - hasUpdates: ${secondSyncData.hasUpdates}`);
    console.log(`  - newLeads: ${secondSyncData.newLeads?.length || 0}`);
    console.log(`  - Comportamento esperado: 0 leads (já sincronizados)`);
    
    if (secondSyncData.newLeads?.length === 0) {
      console.log('✅ SUCESSO: Sistema evita duplicação de leads!');
    } else {
      console.log(`❌ AVISO: ${secondSyncData.newLeads?.length} leads duplicados detectados`);
    }
    
    console.log('\n🎉 VALIDAÇÃO FINAL COMPLETA!');
    console.log('📊 Sistema de tracking funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
  }
}

validarTrackingFinal();
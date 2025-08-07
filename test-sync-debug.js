async function testSyncDebug() {
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
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    const userId = loginData.user.id;
    
    console.log('✅ Login realizado');
    
    // Criar lead
    const leadResponse = await fetch('http://localhost:5000/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        responses: {
          nome: `Lead Debug ${Date.now()}`,
          telefone_principal: '11999888777',
          email: 'debug@teste.com',
          idade: '30'
        },
        metadata: {
          isComplete: true,
          completionPercentage: 100,
          isPartial: false,
          completedAt: new Date().toISOString(),
          userAgent: 'debug-test',
          ip: '127.0.0.1',
          totalPages: 1,
          timeSpent: 1000,
          leadData: {}
        }
      })
    });
    
    if (!leadResponse.ok) {
      throw new Error(`Lead creation failed: ${leadResponse.status}`);
    }
    
    console.log('✅ Lead criado');
    
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test sync
    const syncResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync?lastSync=${new Date(Date.now() - 10000).toISOString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!syncResponse.ok) {
      const errorData = await syncResponse.text();
      console.error('❌ Sync failed:', syncResponse.status, errorData);
      return;
    }
    
    const syncData = await syncResponse.json();
    console.log('🔄 Sync result:', JSON.stringify(syncData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSyncDebug();
async function debugArquivoAutomacao() {
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
    console.log('👤 User ID:', userId);
    
    // Buscar arquivo de automação
    const fileResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!fileResponse.ok) {
      console.error('❌ Erro ao buscar arquivo:', fileResponse.status);
      return;
    }
    
    const fileData = await fileResponse.json();
    console.log('📄 Arquivo de automação:', {
      id: fileData.id,
      created_at: fileData.created_at,
      last_updated: fileData.last_updated,
      quiz_id: fileData.quiz_id
    });
    
    // Buscar respostas mais recentes do quiz
    const quizResponse = await fetch(`http://localhost:5000/api/quiz-phones/Qm4wxpfPgkMrwoMhDFNLZ?targetAudience=all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!quizResponse.ok) {
      console.error('❌ Erro ao buscar respostas do quiz:', quizResponse.status);
      return;
    }
    
    const quizData = await quizResponse.json();
    console.log('📊 Respostas do quiz:', {
      total: quizData.phones?.length || 0,
      primeiras3: quizData.phones?.slice(0, 3).map(p => ({
        phone: p.phone,
        submittedAt: p.submittedAt,
        isComplete: p.isComplete
      })) || []
    });
    
    // Testar sync com diferentes timestamps
    console.log('\n🔄 Testando sync com diferentes timestamps:');
    
    const timestamps = [
      new Date(Date.now() - 5000).toISOString(),   // 5 segundos atrás
      new Date(Date.now() - 30000).toISOString(),  // 30 segundos atrás  
      new Date(Date.now() - 60000).toISOString(),  // 1 minuto atrás
      new Date(Date.now() - 300000).toISOString()  // 5 minutos atrás
    ];
    
    for (const timestamp of timestamps) {
      const syncResponse = await fetch(`http://localhost:5000/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync?lastSync=${timestamp}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log(`⏰ ${timestamp.substring(11, 19)}: ${syncData.newLeads?.length || 0} novos leads`);
      } else {
        console.log(`❌ ${timestamp.substring(11, 19)}: Erro ${syncResponse.status}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugArquivoAutomacao();
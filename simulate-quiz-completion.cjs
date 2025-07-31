const fetch = require('node-fetch');

async function simulateQuizCompletion() {
  console.log('🎯 SIMULANDO QUIZ COMPLETION COMPLETO - admin@vendzz.com');
  
  try {
    // 1. Fazer login como admin
    console.log('🔐 1. Fazendo login como admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login resultado:', loginData.success ? 'SUCESSO' : 'FALHA');
    
    if (!loginData.success) {
      console.log('❌ Falha no login, tentando credenciais alternativas...');
      return;
    }
    
    const token = loginData.token;
    
    // 2. Buscar quizzes do admin
    console.log('📋 2. Buscando quizzes do admin...');
    const quizzesResponse = await fetch('http://localhost:5000/api/quizzes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const quizzes = await quizzesResponse.json();
    console.log(`📊 Encontrados ${quizzes.length} quizzes`);
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado para simular');
      return;
    }
    
    // 3. Pegar o primeiro quiz
    const quiz = quizzes[0];
    console.log(`🎯 3. Usando quiz: "${quiz.title}" (ID: ${quiz.id})`);
    
    // 4. Simular responses baseadas nas páginas do quiz
    const mockResponses = {};
    const pages = quiz.pages || [];
    
    console.log(`📄 Quiz tem ${pages.length} páginas`);
    
    // Gerar respostas simuladas
    pages.forEach((page, index) => {
      if (page.elements) {
        page.elements.forEach(element => {
          if (element.type === 'email') {
            mockResponses[element.id] = 'lead@exemplo.com';
          } else if (element.type === 'text') {
            mockResponses[element.id] = 'João Silva';
          } else if (element.type === 'multiple_choice') {
            const options = element.options || [];
            if (options.length > 0) {
              mockResponses[element.id] = options[0].text;
            }
          } else if (element.type === 'rating') {
            mockResponses[element.id] = '4';
          } else if (element.type === 'number') {
            mockResponses[element.id] = '25';
          }
        });
      }
    });
    
    console.log('📝 4. Responses geradas:', Object.keys(mockResponses).length, 'respostas');
    
    // 5. Submeter o quiz completion
    console.log('🚀 5. Submetendo quiz completion...');
    const submissionResponse = await fetch(`http://localhost:5000/api/quizzes/${quiz.id}/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        responses: mockResponses,
        metadata: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          timestamp: new Date().toISOString(),
          completionTime: 45000,
          source: 'admin_simulation'
        }
      })
    });
    
    const submissionResult = await submissionResponse.json();
    console.log('✅ Quiz submission resultado:', submissionResult.success ? 'SUCESSO' : 'FALHA');
    
    if (submissionResult.success) {
      console.log('🎉 QUIZ COMPLETION SIMULADO COM SUCESSO!');
      console.log('📧 Lead capturado:', mockResponses[Object.keys(mockResponses).find(key => mockResponses[key].includes('@'))]);
      console.log('🔔 Sistema deve detectar automaticamente e enviar push notification');
      console.log('⏰ Aguarde 5-10 segundos para verificar se push foi enviado...');
      
      // 6. Verificar estatísticas após 5 segundos
      setTimeout(async () => {
        console.log('\n📊 6. Verificando estatísticas após completion...');
        try {
          const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const stats = await statsResponse.json();
          console.log('📈 Stats atualizadas - Total Leads:', stats.totalLeads);
          console.log('📈 Stats atualizadas - Quiz Completions:', stats.quizCompletions);
        } catch (error) {
          console.log('⚠️ Erro ao verificar stats:', error.message);
        }
      }, 5000);
      
    } else {
      console.log('❌ Erro na submission:', submissionResult.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar simulação
simulateQuizCompletion();
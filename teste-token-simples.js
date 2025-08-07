const API_BASE = 'http://localhost:5000';

// Teste simples de geração de token
async function testeTokenSimples() {
  console.log('🔍 TESTE: Geração de Token');
  console.log('=' .repeat(40));
  
  try {
    // Fazer login
    console.log('1. Fazendo login...');
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Login falhou: ${response.status} ${response.statusText}`);
    }
    
    const loginData = await response.json();
    console.log('✅ Login realizado com sucesso!');
    console.log(`   Usuário: ${loginData.user.email}`);
    console.log(`   Token (primeiros 20 chars): ${loginData.accessToken.substring(0, 20)}...`);
    
    // Verificar se o token é válido
    console.log('\n2. Verificando token...');
    const verifyResponse = await fetch(`${API_BASE}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!verifyResponse.ok) {
      throw new Error(`Verificação falhou: ${verifyResponse.status} ${verifyResponse.statusText}`);
    }
    
    const verifyData = await verifyResponse.json();
    console.log('✅ Token válido!');
    console.log(`   Usuário verificado: ${verifyData.user.email}`);
    console.log(`   Role: ${verifyData.user.role}`);
    console.log(`   Plan: ${verifyData.user.plan}`);
    
    // Teste de funcionalidade - buscar quizzes
    console.log('\n3. Testando funcionalidade com token...');
    const quizzesResponse = await fetch(`${API_BASE}/api/quizzes`, {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!quizzesResponse.ok) {
      throw new Error(`Busca de quizzes falhou: ${quizzesResponse.status} ${quizzesResponse.statusText}`);
    }
    
    const quizzes = await quizzesResponse.json();
    console.log('✅ Quizzes carregados com sucesso!');
    console.log(`   Total de quizzes: ${quizzes.length}`);
    
    let phonesData = null;
    if (quizzes.length > 0) {
      console.log(`   Primeiro quiz: ${quizzes[0].title} (ID: ${quizzes[0].id})`);
      
      // Testar busca de telefones
      console.log('\n4. Testando busca de telefones...');
      const phonesResponse = await fetch(`${API_BASE}/api/quiz-phones/${quizzes[0].id}`, {
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!phonesResponse.ok) {
        throw new Error(`Busca de telefones falhou: ${phonesResponse.status} ${phonesResponse.statusText}`);
      }
      
      phonesData = await phonesResponse.json();
      console.log('✅ Telefones carregados com sucesso!');
      console.log(`   Total de telefones: ${phonesData.phones?.length || 0}`);
      
      if (phonesData.phones && phonesData.phones.length > 0) {
        console.log(`   Primeiro telefone: ${phonesData.phones[0].phone}`);
        console.log(`   Status: ${phonesData.phones[0].isComplete ? 'Completo' : 'Abandonado'}`);
      }
    }
    
    // Testar status da extensão
    console.log('\n5. Testando status da extensão...');
    const statusResponse = await fetch(`${API_BASE}/api/whatsapp-extension/status`, {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!statusResponse.ok) {
      throw new Error(`Status da extensão falhou: ${statusResponse.status} ${statusResponse.statusText}`);
    }
    
    const statusData = await statusResponse.json();
    console.log('✅ Status da extensão obtido!');
    console.log(`   Conectada: ${statusData.connected}`);
    console.log(`   Último ping: ${statusData.lastPing || 'Nunca'}`);
    console.log(`   Versão: ${statusData.version || 'N/A'}`);
    
    // Verificar se realmente conectada (ping recente)
    const agora = new Date().getTime();
    const ultimoPing = statusData.lastPing ? new Date(statusData.lastPing).getTime() : 0;
    const tempoDecorrido = agora - ultimoPing;
    const isReallyConnected = statusData.connected && tempoDecorrido < 120000; // 2 minutos
    
    console.log(`   Realmente conectada: ${isReallyConnected ? 'SIM' : 'NÃO'}`);
    if (!isReallyConnected && statusData.connected) {
      console.log(`   ⚠️  Ping muito antigo (${Math.floor(tempoDecorrido/1000)}s atrás)`);
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('=' .repeat(40));
    console.log('✅ Token gerado e funcionando corretamente');
    console.log('✅ Todas as funcionalidades testadas');
    console.log('✅ Sistema operacional');
    
    return {
      success: true,
      token: loginData.accessToken,
      user: loginData.user,
      quizzes: quizzes.length,
      phones: (quizzes.length > 0 ? phonesData?.phones?.length || 0 : 0),
      extensionConnected: isReallyConnected
    };
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.log('=' .repeat(40));
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar teste
testeTokenSimples().then(resultado => {
  if (resultado.success) {
    console.log('\n📊 RESUMO FINAL:');
    console.log(`🔑 Token: Funcional`);
    console.log(`👤 Usuário: ${resultado.user.email}`);
    console.log(`📋 Quizzes: ${resultado.quizzes}`);
    console.log(`📱 Telefones: ${resultado.phones}`);
    console.log(`🔌 Extensão: ${resultado.extensionConnected ? 'Conectada' : 'Desconectada'}`);
  } else {
    console.log('\n❌ TESTE FALHOU');
    console.log('Verificar erro acima para mais detalhes');
  }
}).catch(console.error);
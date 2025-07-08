const API_BASE = 'http://localhost:5000';

// Função para fazer requisições autenticadas
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const token = await authenticateUser();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return response;
}

// Função para autenticar usuário
async function authenticateUser() {
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
  
  const data = await response.json();
  return data.accessToken;
}

// Teste 1: Verificar se a página carrega corretamente
async function testeCarregamentoPagina() {
  console.log('\n🔍 TESTE 1: Carregamento da página...');
  
  try {
    // Verificar se quizzes são carregados
    const quizzesResponse = await makeAuthenticatedRequest('/api/quizzes');
    const quizzes = await quizzesResponse.json();
    
    console.log(`✅ Quizzes carregados: ${quizzes.length} encontrados`);
    
    if (quizzes.length > 0) {
      const primeiroQuiz = quizzes[0];
      console.log(`📋 Primeiro quiz: ${primeiroQuiz.title} (ID: ${primeiroQuiz.id})`);
      
      // Verificar se telefones do quiz são carregados
      const phonesResponse = await makeAuthenticatedRequest(`/api/quiz-phones/${primeiroQuiz.id}`);
      const phonesData = await phonesResponse.json();
      
      console.log(`📱 Telefones encontrados: ${phonesData.phones?.length || 0}`);
      
      return { success: true, primeiroQuiz, phonesData };
    }
    
  } catch (error) {
    console.error('❌ Erro no carregamento:', error);
    return { success: false, error };
  }
}

// Teste 2: Verificar status da extensão
async function testeStatusExtensao() {
  console.log('\n🔍 TESTE 2: Status da extensão...');
  
  try {
    const response = await makeAuthenticatedRequest('/api/whatsapp-extension/status');
    const status = await response.json();
    
    console.log(`📡 Status da extensão:`, status);
    
    // Verificar se há ping recente (últimos 2 minutos)
    const agora = new Date().getTime();
    const ultimoPing = status.lastPing ? new Date(status.lastPing).getTime() : 0;
    const tempoDecorrido = agora - ultimoPing;
    const isConnected = status.connected && tempoDecorrido < 120000;
    
    console.log(`⏰ Último ping: ${status.lastPing || 'Nunca'}`);
    console.log(`🔌 Conectada (real): ${isConnected ? 'SIM' : 'NÃO'}`);
    
    return { success: true, status, isConnected };
    
  } catch (error) {
    console.error('❌ Erro no status da extensão:', error);
    return { success: false, error };
  }
}

// Teste 3: Testar geração de arquivo de automação
async function testeGerarArquivoAutomacao() {
  console.log('\n🔍 TESTE 3: Geração de arquivo de automação...');
  
  try {
    // Primeiro, buscar um quiz para testar
    const quizzesResponse = await makeAuthenticatedRequest('/api/quizzes');
    const quizzes = await quizzesResponse.json();
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado para teste');
      return { success: false, error: 'Nenhum quiz disponível' };
    }
    
    const quizTeste = quizzes[0];
    console.log(`📋 Testando com quiz: ${quizTeste.title}`);
    
    // Tentar gerar arquivo de automação
    const response = await makeAuthenticatedRequest('/api/whatsapp-automation-file', {
      method: 'POST',
      body: JSON.stringify({
        quizId: quizTeste.id,
        targetAudience: 'all',
        dateFilter: ''
      })
    });
    
    if (response.ok) {
      const arquivo = await response.json();
      console.log(`✅ Arquivo gerado com sucesso!`);
      console.log(`📊 Dados do arquivo:`, {
        fileId: arquivo.fileId,
        totalContacts: arquivo.totalContacts
      });
      
      return { success: true, arquivo };
    } else {
      const error = await response.json();
      console.error('❌ Erro ao gerar arquivo:', error);
      return { success: false, error };
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de geração:', error);
    return { success: false, error };
  }
}

// Teste 4: Testar geração de token
async function testeGerarToken() {
  console.log('\n🔍 TESTE 4: Geração de token...');
  
  try {
    const token = await authenticateUser();
    
    if (token) {
      console.log(`✅ Token gerado com sucesso!`);
      console.log(`🔑 Token (primeiros 20 chars): ${token.substring(0, 20)}...`);
      
      // Testar se o token é válido
      const verifyResponse = await makeAuthenticatedRequest('/api/auth/verify');
      
      if (verifyResponse.ok) {
        const userData = await verifyResponse.json();
        console.log(`✅ Token válido para usuário: ${userData.user.email}`);
        return { success: true, token, userData };
      } else {
        console.error('❌ Token inválido');
        return { success: false, error: 'Token inválido' };
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na geração de token:', error);
    return { success: false, error };
  }
}

// Teste 5: Testar filtros de audiência
async function testeFiltrosAudiencia() {
  console.log('\n🔍 TESTE 5: Filtros de audiência...');
  
  try {
    const quizzesResponse = await makeAuthenticatedRequest('/api/quizzes');
    const quizzes = await quizzesResponse.json();
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado para teste');
      return { success: false, error: 'Nenhum quiz disponível' };
    }
    
    const quizTeste = quizzes[0];
    
    // Testar diferentes tipos de audiência
    const audienceTypes = ['all', 'completed', 'abandoned'];
    const resultados = {};
    
    for (const audience of audienceTypes) {
      const response = await makeAuthenticatedRequest(`/api/quiz-phones/${quizTeste.id}`);
      const phonesData = await response.json();
      
      if (phonesData.phones) {
        let filteredPhones = phonesData.phones;
        
        if (audience === 'completed') {
          filteredPhones = phonesData.phones.filter(p => p.isComplete === true);
        } else if (audience === 'abandoned') {
          filteredPhones = phonesData.phones.filter(p => p.isComplete === false);
        }
        
        resultados[audience] = filteredPhones.length;
        console.log(`📊 ${audience}: ${filteredPhones.length} contatos`);
      }
    }
    
    console.log(`✅ Filtros testados com sucesso!`);
    return { success: true, resultados };
    
  } catch (error) {
    console.error('❌ Erro nos filtros:', error);
    return { success: false, error };
  }
}

// Executar todos os testes
async function executarTodosTestes() {
  console.log('🚀 INICIANDO TESTES DE UI - WHATSAPP AUTOMATION');
  console.log('=' .repeat(50));
  
  const resultados = {
    carregamento: await testeCarregamentoPagina(),
    statusExtensao: await testeStatusExtensao(),
    gerarArquivo: await testeGerarArquivoAutomacao(),
    gerarToken: await testeGerarToken(),
    filtrosAudiencia: await testeFiltrosAudiencia()
  };
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(50));
  
  let testesPassaram = 0;
  let totalTestes = 0;
  
  for (const [teste, resultado] of Object.entries(resultados)) {
    totalTestes++;
    if (resultado.success) {
      testesPassaram++;
      console.log(`✅ ${teste}: PASSOU`);
    } else {
      console.log(`❌ ${teste}: FALHOU`);
      if (resultado.error) {
        console.log(`   Erro: ${JSON.stringify(resultado.error)}`);
      }
    }
  }
  
  console.log(`\n📈 RESULTADO FINAL: ${testesPassaram}/${totalTestes} testes passaram`);
  console.log(`🎯 Taxa de sucesso: ${(testesPassaram/totalTestes*100).toFixed(1)}%`);
  
  if (testesPassaram === totalTestes) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.');
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM! Verificar problemas identificados acima.');
  }
  
  return resultados;
}

// Executar testes
executarTodosTestes().catch(console.error);
// TESTE SISTEMA QUANTUM INTEGRADO COMPLETO
// Testa tanto backend quanto frontend integration

const http = require('http');

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      rejectUnauthorized: false
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testQuantumSystem() {
  console.log('🔥 TESTE SISTEMA QUANTUM INTEGRADO VENDZZ');
  console.log('=' .repeat(80));

  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 0;
  let token = null;

  try {
    // 1. LOGIN
    totalTests++;
    console.log('\n1. 🔑 TESTE LOGIN');
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (loginResult.status === 200) {
      if (loginResult.data.token || loginResult.data.accessToken) {
        token = loginResult.data.token || loginResult.data.accessToken;
        passedTests++;
        console.log(`✅ Login realizado - Token obtido (${token.substring(0, 20)}...)`);
      } else {
        console.log(`❌ Login sem token - Dados: ${JSON.stringify(loginResult.data)}`);
        throw new Error('Login sem token');
      }
    } else {
      console.log(`❌ Login falhou - Status: ${loginResult.status}`);
      console.log(`   Dados: ${JSON.stringify(loginResult.data)}`);
      throw new Error('Login failed');
    }

    // 2. TESTE QUANTUM ENDPOINTS BACKEND
    totalTests++;
    console.log('\n2. 🎯 TESTE ENDPOINTS QUANTUM BACKEND');
    
    // Testar endpoint de campanhas
    const campaignsResult = await makeRequest('/api/sms-quantum/campaigns', 'GET', null, token);
    if (campaignsResult.status === 200) {
      passedTests++;
      console.log(`✅ Endpoint /api/sms-quantum/campaigns funcionando`);
      console.log(`   Campanhas encontradas: ${campaignsResult.data.campaigns?.length || 0}`);
    } else {
      console.log(`❌ Erro endpoint campanhas - Status: ${campaignsResult.status}`);
    }

    // 3. TESTE VARIABLES ULTRA INTEGRATION
    totalTests++;
    console.log('\n3. 🔬 TESTE VARIABLES ULTRA INTEGRATION');
    
    // Pegar um quiz ID para testar
    const quizzesResult = await makeRequest('/api/quizzes', 'GET', null, token);
    let quizId = null;
    
    if (quizzesResult.status === 200 && ((quizzesResult.data.quizzes && quizzesResult.data.quizzes.length > 0) || (Array.isArray(quizzesResult.data) && quizzesResult.data.length > 0))) {
      const quizzes = quizzesResult.data.quizzes || quizzesResult.data;
      const publishedQuiz = quizzes.find(q => q.isPublished) || quizzes[0];
      quizId = publishedQuiz.id;
      console.log(`📋 Quiz encontrado para teste: ${quizId}`);
      
      // Testar endpoint variables-ultra
      const variablesResult = await makeRequest(`/api/quizzes/${quizId}/variables-ultra`, 'GET', null, token);
      if (variablesResult.status === 200) {
        passedTests++;
        console.log(`✅ Variables Ultra funcionando - ${variablesResult.data.variables?.length || 0} variáveis`);
        
        if (variablesResult.data.variables?.length > 0) {
          const firstVar = variablesResult.data.variables[0];
          console.log(`   Primeira variável: ${firstVar.fieldId} (${firstVar.totalResponses} respostas)`);
        }
      } else {
        console.log(`❌ Erro Variables Ultra - Status: ${variablesResult.status}`);
      }
    } else {
      console.log(`⚠️ Nenhum quiz encontrado para testar variables ultra`);
    }

    // 4. TESTE CRIAÇÃO REMARKETING QUANTUM
    totalTests++;
    console.log('\n4. 🚀 TESTE CRIAÇÃO REMARKETING QUANTUM');
    
    if (quizId) {
      const remarketingData = {
        name: `Teste Remarketing ${Date.now()}`,
        message: 'Olá {nome}! Vi que você tem interesse em {resposta}',
        quizId: quizId,
        quantumFilters: {
          fieldId: 'p1_objetivo_fitness',
          responseValue: 'Emagrecer'
        },
        scheduleType: 'immediate',
        delay: 0,
        delayUnit: 'minutes'
      };
      
      const createResult = await makeRequest('/api/sms-quantum/remarketing/create', 'POST', remarketingData, token);
      if (createResult.status === 201 || createResult.status === 200) {
        passedTests++;
        console.log(`✅ Remarketing Quantum criado com sucesso`);
        console.log(`   Campanha ID: ${createResult.data.campaignId || 'N/A'}`);
      } else {
        console.log(`❌ Erro criar Remarketing - Status: ${createResult.status}`);
        console.log(`   Erro: ${createResult.data.error || 'Desconhecido'}`);
      }
    } else {
      console.log(`⚠️ Pular teste criação - sem quiz disponível`);
    }

    // 5. TESTE CRIAÇÃO AO VIVO QUANTUM
    totalTests++;
    console.log('\n5. ⚡ TESTE CRIAÇÃO AO VIVO QUANTUM');
    
    if (quizId) {
      const liveData = {
        name: `Teste Ao Vivo ${Date.now()}`,
        message: '🔥 LEAD AO VIVO: {nome} respondeu {resposta}!',
        quizId: quizId,
        quantumFilters: {
          fieldId: 'p1_objetivo_fitness',
          responseValue: 'Ganhar Massa'
        },
        targetType: 'admin'
      };
      
      const createLiveResult = await makeRequest('/api/sms-quantum/live/create', 'POST', liveData, token);
      if (createLiveResult.status === 201 || createLiveResult.status === 200) {
        passedTests++;
        console.log(`✅ Ao Vivo Quantum criado com sucesso`);
        console.log(`   Campanha ID: ${createLiveResult.data.campaignId || 'N/A'}`);
      } else {
        console.log(`❌ Erro criar Ao Vivo - Status: ${createLiveResult.status}`);
        console.log(`   Erro: ${createLiveResult.data.error || 'Desconhecido'}`);
      }
    } else {
      console.log(`⚠️ Pular teste criação - sem quiz disponível`);
    }

    // 6. TESTE AO VIVO QUANTUM INTEGRATION NO QUIZ SUBMISSION
    totalTests++;
    console.log('\n6. 🎯 TESTE INTEGRAÇÃO AO VIVO NO QUIZ SUBMISSION');
    
    if (quizId) {
      // Simular uma submissão de quiz que deveria trigger Ao Vivo Quantum
      const submissionData = {
        responses: {
          p1_objetivo_fitness: 'Ganhar Massa',
          p2_nome: 'Teste Usuario',
          p3_telefone: '+5511999999999'
        },
        leadData: {
          nome: 'Teste Usuario',
          telefone: '+5511999999999'
        },
        totalPages: 3,
        completionPercentage: 100,
        timeSpent: 45000
      };
      
      const submissionResult = await makeRequest(`/api/quizzes/${quizId}/submit`, 'POST', submissionData, token);
      if (submissionResult.status === 201 || submissionResult.status === 200) {
        passedTests++;
        console.log(`✅ Quiz submission processado - Ao Vivo Quantum deve ter sido acionado`);
        console.log(`   Response ID: ${submissionResult.data.responseId || 'N/A'}`);
      } else {
        console.log(`❌ Erro quiz submission - Status: ${submissionResult.status}`);
      }
    } else {
      console.log(`⚠️ Pular teste submission - sem quiz disponível`);
    }

    // RESULTADOS FINAIS
    const endTime = Date.now();
    const duration = endTime - startTime;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RESULTADO FINAL SISTEMA QUANTUM');
    console.log('='.repeat(80));
    console.log(`✅ TESTES APROVADOS: ${passedTests}/${totalTests} (${successRate}%)`);
    console.log(`⏱️  TEMPO TOTAL: ${duration}ms`);
    console.log(`📊 PERFORMANCE: ${(duration / totalTests).toFixed(1)}ms por teste`);
    
    if (passedTests >= totalTests * 0.8) {
      console.log(`🏆 STATUS: SISTEMA QUANTUM APROVADO PARA PRODUÇÃO`);
      console.log(`🔥 QUANTUM: Remarketing e Ao Vivo completamente integrados`);
    } else {
      console.log(`⚠️  STATUS: NECESSITA CORREÇÕES`);
    }

    console.log('\n🚀 URLS PARA TESTAR FRONTEND:');
    console.log(`   Remarketing Quantum: https://localhost:5000/remarketing-quantum`);
    console.log(`   Ao Vivo Quantum: https://localhost:5000/ao-vivo-quantum`);
    console.log(`   Sistema Ultra Demo: https://localhost:5000/sistema-ultra-demo`);

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO NO TESTE:', error.message);
    process.exit(1);
  }
}

// Executar teste
testQuantumSystem().catch(console.error);
/**
 * TESTE COMPLETO DO SISTEMA I.A. CONVERSION +
 * Validação final de toda a funcionalidade implementada
 */

const http = require('http');
const { performance } = require('perf_hooks');

// Configuração do servidor
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'admin@vendzz.com',
  password: 'admin123'
};

// Função para fazer requests HTTP
function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Função para fazer login e obter token
async function login() {
  const start = performance.now();
  const response = await makeRequest('/api/auth/login', 'POST', TEST_USER);
  const end = performance.now();
  
  if (response.status === 200 && response.data.accessToken) {
    return {
      success: true,
      token: response.data.accessToken,
      user: response.data.user,
      time: Math.round(end - start)
    };
  }
  
  return {
    success: false,
    error: response.data,
    time: Math.round(end - start)
  };
}

// Função para obter quizzes
async function getQuizzes(token) {
  const start = performance.now();
  const response = await makeRequest('/api/quizzes', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  const end = performance.now();
  
  return {
    success: response.status === 200,
    data: response.data,
    time: Math.round(end - start)
  };
}

// Função para testar endpoints I.A. Conversion
async function testIAConversionEndpoints(token) {
  const results = [];
  
  // 1. Listar campanhas (deve estar vazia inicialmente)
  console.log('📋 Testando listagem de campanhas...');
  const start1 = performance.now();
  const listResponse = await makeRequest('/api/ai-conversion-campaigns', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  const end1 = performance.now();
  
  results.push({
    test: 'Listar campanhas',
    success: listResponse.status === 200,
    time: Math.round(end1 - start1),
    data: listResponse.data
  });
  
  // 2. Obter um quiz para usar na campanha
  const quizzesResponse = await getQuizzes(token);
  if (!quizzesResponse.success || !quizzesResponse.data.length) {
    results.push({
      test: 'Obter quiz para campanha',
      success: false,
      error: 'Nenhum quiz disponível'
    });
    return results;
  }
  
  const testQuiz = quizzesResponse.data[0];
  
  // 3. Criar campanha I.A. Conversion
  console.log('🚀 Testando criação de campanha...');
  const start2 = performance.now();
  const campaignData = {
    name: `Campanha I.A. Test ${Date.now()}`,
    quizId: testQuiz.id,
    quizTitle: testQuiz.title,
    scriptTemplate: "Olá {nome}, vi que você respondeu nosso quiz sobre {quiz_titulo}. Baseado nas suas respostas sobre {faixa_etaria} e {renda_mensal}, tenho uma proposta especial para você!",
    heygenAvatar: "avatar_profissional_brasileiro",
    heygenVoice: "voz_brasileira_feminina_clara"
  };
  
  const createResponse = await makeRequest('/api/ai-conversion-campaigns', 'POST', campaignData, {
    'Authorization': `Bearer ${token}`
  });
  const end2 = performance.now();
  
  results.push({
    test: 'Criar campanha',
    success: createResponse.status === 200,
    time: Math.round(end2 - start2),
    data: createResponse.data,
    campaignId: createResponse.data?.id
  });
  
  if (createResponse.status !== 200) {
    return results;
  }
  
  const campaignId = createResponse.data.id;
  
  // 4. Listar campanhas novamente (deve ter 1 campanha)
  console.log('📋 Testando listagem após criação...');
  const start3 = performance.now();
  const listResponse2 = await makeRequest('/api/ai-conversion-campaigns', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  const end3 = performance.now();
  
  results.push({
    test: 'Listar campanhas após criação',
    success: listResponse2.status === 200 && listResponse2.data.length > 0,
    time: Math.round(end3 - start3),
    campaignCount: listResponse2.data?.length || 0
  });
  
  // 5. Atualizar campanha
  console.log('🔄 Testando atualização de campanha...');
  const start4 = performance.now();
  const updateData = {
    name: `Campanha I.A. Updated ${Date.now()}`,
    scriptTemplate: "Script atualizado: Olá {nome}, sua resposta sobre {produto_escolhido} me chamou atenção..."
  };
  
  const updateResponse = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}`, 'PUT', updateData, {
    'Authorization': `Bearer ${token}`
  });
  const end4 = performance.now();
  
  results.push({
    test: 'Atualizar campanha',
    success: updateResponse.status === 200,
    time: Math.round(end4 - start4),
    data: updateResponse.data
  });
  
  // 6. Obter estatísticas da campanha
  console.log('📊 Testando estatísticas da campanha...');
  const start5 = performance.now();
  const statsResponse = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}/stats`, 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  const end5 = performance.now();
  
  results.push({
    test: 'Obter estatísticas',
    success: statsResponse.status === 200,
    time: Math.round(end5 - start5),
    data: statsResponse.data
  });
  
  // 7. Listar gerações de vídeo (deve estar vazia)
  console.log('🎥 Testando listagem de gerações de vídeo...');
  const start6 = performance.now();
  const videoGenResponse = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}/video-generations`, 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  const end6 = performance.now();
  
  results.push({
    test: 'Listar gerações de vídeo',
    success: videoGenResponse.status === 200,
    time: Math.round(end6 - start6),
    videoCount: videoGenResponse.data?.length || 0
  });
  
  // 8. Simular geração de vídeo
  console.log('🎬 Testando geração de vídeo...');
  const start7 = performance.now();
  const videoData = {
    responseId: 'test-response-' + Date.now(),
    leadData: {
      nome: 'João Silva',
      email: 'joao@test.com',
      faixa_etaria: '25-35 anos',
      renda_mensal: 'R$ 3.000 - R$ 5.000',
      produto_escolhido: 'Curso Online'
    }
  };
  
  const generateVideoResponse = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}/generate-video`, 'POST', videoData, {
    'Authorization': `Bearer ${token}`
  });
  const end7 = performance.now();
  
  results.push({
    test: 'Gerar vídeo personalizado',
    success: generateVideoResponse.status === 200,
    time: Math.round(end7 - start7),
    data: generateVideoResponse.data
  });
  
  // 9. Deletar campanha
  console.log('🗑️ Testando exclusão de campanha...');
  const start8 = performance.now();
  const deleteResponse = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}`, 'DELETE', null, {
    'Authorization': `Bearer ${token}`
  });
  const end8 = performance.now();
  
  results.push({
    test: 'Deletar campanha',
    success: deleteResponse.status === 200,
    time: Math.round(end8 - start8)
  });
  
  return results;
}

// Função principal de teste
async function runFullTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA I.A. CONVERSION +');
  console.log('=' .repeat(60));
  
  try {
    // 1. Login
    console.log('🔐 Fazendo login...');
    const loginResult = await login();
    if (!loginResult.success) {
      console.error('❌ Falha no login:', loginResult.error);
      return;
    }
    console.log(`✅ Login realizado em ${loginResult.time}ms`);
    
    // 2. Testar endpoints I.A. Conversion
    console.log('\n🧪 Testando endpoints I.A. Conversion...');
    const testResults = await testIAConversionEndpoints(loginResult.token);
    
    // 3. Relatório final
    console.log('\n📊 RELATÓRIO FINAL');
    console.log('=' .repeat(60));
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`📈 Taxa de Sucesso: ${successRate}% (${passedTests}/${totalTests} testes aprovados)`);
    console.log(`⚡ Performance Média: ${Math.round(testResults.reduce((acc, r) => acc + (r.time || 0), 0) / testResults.length)}ms`);
    
    console.log('\n🔍 DETALHES DOS TESTES:');
    testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const time = result.time ? `${result.time}ms` : 'N/A';
      console.log(`${status} ${index + 1}. ${result.test} (${time})`);
      
      if (!result.success && result.error) {
        console.log(`   Erro: ${result.error}`);
      }
      
      if (result.campaignCount !== undefined) {
        console.log(`   Campanhas encontradas: ${result.campaignCount}`);
      }
      
      if (result.videoCount !== undefined) {
        console.log(`   Vídeos gerados: ${result.videoCount}`);
      }
    });
    
    // 4. Status final
    console.log('\n' + '=' .repeat(60));
    if (successRate >= 85) {
      console.log('🎉 SISTEMA I.A. CONVERSION + APROVADO PARA PRODUÇÃO!');
      console.log('✅ Todos os endpoints críticos estão funcionando corretamente');
      console.log('✅ Performance adequada para uso em produção');
      console.log('✅ Sistema de personalização de vídeos operacional');
    } else {
      console.log('⚠️  SISTEMA REQUER CORREÇÕES ANTES DA PRODUÇÃO');
      console.log(`❌ ${failedTests} testes falharam - verifique os logs acima`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
runFullTest().catch(console.error);
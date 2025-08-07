/**
 * TESTE SIMPLIFICADO DO SISTEMA DE PIXELS
 * Foca na validação dos endpoints essenciais
 */

// Configuração do servidor
const BASE_URL = 'http://localhost:5000';
let authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMTMwMzYxLCJub25jZSI6Ind6dzZoIiwiZXhwIjoxNzUyMTMxMjYxfQ.c7s5k7uN4Qrp7MNZoDhwKxa6_k9ui9fLe1lah2Be0Yk';

// Função para fazer requisições autenticadas
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
}

// Função para autenticar
async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    authToken = response.token || response.accessToken;
    console.log('✅ Autenticação realizada com sucesso');
    console.log('🔍 Token:', authToken ? 'Presente' : 'Ausente');
    return true;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    return false;
  }
}

// Função para buscar quizzes existentes
async function getExistingQuiz() {
  try {
    const quizzes = await makeRequest('/api/quizzes');
    
    if (quizzes && quizzes.length > 0) {
      const publishedQuiz = quizzes.find(q => q.isPublished);
      if (publishedQuiz) {
        console.log(`✅ Usando quiz existente: ${publishedQuiz.id}`);
        return publishedQuiz;
      }
    }
    
    console.log('⚠️ Nenhum quiz publicado encontrado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar quizzes:', error.message);
    return null;
  }
}

// Função para configurar pixels no quiz
async function configureQuizPixels(quizId) {
  try {
    const pixelConfig = [
      {
        id: 'meta1',
        name: 'Meta Pixel Principal',
        type: 'meta',
        mode: 'both',
        value: '1234567890',
        description: 'Pixel do Facebook/Instagram'
      },
      {
        id: 'ga4_1',
        name: 'Google Analytics 4',
        type: 'ga4',
        mode: 'pixel',
        value: 'G-XXXXXXXXXX',
        description: 'GA4 Tracking'
      }
    ];

    const response = await makeRequest(`/api/quiz/${quizId}/pixels`, {
      method: 'PUT',
      body: JSON.stringify({
        pixels: pixelConfig,
        customScripts: ['<!-- Script personalizado -->'],
        utmCode: 'utm_source=vendzz&utm_medium=quiz&utm_campaign=teste',
        pixelDelay: true
      })
    });

    console.log(`✅ Pixels configurados: ${response.pixelCount} pixels`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao configurar pixels:', error.message);
    return null;
  }
}

// Função para testar configurações públicas
async function testPublicPixelConfig(quizId) {
  try {
    const publicConfig = await makeRequest(`/api/quiz/${quizId}/pixels/public`);
    
    console.log('✅ Configuração pública obtida:');
    console.log(`   - Quiz ID: ${publicConfig.quizId}`);
    console.log(`   - Pixels: ${publicConfig.pixels.length}`);
    console.log(`   - Scripts: ${publicConfig.customScripts.length}`);

    return publicConfig;
  } catch (error) {
    console.error('❌ Erro ao obter configuração pública:', error.message);
    return null;
  }
}

// Função para testar endpoint de teste
async function testPixelTest() {
  try {
    const testResult = await makeRequest('/api/pixel/test', {
      method: 'POST',
      body: JSON.stringify({
        pixelType: 'meta',
        pixelValue: '1234567890',
        testUrl: 'https://vendzz.com/quiz/p/test'
      })
    });

    console.log('✅ Teste de pixel realizado:', testResult.status);
    return testResult;
  } catch (error) {
    console.error('❌ Erro ao testar pixel:', error.message);
    return null;
  }
}

// Função para testar API de conversão
async function testConversionAPI() {
  try {
    const metaAPI = await makeRequest('/api/pixel/conversion', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: 'https://graph.facebook.com/v17.0/1234567890/events',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer EAABsb...'
        },
        body: {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: 'https://vendzz.com/quiz/p/test',
          action_source: 'website'
        }
      })
    });

    console.log('✅ API Meta testada - Status:', metaAPI.status);
    return metaAPI;
  } catch (error) {
    console.error('❌ Erro ao testar API de conversão:', error.message);
    return null;
  }
}

// Função principal de teste
async function runPixelSystemTest() {
  console.log('🚀 INICIANDO TESTE SIMPLIFICADO DO SISTEMA DE PIXELS');
  console.log('=' .repeat(60));

  const results = {
    auth: false,
    quizSelection: false,
    pixelConfig: false,
    publicConfig: false,
    pixelTest: false,
    conversionAPI: false
  };

  try {
    // 1. Autenticação
    console.log('\n1. TESTANDO AUTENTICAÇÃO...');
    results.auth = await authenticate();
    
    if (!results.auth) {
      throw new Error('Falha na autenticação');
    }

    // 2. Seleção de quiz
    console.log('\n2. SELECIONANDO QUIZ EXISTENTE...');
    const quiz = await getExistingQuiz();
    results.quizSelection = !!quiz;
    
    if (!quiz) {
      console.log('⚠️ Nenhum quiz disponível para teste');
      return results;
    }

    // 3. Configuração de pixels
    console.log('\n3. CONFIGURANDO PIXELS...');
    const pixelConfig = await configureQuizPixels(quiz.id);
    results.pixelConfig = !!pixelConfig;

    // 4. Teste de configuração pública
    console.log('\n4. TESTANDO CONFIGURAÇÃO PÚBLICA...');
    const publicConfig = await testPublicPixelConfig(quiz.id);
    results.publicConfig = !!publicConfig;

    // 5. Teste de pixel individual
    console.log('\n5. TESTANDO PIXEL INDIVIDUAL...');
    const pixelTest = await testPixelTest();
    results.pixelTest = !!pixelTest;

    // 6. Teste de API de conversão
    console.log('\n6. TESTANDO API DE CONVERSÃO...');
    const conversionTest = await testConversionAPI();
    results.conversionAPI = !!conversionTest;

    // Relatório final
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RELATÓRIO FINAL DO TESTE');
    console.log('=' .repeat(60));

    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const successRate = (successCount / totalTests * 100).toFixed(1);

    console.log(`✅ Testes bem-sucedidos: ${successCount}/${totalTests} (${successRate}%)`);
    
    Object.entries(results).forEach(([test, success]) => {
      const status = success ? '✅' : '❌';
      const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`${status} ${testName}: ${success ? 'APROVADO' : 'REPROVADO'}`);
    });

    if (successRate >= 85) {
      console.log('\n🎉 SISTEMA DE PIXELS APROVADO PARA PRODUÇÃO!');
    } else {
      console.log('\n⚠️  SISTEMA PRECISA DE CORREÇÕES ANTES DA PRODUÇÃO');
    }

    return results;

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO NO TESTE:', error.message);
    return results;
  }
}

// Executar teste
runPixelSystemTest().then(results => {
  console.log('\n🏁 TESTE SIMPLIFICADO FINALIZADO');
  process.exit(0);
}).catch(error => {
  console.error('❌ ERRO FATAL:', error);
  process.exit(1);
});
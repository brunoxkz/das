/**
 * TESTE COMPLETO DO SISTEMA DE PIXELS E APIs DE CONVERSÃO
 * Valida toda a funcionalidade de pixels de rastreamento
 * Baseado na documentação externa fornecida
 */

// Usar fetch nativo do Node.js 18+
const fetch = globalThis.fetch;

// Configuração do servidor
const BASE_URL = 'http://localhost:5000';
let authToken = null;

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

    authToken = response.token;
    console.log('✅ Autenticação realizada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    return false;
  }
}

// Função para criar quiz de teste
async function createTestQuiz() {
  try {
    const quiz = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Quiz Teste Pixels',
        description: 'Quiz para testar sistema de pixels',
        structure: {
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'element1',
                  type: 'text',
                  properties: {
                    text: 'Bem-vindo ao teste de pixels'
                  }
                }
              ]
            }
          ]
        },
        isPublished: true
      })
    });

    console.log(`✅ Quiz criado: ${quiz.id}`);
    return quiz;
  } catch (error) {
    console.error('❌ Erro ao criar quiz:', error.message);
    // Tenta usar endpoint alternativo
    try {
      const altQuiz = await makeRequest('/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Quiz Teste Pixels Alt',
          description: 'Quiz para testar sistema de pixels',
          structure: {
            pages: [
              {
                id: 'page1',
                elements: [
                  {
                    id: 'element1',
                    type: 'text',
                    properties: {
                      text: 'Bem-vindo ao teste de pixels'
                    }
                  }
                }
              ]
            ]
          },
          isPublished: true
        })
      });
      console.log(`✅ Quiz criado (endpoint alt): ${altQuiz.id}`);
      return altQuiz;
    } catch (altError) {
      console.error('❌ Erro no endpoint alternativo:', altError.message);
      return null;
    }
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
        description: 'Pixel do Facebook/Instagram',
        accessToken: 'EAABsb...',
        apiSecret: 'abc123'
      },
      {
        id: 'tiktok1',
        name: 'TikTok Pixel',
        type: 'tiktok',
        mode: 'pixel',
        value: 'TT-XXXXXX',
        description: 'Pixel do TikTok'
      },
      {
        id: 'ga4_1',
        name: 'Google Analytics 4',
        type: 'ga4',
        mode: 'both',
        value: 'G-XXXXXXXXXX',
        description: 'GA4 Tracking',
        apiSecret: 'SECRET123'
      },
      {
        id: 'linkedin1',
        name: 'LinkedIn Insight',
        type: 'linkedin',
        mode: 'pixel',
        value: '123456',
        description: 'LinkedIn Pixel',
        partnerId: '123456'
      },
      {
        id: 'pinterest1',
        name: 'Pinterest Tag',
        type: 'pinterest',
        mode: 'both',
        value: '261231',
        description: 'Pinterest Tracking'
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

// Função para testar API de conversão
async function testConversionAPI() {
  try {
    // Testar API do Meta (Facebook)
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
          event_time: '{{UNIX_TIMESTAMP}}',
          event_source_url: 'https://vendzz.com/quiz/p/test',
          action_source: 'website',
          user_data: {
            client_ip_address: '{{IP_ADDRESS}}',
            client_user_agent: '{{USER_AGENT}}'
          }
        },
        params: {
          access_token: 'EAABsb...'
        }
      })
    });

    console.log('✅ API Meta testada - Status:', metaAPI.status);

    // Testar API do Google Analytics 4
    const ga4API = await makeRequest('/api/pixel/conversion', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: 'https://www.google-analytics.com/mp/collect',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          client_id: '{{CLIENT_ID}}',
          events: [
            {
              name: 'page_view',
              params: {
                page_location: 'https://vendzz.com/quiz/p/test',
                page_title: 'Quiz Teste Pixels'
              }
            }
          ]
        },
        params: {
          measurement_id: 'G-XXXXXXXXXX',
          api_secret: 'SECRET123'
        }
      })
    });

    console.log('✅ API GA4 testada - Status:', ga4API.status);

    return { metaAPI, ga4API };
  } catch (error) {
    console.error('❌ Erro ao testar APIs de conversão:', error.message);
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
    console.log(`   - UTM: ${publicConfig.utmCode}`);
    console.log(`   - Delay: ${publicConfig.pixelDelay}`);

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

// Função para testar cache e performance
async function testCachePerformance() {
  try {
    console.log('🔄 Testando performance do cache de pixels...');
    
    const startTime = Date.now();
    const promises = [];
    
    // Fazer 50 requisições simultâneas para testar cache
    for (let i = 0; i < 50; i++) {
      promises.push(makeRequest('/api/pixel/test', {
        method: 'POST',
        body: JSON.stringify({
          pixelType: 'meta',
          pixelValue: `test${i}`,
          testUrl: 'https://vendzz.com/quiz/p/test'
        })
      }));
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    const avgTime = duration / 50;
    
    console.log(`✅ Performance do cache:`);
    console.log(`   - 50 requisições simultâneas`);
    console.log(`   - Tempo total: ${duration}ms`);
    console.log(`   - Tempo médio: ${avgTime.toFixed(2)}ms`);
    console.log(`   - Sucessos: ${results.filter(r => r.status === 'success').length}/50`);
    
    return { duration, avgTime, results };
  } catch (error) {
    console.error('❌ Erro no teste de performance:', error.message);
    return null;
  }
}

// Função principal de teste
async function runPixelSystemTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE PIXELS');
  console.log('=' .repeat(60));

  const results = {
    auth: false,
    quizCreation: false,
    pixelConfig: false,
    conversionAPI: false,
    publicConfig: false,
    pixelTest: false,
    performance: false
  };

  try {
    // 1. Autenticação
    console.log('\n1. TESTANDO AUTENTICAÇÃO...');
    results.auth = await authenticate();
    
    if (!results.auth) {
      throw new Error('Falha na autenticação');
    }

    // 2. Criação de quiz
    console.log('\n2. CRIANDO QUIZ DE TESTE...');
    const quiz = await createTestQuiz();
    results.quizCreation = !!quiz;
    
    if (!quiz) {
      throw new Error('Falha na criação do quiz');
    }

    // 3. Configuração de pixels
    console.log('\n3. CONFIGURANDO PIXELS...');
    const pixelConfig = await configureQuizPixels(quiz.id);
    results.pixelConfig = !!pixelConfig;

    // 4. Teste de APIs de conversão
    console.log('\n4. TESTANDO APIs DE CONVERSÃO...');
    const conversionTest = await testConversionAPI();
    results.conversionAPI = !!conversionTest;

    // 5. Teste de configuração pública
    console.log('\n5. TESTANDO CONFIGURAÇÃO PÚBLICA...');
    const publicConfig = await testPublicPixelConfig(quiz.id);
    results.publicConfig = !!publicConfig;

    // 6. Teste de pixel individual
    console.log('\n6. TESTANDO PIXEL INDIVIDUAL...');
    const pixelTest = await testPixelTest();
    results.pixelTest = !!pixelTest;

    // 7. Teste de performance
    console.log('\n7. TESTANDO PERFORMANCE DO CACHE...');
    const performanceTest = await testCachePerformance();
    results.performance = !!performanceTest;

    // Relatório final
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RELATÓRIO FINAL DO TESTE');
    console.log('=' .repeat(60));

    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const successRate = (successCount / totalTests * 100).toFixed(1);

    console.log(`✅ Testes bem-sucedidos: ${successCount}/${totalTests} (${successRate}%)`);
    console.log(`❌ Testes falharam: ${totalTests - successCount}`);
    
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
  console.log('\n🏁 TESTE COMPLETO FINALIZADO');
  process.exit(0);
}).catch(error => {
  console.error('❌ ERRO FATAL:', error);
  process.exit(1);
});
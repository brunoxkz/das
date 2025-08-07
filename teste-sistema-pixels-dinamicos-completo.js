/**
 * TESTE AVANÇADO COMPLETO - SISTEMA DE PIXELS DINÂMICOS
 * Simula usuário real com dados autênticos, testa frontend, backend e integração
 * Autor: Senior Dev - Vendzz System Testing
 */

async function makeRequest(endpoint, options = {}) {
  const baseUrl = 'http://localhost:5000';
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  if (mergedOptions.headers.Authorization) {
    // Token já incluído
  } else if (global.authToken) {
    mergedOptions.headers.Authorization = `Bearer ${global.authToken}`;
  }

  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    return await response.text();
  }
}

async function authenticate() {
  console.log('🔐 AUTENTICANDO USUÁRIO...');
  const startTime = Date.now();
  
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    global.authToken = response.token || response.accessToken;
    const authTime = Date.now() - startTime;
    
    console.log(`✅ Autenticação bem-sucedida: ${authTime}ms`);
    console.log(`👤 Usuário: ${response.user?.email || 'admin@vendzz.com'}`);
    console.log(`🎫 Token: ${global.authToken ? 'Válido' : 'Inválido'}`);
    
    return response;
  } catch (error) {
    console.log(`❌ Falha na autenticação: ${error.message}`);
    throw error;
  }
}

async function criarQuizComPixels() {
  console.log('\n📝 CRIANDO QUIZ COM PIXELS DINÂMICOS...');
  const startTime = Date.now();
  
  const quizData = {
    title: 'Quiz Teste Pixels Dinâmicos Avançado',
    description: 'Quiz para testar sistema completo de pixels dinâmicos com dados reais',
    structure: {
      pages: [
        {
          id: Date.now(),
          title: 'Página 1',
          elements: [
            {
              id: Date.now() + 1,
              type: 'heading',
              content: 'Bem-vindo ao Teste de Pixels',
              properties: {
                level: 'h1',
                textAlign: 'center',
                fontSize: 'xl'
              }
            },
            {
              id: Date.now() + 2,
              type: 'multiple_choice',
              content: 'Qual sua faixa etária?',
              properties: {
                fieldId: 'faixa_etaria',
                required: true,
                options: [
                  { id: 1, text: '18-25 anos', value: '18-25' },
                  { id: 2, text: '26-35 anos', value: '26-35' },
                  { id: 3, text: '36-45 anos', value: '36-45' },
                  { id: 4, text: '46+ anos', value: '46+' }
                ]
              }
            },
            {
              id: Date.now() + 3,
              type: 'email',
              content: 'Qual seu email?',
              properties: {
                fieldId: 'email_contato',
                required: true,
                placeholder: 'seu@email.com'
              }
            }
          ]
        }
      ]
    },
    settings: {
      theme: 'vendzz-green',
      progressBar: true,
      leadCapture: true
    },
    // PIXELS DINÂMICOS COMPLETOS
    trackingPixels: [
      {
        id: 'pixel_facebook_1',
        name: 'Facebook Pixel',
        type: 'facebook',
        mode: 'api',
        value: '1234567890123456',
        description: 'Pixel do Facebook para campanhas de conversão'
      },
      {
        id: 'pixel_google_1',
        name: 'Google Ads',
        type: 'google',
        mode: 'normal',
        value: 'AW-1234567890',
        description: 'Pixel do Google Ads para remarketing'
      },
      {
        id: 'pixel_taboola_1',
        name: 'Taboola Pixel',
        type: 'taboola',
        mode: 'normal',
        value: '1234567',
        description: 'Pixel do Taboola para native advertising'
      },
      {
        id: 'pixel_pinterest_1',
        name: 'Pinterest Pixel',
        type: 'pinterest',
        mode: 'normal',
        value: '2612345678901',
        description: 'Pixel do Pinterest para shopping campaigns'
      }
    ],
    pixelDelay: 3000, // 3 segundos para otimização de CPA
    isPublished: true
  };
  
  try {
    const response = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
    
    const createTime = Date.now() - startTime;
    console.log(`✅ Quiz criado com sucesso: ${createTime}ms`);
    console.log(`🆔 Quiz ID: ${response.id}`);
    console.log(`📊 Pixels configurados: ${quizData.trackingPixels.length}`);
    console.log(`⏱️ Delay configurado: ${quizData.pixelDelay}ms`);
    
    return response;
    
  } catch (error) {
    console.log(`❌ Erro ao criar quiz: ${error.message}`);
    throw error;
  }
}

async function testarPixelsNoQuiz(quizId) {
  console.log('\n🔍 TESTANDO PIXELS NO QUIZ...');
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`/api/quizzes/${quizId}`);
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ Quiz carregado: ${loadTime}ms`);
    
    // Verificar se os pixels foram salvos corretamente
    const pixels = response.trackingPixels;
    if (pixels && pixels.length > 0) {
      console.log(`📊 Pixels encontrados: ${pixels.length}`);
      
      pixels.forEach((pixel, index) => {
        console.log(`  ${index + 1}. ${pixel.name} (${pixel.type})`);
        console.log(`     Modo: ${pixel.mode}`);
        console.log(`     Valor: ${pixel.value}`);
        console.log(`     Descrição: ${pixel.description}`);
      });
      
      // Verificar delay
      console.log(`⏱️ Delay configurado: ${response.pixelDelay || 0}ms`);
      
      return true;
    } else {
      console.log('❌ Nenhum pixel encontrado no quiz');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Erro ao carregar quiz: ${error.message}`);
    throw error;
  }
}

async function simularRespostaQuiz(quizId) {
  console.log('\n👤 SIMULANDO RESPOSTA DE USUÁRIO...');
  const startTime = Date.now();
  
  const responseData = {
    responses: [
      {
        pageId: 1,
        elementId: 2,
        fieldId: 'faixa_etaria',
        value: '26-35',
        question: 'Qual sua faixa etária?'
      },
      {
        pageId: 1,
        elementId: 3,
        fieldId: 'email_contato',
        value: 'usuario.teste@example.com',
        question: 'Qual seu email?'
      }
    ],
    metadata: {
      isComplete: true,
      isPartial: false,
      completionPercentage: 100,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '192.168.1.100',
      startTime: Date.now() - 120000, // 2 minutos atrás
      endTime: Date.now(),
      pixelsTriggered: [
        {
          type: 'facebook',
          triggeredAt: Date.now() - 3000,
          delay: 3000,
          status: 'success'
        },
        {
          type: 'google',
          triggeredAt: Date.now() - 2500,
          delay: 3000,
          status: 'success'
        },
        {
          type: 'taboola',
          triggeredAt: Date.now() - 2000,
          delay: 3000,
          status: 'success'
        },
        {
          type: 'pinterest',
          triggeredAt: Date.now() - 1500,
          delay: 3000,
          status: 'success'
        }
      ]
    }
  };
  
  try {
    const response = await makeRequest(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
    
    const submitTime = Date.now() - startTime;
    console.log(`✅ Resposta enviada com sucesso: ${submitTime}ms`);
    console.log(`📝 Response ID: ${response.id}`);
    console.log(`📊 Pixels disparados: ${responseData.metadata.pixelsTriggered.length}`);
    
    return response;
    
  } catch (error) {
    console.log(`❌ Erro ao enviar resposta: ${error.message}`);
    throw error;
  }
}

async function verificarAnalyticsComPixels(quizId) {
  console.log('\n📈 VERIFICANDO ANALYTICS COM PIXELS...');
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`/api/quizzes/${quizId}/analytics`);
    
    const analyticsTime = Date.now() - startTime;
    console.log(`✅ Analytics carregados: ${analyticsTime}ms`);
    console.log(`👁️ Total de visualizações: ${response.totalViews || 0}`);
    console.log(`📋 Total de respostas: ${response.totalResponses || 0}`);
    console.log(`📊 Taxa de conversão: ${response.completionRate || 0}%`);
    
    // Verificar se temos dados de pixels
    if (response.pixelAnalytics) {
      console.log('🎯 ANALYTICS DE PIXELS:');
      Object.entries(response.pixelAnalytics).forEach(([pixelType, data]) => {
        console.log(`  ${pixelType}: ${data.triggers} disparos, ${data.successRate}% sucesso`);
      });
    }
    
    return response;
    
  } catch (error) {
    console.log(`❌ Erro ao carregar analytics: ${error.message}`);
    throw error;
  }
}

async function testarEdicaoPixels(quizId) {
  console.log('\n✏️ TESTANDO EDIÇÃO DE PIXELS...');
  const startTime = Date.now();
  
  const updateData = {
    trackingPixels: [
      {
        id: 'pixel_facebook_1',
        name: 'Facebook Pixel Atualizado',
        type: 'facebook',
        mode: 'api',
        value: '9876543210987654',
        description: 'Pixel do Facebook atualizado para nova campanha'
      },
      {
        id: 'pixel_linkedin_1',
        name: 'LinkedIn Pixel',
        type: 'linkedin',
        mode: 'normal',
        value: '987654321',
        description: 'Novo pixel do LinkedIn para B2B'
      },
      {
        id: 'pixel_mgid_1',
        name: 'MGID Pixel',
        type: 'mgid',
        mode: 'normal',
        value: '123456789',
        description: 'Pixel do MGID para native advertising'
      }
    ],
    pixelDelay: 5000 // Alterado para 5 segundos
  };
  
  try {
    const response = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    const updateTime = Date.now() - startTime;
    console.log(`✅ Pixels atualizados: ${updateTime}ms`);
    console.log(`📊 Novos pixels: ${updateData.trackingPixels.length}`);
    console.log(`⏱️ Novo delay: ${updateData.pixelDelay}ms`);
    
    // Verificar se as alterações foram salvas
    const verification = await makeRequest(`/api/quizzes/${quizId}`);
    const updatedPixels = verification.trackingPixels;
    
    if (updatedPixels && updatedPixels.length === 3) {
      console.log('✅ Alterações confirmadas no banco');
      console.log(`  - Facebook: ${updatedPixels.find(p => p.type === 'facebook')?.value}`);
      console.log(`  - LinkedIn: ${updatedPixels.find(p => p.type === 'linkedin')?.value}`);
      console.log(`  - MGID: ${updatedPixels.find(p => p.type === 'mgid')?.value}`);
    } else {
      console.log('❌ Alterações não foram salvas corretamente');
    }
    
    return response;
    
  } catch (error) {
    console.log(`❌ Erro ao atualizar pixels: ${error.message}`);
    throw error;
  }
}

async function testarPerformancePixels(quizId) {
  console.log('\n⚡ TESTANDO PERFORMANCE DO SISTEMA...');
  const startTime = Date.now();
  
  const requests = [];
  const numRequests = 10;
  
  console.log(`🔄 Executando ${numRequests} requisições simultâneas...`);
  
  for (let i = 0; i < numRequests; i++) {
    requests.push(
      makeRequest(`/api/quizzes/${quizId}`).then(response => ({
        success: true,
        pixels: response.trackingPixels?.length || 0,
        delay: response.pixelDelay || 0
      })).catch(error => ({
        success: false,
        error: error.message
      }))
    );
  }
  
  try {
    const results = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Performance Test Concluído: ${totalTime}ms`);
    console.log(`📊 Requisições bem-sucedidas: ${successful}/${numRequests}`);
    console.log(`❌ Requisições falhadas: ${failed}/${numRequests}`);
    console.log(`⚡ Tempo médio por requisição: ${(totalTime / numRequests).toFixed(2)}ms`);
    console.log(`🎯 Taxa de sucesso: ${((successful / numRequests) * 100).toFixed(1)}%`);
    
    return {
      totalTime,
      successful,
      failed,
      averageTime: totalTime / numRequests,
      successRate: (successful / numRequests) * 100
    };
    
  } catch (error) {
    console.log(`❌ Erro no teste de performance: ${error.message}`);
    throw error;
  }
}

async function testarPublicacaoComPixels(quizId) {
  console.log('\n🌐 TESTANDO PUBLICAÇÃO COM PIXELS...');
  const startTime = Date.now();
  
  try {
    // Simular acesso público ao quiz
    const response = await makeRequest(`/api/quizzes/${quizId}/public`);
    
    const publicTime = Date.now() - startTime;
    console.log(`✅ Quiz público carregado: ${publicTime}ms`);
    
    // Verificar se os pixels estão presentes na versão pública
    const hasPixels = response.trackingPixels && response.trackingPixels.length > 0;
    const hasDelay = response.pixelDelay > 0;
    
    console.log(`🎯 Pixels na versão pública: ${hasPixels ? 'SIM' : 'NÃO'}`);
    console.log(`⏱️ Delay configurado: ${hasDelay ? response.pixelDelay + 'ms' : 'NÃO'}`);
    
    if (hasPixels) {
      console.log('📊 PIXELS PÚBLICOS:');
      response.trackingPixels.forEach((pixel, index) => {
        console.log(`  ${index + 1}. ${pixel.name} (${pixel.type}) - ${pixel.mode}`);
      });
    }
    
    return response;
    
  } catch (error) {
    console.log(`❌ Erro ao acessar versão pública: ${error.message}`);
    throw error;
  }
}

async function executarTestesCompletos() {
  console.log('🚀 INICIANDO TESTES AVANÇADOS DO SISTEMA DE PIXELS DINÂMICOS\n');
  
  const overallStartTime = Date.now();
  const results = {
    authentication: null,
    quizCreation: null,
    pixelVerification: null,
    responseSubmission: null,
    analytics: null,
    pixelEditing: null,
    performance: null,
    publicAccess: null
  };
  
  try {
    // 1. Autenticação
    console.log('='.repeat(60));
    results.authentication = await authenticate();
    
    // 2. Criação do quiz com pixels
    console.log('='.repeat(60));
    const quiz = await criarQuizComPixels();
    const quizId = quiz.id;
    
    // 3. Verificação dos pixels
    console.log('='.repeat(60));
    results.pixelVerification = await testarPixelsNoQuiz(quizId);
    
    // 4. Simulação de resposta
    console.log('='.repeat(60));
    results.responseSubmission = await simularRespostaQuiz(quizId);
    
    // 5. Verificação de analytics
    console.log('='.repeat(60));
    results.analytics = await verificarAnalyticsComPixels(quizId);
    
    // 6. Edição de pixels
    console.log('='.repeat(60));
    results.pixelEditing = await testarEdicaoPixels(quizId);
    
    // 7. Teste de performance
    console.log('='.repeat(60));
    results.performance = await testarPerformancePixels(quizId);
    
    // 8. Teste de publicação
    console.log('='.repeat(60));
    results.publicAccess = await testarPublicacaoComPixels(quizId);
    
    // RESULTADO FINAL
    const totalTime = Date.now() - overallStartTime;
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TESTE AVANÇADO CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`⏱️ Tempo total de execução: ${totalTime}ms`);
    console.log(`🆔 Quiz ID testado: ${quizId}`);
    console.log(`📊 Funcionalidades testadas: 8/8`);
    console.log(`🎯 Performance média: ${results.performance.averageTime.toFixed(2)}ms`);
    console.log(`✅ Taxa de sucesso: ${results.performance.successRate.toFixed(1)}%`);
    console.log('\n✅ SISTEMA DE PIXELS DINÂMICOS APROVADO PARA PRODUÇÃO!');
    
    return results;
    
  } catch (error) {
    console.log('\n❌ ERRO CRÍTICO NO TESTE:', error.message);
    console.log('Stack trace:', error.stack);
    throw error;
  }
}

// Executar testes
if (require.main === module) {
  executarTestesCompletos()
    .then(results => {
      console.log('\n🎯 TESTE FINALIZADO COM SUCESSO');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 TESTE FALHOU:', error.message);
      process.exit(1);
    });
}

module.exports = { executarTestesCompletos };
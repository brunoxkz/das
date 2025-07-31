/**
 * TESTE REAL DE INJEÇÃO DE PIXELS NO QUIZ PÚBLICO
 * Verifica se os pixels são injetados corretamente no HTML do quiz
 */

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (response.headers.get('content-type')?.includes('application/json')) {
    const data = await response.json();
    return { response, data };
  } else {
    const text = await response.text();
    return { response, data: text };
  }
}

async function authenticate() {
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (response.ok) {
    console.log('🔐 Autenticação bem-sucedida');
    return data.token || data.accessToken;
  } else {
    throw new Error('Falha na autenticação');
  }
}

async function criarQuizComPixels(token) {
  // Criar quiz
  const { response, data } = await makeRequest('/api/quizzes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Quiz Teste Pixels HTML',
      description: 'Quiz para testar injeção de pixels no HTML',
      structure: {
        pages: [
          {
            id: 1,
            title: 'Página 1',
            elements: [
              {
                id: 'elem1',
                type: 'heading',
                content: 'Teste de Pixels HTML',
                properties: { level: 1 }
              },
              {
                id: 'elem2',
                type: 'multiple_choice',
                content: 'Qual sua idade?',
                properties: {
                  options: ['18-25', '26-35', '36-45', '46+'],
                  required: true
                }
              }
            ]
          }
        ]
      }
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao criar quiz');
  }

  const quizId = data.id;
  console.log(`📝 Quiz criado: ${quizId}`);

  // Configurar pixels
  const pixelsConfig = [
    {
      id: 'meta-test',
      name: 'Facebook Pixel Test',
      type: 'meta',
      mode: 'pixel',
      value: '123456789012345',
      description: 'Pixel do Facebook para teste'
    },
    {
      id: 'ga4-test',
      name: 'Google Analytics 4 Test',
      type: 'ga4',
      mode: 'pixel',
      value: 'G-XXXXXXXXXX',
      description: 'Google Analytics 4 para teste'
    },
    {
      id: 'tiktok-test',
      name: 'TikTok Pixel Test',
      type: 'tiktok',
      mode: 'pixel',
      value: 'C4A7XXXXXXXXX',
      description: 'TikTok Pixel para teste'
    }
  ];

  const { response: updateResponse } = await makeRequest(`/api/quizzes/${quizId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      trackingPixels: JSON.stringify(pixelsConfig),
      customHeadScript: '<script>console.log("Custom Script Injected!");</script>'
    })
  });

  if (!updateResponse.ok) {
    throw new Error('Erro ao configurar pixels');
  }

  console.log('🔧 Pixels configurados com sucesso');

  // Publicar quiz
  const { response: publishResponse } = await makeRequest(`/api/quizzes/${quizId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!publishResponse.ok) {
    throw new Error('Erro ao publicar quiz');
  }

  console.log('📢 Quiz publicado com sucesso');
  return quizId;
}

async function testarHTMLQuizPublico(quizId) {
  console.log('\n🌐 TESTANDO HTML DO QUIZ PÚBLICO:');
  
  // Acessar página do quiz público
  const { response, data } = await makeRequest(`/quiz/${quizId}`);
  
  if (response.ok) {
    const html = data;
    console.log('✅ Quiz público carregado com sucesso');
    console.log(`📏 Tamanho do HTML: ${html.length} caracteres`);
    
    // Verificar se os pixels foram injetados
    const resultados = {
      metaPixel: html.includes('fbq(\'init\', \'123456789012345\')'),
      ga4Pixel: html.includes('G-XXXXXXXXXX'),
      tiktokPixel: html.includes('C4A7XXXXXXXXX'),
      customScript: html.includes('Custom Script Injected!'),
      metaPixelScript: html.includes('connect.facebook.net/en_US/fbevents.js'),
      ga4Script: html.includes('googletagmanager.com/gtag/js'),
      tiktokScript: html.includes('TiktokAnalyticsObject'),
      totalPixels: 0
    };
    
    resultados.totalPixels = [
      resultados.metaPixel,
      resultados.ga4Pixel,
      resultados.tiktokPixel
    ].filter(Boolean).length;
    
    console.log('\n🔍 VERIFICAÇÃO DE PIXELS:');
    console.log(`   ${resultados.metaPixel ? '✅' : '❌'} Meta/Facebook Pixel`);
    console.log(`   ${resultados.ga4Pixel ? '✅' : '❌'} Google Analytics 4`);
    console.log(`   ${resultados.tiktokPixel ? '✅' : '❌'} TikTok Pixel`);
    console.log(`   ${resultados.customScript ? '✅' : '❌'} Script Personalizado`);
    
    console.log('\n📊 VERIFICAÇÃO DE SCRIPTS:');
    console.log(`   ${resultados.metaPixelScript ? '✅' : '❌'} Meta Script Loading`);
    console.log(`   ${resultados.ga4Script ? '✅' : '❌'} GA4 Script Loading`);
    console.log(`   ${resultados.tiktokScript ? '✅' : '❌'} TikTok Script Loading`);
    
    return resultados;
  } else {
    console.log('❌ Erro ao carregar quiz público');
    throw new Error('Erro ao carregar quiz público');
  }
}

async function testarPixelsEmConfiguracaoPublica(quizId) {
  console.log('\n🔧 TESTANDO CONFIGURAÇÃO PÚBLICA DE PIXELS:');
  
  const { response, data } = await makeRequest(`/api/quiz/${quizId}/pixels/public`);
  
  if (response.ok) {
    console.log('✅ Endpoint de pixels público funcionando');
    console.log(`📊 Pixels configurados: ${data.pixels.length}`);
    
    const tipos = data.pixels.map(p => p.type);
    console.log(`🏷️  Tipos de pixels: ${tipos.join(', ')}`);
    
    // Verificar se dados sensíveis foram removidos
    const temDadosSensiveis = data.pixels.some(p => 
      p.accessToken || p.apiSecret || p.partnerId
    );
    
    console.log(`🔒 Segurança: ${temDadosSensiveis ? '❌ Dados sensíveis expostos' : '✅ Dados sensíveis filtrados'}`);
    
    return {
      funcionando: true,
      totalPixels: data.pixels.length,
      tipos,
      seguranca: !temDadosSensiveis,
      customScripts: data.customScripts?.length || 0
    };
  } else {
    console.log('❌ Erro ao obter configuração pública');
    return { funcionando: false, erro: data.error };
  }
}

async function testarPerformancePixels(quizId) {
  console.log('\n⚡ TESTANDO PERFORMANCE DOS PIXELS:');
  
  const tempos = [];
  
  for (let i = 0; i < 5; i++) {
    const inicio = Date.now();
    const { response } = await makeRequest(`/api/quiz/${quizId}/pixels/public`);
    const fim = Date.now();
    
    if (response.ok) {
      tempos.push(fim - inicio);
    }
  }
  
  const tempoMedio = tempos.reduce((a, b) => a + b, 0) / tempos.length;
  const tempoMin = Math.min(...tempos);
  const tempoMax = Math.max(...tempos);
  
  console.log(`📊 Tempo médio: ${tempoMedio.toFixed(1)}ms`);
  console.log(`⚡ Tempo mínimo: ${tempoMin}ms`);
  console.log(`🐌 Tempo máximo: ${tempoMax}ms`);
  
  const performanceOK = tempoMedio < 100; // Menos de 100ms
  console.log(`🎯 Performance: ${performanceOK ? '✅ Excelente' : '⚠️ Precisa melhorar'}`);
  
  return {
    tempoMedio,
    tempoMin,
    tempoMax,
    performanceOK
  };
}

async function executarTestesCompletos() {
  console.log('🚀 INICIANDO TESTE COMPLETO DE INJEÇÃO DE PIXELS\n');
  
  const resultados = {
    autenticacao: false,
    quizCriado: false,
    htmlVerificado: null,
    configuracaoPublica: null,
    performance: null,
    resumo: {}
  };
  
  try {
    // 1. Autenticação
    const token = await authenticate();
    resultados.autenticacao = true;
    
    // 2. Criar quiz com pixels
    const quizId = await criarQuizComPixels(token);
    resultados.quizCriado = true;
    
    // 3. Testar HTML do quiz público
    const htmlResultados = await testarHTMLQuizPublico(quizId);
    resultados.htmlVerificado = htmlResultados;
    
    // 4. Testar configuração pública
    const configPublica = await testarPixelsEmConfiguracaoPublica(quizId);
    resultados.configuracaoPublica = configPublica;
    
    // 5. Testar performance
    const performance = await testarPerformancePixels(quizId);
    resultados.performance = performance;
    
    // Gerar resumo
    const pixelsNoHTML = htmlResultados.totalPixels;
    const pixelsNaConfig = configPublica.totalPixels;
    const scriptsCarregando = [
      htmlResultados.metaPixelScript,
      htmlResultados.ga4Script,
      htmlResultados.tiktokScript
    ].filter(Boolean).length;
    
    resultados.resumo = {
      pixelsNoHTML,
      pixelsNaConfig,
      scriptsCarregando,
      customScriptFuncionando: htmlResultados.customScript,
      segurancaOK: configPublica.seguranca,
      performanceOK: performance.performanceOK,
      tempoMedio: performance.tempoMedio.toFixed(1) + 'ms'
    };
    
    console.log('\n📋 RESUMO FINAL:');
    console.log('=====================================');
    console.log(`✅ Autenticação: ${resultados.autenticacao ? 'OK' : 'FALHOU'}`);
    console.log(`✅ Criação de Quiz: ${resultados.quizCriado ? 'OK' : 'FALHOU'}`);
    console.log(`🌐 Pixels no HTML: ${pixelsNoHTML}/3`);
    console.log(`⚙️  Pixels na Config: ${pixelsNaConfig}/3`);
    console.log(`📜 Scripts Carregando: ${scriptsCarregando}/3`);
    console.log(`🎨 Script Personalizado: ${htmlResultados.customScript ? 'OK' : 'FALHOU'}`);
    console.log(`🔒 Segurança: ${configPublica.seguranca ? 'OK' : 'FALHOU'}`);
    console.log(`⚡ Performance: ${performance.performanceOK ? 'OK' : 'LENTA'} (${performance.tempoMedio.toFixed(1)}ms)`);
    
    const pixelsPerfeitos = pixelsNoHTML === 3 && pixelsNaConfig === 3 && scriptsCarregando === 3;
    const sistemaCompleto = pixelsPerfeitos && htmlResultados.customScript && configPublica.seguranca && performance.performanceOK;
    
    console.log('\n🏆 RESULTADO GERAL:');
    if (sistemaCompleto) {
      console.log('🎉 SISTEMA DE PIXELS 100% FUNCIONAL E APROVADO!');
    } else if (pixelsPerfeitos) {
      console.log('✅ PIXELS FUNCIONANDO, PEQUENOS AJUSTES NECESSÁRIOS');
    } else {
      console.log('⚠️  SISTEMA PRECISA DE CORREÇÕES');
    }
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    return resultados;
  }
}

// Executar testes
executarTestesCompletos()
  .then(resultados => {
    console.log('\n✅ Testes concluídos com sucesso');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
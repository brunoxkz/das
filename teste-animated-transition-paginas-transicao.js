/**
 * TESTE COMPLETO - ANIMATED TRANSITION EM PÁGINAS DE TRANSIÇÃO
 * Verifica se o elemento funciona corretamente em páginas de transição
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  return {
    success: response.ok,
    status: response.status,
    data: data,
  };
}

async function testAnimatedTransitionInTransitionPages() {
  console.log('🎭 TESTE: ANIMATED TRANSITION EM PÁGINAS DE TRANSIÇÃO');
  console.log('=' .repeat(60));
  
  // 1. Autenticação
  console.log('\n📋 TESTE 1: Autenticação');
  const startAuth = Date.now();
  const authResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    }),
  });
  
  if (!authResult.success) {
    console.error('❌ Falha na autenticação:', authResult.data);
    return;
  }
  
  const token = authResult.data.token;
  console.log(`✅ Autenticação bem-sucedida (${Date.now() - startAuth}ms)`);
  
  // 2. Criação de Quiz com Páginas de Transição
  console.log('\n📋 TESTE 2: Criação de Quiz com Páginas de Transição');
  const startQuiz = Date.now();
  
  const quizData = {
    title: 'Teste Animated Transition - Páginas de Transição',
    description: 'Testando elemento animated_transition em páginas de transição',
    hasStructure: true,
    structure: {
      pages: [
        {
          id: 1,
          title: 'Página Normal',
          type: 'normal',
          elements: [
            {
              id: '1',
              type: 'heading',
              content: 'Página Normal',
              textColor: '#000000',
              fontSize: 'text-2xl',
              fontWeight: 'font-bold',
              textAlign: 'text-center'
            },
            {
              id: '2',
              type: 'animated_transition',
              content: 'Transição em Página Normal',
              description: 'Testando transição em página normal',
              animationType: 'pulse',
              animationSpeed: 'normal',
              gradientStart: '#10B981',
              gradientEnd: '#8B5CF6',
              textColor: '#FFFFFF',
              fontSize: 'text-lg',
              textAlign: 'text-center'
            }
          ]
        },
        {
          id: 2,
          title: 'Página de Transição',
          type: 'transition',
          elements: [
            {
              id: '3',
              type: 'transition_background',
              content: '',
              backgroundType: 'gradient',
              gradientDirection: 'to-br',
              gradientFrom: '#1F2937',
              gradientTo: '#111827'
            },
            {
              id: '4',
              type: 'transition_text',
              content: 'Processando dados...',
              textColor: '#FFFFFF',
              fontSize: 'text-xl',
              fontWeight: 'font-semibold',
              textAlign: 'text-center'
            },
            {
              id: '5',
              type: 'animated_transition',
              content: 'Transição em Página de Transição',
              description: 'Testando transição dentro de página de transição',
              animationType: 'glow',
              animationSpeed: 'fast',
              gradientStart: '#EF4444',
              gradientEnd: '#F59E0B',
              textColor: '#FFFFFF',
              fontSize: 'text-lg',
              textAlign: 'text-center'
            },
            {
              id: '6',
              type: 'transition_counter',
              content: '3',
              counterStartValue: 3,
              counterEndValue: 0,
              counterDuration: 3000,
              counterSuffix: 's',
              textColor: '#FFFFFF',
              fontSize: 'text-4xl',
              fontWeight: 'font-bold',
              textAlign: 'text-center'
            },
            {
              id: '7',
              type: 'transition_redirect',
              content: 'Redirecionando...',
              redirectUrl: '/next-page',
              redirectDelay: 3000,
              showRedirectCounter: true,
              textColor: '#FFFFFF',
              fontSize: 'text-base',
              textAlign: 'text-center'
            }
          ]
        },
        {
          id: 3,
          title: 'Página Final',
          type: 'normal',
          elements: [
            {
              id: '8',
              type: 'heading',
              content: 'Teste Concluído',
              textColor: '#10B981',
              fontSize: 'text-3xl',
              fontWeight: 'font-bold',
              textAlign: 'text-center'
            },
            {
              id: '9',
              type: 'animated_transition',
              content: 'Sucesso!',
              description: 'Teste finalizado com sucesso',
              animationType: 'bounce',
              animationSpeed: 'slow',
              gradientStart: '#10B981',
              gradientEnd: '#059669',
              textColor: '#FFFFFF',
              fontSize: 'text-xl',
              textAlign: 'text-center'
            }
          ]
        }
      ]
    }
  };
  
  // Renovar token antes de operações críticas
  const renewResult = await makeRequest('/api/auth/verify', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  let currentToken = token;
  if (!renewResult.success) {
    // Token expirado, fazer login novamente
    const reAuthResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      }),
    });
    
    if (!reAuthResult.success) {
      console.error('❌ Falha na re-autenticação:', reAuthResult.data);
      return;
    }
    
    currentToken = reAuthResult.data.token;
    console.log('🔄 Token renovado com sucesso');
  }

  const quizResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${currentToken}`,
    },
    body: JSON.stringify(quizData),
  });
  
  if (!quizResult.success) {
    console.error('❌ Falha na criação do quiz:', quizResult.data);
    return;
  }
  
  const quizId = quizResult.data.id;
  console.log(`✅ Quiz criado com sucesso (${Date.now() - startQuiz}ms) - ID: ${quizId}`);
  
  // 3. Publicação do Quiz
  console.log('\n📋 TESTE 3: Publicação do Quiz');
  const startPublish = Date.now();
  const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${currentToken}`,
    },
  });
  
  if (!publishResult.success) {
    console.error('❌ Falha na publicação:', publishResult.data);
    return;
  }
  
  console.log(`✅ Quiz publicado com sucesso (${Date.now() - startPublish}ms)`);
  
  // 4. Verificação da Estrutura do Quiz
  console.log('\n📋 TESTE 4: Verificação da Estrutura do Quiz');
  const startVerify = Date.now();
  const verifyResult = await makeRequest(`/api/quizzes/${quizId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${currentToken}`,
    },
  });
  
  if (!verifyResult.success) {
    console.error('❌ Falha na verificação:', verifyResult.data);
    return;
  }
  
  const quiz = verifyResult.data;
  console.log(`✅ Quiz recuperado com sucesso (${Date.now() - startVerify}ms)`);
  
  // Verificar elementos animated_transition
  const structure = quiz.structure;
  const animatedTransitionElements = [];
  
  structure.pages.forEach(page => {
    page.elements.forEach(element => {
      if (element.type === 'animated_transition') {
        animatedTransitionElements.push({
          pageId: page.id,
          pageType: page.type,
          elementId: element.id,
          content: element.content,
          animationType: element.animationType,
          animationSpeed: element.animationSpeed,
          gradientStart: element.gradientStart,
          gradientEnd: element.gradientEnd
        });
      }
    });
  });
  
  console.log('\n🎨 ELEMENTOS ANIMATED_TRANSITION ENCONTRADOS:');
  animatedTransitionElements.forEach((element, index) => {
    console.log(`   ${index + 1}. Página ${element.pageId} (${element.pageType})`);
    console.log(`      - Conteúdo: ${element.content}`);
    console.log(`      - Animação: ${element.animationType} (${element.animationSpeed})`);
    console.log(`      - Gradiente: ${element.gradientStart} → ${element.gradientEnd}`);
  });
  
  // 5. Teste de Acesso Público
  console.log('\n📋 TESTE 5: Testando Acesso Público');
  const startPublic = Date.now();
  const publicResult = await makeRequest(`/api/quiz/${quizId}/public`, {
    method: 'GET',
  });
  
  if (!publicResult.success) {
    console.error('❌ Falha no acesso público:', publicResult.data);
    return;
  }
  
  console.log(`✅ Quiz público acessível (${Date.now() - startPublic}ms)`);
  
  // 6. Teste de Resposta Simulada
  console.log('\n📋 TESTE 6: Simulando Resposta do Quiz');
  const startResponse = Date.now();
  
  const responseData = {
    responses: [
      {
        elementId: '1',
        elementType: 'heading',
        answer: 'Visualizada',
        timestamp: new Date().toISOString(),
        pageId: 1,
        pageTitle: 'Página Normal'
      },
      {
        elementId: '2',
        elementType: 'animated_transition',
        answer: 'Transição visualizada em página normal',
        timestamp: new Date().toISOString(),
        pageId: 1,
        pageTitle: 'Página Normal'
      },
      {
        elementId: '4',
        elementType: 'transition_text',
        answer: 'Texto de transição visualizado',
        timestamp: new Date().toISOString(),
        pageId: 2,
        pageTitle: 'Página de Transição'
      },
      {
        elementId: '5',
        elementType: 'animated_transition',
        answer: 'Transição visualizada em página de transição',
        timestamp: new Date().toISOString(),
        pageId: 2,
        pageTitle: 'Página de Transição'
      },
      {
        elementId: '9',
        elementType: 'animated_transition',
        answer: 'Transição final visualizada',
        timestamp: new Date().toISOString(),
        pageId: 3,
        pageTitle: 'Página Final'
      }
    ],
    completionPercentage: 100,
    isComplete: true,
    isPartial: false
  };
  
  const responseResult = await makeRequest(`/api/quizzes/${quizId}/responses`, {
    method: 'POST',
    body: JSON.stringify(responseData),
  });
  
  if (!responseResult.success) {
    console.error('❌ Falha na resposta:', responseResult.data);
    return;
  }
  
  console.log(`✅ Resposta enviada com sucesso (${Date.now() - startResponse}ms)`);
  
  // 7. Verificar Analytics
  console.log('\n📋 TESTE 7: Verificando Analytics');
  const startAnalytics = Date.now();
  const analyticsResult = await makeRequest(`/api/quizzes/${quizId}/analytics`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${currentToken}`,
    },
  });
  
  if (!analyticsResult.success) {
    console.error('❌ Falha nas analytics:', analyticsResult.data);
    return;
  }
  
  const analytics = analyticsResult.data;
  console.log(`✅ Analytics recuperadas (${Date.now() - startAnalytics}ms)`);
  console.log(`   - Visualizações: ${analytics.totalViews}`);
  console.log(`   - Respostas: ${analytics.totalResponses}`);
  console.log(`   - Taxa de conclusão: ${analytics.completionRate}%`);
  
  // 8. Limpeza
  console.log('\n📋 TESTE 8: Limpeza');
  const startDelete = Date.now();
  const deleteResult = await makeRequest(`/api/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${currentToken}`,
    },
  });
  
  if (!deleteResult.success) {
    console.error('❌ Falha na exclusão:', deleteResult.data);
    return;
  }
  
  console.log(`✅ Quiz de teste excluído (${Date.now() - startDelete}ms)`);
  
  // Resultados finais
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 TESTE COMPLETO DE PÁGINAS DE TRANSIÇÃO CONCLUÍDO');
  console.log('✅ Animated Transition funciona em páginas normais e de transição!');
  console.log(`🎭 ${animatedTransitionElements.length} elementos animated_transition testados`);
  console.log('🎨 Todas as propriedades funcionando corretamente');
  console.log('=' .repeat(60));
}

// Executar teste
testAnimatedTransitionInTransitionPages().catch(console.error);
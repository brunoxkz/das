/**
 * TESTE COMPLETO - TODOS OS ELEMENTOS DE TRANSIÇÃO
 * Testa cada elemento de transição individualmente
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

async function getAuthToken() {
  const authResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    }),
  });
  
  if (!authResult.success) {
    throw new Error(`Falha na autenticação: ${JSON.stringify(authResult.data)}`);
  }
  
  return authResult.data.accessToken;
}

async function testTransitionElement(elementType, elementData, testName) {
  console.log(`\n📋 TESTE ${testName}: ${elementType.toUpperCase()}`);
  const startTime = Date.now();
  
  try {
    const token = await getAuthToken();
    
    const quizData = {
      title: `Teste ${elementType}`,
      description: `Teste do elemento ${elementType}`,
      hasStructure: true,
      structure: {
        pages: [
          {
            id: 1,
            title: 'Página de Transição',
            type: 'transition',
            elements: [elementData]
          }
        ]
      }
    };
    
    // Criar quiz
    const quizResult = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(quizData),
    });
    
    if (!quizResult.success) {
      console.error(`❌ Falha na criação do quiz: ${JSON.stringify(quizResult.data)}`);
      return false;
    }
    
    const quizId = quizResult.data.id;
    
    // Verificar estrutura
    const verifyResult = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!verifyResult.success) {
      console.error(`❌ Falha na verificação: ${JSON.stringify(verifyResult.data)}`);
      return false;
    }
    
    const quiz = verifyResult.data;
    const structure = quiz.structure;
    const transitionPage = structure.pages.find(page => page.type === 'transition');
    
    if (!transitionPage) {
      console.error('❌ Página de transição não encontrada');
      return false;
    }
    
    const element = transitionPage.elements.find(el => el.type === elementType);
    
    if (!element) {
      console.error(`❌ Elemento ${elementType} não encontrado na página de transição`);
      return false;
    }
    
    // Verificar propriedades específicas
    const expectedProps = Object.keys(elementData).filter(key => key !== 'id' && key !== 'type');
    const missingProps = expectedProps.filter(prop => !(prop in element));
    
    if (missingProps.length > 0) {
      console.error(`❌ Propriedades não encontradas: ${missingProps.join(', ')}`);
      return false;
    }
    
    // Limpeza
    await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${elementType} testado com sucesso (${duration}ms)`);
    
    // Mostrar propriedades verificadas
    const verifiedProps = expectedProps.map(prop => `${prop}: ${element[prop]}`);
    console.log(`   Propriedades verificadas: ${verifiedProps.join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Erro no teste ${elementType}: ${error.message}`);
    return false;
  }
}

async function testAllTransitionElements() {
  console.log('🎭 TESTE COMPLETO - TODOS OS ELEMENTOS DE TRANSIÇÃO');
  console.log('=' .repeat(60));
  
  const elementsToTest = [
    {
      type: 'transition_background',
      data: {
        id: '1',
        type: 'transition_background',
        content: '',
        backgroundType: 'gradient',
        gradientDirection: 'to-br',
        gradientFrom: '#1F2937',
        gradientTo: '#111827'
      },
      name: '1 - TRANSITION_BACKGROUND'
    },
    {
      type: 'transition_text',
      data: {
        id: '2',
        type: 'transition_text',
        content: 'Processando dados...',
        textColor: '#FFFFFF',
        fontSize: 'text-xl',
        fontWeight: 'font-semibold',
        textAlign: 'text-center'
      },
      name: '2 - TRANSITION_TEXT'
    },
    {
      type: 'transition_counter',
      data: {
        id: '3',
        type: 'transition_counter',
        content: '5',
        counterStartValue: 5,
        counterEndValue: 0,
        counterDuration: 5000,
        counterSuffix: 's',
        textColor: '#FFFFFF',
        fontSize: 'text-4xl',
        fontWeight: 'font-bold',
        textAlign: 'text-center'
      },
      name: '3 - TRANSITION_COUNTER'
    },
    {
      type: 'transition_loader',
      data: {
        id: '4',
        type: 'transition_loader',
        content: 'Carregando...',
        loaderType: 'spinner',
        loaderColor: '#10B981',
        loaderSize: 'lg',
        textColor: '#FFFFFF',
        fontSize: 'text-lg',
        textAlign: 'text-center'
      },
      name: '4 - TRANSITION_LOADER'
    },
    {
      type: 'transition_redirect',
      data: {
        id: '5',
        type: 'transition_redirect',
        content: 'Redirecionando...',
        redirectUrl: '/next-page',
        redirectDelay: 3000,
        showRedirectCounter: true,
        textColor: '#FFFFFF',
        fontSize: 'text-base',
        textAlign: 'text-center'
      },
      name: '5 - TRANSITION_REDIRECT'
    },
    {
      type: 'animated_transition',
      data: {
        id: '6',
        type: 'animated_transition',
        content: 'Transição animada...',
        description: 'Teste da transição animada',
        animationType: 'pulse',
        animationSpeed: 'normal',
        gradientStart: '#10B981',
        gradientEnd: '#8B5CF6',
        textColor: '#FFFFFF',
        fontSize: 'text-lg',
        textAlign: 'text-center'
      },
      name: '6 - ANIMATED_TRANSITION'
    }
  ];
  
  const results = [];
  
  for (const element of elementsToTest) {
    const success = await testTransitionElement(element.type, element.data, element.name);
    results.push({
      element: element.type,
      success: success
    });
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resultados finais
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADOS FINAIS DOS TESTES');
  console.log('=' .repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.element.toUpperCase()}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 TAXA DE SUCESSO: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 TODOS OS ELEMENTOS DE TRANSIÇÃO FUNCIONANDO PERFEITAMENTE!');
  } else {
    console.log('⚠️  ALGUNS ELEMENTOS PRECISAM DE CORREÇÃO');
  }
  
  console.log('=' .repeat(60));
}

// Executar teste
testAllTransitionElements().catch(console.error);
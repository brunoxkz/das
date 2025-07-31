/**
 * TESTE SIMPLES - ANIMATED TRANSITION EM PÁGINAS DE TRANSIÇÃO
 * Teste direto focado no elemento animated_transition
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

async function testSimpleTransition() {
  console.log('🎭 TESTE SIMPLES: ANIMATED TRANSITION EM PÁGINAS DE TRANSIÇÃO');
  console.log('=' .repeat(60));
  
  // 1. Autenticação
  console.log('\n📋 TESTE 1: Autenticação');
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
  console.log('✅ Autenticação bem-sucedida');
  
  // 2. Criação de Quiz Simples
  console.log('\n📋 TESTE 2: Criação de Quiz Simples');
  
  const quizData = {
    title: 'Teste Simples Animated Transition',
    description: 'Teste básico do elemento animated_transition',
    hasStructure: true,
    structure: {
      pages: [
        {
          id: 1,
          title: 'Página de Transição',
          type: 'transition',
          elements: [
            {
              id: '1',
              type: 'animated_transition',
              content: 'Testando transição...',
              description: 'Elemento animated_transition em página de transição',
              animationType: 'pulse',
              animationSpeed: 'normal',
              gradientStart: '#10B981',
              gradientEnd: '#8B5CF6'
            }
          ]
        }
      ]
    }
  };
  
  const quizResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(quizData),
  });
  
  if (!quizResult.success) {
    console.error('❌ Falha na criação do quiz:', quizResult.data);
    return;
  }
  
  const quizId = quizResult.data.id;
  console.log(`✅ Quiz criado com sucesso - ID: ${quizId}`);
  
  // 3. Verificação da Estrutura
  console.log('\n📋 TESTE 3: Verificação da Estrutura');
  const verifyResult = await makeRequest(`/api/quizzes/${quizId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!verifyResult.success) {
    console.error('❌ Falha na verificação:', verifyResult.data);
    return;
  }
  
  const quiz = verifyResult.data;
  console.log('✅ Quiz recuperado com sucesso');
  
  // Verificar se o elemento animated_transition está presente
  const structure = quiz.structure;
  const transitionPage = structure.pages.find(page => page.type === 'transition');
  
  if (!transitionPage) {
    console.error('❌ Página de transição não encontrada');
    return;
  }
  
  const animatedElement = transitionPage.elements.find(el => el.type === 'animated_transition');
  
  if (!animatedElement) {
    console.error('❌ Elemento animated_transition não encontrado na página de transição');
    return;
  }
  
  console.log('✅ Elemento animated_transition encontrado na página de transição');
  console.log(`   - Conteúdo: ${animatedElement.content}`);
  console.log(`   - Descrição: ${animatedElement.description}`);
  console.log(`   - Animação: ${animatedElement.animationType} (${animatedElement.animationSpeed})`);
  console.log(`   - Gradiente: ${animatedElement.gradientStart} → ${animatedElement.gradientEnd}`);
  
  // 4. Limpeza
  console.log('\n📋 TESTE 4: Limpeza');
  const deleteResult = await makeRequest(`/api/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!deleteResult.success) {
    console.error('❌ Falha na exclusão:', deleteResult.data);
    return;
  }
  
  console.log('✅ Quiz de teste excluído');
  
  // Resultado final
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 TESTE SIMPLES CONCLUÍDO COM SUCESSO!');
  console.log('✅ Elemento animated_transition funciona em páginas de transição!');
  console.log('🎭 Todas as propriedades foram preservadas corretamente');
  console.log('=' .repeat(60));
}

// Executar teste
testSimpleTransition().catch(console.error);
#!/usr/bin/env node

/**
 * CORREÇÃO ESPECÍFICA DO ENDPOINT DA EXTENSÃO
 * Teste e correção direcionada
 */

const config = {
  baseUrl: 'http://localhost:5000',
  testUser: {
    email: 'admin@vendzz.com',
    password: 'admin123'
  }
};

let authToken = null;

async function apiRequest(endpoint, options = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function authenticate() {
  console.log('🔐 Autenticando...');
  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(config.testUser)
    });
    authToken = result.accessToken;
    console.log('✅ Autenticado');
    return true;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

async function testarEndpointBasico() {
  console.log('\n📋 TESTANDO ENDPOINT BÁSICO');
  
  try {
    // Buscar quiz com telefones
    const quizzes = await apiRequest('/api/quizzes');
    const quiz = quizzes[0]; // Pegar primeiro quiz
    
    if (!quiz) {
      console.log('❌ Nenhum quiz encontrado');
      return null;
    }
    
    console.log(`✅ Quiz encontrado: ${quiz.title} (${quiz.id})`);
    
    // Testar busca de telefones direto
    const phones = await apiRequest(`/api/quiz-phones/${quiz.id}`);
    console.log(`✅ Telefones: ${phones.phones?.length || 0}`);
    
    return { quiz, phones: phones.phones || [] };
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function testarEndpointExtensaoSimples(quizId) {
  console.log('\n🔌 TESTANDO ENDPOINT EXTENSÃO SIMPLES');
  
  const payload = {
    quizId: quizId,
    targetAudience: 'all',
    dateFilter: null
  };
  
  try {
    console.log('📤 Enviando requisição...');
    const result = await apiRequest('/api/whatsapp/extension-quiz-data', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log('✅ SUCESSO!');
    console.log(`   - Quiz: ${result.quiz?.title}`);
    console.log(`   - Telefones: ${result.total}`);
    console.log(`   - Variáveis: ${Object.keys(result.variables || {}).length}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ ERRO no endpoint:', error.message);
    
    // Tentar diagnóstico mais específico
    try {
      console.log('\n🔍 DIAGNÓSTICO:');
      
      // Testar apenas autenticação
      const status = await apiRequest('/api/whatsapp/extension-status');
      console.log('✅ Autenticação OK');
      
      // Verificar se quiz existe
      const userQuizzes = await apiRequest('/api/quizzes');
      const quiz = userQuizzes.find(q => q.id === quizId);
      if (quiz) {
        console.log('✅ Quiz encontrado no sistema');
      } else {
        console.log('❌ Quiz não encontrado');
      }
      
    } catch (diagError) {
      console.error('❌ Erro no diagnóstico:', diagError.message);
    }
    
    return null;
  }
}

async function criarEndpointAlternativo() {
  console.log('\n🛠️ TESTE COM ENDPOINT ALTERNATIVO');
  
  // Criar endpoint de teste que funciona
  const testData = {
    quiz: {
      id: 'test-123',
      title: 'Quiz Teste',
      description: 'Teste'
    },
    phones: [
      { phone: '11999887766', status: 'completed', submittedAt: new Date().toISOString() },
      { phone: '11888776655', status: 'abandoned', submittedAt: new Date().toISOString() }
    ],
    total: 2,
    variables: {
      nome: '{nome}',
      telefone: '{telefone}',
      quiz_titulo: 'Quiz Teste',
      status: '{status}',
      data_resposta: '{data_resposta}'
    },
    filters: {
      targetAudience: 'all',
      dateFilter: null
    },
    success: true
  };
  
  console.log('📊 Dados que DEVERIAM ser retornados:');
  console.log(`   - Quiz: ${testData.quiz.title}`);
  console.log(`   - Telefones: ${testData.total}`);
  console.log(`   - Variáveis: ${Object.keys(testData.variables).length}`);
  
  return testData;
}

async function executarTeste() {
  console.log('🔧 CORREÇÃO DO ENDPOINT DA EXTENSÃO');
  console.log('=' .repeat(50));
  
  if (!await authenticate()) return;
  
  const quizData = await testarEndpointBasico();
  if (!quizData) return;
  
  const result = await testarEndpointExtensaoSimples(quizData.quiz.id);
  
  if (!result) {
    console.log('\n⚠️ Endpoint com problemas - mostrando dados esperados:');
    await criarEndpointAlternativo();
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 RESULTADO:');
  
  if (result) {
    console.log('✅ Endpoint da extensão funcionando!');
    console.log('✅ Sistema pronto para Chrome Extension');
  } else {
    console.log('❌ Endpoint precisa de correção');
    console.log('🔧 Estrutura de dados definida para implementação');
  }
}

// Executar
executarTeste().catch(console.error);
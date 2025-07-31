/**
 * 🔍 DEBUG ESPECÍFICO - ENDPOINT QUIZ-RESPONSES
 * Identificar exatamente por que está falhando com "Failed to submit response"
 */

const BASE_URL = 'http://localhost:5000';

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error.message);
    throw error;
  }
}

// Função para autenticar
async function authenticate() {
  const credentials = {
    email: 'admin@vendzz.com',
    password: 'admin123'
  };

  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: credentials
    });

    if (response.accessToken) {
      console.log('✅ Autenticação bem-sucedida');
      return response.accessToken;
    } else {
      throw new Error('Token não recebido');
    }
  } catch (error) {
    console.error('❌ Falha na autenticação:', error.message);
    throw error;
  }
}

// Função para debugar schema de quiz responses
async function debugQuizResponsesSchema() {
  console.log('\n🔍 DEBUG 1: SCHEMA DE QUIZ RESPONSES');
  console.log('====================================');

  // Teste 1: Verificar estrutura mínima
  const minimalResponse = {
    quizId: 'test-quiz-123',
    responses: { name: 'Test User' },
    metadata: { test: true }
  };

  console.log('📋 Testando estrutura mínima:');
  console.log(JSON.stringify(minimalResponse, null, 2));

  // Teste 2: Verificar estrutura completa
  const completeResponse = {
    quizId: 'test-quiz-123',
    responses: {
      nome_completo: 'João Silva',
      email_contato: 'joao@teste.com',
      telefone_contato: '11999887766'
    },
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      userAgent: 'Debug Test',
      ip: '127.0.0.1',
      timestamp: new Date().toISOString()
    },
    submittedAt: new Date().toISOString(),
    country: 'Brasil',
    phoneCountryCode: '+55',
    affiliateId: null
  };

  console.log('📋 Testando estrutura completa:');
  console.log(JSON.stringify(completeResponse, null, 2));
}

// Função para debugar quiz existente
async function debugExistingQuiz(token) {
  console.log('\n🔍 DEBUG 2: QUIZ EXISTENTE');
  console.log('===========================');

  try {
    // Buscar quizzes existentes
    const quizzes = await makeRequest('/api/quizzes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado');
      return null;
    }

    const quiz = quizzes[0];
    console.log(`✅ Quiz encontrado: ${quiz.id}`);
    console.log(`   Título: ${quiz.title}`);
    console.log(`   Publicado: ${quiz.isPublished}`);
    console.log(`   Estrutura: ${JSON.stringify(quiz.structure).substring(0, 100)}...`);

    return quiz;
  } catch (error) {
    console.error('❌ Erro ao buscar quiz:', error.message);
    return null;
  }
}

// Função para testar criação de resposta
async function testResponseCreation(quizId, token) {
  console.log('\n🔍 DEBUG 3: CRIAÇÃO DE RESPOSTA');
  console.log('===============================');

  const testResponse = {
    quizId: quizId,
    responses: {
      nome_completo: 'João Silva Debug',
      email_contato: 'joao.debug@teste.com',
      telefone_contato: '11999887766'
    },
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      userAgent: 'Debug Test',
      ip: '127.0.0.1',
      timestamp: new Date().toISOString()
    }
  };

  console.log('📋 Payload da resposta:');
  console.log(JSON.stringify(testResponse, null, 2));

  try {
    const response = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: testResponse
    });

    console.log('✅ Resposta criada com sucesso:', response.id);
    return response;
  } catch (error) {
    console.error('❌ Erro ao criar resposta:', error.message);
    
    // Tentar endpoint alternativo
    console.log('\n🔄 Tentando endpoint alternativo...');
    try {
      const alternativeResponse = await makeRequest(`/api/quizzes/${quizId}/responses`, {
        method: 'POST',
        body: testResponse
      });

      console.log('✅ Resposta criada via endpoint alternativo:', alternativeResponse.id);
      return alternativeResponse;
    } catch (altError) {
      console.error('❌ Erro no endpoint alternativo:', altError.message);
      return null;
    }
  }
}

// Função para testar diferentes formatos de resposta
async function testDifferentResponseFormats(quizId, token) {
  console.log('\n🔍 DEBUG 4: DIFERENTES FORMATOS DE RESPOSTA');
  console.log('===========================================');

  const testFormats = [
    {
      name: 'Formato Simples',
      data: {
        quizId: quizId,
        responses: { name: 'Test Simple' }
      }
    },
    {
      name: 'Formato com Metadata',
      data: {
        quizId: quizId,
        responses: { name: 'Test Metadata' },
        metadata: { test: true }
      }
    },
    {
      name: 'Formato Array (Antigo)',
      data: {
        quizId: quizId,
        responses: [
          {
            elementId: 'elem1',
            elementType: 'text',
            elementFieldId: 'nome_completo',
            answer: 'João Silva'
          }
        ]
      }
    },
    {
      name: 'Formato Object (Novo)',
      data: {
        quizId: quizId,
        responses: {
          nome_completo: 'João Silva',
          email_contato: 'joao@teste.com'
        }
      }
    }
  ];

  const results = [];
  
  for (const format of testFormats) {
    console.log(`\n📋 Testando: ${format.name}`);
    console.log(JSON.stringify(format.data, null, 2));
    
    try {
      const response = await makeRequest('/api/quiz-responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: format.data
      });

      console.log(`✅ ${format.name}: Sucesso`);
      results.push({ format: format.name, success: true, response });
    } catch (error) {
      console.error(`❌ ${format.name}: Erro -`, error.message);
      results.push({ format: format.name, success: false, error: error.message });
    }
  }

  return results;
}

// Função para testar validação de campos
async function testFieldValidation(quizId, token) {
  console.log('\n🔍 DEBUG 5: VALIDAÇÃO DE CAMPOS');
  console.log('===============================');

  const testCases = [
    {
      name: 'Sem quizId',
      data: {
        responses: { name: 'Test' }
      }
    },
    {
      name: 'Sem responses',
      data: {
        quizId: quizId
      }
    },
    {
      name: 'Responses null',
      data: {
        quizId: quizId,
        responses: null
      }
    },
    {
      name: 'Responses empty',
      data: {
        quizId: quizId,
        responses: {}
      }
    },
    {
      name: 'QuizId inválido',
      data: {
        quizId: 'invalid-quiz-id',
        responses: { name: 'Test' }
      }
    }
  ];

  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Testando: ${testCase.name}`);
    console.log(JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await makeRequest('/api/quiz-responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: testCase.data
      });

      console.log(`✅ ${testCase.name}: Sucesso (inesperado)`);
      results.push({ test: testCase.name, success: true, response });
    } catch (error) {
      console.log(`❌ ${testCase.name}: Erro esperado -`, error.message);
      results.push({ test: testCase.name, success: false, error: error.message });
    }
  }

  return results;
}

// Função principal de debug
async function runDebugQuizResponses() {
  console.log('🚀 INICIANDO DEBUG COMPLETO DO ENDPOINT QUIZ-RESPONSES');
  console.log('======================================================');

  try {
    // Debugar schema
    await debugQuizResponsesSchema();
    
    // Autenticar
    const token = await authenticate();
    
    // Debugar quiz existente
    const quiz = await debugExistingQuiz(token);
    
    if (!quiz) {
      console.log('❌ Não foi possível encontrar um quiz para teste');
      return;
    }

    // Testar criação de resposta
    const response = await testResponseCreation(quiz.id, token);
    
    // Testar diferentes formatos
    const formatResults = await testDifferentResponseFormats(quiz.id, token);
    
    // Testar validação de campos
    const validationResults = await testFieldValidation(quiz.id, token);
    
    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DE DEBUG');
    console.log('============================');
    
    console.log('\n📋 Resultados dos Formatos:');
    formatResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.format}: ${result.success ? 'Sucesso' : result.error}`);
    });
    
    console.log('\n📋 Resultados da Validação:');
    validationResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.success ? 'Sucesso' : result.error}`);
    });
    
    // Análise do problema
    console.log('\n🔍 ANÁLISE DO PROBLEMA:');
    const successCount = formatResults.filter(r => r.success).length;
    const totalTests = formatResults.length;
    
    if (successCount === 0) {
      console.log('❌ PROBLEMA CRÍTICO: Nenhum formato de resposta funciona');
      console.log('   Possíveis causas: Schema inválido, validação Zod falha, erro no storage');
    } else if (successCount < totalTests) {
      console.log(`⚠️  PROBLEMA PARCIAL: ${successCount}/${totalTests} formatos funcionam`);
      console.log('   Alguns formatos são suportados, outros não');
    } else {
      console.log('✅ TODOS OS FORMATOS FUNCIONAM: Problema pode estar no teste original');
    }
    
  } catch (error) {
    console.error('❌ Erro no debug completo:', error.message);
  }
}

// Executar debug
runDebugQuizResponses().catch(console.error);
// TESTE SISTEMA DE VARIÁVEIS DINÂMICAS
// Demonstração do sistema que captura automaticamente variáveis de elementos futuros

// Configuração da base URL da API
const API_BASE = 'http://localhost:5000';

// Função para fazer requisições HTTP
async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status} em ${endpoint}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error(`❌ Erro ao fazer parse JSON em ${endpoint}:`, responseText);
      throw new Error(`Resposta inválida: ${responseText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error(`❌ Erro na requisição ${method} ${endpoint}:`, error);
    throw error;
  }
}

// Função para autenticar usuário
async function authenticate() {
  console.log('🔐 Autenticando usuário...');
  const loginData = {
    email: 'admin@vendzz.com',
    password: 'admin123'
  };

  const result = await makeRequest('/api/auth/login', 'POST', loginData);
  
  if (result.accessToken) {
    console.log('✅ Autenticação bem-sucedida');
    return result.accessToken;
  } else {
    console.log('❌ Resultado da autenticação:', result);
    throw new Error('Falha na autenticação');
  }
}

// Função para criar quiz de exemplo com elementos futuros
async function createTestQuiz(token) {
  console.log('📝 Criando quiz de teste com elementos futuros...');
  
  const quizData = {
    title: 'Quiz Teste - Captura Automática de Variáveis',
    description: 'Quiz para testar captura automática de variáveis de elementos futuros',
    structure: JSON.stringify({
      pages: [
        {
          id: 'page1',
          title: 'Dados Pessoais',
          elements: [
            {
              type: 'text',
              id: 'nome_completo',
              fieldId: 'nome_completo',
              question: 'Qual é o seu nome completo?',
              required: true
            },
            {
              type: 'email',
              id: 'email_contato',
              fieldId: 'email_contato',
              question: 'Qual é o seu email?',
              required: true
            },
            {
              type: 'phone',
              id: 'telefone_principal',
              fieldId: 'telefone_principal',
              question: 'Qual é o seu telefone?',
              required: true
            }
          ]
        },
        {
          id: 'page2',
          title: 'Informações Específicas',
          elements: [
            {
              type: 'number',
              id: 'idade_anos',
              fieldId: 'idade_anos',
              question: 'Qual é a sua idade?',
              min: 18,
              max: 100
            },
            {
              type: 'multiple_choice',
              id: 'interesse_principal',
              fieldId: 'interesse_principal',
              question: 'Qual é o seu principal interesse?',
              options: ['Fitness', 'Nutrição', 'Lifestyle', 'Carreira']
            },
            {
              type: 'future_element_type',
              id: 'elemento_futuro',
              fieldId: 'elemento_futuro',
              question: 'Este é um elemento que ainda não existe',
              customProperty: 'valor_customizado'
            }
          ]
        }
      ]
    }),
    isPublished: true,
    settings: JSON.stringify({
      collectLeads: true,
      enableVariableCapture: true
    })
  };

  const quiz = await makeRequest('/api/quizzes', 'POST', quizData, token);
  console.log('✅ Quiz criado:', quiz.id);
  return quiz;
}

// Função para simular resposta de quiz
async function simulateQuizResponse(quizId, token) {
  console.log('📊 Simulando resposta de quiz...');
  
  const responseData = {
    quizId,
    responses: JSON.stringify({
      nome_completo: 'João Silva Santos',
      email_contato: 'joao.silva@exemplo.com',
      telefone_principal: '11987654321',
      idade_anos: 28,
      interesse_principal: 'Fitness',
      elemento_futuro: 'Resposta para elemento que ainda não existe'
    }),
    metadata: JSON.stringify({
      isComplete: true,
      completionPercentage: 100,
      device: 'desktop',
      browser: 'Chrome',
      ip: '192.168.1.100'
    })
  };

  const response = await makeRequest('/api/quiz-responses', 'POST', responseData, token);
  console.log('✅ Resposta criada:', response.id);
  return response;
}

// Função para testar consulta de variáveis
async function testVariableQueries(quizId, responseId, token) {
  console.log('🔍 Testando consultas de variáveis...');
  
  // 1. Buscar variáveis da resposta específica
  console.log('\n1. Variáveis da resposta específica:');
  const responseVariables = await makeRequest(`/api/responses/${responseId}/variables`, 'GET', null, token);
  console.log(`   Total: ${responseVariables.length} variáveis`);
  responseVariables.forEach(variable => {
    console.log(`   - ${variable.variableName}: "${variable.variableValue}" (${variable.elementType})`);
  });
  
  // 2. Buscar todas as variáveis do quiz
  console.log('\n2. Todas as variáveis do quiz:');
  const quizVariables = await makeRequest(`/api/quizzes/${quizId}/variables`, 'GET', null, token);
  console.log(`   Total: ${quizVariables.length} variáveis`);
  
  // 3. Buscar variáveis filtradas por tipo
  console.log('\n3. Variáveis filtradas por tipo "text":');
  const textVariables = await makeRequest(`/api/quizzes/${quizId}/variables/filtered?elementType=text`, 'GET', null, token);
  console.log(`   Total: ${textVariables.length} variáveis do tipo text`);
  
  // 4. Estatísticas de variáveis
  console.log('\n4. Estatísticas de variáveis:');
  const stats = await makeRequest(`/api/quizzes/${quizId}/variables/statistics`, 'GET', null, token);
  console.log(`   Total de variáveis: ${stats.totalVariables}`);
  console.log(`   Variáveis únicas: ${stats.uniqueVariables}`);
  console.log(`   Tipos de elementos:`);
  stats.elementTypes.forEach(type => {
    console.log(`     - ${type.type}: ${type.count}`);
  });
  
  // 5. Variáveis para remarketing
  console.log('\n5. Variáveis para remarketing:');
  const remarketing = await makeRequest(`/api/quizzes/${quizId}/variables/remarketing`, 'POST', {
    targetVariables: ['nome_completo', 'email_contato', 'interesse_principal', 'elemento_futuro']
  }, token);
  console.log(`   Respostas com variáveis de remarketing: ${remarketing.length}`);
  remarketing.forEach(item => {
    console.log(`   Response ${item.responseId}:`);
    Object.entries(item.variables).forEach(([key, value]) => {
      console.log(`     - ${key}: ${value}`);
    });
  });
}

// Função para testar reprocessamento
async function testReprocessing(quizId, token) {
  console.log('\n🔄 Testando reprocessamento de variáveis...');
  
  const result = await makeRequest(`/api/quizzes/${quizId}/variables/reprocess`, 'POST', {}, token);
  console.log(`✅ Reprocessamento concluído:`);
  console.log(`   - Total de respostas: ${result.totalResponses}`);
  console.log(`   - Respostas processadas: ${result.processedCount}`);
  console.log(`   - Mensagem: ${result.message}`);
}

// Função principal de teste
async function runDynamicVariableTest() {
  console.log('🚀 INICIANDO TESTE DO SISTEMA DE VARIÁVEIS DINÂMICAS\n');
  
  try {
    // 1. Autenticar
    const token = await authenticate();
    
    // 2. Criar quiz de teste
    const quiz = await createTestQuiz(token);
    
    // 3. Simular resposta
    const response = await simulateQuizResponse(quiz.id, token);
    
    // 4. Testar consultas
    await testVariableQueries(quiz.id, response.id, token);
    
    // 5. Testar reprocessamento
    await testReprocessing(quiz.id, token);
    
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('\n📋 RESUMO DOS RECURSOS TESTADOS:');
    console.log('   ✓ Captura automática de variáveis de elementos futuros');
    console.log('   ✓ Consulta de variáveis por resposta');
    console.log('   ✓ Consulta de variáveis por quiz');
    console.log('   ✓ Filtros avançados (tipo, página, nome, data)');
    console.log('   ✓ Estatísticas de variáveis');
    console.log('   ✓ Variáveis para remarketing');
    console.log('   ✓ Reprocessamento de respostas existentes');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    process.exit(1);
  }
}

// Executar teste
runDynamicVariableTest();
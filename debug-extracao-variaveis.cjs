/**
 * DEBUG ESPECÍFICO - Sistema de Extração de Variáveis
 * Investiga por que as variáveis não estão sendo extraídas corretamente
 */

const fetch = globalThis.fetch;
const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

async function authenticate() {
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (loginResult.success && (loginResult.data.token || loginResult.data.accessToken)) {
    authToken = loginResult.data.token || loginResult.data.accessToken;
    return true;
  }
  return false;
}

async function debugExtracaoVariaveis() {
  console.log('🔍 DEBUG ESPECÍFICO - EXTRAÇÃO DE VARIÁVEIS');
  console.log('='.repeat(60));

  if (!(await authenticate())) {
    console.log('❌ Falha na autenticação');
    return;
  }

  // 1. Criar quiz simples com elementos que têm fieldId
  console.log('\n1️⃣ CRIANDO QUIZ SIMPLES PARA TESTE');
  
  const testQuiz = {
    title: 'Debug Extração Variáveis',
    description: 'Quiz para testar extração de variáveis',
    structure: {
      pages: [
        {
          id: 'page1',
          name: 'Página de Teste',
          elements: [
            {
              id: 'nome_teste',
              type: 'text',
              question: 'Qual é o seu nome?',
              required: true,
              fieldId: 'nome_completo'
            },
            {
              id: 'email_teste',
              type: 'email',
              question: 'Qual é o seu email?',
              required: true,
              fieldId: 'email_contato'
            },
            {
              id: 'idade_teste',
              type: 'multiple_choice',
              question: 'Qual é sua faixa etária?',
              options: [
                { id: 'young', text: '18-25 anos' },
                { id: 'adult', text: '26-40 anos' }
              ],
              required: true,
              fieldId: 'faixa_etaria'
            }
          ]
        }
      ]
    }
  };
  
  const createResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(testQuiz)
  });
  
  if (!createResult.success) {
    console.log('❌ Falha ao criar quiz:', createResult.error);
    return;
  }
  
  const quizId = createResult.data.id;
  console.log(`✅ Quiz criado: ${quizId}`);
  
  // 2. Publicar quiz
  console.log('\n2️⃣ PUBLICANDO QUIZ');
  
  const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
    method: 'POST'
  });
  
  if (!publishResult.success) {
    console.log('❌ Falha ao publicar quiz:', publishResult.error);
    return;
  }
  
  console.log('✅ Quiz publicado');
  
  // 3. Criar resposta com dados específicos
  console.log('\n3️⃣ CRIANDO RESPOSTA COM DADOS ESPECÍFICOS');
  
  const responseData = {
    responses: {
      nome_completo: 'João da Silva Debug',
      email_contato: 'joao.debug@teste.com',
      faixa_etaria: 'adult'
    },
    metadata: {
      isComplete: true,
      isPartial: false,
      completionPercentage: 100
    }
  };
  
  const responseResult = await makeRequest(`/api/quizzes/${quizId}/responses`, {
    method: 'POST',
    body: JSON.stringify(responseData)
  });
  
  if (!responseResult.success) {
    console.log('❌ Falha ao criar resposta:', responseResult.error);
    return;
  }
  
  const responseId = responseResult.data.id;
  console.log(`✅ Resposta criada: ${responseId}`);
  
  // 4. Aguardar um pouco para extração automática
  console.log('\n4️⃣ AGUARDANDO EXTRAÇÃO AUTOMÁTICA (2 segundos)');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 5. Verificar variáveis extraídas
  console.log('\n5️⃣ VERIFICANDO VARIÁVEIS EXTRAÍDAS');
  
  const variablesResult = await makeRequest(`/api/quizzes/${quizId}/variables`);
  
  if (!variablesResult.success) {
    console.log('❌ Falha ao buscar variáveis:', variablesResult.error);
  } else {
    console.log('📊 Variáveis encontradas:', variablesResult.data.length);
    variablesResult.data.forEach((variable, index) => {
      console.log(`   ${index + 1}. ${variable.name} (${variable.type})`);
    });
  }
  
  // 6. Verificar diretamente na tabela responseVariables
  console.log('\n6️⃣ VERIFICANDO RESPOSTA ESPECÍFICA');
  
  const responseVarsResult = await makeRequest(`/api/responses/${responseId}/variables`);
  
  if (!responseVarsResult.success) {
    console.log('❌ Falha ao buscar variáveis da resposta:', responseVarsResult.error);
  } else {
    console.log('📊 Variáveis da resposta:', responseVarsResult.data.length);
    responseVarsResult.data.forEach((variable, index) => {
      console.log(`   ${index + 1}. ${variable.variableName} = "${variable.variableValue}" (${variable.elementType})`);
    });
  }
  
  // 7. Verificar estrutura do quiz
  console.log('\n7️⃣ VERIFICANDO ESTRUTURA DO QUIZ');
  
  const quizResult = await makeRequest(`/api/quizzes/${quizId}`);
  
  if (quizResult.success) {
    const structure = quizResult.data.structure;
    console.log('📋 Estrutura do quiz:');
    if (structure.pages) {
      structure.pages.forEach((page, pageIndex) => {
        console.log(`   Página ${pageIndex + 1}: ${page.name}`);
        if (page.elements) {
          page.elements.forEach((element, elementIndex) => {
            console.log(`     Elemento ${elementIndex + 1}: ${element.type} - fieldId: ${element.fieldId || 'NONE'}`);
          });
        }
      });
    }
  }
  
  // 8. Verificar dados da resposta
  console.log('\n8️⃣ VERIFICANDO DADOS DA RESPOSTA');
  
  const allResponsesResult = await makeRequest(`/api/quizzes/${quizId}/responses`);
  
  if (allResponsesResult.success && allResponsesResult.data.length > 0) {
    const response = allResponsesResult.data[0];
    console.log('📝 Dados da resposta:');
    console.log(`   ID: ${response.id}`);
    console.log(`   Responses:`, typeof response.responses, response.responses);
    console.log(`   Metadata:`, typeof response.metadata, response.metadata);
  }
  
  // Limpar quiz após testes
  await makeRequest(`/api/quizzes/${quizId}`, { method: 'DELETE' });
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DEBUG EXTRAÇÃO DE VARIÁVEIS CONCLUÍDO');
}

// Executar debug
debugExtracaoVariaveis().catch(console.error);
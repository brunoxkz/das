/**
 * INVESTIGAÇÃO DO PROBLEMA DO RESPONSE ID
 * Script para testar exatamente o que está acontecendo com o ID das respostas
 */

const BASE_URL = 'http://localhost:5000';
let authToken = null;
let testQuizId = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  let data = null;
  
  try {
    data = await response.json();
  } catch (e) {
    console.log('Resposta não é JSON:', response.status, response.statusText);
  }

  return { response, data };
}

async function authenticate() {
  console.log('🔐 Autenticando...');
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });

  if (response.ok && (data.token || data.accessToken)) {
    authToken = data.token || data.accessToken;
    console.log('✅ Login realizado com sucesso');
    return true;
  } else {
    console.log('❌ Falha no login:', data);
    return false;
  }
}

async function createTestQuiz() {
  console.log('\n📝 Criando quiz de teste...');
  
  const quizData = {
    title: `Test Quiz ${Date.now()}`,
    description: 'Quiz para teste de response ID',
    structure: {
      pages: [
        {
          id: 'page-1',
          title: 'Página 1',
          elements: [
            {
              id: 'element-1',
              type: 'text',
              content: 'Qual é o seu nome?',
              properties: {
                fieldId: 'nome',
                required: true
              }
            },
            {
              id: 'element-2',
              type: 'email',
              content: 'Qual é o seu email?',
              properties: {
                fieldId: 'email',
                required: true
              }
            }
          ]
        }
      ]
    }
  };

  const { response, data } = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });

  if (response.ok && data.id) {
    testQuizId = data.id;
    console.log('✅ Quiz criado:', testQuizId);
    
    // Publicar o quiz imediatamente
    console.log('📖 Publicando quiz...');
    const { response: pubResponse, data: pubData } = await makeRequest(`/api/quizzes/${testQuizId}/publish`, {
      method: 'POST'
    });
    
    if (pubResponse.ok) {
      console.log('✅ Quiz publicado com sucesso');
    } else {
      console.log('⚠️ Falha ao publicar quiz, mas continuando...');
    }
    
    return true;
  } else {
    console.log('❌ Falha ao criar quiz:', data);
    return false;
  }
}

async function testPartialResponse() {
  console.log('\n💾 Testando resposta parcial...');
  
  const partialData = {
    quizId: testQuizId,
    responses: {
      'nome': 'João Teste'
    },
    metadata: {
      isPartial: true,
      completionPercentage: 50,
      currentPage: 0
    }
  };

  console.log('📤 Enviando dados:', JSON.stringify(partialData, null, 2));

  const { response, data } = await makeRequest(`/api/quizzes/${testQuizId}/partial-responses`, {
    method: 'POST',
    body: JSON.stringify(partialData)
  });

  console.log('📥 Resposta recebida:');
  console.log('  Status:', response.status);
  console.log('  Headers:', Object.fromEntries(response.headers.entries()));
  console.log('  Data:', JSON.stringify(data, null, 2));
  console.log('  Response ID:', data?.responseId);
  console.log('  ID:', data?.id);
  console.log('  Success:', data?.success);

  return data?.responseId || data?.id;
}

async function testCompleteResponse() {
  console.log('\n📝 Testando resposta completa...');
  
  const completeData = {
    quizId: testQuizId,
    responses: {
      'nome': 'João Silva',
      'email': 'joao@teste.com'
    },
    metadata: {
      isComplete: true,
      isPartial: false,
      completionPercentage: 100
    }
  };

  console.log('📤 Enviando dados:', JSON.stringify(completeData, null, 2));

  const { response, data } = await makeRequest(`/api/quizzes/${testQuizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(completeData)
  });

  console.log('📥 Resposta recebida:');
  console.log('  Status:', response.status);
  console.log('  Headers:', Object.fromEntries(response.headers.entries()));
  console.log('  Data:', JSON.stringify(data, null, 2));
  console.log('  Response ID:', data?.responseId);
  console.log('  ID:', data?.id);
  console.log('  Success:', data?.success);

  return data?.responseId || data?.id;
}

async function testResponsesList() {
  console.log('\n📋 Testando listagem de respostas...');
  
  const { response, data } = await makeRequest(`/api/quizzes/${testQuizId}/responses`);

  console.log('📥 Resposta recebida:');
  console.log('  Status:', response.status);
  console.log('  Data type:', typeof data);
  console.log('  Is array:', Array.isArray(data));
  console.log('  Length:', data?.length);
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      console.log(`  Response ${index + 1}:`, {
        id: item.id,
        responses: item.responses,
        metadata: item.metadata
      });
    });
  } else {
    console.log('  Data:', JSON.stringify(data, null, 2));
  }

  return data;
}

async function runInvestigation() {
  console.log('🔍 INVESTIGAÇÃO DO PROBLEMA DO RESPONSE ID');
  console.log('=============================================');

  // Autenticar
  if (!await authenticate()) {
    console.log('❌ Falha na autenticação');
    return;
  }

  // Criar quiz de teste
  if (!await createTestQuiz()) {
    console.log('❌ Falha ao criar quiz');
    return;
  }

  // Testar resposta parcial
  const partialId = await testPartialResponse();
  console.log('\n🔍 Resultado resposta parcial:');
  console.log('  ID retornado:', partialId);
  console.log('  Tipo:', typeof partialId);
  console.log('  Undefined?', partialId === undefined);

  // Testar resposta completa
  const completeId = await testCompleteResponse();
  console.log('\n🔍 Resultado resposta completa:');
  console.log('  ID retornado:', completeId);
  console.log('  Tipo:', typeof completeId);
  console.log('  Undefined?', completeId === undefined);

  // Testar listagem
  const responses = await testResponsesList();
  console.log('\n🔍 Resultado listagem:');
  console.log('  Responses encontradas:', responses?.length || 0);

  // Cleanup
  if (testQuizId) {
    console.log('\n🗑️ Limpando quiz de teste...');
    await makeRequest(`/api/quizzes/${testQuizId}`, { method: 'DELETE' });
  }

  console.log('\n✅ Investigação concluída!');
}

runInvestigation().catch(console.error);
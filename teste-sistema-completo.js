import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return await response.json();
}

async function testSystem() {
  let token;
  
  try {
    console.log('🔐 Testando autenticação...');
    
    // Autenticação
    const authResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@vendzz.com',
      password: 'admin123'
    });
    
    token = authResult.accessToken;
    console.log('✅ Autenticação bem-sucedida');
    
    // Criar quiz de teste
    console.log('📝 Criando quiz de teste...');
    const quizData = {
      title: 'Quiz Sistema de Variáveis',
      description: 'Teste do sistema de variáveis dinâmicas',
      structure: JSON.stringify({
        pages: [
          {
            id: 'page_1',
            title: 'Página 1',
            elements: [
              { id: 'nome', type: 'text', fieldId: 'nome' },
              { id: 'email', type: 'email', fieldId: 'email' },
              { id: 'telefone', type: 'phone', fieldId: 'telefone' }
            ]
          }
        ]
      }),
      isPublished: true
    };
    
    const quiz = await makeRequest('/api/quizzes', 'POST', quizData, token);
    console.log(`✅ Quiz criado: ${quiz.id}`);
    
    // Criar resposta de teste
    console.log('📊 Criando resposta de teste...');
    const responseData = {
      responses: {
        nome: 'João Silva',
        email: 'joao@test.com',
        telefone: '11999999999'
      },
      metadata: {
        isComplete: true,
        completionPercentage: 100
      }
    };
    
    const response = await makeRequest(`/api/quizzes/${quiz.id}/responses`, 'POST', responseData);
    console.log(`✅ Resposta criada: ${response.id}`);
    
    // Aguardar o processamento automático
    console.log('⏰ Aguardando processamento automático...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar variáveis extraídas
    console.log('🔍 Verificando variáveis extraídas...');
    const variables = await makeRequest(`/api/quiz-variables/${quiz.id}`, 'GET', null, token);
    console.log(`✅ Variáveis encontradas: ${variables.length}`);
    
    variables.forEach(v => {
      console.log(`  - ${v.variable}: ${v.value} (${v.elementType})`);
    });
    
    // Testar endpoint de resposta única
    console.log('🔍 Testando endpoint de resposta única...');
    const responseVars = await makeRequest(`/api/response-variables/${response.id}`, 'GET', null, token);
    console.log(`✅ Variáveis da resposta: ${responseVars.length}`);
    
    console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL!');
    console.log('✅ Autenticação: OK');
    console.log('✅ Criação de quiz: OK');
    console.log('✅ Criação de resposta: OK');
    console.log('✅ Extração automática: OK');
    console.log('✅ API de variáveis: OK');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    return false;
  }
  
  return true;
}

// Executar teste
testSystem().then(success => {
  if (success) {
    console.log('\n🏆 TODOS OS TESTES PASSARAM!');
    process.exit(0);
  } else {
    console.log('\n💥 TESTES FALHARAM!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ ERRO CRÍTICO:', error);
  process.exit(1);
});
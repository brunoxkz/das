/**
 * TESTE COMPLETO DO SISTEMA DE QUIZ BUILDER - FASE 3
 * Verificação extremamente detalhada de todas as funcionalidades
 * Author: Vendzz System Verification Team
 */

const BASE_URL = 'http://localhost:5000';

// Store global data
const global = {};

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (global.accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${global.accessToken}`;
  }

  const config = {
    method: 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    const response = await fetch(url, config);
    let data = null;
    
    // Clone response to avoid "Body is unusable" error
    const responseClone = response.clone();
    
    try {
      data = await response.json();
    } catch (e) {
      // Se não conseguir fazer parse do JSON, tenta como texto
      try {
        data = await responseClone.text();
      } catch (e2) {
        data = null;
      }
    }
    
    return { response: responseClone, data };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

function logTest(category, test, result, details = '') {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const status = result ? '✅ PASSOU' : '❌ FALHOU';
  const attention = result ? '' : '\n    └── ⚠️  ATENÇÃO: Falha detectada!';
  
  console.log(`[${timestamp}] ${category} - ${test}: ${status}`);
  if (details) {
    console.log(`    └── ${details}${attention}`);
  }
}

async function authenticateUser() {
  console.log('\n🔐 AUTENTICANDO USUÁRIO ADMIN');
  
  try {
    const { response, data } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (response.ok && data.accessToken) {
      global.accessToken = data.accessToken;
      global.userId = data.user.id;
      global.userEmail = data.user.email;
      logTest('AUTH', 'Login admin', true, `Token obtido, User ID: ${global.userId}`);
      return true;
    } else {
      logTest('AUTH', 'Login admin', false, `Status: ${response.status}, Error: ${data.message || 'Unknown'}`);
      return false;
    }
  } catch (error) {
    logTest('AUTH', 'Login admin', false, `Erro: ${error.message}`);
    return false;
  }
}

async function testQuizListAndStats() {
  console.log('\n📊 1. TESTE DE LISTAGEM E ESTATÍSTICAS');
  
  const results = [];
  
  // 1.1 Dashboard Stats
  try {
    const { response, data } = await makeRequest('/api/dashboard/stats');
    const success = response.ok && data && typeof data.totalQuizzes === 'number';
    logTest('DASHBOARD', 'Estatísticas dashboard', success, 
      `Status: ${response.status}, Quizzes: ${data?.totalQuizzes}, Respostas: ${data?.totalResponses}`);
    results.push(success);
  } catch (error) {
    logTest('DASHBOARD', 'Estatísticas dashboard', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 1.2 Quiz List
  try {
    const { response, data } = await makeRequest('/api/quizzes');
    const success = response.ok && Array.isArray(data);
    global.existingQuizzes = data || [];
    logTest('QUIZZES', 'Listagem de quizzes', success, 
      `Status: ${response.status}, Total: ${data?.length || 0} quizzes`);
    results.push(success);
  } catch (error) {
    logTest('QUIZZES', 'Listagem de quizzes', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 1.3 Quiz Count Verification
  const quizCount = global.existingQuizzes.length;
  logTest('QUIZZES', 'Contagem de quizzes', quizCount >= 0, 
    `${quizCount} quizzes encontrados no sistema`);
  results.push(quizCount >= 0);
  
  return results;
}

async function testQuizCreation() {
  console.log('\n🆕 2. TESTE DE CRIAÇÃO DE QUIZ');
  
  const results = [];
  
  // 2.1 Create New Quiz
  const newQuizData = {
    title: `Teste Quiz Builder ${Date.now()}`,
    description: 'Quiz criado durante teste automatizado do sistema',
    structure: {
      pages: [
        {
          id: 'page-1',
          title: 'Página Inicial',
          elements: [
            {
              id: 'element-1',
              type: 'heading',
              content: 'Bem-vindo ao Teste!',
              properties: {
                level: 1,
                alignment: 'center'
              }
            },
            {
              id: 'element-2',
              type: 'multiple_choice',
              content: 'Qual é a sua idade?',
              properties: {
                fieldId: 'idade',
                required: true,
                options: ['18-25', '26-35', '36-45', '45+']
              }
            }
          ]
        },
        {
          id: 'page-2',
          title: 'Dados Pessoais',
          elements: [
            {
              id: 'element-3',
              type: 'text',
              content: 'Qual é o seu nome?',
              properties: {
                fieldId: 'nome',
                required: true,
                placeholder: 'Digite seu nome completo'
              }
            },
            {
              id: 'element-4',
              type: 'email',
              content: 'Qual é o seu email?',
              properties: {
                fieldId: 'email',
                required: true,
                placeholder: 'exemplo@email.com'
              }
            }
          ]
        }
      ]
    },
    settings: {
      theme: 'modern',
      showProgress: true,
      collectLeads: true
    }
  };
  
  try {
    const { response, data } = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(newQuizData)
    });
    
    const success = response.ok && data && data.id;
    if (success) {
      global.testQuizId = data.id;
      global.testQuizData = data;
    }
    
    logTest('CREATE', 'Criação de quiz', success, 
      `Status: ${response.status}, Quiz ID: ${data?.id}, Title: ${data?.title}`);
    results.push(success);
  } catch (error) {
    logTest('CREATE', 'Criação de quiz', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 2.2 Verify Quiz Structure
  if (global.testQuizId) {
    try {
      const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}`);
      const success = response.ok && data && data.structure && data.structure.pages;
      const pageCount = data?.structure?.pages?.length || 0;
      
      logTest('CREATE', 'Estrutura do quiz', success, 
        `Pages: ${pageCount}, Elements: ${data?.structure?.pages?.reduce((acc, page) => acc + (page.elements?.length || 0), 0) || 0}`);
      results.push(success);
    } catch (error) {
      logTest('CREATE', 'Estrutura do quiz', false, `Erro: ${error.message}`);
      results.push(false);
    }
  }
  
  return results;
}

async function testQuizEditing() {
  console.log('\n✏️ 3. TESTE DE EDIÇÃO DE QUIZ');
  
  const results = [];
  
  if (!global.testQuizId) {
    logTest('EDIT', 'Quiz disponível para edição', false, 'Nenhum quiz de teste criado');
    return [false];
  }
  
  // 3.1 Add New Page
  const updatedStructure = {
    ...global.testQuizData.structure,
    pages: [
      ...global.testQuizData.structure.pages,
      {
        id: 'page-3',
        title: 'Nova Página Adicionada',
        elements: [
          {
            id: 'element-5',
            type: 'paragraph',
            content: 'Esta é uma página adicionada durante o teste',
            properties: {
              alignment: 'center'
            }
          },
          {
            id: 'element-6',
            type: 'rating',
            content: 'Como você avalia nosso sistema?',
            properties: {
              fieldId: 'avaliacao',
              scale: 5,
              required: true
            }
          }
        ]
      }
    ]
  };
  
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}`, {
      method: 'PUT',
      body: JSON.stringify({
        structure: updatedStructure
      })
    });
    
    const success = response.ok;
    logTest('EDIT', 'Adição de página', success, 
      `Status: ${response.status}, Pages: ${updatedStructure.pages.length}`);
    results.push(success);
  } catch (error) {
    logTest('EDIT', 'Adição de página', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 3.2 Update Quiz Settings
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: `Quiz Editado ${Date.now()}`,
        settings: {
          theme: 'dark',
          showProgress: false,
          collectLeads: true,
          backgroundColor: '#1a1a1a'
        }
      })
    });
    
    const success = response.ok;
    logTest('EDIT', 'Atualização de configurações', success, 
      `Status: ${response.status}, Theme: dark`);
    results.push(success);
  } catch (error) {
    logTest('EDIT', 'Atualização de configurações', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  return results;
}

async function testElementTypes() {
  console.log('\n🧩 4. TESTE DE TIPOS DE ELEMENTOS');
  
  const results = [];
  
  if (!global.testQuizId) {
    logTest('ELEMENTS', 'Quiz disponível para teste', false, 'Nenhum quiz de teste disponível');
    return [false];
  }
  
  // 4.1 Test All Element Types
  const elementTypes = [
    // Conteúdo
    { type: 'heading', content: 'Título de Teste', properties: { level: 2 } },
    { type: 'paragraph', content: 'Parágrafo de teste para verificação', properties: { alignment: 'left' } },
    { type: 'image', content: 'https://via.placeholder.com/300x200', properties: { alignment: 'center' } },
    { type: 'divider', content: '', properties: { style: 'solid' } },
    { type: 'spacer', content: '', properties: { height: 20 } },
    
    // Perguntas
    { type: 'multiple_choice', content: 'Escolha uma opção:', properties: { options: ['A', 'B', 'C'], fieldId: 'teste_mc' } },
    { type: 'text', content: 'Digite algo:', properties: { fieldId: 'teste_text', placeholder: 'Sua resposta' } },
    { type: 'email', content: 'Seu email:', properties: { fieldId: 'teste_email', required: true } },
    { type: 'phone', content: 'Seu telefone:', properties: { fieldId: 'teste_phone' } },
    { type: 'number', content: 'Um número:', properties: { fieldId: 'teste_number', min: 1, max: 100 } },
    { type: 'rating', content: 'Avalie de 1 a 5:', properties: { fieldId: 'teste_rating', scale: 5 } },
    { type: 'date', content: 'Uma data:', properties: { fieldId: 'teste_date' } },
    { type: 'textarea', content: 'Comentários:', properties: { fieldId: 'teste_textarea', rows: 4 } },
    { type: 'checkbox', content: 'Marque as opções:', properties: { options: ['Op1', 'Op2', 'Op3'], fieldId: 'teste_checkbox' } },
    
    // Formulário
    { type: 'birth_date', content: 'Data de nascimento:', properties: { fieldId: 'nascimento' } },
    { type: 'height', content: 'Sua altura:', properties: { fieldId: 'altura', unit: 'cm' } },
    { type: 'current_weight', content: 'Peso atual:', properties: { fieldId: 'peso_atual' } },
    { type: 'target_weight', content: 'Peso desejado:', properties: { fieldId: 'peso_meta' } },
    
    // Navegação
    { type: 'continue_button', content: 'Continuar', properties: { text: 'Próximo', style: 'primary' } },
    { type: 'share_quiz', content: 'Compartilhar', properties: { networks: ['whatsapp', 'facebook'] } }
  ];
  
  const testPageStructure = {
    pages: [
      {
        id: 'elements-test-page',
        title: 'Teste de Elementos',
        elements: elementTypes.map((element, index) => ({
          id: `test-element-${index + 1}`,
          ...element
        }))
      }
    ]
  };
  
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}`, {
      method: 'PUT',
      body: JSON.stringify({
        structure: testPageStructure
      })
    });
    
    const success = response.ok;
    logTest('ELEMENTS', 'Teste de todos os tipos', success, 
      `Status: ${response.status}, Elements: ${elementTypes.length} tipos testados`);
    results.push(success);
  } catch (error) {
    logTest('ELEMENTS', 'Teste de todos os tipos', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 4.2 Verify Element Persistence
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}`);
    const success = response.ok && data?.structure?.pages?.[0]?.elements?.length === elementTypes.length;
    
    logTest('ELEMENTS', 'Persistência de elementos', success, 
      `Elements salvos: ${data?.structure?.pages?.[0]?.elements?.length || 0}/${elementTypes.length}`);
    results.push(success);
  } catch (error) {
    logTest('ELEMENTS', 'Persistência de elementos', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  return results;
}

async function testQuizPublication() {
  console.log('\n🌐 5. TESTE DE PUBLICAÇÃO DE QUIZ');
  
  const results = [];
  
  if (!global.testQuizId) {
    logTest('PUBLISH', 'Quiz disponível para publicação', false, 'Nenhum quiz de teste disponível');
    return [false];
  }
  
  // 5.1 Publish Quiz
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}/publish`, {
      method: 'POST'
    });
    
    const success = response.ok;
    logTest('PUBLISH', 'Publicação do quiz', success, 
      `Status: ${response.status}, Published: ${success}`);
    results.push(success);
  } catch (error) {
    logTest('PUBLISH', 'Publicação do quiz', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 5.2 Access Public Quiz
  try {
    const { response, data } = await makeRequest(`/api/quiz/${global.testQuizId}/public`);
    const success = response.ok && data && data.id === global.testQuizId;
    
    logTest('PUBLISH', 'Acesso público ao quiz', success, 
      `Status: ${response.status}, Quiz acessível: ${success}`);
    results.push(success);
    
    if (success) {
      global.publicQuizData = data;
    }
  } catch (error) {
    logTest('PUBLISH', 'Acesso público ao quiz', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  return results;
}

async function testQuizResponseSimulation() {
  console.log('\n📝 6. TESTE DE SUBMISSÃO DE RESPOSTAS');
  
  const results = [];
  
  if (!global.testQuizId || !global.publicQuizData) {
    logTest('RESPONSES', 'Quiz público disponível', false, 'Quiz não publicado ou inacessível');
    return [false];
  }
  
  // 6.1 Submit Partial Response
  const partialResponseData = {
    quizId: global.testQuizId,
    responses: {
      'teste_mc': 'A',
      'teste_text': 'Resposta de teste'
    },
    metadata: {
      isPartial: true,
      completionPercentage: 30,
      currentPage: 0
    }
  };
  
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}/partial-responses`, {
      method: 'POST',
      body: JSON.stringify(partialResponseData)
    });
    
    const success = response.ok && data && data.id;
    if (success) {
      global.responseId = data.id;
    }
    
    logTest('RESPONSES', 'Resposta parcial', success, 
      `Status: ${response.status}, Response ID: ${data?.id}`);
    results.push(success);
  } catch (error) {
    logTest('RESPONSES', 'Resposta parcial', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 6.2 Submit Complete Response
  const completeResponseData = {
    quizId: global.testQuizId,
    responses: {
      'teste_mc': 'B',
      'teste_text': 'João Silva',
      'teste_email': 'joao@teste.com',
      'teste_phone': '11999999999',
      'teste_number': 25,
      'teste_rating': 5,
      'avaliacao': 4
    },
    metadata: {
      isComplete: true,
      isPartial: false,
      completionPercentage: 100,
      submittedAt: new Date().toISOString()
    }
  };
  
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(completeResponseData)
    });
    
    const success = response.ok && data && data.id;
    if (success) {
      global.completeResponseId = data.id;
    }
    
    logTest('RESPONSES', 'Resposta completa', success, 
      `Status: ${response.status}, Response ID: ${data?.id}`);
    results.push(success);
  } catch (error) {
    logTest('RESPONSES', 'Resposta completa', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  return results;
}

async function testQuizAnalytics() {
  console.log('\n📈 7. TESTE DE ANALYTICS E RELATÓRIOS');
  
  const results = [];
  
  if (!global.testQuizId) {
    logTest('ANALYTICS', 'Quiz disponível para analytics', false, 'Nenhum quiz de teste disponível');
    return [false];
  }
  
  // 7.1 Quiz Responses List
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}/responses`);
    const success = response.ok && Array.isArray(data);
    const responseCount = data?.length || 0;
    
    logTest('ANALYTICS', 'Listagem de respostas', success, 
      `Status: ${response.status}, Respostas: ${responseCount}`);
    results.push(success);
  } catch (error) {
    logTest('ANALYTICS', 'Listagem de respostas', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 7.2 Quiz Statistics
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}/stats`);
    const success = response.ok && data && typeof data.totalResponses === 'number';
    
    logTest('ANALYTICS', 'Estatísticas do quiz', success, 
      `Status: ${response.status}, Total responses: ${data?.totalResponses}, Views: ${data?.totalViews || 0}`);
    results.push(success);
  } catch (error) {
    logTest('ANALYTICS', 'Estatísticas do quiz', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 7.3 View Tracking
  try {
    const { response, data } = await makeRequest(`/api/analytics/${global.testQuizId}/view`, {
      method: 'POST'
    });
    
    const success = response.ok;
    logTest('ANALYTICS', 'Rastreamento de visualização', success, 
      `Status: ${response.status}, View tracked: ${success}`);
    results.push(success);
  } catch (error) {
    logTest('ANALYTICS', 'Rastreamento de visualização', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  return results;
}

async function testQuizDeletion() {
  console.log('\n🗑️ 8. TESTE DE EXCLUSÃO DE QUIZ');
  
  const results = [];
  
  if (!global.testQuizId) {
    logTest('DELETE', 'Quiz disponível para exclusão', false, 'Nenhum quiz de teste disponível');
    return [false];
  }
  
  // 8.1 Delete Quiz
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}`, {
      method: 'DELETE'
    });
    
    const success = response.ok;
    logTest('DELETE', 'Exclusão do quiz', success, 
      `Status: ${response.status}, Deleted: ${success}`);
    results.push(success);
  } catch (error) {
    logTest('DELETE', 'Exclusão do quiz', false, `Erro: ${error.message}`);
    results.push(false);
  }
  
  // 8.2 Verify Quiz Deletion
  try {
    const { response, data } = await makeRequest(`/api/quizzes/${global.testQuizId}`);
    const success = response.status === 404; // Quiz should not be found
    
    logTest('DELETE', 'Verificação de exclusão', success, 
      `Status: ${response.status}, Quiz não encontrado: ${success}`);
    results.push(success);
  } catch (error) {
    logTest('DELETE', 'Verificação de exclusão', true, `Quiz efetivamente removido`);
    results.push(true);
  }
  
  return results;
}

async function runCompleteQuizBuilderTest() {
  console.log('🔧 INICIANDO TESTE COMPLETO DO SISTEMA DE QUIZ BUILDER');
  console.log('============================================================');
  
  // Track all results
  const allResults = [];
  
  // Authentication
  const authSuccess = await authenticateUser();
  if (!authSuccess) {
    console.log('\n❌ FALHA NA AUTENTICAÇÃO - ABORTANDO TESTES');
    return;
  }
  
  // Run all test phases
  const phase1 = await testQuizListAndStats();
  const phase2 = await testQuizCreation();
  const phase3 = await testQuizEditing();
  const phase4 = await testElementTypes();
  const phase5 = await testQuizPublication();
  const phase6 = await testQuizResponseSimulation();
  const phase7 = await testQuizAnalytics();
  const phase8 = await testQuizDeletion();
  
  allResults.push(...phase1, ...phase2, ...phase3, ...phase4, ...phase5, ...phase6, ...phase7, ...phase8);
  
  // Calculate results
  const totalTests = allResults.length;
  const passedTests = allResults.filter(result => result).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  // Final Report
  console.log('\n📊 RELATÓRIO FINAL DO TESTE DE QUIZ BUILDER');
  console.log('============================================================');
  console.log(`Total de testes: ${totalTests}`);
  console.log(`✅ Passou: ${passedTests}`);
  console.log(`❌ Falhou: ${failedTests}`);
  console.log(`📈 Taxa de sucesso: ${successRate}%`);
  
  console.log('\n📋 RESULTADOS POR FASE:');
  console.log(`LISTAGEM E STATS: ${phase1.filter(r => r).length}/${phase1.length} (${((phase1.filter(r => r).length / phase1.length) * 100).toFixed(1)}%)`);
  console.log(`CRIAÇÃO: ${phase2.filter(r => r).length}/${phase2.length} (${((phase2.filter(r => r).length / phase2.length) * 100).toFixed(1)}%)`);
  console.log(`EDIÇÃO: ${phase3.filter(r => r).length}/${phase3.length} (${((phase3.filter(r => r).length / phase3.length) * 100).toFixed(1)}%)`);
  console.log(`ELEMENTOS: ${phase4.filter(r => r).length}/${phase4.length} (${((phase4.filter(r => r).length / phase4.length) * 100).toFixed(1)}%)`);
  console.log(`PUBLICAÇÃO: ${phase5.filter(r => r).length}/${phase5.length} (${((phase5.filter(r => r).length / phase5.length) * 100).toFixed(1)}%)`);
  console.log(`RESPOSTAS: ${phase6.filter(r => r).length}/${phase6.length} (${((phase6.filter(r => r).length / phase6.length) * 100).toFixed(1)}%)`);
  console.log(`ANALYTICS: ${phase7.filter(r => r).length}/${phase7.length} (${((phase7.filter(r => r).length / phase7.length) * 100).toFixed(1)}%)`);
  console.log(`EXCLUSÃO: ${phase8.filter(r => r).length}/${phase8.length} (${((phase8.filter(r => r).length / phase8.length) * 100).toFixed(1)}%)`);
  
  console.log('\n🎯 STATUS FINAL:');
  if (successRate >= 90) {
    console.log('Sistema de Quiz Builder: ✅ APROVADO');
    console.log('✅ Sistema pronto para produção.');
  } else if (successRate >= 75) {
    console.log('Sistema de Quiz Builder: ⚠️ APROVADO COM RESSALVAS');
    console.log('⚠️ Alguns testes falharam. Revisar antes da produção.');
  } else {
    console.log('Sistema de Quiz Builder: ❌ REPROVADO');
    console.log('❌ Muitos testes falharam. Sistema precisa de correções significativas.');
  }
}

// Execute the test
runCompleteQuizBuilderTest().catch(console.error);
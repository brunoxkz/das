/**
 * TESTE SISTEMA COMPLETO VENDZZ - FASE 2: QUIZ MANAGEMENT
 * Teste extremamente avançado de funcionalidades de quiz
 * Cenários: CRUD, Templates, Analytics, Performance, Edge Cases
 */

const baseUrl = 'http://localhost:5000';

// Token obtido da Fase 1
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'VendzzTester/2.0'
    }
  };
  
  if (authToken && !options.headers?.Authorization) {
    defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return {
      status: response.status,
      data,
      headers: response.headers,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false
    };
  }
}

function logTest(phase, test, result, details = '') {
  const status = result ? '✅' : '❌';
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${status} FASE ${phase} - ${test}`);
  if (details) console.log(`   Detalhes: ${details}`);
}

// AUTENTICAÇÃO INICIAL
async function autenticar() {
  const loginResponse = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (loginResponse.ok && loginResponse.data.accessToken) {
    authToken = loginResponse.data.accessToken;
    logTest('2', 'Autenticação Inicial', true, `Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logTest('2', 'Autenticação Inicial', false, `Status: ${loginResponse.status}`);
    return false;
  }
}

// TESTE 1: CRIAÇÃO DE QUIZ COMPLETO
async function testeCriacaoQuiz() {
  console.log('\n📝 TESTE 1: CRIAÇÃO DE QUIZ COMPLETO');
  
  const quizTestData = {
    title: `Quiz Teste Avançado ${Date.now()}`,
    description: 'Quiz criado automaticamente para teste do sistema',
    structure: {
      pages: [
        {
          id: 'page1',
          title: 'Página 1 - Informações Pessoais',
          elements: [
            {
              id: 'elem1',
              type: 'text',
              properties: {
                label: 'Qual é o seu nome completo?',
                placeholder: 'Digite seu nome',
                required: true,
                fieldId: 'nome_completo'
              }
            },
            {
              id: 'elem2',
              type: 'email',
              properties: {
                label: 'Qual é o seu email?',
                placeholder: 'seuemail@exemplo.com',
                required: true,
                fieldId: 'email_contato'
              }
            },
            {
              id: 'elem3',
              type: 'phone',
              properties: {
                label: 'Qual é o seu telefone?',
                placeholder: '(11) 99999-9999',
                required: true,
                fieldId: 'telefone_principal'
              }
            }
          ]
        },
        {
          id: 'page2',
          title: 'Página 2 - Preferências',
          elements: [
            {
              id: 'elem4',
              type: 'multiple_choice',
              properties: {
                label: 'Qual sua faixa etária?',
                options: [
                  { id: 'opt1', text: '18-25 anos', value: '18-25' },
                  { id: 'opt2', text: '26-35 anos', value: '26-35' },
                  { id: 'opt3', text: '36-45 anos', value: '36-45' },
                  { id: 'opt4', text: '46+ anos', value: '46+' }
                ],
                required: true,
                fieldId: 'faixa_etaria'
              }
            }
          ]
        }
      ]
    },
    settings: {
      theme: 'modern',
      progressBar: true,
      showResults: true,
      collectLeads: true,
      enableAnalytics: true
    },
    isPublished: false
  };
  
  try {
    const createResponse = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizTestData)
    });
    
    const criacao = createResponse.ok && createResponse.data.id;
    logTest('2', 'Criação de Quiz', criacao, 
      `ID: ${createResponse.data?.id || 'N/A'}, Status: ${createResponse.status}`);
    
    if (criacao) {
      global.testQuizId = createResponse.data.id;
      
      // Validar estrutura retornada
      const quizCriado = createResponse.data;
      const estruturaValida = quizCriado.structure && 
                              quizCriado.structure.pages && 
                              quizCriado.structure.pages.length === 2;
      
      logTest('2', 'Estrutura do Quiz Válida', estruturaValida,
        `Páginas: ${quizCriado.structure?.pages?.length || 0}`);
      
      // Teste de recuperação imediata
      const getResponse = await makeRequest(`/api/quizzes/${global.testQuizId}`);
      const recuperacao = getResponse.ok && getResponse.data.id === global.testQuizId;
      
      logTest('2', 'Recuperação Imediata', recuperacao,
        `Consistência: ${getResponse.data?.title === quizTestData.title}`);
      
      return { criacao, estruturaValida, recuperacao };
    }
    
    return { criacao: false, estruturaValida: false, recuperacao: false };
  } catch (error) {
    logTest('2', 'Criação de Quiz', false, error.message);
    return { criacao: false, estruturaValida: false, recuperacao: false };
  }
}

// TESTE 2: CRUD COMPLETO DE QUIZZES
async function testeCRUDQuizzes() {
  console.log('\n🔄 TESTE 2: CRUD COMPLETO DE QUIZZES');
  
  if (!global.testQuizId) {
    logTest('2', 'CRUD Quizzes', false, 'Quiz de teste não disponível');
    return false;
  }
  
  const results = {
    read: false,
    update: false,
    list: false,
    delete: false
  };
  
  // READ - Buscar quiz específico
  try {
    const readResponse = await makeRequest(`/api/quizzes/${global.testQuizId}`);
    results.read = readResponse.ok && readResponse.data.id === global.testQuizId;
    logTest('2', 'READ Quiz', results.read, `Status: ${readResponse.status}`);
  } catch (error) {
    logTest('2', 'READ Quiz', false, error.message);
  }
  
  // UPDATE - Atualizar quiz
  try {
    const updateData = {
      title: `Quiz Atualizado ${Date.now()}`,
      description: 'Quiz atualizado via teste automatizado',
      isPublished: true
    };
    
    const updateResponse = await makeRequest(`/api/quizzes/${global.testQuizId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    results.update = updateResponse.ok;
    logTest('2', 'UPDATE Quiz', results.update, `Status: ${updateResponse.status}`);
  } catch (error) {
    logTest('2', 'UPDATE Quiz', false, error.message);
  }
  
  // LIST - Listar quizzes
  try {
    const listResponse = await makeRequest('/api/quizzes');
    results.list = listResponse.ok && Array.isArray(listResponse.data);
    const containsTestQuiz = listResponse.data?.some(q => q.id === global.testQuizId);
    
    logTest('2', 'LIST Quizzes', results.list, 
      `Total: ${listResponse.data?.length || 0}, Contém teste: ${containsTestQuiz}`);
  } catch (error) {
    logTest('2', 'LIST Quizzes', false, error.message);
  }
  
  // DELETE será feito no final dos testes
  
  return results;
}

// TESTE 3: SISTEMA DE TEMPLATES
async function testeTemplates() {
  console.log('\n🎨 TESTE 3: SISTEMA DE TEMPLATES');
  
  try {
    // Buscar templates disponíveis
    const templatesResponse = await makeRequest('/api/templates');
    const templatesDisponivos = templatesResponse.ok && Array.isArray(templatesResponse.data);
    
    logTest('2', 'Templates Disponíveis', templatesDisponivos,
      `Total: ${templatesResponse.data?.length || 0}`);
    
    if (templatesDisponivos && templatesResponse.data.length > 0) {
      // Testar criação de quiz a partir de template
      const firstTemplate = templatesResponse.data[0];
      
      const quizFromTemplate = await makeRequest('/api/quizzes/from-template', {
        method: 'POST',
        body: JSON.stringify({
          templateId: firstTemplate.id,
          title: `Quiz de Template ${Date.now()}`,
          customizations: {
            theme: 'modern',
            progressBar: true
          }
        })
      });
      
      const criacaoTemplate = quizFromTemplate.ok && quizFromTemplate.data.id;
      logTest('2', 'Criação via Template', criacaoTemplate,
        `Template: ${firstTemplate.name}, Quiz ID: ${quizFromTemplate.data?.id || 'N/A'}`);
      
      if (criacaoTemplate) {
        global.templateQuizId = quizFromTemplate.data.id;
      }
      
      return { templatesDisponivos, criacaoTemplate };
    }
    
    return { templatesDisponivos, criacaoTemplate: false };
  } catch (error) {
    logTest('2', 'Templates', false, error.message);
    return { templatesDisponivos: false, criacaoTemplate: false };
  }
}

// TESTE 4: SISTEMA DE RESPOSTAS
async function testeRespostas() {
  console.log('\n💬 TESTE 4: SISTEMA DE RESPOSTAS');
  
  if (!global.testQuizId) {
    logTest('2', 'Sistema Respostas', false, 'Quiz de teste não disponível');
    return false;
  }
  
  // Simular resposta ao quiz
  const respostaSimulada = {
    quizId: global.testQuizId,
    responses: [
      {
        elementId: 'elem1',
        elementType: 'text',
        elementFieldId: 'nome_completo',
        answer: 'João da Silva Teste'
      },
      {
        elementId: 'elem2',
        elementType: 'email',
        elementFieldId: 'email_contato',
        answer: 'joao.teste@exemplo.com'
      },
      {
        elementId: 'elem3',
        elementType: 'phone',
        elementFieldId: 'telefone_principal',
        answer: '11987654321'
      },
      {
        elementId: 'elem4',
        elementType: 'multiple_choice',
        elementFieldId: 'faixa_etaria',
        answer: '26-35'
      }
    ],
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      userAgent: 'VendzzTester/2.0',
      ipAddress: '127.0.0.1',
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    }
  };
  
  try {
    // Criar resposta
    const createResponseResp = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify(respostaSimulada)
    });
    
    const criacaoResposta = createResponseResp.ok && createResponseResp.data.id;
    logTest('2', 'Criação de Resposta', criacaoResposta,
      `Response ID: ${createResponseResp.data?.id || 'N/A'}`);
    
    if (criacaoResposta) {
      global.testResponseId = createResponseResp.data.id;
      
      // Buscar respostas do quiz
      const getResponsesResp = await makeRequest(`/api/quiz-responses?quizId=${global.testQuizId}`);
      const buscarRespostas = getResponsesResp.ok && Array.isArray(getResponsesResp.data);
      
      logTest('2', 'Buscar Respostas', buscarRespostas,
        `Total: ${getResponsesResp.data?.length || 0}`);
      
      return { criacaoResposta, buscarRespostas };
    }
    
    return { criacaoResposta: false, buscarRespostas: false };
  } catch (error) {
    logTest('2', 'Sistema Respostas', false, error.message);
    return { criacaoResposta: false, buscarRespostas: false };
  }
}

// TESTE 5: ANALYTICS E MÉTRICAS
async function testeAnalytics() {
  console.log('\n📊 TESTE 5: ANALYTICS E MÉTRICAS');
  
  if (!global.testQuizId) {
    logTest('2', 'Analytics', false, 'Quiz de teste não disponível');
    return false;
  }
  
  try {
    // Analytics do quiz específico
    const quizAnalyticsResp = await makeRequest(`/api/analytics/${global.testQuizId}`);
    const analyticsQuiz = quizAnalyticsResp.ok && quizAnalyticsResp.data;
    
    logTest('2', 'Analytics do Quiz', analyticsQuiz,
      `Views: ${quizAnalyticsResp.data?.views || 0}, Responses: ${quizAnalyticsResp.data?.responses || 0}`);
    
    // Analytics gerais do dashboard
    const dashboardStatsResp = await makeRequest('/api/dashboard/stats');
    const statsDashboard = dashboardStatsResp.ok && dashboardStatsResp.data;
    
    logTest('2', 'Stats do Dashboard', statsDashboard,
      `Quizzes: ${dashboardStatsResp.data?.totalQuizzes || 0}`);
    
    // Analytics summary
    const summaryResp = await makeRequest('/api/analytics/summary');
    const analyticsSummary = summaryResp.ok && summaryResp.data;
    
    logTest('2', 'Analytics Summary', analyticsSummary,
      `Total Views: ${summaryResp.data?.totalViews || 0}`);
    
    return { analyticsQuiz, statsDashboard, analyticsSummary };
  } catch (error) {
    logTest('2', 'Analytics', false, error.message);
    return { analyticsQuiz: false, statsDashboard: false, analyticsSummary: false };
  }
}

// TESTE 6: PERFORMANCE STRESS TEST
async function testePerformanceQuizzes() {
  console.log('\n⚡ TESTE 6: PERFORMANCE STRESS TEST');
  
  try {
    // Teste de múltiplas requisições simultâneas
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(makeRequest('/api/quizzes'));
    }
    
    const start = Date.now();
    const results = await Promise.all(requests);
    const totalTime = Date.now() - start;
    
    const successfulRequests = results.filter(r => r.ok).length;
    const avgTime = totalTime / results.length;
    
    const performance20 = successfulRequests >= 18; // 90% success rate
    logTest('2', 'Performance 20 Requisições', performance20,
      `${successfulRequests}/20 sucessos em ${totalTime}ms (média: ${avgTime.toFixed(2)}ms)`);
    
    // Teste de criação em massa (menor escala)
    const massCreateRequests = [];
    for (let i = 0; i < 5; i++) {
      massCreateRequests.push(makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: `Quiz Stress ${i + 1}`,
          description: `Quiz criado no stress test #${i + 1}`,
          structure: { pages: [] },
          settings: { theme: 'default' }
        })
      }));
    }
    
    const createStart = Date.now();
    const createResults = await Promise.all(massCreateRequests);
    const createTime = Date.now() - createStart;
    
    const successfulCreations = createResults.filter(r => r.ok).length;
    const criacaoMassa = successfulCreations >= 4; // 80% success rate
    
    logTest('2', 'Criação em Massa', criacaoMassa,
      `${successfulCreations}/5 criações em ${createTime}ms`);
    
    // Limpar quizzes criados no stress test
    for (const result of createResults) {
      if (result.ok && result.data.id) {
        await makeRequest(`/api/quizzes/${result.data.id}`, { method: 'DELETE' });
      }
    }
    
    return { performance20, criacaoMassa };
  } catch (error) {
    logTest('2', 'Performance Stress', false, error.message);
    return { performance20: false, criacaoMassa: false };
  }
}

// CLEANUP - Limpar dados de teste
async function cleanupTestes() {
  console.log('\n🧹 CLEANUP: Removendo dados de teste');
  
  const cleanupResults = [];
  
  if (global.testQuizId) {
    try {
      const deleteResp = await makeRequest(`/api/quizzes/${global.testQuizId}`, {
        method: 'DELETE'
      });
      cleanupResults.push({ item: 'Quiz Principal', success: deleteResp.ok });
    } catch (error) {
      cleanupResults.push({ item: 'Quiz Principal', success: false, error: error.message });
    }
  }
  
  if (global.templateQuizId) {
    try {
      const deleteResp = await makeRequest(`/api/quizzes/${global.templateQuizId}`, {
        method: 'DELETE'
      });
      cleanupResults.push({ item: 'Quiz Template', success: deleteResp.ok });
    } catch (error) {
      cleanupResults.push({ item: 'Quiz Template', success: false, error: error.message });
    }
  }
  
  cleanupResults.forEach(result => {
    logTest('2', `Cleanup ${result.item}`, result.success, result.error || '');
  });
  
  return cleanupResults;
}

// FUNÇÃO PRINCIPAL DA FASE 2
async function executarFase2() {
  console.log('🚀 INICIANDO TESTE SISTEMA COMPLETO VENDZZ - FASE 2');
  console.log('📋 Testes: Quiz CRUD, Templates, Respostas, Analytics, Performance');
  console.log('─'.repeat(80));
  
  // Autenticação
  const auth = await autenticar();
  if (!auth) {
    console.log('❌ Falha na autenticação. Abortando Fase 2.');
    return false;
  }
  
  // Executar todos os testes
  const resultados = {
    criacaoQuiz: await testeCriacaoQuiz(),
    crudQuizzes: await testeCRUDQuizzes(),
    templates: await testeTemplates(),
    respostas: await testeRespostas(),
    analytics: await testeAnalytics(),
    performance: await testePerformanceQuizzes()
  };
  
  // Cleanup
  await cleanupTestes();
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DA FASE 2:');
  
  const criacaoScore = Object.values(resultados.criacaoQuiz).filter(Boolean).length;
  const crudScore = Object.values(resultados.crudQuizzes).filter(Boolean).length;
  const templatesScore = Object.values(resultados.templates).filter(Boolean).length;
  const respostasScore = Object.values(resultados.respostas).filter(Boolean).length;
  const analyticsScore = Object.values(resultados.analytics).filter(Boolean).length;
  const performanceScore = Object.values(resultados.performance).filter(Boolean).length;
  
  console.log(`Criação de Quiz: ${criacaoScore}/3 ✅`);
  console.log(`CRUD Quizzes: ${crudScore}/4 ✅`);
  console.log(`Templates: ${templatesScore}/2 ✅`);
  console.log(`Respostas: ${respostasScore}/2 ✅`);
  console.log(`Analytics: ${analyticsScore}/3 ✅`);
  console.log(`Performance: ${performanceScore}/2 ✅`);
  
  const totalScore = criacaoScore + crudScore + templatesScore + respostasScore + analyticsScore + performanceScore;
  const maxScore = 16;
  const sucessoGeral = totalScore >= 12; // 75% de sucesso
  
  console.log(`\n🎯 STATUS FASE 2: ${sucessoGeral ? '✅ APROVADA' : '❌ REQUER ATENÇÃO'}`);
  console.log(`📈 Score: ${totalScore}/${maxScore} (${((totalScore/maxScore)*100).toFixed(1)}%)`);
  
  if (sucessoGeral) {
    console.log('\n✨ Sistema de Quiz Management funcionando. Pronto para FASE 3: MARKETING AUTOMATION');
  } else {
    console.log('\n⚠️  Problemas detectados no sistema de quizzes. Revise antes de continuar.');
  }
  
  return resultados;
}

// Executar teste
executarFase2().catch(console.error);
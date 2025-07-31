/**
 * TESTE Q.A. COMPLETO DO SISTEMA VENDZZ
 * Análise extremamente detalhada de todos os componentes
 * Emulação de usuários reais para encontrar erros
 */

import fetch from 'node-fetch';

// Configuração base
const BASE_URL = 'https://4f0b1b6d-a2e6-4319-acae-ab97c4e5fb3b-00-2xpd8j2g7k4te.spock.replit.dev';
let authToken = null;

// Cores para logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

// Função para fazer requisições
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...options.headers
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  return { 
    response, 
    data, 
    status: response.status,
    ok: response.ok 
  };
}

// Resultados dos testes
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  performance: []
};

function logTest(category, test, result, details = '', time = null) {
  testResults.total++;
  const status = result ? 'PASSOU' : 'FALHOU';
  const color = result ? colors.green : colors.red;
  const timeStr = time ? ` (${time}ms)` : '';
  
  console.log(`${color}[${category}] ${test}: ${status}${timeStr}${colors.reset}`);
  if (details) console.log(`  ${colors.cyan}→ ${details}${colors.reset}`);
  
  if (result) {
    testResults.passed++;
    if (time) testResults.performance.push({ test, time });
  } else {
    testResults.failed++;
    testResults.errors.push({ category, test, details });
  }
}

function logWarning(message) {
  testResults.warnings.push(message);
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// ========================================
// FASE 1: TESTE DE AUTENTICAÇÃO
// ========================================
async function testeAutenticacao() {
  console.log(`\n${colors.magenta}=== FASE 1: TESTE DE AUTENTICAÇÃO ===${colors.reset}`);
  
  const startTime = Date.now();
  
  try {
    // Teste 1: Login com credenciais válidas
    const { data: loginData, status: loginStatus } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginTime = Date.now() - startTime;
    logTest('AUTENTICAÇÃO', 'Login com credenciais válidas', loginStatus === 200, 
      `Token: ${loginData.token ? 'recebido' : 'não recebido'}`, loginTime);
    
    if (loginData.token) {
      authToken = loginData.token;
    }
    
    // Teste 2: Validação do token
    if (authToken) {
      const validateStart = Date.now();
      const { data: userData, status: validateStatus } = await makeRequest('/api/auth/validate');
      const validateTime = Date.now() - validateStart;
      
      logTest('AUTENTICAÇÃO', 'Validação do token JWT', validateStatus === 200,
        `User ID: ${userData.user?.id}`, validateTime);
    }
    
    // Teste 3: Login com credenciais inválidas
    const { status: invalidLoginStatus } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'senhaerrada'
      })
    });
    
    logTest('AUTENTICAÇÃO', 'Rejeição de credenciais inválidas', invalidLoginStatus === 401,
      'Sistema deve rejeitar login inválido');
    
  } catch (error) {
    logTest('AUTENTICAÇÃO', 'Sistema de autenticação', false, error.message);
  }
}

// ========================================
// FASE 2: TESTE DE QUIZZES
// ========================================
async function testeQuizzes() {
  console.log(`\n${colors.magenta}=== FASE 2: TESTE DE QUIZZES ===${colors.reset}`);
  
  let createdQuizId = null;
  
  try {
    // Teste 1: Listar quizzes existentes
    const { data: quizzes, status: listStatus } = await makeRequest('/api/quizzes');
    logTest('QUIZZES', 'Listar quizzes existentes', listStatus === 200,
      `Total de quizzes: ${quizzes?.length || 0}`);
    
    // Teste 2: Criar novo quiz
    const quizData = {
      title: 'Quiz Teste QA',
      description: 'Quiz criado durante teste automatizado',
      structure: {
        pages: [
          {
            id: 'page_1',
            name: 'Página 1',
            type: 'normal',
            elements: [
              {
                id: 'elem_1',
                type: 'heading',
                properties: {
                  text: 'Pergunta de Teste',
                  level: 1
                }
              },
              {
                id: 'elem_2',
                type: 'multiple_choice',
                properties: {
                  question: 'Qual sua idade?',
                  options: [
                    { text: '18-25', value: '18-25' },
                    { text: '26-35', value: '26-35' },
                    { text: '36-45', value: '36-45' }
                  ],
                  required: true,
                  fieldId: 'faixa_etaria'
                }
              },
              {
                id: 'elem_3',
                type: 'email',
                properties: {
                  label: 'Seu melhor email',
                  required: true,
                  fieldId: 'email_contato'
                }
              }
            ]
          }
        ]
      }
    };
    
    const createStart = Date.now();
    const { data: newQuiz, status: createStatus } = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
    const createTime = Date.now() - createStart;
    
    logTest('QUIZZES', 'Criação de novo quiz', createStatus === 201,
      `Quiz ID: ${newQuiz?.id}`, createTime);
    
    if (newQuiz?.id) {
      createdQuizId = newQuiz.id;
    }
    
    // Teste 3: Recuperar quiz específico
    if (createdQuizId) {
      const { data: specificQuiz, status: getStatus } = await makeRequest(`/api/quizzes/${createdQuizId}`);
      logTest('QUIZZES', 'Recuperar quiz específico', getStatus === 200,
        `Título: ${specificQuiz?.title}`);
    }
    
    // Teste 4: Publicar quiz
    if (createdQuizId) {
      const { status: publishStatus } = await makeRequest(`/api/quizzes/${createdQuizId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: true })
      });
      logTest('QUIZZES', 'Publicar quiz', publishStatus === 200,
        'Quiz deve ficar disponível publicamente');
    }
    
    // Teste 5: Testar quiz público
    if (createdQuizId) {
      const { status: publicStatus } = await makeRequest(`/quiz/${createdQuizId}`, {
        headers: {} // Sem token de autenticação
      });
      logTest('QUIZZES', 'Acesso público ao quiz', publicStatus === 200,
        'Quiz deve ser acessível sem autenticação');
    }
    
  } catch (error) {
    logTest('QUIZZES', 'Sistema de quizzes', false, error.message);
  }
  
  return createdQuizId;
}

// ========================================
// FASE 3: TESTE DE RESPOSTAS
// ========================================
async function testeRespostas(quizId) {
  console.log(`\n${colors.magenta}=== FASE 3: TESTE DE RESPOSTAS ===${colors.reset}`);
  
  if (!quizId) {
    logWarning('Quiz ID não disponível, pulando testes de respostas');
    return;
  }
  
  let createdResponseId = null;
  
  try {
    // Teste 1: Criar resposta parcial
    const partialResponse = {
      quizId,
      currentStep: 1,
      responses: [
        {
          elementId: 'elem_1',
          elementType: 'multiple_choice',
          elementFieldId: 'faixa_etaria',
          answer: '26-35'
        }
      ],
      metadata: {
        isPartial: true,
        isComplete: false,
        completionPercentage: 50
      }
    };
    
    const { data: partialData, status: partialStatus } = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify(partialResponse)
    });
    
    logTest('RESPOSTAS', 'Criação de resposta parcial', partialStatus === 201,
      `Response ID: ${partialData?.id}`);
    
    if (partialData?.id) {
      createdResponseId = partialData.id;
    }
    
    // Teste 2: Completar resposta
    if (createdResponseId) {
      const completeResponse = {
        quizId,
        responseId: createdResponseId,
        currentStep: 2,
        responses: [
          {
            elementId: 'elem_1',
            elementType: 'multiple_choice',
            elementFieldId: 'faixa_etaria',
            answer: '26-35'
          },
          {
            elementId: 'elem_2',
            elementType: 'email',
            elementFieldId: 'email_contato',
            answer: 'teste@vendzz.com'
          }
        ],
        metadata: {
          isPartial: false,
          isComplete: true,
          completionPercentage: 100
        }
      };
      
      const { status: completeStatus } = await makeRequest('/api/quiz-responses', {
        method: 'POST',
        body: JSON.stringify(completeResponse)
      });
      
      logTest('RESPOSTAS', 'Completar resposta', completeStatus === 201,
        'Resposta deve ser marcada como completa');
    }
    
    // Teste 3: Listar respostas do quiz
    const { data: responses, status: listStatus } = await makeRequest(`/api/quiz-responses/${quizId}`);
    logTest('RESPOSTAS', 'Listar respostas do quiz', listStatus === 200,
      `Total de respostas: ${responses?.length || 0}`);
    
    // Teste 4: Testar extração de variáveis
    const { data: variables, status: varStatus } = await makeRequest(`/api/quiz-variables/${quizId}`);
    logTest('RESPOSTAS', 'Extração de variáveis', varStatus === 200,
      `Variáveis extraídas: ${variables?.length || 0}`);
    
  } catch (error) {
    logTest('RESPOSTAS', 'Sistema de respostas', false, error.message);
  }
  
  return createdResponseId;
}

// ========================================
// FASE 4: TESTE DE ANALYTICS
// ========================================
async function testeAnalytics(quizId) {
  console.log(`\n${colors.magenta}=== FASE 4: TESTE DE ANALYTICS ===${colors.reset}`);
  
  if (!quizId) {
    logWarning('Quiz ID não disponível, pulando testes de analytics');
    return;
  }
  
  try {
    // Teste 1: Registrar visualização
    const { status: viewStatus } = await makeRequest(`/api/analytics/${quizId}/view`, {
      method: 'POST'
    });
    logTest('ANALYTICS', 'Registrar visualização', viewStatus === 200,
      'Visualização deve ser contabilizada');
    
    // Teste 2: Obter analytics do quiz
    const { data: analytics, status: analyticsStatus } = await makeRequest(`/api/analytics/${quizId}`);
    logTest('ANALYTICS', 'Obter analytics do quiz', analyticsStatus === 200,
      `Views: ${analytics?.views || 0}, Responses: ${analytics?.responses || 0}`);
    
    // Teste 3: Dashboard analytics
    const { data: dashboard, status: dashboardStatus } = await makeRequest('/api/dashboard');
    logTest('ANALYTICS', 'Dashboard analytics', dashboardStatus === 200,
      `Total quizzes: ${dashboard?.totalQuizzes || 0}`);
    
  } catch (error) {
    logTest('ANALYTICS', 'Sistema de analytics', false, error.message);
  }
}

// ========================================
// FASE 5: TESTE DE CAMPANHAS SMS
// ========================================
async function testeCampanhasSMS(quizId) {
  console.log(`\n${colors.magenta}=== FASE 5: TESTE DE CAMPANHAS SMS ===${colors.reset}`);
  
  if (!quizId) {
    logWarning('Quiz ID não disponível, criando campanha com quiz padrão');
    quizId = 'quiz_default';
  }
  
  let campaignId = null;
  
  try {
    // Teste 1: Verificar créditos SMS
    const { data: credits, status: creditsStatus } = await makeRequest('/api/user/credits');
    logTest('SMS', 'Verificar créditos SMS', creditsStatus === 200,
      `Créditos SMS: ${credits?.sms || 0}`);
    
    // Teste 2: Extrair telefones do quiz
    const { data: phones, status: phonesStatus } = await makeRequest(`/api/quiz-phones/${quizId}`);
    logTest('SMS', 'Extrair telefones do quiz', phonesStatus === 200,
      `Telefones encontrados: ${phones?.length || 0}`);
    
    // Teste 3: Criar campanha SMS
    const campaignData = {
      name: 'Campanha SMS Teste QA',
      quizId,
      message: 'Olá! Esta é uma mensagem de teste do sistema Vendzz.',
      phones: ['11999999999'], // Telefone de teste
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    const { data: campaign, status: campaignStatus } = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    logTest('SMS', 'Criar campanha SMS', campaignStatus === 201,
      `Campanha ID: ${campaign?.id}`);
    
    if (campaign?.id) {
      campaignId = campaign.id;
    }
    
    // Teste 4: Listar campanhas SMS
    const { data: campaigns, status: listStatus } = await makeRequest('/api/sms-campaigns');
    logTest('SMS', 'Listar campanhas SMS', listStatus === 200,
      `Total campanhas: ${campaigns?.length || 0}`);
    
    // Teste 5: Testar agendamento
    if (campaignId) {
      // Aguardar 2 minutos para ver se a campanha foi processada
      logInfo('Aguardando 2 minutos para testar agendamento...');
      await new Promise(resolve => setTimeout(resolve, 120000));
      
      const { data: logs, status: logsStatus } = await makeRequest(`/api/sms-logs/${campaignId}`);
      logTest('SMS', 'Processamento de agendamento', logsStatus === 200,
        `Logs criados: ${logs?.length || 0}`);
    }
    
  } catch (error) {
    logTest('SMS', 'Sistema de campanhas SMS', false, error.message);
  }
  
  return campaignId;
}

// ========================================
// FASE 6: TESTE DE CAMPANHAS EMAIL
// ========================================
async function testeCampanhasEmail(quizId) {
  console.log(`\n${colors.magenta}=== FASE 6: TESTE DE CAMPANHAS EMAIL ===${colors.reset}`);
  
  if (!quizId) {
    logWarning('Quiz ID não disponível, criando campanha com quiz padrão');
    quizId = 'quiz_default';
  }
  
  try {
    // Teste 1: Verificar créditos Email
    const { data: credits, status: creditsStatus } = await makeRequest('/api/user/credits');
    logTest('EMAIL', 'Verificar créditos Email', creditsStatus === 200,
      `Créditos Email: ${credits?.email || 0}`);
    
    // Teste 2: Extrair emails do quiz
    const { data: emails, status: emailsStatus } = await makeRequest(`/api/quiz-emails/${quizId}`);
    logTest('EMAIL', 'Extrair emails do quiz', emailsStatus === 200,
      `Emails encontrados: ${emails?.length || 0}`);
    
    // Teste 3: Criar campanha de email
    const campaignData = {
      name: 'Campanha Email Teste QA',
      quizId,
      subject: 'Teste do Sistema Vendzz',
      body: 'Este é um email de teste do sistema Vendzz.',
      emails: ['teste@vendzz.com'],
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    const { data: campaign, status: campaignStatus } = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    logTest('EMAIL', 'Criar campanha de email', campaignStatus === 201,
      `Campanha ID: ${campaign?.id}`);
    
    // Teste 4: Listar campanhas de email
    const { data: campaigns, status: listStatus } = await makeRequest('/api/email-campaigns');
    logTest('EMAIL', 'Listar campanhas de email', listStatus === 200,
      `Total campanhas: ${campaigns?.length || 0}`);
    
  } catch (error) {
    logTest('EMAIL', 'Sistema de campanhas de email', false, error.message);
  }
}

// ========================================
// FASE 7: TESTE DE CAMPANHAS WHATSAPP
// ========================================
async function testeCampanhasWhatsApp(quizId) {
  console.log(`\n${colors.magenta}=== FASE 7: TESTE DE CAMPANHAS WHATSAPP ===${colors.reset}`);
  
  if (!quizId) {
    logWarning('Quiz ID não disponível, criando campanha com quiz padrão');
    quizId = 'quiz_default';
  }
  
  try {
    // Teste 1: Verificar créditos WhatsApp
    const { data: credits, status: creditsStatus } = await makeRequest('/api/user/credits');
    logTest('WHATSAPP', 'Verificar créditos WhatsApp', creditsStatus === 200,
      `Créditos WhatsApp: ${credits?.whatsapp || 0}`);
    
    // Teste 2: Criar campanha WhatsApp
    const campaignData = {
      name: 'Campanha WhatsApp Teste QA',
      quizId,
      messages: ['Olá! Esta é uma mensagem de teste do sistema Vendzz.'],
      phones: ['11999999999'],
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    const { data: campaign, status: campaignStatus } = await makeRequest('/api/whatsapp-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    logTest('WHATSAPP', 'Criar campanha WhatsApp', campaignStatus === 201,
      `Campanha ID: ${campaign?.id}`);
    
    // Teste 3: Listar campanhas WhatsApp
    const { data: campaigns, status: listStatus } = await makeRequest('/api/whatsapp-campaigns');
    logTest('WHATSAPP', 'Listar campanhas WhatsApp', listStatus === 200,
      `Total campanhas: ${campaigns?.length || 0}`);
    
    // Teste 4: Testar endpoint de extensão
    const { data: extensionData, status: extensionStatus } = await makeRequest('/api/whatsapp-extension/pending');
    logTest('WHATSAPP', 'Endpoint de extensão', extensionStatus === 200,
      `Mensagens pendentes: ${extensionData?.length || 0}`);
    
  } catch (error) {
    logTest('WHATSAPP', 'Sistema de campanhas WhatsApp', false, error.message);
  }
}

// ========================================
// FASE 8: TESTE DE DETECÇÃO AUTOMÁTICA
// ========================================
async function testeDetecaoAutomatica() {
  console.log(`\n${colors.magenta}=== FASE 8: TESTE DE DETECÇÃO AUTOMÁTICA ===${colors.reset}`);
  
  try {
    // Teste 1: Verificar sistema de detecção
    const { data: detectionData, status: detectionStatus } = await makeRequest('/api/system/detection-status');
    logTest('DETECÇÃO', 'Sistema de detecção ativo', detectionStatus === 200,
      `Status: ${detectionData?.active ? 'Ativo' : 'Inativo'}`);
    
    // Teste 2: Verificar logs de detecção
    const { data: logs, status: logsStatus } = await makeRequest('/api/system/detection-logs');
    logTest('DETECÇÃO', 'Logs de detecção', logsStatus === 200,
      `Logs encontrados: ${logs?.length || 0}`);
    
    // Teste 3: Testar campanhas ativas limitadas
    const { data: activeCampaigns, status: activeStatus } = await makeRequest('/api/system/active-campaigns');
    logTest('DETECÇÃO', 'Campanhas ativas limitadas', activeStatus === 200,
      `Campanhas ativas: ${activeCampaigns?.length || 0}`);
    
  } catch (error) {
    logTest('DETECÇÃO', 'Sistema de detecção automática', false, error.message);
  }
}

// ========================================
// FASE 9: TESTE DE PERFORMANCE
// ========================================
async function testePerformance() {
  console.log(`\n${colors.magenta}=== FASE 9: TESTE DE PERFORMANCE ===${colors.reset}`);
  
  try {
    // Teste 1: Múltiplas requisições simultâneas
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(makeRequest('/api/dashboard'));
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const successCount = results.filter(r => r.ok).length;
    logTest('PERFORMANCE', 'Múltiplas requisições simultâneas', successCount === 10,
      `${successCount}/10 sucessos em ${totalTime}ms`, totalTime);
    
    // Teste 2: Tempo de resposta da API
    const apiStart = Date.now();
    const { status: apiStatus } = await makeRequest('/api/dashboard');
    const apiTime = Date.now() - apiStart;
    
    logTest('PERFORMANCE', 'Tempo de resposta da API', apiTime < 1000,
      `Tempo: ${apiTime}ms (deve ser < 1000ms)`, apiTime);
    
    // Teste 3: Carregamento de quiz público
    const publicStart = Date.now();
    const { status: publicStatus } = await makeRequest('/quiz/test', {
      headers: {} // Sem autenticação
    });
    const publicTime = Date.now() - publicStart;
    
    logTest('PERFORMANCE', 'Carregamento de quiz público', publicTime < 500,
      `Tempo: ${publicTime}ms (deve ser < 500ms)`, publicTime);
    
  } catch (error) {
    logTest('PERFORMANCE', 'Teste de performance', false, error.message);
  }
}

// ========================================
// FASE 10: TESTE DE COMPATIBILIDADE
// ========================================
async function testeCompatibilidade() {
  console.log(`\n${colors.magenta}=== FASE 10: TESTE DE COMPATIBILIDADE ===${colors.reset}`);
  
  try {
    // Teste 1: Endpoints obrigatórios
    const endpoints = [
      '/api/auth/validate',
      '/api/dashboard',
      '/api/quizzes',
      '/api/sms-campaigns',
      '/api/email-campaigns',
      '/api/whatsapp-campaigns',
      '/api/user/credits'
    ];
    
    for (const endpoint of endpoints) {
      const { status } = await makeRequest(endpoint);
      logTest('COMPATIBILIDADE', `Endpoint ${endpoint}`, status === 200,
        `Status: ${status}`);
    }
    
    // Teste 2: Estrutura de dados
    const { data: userData } = await makeRequest('/api/auth/validate');
    logTest('COMPATIBILIDADE', 'Estrutura de dados do usuário', 
      userData?.user?.id && userData?.user?.email,
      `ID: ${userData?.user?.id}, Email: ${userData?.user?.email}`);
    
    // Teste 3: Formato de resposta JSON
    const { data: dashboardData } = await makeRequest('/api/dashboard');
    logTest('COMPATIBILIDADE', 'Formato JSON do dashboard',
      typeof dashboardData === 'object' && dashboardData !== null,
      `Tipo: ${typeof dashboardData}`);
    
  } catch (error) {
    logTest('COMPATIBILIDADE', 'Teste de compatibilidade', false, error.message);
  }
}

// ========================================
// RELATÓRIO FINAL
// ========================================
function gerarRelatorioFinal() {
  console.log(`\n${colors.magenta}=== RELATÓRIO FINAL DO TESTE Q.A. ===${colors.reset}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  const avgPerformance = testResults.performance.length > 0 
    ? (testResults.performance.reduce((sum, p) => sum + p.time, 0) / testResults.performance.length).toFixed(1)
    : 'N/A';
  
  console.log(`\n${colors.cyan}📊 ESTATÍSTICAS GERAIS:${colors.reset}`);
  console.log(`   Total de testes: ${testResults.total}`);
  console.log(`   Testes aprovados: ${colors.green}${testResults.passed}${colors.reset}`);
  console.log(`   Testes falharam: ${colors.red}${testResults.failed}${colors.reset}`);
  console.log(`   Taxa de sucesso: ${colors.yellow}${successRate}%${colors.reset}`);
  console.log(`   Performance média: ${avgPerformance}ms`);
  
  if (testResults.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  AVISOS (${testResults.warnings.length}):${colors.reset}`);
    testResults.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }
  
  if (testResults.errors.length > 0) {
    console.log(`\n${colors.red}❌ ERROS ENCONTRADOS (${testResults.errors.length}):${colors.reset}`);
    testResults.errors.forEach(error => {
      console.log(`   • [${error.category}] ${error.test}: ${error.details}`);
    });
  }
  
  // Recomendações
  console.log(`\n${colors.blue}💡 RECOMENDAÇÕES:${colors.reset}`);
  
  if (successRate >= 90) {
    console.log(`   ${colors.green}✅ Sistema está em excelente estado para produção${colors.reset}`);
  } else if (successRate >= 80) {
    console.log(`   ${colors.yellow}⚠️  Sistema precisa de pequenos ajustes antes da produção${colors.reset}`);
  } else {
    console.log(`   ${colors.red}❌ Sistema precisa de correções críticas antes da produção${colors.reset}`);
  }
  
  if (testResults.performance.length > 0) {
    const slowTests = testResults.performance.filter(p => p.time > 1000);
    if (slowTests.length > 0) {
      console.log(`   ${colors.yellow}⚡ Otimizar performance de ${slowTests.length} testes lentos${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.magenta}=== TESTE Q.A. FINALIZADO ===${colors.reset}`);
}

// ========================================
// EXECUTAR TODOS OS TESTES
// ========================================
async function executarTestesCompletos() {
  console.log(`${colors.magenta}🔍 INICIANDO TESTE Q.A. COMPLETO DO SISTEMA VENDZZ${colors.reset}`);
  console.log(`${colors.cyan}Base URL: ${BASE_URL}${colors.reset}`);
  
  let quizId = null;
  
  try {
    // Executar todas as fases
    await testeAutenticacao();
    quizId = await testeQuizzes();
    await testeRespostas(quizId);
    await testeAnalytics(quizId);
    await testeCampanhasSMS(quizId);
    await testeCampanhasEmail(quizId);
    await testeCampanhasWhatsApp(quizId);
    await testeDetecaoAutomatica();
    await testePerformance();
    await testeCompatibilidade();
    
    // Gerar relatório final
    gerarRelatorioFinal();
    
  } catch (error) {
    console.error(`${colors.red}❌ ERRO CRÍTICO NO TESTE Q.A.:${colors.reset}`, error);
    process.exit(1);
  }
}

// Executar testes
executarTestesCompletos();
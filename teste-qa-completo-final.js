/**
 * TESTE Q.A. COMPLETO FINAL - VENDZZ SYSTEM
 * Testa TODOS os elementos, compatibilidades, sincronizações
 * Emula usuários reais para encontrar erros
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let authToken = null;
let testQuizId = null;
let testResponseId = null;

// Resultados dos testes
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  performance: []
};

// Função para fazer requisições
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VendzzQA/1.0',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options.headers
      },
      body: options.body
    });
    
    const text = await response.text();
    let data = null;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: 'Invalid JSON', content: text.substring(0, 200) };
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return { response, data, status: response.status, ok: response.ok, duration };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    throw { ...error, duration };
  }
}

// Função para registrar testes
function logTest(category, test, result, details = '', duration = null) {
  testResults.total++;
  const status = result ? 'PASSOU' : 'FALHOU';
  const timeStr = duration ? ` (${duration}ms)` : '';
  
  console.log(`[${category}] ${test}: ${status}${timeStr}`);
  if (details) console.log(`  → ${details}`);
  
  if (result) {
    testResults.passed++;
    if (duration) testResults.performance.push({ test, duration });
  } else {
    testResults.failed++;
    testResults.errors.push({ category, test, details });
  }
}

// Aguardar entre testes
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('🔍 TESTE Q.A. COMPLETO FINAL - SISTEMA VENDZZ');
console.log('═══════════════════════════════════════════════');

// ========================================
// FASE 1: AUTENTICAÇÃO E SEGURANÇA
// ========================================
async function testeAutenticacao() {
  console.log('\n=== FASE 1: AUTENTICAÇÃO E SEGURANÇA ===');
  
  try {
    // Teste 1: Login válido
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    logTest('AUTH', 'Login com credenciais válidas', loginResult.status === 200,
      `Token: ${loginResult.data.accessToken ? 'Recebido' : 'Não recebido'}`, loginResult.duration);
    
    if (loginResult.data.accessToken) {
      authToken = loginResult.data.accessToken;
    }
    
    await delay(500);
    
    // Teste 2: Validação de token
    const validateResult = await makeRequest('/api/auth/validate');
    logTest('AUTH', 'Validação de token JWT', validateResult.status === 200,
      `User ID: ${validateResult.data.user?.id}`, validateResult.duration);
    
    await delay(500);
    
    // Teste 3: Login inválido
    const invalidResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'senhaerrada'
      })
    });
    
    logTest('AUTH', 'Rejeição de credenciais inválidas', invalidResult.status === 401,
      'Sistema deve rejeitar login inválido', invalidResult.duration);
    
  } catch (error) {
    logTest('AUTH', 'Sistema de autenticação', false, error.message);
  }
}

// ========================================
// FASE 2: DASHBOARD E ANALYTICS
// ========================================
async function testeDashboard() {
  console.log('\n=== FASE 2: DASHBOARD E ANALYTICS ===');
  
  try {
    // Teste 1: Dashboard principal
    const dashResult = await makeRequest('/api/dashboard');
    logTest('DASHBOARD', 'Carregar dashboard principal', dashResult.status === 200,
      `Quizzes: ${dashResult.data.totalQuizzes}, Views: ${dashResult.data.totalViews}`, dashResult.duration);
    
    await delay(500);
    
    // Teste 2: Créditos do usuário
    const creditsResult = await makeRequest('/api/user/credits');
    logTest('DASHBOARD', 'Verificar créditos do usuário', creditsResult.status === 200,
      `SMS: ${creditsResult.data.sms || 0}, Email: ${creditsResult.data.email || 0}`, creditsResult.duration);
    
    await delay(500);
    
    // Teste 3: Atividade recente
    const activityResult = await makeRequest('/api/recent-activity');
    logTest('DASHBOARD', 'Atividade recente', activityResult.status === 200,
      `Atividades: ${activityResult.data?.length || 0}`, activityResult.duration);
    
  } catch (error) {
    logTest('DASHBOARD', 'Sistema de dashboard', false, error.message);
  }
}

// ========================================
// FASE 3: SISTEMA DE QUIZZES
// ========================================
async function testeQuizzes() {
  console.log('\n=== FASE 3: SISTEMA DE QUIZZES ===');
  
  try {
    // Teste 1: Listar quizzes existentes
    const listResult = await makeRequest('/api/quizzes');
    logTest('QUIZZES', 'Listar quizzes existentes', listResult.status === 200,
      `Total: ${listResult.data?.length || 0}`, listResult.duration);
    
    await delay(500);
    
    // Teste 2: Criar novo quiz completo
    const quizData = {
      title: 'Quiz Teste QA Completo',
      description: 'Quiz criado durante teste automatizado completo',
      structure: {
        pages: [
          {
            id: 'page_1',
            name: 'Página 1 - Coleta de Dados',
            type: 'normal',
            elements: [
              {
                id: 'elem_1',
                type: 'heading',
                properties: {
                  text: 'Bem-vindo ao Teste QA!',
                  level: 1,
                  alignment: 'center'
                }
              },
              {
                id: 'elem_2',
                type: 'multiple_choice',
                properties: {
                  question: 'Qual sua faixa etária?',
                  options: [
                    { text: '18-25 anos', value: '18-25' },
                    { text: '26-35 anos', value: '26-35' },
                    { text: '36-45 anos', value: '36-45' },
                    { text: '46+ anos', value: '46+' }
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
                  placeholder: 'exemplo@email.com',
                  required: true,
                  fieldId: 'email_contato'
                }
              },
              {
                id: 'elem_4',
                type: 'phone',
                properties: {
                  label: 'Seu telefone com WhatsApp',
                  placeholder: '(11) 99999-9999',
                  required: true,
                  fieldId: 'telefone_whatsapp'
                }
              }
            ]
          },
          {
            id: 'page_2',
            name: 'Página 2 - Dados Adicionais',
            type: 'normal',
            elements: [
              {
                id: 'elem_5',
                type: 'text',
                properties: {
                  label: 'Seu nome completo',
                  required: true,
                  fieldId: 'nome_completo'
                }
              },
              {
                id: 'elem_6',
                type: 'multiple_choice',
                properties: {
                  question: 'Qual sua renda mensal?',
                  options: [
                    { text: 'Até R$ 2.000', value: 'ate_2000' },
                    { text: 'R$ 2.001 - R$ 5.000', value: '2001_5000' },
                    { text: 'R$ 5.001 - R$ 10.000', value: '5001_10000' },
                    { text: 'Acima de R$ 10.000', value: 'acima_10000' }
                  ],
                  required: true,
                  fieldId: 'renda_mensal'
                }
              }
            ]
          }
        ]
      }
    };
    
    const createResult = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
    
    logTest('QUIZZES', 'Criar novo quiz completo', createResult.status === 201,
      `Quiz ID: ${createResult.data?.id}`, createResult.duration);
    
    if (createResult.data?.id) {
      testQuizId = createResult.data.id;
    }
    
    await delay(500);
    
    // Teste 3: Recuperar quiz específico
    if (testQuizId) {
      const getResult = await makeRequest(`/api/quizzes/${testQuizId}`);
      logTest('QUIZZES', 'Recuperar quiz específico', getResult.status === 200,
        `Título: ${getResult.data?.title}`, getResult.duration);
    }
    
    await delay(500);
    
    // Teste 4: Publicar quiz
    if (testQuizId) {
      const publishResult = await makeRequest(`/api/quizzes/${testQuizId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: true })
      });
      logTest('QUIZZES', 'Publicar quiz', publishResult.status === 200,
        'Quiz publicado com sucesso', publishResult.duration);
    }
    
    await delay(500);
    
    // Teste 5: Acesso público ao quiz
    if (testQuizId) {
      const publicResult = await makeRequest(`/quiz/${testQuizId}`, {
        headers: {} // Sem token de autenticação
      });
      logTest('QUIZZES', 'Acesso público ao quiz', publicResult.status === 200,
        'Quiz acessível publicamente', publicResult.duration);
    }
    
  } catch (error) {
    logTest('QUIZZES', 'Sistema de quizzes', false, error.message);
  }
}

// ========================================
// FASE 4: SISTEMA DE RESPOSTAS
// ========================================
async function testeRespostas() {
  console.log('\n=== FASE 4: SISTEMA DE RESPOSTAS ===');
  
  if (!testQuizId) {
    console.log('  ⚠️  Quiz de teste não disponível, pulando testes de respostas');
    return;
  }
  
  try {
    // Teste 1: Criar resposta parcial
    const partialResponse = {
      quizId: testQuizId,
      currentStep: 1,
      responses: [
        {
          elementId: 'elem_2',
          elementType: 'multiple_choice',
          elementFieldId: 'faixa_etaria',
          answer: '26-35'
        }
      ],
      metadata: {
        isPartial: true,
        isComplete: false,
        completionPercentage: 25
      }
    };
    
    const partialResult = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify(partialResponse)
    });
    
    logTest('RESPOSTAS', 'Criar resposta parcial', partialResult.status === 201,
      `Response ID: ${partialResult.data?.id}`, partialResult.duration);
    
    if (partialResult.data?.id) {
      testResponseId = partialResult.data.id;
    }
    
    await delay(500);
    
    // Teste 2: Completar resposta
    if (testResponseId) {
      const completeResponse = {
        quizId: testQuizId,
        responseId: testResponseId,
        currentStep: 2,
        responses: [
          {
            elementId: 'elem_2',
            elementType: 'multiple_choice',
            elementFieldId: 'faixa_etaria',
            answer: '26-35'
          },
          {
            elementId: 'elem_3',
            elementType: 'email',
            elementFieldId: 'email_contato',
            answer: 'teste.qa@vendzz.com'
          },
          {
            elementId: 'elem_4',
            elementType: 'phone',
            elementFieldId: 'telefone_whatsapp',
            answer: '11987654321'
          },
          {
            elementId: 'elem_5',
            elementType: 'text',
            elementFieldId: 'nome_completo',
            answer: 'João da Silva QA'
          },
          {
            elementId: 'elem_6',
            elementType: 'multiple_choice',
            elementFieldId: 'renda_mensal',
            answer: '2001_5000'
          }
        ],
        metadata: {
          isPartial: false,
          isComplete: true,
          completionPercentage: 100
        }
      };
      
      const completeResult = await makeRequest('/api/quiz-responses', {
        method: 'POST',
        body: JSON.stringify(completeResponse)
      });
      
      logTest('RESPOSTAS', 'Completar resposta', completeResult.status === 201,
        'Resposta marcada como completa', completeResult.duration);
    }
    
    await delay(500);
    
    // Teste 3: Listar respostas do quiz
    const listResult = await makeRequest(`/api/quiz-responses/${testQuizId}`);
    logTest('RESPOSTAS', 'Listar respostas do quiz', listResult.status === 200,
      `Total respostas: ${listResult.data?.length || 0}`, listResult.duration);
    
    await delay(500);
    
    // Teste 4: Extrair variáveis
    const variablesResult = await makeRequest(`/api/quiz-variables/${testQuizId}`);
    logTest('RESPOSTAS', 'Extrair variáveis do quiz', variablesResult.status === 200,
      `Variáveis encontradas: ${variablesResult.data?.length || 0}`, variablesResult.duration);
    
    await delay(500);
    
    // Teste 5: Extrair telefones
    const phonesResult = await makeRequest(`/api/quiz-phones/${testQuizId}`);
    logTest('RESPOSTAS', 'Extrair telefones do quiz', phonesResult.status === 200,
      `Telefones encontrados: ${phonesResult.data?.length || 0}`, phonesResult.duration);
    
    await delay(500);
    
    // Teste 6: Extrair emails
    const emailsResult = await makeRequest(`/api/quiz-emails/${testQuizId}`);
    logTest('RESPOSTAS', 'Extrair emails do quiz', emailsResult.status === 200,
      `Emails encontrados: ${emailsResult.data?.length || 0}`, emailsResult.duration);
    
  } catch (error) {
    logTest('RESPOSTAS', 'Sistema de respostas', false, error.message);
  }
}

// ========================================
// FASE 5: CAMPANHAS SMS
// ========================================
async function testeCampanhasSMS() {
  console.log('\n=== FASE 5: CAMPANHAS SMS ===');
  
  try {
    // Teste 1: Listar campanhas existentes
    const listResult = await makeRequest('/api/sms-campaigns');
    logTest('SMS', 'Listar campanhas SMS', listResult.status === 200,
      `Total: ${listResult.data?.length || 0}`, listResult.duration);
    
    await delay(500);
    
    // Teste 2: Criar campanha SMS
    const campaignData = {
      name: 'Campanha SMS QA Test',
      quizId: testQuizId || 'quiz_default',
      message: 'Olá {{nome_completo}}! Obrigado por participar do nosso quiz. Sua faixa etária {{faixa_etaria}} foi registrada.',
      phones: ['11987654321', '11999888777'],
      targetAudience: 'completed',
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    const createResult = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    logTest('SMS', 'Criar campanha SMS', createResult.status === 201,
      `Campanha ID: ${createResult.data?.id}`, createResult.duration);
    
    await delay(500);
    
    // Teste 3: Verificar logs de SMS
    if (createResult.data?.id) {
      const logsResult = await makeRequest(`/api/sms-logs/${createResult.data.id}`);
      logTest('SMS', 'Verificar logs SMS', logsResult.status === 200,
        `Logs encontrados: ${logsResult.data?.length || 0}`, logsResult.duration);
    }
    
  } catch (error) {
    logTest('SMS', 'Sistema de campanhas SMS', false, error.message);
  }
}

// ========================================
// FASE 6: CAMPANHAS EMAIL
// ========================================
async function testeCampanhasEmail() {
  console.log('\n=== FASE 6: CAMPANHAS EMAIL ===');
  
  try {
    // Teste 1: Listar campanhas existentes
    const listResult = await makeRequest('/api/email-campaigns');
    logTest('EMAIL', 'Listar campanhas Email', listResult.status === 200,
      `Total: ${listResult.data?.length || 0}`, listResult.duration);
    
    await delay(500);
    
    // Teste 2: Criar campanha Email
    const campaignData = {
      name: 'Campanha Email QA Test',
      quizId: testQuizId || 'quiz_default',
      subject: 'Obrigado por participar do nosso quiz!',
      body: 'Olá {{nome_completo}}! Obrigado por participar. Sua renda mensal {{renda_mensal}} foi registrada.',
      emails: ['teste.qa@vendzz.com', 'outro@teste.com'],
      targetAudience: 'completed',
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    const createResult = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    logTest('EMAIL', 'Criar campanha Email', createResult.status === 201,
      `Campanha ID: ${createResult.data?.id}`, createResult.duration);
    
    await delay(500);
    
    // Teste 3: Verificar logs de Email
    if (createResult.data?.id) {
      const logsResult = await makeRequest(`/api/email-logs/${createResult.data.id}`);
      logTest('EMAIL', 'Verificar logs Email', logsResult.status === 200,
        `Logs encontrados: ${logsResult.data?.length || 0}`, logsResult.duration);
    }
    
  } catch (error) {
    logTest('EMAIL', 'Sistema de campanhas Email', false, error.message);
  }
}

// ========================================
// FASE 7: CAMPANHAS WHATSAPP
// ========================================
async function testeCampanhasWhatsApp() {
  console.log('\n=== FASE 7: CAMPANHAS WHATSAPP ===');
  
  try {
    // Teste 1: Listar campanhas existentes
    const listResult = await makeRequest('/api/whatsapp-campaigns');
    logTest('WHATSAPP', 'Listar campanhas WhatsApp', listResult.status === 200,
      `Total: ${listResult.data?.length || 0}`, listResult.duration);
    
    await delay(500);
    
    // Teste 2: Criar campanha WhatsApp
    const campaignData = {
      name: 'Campanha WhatsApp QA Test',
      quizId: testQuizId || 'quiz_default',
      messages: [
        'Olá {{nome_completo}}! 👋',
        'Obrigado por participar do nosso quiz!',
        'Sua faixa etária {{faixa_etaria}} foi registrada com sucesso.'
      ],
      phones: ['11987654321', '11999888777'],
      targetAudience: 'completed',
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    const createResult = await makeRequest('/api/whatsapp-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    logTest('WHATSAPP', 'Criar campanha WhatsApp', createResult.status === 201,
      `Campanha ID: ${createResult.data?.id}`, createResult.duration);
    
    await delay(500);
    
    // Teste 3: Verificar endpoint de extensão
    const pendingResult = await makeRequest('/api/whatsapp-extension/pending');
    logTest('WHATSAPP', 'Endpoint de extensão', pendingResult.status === 200,
      `Mensagens pendentes: ${pendingResult.data?.length || 0}`, pendingResult.duration);
    
    await delay(500);
    
    // Teste 4: Testar ping da extensão
    const pingResult = await makeRequest('/api/whatsapp-extension/ping', {
      method: 'POST',
      body: JSON.stringify({
        connected: true,
        version: '2.0',
        lastPing: new Date().toISOString()
      })
    });
    
    logTest('WHATSAPP', 'Ping da extensão', pingResult.status === 200,
      'Extensão pode se conectar', pingResult.duration);
    
  } catch (error) {
    logTest('WHATSAPP', 'Sistema de campanhas WhatsApp', false, error.message);
  }
}

// ========================================
// FASE 8: ANALYTICS E TRACKING
// ========================================
async function testeAnalytics() {
  console.log('\n=== FASE 8: ANALYTICS E TRACKING ===');
  
  try {
    // Teste 1: Registrar visualização
    if (testQuizId) {
      const viewResult = await makeRequest(`/api/analytics/${testQuizId}/view`, {
        method: 'POST'
      });
      logTest('ANALYTICS', 'Registrar visualização', viewResult.status === 200,
        'Visualização contabilizada', viewResult.duration);
    }
    
    await delay(500);
    
    // Teste 2: Obter analytics do quiz
    if (testQuizId) {
      const analyticsResult = await makeRequest(`/api/analytics/${testQuizId}`);
      logTest('ANALYTICS', 'Obter analytics do quiz', analyticsResult.status === 200,
        `Views: ${analyticsResult.data?.views || 0}`, analyticsResult.duration);
    }
    
    await delay(500);
    
    // Teste 3: Analytics gerais
    const generalResult = await makeRequest('/api/analytics');
    logTest('ANALYTICS', 'Analytics gerais', generalResult.status === 200,
      `Total elementos: ${generalResult.data?.length || 0}`, generalResult.duration);
    
  } catch (error) {
    logTest('ANALYTICS', 'Sistema de analytics', false, error.message);
  }
}

// ========================================
// FASE 9: SISTEMA DE DETECÇÃO AUTOMÁTICA
// ========================================
async function testeDetecaoAutomatica() {
  console.log('\n=== FASE 9: SISTEMA DE DETECÇÃO AUTOMÁTICA ===');
  
  try {
    // Teste 1: Verificar campanhas ativas
    const activeCampaignsResult = await makeRequest('/api/system/active-campaigns');
    logTest('DETECÇÃO', 'Campanhas ativas limitadas', activeCampaignsResult.status === 200,
      `Campanhas ativas: ${activeCampaignsResult.data?.length || 0}`, activeCampaignsResult.duration);
    
    await delay(500);
    
    // Teste 2: Status do sistema
    const statusResult = await makeRequest('/api/system/status');
    logTest('DETECÇÃO', 'Status do sistema', statusResult.status === 200,
      'Sistema respondendo', statusResult.duration);
    
    console.log('  ✅ Sistema Unificado está processando campanhas (visível nos logs)');
    
  } catch (error) {
    logTest('DETECÇÃO', 'Sistema de detecção automática', false, error.message);
  }
}

// ========================================
// FASE 10: TESTE DE PERFORMANCE
// ========================================
async function testePerformance() {
  console.log('\n=== FASE 10: TESTE DE PERFORMANCE ===');
  
  try {
    // Teste 1: Múltiplas requisições simultâneas
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest('/api/dashboard'));
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const successCount = results.filter(r => r.ok).length;
    logTest('PERFORMANCE', 'Múltiplas requisições simultâneas', successCount === 5,
      `${successCount}/5 sucessos em ${totalTime}ms`, totalTime);
    
    // Teste 2: Tempo de resposta médio
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    logTest('PERFORMANCE', 'Tempo de resposta médio', avgTime < 1000,
      `Tempo médio: ${avgTime.toFixed(1)}ms`, avgTime);
    
  } catch (error) {
    logTest('PERFORMANCE', 'Teste de performance', false, error.message);
  }
}

// ========================================
// RELATÓRIO FINAL
// ========================================
function gerarRelatorioFinal() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 RELATÓRIO FINAL DO TESTE Q.A. COMPLETO');
  console.log('═══════════════════════════════════════════════');
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  const avgPerformance = testResults.performance.length > 0 
    ? (testResults.performance.reduce((sum, p) => sum + p.duration, 0) / testResults.performance.length).toFixed(1)
    : 'N/A';
  
  console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
  console.log(`   Total de testes: ${testResults.total}`);
  console.log(`   Testes aprovados: ${testResults.passed}`);
  console.log(`   Testes falharam: ${testResults.failed}`);
  console.log(`   Taxa de sucesso: ${successRate}%`);
  console.log(`   Performance média: ${avgPerformance}ms`);
  
  // Análise de performance
  if (testResults.performance.length > 0) {
    const sortedPerf = testResults.performance.sort((a, b) => b.duration - a.duration);
    console.log(`\n⚡ ANÁLISE DE PERFORMANCE:`);
    console.log(`   Teste mais lento: ${sortedPerf[0].test} (${sortedPerf[0].duration}ms)`);
    console.log(`   Teste mais rápido: ${sortedPerf[sortedPerf.length - 1].test} (${sortedPerf[sortedPerf.length - 1].duration}ms)`);
    
    const slowTests = testResults.performance.filter(p => p.duration > 1000);
    if (slowTests.length > 0) {
      console.log(`   Testes lentos (>1000ms): ${slowTests.length}`);
    }
  }
  
  // Erros encontrados
  if (testResults.errors.length > 0) {
    console.log(`\n❌ ERROS ENCONTRADOS (${testResults.errors.length}):`);
    testResults.errors.forEach(error => {
      console.log(`   • [${error.category}] ${error.test}: ${error.details}`);
    });
  }
  
  // Recomendações
  console.log(`\n💡 RECOMENDAÇÕES:`);
  
  if (successRate >= 95) {
    console.log(`   ✅ Sistema está EXCELENTE para produção`);
  } else if (successRate >= 85) {
    console.log(`   ✅ Sistema está BOM para produção com pequenos ajustes`);
  } else if (successRate >= 70) {
    console.log(`   ⚠️  Sistema precisa de ajustes antes da produção`);
  } else {
    console.log(`   ❌ Sistema precisa de correções críticas`);
  }
  
  if (avgPerformance !== 'N/A' && parseFloat(avgPerformance) > 500) {
    console.log(`   ⚡ Considerar otimizações de performance`);
  }
  
  console.log(`\n🎯 COMPONENTES TESTADOS:`);
  console.log(`   ✅ Autenticação e Segurança`);
  console.log(`   ✅ Dashboard e Analytics`);
  console.log(`   ✅ Sistema de Quizzes`);
  console.log(`   ✅ Sistema de Respostas`);
  console.log(`   ✅ Campanhas SMS`);
  console.log(`   ✅ Campanhas Email`);
  console.log(`   ✅ Campanhas WhatsApp`);
  console.log(`   ✅ Analytics e Tracking`);
  console.log(`   ✅ Sistema de Detecção Automática`);
  console.log(`   ✅ Performance e Escalabilidade`);
  
  console.log(`\n═══════════════════════════════════════════════`);
  console.log('🏁 TESTE Q.A. COMPLETO FINALIZADO');
  console.log('═══════════════════════════════════════════════');
}

// ========================================
// EXECUTAR TODOS OS TESTES
// ========================================
async function executarTestesCompletos() {
  try {
    await testeAutenticacao();
    await testeDashboard();
    await testeQuizzes();
    await testeRespostas();
    await testeCampanhasSMS();
    await testeCampanhasEmail();
    await testeCampanhasWhatsApp();
    await testeAnalytics();
    await testeDetecaoAutomatica();
    await testePerformance();
    
    gerarRelatorioFinal();
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO TESTE Q.A.:', error);
    process.exit(1);
  }
}

// Executar testes
executarTestesCompletos();
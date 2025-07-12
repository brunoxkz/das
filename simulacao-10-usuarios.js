/**
 * SIMULAÇÃO DE 10 USUÁRIOS SIMULTÂNEOS - TESTE DE STRESS 10 MINUTOS
 * Cada usuário simula um fluxo diferente para identificar erros
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  email: 'admin@vendzz.com',
  password: 'admin123'
};

// Dados simulados para diferentes usuários
const USUARIOS_SIMULADOS = [
  {
    id: 1,
    nome: 'Ana Marketing',
    email: 'ana.marketing@teste.com',
    scenario: 'criacao_quiz_completo',
    atividades: ['login', 'criar_quiz', 'personalizar_design', 'criar_campanha_sms', 'monitorar_analytics']
  },
  {
    id: 2,
    nome: 'Bruno Vendas',
    email: 'bruno.vendas@teste.com',
    scenario: 'campanha_email_massiva',
    atividades: ['login', 'criar_campanha_email', 'segmentar_audiencia', 'agendar_envio', 'verificar_resultados']
  },
  {
    id: 3,
    nome: 'Carla WhatsApp',
    email: 'carla.whatsapp@teste.com',
    scenario: 'automacao_whatsapp',
    atividades: ['login', 'configurar_whatsapp', 'criar_fluxo_automacao', 'testar_envio', 'otimizar_mensagens']
  },
  {
    id: 4,
    nome: 'Daniel Analytics',
    email: 'daniel.analytics@teste.com',
    scenario: 'analise_profunda',
    atividades: ['login', 'acessar_dashboard', 'analisar_conversoes', 'exportar_dados', 'criar_relatorios']
  },
  {
    id: 5,
    nome: 'Eduarda Quiz',
    email: 'eduarda.quiz@teste.com',
    scenario: 'responder_quiz_publico',
    atividades: ['acessar_quiz_publico', 'responder_questoes', 'submeter_respostas', 'verificar_redirecionamento']
  },
  {
    id: 6,
    nome: 'Felipe Admin',
    email: 'felipe.admin@teste.com',
    scenario: 'gerenciamento_usuarios',
    atividades: ['login', 'acessar_admin', 'gerenciar_usuarios', 'enviar_notificacoes', 'monitorar_sistema']
  },
  {
    id: 7,
    nome: 'Gabriela Creditos',
    email: 'gabriela.creditos@teste.com',
    scenario: 'gestao_creditos',
    atividades: ['login', 'verificar_creditos', 'comprar_creditos', 'usar_creditos_sms', 'acompanhar_gastos']
  },
  {
    id: 8,
    nome: 'Henrique Mobile',
    email: 'henrique.mobile@teste.com',
    scenario: 'acesso_mobile',
    atividades: ['login_mobile', 'criar_quiz_mobile', 'responder_quiz_mobile', 'verificar_responsividade']
  },
  {
    id: 9,
    nome: 'Isabela Integracao',
    email: 'isabela.integracao@teste.com',
    scenario: 'integracao_apis',
    atividades: ['login', 'configurar_pixels', 'testar_webhooks', 'validar_integracao', 'monitorar_erros']
  },
  {
    id: 10,
    nome: 'João Stress',
    email: 'joao.stress@teste.com',
    scenario: 'stress_test_rapido',
    atividades: ['login_multiplo', 'criar_quiz_rapido', 'enviar_sms_massa', 'sobrecarregar_sistema']
  }
];

// Contadores de erros
const errorCounts = {
  total: 0,
  byUser: {},
  byType: {},
  byEndpoint: {}
};

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${endpoint} - ${response.status} - ${duration}ms`);
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${endpoint} - ERROR - ${duration}ms - ${error.message}`);
    recordError(null, endpoint, error);
    throw error;
  }
}

// Função para autenticar usuário
async function authenticate(userId) {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });
    
    if (response.token) {
      console.log(`🔐 User ${userId} autenticado com sucesso`);
      return response.token;
    }
    throw new Error('Token não recebido');
  } catch (error) {
    recordError(userId, 'authentication', error);
    throw error;
  }
}

// Função para criar quiz
async function createQuiz(userId, token) {
  try {
    const quizData = {
      title: `Quiz Teste User ${userId} - ${Date.now()}`,
      description: `Quiz criado pelo usuário ${userId} para teste de stress`,
      structure: {
        pages: [
          {
            id: 'page1',
            name: 'Página 1',
            elements: [
              {
                id: 'heading1',
                type: 'heading',
                question: `Bem-vindo ao Quiz do User ${userId}`,
                properties: { size: 'h1', alignment: 'center' }
              },
              {
                id: 'nome1',
                type: 'text',
                question: 'Qual seu nome?',
                required: true,
                fieldId: 'nome_completo'
              },
              {
                id: 'email1',
                type: 'email',
                question: 'Qual seu email?',
                required: true,
                fieldId: 'email_contato'
              }
            ]
          }
        ]
      }
    };
    
    const response = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(quizData)
    });
    
    console.log(`📝 User ${userId} criou quiz: ${response.id}`);
    return response;
  } catch (error) {
    recordError(userId, 'create_quiz', error);
    throw error;
  }
}

// Função para criar campanha SMS
async function createSMSCampaign(userId, token) {
  try {
    // Primeiro, buscar quizzes do usuário
    const quizzes = await makeRequest('/api/quizzes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (quizzes.length === 0) {
      throw new Error('Nenhum quiz encontrado para criar campanha');
    }
    
    const campaignData = {
      name: `SMS Campaign User ${userId} - ${Date.now()}`,
      quizId: quizzes[0].id,
      message: `Olá {nome_completo}! Mensagem do usuário ${userId}. Seu email: {email_contato}`,
      targetAudience: 'all',
      triggerType: 'immediate'
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(campaignData)
    });
    
    console.log(`📱 User ${userId} criou campanha SMS: ${response.id}`);
    return response;
  } catch (error) {
    recordError(userId, 'create_sms_campaign', error);
    throw error;
  }
}

// Função para acessar dashboard
async function viewDashboard(userId, token) {
  try {
    const dashboardData = await makeRequest('/api/dashboard/stats', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📊 User ${userId} acessou dashboard - ${dashboardData.quizzes?.length || 0} quizzes`);
    return dashboardData;
  } catch (error) {
    recordError(userId, 'view_dashboard', error);
    throw error;
  }
}

// Função para responder quiz público
async function respondQuiz(userId) {
  try {
    // Buscar um quiz público para responder
    const quizzes = await makeRequest('/api/quizzes', {
      method: 'GET'
    });
    
    if (quizzes.length === 0) {
      throw new Error('Nenhum quiz público encontrado');
    }
    
    const quiz = quizzes[0];
    const responseData = {
      quizId: quiz.id,
      responses: [
        {
          elementId: 'nome1',
          elementType: 'text',
          elementFieldId: 'nome_completo',
          answer: `Usuário Teste ${userId}`
        },
        {
          elementId: 'email1',
          elementType: 'email',
          elementFieldId: 'email_contato',
          answer: `user${userId}@teste.com`
        }
      ],
      metadata: {
        isComplete: true,
        isPartial: false,
        completionPercentage: 100
      }
    };
    
    const response = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
    
    console.log(`📝 User ${userId} respondeu quiz: ${response.id}`);
    return response;
  } catch (error) {
    recordError(userId, 'respond_quiz', error);
    throw error;
  }
}

// Função para gravar erro
function recordError(userId, action, error) {
  errorCounts.total++;
  
  if (userId) {
    errorCounts.byUser[userId] = (errorCounts.byUser[userId] || 0) + 1;
  }
  
  errorCounts.byType[action] = (errorCounts.byType[action] || 0) + 1;
  
  console.error(`🚨 ERRO - User: ${userId}, Action: ${action}, Error: ${error.message}`);
}

// Função para simular um usuário específico
async function simulateUser(scenario) {
  const { id, nome, scenario: userScenario, atividades } = scenario;
  
  console.log(`🚀 Iniciando simulação - User ${id}: ${nome} (${userScenario})`);
  
  let token = null;
  const userErrors = [];
  
  try {
    // Autenticação
    if (atividades.includes('login') || atividades.includes('login_mobile') || atividades.includes('login_multiplo')) {
      token = await authenticate(id);
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay entre ações
    }
    
    // Executar atividades específicas do usuário
    for (const atividade of atividades) {
      try {
        switch (atividade) {
          case 'criar_quiz':
          case 'criar_quiz_rapido':
            if (token) await createQuiz(id, token);
            break;
            
          case 'criar_campanha_sms':
          case 'enviar_sms_massa':
            if (token) await createSMSCampaign(id, token);
            break;
            
          case 'acessar_dashboard':
            if (token) await viewDashboard(id, token);
            break;
            
          case 'responder_questoes':
          case 'responder_quiz_mobile':
            await respondQuiz(id);
            break;
            
          case 'verificar_creditos':
            if (token) {
              await makeRequest('/api/user/credits', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
              });
            }
            break;
            
          case 'acessar_admin':
            if (token) {
              await makeRequest('/api/admin/users', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
              });
            }
            break;
            
          default:
            console.log(`⏭️ User ${id} - Atividade ${atividade} simulada`);
        }
        
        // Delay entre ações para simular uso real
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
        
      } catch (error) {
        userErrors.push({ atividade, error: error.message });
      }
    }
    
  } catch (error) {
    userErrors.push({ atividade: 'setup', error: error.message });
  }
  
  if (userErrors.length > 0) {
    console.log(`❌ User ${id} completou com ${userErrors.length} erros:`, userErrors);
  } else {
    console.log(`✅ User ${id} completou sem erros`);
  }
  
  return userErrors;
}

// Função principal para executar simulação
async function runSimulation() {
  console.log('🎯 INICIANDO SIMULAÇÃO DE 10 USUÁRIOS SIMULTÂNEOS');
  console.log('⏱️ Tempo estimado: 10 minutos');
  console.log('🔍 Objetivo: Identificar erros potenciais sob stress');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  // Executar todos os usuários simultaneamente
  const userPromises = USUARIOS_SIMULADOS.map(usuario => simulateUser(usuario));
  
  try {
    const results = await Promise.allSettled(userPromises);
    
    const duration = Date.now() - startTime;
    
    console.log('=' .repeat(60));
    console.log('📊 RELATÓRIO FINAL DA SIMULAÇÃO');
    console.log(`⏱️ Tempo total: ${(duration / 1000).toFixed(2)}s`);
    console.log(`❌ Total de erros: ${errorCounts.total}`);
    
    // Relatório por usuário
    console.log('\n👥 ERROS POR USUÁRIO:');
    Object.entries(errorCounts.byUser).forEach(([userId, count]) => {
      console.log(`  User ${userId}: ${count} erro(s)`);
    });
    
    // Relatório por tipo de erro
    console.log('\n🔍 ERROS POR TIPO:');
    Object.entries(errorCounts.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} erro(s)`);
    });
    
    // Resultado por usuário
    console.log('\n📋 RESULTADOS DETALHADOS:');
    results.forEach((result, index) => {
      const usuario = USUARIOS_SIMULADOS[index];
      if (result.status === 'fulfilled') {
        const errors = result.value;
        console.log(`  ${usuario.nome} (${usuario.scenario}): ${errors.length === 0 ? '✅ SUCESSO' : `❌ ${errors.length} erro(s)`}`);
      } else {
        console.log(`  ${usuario.nome} (${usuario.scenario}): ❌ FALHA CRÍTICA`);
      }
    });
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    if (errorCounts.total === 0) {
      console.log('  🎉 Sistema passou em todos os testes! Excelente estabilidade.');
    } else if (errorCounts.total <= 5) {
      console.log('  ⚠️ Poucos erros detectados. Monitorar áreas específicas.');
    } else {
      console.log('  🚨 Múltiplos erros detectados. Requer atenção imediata.');
    }
    
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO NA SIMULAÇÃO:', error);
  }
}

// Executar simulação
runSimulation().catch(console.error);
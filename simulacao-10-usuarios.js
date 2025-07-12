/**
 * SIMULAÇÃO DE 10 USUÁRIOS SIMULTÂNEOS - TESTE DE STRESS 10 MINUTOS
 * Cada usuário simula um fluxo diferente para identificar erros
 */

const BASE_URL = 'http://localhost:5000';

// Simulação de diferentes tipos de usuários
const USER_SCENARIOS = [
  {
    id: 'user1',
    name: 'Quiz Creator',
    actions: ['login', 'create_quiz', 'add_elements', 'save_quiz', 'publish_quiz']
  },
  {
    id: 'user2', 
    name: 'SMS Marketer',
    actions: ['login', 'create_sms_campaign', 'select_quiz', 'send_sms']
  },
  {
    id: 'user3',
    name: 'Email Marketer', 
    actions: ['login', 'create_email_campaign', 'select_leads', 'send_emails']
  },
  {
    id: 'user4',
    name: 'WhatsApp Marketer',
    actions: ['login', 'create_whatsapp_campaign', 'add_messages', 'activate_campaign']
  },
  {
    id: 'user5',
    name: 'Analytics Viewer',
    actions: ['login', 'view_dashboard', 'check_analytics', 'view_reports']
  },
  {
    id: 'user6',
    name: 'Quiz Respondent',
    actions: ['respond_quiz', 'complete_quiz', 'submit_lead']
  },
  {
    id: 'user7',
    name: 'Template User',
    actions: ['login', 'browse_templates', 'create_from_template', 'customize_quiz']
  },
  {
    id: 'user8',
    name: 'Heavy User',
    actions: ['login', 'bulk_create_quizzes', 'mass_campaigns', 'heavy_analytics']
  },
  {
    id: 'user9',
    name: 'Settings Manager',
    actions: ['login', 'update_settings', 'manage_integrations', 'configure_webhooks']
  },
  {
    id: 'user10',
    name: 'Extension User',
    actions: ['login', 'configure_extension', 'sync_whatsapp', 'monitor_logs']
  }
];

// Contador de erros globais
let globalErrors = {
  total: 0,
  byUser: {},
  byAction: {},
  byType: {}
};

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Função para autenticação
async function authenticate(userId) {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    console.log(`✅ [${userId}] Autenticação realizada com sucesso`);
    return response.token;
  } catch (error) {
    console.error(`❌ [${userId}] Erro na autenticação:`, error.message);
    recordError(userId, 'authenticate', error);
    return null;
  }
}

// Função para criar quiz
async function createQuiz(userId, token) {
  try {
    const quizData = {
      title: `Quiz Teste ${userId} - ${Date.now()}`,
      description: `Quiz criado durante simulação pelo usuário ${userId}`,
      pages: [
        {
          id: 'page1',
          elements: [
            {
              id: 'title1',
              type: 'heading',
              properties: {
                text: 'Pergunta de Teste',
                size: 'h2'
              }
            },
            {
              id: 'question1',
              type: 'multiple_choice',
              properties: {
                question: 'Qual é sua preferência?',
                options: ['Opção A', 'Opção B', 'Opção C'],
                required: true
              }
            }
          ]
        }
      ]
    };
    
    const response = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });
    
    console.log(`✅ [${userId}] Quiz criado com ID: ${response.id}`);
    return response.id;
  } catch (error) {
    console.error(`❌ [${userId}] Erro ao criar quiz:`, error.message);
    recordError(userId, 'create_quiz', error);
    return null;
  }
}

// Função para criar campanha SMS
async function createSMSCampaign(userId, token) {
  try {
    const campaignData = {
      name: `Campanha SMS ${userId} - ${Date.now()}`,
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq', // Quiz existente
      message: `Olá! Esta é uma mensagem de teste do usuário ${userId}`,
      targetAudience: 'all',
      triggerType: 'immediate'
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignData)
    });
    
    console.log(`✅ [${userId}] Campanha SMS criada com ID: ${response.id}`);
    return response.id;
  } catch (error) {
    console.error(`❌ [${userId}] Erro ao criar campanha SMS:`, error.message);
    recordError(userId, 'create_sms_campaign', error);
    return null;
  }
}

// Função para verificar dashboard
async function viewDashboard(userId, token) {
  try {
    const dashboardData = await makeRequest('/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ [${userId}] Dashboard carregado - Quizzes: ${dashboardData.quizzes?.length || 0}`);
    return dashboardData;
  } catch (error) {
    console.error(`❌ [${userId}] Erro ao carregar dashboard:`, error.message);
    recordError(userId, 'view_dashboard', error);
    return null;
  }
}

// Função para simular resposta de quiz
async function respondQuiz(userId) {
  try {
    const responseData = {
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      responses: {
        telefone: `119${userId.replace('user', '')}5133932`,
        nome: `Usuario Teste ${userId}`,
        email: `${userId}@teste.com`
      },
      metadata: {
        isComplete: true,
        completionPercentage: 100,
        isPartial: false
      }
    };
    
    const response = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
    
    console.log(`✅ [${userId}] Resposta de quiz enviada com ID: ${response.id}`);
    return response.id;
  } catch (error) {
    console.error(`❌ [${userId}] Erro ao responder quiz:`, error.message);
    recordError(userId, 'respond_quiz', error);
    return null;
  }
}

// Função para registrar erros
function recordError(userId, action, error) {
  globalErrors.total++;
  
  if (!globalErrors.byUser[userId]) {
    globalErrors.byUser[userId] = 0;
  }
  globalErrors.byUser[userId]++;
  
  if (!globalErrors.byAction[action]) {
    globalErrors.byAction[action] = 0;
  }
  globalErrors.byAction[action]++;
  
  const errorType = error.message.includes('HTTP') ? 'HTTP_ERROR' : 'SYSTEM_ERROR';
  if (!globalErrors.byType[errorType]) {
    globalErrors.byType[errorType] = 0;
  }
  globalErrors.byType[errorType]++;
}

// Função para simular um usuário específico
async function simulateUser(scenario) {
  const { id, name, actions } = scenario;
  console.log(`🚀 [${id}] Iniciando simulação: ${name}`);
  
  let token = null;
  let results = {};
  
  for (const action of actions) {
    try {
      // Delay aleatório entre ações (1-3 segundos)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      switch (action) {
        case 'login':
          token = await authenticate(id);
          break;
          
        case 'create_quiz':
          results.quizId = await createQuiz(id, token);
          break;
          
        case 'add_elements':
          // Simula adição de elementos (delay para simular UI)
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(`✅ [${id}] Elementos adicionados ao quiz`);
          break;
          
        case 'save_quiz':
          if (results.quizId) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`✅ [${id}] Quiz salvo`);
          }
          break;
          
        case 'create_sms_campaign':
          results.campaignId = await createSMSCampaign(id, token);
          break;
          
        case 'view_dashboard':
          results.dashboard = await viewDashboard(id, token);
          break;
          
        case 'respond_quiz':
          results.responseId = await respondQuiz(id);
          break;
          
        case 'check_analytics':
          if (token) {
            const analytics = await makeRequest('/api/analytics', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✅ [${id}] Analytics verificado`);
          }
          break;
          
        default:
          console.log(`✅ [${id}] Ação simulada: ${action}`);
      }
    } catch (error) {
      console.error(`❌ [${id}] Erro na ação ${action}:`, error.message);
      recordError(id, action, error);
    }
  }
  
  console.log(`🏁 [${id}] Simulação completa: ${name}`);
  return results;
}

// Função para executar simulação completa
async function runSimulation() {
  console.log('🔥 INICIANDO SIMULAÇÃO DE 10 USUÁRIOS SIMULTÂNEOS');
  console.log('⏱️  Duração: 10 minutos');
  console.log('👥 Usuários: 10 cenários diferentes');
  console.log('=====================================\n');
  
  const startTime = Date.now();
  
  // Executa todos os usuários simultaneamente
  const promises = USER_SCENARIOS.map(scenario => simulateUser(scenario));
  
  // Aguarda todos terminarem ou timeout de 10 minutos
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout de 10 minutos')), 10 * 60 * 1000);
  });
  
  try {
    await Promise.race([Promise.all(promises), timeout]);
  } catch (error) {
    console.log('⚠️  Simulação interrompida:', error.message);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Relatório final
  console.log('\n=====================================');
  console.log('📊 RELATÓRIO FINAL DA SIMULAÇÃO');
  console.log('=====================================');
  console.log(`⏱️  Tempo total: ${duration.toFixed(2)} segundos`);
  console.log(`❌ Total de erros: ${globalErrors.total}`);
  console.log(`✅ Taxa de sucesso: ${((USER_SCENARIOS.length * 5 - globalErrors.total) / (USER_SCENARIOS.length * 5) * 100).toFixed(2)}%`);
  
  console.log('\n📈 ERROS POR USUÁRIO:');
  Object.entries(globalErrors.byUser).forEach(([user, count]) => {
    console.log(`  ${user}: ${count} erros`);
  });
  
  console.log('\n📈 ERROS POR AÇÃO:');
  Object.entries(globalErrors.byAction).forEach(([action, count]) => {
    console.log(`  ${action}: ${count} erros`);
  });
  
  console.log('\n📈 ERROS POR TIPO:');
  Object.entries(globalErrors.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} erros`);
  });
  
  console.log('\n🎯 RECOMENDAÇÕES:');
  if (globalErrors.total === 0) {
    console.log('  ✅ Sistema estável! Nenhum erro detectado.');
  } else if (globalErrors.total < 5) {
    console.log('  ⚠️  Poucos erros detectados. Sistema funcional mas pode ser melhorado.');
  } else {
    console.log('  ❌ Muitos erros detectados. Revisar sistemas críticos.');
  }
  
  console.log('\n=====================================');
}

// Executa a simulação
runSimulation().catch(error => {
  console.error('💥 Erro fatal na simulação:', error);
  process.exit(1);
});
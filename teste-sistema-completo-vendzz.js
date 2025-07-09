/**
 * TESTE COMPLETO DO SISTEMA VENDZZ
 * Validação abrangente de todas as funcionalidades críticas
 * Author: Sistema de Validação Vendzz
 */

const BASE_URL = 'http://localhost:5000';

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

class VendzzSystemTester {
  constructor() {
    this.results = {
      auth: [],
      dashboard: [],
      quizzes: [],
      responses: [],
      sms: [],
      email: [],
      whatsapp: [],
      analytics: [],
      users: [],
      system: []
    };
    this.token = null;
    this.testUser = null;
    this.testQuiz = null;
    this.testResponse = null;
    this.startTime = Date.now();
  }

  log(category, message, status = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const statusColors = {
      success: colors.green,
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue
    };
    
    console.log(`${statusColors[status]}[${timestamp}] ${category.toUpperCase()}: ${message}${colors.reset}`);
    
    if (!this.results[category]) {
      this.results[category] = [];
    }
    
    this.results[category].push({
      message,
      status,
      timestamp: new Date().toISOString()
    });
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || data.error || 'Unknown error'}`);
      }
      
      return { success: true, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message, status: 500 };
    }
  }

  // 1. TESTES DE AUTENTICAÇÃO
  async testAuthentication() {
    this.log('auth', 'Iniciando testes de autenticação...');
    
    // Teste 1: Login com credenciais válidas
    const loginResult = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    if (loginResult.success) {
      this.token = loginResult.data.accessToken || loginResult.data.token;
      this.testUser = loginResult.data.user;
      this.log('auth', `Login bem-sucedido - Token: ${this.token?.substring(0, 20)}...`, 'success');
    } else {
      this.log('auth', `Falha no login: ${loginResult.error}`, 'error');
      return false;
    }

    // Teste 2: Validação de token
    const validateResult = await this.makeRequest('/api/auth/validate');
    if (validateResult.success) {
      this.log('auth', 'Token válido e funcional', 'success');
    } else {
      this.log('auth', `Token inválido: ${validateResult.error}`, 'error');
    }

    // Teste 3: Login com credenciais inválidas
    const invalidLoginResult = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      })
    });

    if (!invalidLoginResult.success) {
      this.log('auth', 'Proteção contra login inválido funcionando', 'success');
    } else {
      this.log('auth', 'FALHA: Sistema aceitou credenciais inválidas', 'error');
    }

    return true;
  }

  // 2. TESTES DE DASHBOARD
  async testDashboard() {
    this.log('dashboard', 'Iniciando testes de dashboard...');
    
    // Teste 1: Estatísticas do dashboard
    const statsResult = await this.makeRequest('/api/dashboard/stats');
    if (statsResult.success) {
      const stats = statsResult.data;
      this.log('dashboard', `Estatísticas carregadas - Quizzes: ${stats.totalQuizzes}, Responses: ${stats.totalResponses}`, 'success');
    } else {
      this.log('dashboard', `Falha ao carregar estatísticas: ${statsResult.error}`, 'error');
    }

    // Teste 2: Atividade recente
    const activityResult = await this.makeRequest('/api/dashboard/recent-activity');
    if (activityResult.success) {
      this.log('dashboard', `Atividade recente carregada - ${activityResult.data.length} itens`, 'success');
    } else {
      this.log('dashboard', `Falha ao carregar atividade: ${activityResult.error}`, 'error');
    }
  }

  // 3. TESTES DE QUIZ SYSTEM
  async testQuizSystem() {
    this.log('quizzes', 'Iniciando testes do sistema de quizzes...');
    
    // Teste 1: Listar quizzes
    const quizzesResult = await this.makeRequest('/api/quizzes');
    if (quizzesResult.success) {
      this.log('quizzes', `${quizzesResult.data.length} quizzes encontrados`, 'success');
      if (quizzesResult.data.length > 0) {
        this.testQuiz = quizzesResult.data[0];
      }
    } else {
      this.log('quizzes', `Falha ao listar quizzes: ${quizzesResult.error}`, 'error');
    }

    // Teste 2: Criar quiz de teste
    const createQuizResult = await this.makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Quiz de Teste Sistema Completo',
        description: 'Quiz criado para validação do sistema',
        structure: {
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'q1',
                  type: 'text',
                  content: 'Qual é o seu nome?',
                  fieldId: 'nome'
                },
                {
                  id: 'q2',
                  type: 'email',
                  content: 'Qual é o seu email?',
                  fieldId: 'email'
                }
              ]
            }
          ]
        }
      })
    });

    if (createQuizResult.success) {
      this.testQuiz = createQuizResult.data;
      this.log('quizzes', `Quiz criado com sucesso - ID: ${this.testQuiz.id}`, 'success');
    } else {
      this.log('quizzes', `Falha ao criar quiz: ${createQuizResult.error}`, 'error');
    }

    // Teste 3: Publicar quiz
    if (this.testQuiz) {
      const publishResult = await this.makeRequest(`/api/quizzes/${this.testQuiz.id}/publish`, {
        method: 'POST'
      });

      if (publishResult.success) {
        this.log('quizzes', 'Quiz publicado com sucesso', 'success');
      } else {
        this.log('quizzes', `Falha ao publicar quiz: ${publishResult.error}`, 'error');
      }
    }

    // Teste 4: Buscar quiz público
    if (this.testQuiz) {
      const publicQuizResult = await this.makeRequest(`/api/quizzes/${this.testQuiz.id}/public`);
      if (publicQuizResult.success) {
        this.log('quizzes', 'Quiz público acessível', 'success');
      } else {
        this.log('quizzes', `Falha ao acessar quiz público: ${publicQuizResult.error}`, 'error');
      }
    }
  }

  // 4. TESTES DE RESPONSES
  async testResponseSystem() {
    this.log('responses', 'Iniciando testes do sistema de respostas...');
    
    if (!this.testQuiz) {
      this.log('responses', 'Nenhum quiz disponível para teste', 'warning');
      return;
    }

    // Teste 1: Submeter resposta
    const submitResult = await this.makeRequest(`/api/quizzes/${this.testQuiz.id}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        responses: {
          nome: 'João Silva',
          email: 'joao.silva@teste.com'
        },
        metadata: {
          isComplete: true,
          completionPercentage: 100,
          startTime: Date.now() - 30000,
          endTime: Date.now()
        }
      })
    });

    if (submitResult.success) {
      this.testResponse = submitResult.data;
      this.log('responses', `Resposta submetida com sucesso - ID: ${this.testResponse.id}`, 'success');
    } else {
      this.log('responses', `Falha ao submeter resposta: ${submitResult.error}`, 'error');
    }

    // Teste 2: Listar respostas
    const responsesResult = await this.makeRequest(`/api/quizzes/${this.testQuiz.id}/responses`);
    if (responsesResult.success) {
      this.log('responses', `${responsesResult.data.length} respostas encontradas`, 'success');
    } else {
      this.log('responses', `Falha ao listar respostas: ${responsesResult.error}`, 'error');
    }

    // Teste 3: Extrair emails
    const emailsResult = await this.makeRequest(`/api/quizzes/${this.testQuiz.id}/responses/emails`);
    if (emailsResult.success) {
      this.log('responses', `${emailsResult.data.emails?.length || 0} emails extraídos`, 'success');
    } else {
      this.log('responses', `Falha ao extrair emails: ${emailsResult.error}`, 'error');
    }
  }

  // 5. TESTES DE EMAIL MARKETING
  async testEmailMarketing() {
    this.log('email', 'Iniciando testes do sistema de email marketing...');
    
    if (!this.testQuiz) {
      this.log('email', 'Nenhum quiz disponível para teste de email', 'warning');
      return;
    }

    // Teste 1: Criar campanha de email
    const createCampaignResult = await this.makeRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Campanha de Teste Sistema Completo',
        quizId: this.testQuiz.id,
        subject: 'Teste do Sistema Vendzz',
        content: 'Olá {nome}, obrigado por participar do nosso quiz!',
        targetAudience: 'all'
      })
    });

    if (createCampaignResult.success) {
      const campaign = createCampaignResult.data;
      this.log('email', `Campanha criada com sucesso - ID: ${campaign.id}`, 'success');

      // Teste 2: Testar integração Brevo
      const brevoTestResult = await this.makeRequest('/api/brevo/test', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: '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',
          testEmail: 'teste@vendzz.com'
        })
      });

      if (brevoTestResult.success) {
        this.log('email', 'Integração Brevo funcionando', 'success');
      } else {
        this.log('email', `Falha na integração Brevo: ${brevoTestResult.error}`, 'error');
      }

      // Teste 3: Enviar email de teste
      const sendTestResult = await this.makeRequest('/api/send-brevo', {
        method: 'POST',
        body: JSON.stringify({
          to: 'brunotamaso@gmail.com',
          subject: 'Teste Sistema Completo Vendzz',
          htmlContent: '<h1>Sistema funcionando!</h1><p>Todos os testes do sistema Vendzz foram executados com sucesso.</p>'
        })
      });

      if (sendTestResult.success) {
        this.log('email', 'Email de teste enviado com sucesso', 'success');
      } else {
        this.log('email', `Falha ao enviar email de teste: ${sendTestResult.error}`, 'error');
      }
    } else {
      this.log('email', `Falha ao criar campanha: ${createCampaignResult.error}`, 'error');
    }
  }

  // 6. TESTES DE SMS
  async testSMSSystem() {
    this.log('sms', 'Iniciando testes do sistema de SMS...');
    
    if (!this.testQuiz) {
      this.log('sms', 'Nenhum quiz disponível para teste de SMS', 'warning');
      return;
    }

    // Teste 1: Buscar telefones do quiz
    const phonesResult = await this.makeRequest(`/api/quiz-phones/${this.testQuiz.id}`);
    if (phonesResult.success) {
      this.log('sms', `${phonesResult.data.length} telefones encontrados`, 'success');
    } else {
      this.log('sms', `Falha ao buscar telefones: ${phonesResult.error}`, 'error');
    }

    // Teste 2: Listar campanhas SMS
    const smsResult = await this.makeRequest('/api/sms-campaigns');
    if (smsResult.success) {
      this.log('sms', `${smsResult.data.length} campanhas SMS encontradas`, 'success');
    } else {
      this.log('sms', `Falha ao listar campanhas SMS: ${smsResult.error}`, 'error');
    }
  }

  // 7. TESTES DE WHATSAPP
  async testWhatsAppSystem() {
    this.log('whatsapp', 'Iniciando testes do sistema WhatsApp...');
    
    // Teste 1: Listar campanhas WhatsApp
    const whatsappResult = await this.makeRequest('/api/whatsapp-campaigns');
    if (whatsappResult.success) {
      this.log('whatsapp', `${whatsappResult.data.length} campanhas WhatsApp encontradas`, 'success');
    } else {
      this.log('whatsapp', `Falha ao listar campanhas WhatsApp: ${whatsappResult.error}`, 'error');
    }

    // Teste 2: Status da extensão
    const extensionResult = await this.makeRequest('/api/whatsapp-extension/status');
    if (extensionResult.success) {
      this.log('whatsapp', 'Status da extensão obtido com sucesso', 'success');
    } else {
      this.log('whatsapp', `Falha ao obter status da extensão: ${extensionResult.error}`, 'error');
    }

    // Teste 3: Configurações da extensão
    const settingsResult = await this.makeRequest('/api/whatsapp-extension/settings');
    if (settingsResult.success) {
      this.log('whatsapp', 'Configurações da extensão carregadas', 'success');
    } else {
      this.log('whatsapp', `Falha ao carregar configurações: ${settingsResult.error}`, 'error');
    }
  }

  // 8. TESTES DE ANALYTICS
  async testAnalytics() {
    this.log('analytics', 'Iniciando testes do sistema de analytics...');
    
    if (!this.testQuiz) {
      this.log('analytics', 'Nenhum quiz disponível para teste de analytics', 'warning');
      return;
    }

    // Teste 1: Analytics do quiz
    const analyticsResult = await this.makeRequest(`/api/analytics/${this.testQuiz.id}`);
    if (analyticsResult.success) {
      this.log('analytics', 'Analytics do quiz carregados', 'success');
    } else {
      this.log('analytics', `Falha ao carregar analytics: ${analyticsResult.error}`, 'error');
    }

    // Teste 2: Registrar visualização
    const viewResult = await this.makeRequest(`/api/analytics/${this.testQuiz.id}/view`, {
      method: 'POST'
    });

    if (viewResult.success) {
      this.log('analytics', 'Visualização registrada com sucesso', 'success');
    } else {
      this.log('analytics', `Falha ao registrar visualização: ${viewResult.error}`, 'error');
    }
  }

  // 9. TESTES DE PERFORMANCE
  async testPerformance() {
    this.log('system', 'Iniciando testes de performance...');
    
    const performanceTests = [
      { name: 'Dashboard Stats', endpoint: '/api/dashboard/stats' },
      { name: 'Quiz List', endpoint: '/api/quizzes' },
      { name: 'Auth Validate', endpoint: '/api/auth/validate' }
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      const result = await this.makeRequest(test.endpoint);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (result.success) {
        if (duration < 500) {
          this.log('system', `${test.name}: ${duration}ms (Excelente)`, 'success');
        } else if (duration < 1000) {
          this.log('system', `${test.name}: ${duration}ms (Bom)`, 'warning');
        } else {
          this.log('system', `${test.name}: ${duration}ms (Lento)`, 'error');
        }
      } else {
        this.log('system', `${test.name}: FALHA - ${result.error}`, 'error');
      }
    }
  }

  // 10. TESTES DE SEGURANÇA
  async testSecurity() {
    this.log('system', 'Iniciando testes de segurança...');
    
    // Teste 1: Acesso sem token
    const originalToken = this.token;
    this.token = null;
    
    const unauthorizedResult = await this.makeRequest('/api/quizzes');
    if (!unauthorizedResult.success) {
      this.log('system', 'Proteção de autenticação funcionando', 'success');
    } else {
      this.log('system', 'FALHA: Acesso não autorizado permitido', 'error');
    }
    
    this.token = originalToken;

    // Teste 2: Token inválido
    this.token = 'invalid-token';
    const invalidTokenResult = await this.makeRequest('/api/quizzes');
    if (!invalidTokenResult.success) {
      this.log('system', 'Proteção contra token inválido funcionando', 'success');
    } else {
      this.log('system', 'FALHA: Token inválido aceito', 'error');
    }
    
    this.token = originalToken;
  }

  // RELATÓRIO FINAL
  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log(`${colors.cyan}RELATÓRIO FINAL - TESTE COMPLETO SISTEMA VENDZZ${colors.reset}`);
    console.log('='.repeat(80));
    console.log(`${colors.blue}Duração total dos testes: ${duration}ms${colors.reset}`);
    console.log(`${colors.blue}Timestamp: ${new Date().toISOString()}${colors.reset}`);
    console.log('='.repeat(80));

    let totalTests = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const [category, tests] of Object.entries(this.results)) {
      if (tests.length === 0) continue;

      const success = tests.filter(t => t.status === 'success').length;
      const errors = tests.filter(t => t.status === 'error').length;
      const warnings = tests.filter(t => t.status === 'warning').length;
      const info = tests.filter(t => t.status === 'info').length;

      totalTests += tests.length;
      totalSuccess += success;
      totalErrors += errors;
      totalWarnings += warnings;

      console.log(`\n${colors.magenta}${category.toUpperCase()}:${colors.reset}`);
      console.log(`  ${colors.green}✅ Sucessos: ${success}${colors.reset}`);
      console.log(`  ${colors.red}❌ Erros: ${errors}${colors.reset}`);
      console.log(`  ${colors.yellow}⚠️  Avisos: ${warnings}${colors.reset}`);
      console.log(`  ${colors.blue}ℹ️  Info: ${info}${colors.reset}`);
      
      if (errors > 0) {
        console.log(`  ${colors.red}Erros encontrados:${colors.reset}`);
        tests.filter(t => t.status === 'error').forEach(test => {
          console.log(`    - ${test.message}`);
        });
      }
    }

    const successRate = ((totalSuccess / totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    console.log(`${colors.white}RESUMO GERAL:${colors.reset}`);
    console.log(`${colors.green}✅ Total de sucessos: ${totalSuccess}${colors.reset}`);
    console.log(`${colors.red}❌ Total de erros: ${totalErrors}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Total de avisos: ${totalWarnings}${colors.reset}`);
    console.log(`${colors.blue}📊 Taxa de sucesso: ${successRate}%${colors.reset}`);
    
    if (successRate >= 90) {
      console.log(`${colors.green}🎉 SISTEMA APROVADO PARA PRODUÇÃO!${colors.reset}`);
    } else if (successRate >= 70) {
      console.log(`${colors.yellow}⚠️  SISTEMA PRECISA DE MELHORIAS${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ SISTEMA PRECISA DE CORREÇÕES CRÍTICAS${colors.reset}`);
    }
    
    console.log('='.repeat(80));
  }

  // EXECUTAR TODOS OS TESTES
  async runAllTests() {
    console.log(`${colors.cyan}🚀 INICIANDO TESTE COMPLETO DO SISTEMA VENDZZ${colors.reset}`);
    console.log('='.repeat(80));

    try {
      // Executar testes em sequência
      await this.testAuthentication();
      await this.testDashboard();
      await this.testQuizSystem();
      await this.testResponseSystem();
      await this.testEmailMarketing();
      await this.testSMSSystem();
      await this.testWhatsAppSystem();
      await this.testAnalytics();
      await this.testPerformance();
      await this.testSecurity();

      // Gerar relatório final
      this.generateReport();

    } catch (error) {
      console.error(`${colors.red}❌ ERRO CRÍTICO NOS TESTES: ${error.message}${colors.reset}`);
      this.log('system', `Erro crítico: ${error.message}`, 'error');
      this.generateReport();
    }
  }
}

// Executar testes
async function executarTestesCompletos() {
  const tester = new VendzzSystemTester();
  await tester.runAllTests();
}

// Executar se chamado diretamente
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  executarTestesCompletos().catch(console.error);
}

export { VendzzSystemTester, executarTestesCompletos };
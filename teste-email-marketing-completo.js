/**
 * TESTE COMPLETO DO SISTEMA DE EMAIL MARKETING
 * Estrutura de testes profissional para validar toda a funcionalidade
 * Author: Dev Senior
 */

const BASE_URL = 'http://localhost:5000';

class EmailMarketingTestSuite {
  constructor() {
    this.token = null;
    this.userId = null;
    this.testResults = [];
    this.testCampaignId = null;
  }

  async authenticate() {
    console.log('🔐 Autenticando usuário...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok && (data.token || data.accessToken)) {
      this.token = data.token || data.accessToken;
      this.userId = data.user.id;
      console.log('✅ Login realizado com sucesso');
      return true;
    } else {
      console.log('❌ Falha no login:', data);
      return false;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
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

  async runTest(testName, testFunction) {
    console.log(`\n🧪 EXECUTANDO: ${testName}`);
    console.log('─'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        success: result,
        duration: `${duration}ms`
      });
      
      if (result) {
        console.log(`✅ ${testName} - PASSOU (${duration}ms)`);
      } else {
        console.log(`❌ ${testName} - FALHOU (${duration}ms)`);
      }
      
      return result;
    } catch (error) {
      console.log(`❌ ${testName} - ERRO:`, error.message);
      this.testResults.push({
        name: testName,
        success: false,
        error: error.message
      });
      return false;
    }
  }

  async testEmailCampaignsListing() {
    const { response, data } = await this.makeRequest('/api/email-campaigns');
    
    if (response.ok && Array.isArray(data)) {
      console.log(`📊 ${data.length} campanhas encontradas`);
      return true;
    } else {
      console.log('❌ Erro ao listar campanhas:', data);
      return false;
    }
  }

  async testActiveCampaignsDetection() {
    const { response, data } = await this.makeRequest('/api/email-campaigns');
    
    if (response.ok && Array.isArray(data)) {
      const activeCampaigns = data.filter(c => c.status === 'active');
      console.log(`🔄 ${activeCampaigns.length} campanhas ativas encontradas`);
      
      // Mostrar campanhas com problemas
      const problemCampaigns = activeCampaigns.filter(c => c.createdAt === 0);
      if (problemCampaigns.length > 0) {
        console.log(`⚠️ ${problemCampaigns.length} campanhas com createdAt = 0 (problema detectado)`);
      }
      
      return true;
    } else {
      console.log('❌ Erro ao detectar campanhas ativas:', data);
      return false;
    }
  }

  async testQuizResponsesForEmail() {
    // Buscar um quiz com respostas
    const { response: quizzesResponse, data: quizzes } = await this.makeRequest('/api/quizzes');
    
    if (!quizzesResponse.ok || !quizzes.length) {
      console.log('❌ Nenhum quiz encontrado');
      return false;
    }

    const quiz = quizzes[0];
    console.log(`📋 Testando quiz: ${quiz.title} (${quiz.id})`);
    
    // Buscar respostas do quiz
    const { response: responsesResponse, data: responsesData } = await this.makeRequest(`/api/quizzes/${quiz.id}/responses`);
    
    if (responsesResponse.ok) {
      const responses = Array.isArray(responsesData) ? responsesData : responsesData.responses || [];
      console.log(`📝 ${responses.length} respostas encontradas para o quiz`);
      return responses.length > 0;
    } else {
      console.log('❌ Erro ao buscar respostas:', responsesData);
      return false;
    }
  }

  async testEmailExtraction() {
    // Testar extração de emails do quiz Qm4wxpfPgkMrwoMhDFNLZ (que tem emails)
    const testQuizId = 'Qm4wxpfPgkMrwoMhDFNLZ';
    
    const { response, data } = await this.makeRequest(`/api/quizzes/${testQuizId}/responses/emails`);
    
    if (response.ok && data) {
      console.log(`📧 Extração de emails bem-sucedida:`);
      console.log(`   - Total de emails: ${data.totalEmails || 0}`);
      console.log(`   - Emails únicos: ${data.uniqueEmails || 0}`);
      console.log(`   - Emails válidos: ${data.validEmails || 0}`);
      
      return (data.totalEmails || 0) > 0;
    } else {
      console.log('❌ Erro na extração de emails:', data);
      return false;
    }
  }

  async testVariablePersonalization() {
    // Testar se as variáveis estão sendo processadas corretamente
    const testQuizId = 'Qm4wxpfPgkMrwoMhDFNLZ';
    
    const { response, data } = await this.makeRequest(`/api/quizzes/${testQuizId}/variables`);
    
    if (response.ok && data) {
      console.log(`🔤 Variáveis de personalização disponíveis:`);
      console.log(`   - Variáveis padrão: ${data.defaultVariables?.length || 0}`);
      console.log(`   - Variáveis personalizadas: ${data.customVariables?.length || 0}`);
      console.log(`   - Total de variáveis: ${data.variables?.length || 0}`);
      
      return (data.variables?.length || 0) > 0;
    } else {
      console.log('❌ Erro ao buscar variáveis:', data);
      return false;
    }
  }

  async testEmailLogs() {
    const { response, data } = await this.makeRequest('/api/email-logs');
    
    if (response.ok && Array.isArray(data)) {
      console.log(`📋 ${data.length} logs de email encontrados`);
      
      // Analisar logs com problemas
      const failedLogs = data.filter(log => log.status === 'failed');
      const successLogs = data.filter(log => log.status === 'sent' || log.status === 'delivered');
      
      console.log(`   - Enviados/Entregues: ${successLogs.length}`);
      console.log(`   - Falharam: ${failedLogs.length}`);
      
      return true;
    } else {
      console.log('❌ Erro ao buscar logs:', data);
      return false;
    }
  }

  async testAudienceSegmentation() {
    const testQuizId = 'Qm4wxpfPgkMrwoMhDFNLZ';
    
    // Testar segmentação de audiência
    const segmentationData = {
      quizId: testQuizId,
      targetAudience: 'all'
    };
    
    const { response, data } = await this.makeRequest('/api/email-campaigns/preview-audience', {
      method: 'POST',
      body: JSON.stringify(segmentationData)
    });
    
    if (response.ok && data) {
      console.log(`🎯 Segmentação de audiência:`);
      console.log(`   - Total de leads: ${data.stats?.totalLeads || data.totalCount || 0}`);
      console.log(`   - Leads completos: ${data.stats?.completedLeads || 0}`);
      console.log(`   - Leads abandonados: ${data.stats?.abandonedLeads || 0}`);
      
      return (data.stats?.totalLeads || data.totalCount || 0) > 0;
    } else {
      console.log('❌ Erro na segmentação:', data);
      return false;
    }
  }

  async testBrevoIntegration() {
    // Testar integração com Brevo
    const { response, data } = await this.makeRequest('/api/brevo/test', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: 'xkeysib-d9c6e7b8f2a3d1e4c5b6a7d8e9f0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8-abcdefghijklmnopqrstuvwxyz123456',
        testEmail: 'contato@vendzz.com.br'
      })
    });
    
    if (response.ok && data) {
      console.log(`🔗 Integração Brevo: ${data.success ? 'OK' : 'Falhou'}`);
      console.log(`   - Mensagem: ${data.message}`);
      
      return data.success;
    } else {
      console.log('❌ Erro na integração Brevo:', data);
      return false;
    }
  }

  async testSystemPerformance() {
    const startTime = Date.now();
    
    // Executar múltiplas operações em paralelo
    const promises = [
      this.makeRequest('/api/email-campaigns'),
      this.makeRequest('/api/quizzes'),
      this.makeRequest('/api/email-logs'),
      this.makeRequest('/api/dashboard/stats')
    ];
    
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    const successCount = results.filter(r => r.response.ok).length;
    
    console.log(`⚡ Performance do sistema:`);
    console.log(`   - Operações simultâneas: 4`);
    console.log(`   - Sucesso: ${successCount}/4`);
    console.log(`   - Tempo total: ${duration}ms`);
    console.log(`   - Média por operação: ${Math.round(duration / 4)}ms`);
    
    return successCount === 4 && duration < 1000;
  }

  async testDataIntegrity() {
    // Testar integridade dos dados
    const { response, data } = await this.makeRequest('/api/email-campaigns');
    
    if (response.ok && Array.isArray(data)) {
      let integrityIssues = 0;
      
      for (const campaign of data) {
        // Verificar campos obrigatórios
        if (!campaign.id || !campaign.name || !campaign.userId) {
          integrityIssues++;
        }
        
        // Verificar timestamps
        if (campaign.createdAt === 0 || campaign.updatedAt === 0) {
          integrityIssues++;
        }
        
        // Verificar tipos de dados
        if (typeof campaign.sent !== 'number' || typeof campaign.delivered !== 'number') {
          integrityIssues++;
        }
      }
      
      console.log(`🔍 Integridade dos dados:`);
      console.log(`   - Campanhas analisadas: ${data.length}`);
      console.log(`   - Problemas detectados: ${integrityIssues}`);
      console.log(`   - Taxa de integridade: ${((data.length - integrityIssues) / data.length * 100).toFixed(1)}%`);
      
      return integrityIssues === 0;
    } else {
      console.log('❌ Erro ao verificar integridade:', data);
      return false;
    }
  }

  log(message) {
    console.log(`📝 ${message}`);
  }

  async generateReport() {
    console.log('\n📊 RELATÓRIO FINAL DO TESTE DE EMAIL MARKETING');
    console.log('='.repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`Total de testes: ${totalTests}`);
    console.log(`✅ Passou: ${passedTests}`);
    console.log(`❌ Falhou: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    
    console.log('\n📋 RESULTADOS DETALHADOS:');
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration || 'N/A';
      console.log(`${status} ${result.name} (${duration})`);
      if (result.error) {
        console.log(`    └── Erro: ${result.error}`);
      }
    });
    
    console.log('\n🎯 STATUS FINAL:');
    if (successRate >= 80) {
      console.log('✅ Sistema de Email Marketing: APROVADO');
      console.log('✅ Sistema pronto para produção.');
    } else {
      console.log('❌ Sistema de Email Marketing: REPROVADO');
      console.log('❌ Correções necessárias antes da produção.');
    }
  }

  async runAllTests() {
    console.log('🧪 INICIANDO TESTE COMPLETO DO SISTEMA DE EMAIL MARKETING');
    console.log('='.repeat(60));
    
    // Autenticar primeiro
    if (!await this.authenticate()) {
      console.log('❌ Falha na autenticação - abortando testes');
      return;
    }
    
    // Executar todos os testes
    await this.runTest('Listagem de Campanhas', () => this.testEmailCampaignsListing());
    await this.runTest('Detecção de Campanhas Ativas', () => this.testActiveCampaignsDetection());
    await this.runTest('Respostas de Quiz para Email', () => this.testQuizResponsesForEmail());
    await this.runTest('Extração de Emails', () => this.testEmailExtraction());
    await this.runTest('Personalização de Variáveis', () => this.testVariablePersonalization());
    await this.runTest('Logs de Email', () => this.testEmailLogs());
    await this.runTest('Segmentação de Audiência', () => this.testAudienceSegmentation());
    await this.runTest('Integração Brevo', () => this.testBrevoIntegration());
    await this.runTest('Performance do Sistema', () => this.testSystemPerformance());
    await this.runTest('Integridade dos Dados', () => this.testDataIntegrity());
    
    // Gerar relatório final
    await this.generateReport();
  }
}

// Executar os testes
const testSuite = new EmailMarketingTestSuite();
testSuite.runAllTests().catch(console.error);
/**
 * TESTE SISTEMA COMPLETO - CORREÇÃO FINAL
 * Testa todos os endpoints com autenticação JWT obrigatória
 */

const BASE_URL = 'http://localhost:5000';

class SystemTester {
  constructor() {
    this.token = null;
    this.results = [];
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      return { 
        success: response.ok, 
        data, 
        status: response.status,
        contentType 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message, 
        status: 500 
      };
    }
  }

  async authenticate() {
    console.log('🔐 Autenticando usuário...');
    
    const result = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (result.success) {
      this.token = result.data.accessToken || result.data.token;
      console.log('✅ Autenticação bem-sucedida');
      return true;
    } else {
      console.log('❌ Falha na autenticação:', result.error);
      return false;
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async testEndpoint(name, endpoint, method = 'GET', body = null) {
    console.log(`\n🔍 Testando ${method} ${endpoint}...`);
    
    const options = {
      method,
      headers: this.getAuthHeaders()
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const result = await this.makeRequest(endpoint, options);
    
    if (result.success) {
      console.log(`✅ ${name}: SUCESSO (${result.status})`);
      if (result.data && typeof result.data === 'object') {
        const dataInfo = Array.isArray(result.data) 
          ? `Array com ${result.data.length} itens`
          : `Objeto com ${Object.keys(result.data).length} propriedades`;
        console.log(`   📊 Dados: ${dataInfo}`);
      }
      this.results.push({ name, status: 'SUCCESS', details: result.status });
    } else {
      console.log(`❌ ${name}: FALHA (${result.status})`);
      console.log(`   🔍 Erro: ${result.error || result.data}`);
      this.results.push({ name, status: 'FAILED', details: result.error || result.data });
    }
    
    return result;
  }

  async testCoreEndpoints() {
    console.log('\n📋 TESTANDO ENDPOINTS PRINCIPAIS');
    console.log('=' .repeat(50));
    
    // Endpoints principais
    await this.testEndpoint('Auth Validate', '/api/auth/validate');
    await this.testEndpoint('Dashboard Stats', '/api/dashboard/stats');
    await this.testEndpoint('Recent Activity', '/api/dashboard/recent-activity');
    await this.testEndpoint('User Quizzes', '/api/quizzes');
    await this.testEndpoint('Quiz Responses', '/api/responses');
    
    // Endpoints de campanhas
    await this.testEndpoint('SMS Campaigns', '/api/sms-campaigns');
    await this.testEndpoint('Email Campaigns', '/api/email-campaigns');
    await this.testEndpoint('WhatsApp Campaigns', '/api/whatsapp-campaigns');
    
    // Endpoints de analytics
    await this.testEndpoint('Analytics Data', '/api/analytics');
  }

  async testQuizOperations() {
    console.log('\n🎯 TESTANDO OPERAÇÕES DE QUIZ');
    console.log('=' .repeat(50));
    
    // Criar quiz de teste
    const quizData = {
      title: 'Quiz Teste Sistema ' + Date.now(),
      description: 'Quiz criado para teste do sistema',
      structure: {
        pages: [
          {
            id: 'page1',
            elements: [
              {
                id: 'elem1',
                type: 'text',
                properties: {
                  text: 'Qual é seu nome?',
                  fieldId: 'nome'
                }
              }
            ]
          }
        ]
      },
      settings: {
        theme: 'default',
        collectLeads: true
      }
    };
    
    const createResult = await this.testEndpoint('Create Quiz', '/api/quizzes', 'POST', quizData);
    
    if (createResult.success) {
      const quizId = createResult.data.id;
      
      // Testar endpoints específicos do quiz
      await this.testEndpoint('Get Quiz', `/api/quizzes/${quizId}`);
      await this.testEndpoint('Quiz Responses', `/api/quizzes/${quizId}/responses`);
      
      // Testar atualização
      await this.testEndpoint('Update Quiz', `/api/quizzes/${quizId}`, 'PUT', {
        title: 'Quiz Atualizado ' + Date.now()
      });
      
      // Testar publicação
      await this.testEndpoint('Publish Quiz', `/api/quizzes/${quizId}/publish`, 'POST');
      
      return quizId;
    }
    
    return null;
  }

  async testEmailSystem() {
    console.log('\n📧 TESTANDO SISTEMA DE EMAIL');
    console.log('=' .repeat(50));
    
    // Testar configuração Brevo
    await this.testEndpoint('Brevo Test', '/api/brevo/test');
    
    // Listar campanhas existentes
    const campaigns = await this.testEndpoint('List Email Campaigns', '/api/email-campaigns');
    
    if (campaigns.success && campaigns.data.length > 0) {
      const campaignId = campaigns.data[0].id;
      
      // Testar logs da campanha
      await this.testEndpoint('Campaign Logs', `/api/email-campaigns/${campaignId}/logs`);
      
      // Testar controles da campanha
      await this.testEndpoint('Pause Campaign', `/api/email-campaigns/${campaignId}/pause`, 'PUT');
      await this.testEndpoint('Resume Campaign', `/api/email-campaigns/${campaignId}/resume`, 'PUT');
    }
  }

  async generateReport() {
    console.log('\n📊 RELATÓRIO FINAL');
    console.log('=' .repeat(50));
    
    const total = this.results.length;
    const successful = this.results.filter(r => r.status === 'SUCCESS').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const successRate = ((successful / total) * 100).toFixed(1);
    
    console.log(`\n✅ Sucessos: ${successful}/${total} (${successRate}%)`);
    console.log(`❌ Falhas: ${failed}/${total}`);
    
    if (failed > 0) {
      console.log('\n❌ ENDPOINTS COM FALHA:');
      this.results.filter(r => r.status === 'FAILED').forEach(result => {
        console.log(`   • ${result.name}: ${result.details}`);
      });
    }
    
    if (successful > 0) {
      console.log('\n✅ ENDPOINTS FUNCIONAIS:');
      this.results.filter(r => r.status === 'SUCCESS').forEach(result => {
        console.log(`   • ${result.name}`);
      });
    }
    
    return {
      total,
      successful,
      failed,
      successRate: parseFloat(successRate)
    };
  }

  async runFullTest() {
    console.log('🧪 INICIANDO TESTE COMPLETO DO SISTEMA VENDZZ');
    console.log('=' .repeat(60));
    
    // Autenticar primeiro
    if (!await this.authenticate()) {
      console.log('❌ Falha na autenticação - interrompendo testes');
      return;
    }
    
    // Executar testes
    await this.testCoreEndpoints();
    const quizId = await this.testQuizOperations();
    await this.testEmailSystem();
    
    // Gerar relatório
    const report = await this.generateReport();
    
    console.log('\n🏁 TESTE COMPLETO FINALIZADO');
    console.log(`📊 Taxa de sucesso: ${report.successRate}%`);
    
    if (report.successRate >= 80) {
      console.log('✅ Sistema APROVADO para produção');
    } else {
      console.log('❌ Sistema precisa de correções antes da produção');
    }
    
    return report;
  }
}

// Executar teste
const tester = new SystemTester();
tester.runFullTest().catch(console.error);
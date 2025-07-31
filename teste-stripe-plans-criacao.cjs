/**
 * 🧪 TESTE RÁPIDO: Criação de Planos Stripe
 * Testa se o endpoint de criação de planos está funcionando corretamente
 */

const fs = require('fs');
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class TestePlansCriacao {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.token = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  log(message, color = 'cyan') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Merge headers corretamente
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
    
    const config = {
      method: 'GET',
      headers,
      ...options
    };

    this.log(`🔍 Fazendo requisição para: ${endpoint}`, 'cyan');
    this.log(`📝 Headers: ${JSON.stringify(headers, null, 2)}`, 'magenta');

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  }

  async authenticate() {
    this.log('🔐 Autenticando usuário...', 'yellow');
    
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'admin123'
        })
      });
      
      this.token = response.token || response.accessToken;
      this.log(`✅ Autenticação realizada com sucesso (token: ${this.token ? 'presente' : 'ausente'})`, 'green');
      this.log(`📝 Resposta completa: ${JSON.stringify(response, null, 2)}`, 'magenta');
      return true;
    } catch (error) {
      this.log(`❌ Erro na autenticação: ${error.message}`, 'red');
      return false;
    }
  }

  async testCreatePlan() {
    this.log('\n🧪 TESTE: Criação de Plano Stripe', 'yellow');
    this.results.total++;
    
    try {
      const planData = {
        name: `Plano Teste ${Date.now()}`,
        description: 'Plano de teste criado automaticamente',
        price: 29.90,
        currency: 'BRL',
        interval: 'month',
        trial_period_days: 3,
        activation_fee: 1.00,
        features: ['1000 SMS', 'WhatsApp automation', 'Analytics'],
        active: true
      };

      const response = await this.makeRequest('/api/stripe/create-plan', {
        method: 'POST',
        body: JSON.stringify(planData)
      });

      if (response.success && response.plan) {
        this.log('✅ Plano criado com sucesso!', 'green');
        this.log(`   Nome: ${response.plan.name}`, 'cyan');
        this.log(`   Preço: R$ ${response.plan.price}`, 'cyan');
        this.log(`   Trial: ${response.plan.trial_period_days} dias`, 'cyan');
        this.log(`   Stripe Product ID: ${response.stripe_product_id}`, 'cyan');
        this.log(`   Stripe Price ID: ${response.stripe_price_id}`, 'cyan');
        
        this.results.passed++;
        this.results.details.push({
          test: 'Criação de Plano',
          status: 'PASSED',
          details: `Plano "${response.plan.name}" criado com sucesso`
        });
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      this.log(`❌ Erro na criação do plano: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Criação de Plano',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testListPlans() {
    this.log('\n🧪 TESTE: Listagem de Planos', 'yellow');
    this.results.total++;
    
    try {
      const response = await this.makeRequest('/api/stripe/plans');
      
      if (Array.isArray(response) || response.plans) {
        const plans = Array.isArray(response) ? response : response.plans;
        this.log(`✅ Listagem realizada com sucesso! ${plans.length} planos encontrados`, 'green');
        
        plans.forEach((plan, index) => {
          this.log(`   ${index + 1}. ${plan.name} - R$ ${plan.price}`, 'cyan');
        });
        
        this.results.passed++;
        this.results.details.push({
          test: 'Listagem de Planos',
          status: 'PASSED',
          details: `${plans.length} planos listados com sucesso`
        });
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      this.log(`❌ Erro na listagem: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Listagem de Planos',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testAuthenticationError() {
    this.log('\n🧪 TESTE: Erro de Autenticação', 'yellow');
    this.results.total++;
    
    try {
      const originalToken = this.token;
      this.token = 'invalid-token';
      
      try {
        await this.makeRequest('/api/stripe/create-plan', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Plano Teste',
            description: 'Teste',
            price: 29.90,
            currency: 'BRL',
            interval: 'month',
            trial_period_days: 3,
            activation_fee: 1.00,
            features: [],
            active: true
          })
        });
        
        throw new Error('Deveria ter retornado erro de autenticação');
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Token inválido')) {
          this.log('✅ Erro de autenticação detectado corretamente!', 'green');
          this.results.passed++;
          this.results.details.push({
            test: 'Erro de Autenticação',
            status: 'PASSED',
            details: 'Sistema rejeitou token inválido corretamente'
          });
        } else {
          throw error;
        }
      }
      
      this.token = originalToken;
    } catch (error) {
      this.log(`❌ Erro no teste de autenticação: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Erro de Autenticação',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  generateReport() {
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    const timestamp = new Date().toLocaleString();
    
    const report = `
📊 RELATÓRIO DE TESTE - CRIAÇÃO DE PLANOS STRIPE
==============================================

📅 Data: ${timestamp}
🎯 Taxa de Sucesso: ${successRate}% (${this.results.passed}/${this.results.total})
⚡ Status: ${successRate >= 90 ? '✅ APROVADO' : '❌ REPROVADO'}

📋 DETALHES DOS TESTES:
${this.results.details.map((detail, index) => `
${index + 1}. ${detail.test}
   Status: ${detail.status === 'PASSED' ? '✅ APROVADO' : '❌ REPROVADO'}
   Detalhes: ${detail.details}
`).join('')}

🔧 DIAGNÓSTICO:
${successRate >= 90 ? 
  '✅ Sistema funcionando corretamente\n✅ Endpoints de criação e listagem operacionais\n✅ Autenticação JWT funcionando\n✅ Integração Stripe ativa' :
  '❌ Sistema com problemas\n❌ Verificar logs para mais detalhes\n❌ Possível problema na autenticação ou Stripe'
}

📝 PRÓXIMOS PASSOS:
${successRate >= 90 ? 
  '• Sistema pronto para uso em produção\n• Testar criação de planos no frontend\n• Implementar webhook de pagamentos' :
  '• Investigar falhas nos testes\n• Verificar configurações do Stripe\n• Corrigir problemas de autenticação'
}
`;

    this.log(report, 'white');
    
    // Salvar relatório em arquivo
    fs.writeFileSync('relatorio-teste-plans-criacao.md', report);
    this.log('📄 Relatório salvo em: relatorio-teste-plans-criacao.md', 'cyan');
  }

  async runAllTests() {
    this.log('🚀 INICIANDO TESTE DE CRIAÇÃO DE PLANOS STRIPE', 'bright');
    this.log('==========================================', 'bright');
    
    // Autenticar primeiro
    if (!await this.authenticate()) {
      this.log('❌ Falha na autenticação. Abortando testes.', 'red');
      return;
    }
    
    // Executar testes
    await this.testCreatePlan();
    await this.testListPlans();
    await this.testAuthenticationError();
    
    // Gerar relatório
    this.generateReport();
    
    this.log('\n✅ TESTE CONCLUÍDO!', 'green');
  }
}

// Executar teste
const teste = new TestePlansCriacao();
teste.runAllTests().catch(error => {
  console.error('❌ Erro fatal no teste:', error);
  process.exit(1);
});
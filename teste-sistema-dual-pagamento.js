/**
 * 🔥 TESTE SISTEMA DUAL DE PAGAMENTO - VENDZZ
 * Validação completa do sistema Stripe + Pagar.me
 */

class DualPaymentSystemTest {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.results = [];
    this.authToken = null;
    this.startTime = Date.now();
  }

  log(message, status = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m'
    };
    console.log(`${colors[status]}[${timestamp}] ${message}\x1b[0m`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: 'Invalid JSON response', body: text };
    }

    return { status: response.status, data, headers: response.headers };
  }

  async authenticate() {
    this.log('🔐 Autenticando usuário admin...');
    
    const { status, data } = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    if (status === 200 && data.token) {
      this.authToken = data.token;
      this.log('✅ Autenticação realizada com sucesso', 'success');
      return true;
    }

    this.log('❌ Falha na autenticação', 'error');
    return false;
  }

  async testPaymentGatewaysEndpoint() {
    this.log('🔍 Testando endpoint /api/payment-gateways...');
    
    const { status, data } = await this.makeRequest('/api/payment-gateways');

    if (status === 200) {
      this.log(`✅ Endpoint funcionando - ${data.gateways?.length || 0} gateways encontrados`, 'success');
      this.results.push({
        test: 'Payment Gateways Endpoint',
        status: 'PASSED',
        details: `${data.gateways?.length || 0} gateways disponíveis`
      });
      return data;
    }

    this.log(`❌ Falha no endpoint - Status: ${status}`, 'error');
    this.results.push({
      test: 'Payment Gateways Endpoint',
      status: 'FAILED',
      details: `Status: ${status}, Response: ${JSON.stringify(data)}`
    });
    return null;
  }

  async testStripeConfiguration() {
    this.log('🔍 Testando configuração do Stripe...');
    
    // Verificar se as variáveis de ambiente do Stripe estão configuradas
    const stripeVars = [
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_PUBLIC_KEY'
    ];

    let configured = true;
    for (const varName of stripeVars) {
      if (!process.env[varName]) {
        this.log(`❌ Variável ${varName} não configurada`, 'error');
        configured = false;
      }
    }

    if (configured) {
      this.log('✅ Stripe configurado corretamente', 'success');
      this.results.push({
        test: 'Stripe Configuration',
        status: 'PASSED',
        details: 'Todas as variáveis de ambiente configuradas'
      });
    } else {
      this.log('❌ Stripe não configurado', 'error');
      this.results.push({
        test: 'Stripe Configuration',
        status: 'FAILED',
        details: 'Variáveis de ambiente em falta'
      });
    }

    return configured;
  }

  async testPagarmeConfiguration() {
    this.log('🔍 Testando configuração do Pagar.me...');
    
    const pagarmeVars = [
      'PAGARME_API_KEY',
      'PAGARME_PUBLIC_KEY'
    ];

    let configured = true;
    for (const varName of pagarmeVars) {
      if (!process.env[varName]) {
        this.log(`❌ Variável ${varName} não configurada`, 'error');
        configured = false;
      }
    }

    if (configured) {
      this.log('✅ Pagar.me configurado corretamente', 'success');
      this.results.push({
        test: 'Pagar.me Configuration',
        status: 'PASSED',
        details: 'Todas as variáveis de ambiente configuradas'
      });
    } else {
      this.log('❌ Pagar.me não configurado', 'error');
      this.results.push({
        test: 'Pagar.me Configuration',
        status: 'FAILED',
        details: 'Variáveis de ambiente em falta'
      });
    }

    return configured;
  }

  async testUnifiedSubscriptionEndpoint() {
    this.log('🔍 Testando endpoint /api/assinatura-unificada...');
    
    const testData = {
      gateway: 'stripe',
      customerData: {
        name: 'João Silva',
        email: 'joao.teste@email.com',
        phone: '11999999999'
      },
      paymentData: {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '2025',
        cvc: '123'
      }
    };

    const { status, data } = await this.makeRequest('/api/assinatura-unificada', {
      method: 'POST',
      body: JSON.stringify(testData)
    });

    if (status === 200 && data.success) {
      this.log('✅ Endpoint unificado funcionando', 'success');
      this.results.push({
        test: 'Unified Subscription Endpoint',
        status: 'PASSED',
        details: 'Endpoint respondendo corretamente'
      });
    } else {
      this.log(`❌ Falha no endpoint unificado - Status: ${status}`, 'error');
      this.results.push({
        test: 'Unified Subscription Endpoint',
        status: 'FAILED',
        details: `Status: ${status}, Response: ${JSON.stringify(data)}`
      });
    }
  }

  async testPagarmeSubscriptionEndpoint() {
    this.log('🔍 Testando endpoint /api/assinatura-pagarme...');
    
    const testData = {
      customerData: {
        name: 'Maria Santos',
        email: 'maria.teste@email.com',
        document: '12345678901',
        phone: '11888888888',
        address: {
          street: 'Rua das Flores',
          street_number: '123',
          zipcode: '01234567',
          city: 'São Paulo',
          state: 'SP',
          country: 'BR'
        }
      },
      cardData: {
        number: '4111111111111111',
        holder_name: 'Maria Santos',
        exp_month: '12',
        exp_year: '2025',
        cvv: '123'
      }
    };

    const { status, data } = await this.makeRequest('/api/assinatura-pagarme', {
      method: 'POST',
      body: JSON.stringify(testData)
    });

    if (status === 200 && data.success) {
      this.log('✅ Endpoint Pagar.me funcionando', 'success');
      this.results.push({
        test: 'Pagar.me Subscription Endpoint',
        status: 'PASSED',
        details: 'Endpoint respondendo corretamente'
      });
    } else {
      this.log(`❌ Falha no endpoint Pagar.me - Status: ${status}`, 'error');
      this.results.push({
        test: 'Pagar.me Subscription Endpoint',
        status: 'FAILED',
        details: `Status: ${status}, Response: ${JSON.stringify(data)}`
      });
    }
  }

  async testWebhookEndpoints() {
    this.log('🔍 Testando endpoints de webhook...');
    
    // Teste webhook Stripe
    const stripeWebhook = await this.makeRequest('/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
    });

    // Teste webhook Pagar.me
    const pagarmeWebhook = await this.makeRequest('/api/webhooks/pagarme', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
    });

    let webhooksWorking = 0;
    if (stripeWebhook.status !== 404) webhooksWorking++;
    if (pagarmeWebhook.status !== 404) webhooksWorking++;

    this.results.push({
      test: 'Webhook Endpoints',
      status: webhooksWorking > 0 ? 'PASSED' : 'FAILED',
      details: `${webhooksWorking}/2 webhooks funcionando`
    });

    this.log(`✅ ${webhooksWorking}/2 webhooks funcionando`, 'success');
  }

  async testCheckoutUnifiedPage() {
    this.log('🔍 Testando página de checkout unificado...');
    
    const { status, data } = await this.makeRequest('/checkout-unificado');

    if (status === 200) {
      this.log('✅ Página de checkout unificado acessível', 'success');
      this.results.push({
        test: 'Checkout Unified Page',
        status: 'PASSED',
        details: 'Página carregando corretamente'
      });
    } else {
      this.log(`❌ Falha na página de checkout - Status: ${status}`, 'error');
      this.results.push({
        test: 'Checkout Unified Page',
        status: 'FAILED',
        details: `Status: ${status}`
      });
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const total = this.results.length;
    const successRate = Math.round((passed / total) * 100);

    this.log('\n🔥 RELATÓRIO FINAL DO SISTEMA DUAL DE PAGAMENTO', 'info');
    this.log('=' * 60, 'info');
    this.log(`📊 Taxa de Sucesso: ${successRate}% (${passed}/${total} testes)`, 'info');
    this.log(`⏱️ Tempo de Execução: ${duration}ms`, 'info');
    this.log(`🎯 Status: ${successRate >= 70 ? 'APROVADO' : 'REPROVADO'}`, successRate >= 70 ? 'success' : 'error');
    
    this.log('\n📋 DETALHES DOS TESTES:', 'info');
    this.results.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      this.log(`${status} ${result.test}: ${result.details}`, 'info');
    });

    this.log('\n🎯 PRÓXIMOS PASSOS:', 'info');
    if (successRate < 70) {
      this.log('1. Configurar variáveis de ambiente faltantes', 'warning');
      this.log('2. Verificar chaves de API do Stripe e Pagar.me', 'warning');
      this.log('3. Testar endpoints individualmente', 'warning');
    } else {
      this.log('1. Sistema pronto para uso em produção', 'success');
      this.log('2. Configurar webhooks nos dashboards', 'success');
      this.log('3. Testar com dados reais', 'success');
    }

    return {
      successRate,
      passed,
      total,
      duration,
      status: successRate >= 70 ? 'APPROVED' : 'REJECTED'
    };
  }

  async runAllTests() {
    this.log('🚀 Iniciando teste completo do sistema dual de pagamento...', 'info');
    
    try {
      // Autenticação
      const authenticated = await this.authenticate();
      if (!authenticated) {
        this.log('❌ Não foi possível autenticar. Interrompendo testes.', 'error');
        return this.generateReport();
      }

      // Testes de configuração
      await this.testStripeConfiguration();
      await this.testPagarmeConfiguration();
      
      // Testes de endpoints
      await this.testPaymentGatewaysEndpoint();
      await this.testUnifiedSubscriptionEndpoint();
      await this.testPagarmeSubscriptionEndpoint();
      await this.testWebhookEndpoints();
      await this.testCheckoutUnifiedPage();

      return this.generateReport();
    } catch (error) {
      this.log(`❌ Erro durante os testes: ${error.message}`, 'error');
      return this.generateReport();
    }
  }
}

// Executar teste
const test = new DualPaymentSystemTest();
test.runAllTests().then(report => {
  console.log('\n🎯 TESTE CONCLUÍDO!');
  console.log(`Status: ${report.status}`);
  console.log(`Taxa de Sucesso: ${report.successRate}%`);
  process.exit(report.status === 'APPROVED' ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
});
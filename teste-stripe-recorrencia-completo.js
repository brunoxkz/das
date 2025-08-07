/**
 * 🔥 TESTE COMPLETO - SISTEMA DE RECORRÊNCIA STRIPE
 * Testa todos os aspectos críticos do sistema de checkout recorrente
 * Foco: Trial → Recorrência, Token de Cartão, Cobrança Automática
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Configuração dos testes
const TEST_CONFIG = {
  // Produto de teste com trial
  testProduct: {
    name: "Plano Premium - Teste Recorrência",
    description: "Plano de teste para validar sistema de recorrência",
    price: 29.90,
    currency: "BRL",
    category: "subscription",
    payment_mode: "recurring",
    recurring_interval: "month",
    trial_period: 3,
    trial_price: 1.00,
    features: "Trial 3 dias por R$1, depois R$29.90/mês"
  },
  
  // Dados de cartão de teste Stripe
  testCard: {
    number: "4242424242424242",
    exp_month: 12,
    exp_year: 2025,
    cvc: "123"
  },
  
  // Cliente de teste
  testCustomer: {
    name: "João Silva",
    email: "joao.teste@vendzz.com",
    phone: "+5511999999999"
  }
};

class StripeRecurrenceTestSuite {
  constructor() {
    this.token = null;
    this.testProductId = null;
    this.testCustomerId = null;
    this.testSubscriptionId = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  log(message, color = 'cyan') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response.json();
  }

  async authenticate() {
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'admin123'
        })
      });
      
      this.token = response.accessToken;
      this.log('✅ Autenticação bem-sucedida', 'green');
      return true;
    } catch (error) {
      this.log(`❌ Erro na autenticação: ${error.message}`, 'red');
      return false;
    }
  }

  async testProductCreation() {
    this.log('\n🔄 TESTE 1: Criação de Produto Recorrente', 'yellow');
    this.results.total++;
    
    try {
      const response = await this.makeRequest('/api/checkout-products', {
        method: 'POST',
        body: JSON.stringify(TEST_CONFIG.testProduct)
      });
      
      this.testProductId = response.id;
      
      // Validações críticas
      const validations = [
        { field: 'payment_mode', expected: 'recurring', actual: response.payment_mode },
        { field: 'recurring_interval', expected: 'month', actual: response.recurring_interval },
        { field: 'trial_period', expected: 3, actual: response.trial_period },
        { field: 'trial_price', expected: 1.00, actual: response.trial_price },
        { field: 'price', expected: 29.90, actual: response.price }
      ];
      
      for (const validation of validations) {
        if (validation.actual !== validation.expected) {
          throw new Error(`Campo ${validation.field}: esperado ${validation.expected}, recebido ${validation.actual}`);
        }
      }
      
      this.log('✅ Produto recorrente criado com sucesso', 'green');
      this.log(`   ID: ${this.testProductId}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Criação de Produto',
        status: 'PASSED',
        details: `Produto ${this.testProductId} criado com trial correto`
      });
      
    } catch (error) {
      this.log(`❌ Falha na criação do produto: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Criação de Produto',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testStripeIntegration() {
    this.log('\n🔄 TESTE 2: Integração Stripe - Criação de Cliente', 'yellow');
    this.results.total++;
    
    try {
      // Testar endpoint de criação de cliente Stripe
      const response = await this.makeRequest('/api/stripe/create-customer', {
        method: 'POST',
        body: JSON.stringify(TEST_CONFIG.testCustomer)
      });
      
      this.testCustomerId = response.customerId;
      
      // Validações do cliente Stripe
      if (!this.testCustomerId || !this.testCustomerId.startsWith('cus_')) {
        throw new Error('ID do cliente Stripe inválido');
      }
      
      this.log('✅ Cliente Stripe criado com sucesso', 'green');
      this.log(`   Customer ID: ${this.testCustomerId}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Criação Cliente Stripe',
        status: 'PASSED',
        details: `Cliente ${this.testCustomerId} criado no Stripe`
      });
      
    } catch (error) {
      this.log(`❌ Falha na criação do cliente Stripe: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Criação Cliente Stripe',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testTokenCreation() {
    this.log('\n🔄 TESTE 3: Criação de Token de Cartão', 'yellow');
    this.results.total++;
    
    try {
      // Testar criação de token de cartão
      const response = await this.makeRequest('/api/stripe/create-token', {
        method: 'POST',
        body: JSON.stringify({
          card: TEST_CONFIG.testCard
        })
      });
      
      const tokenId = response.tokenId;
      
      // Validações do token
      if (!tokenId || !tokenId.startsWith('tok_')) {
        throw new Error('Token de cartão inválido');
      }
      
      this.log('✅ Token de cartão criado com sucesso', 'green');
      this.log(`   Token ID: ${tokenId}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Criação Token Cartão',
        status: 'PASSED',
        details: `Token ${tokenId} criado para cartão`
      });
      
    } catch (error) {
      this.log(`❌ Falha na criação do token: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Criação Token Cartão',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testSubscriptionCreation() {
    this.log('\n🔄 TESTE 4: Criação de Assinatura com Trial', 'yellow');
    this.results.total++;
    
    try {
      // Testar criação de assinatura
      const response = await this.makeRequest('/api/stripe/create-subscription', {
        method: 'POST',
        body: JSON.stringify({
          customerId: this.testCustomerId,
          productId: this.testProductId,
          trialPeriodDays: 3,
          trialPrice: 1.00
        })
      });
      
      this.testSubscriptionId = response.subscriptionId;
      
      // Validações da assinatura
      if (!this.testSubscriptionId || !this.testSubscriptionId.startsWith('sub_')) {
        throw new Error('ID da assinatura inválido');
      }
      
      // Verificar status de trial
      if (response.status !== 'trialing') {
        throw new Error(`Status esperado: trialing, recebido: ${response.status}`);
      }
      
      this.log('✅ Assinatura com trial criada com sucesso', 'green');
      this.log(`   Subscription ID: ${this.testSubscriptionId}`, 'cyan');
      this.log(`   Status: ${response.status}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Criação Assinatura',
        status: 'PASSED',
        details: `Assinatura ${this.testSubscriptionId} em trial`
      });
      
    } catch (error) {
      this.log(`❌ Falha na criação da assinatura: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Criação Assinatura',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testWebhookProcessing() {
    this.log('\n🔄 TESTE 5: Processamento de Webhooks', 'yellow');
    this.results.total++;
    
    try {
      // Simular webhook de cobrança bem-sucedida
      const webhookData = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test123',
            customer: this.testCustomerId,
            subscription: this.testSubscriptionId,
            amount_paid: 2990,
            status: 'paid'
          }
        }
      };
      
      const response = await this.makeRequest('/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'stripe-signature': 'test_signature'
        }
      });
      
      this.log('✅ Webhook processado com sucesso', 'green');
      this.results.passed++;
      this.results.details.push({
        test: 'Processamento Webhook',
        status: 'PASSED',
        details: 'Webhook de pagamento processado'
      });
      
    } catch (error) {
      this.log(`❌ Falha no processamento do webhook: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Processamento Webhook',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testPaymentMethodStorage() {
    this.log('\n🔄 TESTE 6: Armazenamento Seguro de Método de Pagamento', 'yellow');
    this.results.total++;
    
    try {
      // Testar salvamento de método de pagamento
      const response = await this.makeRequest('/api/stripe/save-payment-method', {
        method: 'POST',
        body: JSON.stringify({
          customerId: this.testCustomerId,
          paymentMethodId: 'pm_test123456'
        })
      });
      
      // Validar se o método foi salvo
      if (!response.paymentMethodId) {
        throw new Error('Método de pagamento não foi salvo');
      }
      
      this.log('✅ Método de pagamento salvo com sucesso', 'green');
      this.log(`   Payment Method ID: ${response.paymentMethodId}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Armazenamento Pagamento',
        status: 'PASSED',
        details: 'Método de pagamento salvo no Stripe'
      });
      
    } catch (error) {
      this.log(`❌ Falha no armazenamento do método de pagamento: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Armazenamento Pagamento',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testRecurringBilling() {
    this.log('\n🔄 TESTE 7: Cobrança Recorrente Automática', 'yellow');
    this.results.total++;
    
    try {
      // Simular cobrança recorrente
      const response = await this.makeRequest('/api/stripe/process-recurring-billing', {
        method: 'POST',
        body: JSON.stringify({
          subscriptionId: this.testSubscriptionId,
          customerId: this.testCustomerId
        })
      });
      
      // Validar processamento da cobrança
      if (response.status !== 'success') {
        throw new Error(`Cobrança falhou: ${response.error}`);
      }
      
      this.log('✅ Cobrança recorrente processada com sucesso', 'green');
      this.log(`   Invoice ID: ${response.invoiceId}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Cobrança Recorrente',
        status: 'PASSED',
        details: `Cobrança processada: ${response.invoiceId}`
      });
      
    } catch (error) {
      this.log(`❌ Falha na cobrança recorrente: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Cobrança Recorrente',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testSubscriptionManagement() {
    this.log('\n🔄 TESTE 8: Gerenciamento de Assinatura', 'yellow');
    this.results.total++;
    
    try {
      // Testar atualização de assinatura
      const response = await this.makeRequest(`/api/stripe/subscription/${this.testSubscriptionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'active',
          cancelAtPeriodEnd: false
        })
      });
      
      // Validar atualização
      if (response.status !== 'active') {
        throw new Error(`Status esperado: active, recebido: ${response.status}`);
      }
      
      this.log('✅ Assinatura atualizada com sucesso', 'green');
      this.log(`   Novo status: ${response.status}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Gerenciamento Assinatura',
        status: 'PASSED',
        details: 'Assinatura atualizada para ativa'
      });
      
    } catch (error) {
      this.log(`❌ Falha no gerenciamento da assinatura: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Gerenciamento Assinatura',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testDatabaseSync() {
    this.log('\n🔄 TESTE 9: Sincronização com Banco de Dados', 'yellow');
    this.results.total++;
    
    try {
      // Verificar se dados foram sincronizados
      const response = await this.makeRequest(`/api/checkout-products/${this.testProductId}`);
      
      // Validar sincronização
      if (!response.stripe_product_id) {
        throw new Error('Produto não foi sincronizado com Stripe');
      }
      
      this.log('✅ Sincronização com banco de dados funcionando', 'green');
      this.log(`   Stripe Product ID: ${response.stripe_product_id}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Sincronização Banco',
        status: 'PASSED',
        details: 'Dados sincronizados entre Stripe e banco'
      });
      
    } catch (error) {
      this.log(`❌ Falha na sincronização: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Sincronização Banco',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  async testErrorHandling() {
    this.log('\n🔄 TESTE 10: Tratamento de Erros', 'yellow');
    this.results.total++;
    
    try {
      // Testar cartão rejeitado
      const response = await this.makeRequest('/api/stripe/test-failed-payment', {
        method: 'POST',
        body: JSON.stringify({
          customerId: this.testCustomerId,
          paymentMethodId: 'pm_card_declined'
        })
      });
      
      // Validar tratamento de erro
      if (response.status !== 'failed') {
        throw new Error('Erro de pagamento não foi tratado corretamente');
      }
      
      this.log('✅ Tratamento de erros funcionando', 'green');
      this.log(`   Erro capturado: ${response.error}`, 'cyan');
      this.results.passed++;
      this.results.details.push({
        test: 'Tratamento Erros',
        status: 'PASSED',
        details: 'Erros de pagamento tratados corretamente'
      });
      
    } catch (error) {
      this.log(`❌ Falha no tratamento de erros: ${error.message}`, 'red');
      this.results.failed++;
      this.results.details.push({
        test: 'Tratamento Erros',
        status: 'FAILED',
        details: error.message
      });
    }
  }

  generateReport() {
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    this.log('\n📊 RELATÓRIO FINAL - SISTEMA DE RECORRÊNCIA STRIPE', 'yellow');
    this.log('═'.repeat(60), 'cyan');
    this.log(`Total de Testes: ${this.results.total}`, 'cyan');
    this.log(`✅ Aprovados: ${this.results.passed}`, 'green');
    this.log(`❌ Reprovados: ${this.results.failed}`, 'red');
    this.log(`📈 Taxa de Sucesso: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    this.log('═'.repeat(60), 'cyan');
    
    // Detalhes dos testes
    this.log('\n📋 DETALHES DOS TESTES:', 'yellow');
    this.results.details.forEach((detail, index) => {
      const status = detail.status === 'PASSED' ? '✅' : '❌';
      const color = detail.status === 'PASSED' ? 'green' : 'red';
      this.log(`${index + 1}. ${status} ${detail.test}`, color);
      this.log(`   ${detail.details}`, 'cyan');
    });
    
    // Recomendações
    this.log('\n🔧 RECOMENDAÇÕES:', 'yellow');
    if (successRate >= 90) {
      this.log('✅ Sistema APROVADO para produção - Recorrência totalmente funcional', 'green');
    } else if (successRate >= 70) {
      this.log('⚠️ Sistema FUNCIONAL com ressalvas - Corrigir falhas identificadas', 'yellow');
    } else {
      this.log('❌ Sistema NÃO APROVADO - Múltiplas falhas críticas', 'red');
    }
    
    return {
      success: successRate >= 80,
      rate: successRate,
      details: this.results.details
    };
  }

  async runAllTests() {
    this.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE RECORRÊNCIA STRIPE', 'cyan');
    this.log('════════════════════════════════════════════════════════════', 'cyan');
    
    try {
      // 1. Autenticação
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        this.log('❌ Falha na autenticação - Abortando testes', 'red');
        return this.generateReport();
      }
      
      // 2. Executar todos os testes
      await this.testProductCreation();
      await this.testStripeIntegration();
      await this.testTokenCreation();
      await this.testSubscriptionCreation();
      await this.testWebhookProcessing();
      await this.testPaymentMethodStorage();
      await this.testRecurringBilling();
      await this.testSubscriptionManagement();
      await this.testDatabaseSync();
      await this.testErrorHandling();
      
      // 3. Gerar relatório final
      return this.generateReport();
      
    } catch (error) {
      this.log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');
      return this.generateReport();
    }
  }
}

// Executar testes
const testSuite = new StripeRecurrenceTestSuite();
testSuite.runAllTests().then(result => {
  process.exit(result.success ? 0 : 1);
});
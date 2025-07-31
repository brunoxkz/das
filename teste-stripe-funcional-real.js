/**
 * 🔥 TESTE FUNCIONAL STRIPE - SISTEMA REAL
 * Testa funcionalidades que estão funcionando no sistema
 */

import fetch from 'node-fetch';

class TesteFuncionalStripe {
  constructor() {
    this.token = null;
    this.results = [];
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
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
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
      this.log('✅ Autenticação bem-sucedida');
      return true;
    } catch (error) {
      this.log(`❌ Falha na autenticação: ${error.message}`, 'red');
      return false;
    }
  }

  async testProductCreation() {
    this.log('\n🔧 TESTE: Criação de Produto');
    try {
      const product = await this.makeRequest('/api/checkout-products', {
        method: 'POST',
        body: JSON.stringify({
          name: "Plano Premium - Trial",
          description: "Plano com trial de 3 dias",
          price: 29.90,
          currency: "BRL",
          category: "subscription",
          payment_mode: "recurring",
          recurring_interval: "month",
          trial_period: 3,
          trial_price: 1.00,
          features: "Trial 3 dias por R$1, depois R$29.90/mês"
        })
      });
      
      this.log('✅ Produto criado com sucesso');
      this.log(`   ID: ${product.id}`);
      this.results.push({ test: 'Criação de Produto', status: 'PASS', detail: `ID: ${product.id}` });
      return product.id;
    } catch (error) {
      this.log(`❌ Falha na criação do produto: ${error.message}`, 'red');
      this.results.push({ test: 'Criação de Produto', status: 'FAIL', detail: error.message });
      return null;
    }
  }

  async testWebhook() {
    this.log('\n🔧 TESTE: Webhook do Stripe');
    try {
      const response = await fetch('http://localhost:5000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'test_signature'
        },
        body: JSON.stringify({
          type: 'invoice.payment_succeeded',
          data: {
            object: {
              id: 'in_test123',
              customer: 'cus_test123',
              subscription: 'sub_test123',
              amount_paid: 2990,
              status: 'paid'
            }
          }
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        this.log('✅ Webhook funcionando corretamente');
        this.results.push({ test: 'Webhook', status: 'PASS', detail: 'Webhook processado' });
      } else {
        this.log(`❌ Webhook com erro: ${JSON.stringify(result)}`, 'red');
        this.results.push({ test: 'Webhook', status: 'FAIL', detail: JSON.stringify(result) });
      }
    } catch (error) {
      this.log(`❌ Erro no webhook: ${error.message}`, 'red');
      this.results.push({ test: 'Webhook', status: 'FAIL', detail: error.message });
    }
  }

  async testErrorHandling() {
    this.log('\n🔧 TESTE: Tratamento de Erros');
    try {
      const response = await this.makeRequest('/api/stripe/test-failed-payment', {
        method: 'POST',
        body: JSON.stringify({
          customerId: 'cus_test123',
          paymentMethodId: 'pm_card_declined'
        })
      });
      
      if (response.status === 'failed' && response.error) {
        this.log('✅ Tratamento de erros funcionando');
        this.log(`   Erro capturado: ${response.error}`);
        this.results.push({ test: 'Tratamento de Erros', status: 'PASS', detail: `Erro: ${response.error}` });
      } else {
        this.log('❌ Tratamento de erros não funcionou como esperado', 'red');
        this.results.push({ test: 'Tratamento de Erros', status: 'FAIL', detail: 'Erro não capturado' });
      }
    } catch (error) {
      this.log(`❌ Falha no tratamento de erros: ${error.message}`, 'red');
      this.results.push({ test: 'Tratamento de Erros', status: 'FAIL', detail: error.message });
    }
  }

  async testDatabaseSync() {
    this.log('\n🔧 TESTE: Sincronização com Banco de Dados');
    try {
      const products = await this.makeRequest('/api/checkout-products');
      
      if (products && products.length > 0) {
        this.log('✅ Sincronização com banco funcionando');
        this.log(`   Produtos encontrados: ${products.length}`);
        this.results.push({ test: 'Sincronização Banco', status: 'PASS', detail: `${products.length} produtos` });
      } else {
        this.log('❌ Nenhum produto encontrado no banco', 'red');
        this.results.push({ test: 'Sincronização Banco', status: 'FAIL', detail: 'Nenhum produto' });
      }
    } catch (error) {
      this.log(`❌ Falha na sincronização: ${error.message}`, 'red');
      this.results.push({ test: 'Sincronização Banco', status: 'FAIL', detail: error.message });
    }
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO FINAL - STRIPE FUNCIONAL', 'yellow');
    this.log('════════════════════════════════════════════', 'yellow');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const successRate = ((passed / this.results.length) * 100).toFixed(1);
    
    this.log(`Total de Testes: ${this.results.length}`);
    this.log(`✅ Aprovados: ${passed}`, 'green');
    this.log(`❌ Reprovados: ${failed}`, 'red');
    this.log(`📈 Taxa de Sucesso: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    
    this.log('\n📋 DETALHES DOS TESTES:', 'yellow');
    this.results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      this.log(`${index + 1}. ${icon} ${result.test}`);
      this.log(`   ${result.detail}`);
    });
    
    this.log('\n🔧 STATUS GERAL:', 'yellow');
    if (successRate >= 80) {
      this.log('✅ SISTEMA APROVADO - Funcionalidades principais operacionais', 'green');
    } else {
      this.log('❌ SISTEMA COM PROBLEMAS - Requer correções', 'red');
    }
  }

  async runAllTests() {
    this.log('🚀 INICIANDO TESTE FUNCIONAL DO STRIPE', 'yellow');
    this.log('════════════════════════════════════════════', 'yellow');
    
    if (!await this.authenticate()) {
      return;
    }
    
    await this.testProductCreation();
    await this.testWebhook();
    await this.testErrorHandling();
    await this.testDatabaseSync();
    
    this.generateReport();
  }
}

// Executar testes
const testSuite = new TesteFuncionalStripe();
testSuite.runAllTests().catch(console.error);
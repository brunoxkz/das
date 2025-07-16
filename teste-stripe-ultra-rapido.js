/**
 * 🔥 TESTE ULTRA RÁPIDO - SISTEMA STRIPE RECORRÊNCIA
 * Testa a inicialização e endpoints básicos do Stripe
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

class StripeUltraRapidoTest {
  constructor() {
    this.token = null;
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
      const result = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@admin.com',
          password: 'admin123'
        })
      });
      
      this.token = result.token || result.accessToken;
      this.log('✅ Autenticação bem-sucedida');
      return true;
    } catch (error) {
      this.log(`❌ Falha na autenticação: ${error.message}`, 'red');
      return false;
    }
  }

  async testStripeInitialization() {
    this.log('\n🔧 TESTE: Inicialização do Stripe');
    try {
      const result = await this.makeRequest('/api/stripe/create-customer', {
        method: 'POST',
        body: JSON.stringify({
          email: 'teste@vendzz.com',
          name: 'Teste User',
          phone: '+5511999999999'
        })
      });
      
      this.log('✅ Stripe inicializado e funcionando');
      return result;
    } catch (error) {
      this.log(`❌ Falha na inicialização: ${error.message}`, 'red');
      throw error;
    }
  }

  async testCreateToken() {
    this.log('\n🔧 TESTE: Criação de Token de Cartão');
    try {
      const result = await this.makeRequest('/api/stripe/create-token', {
        method: 'POST',
        body: JSON.stringify({
          card: {
            number: "4242424242424242",
            exp_month: 12,
            exp_year: 2025,
            cvc: "123"
          }
        })
      });
      
      this.log('✅ Token de cartão criado com sucesso');
      return result;
    } catch (error) {
      this.log(`❌ Falha na criação do token: ${error.message}`, 'red');
      throw error;
    }
  }

  async testWebhook() {
    this.log('\n🔧 TESTE: Webhook do Stripe');
    try {
      const result = await this.makeRequest('/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
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
      
      this.log('✅ Webhook processado com sucesso');
      return result;
    } catch (error) {
      this.log(`❌ Falha no webhook: ${error.message}`, 'red');
      throw error;
    }
  }

  async runAllTests() {
    this.log('🚀 INICIANDO TESTE ULTRA RÁPIDO DO STRIPE');
    this.log('════════════════════════════════════════════');
    
    // Autenticação
    if (!(await this.authenticate())) {
      this.log('❌ Falha na autenticação - parando testes', 'red');
      return;
    }

    let passedTests = 0;
    let totalTests = 3;

    // Teste 1: Inicialização
    try {
      await this.testStripeInitialization();
      passedTests++;
    } catch (error) {
      // Falha já logada
    }

    // Teste 2: Token
    try {
      await this.testCreateToken();
      passedTests++;
    } catch (error) {
      // Falha já logada
    }

    // Teste 3: Webhook
    try {
      await this.testWebhook();
      passedTests++;
    } catch (error) {
      // Falha já logada
    }

    // Relatório Final
    this.log('\n📊 RELATÓRIO FINAL');
    this.log('════════════════════════════════════════════');
    this.log(`Total de Testes: ${totalTests}`);
    this.log(`✅ Aprovados: ${passedTests}`, 'green');
    this.log(`❌ Reprovados: ${totalTests - passedTests}`, 'red');
    this.log(`📈 Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      this.log('🎉 STRIPE COMPLETAMENTE FUNCIONAL!', 'green');
    } else {
      this.log('⚠️ STRIPE COM PROBLEMAS', 'yellow');
    }
  }
}

// Executar o teste
const testSuite = new StripeUltraRapidoTest();
testSuite.runAllTests().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
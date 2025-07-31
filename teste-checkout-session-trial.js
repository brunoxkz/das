/**
 * 🚀 TESTE CHECKOUT SESSION COM TRIAL
 * Testa o novo endpoint de checkout com trial
 */

import fetch from 'node-fetch';

class TesteCheckoutTrial {
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

  async testCheckoutSession() {
    this.log('\n🔧 TESTE: Criação de Checkout Session com Trial');
    try {
      const sessionResponse = await this.makeRequest('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          trial_period_days: 3,
          trial_price: 1.00,
          regular_price: 29.90,
          currency: "BRL"
        })
      });

      this.log('✅ Checkout Session criada com sucesso');
      this.log(`   Session ID: ${sessionResponse.sessionId}`);
      this.log(`   Client Secret: ${sessionResponse.clientSecret ? 'Presente' : 'Ausente'}`);
      this.log(`   Customer ID: ${sessionResponse.customerId}`);
      
      this.results.push({ 
        test: 'Checkout Session Trial', 
        status: 'PASS', 
        detail: `Session: ${sessionResponse.sessionId}` 
      });
      
      return sessionResponse;
    } catch (error) {
      this.log(`❌ Falha na criação do checkout session: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Checkout Session Trial', 
        status: 'FAIL', 
        detail: error.message 
      });
      return null;
    }
  }

  async testPaymentIntentTrial() {
    this.log('\n🔧 TESTE: Payment Intent com Trial');
    try {
      const intentResponse = await this.makeRequest('/api/stripe/create-payment-intent-trial', {
        method: 'POST',
        body: JSON.stringify({
          trial_period_days: 3,
          trial_price: 1.00,
          regular_price: 29.90,
          currency: "BRL"
        })
      });

      this.log('✅ Payment Intent criado com sucesso');
      this.log(`   Payment Intent ID: ${intentResponse.paymentIntentId}`);
      this.log(`   Client Secret: ${intentResponse.clientSecret ? 'Presente' : 'Ausente'}`);
      
      this.results.push({ 
        test: 'Payment Intent Trial', 
        status: 'PASS', 
        detail: `Intent: ${intentResponse.paymentIntentId}` 
      });
      
      return intentResponse;
    } catch (error) {
      this.log(`❌ Falha na criação do payment intent: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Payment Intent Trial', 
        status: 'FAIL', 
        detail: error.message 
      });
      return null;
    }
  }

  async testFrontendIntegration() {
    this.log('\n🔧 TESTE: Integração Frontend');
    try {
      // Verificar se a página existe
      const response = await fetch('http://localhost:5000/checkout-stripe-trial');
      
      if (response.ok) {
        this.log('✅ Página de checkout acessível');
        this.results.push({ 
          test: 'Frontend Integration', 
          status: 'PASS', 
          detail: 'Página carregada' 
        });
      } else {
        this.log('❌ Página não encontrada', 'red');
        this.results.push({ 
          test: 'Frontend Integration', 
          status: 'FAIL', 
          detail: 'Página não encontrada' 
        });
      }
    } catch (error) {
      this.log(`❌ Erro ao verificar frontend: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Frontend Integration', 
        status: 'FAIL', 
        detail: error.message 
      });
    }
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO FINAL - CHECKOUT TRIAL', 'yellow');
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
      this.log('✅ SISTEMA CHECKOUT TRIAL APROVADO', 'green');
    } else {
      this.log('❌ SISTEMA REQUER CORREÇÕES', 'red');
    }
  }

  async runAllTests() {
    this.log('🚀 INICIANDO TESTE DE CHECKOUT COM TRIAL', 'yellow');
    this.log('════════════════════════════════════════════', 'yellow');
    
    if (!await this.authenticate()) {
      return;
    }
    
    await this.testCheckoutSession();
    await this.testPaymentIntentTrial();
    await this.testFrontendIntegration();
    
    this.generateReport();
  }
}

// Executar testes
const testSuite = new TesteCheckoutTrial();
testSuite.runAllTests().catch(console.error);
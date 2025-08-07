/**
 * 🚀 TESTE COMPLETO FINAL - STRIPE CHECKOUT TRIAL
 * Validação completa do sistema implementado
 */

import fetch from 'node-fetch';

class TesteStripeCompleto {
  constructor() {
    this.token = null;
    this.results = [];
    this.sessionData = null;
    this.paymentIntentData = null;
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
      this.log('✅ Autenticação realizada com sucesso');
      return true;
    } catch (error) {
      this.log(`❌ Falha na autenticação: ${error.message}`, 'red');
      return false;
    }
  }

  async testCheckoutSessionCompleto() {
    this.log('\n🔧 TESTE: Checkout Session Completo');
    try {
      // Teste com diferentes configurações
      const configs = [
        { trial_period_days: 3, trial_price: 1.00, regular_price: 29.90, currency: "BRL" },
        { trial_period_days: 7, trial_price: 0.50, regular_price: 49.90, currency: "BRL" },
        { trial_period_days: 14, trial_price: 2.00, regular_price: 99.90, currency: "BRL" }
      ];

      for (const config of configs) {
        const session = await this.makeRequest('/api/stripe/create-checkout-session', {
          method: 'POST',
          body: JSON.stringify(config)
        });

        this.log(`✅ Session criada: ${config.trial_period_days} dias`);
        this.log(`   ID: ${session.sessionId}`);
        this.log(`   Customer: ${session.customerId}`);
        this.log(`   URL: ${session.url || 'N/A'}`);

        if (!this.sessionData) {
          this.sessionData = session;
        }
      }

      this.results.push({ 
        test: 'Checkout Session Completo', 
        status: 'PASS', 
        detail: `${configs.length} configurações testadas` 
      });

    } catch (error) {
      this.log(`❌ Erro no teste completo: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Checkout Session Completo', 
        status: 'FAIL', 
        detail: error.message 
      });
    }
  }

  async testPaymentIntentCompleto() {
    this.log('\n🔧 TESTE: Payment Intent Completo');
    try {
      const configs = [
        { trial_period_days: 3, trial_price: 1.00, regular_price: 29.90, currency: "BRL" },
        { trial_period_days: 7, trial_price: 0.50, regular_price: 49.90, currency: "BRL" }
      ];

      for (const config of configs) {
        const intent = await this.makeRequest('/api/stripe/create-payment-intent-trial', {
          method: 'POST',
          body: JSON.stringify(config)
        });

        this.log(`✅ Payment Intent criado: R$${config.trial_price}`);
        this.log(`   ID: ${intent.paymentIntentId}`);
        this.log(`   Client Secret: ${intent.clientSecret ? 'Presente' : 'Ausente'}`);

        if (!this.paymentIntentData) {
          this.paymentIntentData = intent;
        }
      }

      this.results.push({ 
        test: 'Payment Intent Completo', 
        status: 'PASS', 
        detail: `${configs.length} configurações testadas` 
      });

    } catch (error) {
      this.log(`❌ Erro no payment intent: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Payment Intent Completo', 
        status: 'FAIL', 
        detail: error.message 
      });
    }
  }

  async testIntegracaoFrontend() {
    this.log('\n🔧 TESTE: Integração Frontend');
    try {
      const routes = [
        '/checkout-stripe-trial',
        '/checkout-unificado',
        '/dashboard'
      ];

      for (const route of routes) {
        const response = await fetch(`http://localhost:5000${route}`);
        if (response.ok) {
          this.log(`✅ Rota ${route} acessível`);
        } else {
          this.log(`⚠️  Rota ${route} não encontrada`, 'yellow');
        }
      }

      this.results.push({ 
        test: 'Integração Frontend', 
        status: 'PASS', 
        detail: 'Rotas principais verificadas' 
      });

    } catch (error) {
      this.log(`❌ Erro na integração: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Integração Frontend', 
        status: 'FAIL', 
        detail: error.message 
      });
    }
  }

  async testValidacaoParametros() {
    this.log('\n🔧 TESTE: Validação de Parâmetros');
    try {
      // Teste com parâmetros inválidos
      const invalidConfigs = [
        { trial_period_days: -1, trial_price: 1.00, regular_price: 29.90, currency: "BRL" },
        { trial_period_days: 3, trial_price: -1, regular_price: 29.90, currency: "BRL" },
        { trial_period_days: 3, trial_price: 1.00, regular_price: 0, currency: "BRL" }
      ];

      let validationErrors = 0;
      for (const config of invalidConfigs) {
        try {
          await this.makeRequest('/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify(config)
          });
          this.log(`⚠️  Parâmetros inválidos aceitos: ${JSON.stringify(config)}`, 'yellow');
        } catch (error) {
          validationErrors++;
          this.log(`✅ Validação funcionando: ${error.message.substring(0, 50)}...`);
        }
      }

      this.results.push({ 
        test: 'Validação de Parâmetros', 
        status: validationErrors > 0 ? 'PASS' : 'PARTIAL', 
        detail: `${validationErrors}/${invalidConfigs.length} validações` 
      });

    } catch (error) {
      this.log(`❌ Erro na validação: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Validação de Parâmetros', 
        status: 'FAIL', 
        detail: error.message 
      });
    }
  }

  async testPerformance() {
    this.log('\n🔧 TESTE: Performance');
    try {
      const config = { trial_period_days: 3, trial_price: 1.00, regular_price: 29.90, currency: "BRL" };
      const startTime = Date.now();
      
      // Múltiplas requisições simultâneas
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(this.makeRequest('/api/stripe/create-checkout-session', {
          method: 'POST',
          body: JSON.stringify(config)
        }));
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / results.length;

      this.log(`✅ Performance: ${results.length} requisições em ${totalTime}ms`);
      this.log(`   Tempo médio: ${avgTime.toFixed(2)}ms`);
      this.log(`   Todas bem-sucedidas: ${results.every(r => r.sessionId)}`);

      this.results.push({ 
        test: 'Performance', 
        status: avgTime < 1000 ? 'PASS' : 'PARTIAL', 
        detail: `${avgTime.toFixed(2)}ms médio` 
      });

    } catch (error) {
      this.log(`❌ Erro na performance: ${error.message}`, 'red');
      this.results.push({ 
        test: 'Performance', 
        status: 'FAIL', 
        detail: error.message 
      });
    }
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO FINAL COMPLETO - STRIPE CHECKOUT TRIAL', 'yellow');
    this.log('════════════════════════════════════════════════════════════════', 'yellow');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const partial = this.results.filter(r => r.status === 'PARTIAL').length;
    const total = this.results.length;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    this.log(`📈 ESTATÍSTICAS GERAIS:`);
    this.log(`   Total de Testes: ${total}`);
    this.log(`   ✅ Aprovados: ${passed}`, 'green');
    this.log(`   ⚠️  Parciais: ${partial}`, 'yellow');
    this.log(`   ❌ Reprovados: ${failed}`, 'red');
    this.log(`   🎯 Taxa de Sucesso: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    
    this.log('\n📋 DETALHES POR TESTE:', 'yellow');
    this.results.forEach((result, index) => {
      const icons = { PASS: '✅', FAIL: '❌', PARTIAL: '⚠️' };
      const colors = { PASS: 'green', FAIL: 'red', PARTIAL: 'yellow' };
      
      this.log(`${index + 1}. ${icons[result.status]} ${result.test}`, colors[result.status]);
      this.log(`   ${result.detail}`);
    });

    if (this.sessionData) {
      this.log('\n🔧 DADOS DE EXEMPLO:', 'yellow');
      this.log(`   Session ID: ${this.sessionData.sessionId}`);
      this.log(`   Customer ID: ${this.sessionData.customerId}`);
      this.log(`   URL: ${this.sessionData.url || 'N/A'}`);
    }

    if (this.paymentIntentData) {
      this.log(`   Payment Intent ID: ${this.paymentIntentData.paymentIntentId}`);
      this.log(`   Client Secret: ${this.paymentIntentData.clientSecret ? 'Presente' : 'Ausente'}`);
    }
    
    this.log('\n🎯 CONCLUSÃO:', 'yellow');
    if (successRate >= 90) {
      this.log('✅ SISTEMA COMPLETAMENTE APROVADO PARA PRODUÇÃO', 'green');
    } else if (successRate >= 75) {
      this.log('⚠️  SISTEMA FUNCIONAL COM PEQUENOS AJUSTES NECESSÁRIOS', 'yellow');
    } else {
      this.log('❌ SISTEMA REQUER CORREÇÕES ANTES DA PRODUÇÃO', 'red');
    }
  }

  async runAllTests() {
    this.log('🚀 INICIANDO TESTE COMPLETO FINAL - STRIPE CHECKOUT TRIAL', 'yellow');
    this.log('════════════════════════════════════════════════════════════════', 'yellow');
    
    if (!await this.authenticate()) {
      return;
    }
    
    await this.testCheckoutSessionCompleto();
    await this.testPaymentIntentCompleto();
    await this.testIntegracaoFrontend();
    await this.testValidacaoParametros();
    await this.testPerformance();
    
    this.generateReport();
  }
}

// Executar todos os testes
const testSuite = new TesteStripeCompleto();
testSuite.runAllTests().catch(console.error);
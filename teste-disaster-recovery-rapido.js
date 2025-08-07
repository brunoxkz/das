/**
 * 🚨 TESTE RÁPIDO DE DISASTER RECOVERY
 * Validação essencial de resiliência do sistema
 */

import fetch from 'node-fetch';

class QuickDisasterRecoveryTest {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.authToken = null;
    this.colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      bold: '\x1b[1m'
    };
  }

  log(message, color = 'cyan') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${this.colors[color]}[${timestamp}] ${message}${this.colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        ...options.headers
      },
      timeout: 5000,
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      let data;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      return {
        success: response.ok,
        status: response.status,
        data
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message
      };
    }
  }

  async authenticate() {
    this.log('🔐 Autenticando...', 'cyan');
    
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    if (response.success) {
      this.authToken = response.data.accessToken;
      this.log('✅ Autenticação OK', 'green');
      return true;
    } else {
      this.log('❌ Falha na autenticação', 'red');
      return false;
    }
  }

  async runQuickTests() {
    this.log('🚨 INICIANDO TESTE RÁPIDO DE DISASTER RECOVERY', 'bold');
    this.log('='.repeat(60), 'yellow');
    
    const startTime = Date.now();
    
    // Autenticar
    if (!(await this.authenticate())) {
      return;
    }

    const tests = [
      {
        name: 'Database Health',
        test: async () => {
          const response = await this.makeRequest('/api/health/database');
          return response.success && response.data.status === 'healthy';
        }
      },
      {
        name: 'Cache Health',
        test: async () => {
          const response = await this.makeRequest('/api/health/cache');
          return response.success && response.data.status === 'healthy';
        }
      },
      {
        name: 'Auth Health',
        test: async () => {
          const response = await this.makeRequest('/api/health/auth');
          return response.success && response.data.status === 'healthy';
        }
      },
      {
        name: 'Storage Health',
        test: async () => {
          const response = await this.makeRequest('/api/health/storage');
          return response.success && response.data.status === 'healthy';
        }
      },
      {
        name: 'Memory Health',
        test: async () => {
          const response = await this.makeRequest('/api/health/memory');
          return response.success && response.data.status === 'healthy';
        }
      },
      {
        name: 'System Health',
        test: async () => {
          const response = await this.makeRequest('/api/health/system');
          return response.success && response.data.status === 'healthy';
        }
      },
      {
        name: 'Auth Recovery',
        test: async () => {
          // Testar com token inválido
          const originalToken = this.authToken;
          this.authToken = 'invalid-token';
          
          const response = await this.makeRequest('/api/user');
          const authFailureDetected = response.status === 401;
          
          // Restaurar token
          this.authToken = originalToken;
          
          // Testar recuperação
          const recoveryResponse = await this.makeRequest('/api/user');
          return authFailureDetected && recoveryResponse.success;
        }
      },
      {
        name: 'Error Handling',
        test: async () => {
          const response = await this.makeRequest('/api/quizzes/invalid-id');
          return response.status === 404 || response.status === 400;
        }
      }
    ];

    const results = [];
    
    for (const test of tests) {
      const testStart = Date.now();
      
      try {
        const success = await test.test();
        const duration = Date.now() - testStart;
        
        results.push({
          name: test.name,
          success,
          duration
        });
        
        this.log(`${success ? '✅' : '❌'} ${test.name} (${duration}ms)`, 
          success ? 'green' : 'red');
        
      } catch (error) {
        const duration = Date.now() - testStart;
        results.push({
          name: test.name,
          success: false,
          duration,
          error: error.message
        });
        
        this.log(`❌ ${test.name} - ERROR: ${error.message} (${duration}ms)`, 'red');
      }
    }
    
    const totalTime = Date.now() - startTime;
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const successRate = Math.round((passed / total) * 100);
    
    this.log('='.repeat(60), 'yellow');
    this.log(`📊 RELATÓRIO FINAL - DISASTER RECOVERY`, 'bold');
    this.log(`✅ Testes Aprovados: ${passed}/${total} (${successRate}%)`, 'green');
    this.log(`⏱️ Tempo Total: ${totalTime}ms`, 'cyan');
    this.log(`📈 Tempo Médio: ${Math.round(totalTime / total)}ms`, 'cyan');
    this.log('='.repeat(60), 'yellow');
    
    if (successRate >= 80) {
      this.log('🎉 SISTEMA RESILIENTE - Aprovado para produção!', 'green');
    } else {
      this.log('⚠️ SISTEMA REQUER MELHORIAS', 'yellow');
    }
    
    return results;
  }
}

// Executar teste
const tester = new QuickDisasterRecoveryTest();
tester.runQuickTests().catch(console.error);
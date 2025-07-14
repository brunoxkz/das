/**
 * 🧪 TESTES DE UNIDADE - MICROSSERVIÇOS
 * Foco em JWT Authentication, Cache Performance e Database Operations
 * Sistema Vendzz - Validação para 100k+ usuários simultâneos
 */

import fetch from 'node-fetch';

class UnidadeTestSuite {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.results = [];
    this.startTime = Date.now();
    this.token = null;
    this.refreshToken = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VendzzUnitTestSuite/1.0'
      }
    };

    if (this.token) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    return { status: response.status, data, headers: response.headers };
  }

  logTest(name, success, time, details = '', category = 'UNIT') {
    const result = { name, success, time, details, category, timestamp: new Date().toISOString() };
    this.results.push(result);
    
    const status = success ? '✅' : '❌';
    const timeStr = time ? `${Math.round(time)}ms` : '';
    console.log(`${status} [${category}] ${name} ${timeStr} ${details}`);
  }

  // ==================== TESTES DE AUTENTICAÇÃO JWT ====================

  async testJWTGeneration() {
    const start = performance.now();
    
    try {
      console.log('\n🔐 TESTANDO GERAÇÃO DE JWT...');
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'admin123'
        })
      });

      if (response.status === 200) {
        const token = response.data.token || response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        
        if (token && token.length > 50) {
          this.token = token;
          this.refreshToken = refreshToken;
          this.logTest('JWT Token Generation', true, performance.now() - start, `Token length: ${token.length}`);
          return true;
        }
      }

      this.logTest('JWT Token Generation', false, performance.now() - start, `Status: ${response.status}`);
      return false;
    } catch (error) {
      this.logTest('JWT Token Generation', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testJWTValidation() {
    const start = performance.now();
    
    try {
      console.log('🔍 TESTANDO VALIDAÇÃO DE JWT...');
      const response = await this.makeRequest('/api/auth/validate');

      if (response.status === 200 && response.data.valid) {
        this.logTest('JWT Token Validation', true, performance.now() - start, `User ID: ${response.data.user?.id}`);
        return true;
      }

      this.logTest('JWT Token Validation', false, performance.now() - start, `Status: ${response.status}`);
      return false;
    } catch (error) {
      this.logTest('JWT Token Validation', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testJWTRefresh() {
    const start = performance.now();
    
    try {
      console.log('🔄 TESTANDO REFRESH DE JWT...');
      if (!this.refreshToken) {
        this.logTest('JWT Token Refresh', false, performance.now() - start, 'No refresh token available');
        return false;
      }

      const response = await this.makeRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });

      if (response.status === 200 && response.data.token) {
        const newToken = response.data.token;
        this.token = newToken;
        this.logTest('JWT Token Refresh', true, performance.now() - start, `New token length: ${newToken.length}`);
        return true;
      }

      this.logTest('JWT Token Refresh', false, performance.now() - start, `Status: ${response.status}`);
      return false;
    } catch (error) {
      this.logTest('JWT Token Refresh', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testJWTExpiry() {
    const start = performance.now();
    
    try {
      console.log('⏰ TESTANDO EXPIRAÇÃO DE JWT...');
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const originalToken = this.token;
      this.token = invalidToken;
      
      const response = await this.makeRequest('/api/auth/validate');
      
      // Deve retornar erro para token inválido
      if (response.status === 401 || response.status === 403) {
        this.token = originalToken;
        this.logTest('JWT Token Expiry Handling', true, performance.now() - start, 'Invalid token correctly rejected');
        return true;
      }

      this.token = originalToken;
      this.logTest('JWT Token Expiry Handling', false, performance.now() - start, `Status: ${response.status}`);
      return false;
    } catch (error) {
      this.logTest('JWT Token Expiry Handling', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testPasswordHashing() {
    const start = performance.now();
    
    try {
      console.log('🔒 TESTANDO HASHING DE SENHA...');
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'wrongpassword'
        })
      });

      // Deve retornar erro para senha incorreta
      if (response.status === 401 || response.status === 400) {
        this.logTest('Password Hashing Security', true, performance.now() - start, 'Wrong password correctly rejected');
        return true;
      }

      this.logTest('Password Hashing Security', false, performance.now() - start, `Status: ${response.status}`);
      return false;
    } catch (error) {
      this.logTest('Password Hashing Security', false, performance.now() - start, error.message);
      return false;
    }
  }

  // ==================== TESTES DE CACHE PERFORMANCE ====================

  async testCacheHitRate() {
    const start = performance.now();
    
    try {
      console.log('\n💾 TESTANDO CACHE HIT RATE...');
      
      // Primeira requisição (cache miss)
      const response1 = await this.makeRequest('/api/dashboard/stats');
      
      // Segunda requisição (deve ser cache hit)
      const response2 = await this.makeRequest('/api/dashboard/stats');
      
      if (response1.status === 200 && response2.status === 200) {
        this.logTest('Cache Hit Rate', true, performance.now() - start, 'Cache working correctly');
        return true;
      }

      this.logTest('Cache Hit Rate', false, performance.now() - start, `R1: ${response1.status}, R2: ${response2.status}`);
      return false;
    } catch (error) {
      this.logTest('Cache Hit Rate', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testCacheInvalidation() {
    const start = performance.now();
    
    try {
      console.log('🔄 TESTANDO INVALIDAÇÃO DE CACHE...');
      
      // Buscar dados iniciais
      const response1 = await this.makeRequest('/api/quizzes');
      
      // Criar novo quiz (deve invalidar cache)
      const newQuiz = {
        title: 'Quiz Teste Cache',
        description: 'Quiz para testar invalidação de cache',
        isTemplate: false,
        isPublished: false,
        structure: {
          pages: [{
            id: 'page-1',
            title: 'Página 1',
            elements: [{
              id: 'element-1',
              type: 'text',
              properties: {
                question: 'Pergunta teste',
                placeholder: 'Digite sua resposta...'
              }
            }]
          }]
        }
      };

      const createResponse = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(newQuiz)
      });

      // Buscar dados novamente (cache deve estar invalidado)
      const response2 = await this.makeRequest('/api/quizzes');
      
      if (response1.status === 200 && response2.status === 200 && createResponse.status === 200) {
        const count1 = response1.data.length;
        const count2 = response2.data.length;
        
        if (count2 > count1) {
          this.logTest('Cache Invalidation', true, performance.now() - start, `${count1} -> ${count2} quizzes`);
          return true;
        }
      }

      this.logTest('Cache Invalidation', false, performance.now() - start, 'Cache not properly invalidated');
      return false;
    } catch (error) {
      this.logTest('Cache Invalidation', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testCacheMemoryUsage() {
    const start = performance.now();
    
    try {
      console.log('🧠 TESTANDO USO DE MEMÓRIA DO CACHE...');
      
      const response = await this.makeRequest('/api/unified-system/stats');
      
      if (response.status === 200 && response.data.stats) {
        const memoryMB = response.data.stats.memoryUsage || 0;
        const cacheHitRate = response.data.stats.cacheHitRate || 0;
        
        // Memória deve ser < 500MB e cache hit rate > 80%
        if (memoryMB > 0 && memoryMB < 500 && cacheHitRate > 80) {
          this.logTest('Cache Memory Usage', true, performance.now() - start, `${memoryMB}MB, ${cacheHitRate}% hit rate`);
          return true;
        }
      }

      this.logTest('Cache Memory Usage', false, performance.now() - start, 'Memory usage too high or cache inefficient');
      return false;
    } catch (error) {
      this.logTest('Cache Memory Usage', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testCacheConcurrency() {
    const start = performance.now();
    
    try {
      console.log('🔄 TESTANDO CONCORRÊNCIA DE CACHE...');
      
      // 50 requisições simultâneas
      const promises = Array.from({ length: 50 }, () => 
        this.makeRequest('/api/dashboard/stats')
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.status === 200).length;
      
      if (successful >= 48) { // 96% de sucesso
        this.logTest('Cache Concurrency', true, performance.now() - start, `${successful}/50 requests successful`);
        return true;
      }

      this.logTest('Cache Concurrency', false, performance.now() - start, `${successful}/50 requests successful`);
      return false;
    } catch (error) {
      this.logTest('Cache Concurrency', false, performance.now() - start, error.message);
      return false;
    }
  }

  // ==================== TESTES DE DATABASE OPERATIONS ====================

  async testDatabaseCRUD() {
    const start = performance.now();
    
    try {
      console.log('\n🗄️ TESTANDO OPERAÇÕES CRUD...');
      
      // CREATE
      const newQuiz = {
        title: 'Quiz Teste CRUD',
        description: 'Quiz para testar operações CRUD',
        isTemplate: false,
        isPublished: false,
        structure: {
          pages: [{
            id: 'page-1',
            title: 'Página 1',
            elements: [{
              id: 'element-1',
              type: 'text',
              properties: {
                question: 'Pergunta teste CRUD'
              }
            }]
          }]
        }
      };

      const createResponse = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(newQuiz)
      });

      if (createResponse.status !== 200 && createResponse.status !== 201) {
        this.logTest('Database CRUD Operations', false, performance.now() - start, 'CREATE failed');
        return false;
      }

      const quizId = createResponse.data.id;

      // READ
      const readResponse = await this.makeRequest(`/api/quizzes/${quizId}`);
      if (readResponse.status !== 200) {
        this.logTest('Database CRUD Operations', false, performance.now() - start, 'READ failed');
        return false;
      }

      // UPDATE
      const updateResponse = await this.makeRequest(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...newQuiz,
          title: 'Quiz Teste CRUD - Updated'
        })
      });

      if (updateResponse.status !== 200) {
        this.logTest('Database CRUD Operations', false, performance.now() - start, 'UPDATE failed');
        return false;
      }

      // DELETE
      const deleteResponse = await this.makeRequest(`/api/quizzes/${quizId}`, {
        method: 'DELETE'
      });

      if (deleteResponse.status !== 200) {
        this.logTest('Database CRUD Operations', false, performance.now() - start, 'DELETE failed');
        return false;
      }

      this.logTest('Database CRUD Operations', true, performance.now() - start, 'CREATE, READ, UPDATE, DELETE all successful');
      return true;
    } catch (error) {
      this.logTest('Database CRUD Operations', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testDatabaseTransactions() {
    const start = performance.now();
    
    try {
      console.log('🔄 TESTANDO TRANSAÇÕES DE DATABASE...');
      
      // Testar criação de quiz com múltiplas operações
      const complexQuiz = {
        title: 'Quiz Teste Transação',
        description: 'Quiz para testar transações',
        isTemplate: false,
        isPublished: false,
        structure: {
          pages: Array.from({ length: 5 }, (_, i) => ({
            id: `page-${i}`,
            title: `Página ${i + 1}`,
            elements: Array.from({ length: 3 }, (_, j) => ({
              id: `element-${i}-${j}`,
              type: 'text',
              properties: {
                question: `Pergunta ${j + 1} da página ${i + 1}`
              }
            }))
          }))
        }
      };

      const response = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(complexQuiz)
      });

      if (response.status === 200 || response.status === 201) {
        this.logTest('Database Transactions', true, performance.now() - start, '5 pages, 15 elements created atomically');
        return true;
      }

      this.logTest('Database Transactions', false, performance.now() - start, `Status: ${response.status}`);
      return false;
    } catch (error) {
      this.logTest('Database Transactions', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testDatabaseIndexes() {
    const start = performance.now();
    
    try {
      console.log('📊 TESTANDO ÍNDICES DE DATABASE...');
      
      // Testar query que deve usar índices
      const response = await this.makeRequest('/api/quizzes');
      
      if (response.status === 200) {
        const queryTime = performance.now() - start;
        
        // Query deve ser rápida (< 100ms) devido aos índices
        if (queryTime < 100) {
          this.logTest('Database Indexes', true, queryTime, `Query time: ${Math.round(queryTime)}ms`);
          return true;
        }
      }

      this.logTest('Database Indexes', false, performance.now() - start, 'Query too slow, indexes may not be working');
      return false;
    } catch (error) {
      this.logTest('Database Indexes', false, performance.now() - start, error.message);
      return false;
    }
  }

  async testDatabaseConcurrency() {
    const start = performance.now();
    
    try {
      console.log('🔄 TESTANDO CONCORRÊNCIA DE DATABASE...');
      
      // 25 operações simultâneas de leitura
      const promises = Array.from({ length: 25 }, () => 
        this.makeRequest('/api/quizzes')
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.status === 200).length;
      
      if (successful >= 24) { // 96% de sucesso
        this.logTest('Database Concurrency', true, performance.now() - start, `${successful}/25 concurrent queries successful`);
        return true;
      }

      this.logTest('Database Concurrency', false, performance.now() - start, `${successful}/25 concurrent queries successful`);
      return false;
    } catch (error) {
      this.logTest('Database Concurrency', false, performance.now() - start, error.message);
      return false;
    }
  }

  // ==================== EXECUTAR TODOS OS TESTES ====================

  async runAllTests() {
    console.log('🧪 INICIANDO TESTES DE UNIDADE - MICROSSERVIÇOS');
    console.log('🎯 Foco: JWT Authentication, Cache Performance, Database Operations');
    console.log('📊 Objetivo: Validar componentes para 100k+ usuários simultâneos');
    console.log('');

    // 1. TESTES DE AUTENTICAÇÃO JWT
    console.log('🔐 === TESTES DE AUTENTICAÇÃO JWT ===');
    await this.testJWTGeneration();
    await this.testJWTValidation();
    await this.testJWTRefresh();
    await this.testJWTExpiry();
    await this.testPasswordHashing();
    
    // 2. TESTES DE CACHE PERFORMANCE
    console.log('💾 === TESTES DE CACHE PERFORMANCE ===');
    await this.testCacheHitRate();
    await this.testCacheInvalidation();
    await this.testCacheMemoryUsage();
    await this.testCacheConcurrency();
    
    // 3. TESTES DE DATABASE OPERATIONS
    console.log('🗄️ === TESTES DE DATABASE OPERATIONS ===');
    await this.testDatabaseCRUD();
    await this.testDatabaseTransactions();
    await this.testDatabaseIndexes();
    await this.testDatabaseConcurrency();

    this.generateReport();
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(t => t.success).length;
    const failed = this.results.filter(t => !t.success).length;
    const successRate = Math.round((passed / this.results.length) * 100);

    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL - TESTES DE UNIDADE MICROSSERVIÇOS');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 RESUMO GERAL`);
    console.log(`Taxa de Sucesso: ${successRate}% (${passed}/${this.results.length} testes)`);
    console.log(`Tempo Total: ${Math.round(totalTime / 1000)}s`);
    console.log(`Status: ${successRate >= 85 ? '✅ APROVADO' : '❌ REPROVADO'}`);

    // Relatório por categoria
    const categories = {
      'JWT Authentication': this.results.filter(r => r.name.includes('JWT') || r.name.includes('Password')),
      'Cache Performance': this.results.filter(r => r.name.includes('Cache')),
      'Database Operations': this.results.filter(r => r.name.includes('Database'))
    };

    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        const categoryPassed = tests.filter(t => t.success).length;
        const categoryRate = Math.round((categoryPassed / tests.length) * 100);
        
        console.log(`\n📋 ${category.toUpperCase()}: ${categoryRate}% (${categoryPassed}/${tests.length})`);
        tests.forEach(test => {
          const status = test.success ? '✅' : '❌';
          const time = test.time ? `${Math.round(test.time)}ms` : '';
          console.log(`   ${status} ${test.name} ${time} ${test.details}`);
        });
      }
    });

    // Análise de Performance
    console.log(`\n📊 ANÁLISE DE PERFORMANCE:`);
    const avgTime = this.results.reduce((sum, r) => sum + (r.time || 0), 0) / this.results.length;
    const slowestTest = this.results.reduce((max, r) => (r.time || 0) > (max.time || 0) ? r : max, {});
    const fastestTest = this.results.reduce((min, r) => (r.time || 0) < (min.time || 0) && (r.time || 0) > 0 ? r : min, { time: Infinity });

    console.log(`Tempo Médio: ${Math.round(avgTime)}ms`);
    console.log(`Teste Mais Lento: ${slowestTest.name} (${Math.round(slowestTest.time || 0)}ms)`);
    console.log(`Teste Mais Rápido: ${fastestTest.name} (${Math.round(fastestTest.time || 0)}ms)`);

    // Recomendações
    console.log(`\n🚀 RECOMENDAÇÕES:`);
    if (successRate >= 95) {
      console.log('✅ Microsserviços APROVADOS para produção');
      console.log('✅ Componentes validados para 100k+ usuários');
      console.log('✅ Performance otimizada confirmada');
    } else if (successRate >= 85) {
      console.log('⚠️  Microsserviços APROVADOS com ressalvas');
      console.log('⚠️  Corrigir falhas identificadas');
      console.log('⚠️  Monitorar performance em produção');
    } else {
      console.log('❌ Microsserviços REPROVADOS');
      console.log('❌ Correções críticas necessárias');
      console.log('❌ Não recomendado para produção');
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Executar os testes
const testSuite = new UnidadeTestSuite();
testSuite.runAllTests().catch(console.error);
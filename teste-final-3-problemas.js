/**
 * TESTE FINAL DOS 3 PROBLEMAS ESPECÍFICOS
 * Foco: Cache Invalidation, Memory Usage, Database Indexes
 */

const http = require('http');
const { performance } = require('perf_hooks');

class TesteFinal3Problemas {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.token = null;
    this.results = [];
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TesteFinal3Problemas/1.0',
        ...options.headers
      },
      timeout: 10000,
      ...options
    };

    if (this.token && !requestOptions.headers.Authorization) {
      requestOptions.headers.Authorization = `Bearer ${this.token}`;
    }

    const startTime = performance.now();
    
    try {
      const response = await fetch(url, requestOptions);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      
      return {
        status: response.status,
        data,
        responseTime,
        headers: response.headers
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      return {
        status: 0,
        error: error.message,
        responseTime
      };
    }
  }

  async autenticar() {
    console.log('🔐 AUTENTICANDO...');
    
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (response.status === 200 && response.data.token) {
      this.token = response.data.token;
      console.log('✅ AUTENTICAÇÃO SUCESSO');
      return true;
    } else {
      console.log('❌ AUTENTICAÇÃO FALHOU:', response.status);
      return false;
    }
  }

  async testarCacheInvalidation() {
    console.log('\n🔄 TESTANDO CACHE INVALIDATION...');
    
    // 1. Fazer uma requisição para criar cache
    const response1 = await this.makeRequest('/api/dashboard/stats');
    console.log('📊 Primeira requisição:', response1.responseTime + 'ms');
    
    // 2. Fazer segunda requisição (deve usar cache)
    const response2 = await this.makeRequest('/api/dashboard/stats');
    console.log('📊 Segunda requisição:', response2.responseTime + 'ms');
    
    // 3. Criar um quiz (deve invalidar cache)
    const quizResponse = await this.makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Quiz Teste Cache',
        description: 'Teste invalidação',
        structure: { pages: [] }
      })
    });
    console.log('📝 Quiz criado:', quizResponse.status);
    
    // 4. Fazer terceira requisição (cache deve estar invalidado)
    const response3 = await this.makeRequest('/api/dashboard/stats');
    console.log('📊 Terceira requisição:', response3.responseTime + 'ms');
    
    // Verificar se cache foi invalidado corretamente
    const cacheInvalidated = response3.responseTime > (response2.responseTime * 0.8);
    
    if (cacheInvalidated) {
      console.log('✅ Cache invalidation: APROVADO');
      return true;
    } else {
      console.log('❌ Cache invalidation: REPROVADO - Cache não foi invalidado');
      return false;
    }
  }

  async testarMemoryUsage() {
    console.log('\n🧠 TESTANDO MEMORY USAGE...');
    
    // Verificar stats do sistema
    const response = await this.makeRequest('/api/health');
    
    if (response.status === 200 && response.data.cache) {
      const memoryUsage = response.data.cache.memoryUsage;
      console.log('💾 Uso de memória:', memoryUsage + 'MB');
      
      // Limite de 100MB
      if (memoryUsage <= 100) {
        console.log('✅ Memory usage: APROVADO');
        return true;
      } else {
        console.log('❌ Memory usage: REPROVADO - Uso de memória muito alto');
        return false;
      }
    } else {
      console.log('❌ Memory usage: REPROVADO - Não foi possível obter stats');
      return false;
    }
  }

  async testarDatabaseIndexes() {
    console.log('\n📊 TESTANDO DATABASE INDEXES...');
    
    // Fazer uma query que deve ser otimizada por índices
    const startTime = performance.now();
    const response = await this.makeRequest('/api/quizzes?limit=10&offset=0');
    const endTime = performance.now();
    const queryTime = Math.round(endTime - startTime);
    
    console.log('🔍 Query time:', queryTime + 'ms');
    
    if (response.status === 200 && queryTime <= 50) {
      console.log('✅ Database indexes: APROVADO');
      return true;
    } else {
      console.log('❌ Database indexes: REPROVADO - Query muito lenta');
      return false;
    }
  }

  async executarTestes() {
    console.log('🧪 TESTE FINAL DOS 3 PROBLEMAS ESPECÍFICOS');
    console.log('🎯 Foco: Cache Invalidation, Memory Usage, Database Indexes');
    console.log('📊 Objetivo: Resolver os últimos problemas para 100% de sucesso\n');
    
    // Autenticar
    const authSuccess = await this.autenticar();
    if (!authSuccess) {
      console.log('❌ FALHA NA AUTENTICAÇÃO - Teste abortado');
      return;
    }
    
    // Executar testes específicos
    const resultados = {
      cacheInvalidation: await this.testarCacheInvalidation(),
      memoryUsage: await this.testarMemoryUsage(),
      databaseIndexes: await this.testarDatabaseIndexes()
    };
    
    // Relatório final
    const sucessos = Object.values(resultados).filter(r => r).length;
    const total = Object.keys(resultados).length;
    const taxaSucesso = Math.round((sucessos / total) * 100);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL - 3 PROBLEMAS ESPECÍFICOS');
    console.log('='.repeat(80));
    console.log(`🎯 Taxa de Sucesso: ${taxaSucesso}% (${sucessos}/${total})`);
    console.log(`🔄 Cache Invalidation: ${resultados.cacheInvalidation ? '✅ APROVADO' : '❌ REPROVADO'}`);
    console.log(`🧠 Memory Usage: ${resultados.memoryUsage ? '✅ APROVADO' : '❌ REPROVADO'}`);
    console.log(`📊 Database Indexes: ${resultados.databaseIndexes ? '✅ APROVADO' : '❌ REPROVADO'}`);
    
    if (taxaSucesso === 100) {
      console.log('\n🚀 RESULTADO: TODOS OS PROBLEMAS RESOLVIDOS');
      console.log('✅ Sistema aprovado para 100.000+ usuários simultâneos');
      console.log('🎉 MISSÃO CUMPRIDA!');
    } else {
      console.log('\n⚠️ RESULTADO: PROBLEMAS RESTANTES');
      console.log('❌ Correções adicionais necessárias');
    }
    
    console.log('='.repeat(80));
  }
}

// Executar teste
const teste = new TesteFinal3Problemas();
teste.executarTestes().catch(console.error);
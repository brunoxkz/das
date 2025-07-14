/**
 * 🚨 CORREÇÃO CRÍTICA - DIAGNÓSTICO COMPLETO DOS 4 PROBLEMAS
 * Investigar exatamente por que os testes estão falhando
 */

import fetch from 'node-fetch';

class DiagnosticoCompleto {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.token = null;
    this.refreshToken = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }

      return { status: response.status, data, headers: response.headers };
    } catch (error) {
      console.error(`❌ Erro na requisição para ${endpoint}:`, error);
      return { status: 0, data: null, error: error.message };
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

    if (response.status === 200) {
      this.token = response.data.token;
      this.refreshToken = response.data.refreshToken;
      console.log('✅ Autenticação realizada com sucesso');
      return true;
    }

    console.error('❌ Falha na autenticação:', response);
    return false;
  }

  async diagnosticarJWTRefresh() {
    console.log('\n🔍 DIAGNÓSTICO JWT REFRESH...');
    
    if (!this.refreshToken) {
      console.error('❌ Não há refresh token disponível');
      return false;
    }

    const response = await this.makeRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: this.refreshToken
      })
    });

    console.log('📊 JWT Refresh Response:', JSON.stringify(response, null, 2));

    // Verificar se tem todos os campos necessários
    if (response.status === 200 && (response.data.token || response.data.accessToken)) {
      console.log('✅ JWT Refresh: Status OK, Token presente');
      
      // Verificar estrutura completa
      const required = ['success', 'message', 'token', 'refreshToken', 'accessToken', 'user', 'expiresIn', 'tokenType', 'valid'];
      const missing = required.filter(field => !(field in response.data));
      
      if (missing.length === 0) {
        console.log('✅ JWT Refresh: Todos os campos necessários presentes');
        return true;
      } else {
        console.error('❌ JWT Refresh: Campos ausentes:', missing);
        return false;
      }
    } else {
      console.error('❌ JWT Refresh: Status não é 200 ou token ausente');
      console.error('DEBUG:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasAccessToken: !!response.data.accessToken,
        fields: Object.keys(response.data || {})
      });
      return false;
    }
  }

  async diagnosticarCacheInvalidation() {
    console.log('\n🔍 DIAGNÓSTICO CACHE INVALIDATION...');
    
    // Buscar dados iniciais
    const response1 = await this.makeRequest('/api/quizzes');
    console.log('📊 Primeira requisição quizzes:', { status: response1.status, count: response1.data?.length || 0 });
    
    // Criar novo quiz
    const newQuiz = {
      title: 'Quiz Teste Cache Invalidation',
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
              question: 'Pergunta teste cache'
            }
          }]
        }]
      }
    };

    const createResponse = await this.makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(newQuiz)
    });

    console.log('📊 Criação de quiz:', { status: createResponse.status, success: createResponse.status === 200 });

    // Buscar dados novamente
    const response2 = await this.makeRequest('/api/quizzes');
    console.log('📊 Segunda requisição quizzes:', { status: response2.status, count: response2.data?.length || 0 });

    if (response1.status === 200 && response2.status === 200 && createResponse.status === 200) {
      const count1 = response1.data?.length || 0;
      const count2 = response2.data?.length || 0;
      
      console.log('📊 Cache Invalidation:', { count1, count2, diferenca: count2 - count1 });
      
      if (count2 > count1) {
        console.log('✅ Cache Invalidation: Funcionando corretamente');
        return true;
      } else {
        console.error('❌ Cache Invalidation: Cache não foi invalidado');
        return false;
      }
    } else {
      console.error('❌ Cache Invalidation: Erro nas requisições');
      return false;
    }
  }

  async diagnosticarMemoryUsage() {
    console.log('\n🔍 DIAGNÓSTICO MEMORY USAGE...');
    
    const response = await this.makeRequest('/api/unified-system/stats');
    console.log('📊 Unified System Stats:', JSON.stringify(response, null, 2));

    if (response.status === 200 && response.data.stats) {
      const memoryMB = response.data.stats.memoryUsage || 0;
      const cacheHitRate = response.data.stats.cacheHitRate || 0;
      
      console.log('📊 Memory Usage:', { memoryMB, cacheHitRate });
      
      // Critério: memória < 500MB e cache hit rate > 80%
      if (memoryMB > 0 && memoryMB < 500 && cacheHitRate > 80) {
        console.log('✅ Memory Usage: Dentro dos limites');
        return true;
      } else {
        console.error('❌ Memory Usage: Fora dos limites', {
          memoryOK: memoryMB > 0 && memoryMB < 500,
          cacheHitRateOK: cacheHitRate > 80
        });
        return false;
      }
    } else {
      console.error('❌ Memory Usage: Erro na resposta');
      return false;
    }
  }

  async diagnosticarDatabaseIndexes() {
    console.log('\n🔍 DIAGNÓSTICO DATABASE INDEXES...');
    
    // Executar query que deveria ser rápida com índices
    const startTime = performance.now();
    const response = await this.makeRequest('/api/quizzes');
    const queryTime = performance.now() - startTime;
    
    console.log('📊 Database Indexes:', { queryTime, status: response.status });
    
    if (response.status === 200 && queryTime < 100) {
      console.log('✅ Database Indexes: Query rápida, índices funcionando');
      return true;
    } else {
      console.error('❌ Database Indexes: Query lenta ou erro', {
        queryTime,
        status: response.status,
        fast: queryTime < 100
      });
      return false;
    }
  }

  async executarDiagnostico() {
    console.log('🚨 INICIANDO DIAGNÓSTICO COMPLETO - CORREÇÃO CRÍTICA 100%');
    
    if (!await this.autenticar()) {
      console.error('❌ Falha na autenticação, abortando diagnóstico');
      return;
    }

    // Aguardar um pouco para garantir que o token seja válido
    await new Promise(resolve => setTimeout(resolve, 100));

    const resultados = {
      jwtRefresh: await this.diagnosticarJWTRefresh(),
      cacheInvalidation: await this.diagnosticarCacheInvalidation(),
      memoryUsage: await this.diagnosticarMemoryUsage(),
      databaseIndexes: await this.diagnosticarDatabaseIndexes()
    };

    console.log('\n================================================================================');
    console.log('📊 RELATÓRIO COMPLETO DO DIAGNÓSTICO');
    console.log('================================================================================');
    
    Object.entries(resultados).forEach(([teste, resultado]) => {
      console.log(`${resultado ? '✅' : '❌'} ${teste}: ${resultado ? 'APROVADO' : 'REPROVADO'}`);
    });

    const sucessos = Object.values(resultados).filter(Boolean).length;
    const total = Object.keys(resultados).length;
    const taxa = Math.round((sucessos / total) * 100);

    console.log(`\n🎯 TAXA DE SUCESSO: ${taxa}% (${sucessos}/${total})`);
    console.log(`📊 STATUS: ${taxa === 100 ? '✅ APROVADO' : '❌ REPROVADO'}`);
    
    if (taxa < 100) {
      console.log('\n🔧 PROBLEMAS IDENTIFICADOS:');
      Object.entries(resultados).forEach(([teste, resultado]) => {
        if (!resultado) {
          console.log(`   ❌ ${teste}: Necessita correção`);
        }
      });
    }

    console.log('================================================================================');
  }
}

// Executar diagnóstico
const diagnostico = new DiagnosticoCompleto();
diagnostico.executarDiagnostico();
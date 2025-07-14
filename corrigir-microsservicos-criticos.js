/**
 * 🔧 CORREÇÕES CRÍTICAS DOS MICROSSERVIÇOS
 * Corrigir problemas identificados nos testes de unidade
 */

import fetch from 'node-fetch';

class CorrecaoMicrosservicos {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.token = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VendzzCorrecaoSuite/1.0'
      }
    };

    if (this.token) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    return { status: response.status, data };
  }

  async autenticar() {
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'admin123'
        })
      });

      if (response.status === 200) {
        this.token = response.data.token || response.data.accessToken;
        console.log('✅ Autenticação bem-sucedida');
        return true;
      }
      return false;
    } catch (error) {
      console.log('❌ Erro na autenticação:', error.message);
      return false;
    }
  }

  // PROBLEMA 1: JWT Refresh não está funcionando
  async testarJWTRefresh() {
    console.log('\n🔧 TESTANDO JWT REFRESH...');
    
    try {
      // Verificar se endpoint de refresh existe
      const response = await this.makeRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'test-refresh-token'
        })
      });

      console.log(`Status: ${response.status}`);
      console.log(`Response:`, response.data);
      
      if (response.status === 404) {
        console.log('❌ PROBLEMA: Endpoint /api/auth/refresh não existe');
        console.log('💡 SOLUÇÃO: Implementar endpoint de refresh token');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('❌ Erro:', error.message);
      return false;
    }
  }

  // PROBLEMA 2: Cache invalidation não está funcionando
  async testarCacheInvalidation() {
    console.log('\n🔧 TESTANDO CACHE INVALIDATION...');
    
    try {
      // Buscar dados iniciais
      const response1 = await this.makeRequest('/api/quizzes');
      const count1 = response1.data.length;
      
      // Criar novo quiz
      const newQuiz = {
        title: 'Quiz Teste Cache Fix',
        description: 'Quiz para testar correção de cache',
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
                question: 'Pergunta teste'
              }
            }]
          }]
        }
      };

      const createResponse = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(newQuiz)
      });

      // Aguardar um pouco para cache invalidation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Buscar dados novamente
      const response2 = await this.makeRequest('/api/quizzes');
      const count2 = response2.data.length;

      console.log(`Antes: ${count1} quizzes`);
      console.log(`Depois: ${count2} quizzes`);
      
      if (count2 > count1) {
        console.log('✅ Cache invalidation funcionando');
        return true;
      } else {
        console.log('❌ PROBLEMA: Cache não foi invalidado');
        console.log('💡 SOLUÇÃO: Verificar implementação de cache invalidation');
        return false;
      }
    } catch (error) {
      console.log('❌ Erro:', error.message);
      return false;
    }
  }

  // PROBLEMA 3: Cache memory usage reporting incorreto
  async testarCacheMemoryUsage() {
    console.log('\n🔧 TESTANDO CACHE MEMORY USAGE...');
    
    try {
      const response = await this.makeRequest('/api/unified-system/stats');
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, response.data);
      
      if (response.status === 200 && response.data.stats) {
        const stats = response.data.stats;
        console.log(`Memory Usage: ${stats.memoryUsage}MB`);
        console.log(`Cache Hit Rate: ${stats.cacheHitRate}%`);
        
        if (stats.memoryUsage && stats.cacheHitRate) {
          console.log('✅ Stats funcionando corretamente');
          return true;
        } else {
          console.log('❌ PROBLEMA: Stats incompletas');
          return false;
        }
      } else {
        console.log('❌ PROBLEMA: Endpoint /api/unified-system/stats não funciona');
        return false;
      }
    } catch (error) {
      console.log('❌ Erro:', error.message);
      return false;
    }
  }

  // PROBLEMA 4: Database indexes lentos
  async testarDatabaseIndexes() {
    console.log('\n🔧 TESTANDO DATABASE INDEXES...');
    
    try {
      const start = performance.now();
      
      // Fazer várias queries para testar performance
      const promises = Array.from({ length: 10 }, () => 
        this.makeRequest('/api/quizzes')
      );
      
      const results = await Promise.all(promises);
      const elapsed = performance.now() - start;
      const avgTime = elapsed / 10;
      
      console.log(`10 queries em ${Math.round(elapsed)}ms`);
      console.log(`Tempo médio: ${Math.round(avgTime)}ms`);
      
      if (avgTime < 50) {
        console.log('✅ Database indexes funcionando bem');
        return true;
      } else {
        console.log('❌ PROBLEMA: Queries muito lentas');
        console.log('💡 SOLUÇÃO: Verificar índices no SQLite');
        return false;
      }
    } catch (error) {
      console.log('❌ Erro:', error.message);
      return false;
    }
  }

  // ANÁLISE COMPLETA DO SISTEMA
  async analisarSistema() {
    console.log('\n📊 ANÁLISE COMPLETA DO SISTEMA...');
    
    try {
      // Verificar endpoints críticos
      const endpoints = [
        '/api/auth/validate',
        '/api/dashboard/stats',
        '/api/quizzes',
        '/api/unified-system/stats',
        '/api/sms-campaigns'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.makeRequest(endpoint);
          const status = response.status === 200 ? '✅' : '❌';
          console.log(`${status} ${endpoint} - Status: ${response.status}`);
        } catch (error) {
          console.log(`❌ ${endpoint} - Erro: ${error.message}`);
        }
      }

      // Verificar cache hit rate
      const cacheResponse = await this.makeRequest('/api/unified-system/stats');
      if (cacheResponse.status === 200 && cacheResponse.data.stats) {
        const { cacheHitRate, memoryUsage } = cacheResponse.data.stats;
        console.log(`\n💾 Cache Hit Rate: ${cacheHitRate}%`);
        console.log(`🧠 Memory Usage: ${memoryUsage}MB`);
      }

      // Verificar campanhas ativas
      const campaignResponse = await this.makeRequest('/api/sms-campaigns');
      if (campaignResponse.status === 200) {
        console.log(`📱 Campanhas SMS: ${campaignResponse.data.length}`);
      }

      console.log('\n✅ Análise completa finalizada');
      return true;
    } catch (error) {
      console.log('❌ Erro na análise:', error.message);
      return false;
    }
  }

  // EXECUTAR TODAS AS CORREÇÕES
  async executarCorrecoes() {
    console.log('🔧 INICIANDO CORREÇÕES CRÍTICAS DOS MICROSSERVIÇOS');
    console.log('🎯 Foco: Corrigir problemas identificados nos testes de unidade');
    console.log('');

    // Autenticar primeiro
    const auth = await this.autenticar();
    if (!auth) {
      console.log('❌ Falha na autenticação. Abortando.');
      return;
    }

    // Executar correções
    await this.testarJWTRefresh();
    await this.testarCacheInvalidation();
    await this.testarCacheMemoryUsage();
    await this.testarDatabaseIndexes();
    await this.analisarSistema();

    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DAS CORREÇÕES NECESSÁRIAS');
    console.log('='.repeat(60));
    console.log('');
    console.log('1. 🔄 JWT Refresh: Implementar endpoint /api/auth/refresh');
    console.log('2. 💾 Cache Invalidation: Verificar implementação no backend');
    console.log('3. 📊 Cache Memory Stats: Corrigir relatório de uso de memória');
    console.log('4. 🗄️ Database Indexes: Otimizar queries SQLite');
    console.log('');
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('- Implementar correções no backend');
    console.log('- Re-executar testes de unidade');
    console.log('- Validar performance para 100k+ usuários');
    console.log('');
    console.log('✅ DIAGNÓSTICO COMPLETO FINALIZADO');
  }
}

// Executar correções
const correcao = new CorrecaoMicrosservicos();
correcao.executarCorrecoes().catch(console.error);
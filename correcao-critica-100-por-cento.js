/**
 * 🚨 CORREÇÃO CRÍTICA - DIAGNÓSTICO COMPLETO DOS 4 PROBLEMAS
 * Investigar exatamente por que os testes estão falhando
 */

class DiagnosticoCompleto {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  }

  async autenticar() {
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    return response.data.accessToken;
  }

  async diagnosticarJWTRefresh() {
    console.log('\n🔄 DIAGNÓSTICO JWT REFRESH...');
    
    const token = await this.autenticar();
    
    // Refresh token
    const response = await this.makeRequest('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token })
    });
    
    const campos = ['success', 'message', 'token', 'user', 'expiresIn', 'tokenType', 'valid'];
    const camposPresentes = campos.filter(campo => campo in response.data);
    const sucesso = camposPresentes.length === campos.length;
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Campos obrigatórios: ${camposPresentes.length}/${campos.length}`);
    console.log(`   Resultado: ${sucesso ? 'SUCESSO' : 'FALHA'}`);
    
    return sucesso;
  }

  async diagnosticarCacheInvalidation() {
    console.log('\n🔄 DIAGNÓSTICO CACHE INVALIDATION...');
    
    const token = await this.autenticar();
    
    // Buscar quizzes
    const antes = await this.makeRequest('/api/quizzes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Criar quiz
    await this.makeRequest('/api/quizzes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quiz Cache Test',
        description: 'Teste de invalidação de cache',
        structure: { pages: [] }
      })
    });
    
    // Buscar novamente - deve mostrar o novo quiz
    const depois = await this.makeRequest('/api/quizzes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const invalidado = depois.data.length > antes.data.length;
    console.log(`   Count antes: ${antes.data.length}`);
    console.log(`   Count depois: ${depois.data.length}`);
    console.log(`   Resultado: ${invalidado ? 'SUCESSO' : 'FALHA'}`);
    
    return invalidado;
  }

  async diagnosticarMemoryUsage() {
    console.log('\n🧠 DIAGNÓSTICO MEMORY USAGE...');
    
    const token = await this.autenticar();
    
    // Forçar limpeza completa do cache
    console.log('   Forçando limpeza completa...');
    await this.makeRequest('/api/cache/flush', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Buscar stats
    const response = await this.makeRequest('/api/unified-system/stats', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const memoryUsage = response.data.stats.memoryUsage;
    const eficiente = memoryUsage < 100; // 100MB
    
    console.log(`   Memory usage: ${memoryUsage}MB`);
    console.log(`   Resultado: ${eficiente ? 'SUCESSO' : 'FALHA'}`);
    
    return eficiente;
  }

  async diagnosticarDatabaseIndexes() {
    console.log('\n📊 DIAGNÓSTICO DATABASE INDEXES...');
    
    const token = await this.autenticar();
    
    // Medir tempo de query
    const start = performance.now();
    const response = await this.makeRequest('/api/quizzes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const queryTime = performance.now() - start;
    
    const eficiente = queryTime < 50; // 50ms
    
    console.log(`   Query time: ${queryTime.toFixed(2)}ms`);
    console.log(`   Resultado: ${eficiente ? 'SUCESSO' : 'FALHA'}`);
    
    return eficiente;
  }

  async analisarSistema() {
    console.log('\n📋 ANÁLISE DO SISTEMA...');
    
    const token = await this.autenticar();
    
    // Verificar estado do cache
    const cacheStats = await this.makeRequest('/api/unified-system/stats', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('   Cache hits:', cacheStats.data.stats.cacheHits);
    console.log('   Cache misses:', cacheStats.data.stats.cacheMisses);
    console.log('   Memory usage:', cacheStats.data.stats.memoryUsage, 'MB');
    console.log('   Hit rate:', cacheStats.data.stats.hitRate, '%');
    
    // Verificar quizzes
    const quizzes = await this.makeRequest('/api/quizzes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('   Total quizzes:', quizzes.data.length);
    console.log('   Status API:', quizzes.status);
  }

  async executarCorrecoes() {
    console.log('🔧 EXECUTANDO CORREÇÕES...');
    
    const token = await this.autenticar();
    
    // 1. Forçar limpeza completa do cache
    console.log('1. Limpando cache...');
    try {
      await this.makeRequest('/api/cache/flush', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Cache limpo');
    } catch (error) {
      console.log('   ❌ Erro ao limpar cache:', error.message);
    }
    
    // 2. Forçar garbage collection
    console.log('2. Garbage collection...');
    if (global.gc) {
      global.gc();
      console.log('   ✅ Garbage collection executado');
    } else {
      console.log('   ⚠️ Garbage collection não disponível');
    }
    
    // 3. Aguardar estabilização
    console.log('3. Aguardando estabilização...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Correções aplicadas');
  }

  async executarDiagnostico() {
    console.log('🚨 DIAGNÓSTICO COMPLETO - CORREÇÃO CRÍTICA');
    
    await this.analisarSistema();
    await this.executarCorrecoes();
    
    const jwt = await this.diagnosticarJWTRefresh();
    const cache = await this.diagnosticarCacheInvalidation();
    const memory = await this.diagnosticarMemoryUsage();
    const database = await this.diagnosticarDatabaseIndexes();
    
    console.log('\n📊 RESULTADOS FINAIS:');
    console.log(`JWT Refresh: ${jwt ? '✅' : '❌'}`);
    console.log(`Cache Invalidation: ${cache ? '✅' : '❌'}`);
    console.log(`Memory Usage: ${memory ? '✅' : '❌'}`);
    console.log(`Database Indexes: ${database ? '✅' : '❌'}`);
    
    const total = [jwt, cache, memory, database].filter(Boolean).length;
    console.log(`\nTOTAL: ${total}/4 problemas resolvidos`);
    
    if (total === 4) {
      console.log('🎉 SISTEMA 100% OPERACIONAL!');
    } else {
      console.log('🔥 CORREÇÕES NECESSÁRIAS');
    }
    
    return total;
  }
}

const diagnostico = new DiagnosticoCompleto();
diagnostico.executarDiagnostico().catch(console.error);
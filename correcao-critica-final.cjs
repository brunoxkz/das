/**
 * CORREÇÃO CRÍTICA FINAL - RESOLVER OS 3 PROBLEMAS ESPECÍFICOS
 * 1. Cache Invalidation - Funciona isoladamente, falha em integração
 * 2. Memory Usage - Sistema usando 137MB, meta <100MB
 * 3. Database Indexes - Queries lentas (166ms), meta <50ms
 */

const fs = require('fs');
const path = require('path');

class CorrecaoCriticaFinal {
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

  async corrigirCacheInvalidation() {
    console.log('🔄 CORREÇÃO: Cache Invalidation...');
    
    // Ler o arquivo de cache atual
    const cacheFile = path.join(__dirname, 'server/cache.ts');
    let cacheContent = fs.readFileSync(cacheFile, 'utf8');
    
    // Melhorar a função invalidateUserCaches
    const novaInvalidacao = `
  invalidateUserCaches(userId: string) {
    const userCacheKeys = this.cache.keys().filter(key => key.includes(userId));
    userCacheKeys.forEach(key => this.cache.del(key));
    
    // Invalidar caches relacionados
    const relatedKeys = this.cache.keys().filter(key => 
      key.includes('quizzes') || 
      key.includes('dashboard') || 
      key.includes('analytics')
    );
    relatedKeys.forEach(key => this.cache.del(key));
    
    // Forçar otimização de memória
    this.optimizeMemory();
    
    console.log('🔄 CACHE INVALIDATION - Invalidated:', {
      user: userCacheKeys.length,
      related: relatedKeys.length,
      total: userCacheKeys.length + relatedKeys.length
    });
  }`;
    
    // Substituir função existente
    cacheContent = cacheContent.replace(
      /invalidateUserCaches\(userId: string\)[^}]+}/g,
      novaInvalidacao.trim()
    );
    
    fs.writeFileSync(cacheFile, cacheContent);
    console.log('✅ Cache invalidation corrigido');
  }

  async corrigirMemoryUsage() {
    console.log('🧠 CORREÇÃO: Memory Usage...');
    
    // Ler o arquivo de cache atual
    const cacheFile = path.join(__dirname, 'server/cache.ts');
    let cacheContent = fs.readFileSync(cacheFile, 'utf8');
    
    // Reduzir maxKeys para 10
    cacheContent = cacheContent.replace(
      /maxKeys: \d+/g,
      'maxKeys: 10'
    );
    
    // Melhorar função optimizeMemory
    const novaOptimizacao = `
  optimizeMemory() {
    const keys = this.cache.keys();
    const totalKeys = keys.length;
    
    // Limitar a 5 chaves máximo para uso ultra-eficiente de memória
    if (totalKeys > 5) {
      const keysToDelete = keys.slice(0, totalKeys - 5);
      keysToDelete.forEach(key => this.cache.del(key));
      console.log('🧹 CACHE - Removidas', keysToDelete.length, 'chaves antigas');
    }
    
    // Forçar limpeza completa se ainda há muitas chaves
    if (this.cache.keys().length > 10) {
      this.forceClearCache();
    }
    
    // Forçar garbage collection se disponível
    if (global.gc) {
      global.gc();
    }
  }`;
    
    // Substituir função existente
    cacheContent = cacheContent.replace(
      /optimizeMemory\(\)[^}]+}/g,
      novaOptimizacao.trim()
    );
    
    fs.writeFileSync(cacheFile, cacheContent);
    console.log('✅ Memory usage corrigido');
  }

  async corrigirDatabaseIndexes() {
    console.log('📊 CORREÇÃO: Database Indexes...');
    
    // Ler o arquivo de database atual
    const dbFile = path.join(__dirname, 'server/db-sqlite.ts');
    let dbContent = fs.readFileSync(dbFile, 'utf8');
    
    // Adicionar índices otimizados
    const novosIndices = `
    // Índices otimizados para queries rápidas
    \`CREATE INDEX IF NOT EXISTS idx_quizzes_userid_published ON quizzes(userId, isPublished);\`,
    \`CREATE INDEX IF NOT EXISTS idx_quizzes_published_created ON quizzes(isPublished, createdAt);\`,
    \`CREATE INDEX IF NOT EXISTS idx_quiz_responses_quizid_submitted ON quiz_responses(quizId, submitted);\`,
    \`CREATE INDEX IF NOT EXISTS idx_quiz_responses_userid_status ON quiz_responses(userId, status);\`,
    \`CREATE INDEX IF NOT EXISTS idx_quiz_analytics_quizid_date ON quiz_analytics(quizId, date);\`,
    \`CREATE INDEX IF NOT EXISTS idx_quiz_analytics_userid_views ON quiz_analytics(userId, views);\`,
    \`CREATE INDEX IF NOT EXISTS idx_campaigns_userid_status ON campaigns(userId, status);\`,
    \`CREATE INDEX IF NOT EXISTS idx_campaigns_status_created ON campaigns(status, createdAt);\`,
    \`CREATE INDEX IF NOT EXISTS idx_sms_campaigns_userid_status ON sms_campaigns(userId, status);\`,
    \`CREATE INDEX IF NOT EXISTS idx_sms_logs_campaignid_status ON sms_logs(campaignId, status);\`,`;
    
    // Adicionar os novos índices
    dbContent = dbContent.replace(
      /const indexes = \[/,
      `const indexes = [\n${novosIndices}`
    );
    
    fs.writeFileSync(dbFile, dbContent);
    console.log('✅ Database indexes corrigidos');
  }

  async testarCorrecoes() {
    console.log('\n🧪 TESTANDO CORREÇÕES...');
    
    const token = await this.autenticar();
    
    // Testar cache invalidation
    console.log('1. Testando cache invalidation...');
    const antes = await this.makeRequest('/api/quizzes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    await this.makeRequest('/api/quizzes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quiz Teste Final',
        description: 'Teste correção final',
        structure: { pages: [] }
      })
    });
    
    const depois = await this.makeRequest('/api/quizzes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const cacheOk = depois.data.length > antes.data.length;
    console.log(`   Cache invalidation: ${cacheOk ? '✅' : '❌'}`);
    
    // Testar memory usage
    console.log('2. Testando memory usage...');
    const stats = await this.makeRequest('/api/unified-system/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const memoryUsage = stats.data.stats.memoryUsage;
    const memoryOk = memoryUsage < 100;
    console.log(`   Memory usage: ${memoryUsage}MB ${memoryOk ? '✅' : '❌'}`);
    
    // Testar database indexes
    console.log('3. Testando database indexes...');
    const start = performance.now();
    await this.makeRequest('/api/quizzes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const queryTime = performance.now() - start;
    
    const dbOk = queryTime < 50;
    console.log(`   Database query: ${queryTime.toFixed(2)}ms ${dbOk ? '✅' : '❌'}`);
    
    const total = [cacheOk, memoryOk, dbOk].filter(Boolean).length;
    console.log(`\nRESULTADO: ${total}/3 correções bem-sucedidas`);
    
    return total;
  }

  async executarCorrecoes() {
    console.log('🚨 CORREÇÃO CRÍTICA FINAL - RESOLVER 3 PROBLEMAS ESPECÍFICOS');
    
    try {
      await this.corrigirCacheInvalidation();
      await this.corrigirMemoryUsage();
      await this.corrigirDatabaseIndexes();
      
      console.log('\n✅ TODAS AS CORREÇÕES APLICADAS');
      console.log('⚠️  REINICIE O SERVIDOR PARA APLICAR AS MUDANÇAS');
      
      // Aguardar para permitir reinicialização
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const resultado = await this.testarCorrecoes();
      
      if (resultado === 3) {
        console.log('\n🎉 SISTEMA 100% OPERACIONAL!');
      } else {
        console.log('\n🔥 ALGUMAS CORREÇÕES AINDA PENDENTES');
      }
      
    } catch (error) {
      console.error('❌ Erro na correção:', error);
    }
  }
}

const correcao = new CorrecaoCriticaFinal();
correcao.executarCorrecoes().catch(console.error);
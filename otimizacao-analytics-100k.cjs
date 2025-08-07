/**
 * OTIMIZAÇÃO ANALYTICS PARA 100,000+ USUÁRIOS
 * Análise de performance e recomendações para escala
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@vendzz.com', password: 'admin123' };

let authToken = null;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const start = Date.now();
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const end = Date.now();
        const time = end - start;
        
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, time });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, time });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function authenticate() {
  const response = await makeRequest('/api/auth/login', 'POST', TEST_USER);
  if (response.status === 200 && response.data.accessToken) {
    authToken = response.data.accessToken;
    return true;
  }
  return false;
}

async function testAnalyticsPerformance() {
  console.log('🔥 TESTE DE PERFORMANCE - ANALYTICS PARA 100K USUÁRIOS');
  console.log('=' .repeat(80));
  
  if (!await authenticate()) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  // Testes de performance em diferentes cenários
  const tests = [
    { name: 'Dashboard Stats Básico', endpoint: '/api/dashboard/stats' },
    { name: 'Analytics Completo', endpoint: '/api/analytics' },
    { name: 'Quizzes Lista', endpoint: '/api/quizzes' },
    { name: 'Recent Activity', endpoint: '/api/recent-activity' }
  ];
  
  console.log('📊 TESTE 1: Performance Individual');
  const individualResults = [];
  
  for (const test of tests) {
    console.log(`🔍 Testando: ${test.name}`);
    
    const response = await makeRequest(test.endpoint);
    individualResults.push({
      name: test.name,
      time: response.time,
      status: response.status,
      dataSize: JSON.stringify(response.data).length
    });
    
    console.log(`   Tempo: ${response.time}ms | Status: ${response.status} | Dados: ${JSON.stringify(response.data).length} bytes`);
  }
  
  console.log('\n📊 TESTE 2: Carga Simultânea (10 requests)');
  const concurrentResults = [];
  
  for (const test of tests) {
    console.log(`🔥 Teste simultâneo: ${test.name}`);
    
    const promises = Array(10).fill().map(() => makeRequest(test.endpoint));
    const start = Date.now();
    const responses = await Promise.all(promises);
    const end = Date.now();
    
    const times = responses.map(r => r.time);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    concurrentResults.push({
      name: test.name,
      avgTime: Math.round(avgTime),
      maxTime,
      minTime,
      totalTime: end - start,
      successRate: responses.filter(r => r.status === 200).length / 10 * 100
    });
    
    console.log(`   Média: ${Math.round(avgTime)}ms | Max: ${maxTime}ms | Min: ${minTime}ms | Total: ${end - start}ms | Sucesso: ${responses.filter(r => r.status === 200).length}/10`);
  }
  
  console.log('\n📊 TESTE 3: Stress Test (50 requests rápidos)');
  const stressResults = [];
  
  const stressPromises = Array(50).fill().map(() => makeRequest('/api/dashboard/stats'));
  const stressStart = Date.now();
  const stressResponses = await Promise.all(stressPromises);
  const stressEnd = Date.now();
  
  const stressTimes = stressResponses.map(r => r.time);
  const stressAvg = stressTimes.reduce((a, b) => a + b, 0) / stressTimes.length;
  const stressSuccess = stressResponses.filter(r => r.status === 200).length;
  
  console.log(`   50 requests em ${stressEnd - stressStart}ms`);
  console.log(`   Tempo médio: ${Math.round(stressAvg)}ms`);
  console.log(`   Taxa de sucesso: ${stressSuccess}/50 (${(stressSuccess/50*100).toFixed(1)}%)`);
  
  // Análise e recomendações
  console.log('\n' + '='.repeat(80));
  console.log('📋 ANÁLISE PARA 100,000 USUÁRIOS SIMULTÂNEOS');
  console.log('=' .repeat(80));
  
  const dashboardTime = individualResults.find(r => r.name.includes('Dashboard'))?.time || 0;
  const analyticsTime = individualResults.find(r => r.name.includes('Analytics'))?.time || 0;
  
  console.log('🎯 MÉTRICAS ATUAIS:');
  console.log(`   Dashboard: ${dashboardTime}ms`);
  console.log(`   Analytics: ${analyticsTime}ms`);
  console.log(`   Stress (50 req): ${Math.round(stressAvg)}ms média`);
  
  console.log('\n📊 PROJEÇÃO PARA 100K USUÁRIOS:');
  
  // Calcular requests por segundo necessários
  const reqPerSecondNeeded = 100000 / 60; // Assumindo 100k usuários fazem 1 request por minuto
  console.log(`   Requests/segundo necessários: ~${Math.round(reqPerSecondNeeded)}`);
  
  // Capacidade atual estimada
  const currentCapacity = 1000 / Math.max(dashboardTime, analyticsTime); // requests/segundo baseado no tempo
  console.log(`   Capacidade atual estimada: ~${Math.round(currentCapacity)} req/s`);
  
  const scalingFactor = reqPerSecondNeeded / currentCapacity;
  console.log(`   Fator de escala necessário: ${scalingFactor.toFixed(1)}x`);
  
  console.log('\n💡 RECOMENDAÇÕES DE OTIMIZAÇÃO:');
  
  if (dashboardTime > 100) {
    console.log('⚠️  Dashboard Stats lento (>100ms):');
    console.log('   • Implementar cache agressivo (5min TTL)');
    console.log('   • Pré-computar estatísticas em background');
    console.log('   • Usar views materializadas no SQLite');
  }
  
  if (analyticsTime > 200) {
    console.log('⚠️  Analytics lento (>200ms):');
    console.log('   • Paginar resultados (limite 50 itens)');
    console.log('   • Cache por quiz individual');
    console.log('   • Lazy loading de insights');
  }
  
  if (scalingFactor > 5) {
    console.log('🚨 CRÍTICO - Mudanças arquiteturais necessárias:');
    console.log('   • Migrar para PostgreSQL com connection pooling');
    console.log('   • Implementar Redis para cache distribuído');
    console.log('   • Separar analytics em microserviço');
    console.log('   • Usar CDN para dados estáticos');
  } else if (scalingFactor > 2) {
    console.log('⚠️  IMPORTANTE - Otimizações necessárias:');
    console.log('   • Melhorar índices SQLite');
    console.log('   • Implementar cache em memória mais eficiente');
    console.log('   • Otimizar queries com agregações');
  } else {
    console.log('✅ ARQUITETURA ATUAL SUPORTA 100K USUÁRIOS');
    console.log('   • Performance adequada para escala');
    console.log('   • Pequenos ajustes de cache recomendados');
  }
  
  console.log('\n🔧 MELHORIAS ESPECÍFICAS RECOMENDADAS:');
  console.log('1. Cache Inteligente:');
  console.log('   • Dashboard: Cache 5min, invalidação seletiva');
  console.log('   • Analytics: Cache por quiz, TTL 1min');
  console.log('   • Filtros: Cache resultado por 30s');
  
  console.log('2. Otimização de Queries:');
  console.log('   • Índices compostos em (userId, createdAt, isPublished)');
  console.log('   • Aggregate functions no SQLite');
  console.log('   • LIMIT e OFFSET para paginação');
  
  console.log('3. Redução de Dados:');
  console.log('   • Retornar apenas campos necessários');
  console.log('   • Compressão gzip automática');
  console.log('   • Lazy loading de insights detalhados');
  
  console.log('4. Filtros Otimizados:');
  console.log('   • Filtros de data: usar índices temporais');
  console.log('   • Filtros complexos: cache resultado');
  console.log('   • Evitar filtros dinâmicos custosos');
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Implementar otimizações de cache sugeridas');
  console.log('2. Adicionar índices SQLite otimizados');
  console.log('3. Testar com carga simulada de 1000+ usuários');
  console.log('4. Monitorar métricas em produção');
  
  return {
    individual: individualResults,
    concurrent: concurrentResults,
    stress: { avgTime: stressAvg, successRate: stressSuccess/50*100 },
    recommendations: {
      scalingFactor,
      currentCapacity: Math.round(currentCapacity),
      needsArchitecturalChanges: scalingFactor > 5,
      needsOptimization: scalingFactor > 2
    }
  };
}

// Executar análise
testAnalyticsPerformance().catch(console.error);
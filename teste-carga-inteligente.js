/**
 * TESTE DE CARGA INTELIGENTE
 * Simula cenários reais de uso com carga gradual
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInBsYW4iOiJlbnRlcnByaXNlIiwicm9sZSI6ImFkbWluIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1MjM0MTUyOCwiZXhwIjoxNzUyNDI3OTI4fQ.yG862OoMegQ1D9qIdCb2-oZziUo7XS_SBPbLd7vDRng';

// Configurações de teste
const LOAD_LEVELS = [
  { name: 'Baixa', concurrent: 10, duration: 10 },
  { name: 'Média', concurrent: 25, duration: 15 },
  { name: 'Alta', concurrent: 50, duration: 20 },
  { name: 'Extrema', concurrent: 100, duration: 30 }
];

const results = {
  levels: [],
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  avgResponseTime: 0,
  maxResponseTime: 0,
  minResponseTime: Infinity,
  errors: []
};

async function makeRequest(url, options = {}) {
  const start = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...options.headers
      }
    });
    
    const duration = Date.now() - start;
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    return { success: true, data, duration, status: response.status };
    
  } catch (error) {
    const duration = Date.now() - start;
    return { success: false, error: error.message, duration };
  }
}

// Simular usuário real
async function simulateUser(userId) {
  const actions = [
    // Login/Dashboard
    () => makeRequest('/api/dashboard/stats'),
    () => makeRequest('/api/user/credits'),
    
    // Navegar por quizzes
    () => makeRequest('/api/quizzes'),
    () => makeRequest('/api/analytics/recent-activity'),
    
    // Criar quiz
    () => makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: `Quiz Usuário ${userId} ${Date.now()}`,
        description: 'Teste de carga',
        structure: {
          pages: [{
            id: 'page1',
            name: 'Página 1',
            elements: [{
              id: 'text1',
              type: 'text',
              question: 'Nome?',
              fieldId: 'nome_completo'
            }]
          }]
        }
      })
    }),
    
    // Verificar campanhas
    () => makeRequest('/api/sms-campaigns'),
    () => makeRequest('/api/email-campaigns')
  ];
  
  const userResults = [];
  
  for (const action of actions) {
    const result = await action();
    userResults.push(result);
    
    // Pausa natural entre ações
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
  }
  
  return userResults;
}

// Teste de carga por nível
async function testLoadLevel(level) {
  console.log(`\n🚀 TESTE DE CARGA: ${level.name.toUpperCase()}`);
  console.log(`   Usuários: ${level.concurrent}`);
  console.log(`   Duração: ${level.duration}s`);
  
  const levelResults = {
    name: level.name,
    concurrent: level.concurrent,
    duration: level.duration,
    requests: 0,
    successful: 0,
    failed: 0,
    avgResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    errors: []
  };
  
  const startTime = Date.now();
  const endTime = startTime + (level.duration * 1000);
  
  const userPromises = [];
  
  // Iniciar usuários concorrentes
  for (let i = 0; i < level.concurrent; i++) {
    userPromises.push(simulateUser(i));
  }
  
  // Aguardar conclusão ou timeout
  const userResults = await Promise.allSettled(userPromises);
  
  // Processar resultados
  let responseTimes = [];
  
  userResults.forEach((userResult, userIndex) => {
    if (userResult.status === 'fulfilled') {
      userResult.value.forEach(actionResult => {
        levelResults.requests++;
        results.totalRequests++;
        
        if (actionResult.success) {
          levelResults.successful++;
          results.successfulRequests++;
          
          responseTimes.push(actionResult.duration);
          
          // Atualizar tempos
          if (actionResult.duration > levelResults.maxResponseTime) {
            levelResults.maxResponseTime = actionResult.duration;
          }
          if (actionResult.duration < levelResults.minResponseTime) {
            levelResults.minResponseTime = actionResult.duration;
          }
        } else {
          levelResults.failed++;
          results.failedRequests++;
          levelResults.errors.push(actionResult.error);
          results.errors.push(`${level.name}: ${actionResult.error}`);
        }
      });
    }
  });
  
  // Calcular média
  if (responseTimes.length > 0) {
    levelResults.avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
  }
  
  // Atualizar resultados globais
  if (levelResults.maxResponseTime > results.maxResponseTime) {
    results.maxResponseTime = levelResults.maxResponseTime;
  }
  if (levelResults.minResponseTime < results.minResponseTime) {
    results.minResponseTime = levelResults.minResponseTime;
  }
  
  results.levels.push(levelResults);
  
  // Log do resultado
  const successRate = (levelResults.successful / levelResults.requests * 100).toFixed(1);
  console.log(`   📊 Requisições: ${levelResults.requests}`);
  console.log(`   ✅ Sucessos: ${levelResults.successful} (${successRate}%)`);
  console.log(`   ❌ Falhas: ${levelResults.failed}`);
  console.log(`   ⚡ Tempo Médio: ${levelResults.avgResponseTime}ms`);
  console.log(`   🔥 Tempo Máximo: ${levelResults.maxResponseTime}ms`);
  
  if (levelResults.errors.length > 0) {
    console.log(`   🚨 Erros: ${levelResults.errors.length}`);
  }
  
  return levelResults;
}

// Função principal
async function runLoadTest() {
  console.log('🎯 TESTE DE CARGA INTELIGENTE');
  console.log('🔄 Simulando usuários reais com carga gradual');
  console.log('=' .repeat(60));
  
  // Executar testes por nível
  for (const level of LOAD_LEVELS) {
    const levelResult = await testLoadLevel(level);
    
    // Pausa entre níveis para sistema se recuperar
    console.log(`   💤 Pausa de recuperação: 3s`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se deve continuar
    if (levelResult.failed > levelResult.successful) {
      console.log(`   ⚠️  ALERTA: Muitas falhas detectadas no nível ${level.name}`);
      console.log(`   🛑 Interrompendo teste para evitar sobrecarga`);
      break;
    }
  }
  
  // Calcular estatísticas finais
  const totalRequests = results.totalRequests;
  const successRate = totalRequests > 0 ? (results.successfulRequests / totalRequests * 100).toFixed(1) : 0;
  
  if (results.successfulRequests > 0) {
    results.avgResponseTime = Math.round(
      results.levels.reduce((sum, level) => sum + (level.avgResponseTime * level.successful), 0) / results.successfulRequests
    );
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL DO TESTE DE CARGA');
  console.log('=' .repeat(60));
  
  console.log(`📈 RESUMO GERAL:`);
  console.log(`   Total de Requisições: ${totalRequests}`);
  console.log(`   Requisições Bem-sucedidas: ${results.successfulRequests}`);
  console.log(`   Requisições Falharam: ${results.failedRequests}`);
  console.log(`   Taxa de Sucesso: ${successRate}%`);
  console.log(`   Tempo Médio: ${results.avgResponseTime}ms`);
  console.log(`   Tempo Máximo: ${results.maxResponseTime}ms`);
  console.log(`   Tempo Mínimo: ${results.minResponseTime}ms`);
  
  console.log(`\n📊 RESULTADO POR NÍVEL:`);
  results.levels.forEach(level => {
    const levelSuccessRate = (level.successful / level.requests * 100).toFixed(1);
    console.log(`   ${level.name}: ${levelSuccessRate}% (${level.successful}/${level.requests})`);
  });
  
  // Identificar ponto de quebra
  const breakingPoint = results.levels.find(level => {
    const successRate = (level.successful / level.requests * 100);
    return successRate < 80; // Consideramos quebra quando success rate cai abaixo de 80%
  });
  
  if (breakingPoint) {
    console.log(`\n🚨 PONTO DE QUEBRA IDENTIFICADO:`);
    console.log(`   Nível: ${breakingPoint.name}`);
    console.log(`   Usuários Concorrentes: ${breakingPoint.concurrent}`);
    console.log(`   Taxa de Sucesso: ${(breakingPoint.successful / breakingPoint.requests * 100).toFixed(1)}%`);
  } else {
    console.log(`\n🎉 SISTEMA ESTÁVEL: Passou em todos os níveis de carga!`);
  }
  
  // Erros mais comuns
  if (results.errors.length > 0) {
    console.log(`\n🚨 ERROS MAIS COMUNS:`);
    const errorCounts = {};
    results.errors.forEach(error => {
      const key = error.split(':')[1]?.trim() || error;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });
    
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([error, count]) => {
        console.log(`   ${count}x: ${error}`);
      });
  }
  
  // Recomendações
  console.log(`\n💡 RECOMENDAÇÕES:`);
  if (parseFloat(successRate) >= 95) {
    console.log(`   🎯 EXCELENTE: Sistema pronto para produção!`);
  } else if (parseFloat(successRate) >= 80) {
    console.log(`   ✅ BOM: Sistema funcional com pequenos ajustes`);
  } else {
    console.log(`   ⚠️  ATENÇÃO: Sistema precisa de otimizações antes da produção`);
  }
  
  if (results.avgResponseTime <= 200) {
    console.log(`   🚀 Performance excelente: Tempo de resposta ótimo`);
  } else if (results.avgResponseTime <= 500) {
    console.log(`   ⚡ Performance boa: Tempo de resposta aceitável`);
  } else {
    console.log(`   🐌 Performance lenta: Considere otimizações`);
  }
}

// Executar teste
runLoadTest().catch(console.error);
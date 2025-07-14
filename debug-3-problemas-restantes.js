/**
 * DEBUG DOS 3 PROBLEMAS RESTANTES
 * Cache Invalidation, Cache Memory Usage, Database Indexes
 */

async function makeRequest(endpoint, options = {}) {
  const url = `http://localhost:5000${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();
  return { status: response.status, data };
}

async function authenticate() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  return response.data.accessToken;
}

async function debugCacheInvalidation() {
  console.log('\n🔄 DEBUGANDO CACHE INVALIDATION...');
  
  const token = await authenticate();
  
  // 1. Buscar quizzes (deve criar cache)
  console.log('1. Buscando quizzes (criando cache)...');
  const firstResponse = await makeRequest('/api/quizzes', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`   Status: ${firstResponse.status}, Count: ${firstResponse.data.length}`);
  
  // 2. Criar quiz (deve invalidar cache)
  console.log('2. Criando quiz (deve invalidar cache)...');
  const createResponse = await makeRequest('/api/quizzes', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Quiz Cache Test',
      description: 'Teste de invalidação de cache',
      structure: { pages: [] }
    })
  });
  console.log(`   Status: ${createResponse.status}, Success: ${createResponse.status === 201}`);
  
  // 3. Buscar quizzes novamente (deve mostrar o novo)
  console.log('3. Buscando quizzes novamente (cache deve estar limpo)...');
  const secondResponse = await makeRequest('/api/quizzes', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`   Status: ${secondResponse.status}, Count: ${secondResponse.data.length}`);
  
  // Verificar se o cache foi invalidado
  const wasInvalidated = secondResponse.data.length > firstResponse.data.length;
  console.log(`   Cache invalidado: ${wasInvalidated}`);
  
  return wasInvalidated;
}

async function debugCacheMemoryUsage() {
  console.log('\n🧠 DEBUGANDO CACHE MEMORY USAGE...');
  
  const token = await authenticate();
  
  // Buscar estatísticas do cache
  const response = await makeRequest('/api/unified-system/stats', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('Cache Stats:', response.data);
  
  // Verificar uso de memória
  const memoryUsage = response.data.stats.memoryUsage;
  const isEfficient = memoryUsage < 100; // 100MB
  console.log(`   Memory usage: ${memoryUsage} MB`);
  console.log(`   Is efficient: ${isEfficient}`);
  
  return isEfficient;
}

async function debugDatabaseIndexes() {
  console.log('\n📊 DEBUGANDO DATABASE INDEXES...');
  
  const token = await authenticate();
  
  // Testar uma query específica com medição de tempo
  const start = performance.now();
  
  const response = await makeRequest('/api/quizzes', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const queryTime = performance.now() - start;
  console.log(`   Query time: ${queryTime}ms`);
  console.log(`   Status: ${response.status}`);
  
  // Índices são eficientes se query < 50ms
  const isEfficient = queryTime < 50;
  console.log(`   Is efficient: ${isEfficient}`);
  
  return isEfficient;
}

async function runAllDebug() {
  console.log('🚨 DEBUGGING DOS 3 PROBLEMAS RESTANTES');
  
  const cacheInvalidation = await debugCacheInvalidation();
  const cacheMemoryUsage = await debugCacheMemoryUsage();
  const databaseIndexes = await debugDatabaseIndexes();
  
  console.log('\n📊 RESULTADOS:');
  console.log(`Cache Invalidation: ${cacheInvalidation ? '✅' : '❌'}`);
  console.log(`Cache Memory Usage: ${cacheMemoryUsage ? '✅' : '❌'}`);
  console.log(`Database Indexes: ${databaseIndexes ? '✅' : '❌'}`);
  
  const totalSuccess = [cacheInvalidation, cacheMemoryUsage, databaseIndexes].filter(Boolean).length;
  console.log(`Total: ${totalSuccess}/3 problemas resolvidos`);
}

runAllDebug().catch(console.error);
const http = require('http');
const https = require('https');

// Configurações do teste
const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123'
};

let authToken = null;

// Função para fazer requisições HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Função para autenticação
async function authenticate() {
  console.log('🔐 Testando autenticação administrativa...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', ADMIN_CREDENTIALS);
    
    if (response.status === 200 && response.data.accessToken) {
      authToken = response.data.accessToken;
      console.log('✅ Autenticação bem-sucedida');
      console.log(`   Usuário: ${response.data.user.email}`);
      console.log(`   Role: ${response.data.user.role}`);
      console.log(`   ID: ${response.data.user.id}`);
      return true;
    } else {
      console.log('❌ Falha na autenticação:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return false;
  }
}

// Testes dos endpoints administrativos
const endpointTests = [
  {
    name: 'Dashboard Principal',
    path: '/api/admin/rate-limiting/dashboard',
    expectedFields: ['success', 'data']
  },
  {
    name: 'Estatísticas Gerais',
    path: '/api/admin/rate-limiting/stats',
    expectedFields: ['success', 'data', 'timestamp']
  },
  {
    name: 'Análise de Tendências',
    path: '/api/admin/rate-limiting/trends',
    expectedFields: ['success', 'data']
  },
  {
    name: 'IPs Bloqueados',
    path: '/api/admin/rate-limiting/blocked-ips',
    expectedFields: ['success', 'data']
  },
  {
    name: 'Configurações de Limites',
    path: '/api/admin/rate-limiting/limits-config',
    expectedFields: ['success', 'data']
  }
];

async function testEndpoint(test) {
  console.log(`\n📊 Testando: ${test.name}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('GET', test.path, null, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.status === 200) {
      console.log(`✅ ${test.name} - Status: ${response.status} (${responseTime}ms)`);
      
      // Verificar campos obrigatórios
      const hasAllFields = test.expectedFields.every(field => response.data.hasOwnProperty(field));
      if (hasAllFields) {
        console.log(`   📋 Campos obrigatórios: ✅ Todos presentes`);
      } else {
        console.log(`   📋 Campos obrigatórios: ❌ Alguns ausentes`);
      }
      
      // Mostrar estrutura dos dados
      if (response.data.data) {
        const dataKeys = Object.keys(response.data.data);
        console.log(`   📦 Dados retornados: ${dataKeys.join(', ')}`);
      }
      
      return { success: true, responseTime, data: response.data };
    } else {
      console.log(`❌ ${test.name} - Status: ${response.status}`);
      console.log(`   Erro: ${JSON.stringify(response.data)}`);
      return { success: false, responseTime, error: response.data };
    }
  } catch (error) {
    console.log(`❌ ${test.name} - Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Teste de performance
async function performanceTest() {
  console.log('\n⚡ Teste de Performance (10 requisições simultâneas)...');
  
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(makeRequest('GET', '/api/admin/rate-limiting/dashboard', null, {
      'Authorization': `Bearer ${authToken}`
    }));
  }
  
  try {
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const successCount = results.filter(r => r.status === 200).length;
    const avgTime = totalTime / 10;
    
    console.log(`✅ Performance Test - ${successCount}/10 sucessos`);
    console.log(`   Tempo total: ${totalTime}ms`);
    console.log(`   Tempo médio: ${avgTime}ms por requisição`);
    
    return { successCount, totalTime, avgTime };
  } catch (error) {
    console.log(`❌ Performance Test - Erro: ${error.message}`);
    return { error: error.message };
  }
}

// Teste de dados específicos
async function dataValidationTest() {
  console.log('\n🔍 Teste de Validação de Dados...');
  
  try {
    const dashboardResponse = await makeRequest('GET', '/api/admin/rate-limiting/dashboard', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (dashboardResponse.status === 200) {
      const data = dashboardResponse.data.data;
      
      // Verificar estrutura do overview
      if (data.overview) {
        console.log('✅ Overview estruturado corretamente');
        console.log(`   Total de requisições: ${data.overview.totalRequests}`);
        console.log(`   Taxa de bloqueio: ${data.overview.blockRate}%`);
      }
      
      // Verificar categorias
      if (data.categories && Array.isArray(data.categories)) {
        console.log(`✅ Categorias: ${data.categories.length} encontradas`);
        data.categories.forEach(cat => {
          console.log(`   📂 ${cat.name}: ${cat.requests} req, ${cat.blocked} bloqueados`);
        });
      }
      
      // Verificar timestamp de atualização
      if (dashboardResponse.data.timestamp) {
        const lastUpdate = new Date(dashboardResponse.data.timestamp);
        console.log(`✅ Timestamp: ${lastUpdate.toLocaleString()}`);
      }
      
      return { success: true, data: data };
    } else {
      console.log('❌ Falha na obtenção dos dados do dashboard');
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Erro na validação de dados: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função principal de teste
async function runAllTests() {
  console.log('🚀 INICIANDO TESTES DO PAINEL ADMINISTRATIVO DE RATE LIMITING');
  console.log('============================================================\n');
  
  // 1. Testar autenticação
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('\n❌ FALHA: Não foi possível autenticar. Parando os testes.');
    return;
  }
  
  // 2. Testar todos os endpoints
  const results = [];
  for (const test of endpointTests) {
    const result = await testEndpoint(test);
    results.push({ ...test, ...result });
  }
  
  // 3. Teste de performance
  const perfResult = await performanceTest();
  
  // 4. Teste de validação de dados
  const dataResult = await dataValidationTest();
  
  // Relatório final
  console.log('\n📋 RELATÓRIO FINAL');
  console.log('==================');
  
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  const successRate = (successfulTests / totalTests * 100).toFixed(1);
  
  console.log(`\n✅ Taxa de Sucesso: ${successRate}% (${successfulTests}/${totalTests})`);
  
  // Performance summary
  if (perfResult.avgTime) {
    console.log(`⚡ Performance: ${perfResult.avgTime.toFixed(1)}ms média`);
  }
  
  // Response times
  const validTimes = results.filter(r => r.responseTime).map(r => r.responseTime);
  if (validTimes.length > 0) {
    const avgResponseTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    console.log(`📊 Tempo médio de resposta: ${avgResponseTime.toFixed(1)}ms`);
  }
  
  console.log('\n🎯 STATUS DOS ENDPOINTS:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const time = result.responseTime ? `(${result.responseTime}ms)` : '';
    console.log(`   ${status} ${result.name} ${time}`);
  });
  
  // Conclusão
  if (successRate >= 100) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema 100% funcional.');
  } else if (successRate >= 80) {
    console.log('\n✅ Maioria dos testes passou. Sistema funcional com pequenos problemas.');
  } else {
    console.log('\n⚠️ Vários testes falharam. Sistema precisa de correções.');
  }
  
  console.log('\n🔚 Testes finalizados.');
}

// Executar os testes
runAllTests().catch(console.error);
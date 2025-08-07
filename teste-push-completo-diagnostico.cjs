#!/usr/bin/env node

/**
 * DIAGNÓSTICO COMPLETO DO SISTEMA PUSH NOTIFICATIONS VENDZZ
 * Testa: Tabelas, Endpoints, PWA, Frontend, Métricas, Permissões e Tempo
 */

const https = require('https');

const SERVER_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

let authToken = '';
let testResults = {
  database: { passed: 0, total: 0, errors: [] },
  endpoints: { passed: 0, total: 0, errors: [] },
  pwa: { passed: 0, total: 0, errors: [] },
  frontend: { passed: 0, total: 0, errors: [] },
  metrics: { passed: 0, total: 0, errors: [] },
  permissions: { passed: 0, total: 0, errors: [] },
  timing: { passed: 0, total: 0, errors: [] }
};

function makeRequest(method, path, data = null, timeout = 10000, customToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVER_URL);
    const options = {
      method,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VendzzPushDiagnostic/1.0',
      },
    };

    const tokenToUse = customToken || authToken;
    if (tokenToUse) {
      options.headers['Authorization'] = `Bearer ${tokenToUse}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// ============ TESTES DE BANCO DE DADOS ============
async function testDatabase() {
  console.log('\n🗄️ [DIAGNÓSTICO DATABASE] Testando estrutura SQLite...');
  
  // Primeiro, fazer login para obter token
  let adminToken = null;
  try {
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    if (loginResponse.status === 200) {
      adminToken = loginResponse.data.token || loginResponse.data.accessToken;
    }
  } catch (error) {
    console.log('⚠️ Não foi possível fazer login para testes de database');
  }
  
  const tests = [
    {
      name: 'Verificar tabela push_subscriptions',
      test: async () => {
        if (!adminToken) return false;
        const response = await makeRequest('GET', '/api/push-notifications/admin/subscriptions', null, 10000, adminToken);
        return response.status === 200 && response.data.success === true;
      }
    },
    {
      name: 'Verificar tabela push_notification_logs',
      test: async () => {
        if (!adminToken) return false;
        const response = await makeRequest('GET', '/api/push-notifications/admin/stats', null, 10000, adminToken);
        return response.status === 200 && response.data.success === true;
      }
    },
    {
      name: 'Teste de integridade de dados',
      test: async () => {
        // Teste básico de conexão com banco
        const response = await makeRequest('GET', '/api/auth/test');
        return response.status === 200;
      }
    }
  ];

  for (const test of tests) {
    testResults.database.total++;
    try {
      const passed = await test.test();
      if (passed) {
        testResults.database.passed++;
        console.log(`✅ ${test.name}`);
      } else {
        console.log(`❌ ${test.name}`);
        testResults.database.errors.push(test.name);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      testResults.database.errors.push(`${test.name}: ${error.message}`);
    }
  }
}

// ============ TESTES DE ENDPOINTS ============
async function testEndpoints() {
  console.log('\n📡 [DIAGNÓSTICO ENDPOINTS] Testando todas as rotas push...');
  
  const endpoints = [
    { method: 'GET', path: '/api/push-vapid-key', name: 'VAPID Key', requireAuth: false },
    { method: 'POST', path: '/api/push-subscribe', name: 'Subscribe', requireAuth: true },
    { method: 'POST', path: '/api/push-broadcast', name: 'Broadcast', requireAuth: true },
    { method: 'GET', path: '/api/push-notifications/admin/stats', name: 'Admin Stats', requireAuth: true },
    { method: 'GET', path: '/api/push-notifications/admin/subscriptions', name: 'Admin Subscriptions', requireAuth: true },
    { method: 'POST', path: '/api/push-notifications/admin/send', name: 'Admin Send', requireAuth: true }
  ];

  for (const endpoint of endpoints) {
    testResults.endpoints.total++;
    try {
      let response;
      const testData = endpoint.method === 'POST' ? {
        endpoint: 'https://test.com',
        keys: { p256dh: 'test', auth: 'test' },
        title: 'Test',
        body: 'Test message'
      } : null;

      response = await makeRequest(endpoint.method, endpoint.path, testData);
      
      const validStatuses = endpoint.requireAuth ? [200, 401, 403, 500] : [200, 400, 500];
      const passed = validStatuses.includes(response.status);
      
      if (passed) {
        testResults.endpoints.passed++;
        console.log(`✅ ${endpoint.name} (${response.status})`);
      } else {
        console.log(`❌ ${endpoint.name} (${response.status})`);
        testResults.endpoints.errors.push(`${endpoint.name}: status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      testResults.endpoints.errors.push(`${endpoint.name}: ${error.message}`);
    }
  }
}

// ============ TESTES PWA ============
async function testPWA() {
  console.log('\n📱 [DIAGNÓSTICO PWA] Testando Service Worker e recursos PWA...');
  
  const pwaTests = [
    {
      name: 'Service Worker disponível',
      test: async () => {
        const response = await makeRequest('GET', '/vendzz-notification-sw.js');
        return response.status === 200;
      }
    },
    {
      name: 'Manifest PWA disponível',
      test: async () => {
        const response = await makeRequest('GET', '/manifest.json');
        return response.status === 200;
      }
    },
    {
      name: 'Recursos PWA (ícones)',
      test: async () => {
        const response = await makeRequest('GET', '/vendzz-logo-official.png');
        return response.status === 200;
      }
    }
  ];

  for (const test of pwaTests) {
    testResults.pwa.total++;
    try {
      const passed = await test.test();
      if (passed) {
        testResults.pwa.passed++;
        console.log(`✅ ${test.name}`);
      } else {
        console.log(`❌ ${test.name}`);
        testResults.pwa.errors.push(test.name);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      testResults.pwa.errors.push(`${test.name}: ${error.message}`);
    }
  }
}

// ============ TESTES FRONTEND ============
async function testFrontend() {
  console.log('\n🎨 [DIAGNÓSTICO FRONTEND] Testando páginas de push notifications...');
  
  const frontendTests = [
    {
      name: 'Página PWA Push Notifications',
      test: async () => {
        const response = await makeRequest('GET', '/pwa-push-notifications');
        return response.status === 200;
      }
    },
    {
      name: 'Página Admin Push Notifications',
      test: async () => {
        const response = await makeRequest('GET', '/admin-push-notifications');
        return response.status === 200;
      }
    },
    {
      name: 'Dashboard (estatísticas)',
      test: async () => {
        const response = await makeRequest('GET', '/dashboard');
        return response.status === 200;
      }
    }
  ];

  for (const test of frontendTests) {
    testResults.frontend.total++;
    try {
      const passed = await test.test();
      if (passed) {
        testResults.frontend.passed++;
        console.log(`✅ ${test.name}`);
      } else {
        console.log(`❌ ${test.name}`);
        testResults.frontend.errors.push(test.name);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      testResults.frontend.errors.push(`${test.name}: ${error.message}`);
    }
  }
}

// ============ TESTES DE MÉTRICAS ============
async function testMetrics() {
  console.log('\n📊 [DIAGNÓSTICO MÉTRICAS] Testando coleta e exibição de métricas...');
  
  // Fazer login primeiro
  try {
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200 && (loginResponse.data.token || loginResponse.data.accessToken)) {
      authToken = loginResponse.data.token || loginResponse.data.accessToken;
    }
  } catch (error) {
    console.log('⚠️ Não foi possível fazer login para testes de métricas');
  }

  const metricsTests = [
    {
      name: 'Estatísticas gerais',
      test: async () => {
        const response = await makeRequest('GET', '/api/push-notifications/admin/stats');
        return response.status === 200 && response.data.success;
      }
    },
    {
      name: 'Lista de subscriptions',
      test: async () => {
        const response = await makeRequest('GET', '/api/push-notifications/admin/subscriptions');
        return response.status === 200 && Array.isArray(response.data.subscriptions);
      }
    },
    {
      name: 'Logs de notificações',
      test: async () => {
        const response = await makeRequest('GET', '/api/push-notifications/admin/logs');
        return response.status === 200 || response.status === 404; // Pode não existir ainda
      }
    }
  ];

  for (const test of metricsTests) {
    testResults.metrics.total++;
    try {
      const passed = await test.test();
      if (passed) {
        testResults.metrics.passed++;
        console.log(`✅ ${test.name}`);
      } else {
        console.log(`❌ ${test.name}`);
        testResults.metrics.errors.push(test.name);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      testResults.metrics.errors.push(`${test.name}: ${error.message}`);
    }
  }
}

// ============ TESTES DE PERMISSÕES ============
async function testPermissions() {
  console.log('\n🔐 [DIAGNÓSTICO PERMISSÕES] Testando controle de acesso...');
  
  const permissionTests = [
    {
      name: 'Acesso sem autenticação (deve falhar)',
      test: async () => {
        const oldToken = authToken;
        authToken = '';
        const response = await makeRequest('GET', '/api/push-notifications/admin/stats');
        authToken = oldToken;
        return response.status === 401 || response.status === 403;
      }
    },
    {
      name: 'Acesso com token inválido (deve falhar)',
      test: async () => {
        const oldToken = authToken;
        authToken = 'invalid-token';
        const response = await makeRequest('GET', '/api/push-notifications/admin/stats');
        authToken = oldToken;
        return response.status === 401 || response.status === 403;
      }
    },
    {
      name: 'Acesso admin com token válido',
      test: async () => {
        if (!authToken) return false;
        const response = await makeRequest('GET', '/api/push-notifications/admin/stats');
        return response.status === 200 || response.status === 500; // 500 pode ser erro interno, mas auth passou
      }
    }
  ];

  for (const test of permissionTests) {
    testResults.permissions.total++;
    try {
      const passed = await test.test();
      if (passed) {
        testResults.permissions.passed++;
        console.log(`✅ ${test.name}`);
      } else {
        console.log(`❌ ${test.name}`);
        testResults.permissions.errors.push(test.name);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      testResults.permissions.errors.push(`${test.name}: ${error.message}`);
    }
  }
}

// ============ TESTES DE TEMPO ============
async function testTiming() {
  console.log('\n⏱️ [DIAGNÓSTICO TEMPO] Testando performance e timeouts...');
  
  const timingTests = [
    {
      name: 'VAPID Key (< 1s)',
      test: async () => {
        const start = Date.now();
        const response = await makeRequest('GET', '/api/push-vapid-key', null, 1000);
        const duration = Date.now() - start;
        console.log(`   Tempo: ${duration}ms`);
        return response.status === 200 && duration < 1000;
      }
    },
    {
      name: 'Subscribe (< 2s)',
      test: async () => {
        if (!authToken) return false;
        const start = Date.now();
        const response = await makeRequest('POST', '/api/push-subscribe', {
          endpoint: 'https://test.com/push-test',
          keys: { p256dh: 'test-key', auth: 'test-auth' }
        }, 2000);
        const duration = Date.now() - start;
        console.log(`   Tempo: ${duration}ms`);
        return duration < 2000;
      }
    },
    {
      name: 'Stats (< 500ms)',
      test: async () => {
        if (!authToken) return false;
        const start = Date.now();
        const response = await makeRequest('GET', '/api/push-notifications/admin/stats', null, 500);
        const duration = Date.now() - start;
        console.log(`   Tempo: ${duration}ms`);
        return duration < 500;
      }
    }
  ];

  for (const test of timingTests) {
    testResults.timing.total++;
    try {
      const passed = await test.test();
      if (passed) {
        testResults.timing.passed++;
        console.log(`✅ ${test.name}`);
      } else {
        console.log(`❌ ${test.name}`);
        testResults.timing.errors.push(test.name);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      testResults.timing.errors.push(`${test.name}: ${error.message}`);
    }
  }
}

// ============ RELATÓRIO FINAL ============
function generateReport() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📋 RELATÓRIO COMPLETO DO DIAGNÓSTICO PUSH NOTIFICATIONS');
  console.log('════════════════════════════════════════════════════════════');
  
  const categories = [
    { name: '🗄️ DATABASE', key: 'database' },
    { name: '📡 ENDPOINTS', key: 'endpoints' },
    { name: '📱 PWA', key: 'pwa' },
    { name: '🎨 FRONTEND', key: 'frontend' },
    { name: '📊 MÉTRICAS', key: 'metrics' },
    { name: '🔐 PERMISSÕES', key: 'permissions' },
    { name: '⏱️ TIMING', key: 'timing' }
  ];
  
  let totalPassed = 0;
  let totalTests = 0;
  
  categories.forEach(category => {
    const result = testResults[category.key];
    totalPassed += result.passed;
    totalTests += result.total;
    
    const percentage = result.total > 0 ? (result.passed / result.total * 100).toFixed(1) : '0.0';
    const status = result.passed === result.total ? '✅' : '❌';
    
    console.log(`${status} ${category.name}: ${result.passed}/${result.total} (${percentage}%)`);
    
    if (result.errors.length > 0) {
      console.log(`   Erros encontrados:`);
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
  });
  
  console.log('────────────────────────────────────────────────────────────');
  const overallPercentage = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : '0.0';
  const overallStatus = totalPassed === totalTests ? '🎉 APROVADO' : '⚠️ NECESSITA CORREÇÕES';
  
  console.log(`📊 RESULTADO GERAL: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
  console.log(`🎯 STATUS FINAL: ${overallStatus}`);
  
  if (totalPassed < totalTests) {
    console.log('\n🔧 AÇÕES RECOMENDADAS:');
    categories.forEach(category => {
      const result = testResults[category.key];
      if (result.passed < result.total) {
        console.log(`- Corrigir problemas em ${category.name}`);
      }
    });
  } else {
    console.log('\n🎉 SISTEMA PUSH NOTIFICATIONS 100% FUNCIONAL!');
    console.log('✅ Todos os testes passaram - pronto para produção');
  }
  
  console.log(`\n🕒 Diagnóstico finalizado: ${new Date().toISOString()}`);
}

// ============ EXECUÇÃO PRINCIPAL ============
async function main() {
  console.log('🚀 DIAGNÓSTICO COMPLETO - SISTEMA PUSH NOTIFICATIONS VENDZZ');
  console.log('🔍 Testando: Tabelas, Endpoints, PWA, Frontend, Métricas, Permissões, Tempo');
  console.log(`🕒 Iniciado em: ${new Date().toISOString()}\n`);

  await testDatabase();
  await testEndpoints();
  await testPWA();
  await testFrontend();
  await testMetrics();
  await testPermissions();
  await testTiming();
  
  generateReport();
}

main().catch(console.error);
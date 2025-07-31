#!/usr/bin/env node

/**
 * TESTE COMPLETO - RATE LIMITING INTELIGENTE
 * 
 * Valida o novo sistema de rate limiting que diferencia entre:
 * - Assets (JS, CSS, etc.) - Limite alto
 * - Processos automáticos - Limite alto  
 * - Quiz complexo - Limite médio
 * - Usuários autenticados - Limite médio
 * - Usuários não autenticados - Limite base
 */

const http = require('http');
const fs = require('fs');

// Configuração do servidor
const HOST = 'localhost';
const PORT = 5000;
const BASE_URL = `http://${HOST}:${PORT}`;

// Estatísticas de teste
let stats = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  assetRequests: 0,
  apiRequests: 0,
  rateLimited: 0,
  startTime: Date.now()
};

console.log('🧪 TESTE COMPLETO - RATE LIMITING INTELIGENTE');
console.log('=' .repeat(60));
console.log('Testando novo sistema de rate limiting com contexto inteligente');
console.log('');

// Função para fazer requisições HTTP
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': options.userAgent || 'TestClient/1.0',
        ...options.headers
      }
    };

    const req = http.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          path: path
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Função para simular delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Teste 1: Assets devem ter limite muito alto
async function testAssetRequests() {
  console.log('🎯 TESTE 1: Requisições de Assets (limite alto esperado)');
  
  const assetPaths = [
    '/src/components/ui/button.tsx',
    '/src/pages/dashboard.tsx', 
    '/src/hooks/useAuth.ts',
    '/@fs/home/runner/workspace/node_modules/.vite/deps/lucide-react.js',
    '/sw.js',
    '/manifest.json',
    '/favicon.ico'
  ];

  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 0; i < 50; i++) {
    try {
      const path = assetPaths[i % assetPaths.length];
      const response = await makeRequest(path);
      
      stats.assetRequests++;
      
      if (response.status === 429) {
        rateLimitedCount++;
        stats.rateLimited++;
      } else {
        successCount++;
      }
      
      // Small delay between requests
      await delay(10);
    } catch (error) {
      // Network errors are expected for some paths
    }
  }

  const successRate = (successCount / 50) * 100;
  console.log(`   • Requisições feitas: 50`);
  console.log(`   • Sucessos: ${successCount} (${successRate.toFixed(1)}%)`);
  console.log(`   • Rate limited: ${rateLimitedCount}`);
  
  // Assets should have very high success rate
  if (successRate >= 90) {
    console.log('   ✅ PASSOU - Assets têm limite alto conforme esperado');
    stats.passed++;
  } else {
    console.log('   ❌ FALHOU - Assets sendo bloqueados indevidamente');
    stats.failed++;
  }
  
  stats.totalTests++;
  console.log('');
}

// Teste 2: API requests com autenticação devem ter limite médio
async function testAuthenticatedAPIRequests() {
  console.log('🎯 TESTE 2: API Requests Autenticadas (limite médio esperado)');
  
  const apiPaths = [
    '/api/auth/user',
    '/api/dashboard/stats',
    '/api/quizzes',
    '/api/analytics'
  ];

  let successCount = 0;
  let rateLimitedCount = 0;

  // Mock JWT token for testing
  const mockToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  for (let i = 0; i < 30; i++) {
    try {
      const path = apiPaths[i % apiPaths.length];
      const response = await makeRequest(path, {
        headers: {
          'Authorization': mockToken
        }
      });
      
      stats.apiRequests++;
      
      if (response.status === 429) {
        rateLimitedCount++;
        stats.rateLimited++;
      } else {
        successCount++;
      }
      
      await delay(50);
    } catch (error) {
      // Some API errors are expected
    }
  }

  const successRate = (successCount / 30) * 100;
  console.log(`   • Requisições feitas: 30`);
  console.log(`   • Sucessos: ${successCount} (${successRate.toFixed(1)}%)`);
  console.log(`   • Rate limited: ${rateLimitedCount}`);
  
  // Authenticated requests should have good success rate
  if (successRate >= 70) {
    console.log('   ✅ PASSOU - Requisições autenticadas têm limite adequado');
    stats.passed++;
  } else {
    console.log('   ❌ FALHOU - Limite muito restritivo para usuários autenticados');
    stats.failed++;
  }
  
  stats.totalTests++;
  console.log('');
}

// Teste 3: Processos automáticos devem ter limite alto
async function testAutomaticProcesses() {
  console.log('🎯 TESTE 3: Processos Automáticos (limite alto esperado)');
  
  const automaticPaths = [
    '/api/system/health',
    '/api/push-simple/stats',
    '/api/campaigns/process',
    '/api/analytics/auto'
  ];

  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 0; i < 25; i++) {
    try {
      const path = automaticPaths[i % automaticPaths.length];
      const response = await makeRequest(path, {
        headers: {
          'X-Internal-Request': 'true',
          'User-Agent': 'VendzzAutomation/1.0'
        }
      });
      
      if (response.status === 429) {
        rateLimitedCount++;
        stats.rateLimited++;
      } else {
        successCount++;
      }
      
      await delay(20);
    } catch (error) {
      // Some automation endpoints may not exist
    }
  }

  const successRate = (successCount / 25) * 100;
  console.log(`   • Requisições feitas: 25`);
  console.log(`   • Sucessos: ${successCount} (${successRate.toFixed(1)}%)`);
  console.log(`   • Rate limited: ${rateLimitedCount}`);
  
  // Automatic processes should have high success rate
  if (successRate >= 80) {
    console.log('   ✅ PASSOU - Processos automáticos têm limite alto');
    stats.passed++;
  } else {
    console.log('   ❌ FALHOU - Limite muito restritivo para automação');
    stats.failed++;
  }
  
  stats.totalTests++;
  console.log('');
}

// Teste 4: Quiz complexo deve ter limite expandido
async function testComplexQuizWorkflow() {
  console.log('🎯 TESTE 4: Workflow de Quiz Complexo (limite expandido esperado)');
  
  const complexQuizData = {
    name: 'Quiz Complexo de Teste',
    pages: Array.from({ length: 15 }, (_, i) => ({
      id: `page_${i}`,
      title: `Página ${i + 1}`,
      elements: Array.from({ length: 8 }, (_, j) => ({
        id: `element_${i}_${j}`,
        type: 'multiple_choice',
        question: `Pergunta ${j + 1} da página ${i + 1}`,
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D']
      }))
    }))
  };

  let successCount = 0;
  let rateLimitedCount = 0;

  // Simulate complex quiz editing with multiple saves
  for (let i = 0; i < 20; i++) {
    try {
      const response = await makeRequest('/api/quizzes/create', {
        method: 'POST',
        body: complexQuizData,
        headers: {
          'Authorization': 'Bearer mock-token',
          'X-Complex-Quiz': 'true'
        }
      });
      
      if (response.status === 429) {
        rateLimitedCount++;
        stats.rateLimited++;
      } else {
        successCount++;
      }
      
      await delay(100);
    } catch (error) {
      // Creation errors are expected for invalid data
    }
  }

  const successRate = (successCount / 20) * 100;
  console.log(`   • Requisições feitas: 20`);
  console.log(`   • Sucessos: ${successCount} (${successRate.toFixed(1)}%)`);
  console.log(`   • Rate limited: ${rateLimitedCount}`);
  
  // Complex quiz work should have expanded limits
  if (successRate >= 60) {
    console.log('   ✅ PASSOU - Quiz complexo tem limite expandido');
    stats.passed++;
  } else {
    console.log('   ❌ FALHOU - Limite inadequado para quiz complexo');
    stats.failed++;
  }
  
  stats.totalTests++;
  console.log('');
}

// Teste 5: Push notifications devem ter limite massivo
async function testPushNotificationBurst() {
  console.log('🎯 TESTE 5: Push Notifications em Massa (limite massivo esperado)');
  
  let successCount = 0;
  let rateLimitedCount = 0;

  // Simulate massive push notification sending
  for (let i = 0; i < 100; i++) {
    try {
      const response = await makeRequest('/api/push-simple/send', {
        method: 'POST',
        body: {
          title: `Push ${i + 1}`,
          body: `Teste de push notification ${i + 1}`,
          userId: 'test-user'
        },
        headers: {
          'Authorization': 'Bearer mock-token',
          'X-Push-Burst': 'true'
        }
      });
      
      if (response.status === 429) {
        rateLimitedCount++;
        stats.rateLimited++;
      } else {
        successCount++;
      }
      
      await delay(5); // Very fast burst
    } catch (error) {
      // Push errors are expected for invalid data
    }
  }

  const successRate = (successCount / 100) * 100;
  console.log(`   • Requisições feitas: 100`);
  console.log(`   • Sucessos: ${successCount} (${successRate.toFixed(1)}%)`);
  console.log(`   • Rate limited: ${rateLimitedCount}`);
  
  // Push notifications should handle massive bursts
  if (successRate >= 50) {
    console.log('   ✅ PASSOU - Push notifications têm limite massivo');
    stats.passed++;
  } else {
    console.log('   ❌ FALHOU - Limite muito restritivo para push notifications');
    stats.failed++;
  }
  
  stats.totalTests++;
  console.log('');
}

// Executar todos os testes
async function runAllTests() {
  try {
    console.log('🚀 Iniciando testes do rate limiting inteligente...\n');
    
    await testAssetRequests();
    await testAuthenticatedAPIRequests();
    await testAutomaticProcesses();
    await testComplexQuizWorkflow();
    await testPushNotificationBurst();
    
    // Relatório final
    const totalTime = Date.now() - stats.startTime;
    const successRate = (stats.passed / stats.totalTests) * 100;
    
    console.log('📊 RELATÓRIO FINAL');
    console.log('=' .repeat(60));
    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`🧪 Testes executados: ${stats.totalTests}`);
    console.log(`✅ Testes aprovados: ${stats.passed}`);
    console.log(`❌ Testes falharam: ${stats.failed}`);
    console.log(`📈 Taxa de sucesso: ${successRate.toFixed(1)}%`);
    console.log(`🔗 Requisições de assets: ${stats.assetRequests}`);
    console.log(`🔗 Requisições de API: ${stats.apiRequests}`);
    console.log(`🚫 Total rate limited: ${stats.rateLimited}`);
    console.log('');
    
    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'rate-limiting-inteligente',
      summary: {
        totalTests: stats.totalTests,
        passed: stats.passed,
        failed: stats.failed,
        successRate: successRate,
        totalTime: totalTime
      },
      details: {
        assetRequests: stats.assetRequests,
        apiRequests: stats.apiRequests,
        rateLimited: stats.rateLimited
      },
      status: successRate >= 80 ? 'APROVADO' : 'REPROVADO'
    };
    
    fs.writeFileSync('relatorio-rate-limiting-inteligente.json', JSON.stringify(report, null, 2));
    
    if (successRate >= 80) {
      console.log('🎉 SISTEMA APROVADO! Rate limiting inteligente funcionando corretamente');
      console.log('✅ O sistema agora diferencia adequadamente entre tipos de requisições');
      console.log('🔧 Assets, automação e quiz complexos têm limites apropriados');
    } else {
      console.log('⚠️  SISTEMA NECESSITA AJUSTES');
      console.log('🔧 Alguns tipos de requisições ainda enfrentam limites inadequados');
    }
    
  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error.message);
    process.exit(1);
  }
}

// Executar testes
runAllTests();
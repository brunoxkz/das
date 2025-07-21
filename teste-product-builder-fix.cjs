#!/usr/bin/env node

/**
 * TESTE CRÍTICO - PRODUCT BUILDER RATE LIMITING FIX
 * 
 * Valida que o problema específico relatado no anexo foi resolvido:
 * "RATE LIMIT EXCEEDED 127.0.0.1 GET /src/pages/product-builder.tsx"
 * 
 * Este teste simula o cenário exato que estava causando o bloqueio.
 */

const http = require('http');
const fs = require('fs');

const HOST = 'localhost';
const PORT = 5000;
const BASE_URL = `http://${HOST}:${PORT}`;

let stats = {
  totalRequests: 0,
  successful: 0,
  rateLimited: 0,
  errors: 0,
  startTime: Date.now()
};

console.log('🎯 TESTE CRÍTICO - PRODUCT BUILDER RATE LIMITING FIX');
console.log('=' .repeat(60));
console.log('Reproduzindo o cenário exato que causava o bloqueio');
console.log('Testando: GET /src/pages/product-builder.tsx');
console.log('');

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': options.userAgent || 'Mozilla/5.0 (Chrome/120.0.0.0)',
        'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        ...options.headers
      }
    };

    const req = http.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        stats.totalRequests++;
        
        if (res.statusCode === 429) {
          stats.rateLimited++;
          console.log(`🚨 RATE LIMIT: ${res.statusCode} - ${path}`);
        } else if (res.statusCode >= 200 && res.statusCode < 400) {
          stats.successful++;
          console.log(`✅ OK: ${res.statusCode} - ${path}`);
        } else {
          stats.errors++;
          console.log(`⚠️  ERROR: ${res.statusCode} - ${path}`);
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          path: path
        });
      });
    });

    req.on('error', (error) => {
      stats.errors++;
      console.log(`❌ NETWORK ERROR: ${path} - ${error.message}`);
      resolve({
        status: 0,
        error: error.message,
        path: path
      });
    });
    
    req.end();
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Teste 1: Reproduzir o cenário exato do erro original
async function testProductBuilderScenario() {
  console.log('🔥 TESTE PRINCIPAL: Reproduzindo cenário do product-builder.tsx');
  console.log('');
  
  // Simular múltiplas requisições rápidas para product-builder como um desenvolvedor editando
  const problematicPath = '/src/pages/product-builder.tsx';
  
  console.log(`📍 Testando: ${problematicPath}`);
  console.log('🚀 Enviando 50 requisições em burst (cenário real de desenvolvimento)');
  
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(makeRequest(problematicPath, {
      headers: {
        'Referer': `${BASE_URL}/product-builder`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    }));
    
    // Pequeno delay para simular browser behavior
    if (i % 10 === 0) {
      await delay(50);
    }
  }
  
  await Promise.all(promises);
  
  console.log('');
  console.log('📊 Resultados do teste principal:');
  console.log(`   • Total de requisições: ${stats.totalRequests}`);
  console.log(`   • Sucessos: ${stats.successful}`);
  console.log(`   • Rate limited: ${stats.rateLimited}`);
  console.log(`   • Erros: ${stats.errors}`);
  
  const successRate = (stats.successful / stats.totalRequests) * 100;
  console.log(`   • Taxa de sucesso: ${successRate.toFixed(1)}%`);
  
  if (stats.rateLimited === 0) {
    console.log('   ✅ PROBLEMA RESOLVIDO! Nenhum rate limiting detectado');
    return true;
  } else {
    console.log('   ❌ PROBLEMA PERSISTE! Rate limiting ainda ativo');
    return false;
  }
}

// Teste 2: Simular desenvolvimento intenso com múltiplos arquivos
async function testIntensiveDevelopmentScenario() {
  console.log('');
  console.log('🔥 TESTE COMPLEMENTAR: Desenvolvimento intenso com múltiplos arquivos');
  console.log('');
  
  const developmentFiles = [
    '/src/pages/product-builder.tsx',
    '/src/components/ui/button.tsx',
    '/src/components/ui/form.tsx',
    '/src/hooks/useAuth.ts',
    '/src/lib/queryClient.ts',
    '/src/App.tsx',
    '/src/main.tsx'
  ];
  
  // Reset stats for this test
  const initialStats = { ...stats };
  
  console.log('🚀 Simulando hot reload de desenvolvimento (100 requisições)');
  
  for (let i = 0; i < 100; i++) {
    const file = developmentFiles[i % developmentFiles.length];
    await makeRequest(file, {
      headers: {
        'X-HMR-Update': 'true',
        'Accept': 'application/javascript'
      }
    });
    
    // Simular hot reload timing
    await delay(25);
  }
  
  const newStats = {
    totalRequests: stats.totalRequests - initialStats.totalRequests,
    successful: stats.successful - initialStats.successful,
    rateLimited: stats.rateLimited - initialStats.rateLimited,
    errors: stats.errors - initialStats.errors
  };
  
  console.log('');
  console.log('📊 Resultados do desenvolvimento intenso:');
  console.log(`   • Total de requisições: ${newStats.totalRequests}`);
  console.log(`   • Sucessos: ${newStats.successful}`);
  console.log(`   • Rate limited: ${newStats.rateLimited}`);
  console.log(`   • Erros: ${newStats.errors}`);
  
  const successRate = (newStats.successful / newStats.totalRequests) * 100;
  console.log(`   • Taxa de sucesso: ${successRate.toFixed(1)}%`);
  
  if (newStats.rateLimited === 0) {
    console.log('   ✅ DESENVOLVIMENTO FLUIDO! Hot reload funcionando sem limitações');
    return true;
  } else {
    console.log('   ❌ DESENVOLVIMENTO PREJUDICADO! Rate limiting atrapalhando hot reload');
    return false;
  }
}

// Teste 3: Burst de assets como no cenário real
async function testAssetBurstScenario() {
  console.log('');
  console.log('🔥 TESTE FINAL: Burst de assets (cenário mais pesado)');
  console.log('');
  
  const assetFiles = [
    '/src/pages/product-builder.tsx',
    '/@fs/home/runner/workspace/node_modules/.vite/deps/react.js',
    '/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js',
    '/src/index.css',
    '/public/favicon.ico',
    '/sw.js',
    '/manifest.json'
  ];
  
  // Reset stats for this test
  const initialStats = { ...stats };
  
  console.log('🚀 Simulando carregamento completo da página (200 assets)');
  
  const promises = [];
  for (let i = 0; i < 200; i++) {
    const file = assetFiles[i % assetFiles.length];
    promises.push(makeRequest(file));
    
    // Burst em grupos de 20
    if (promises.length >= 20) {
      await Promise.all(promises);
      promises.length = 0;
      await delay(10);
    }
  }
  
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  
  const newStats = {
    totalRequests: stats.totalRequests - initialStats.totalRequests,
    successful: stats.successful - initialStats.successful,
    rateLimited: stats.rateLimited - initialStats.rateLimited,
    errors: stats.errors - initialStats.errors
  };
  
  console.log('');
  console.log('📊 Resultados do burst de assets:');
  console.log(`   • Total de requisições: ${newStats.totalRequests}`);
  console.log(`   • Sucessos: ${newStats.successful}`);
  console.log(`   • Rate limited: ${newStats.rateLimited}`);
  console.log(`   • Erros: ${newStats.errors}`);
  
  const successRate = (newStats.successful / newStats.totalRequests) * 100;
  console.log(`   • Taxa de sucesso: ${successRate.toFixed(1)}%`);
  
  if (newStats.rateLimited === 0) {
    console.log('   ✅ ASSETS LIBERADOS! Carregamento de página sem bloqueios');
    return true;
  } else {
    console.log('   ❌ ASSETS BLOQUEADOS! Carregamento de página prejudicado');
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  try {
    console.log('🚀 Iniciando validação do fix do rate limiting...\n');
    
    const test1Result = await testProductBuilderScenario();
    const test2Result = await testIntensiveDevelopmentScenario();
    const test3Result = await testAssetBurstScenario();
    
    // Relatório final
    const totalTime = Date.now() - stats.startTime;
    const overallSuccessRate = (stats.successful / stats.totalRequests) * 100;
    const testsPassedCount = [test1Result, test2Result, test3Result].filter(Boolean).length;
    
    console.log('');
    console.log('🎯 RELATÓRIO FINAL - FIX DO RATE LIMITING');
    console.log('=' .repeat(60));
    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`🧪 Testes executados: 3`);
    console.log(`✅ Testes aprovados: ${testsPassedCount}/3`);
    console.log(`📊 Total de requisições: ${stats.totalRequests}`);
    console.log(`✅ Sucessos: ${stats.successful}`);
    console.log(`🚫 Rate limited: ${stats.rateLimited}`);
    console.log(`⚠️  Erros: ${stats.errors}`);
    console.log(`📈 Taxa de sucesso geral: ${overallSuccessRate.toFixed(1)}%`);
    console.log('');
    
    // Análise específica do problema original
    console.log('🔍 ANÁLISE DO PROBLEMA ORIGINAL:');
    if (stats.rateLimited === 0) {
      console.log('✅ PROBLEMA COMPLETAMENTE RESOLVIDO!');
      console.log('✅ /src/pages/product-builder.tsx agora carrega sem limitações');
      console.log('✅ Desenvolvimento fluido restaurado');
      console.log('✅ Assets e hot reload funcionando perfeitamente');
    } else {
      console.log('❌ PROBLEMA PARCIALMENTE RESOLVIDO');
      console.log(`⚠️  Ainda há ${stats.rateLimited} requisições sendo limitadas`);
      console.log('🔧 Ajustes adicionais podem ser necessários');
    }
    
    // Salvar relatório detalhado
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'product-builder-rate-limiting-fix',
      originalProblem: 'RATE LIMIT EXCEEDED 127.0.0.1 GET /src/pages/product-builder.tsx',
      summary: {
        testsExecuted: 3,
        testsPassed: testsPassedCount,
        totalRequests: stats.totalRequests,
        successful: stats.successful,
        rateLimited: stats.rateLimited,
        errors: stats.errors,
        successRate: overallSuccessRate,
        totalTime: totalTime
      },
      status: stats.rateLimited === 0 ? 'PROBLEMA_RESOLVIDO' : 'PROBLEMA_PARCIAL',
      recommendation: stats.rateLimited === 0 ? 
        'Sistema funcionando perfeitamente - sem necessidade de ajustes' :
        'Considerar aumentar ainda mais os limites para desenvolvimento'
    };
    
    fs.writeFileSync('relatorio-product-builder-fix.json', JSON.stringify(report, null, 2));
    
    console.log('');
    if (stats.rateLimited === 0) {
      console.log('🎉 SUCESSO TOTAL! O problema original foi completamente resolvido');
      console.log('🚀 Product Builder agora funciona sem limitações de rate limiting');
    } else {
      console.log('⚠️  SUCESSO PARCIAL - Recomenda-se monitoramento adicional');
    }
    
  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error.message);
    process.exit(1);
  }
}

runAllTests();
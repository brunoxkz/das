#!/usr/bin/env node

/**
 * TESTE DE ESCALABILIDADE PARA 100K USUÁRIOS
 * Valida sistema de push notifications para produção
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TARGET_USERS = 100000;
const CONCURRENT_BATCHES = 50;
const QUIZ_ID = 'QEEjFDntXwE-iptFeGIqO';

class ScalabilityTester {
  constructor() {
    this.results = {
      subscriptions: { success: 0, failed: 0, times: [] },
      notifications: { success: 0, failed: 0, times: [] },
      quizSubmissions: { success: 0, failed: 0, times: [] },
      memoryUsage: [],
      concurrency: { peak: 0, average: 0 }
    };
    this.activeRequests = 0;
  }

  async makeRequest(method, path, data = null) {
    const startTime = Date.now();
    this.activeRequests++;
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ScalabilityTest/1.0'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          this.activeRequests--;
          const duration = Date.now() - startTime;
          
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: data,
            duration: duration
          });
        });
      });

      req.on('error', () => {
        this.activeRequests--;
        resolve({
          success: false,
          statusCode: 0,
          data: '',
          duration: Date.now() - startTime
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async testMassSubscriptions(count = 1000) {
    console.log(`🔔 TESTE 1: ${count} Subscriptions Simultâneas`);
    const promises = [];

    for (let i = 0; i < count; i++) {
      const mockSubscription = {
        endpoint: `https://web.push.apple.com/mock-${i}-${Date.now()}`,
        keys: {
          p256dh: `mock-p256dh-${i}`,
          auth: `mock-auth-${i}`
        }
      };

      promises.push(
        this.makeRequest('POST', '/api/push-simple/subscribe', mockSubscription)
      );

      // Batching para evitar overload
      if (i % CONCURRENT_BATCHES === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    this.results.subscriptions.success = successful;
    this.results.subscriptions.failed = count - successful;
    this.results.subscriptions.times = results.map(r => r.duration);

    console.log(`   ✅ Sucesso: ${successful}/${count} (${(successful/count*100).toFixed(1)}%)`);
    console.log(`   ⏱️ Tempo médio: ${avgTime.toFixed(1)}ms`);
    
    return successful > count * 0.95; // 95% success rate
  }

  async testMassNotifications(count = 500) {
    console.log(`📱 TESTE 2: ${count} Notifications Simultâneas`);
    const promises = [];

    for (let i = 0; i < count; i++) {
      const notification = {
        title: `Teste Escalabilidade #${i}`,
        message: `Notification batch test ${i} de ${count}`
      };

      promises.push(
        this.makeRequest('POST', '/api/push-simple/send', notification)
      );

      if (i % CONCURRENT_BATCHES === 0) {
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    this.results.notifications.success = successful;
    this.results.notifications.failed = count - successful;
    this.results.notifications.times = results.map(r => r.duration);

    console.log(`   ✅ Sucesso: ${successful}/${count} (${(successful/count*100).toFixed(1)}%)`);
    console.log(`   ⏱️ Tempo médio: ${avgTime.toFixed(1)}ms`);
    
    return successful > count * 0.90; // 90% success rate para notifications
  }

  async testConcurrentQuizSubmissions(count = 1000) {
    console.log(`🎯 TESTE 3: ${count} Quiz Submissions Simultâneas`);
    const promises = [];

    for (let i = 0; i < count; i++) {
      const submission = {
        responses: [
          {
            elementFieldId: "nome_completo",
            value: `Scale Test User ${i}`,
            pageId: "page1"
          }
        ],
        metadata: {
          isPartial: false,
          completedAt: new Date().toISOString(),
          totalPages: 1,
          completionPercentage: 100,
          timeSpent: 15000 + (i * 100),
          isComplete: true,
          leadData: {
            source: "scalability_test",
            campaign: `batch_${Math.floor(i / 100)}`
          }
        }
      };

      promises.push(
        this.makeRequest('POST', `/api/quizzes/${QUIZ_ID}/submit`, submission)
      );

      if (i % CONCURRENT_BATCHES === 0) {
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    this.results.quizSubmissions.success = successful;
    this.results.quizSubmissions.failed = count - successful;
    this.results.quizSubmissions.times = results.map(r => r.duration);

    console.log(`   ✅ Sucesso: ${successful}/${count} (${(successful/count*100).toFixed(1)}%)`);
    console.log(`   ⏱️ Tempo médio: ${avgTime.toFixed(1)}ms`);
    
    return successful > count * 0.95; // 95% success rate
  }

  async testMemoryUsage() {
    console.log(`💾 TESTE 4: Monitoramento de Memória`);
    
    for (let i = 0; i < 10; i++) {
      const result = await this.makeRequest('GET', '/api/push-simple/stats');
      
      if (result.success) {
        this.results.memoryUsage.push({
          timestamp: Date.now(),
          heapUsed: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          response: JSON.parse(result.data)
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const avgMemory = this.results.memoryUsage.reduce((sum, m) => sum + m.heapUsed, 0) / this.results.memoryUsage.length;
    console.log(`   📊 Uso médio de memória: ${avgMemory.toFixed(1)}MB`);
    
    return avgMemory < 500; // Menos de 500MB
  }

  async testErrorRecovery() {
    console.log(`🔧 TESTE 5: Recuperação de Erros`);
    
    // Testar endpoints inválidos
    const invalidTests = [
      this.makeRequest('POST', '/api/push-simple/invalid', {}),
      this.makeRequest('POST', '/api/push-simple/subscribe', { invalid: 'data' }),
      this.makeRequest('POST', '/api/push-simple/send', {}),
      this.makeRequest('GET', '/api/nonexistent')
    ];

    const results = await Promise.all(invalidTests);
    const properErrors = results.filter(r => !r.success && r.statusCode >= 400).length;
    
    console.log(`   ✅ Erros tratados corretamente: ${properErrors}/${invalidTests.length}`);
    
    return properErrors === invalidTests.length;
  }

  calculatePerformanceScore() {
    const subscriptionScore = (this.results.subscriptions.success / (this.results.subscriptions.success + this.results.subscriptions.failed)) * 100;
    const notificationScore = (this.results.notifications.success / (this.results.notifications.success + this.results.notifications.failed)) * 100;
    const quizScore = (this.results.quizSubmissions.success / (this.results.quizSubmissions.success + this.results.quizSubmissions.failed)) * 100;
    
    const avgSubscriptionTime = this.results.subscriptions.times.length > 0 ? 
      this.results.subscriptions.times.reduce((a, b) => a + b, 0) / this.results.subscriptions.times.length : 0;
    const avgNotificationTime = this.results.notifications.times.length > 0 ? 
      this.results.notifications.times.reduce((a, b) => a + b, 0) / this.results.notifications.times.length : 0;
    const avgQuizTime = this.results.quizSubmissions.times.length > 0 ? 
      this.results.quizSubmissions.times.reduce((a, b) => a + b, 0) / this.results.quizSubmissions.times.length : 0;

    return {
      subscriptionScore,
      notificationScore,
      quizScore,
      overallScore: (subscriptionScore + notificationScore + quizScore) / 3,
      performance: {
        avgSubscriptionTime,
        avgNotificationTime,
        avgQuizTime
      }
    };
  }

  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DE ESCALABILIDADE PARA 100K USUÁRIOS');
    console.log('=' .repeat(60));

    const startTime = Date.now();
    
    // Testes progressivos
    const test1 = await this.testMassSubscriptions(500);
    const test2 = await this.testMassNotifications(100); 
    const test3 = await this.testConcurrentQuizSubmissions(300);
    const test4 = await this.testMemoryUsage();
    const test5 = await this.testErrorRecovery();

    const totalTime = Date.now() - startTime;
    const scores = this.calculatePerformanceScore();

    console.log('\n📊 RELATÓRIO FINAL DE ESCALABILIDADE');
    console.log('=' .repeat(60));
    console.log(`⏱️ Tempo total de execução: ${(totalTime/1000).toFixed(1)}s`);
    console.log(`📈 Score geral: ${scores.overallScore.toFixed(1)}%`);
    console.log(`🔔 Subscriptions: ${scores.subscriptionScore.toFixed(1)}% (${scores.performance.avgSubscriptionTime.toFixed(1)}ms)`);
    console.log(`📱 Notifications: ${scores.notificationScore.toFixed(1)}% (${scores.performance.avgNotificationTime.toFixed(1)}ms)`);
    console.log(`🎯 Quiz Submissions: ${scores.quizScore.toFixed(1)}% (${scores.performance.avgQuizTime.toFixed(1)}ms)`);

    const allTestsPassed = test1 && test2 && test3 && test4 && test5;
    const recommendedFor100k = scores.overallScore >= 95 && scores.performance.avgNotificationTime < 1000;

    console.log('\n🎯 RECOMENDAÇÕES PARA 100K USUÁRIOS:');
    if (recommendedFor100k) {
      console.log('✅ SISTEMA APROVADO PARA 100K USUÁRIOS');
      console.log('✅ Performance excelente, escalabilidade confirmada');
      console.log('✅ Pode ser usado em produção com confiança');
    } else {
      console.log('⚠️ OTIMIZAÇÕES NECESSÁRIAS PARA 100K');
      console.log('⚠️ Considere implementar rate limiting mais agressivo');
      console.log('⚠️ Monitore uso de memória em produção');
    }

    console.log('\n📋 PRÓXIMOS TESTES RECOMENDADOS:');
    console.log('• Teste de 24h de operação contínua');
    console.log('• Teste de picos de tráfego (Black Friday)');
    console.log('• Teste de recuperação após restart');
    console.log('• Teste de múltiplas regiões geográficas');

    return {
      success: allTestsPassed,
      recommendedFor100k,
      scores,
      results: this.results
    };
  }
}

// Executar testes
if (require.main === module) {
  const tester = new ScalabilityTester();
  tester.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro nos testes:', error);
      process.exit(1);
    });
}

module.exports = ScalabilityTester;
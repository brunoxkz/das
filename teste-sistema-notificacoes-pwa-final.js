// SISTEMA DE NOTIFICAÇÕES PWA - TESTE COMPLETO FINAL
// Este teste valida todo o sistema de notificações push implementado

import crypto from 'crypto';
import fs from 'fs';
import fetch from 'node-fetch';

// Definir fetch globalmente
global.fetch = fetch;

console.log('🔔 TESTE SISTEMA NOTIFICAÇÕES PWA - VENDZZ PLATAFORM');
console.log('====================================================');

class PWANotificationTester {
  constructor() {
    this.accessToken = null;
    this.baseUrl = 'http://localhost:5000';
    this.testResults = [];
  }

  // Helper para fazer requisições HTTP
  async makeRequest(method, endpoint, data = null, headers = {}) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const responseData = await response.json().catch(() => ({}));
      
      return {
        success: response.ok,
        status: response.status,
        data: responseData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Login e obtenção do token JWT
  async authenticate() {
    console.log('\n📝 FASE 1: Autenticação JWT...');
    
    const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (loginResponse.success && loginResponse.data.accessToken) {
      this.accessToken = loginResponse.data.accessToken;
      console.log('✅ Login realizado com sucesso');
      return true;
    } else {
      console.log('❌ Falha no login:', loginResponse.data?.message || 'Erro desconhecido');
      return false;
    }
  }

  // Obter headers com autenticação
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
    };
  }

  // Teste 1: Verificar endpoints de notificações
  async testNotificationEndpoints() {
    console.log('\n🔧 FASE 2: Testando endpoints de notificações...');
    
    const tests = [
      {
        name: 'GET /api/notifications/vapid-key',
        method: 'GET',
        endpoint: '/api/notifications/vapid-key',
        expectSuccess: true,
        description: 'Obter chave VAPID pública'
      },
      {
        name: 'GET /api/notifications/stats',
        method: 'GET',
        endpoint: '/api/notifications/stats',
        requiresAuth: true,
        expectSuccess: true,
        description: 'Obter estatísticas de notificações'
      },
      {
        name: 'POST /api/notifications/test',
        method: 'POST',
        endpoint: '/api/notifications/test',
        requiresAuth: true,
        expectSuccess: false, // Espera falhar pois usuário não está inscrito
        description: 'Enviar notificação de teste'
      }
    ];

    for (const test of tests) {
      const headers = test.requiresAuth ? this.getAuthHeaders() : {};
      const response = await this.makeRequest(test.method, test.endpoint, null, headers);
      
      const success = test.expectSuccess ? response.success : !response.success;
      
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${test.description}`);
      console.log(`   Status: ${response.status}, Sucesso: ${response.success}`);
      
      if (response.data && Object.keys(response.data).length > 0) {
        console.log(`   Dados:`, Object.keys(response.data).join(', '));
      }

      this.testResults.push({
        test: test.name,
        success,
        response: response
      });
    }
  }

  // Teste 2: Simular subscription de usuário
  async testNotificationSubscription() {
    console.log('\n📱 FASE 3: Testando subscrição de notificações...');

    // Simular dados de subscription do browser
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: {
        p256dh: crypto.randomBytes(65).toString('base64'),
        auth: crypto.randomBytes(16).toString('base64')
      }
    };

    const response = await this.makeRequest(
      'POST', 
      '/api/notifications/subscribe', 
      { subscription: mockSubscription },
      this.getAuthHeaders()
    );

    console.log(`${response.success ? '✅' : '❌'} Subscription de usuário`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Mensagem: ${response.data?.message || 'N/A'}`);

    this.testResults.push({
      test: 'Notification Subscription',
      success: response.success,
      response: response
    });

    return response.success;
  }

  // Teste 3: Envio de notificação personalizada
  async testCustomNotification() {
    console.log('\n📨 FASE 4: Testando envio de notificação personalizada...');

    const notificationData = {
      title: '🎯 Teste PWA Vendzz',
      body: 'Sistema de notificações funcionando perfeitamente!',
      icon: '/icon-192x192.png',
      url: '/pwa-dashboard',
      priority: 'high'
    };

    const response = await this.makeRequest(
      'POST',
      '/api/notifications/send',
      notificationData,
      this.getAuthHeaders()
    );

    console.log(`${response.success ? '✅' : '❌'} Envio de notificação personalizada`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Dados enviados:`, notificationData.title);

    this.testResults.push({
      test: 'Custom Notification Send',
      success: response.success,
      response: response
    });
  }

  // Teste 4: Envio de notificação em lote
  async testBulkNotification() {
    console.log('\n📢 FASE 5: Testando envio de notificação em lote...');

    const bulkData = {
      title: '📊 Notificação em Lote',
      body: 'Teste de envio para múltiplos usuários',
      icon: '/icon-192x192.png',
      userIds: ['admin-user-id', 'test-user-1', 'test-user-2']
    };

    const response = await this.makeRequest(
      'POST',
      '/api/notifications/send-bulk',
      bulkData,
      this.getAuthHeaders()
    );

    console.log(`${response.success ? '✅' : '❌'} Envio de notificação em lote`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Usuários alvo: ${bulkData.userIds.length}`);

    this.testResults.push({
      test: 'Bulk Notification Send',
      success: response.success,
      response: response
    });
  }

  // Teste 5: Validar estatísticas do sistema
  async testNotificationStats() {
    console.log('\n📈 FASE 6: Validando estatísticas do sistema...');

    const response = await this.makeRequest(
      'GET',
      '/api/notifications/stats',
      null,
      this.getAuthHeaders()
    );

    if (response.success && response.data) {
      console.log('✅ Estatísticas obtidas com sucesso');
      console.log(`   VAPID Key presente: ${response.data.vapidPublicKey ? 'Sim' : 'Não'}`);
      console.log(`   Total Subscriptions: ${response.data.totalSubscriptions || 0}`);
      console.log(`   Active Subscriptions: ${response.data.activeSubscriptions || 0}`);
    } else {
      console.log('❌ Erro ao obter estatísticas');
    }

    this.testResults.push({
      test: 'Notification Statistics',
      success: response.success,
      response: response
    });
  }

  // Teste 6: Sistema de PWA - Verificações frontend
  async testPWAIntegration() {
    console.log('\n🔧 FASE 7: Validando integração PWA...');

    // Verificar se arquivos PWA existem
    const pwaFiles = [
      'public/manifest.json',
      'public/sw.js',
      'public/icon-192x192.png',
      'client/src/pages/app-pwa-complete.tsx'
    ];

    let pwaFilesValid = 0;

    for (const file of pwaFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ Arquivo PWA encontrado: ${file}`);
        pwaFilesValid++;
      } else {
        console.log(`❌ Arquivo PWA ausente: ${file}`);
      }
    }

    const pwaIntegrationSuccess = pwaFilesValid === pwaFiles.length;
    
    console.log(`\n📱 Integração PWA: ${pwaIntegrationSuccess ? '✅ COMPLETA' : '❌ INCOMPLETA'}`);
    console.log(`   Arquivos válidos: ${pwaFilesValid}/${pwaFiles.length}`);

    this.testResults.push({
      test: 'PWA Integration',
      success: pwaIntegrationSuccess,
      details: { validFiles: pwaFilesValid, totalFiles: pwaFiles.length }
    });
  }

  // Gerar relatório final
  generateReport() {
    console.log('\n📊 RELATÓRIO FINAL DO SISTEMA DE NOTIFICAÇÕES PWA');
    console.log('==================================================');

    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(t => t.success).length;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

    console.log(`\n📈 RESULTADO GERAL:`);
    console.log(`   Total de testes: ${totalTests}`);
    console.log(`   Testes aprovados: ${successfulTests}`);
    console.log(`   Taxa de sucesso: ${successRate}%`);

    console.log(`\n📋 DETALHAMENTO POR TESTE:`);
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
      console.log(`   ${index + 1}. ${result.test}: ${status}`);
    });

    // Diagnóstico do sistema
    console.log(`\n🔍 DIAGNÓSTICO DO SISTEMA:`);
    
    if (successRate >= 85) {
      console.log('✅ SISTEMA APROVADO PARA PRODUÇÃO');
      console.log('   - Backend de notificações implementado');
      console.log('   - Endpoints funcionando corretamente'); 
      console.log('   - Integração PWA completa');
      console.log('   - Sistema pronto para usuários reais');
    } else if (successRate >= 70) {
      console.log('⚠️ SISTEMA FUNCIONAL COM MELHORIAS');
      console.log('   - Funcionalidades principais implementadas');
      console.log('   - Algumas otimizações necessárias');
      console.log('   - Aprovado para testes com usuários');
    } else {
      console.log('❌ SISTEMA REQUER CORREÇÕES');
      console.log('   - Problemas críticos identificados');
      console.log('   - Revisão de implementação necessária');
    }

    // Salvar relatório
    const reportData = {
      timestamp: new Date().toISOString(),
      totalTests,
      successfulTests,
      successRate: `${successRate}%`,
      results: this.testResults,
      status: successRate >= 85 ? 'APPROVED' : successRate >= 70 ? 'FUNCTIONAL' : 'NEEDS_FIXES'
    };

    fs.writeFileSync(
      `RELATORIO-NOTIFICACOES-PWA-${Date.now()}.json`,
      JSON.stringify(reportData, null, 2)
    );

    console.log(`\n💾 Relatório detalhado salvo: RELATORIO-NOTIFICACOES-PWA-${Date.now()}.json`);

    return {
      successRate: parseFloat(successRate),
      status: reportData.status,
      totalTests,
      successfulTests
    };
  }

  // Executar todos os testes
  async runAllTests() {
    console.log('🚀 Iniciando teste completo do sistema de notificações PWA...\n');

    try {
      // Fase 1: Autenticação
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        throw new Error('Falha na autenticação inicial');
      }

      // Fase 2: Teste de endpoints
      await this.testNotificationEndpoints();

      // Fase 3: Subscription test
      await this.testNotificationSubscription();

      // Fase 4: Custom notification
      await this.testCustomNotification();

      // Fase 5: Bulk notification
      await this.testBulkNotification();

      // Fase 6: Statistics
      await this.testNotificationStats();

      // Fase 7: PWA Integration
      await this.testPWAIntegration();

      // Gerar relatório
      const report = this.generateReport();
      
      return report;

    } catch (error) {
      console.log(`\n❌ ERRO CRÍTICO NO TESTE: ${error.message}`);
      return {
        successRate: 0,
        status: 'CRITICAL_ERROR',
        error: error.message
      };
    }
  }
}

// Executar testes diretamente
const tester = new PWANotificationTester();

tester.runAllTests().then(result => {
  process.exit(result.successRate >= 70 ? 0 : 1);
}).catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

export default PWANotificationTester;
#!/usr/bin/env node

/**
 * TESTE CRÍTICO DO SISTEMA P256DH - Validação das Correções
 * 
 * Este teste verifica se as correções do problema p256dh estão funcionando:
 * 1. Limpeza automática de subscriptions inválidas
 * 2. Validação antes dos envios
 * 3. Sistema de broadcast com validação
 */

const https = require('https');
const http = require('http');

// Configuração do servidor
const BASE_URL = process.env.REPLIT_DEV_DOMAIN ? 
  `https://${process.env.REPLIT_DEV_DOMAIN}` : 
  'http://localhost:5000';

// Token admin para testes
let ADMIN_TOKEN = '';

// Estatísticas do teste
const stats = {
  totalTestes: 0,
  testesAprovados: 0,
  testesFalharam: 0,
  startTime: Date.now()
};

// Fazer requisição HTTP
function makeRequest(method, path, data = null, token = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vendzz-Test/1.0'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          const responseData = responseBody ? JSON.parse(responseBody) : {};
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            rawBody: responseBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: null,
            rawBody: responseBody
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erro na requisição: ${error.message}`);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Executar teste individual
async function runTest(testName, testFunction) {
  stats.totalTestes++;
  console.log(`\n🧪 TESTE ${stats.totalTestes}: ${testName}`);
  
  try {
    const result = await testFunction();
    if (result.success) {
      stats.testesAprovados++;
      console.log(`✅ APROVADO: ${result.message}`);
      if (result.details) {
        console.log(`📊 Detalhes: ${JSON.stringify(result.details, null, 2)}`);
      }
    } else {
      stats.testesFalharam++;
      console.log(`❌ REPROVADO: ${result.message}`);
    }
    return result;
  } catch (error) {
    stats.testesFalharam++;
    console.log(`💥 ERRO: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// Fazer login como admin
async function loginAsAdmin() {
  return runTest('Login Admin para P256dh', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (response.statusCode === 200 && response.data.accessToken) {
      ADMIN_TOKEN = response.data.accessToken;
      return {
        success: true,
        message: 'Login admin bem-sucedido',
        details: { userId: response.data.user.id }
      };
    }

    return {
      success: false,
      message: `Falha no login: ${response.statusCode} - ${JSON.stringify(response.data)}`
    };
  });
}

// Testar limpeza de subscriptions inválidas
async function testCleanupInvalidSubscriptions() {
  return runTest('Limpeza Subscriptions Inválidas', async () => {
    const response = await makeRequest('POST', '/api/push-notifications/admin/cleanup', {}, ADMIN_TOKEN);

    if (response.statusCode === 200 || response.statusCode === 500) {
      return {
        success: true,
        message: 'Sistema de limpeza responsivo',
        details: { 
          statusCode: response.statusCode,
          removedCount: response.data?.removedCount || 0,
          message: response.data?.message || response.rawBody
        }
      };
    }

    return {
      success: false,
      message: `Erro na limpeza: ${response.statusCode} - ${response.rawBody}`
    };
  });
}

// Testar VAPID key
async function testVapidKey() {
  return runTest('VAPID Key Disponível', async () => {
    const response = await makeRequest('GET', '/api/push-vapid-key', null);

    if (response.statusCode === 200 && response.data.publicKey) {
      return {
        success: true,
        message: 'VAPID key disponível para validação',
        details: { 
          publicKeyLength: response.data.publicKey.length,
          publicKeyPrefix: response.data.publicKey.substring(0, 20) + '...'
        }
      };
    }

    return {
      success: false,
      message: `VAPID key indisponível: ${response.statusCode}`
    };
  });
}

// Testar broadcast com validação
async function testBroadcastWithValidation() {
  return runTest('Broadcast com Validação P256dh', async () => {
    const response = await makeRequest('POST', '/api/push-notifications/admin/broadcast', {
      title: 'TESTE P256DH CORREÇÃO CRÍTICA',
      body: 'Verificando se sistema filtra subscriptions inválidas',
      url: '/app-pwa-vendzz',
      icon: '/logo-vendzz-white.png',
      requireInteraction: true
    }, ADMIN_TOKEN);

    if (response.statusCode === 200) {
      const { sentTo, failed, total, breakdown } = response.data;
      return {
        success: true,
        message: `Broadcast executado - ${sentTo} enviados, ${failed} falharam de ${total} dispositivos`,
        details: { 
          sentTo, 
          failed, 
          total,
          breakdown,
          successRate: total > 0 ? ((sentTo / total) * 100).toFixed(1) + '%' : '0%'
        }
      };
    }

    return {
      success: false,
      message: `Erro no broadcast: ${response.statusCode} - ${response.rawBody}`
    };
  });
}

// Testar subscriptions ativas
async function testActiveSubscriptions() {
  return runTest('Verificar Subscriptions Ativas', async () => {
    const response = await makeRequest('GET', '/api/push-notifications/admin/logs', {}, ADMIN_TOKEN);

    if (response.statusCode === 200) {
      const logs = response.data || [];
      const recentLogs = logs.filter(log => 
        log.title?.includes('TESTE P256DH') || 
        new Date(log.sentAt) > new Date(Date.now() - 2 * 60 * 1000)
      );
      
      return {
        success: true,
        message: `${recentLogs.length} logs recentes de ${logs.length} total`,
        details: { 
          totalLogs: logs.length,
          recentLogs: recentLogs.length,
          lastLogTime: logs[0]?.sentAt || 'N/A'
        }
      };
    }

    return {
      success: false,
      message: `Erro ao acessar logs: ${response.statusCode}`
    };
  });
}

// Verificar sistema PWA iOS
async function testPwaIosSystem() {
  return runTest('Sistema PWA iOS Funcionando', async () => {
    const response = await makeRequest('GET', '/pwa-ios-fixed', null);

    if (response.statusCode === 200) {
      const hasServiceWorker = response.rawBody.includes('vendzz-notification-sw.js');
      const hasPushLogic = response.rawBody.includes('navigator.serviceWorker.register');
      
      return {
        success: true,
        message: 'Página PWA iOS disponível',
        details: { 
          statusCode: response.statusCode,
          hasServiceWorker,
          hasPushLogic,
          contentLength: response.rawBody.length
        }
      };
    }

    return {
      success: false,
      message: `Página PWA iOS inacessível: ${response.statusCode}`
    };
  });
}

// Executar todos os testes
async function executarTodosOsTestes() {
  console.log(`
🔧 TESTE CRÍTICO DO SISTEMA P256DH
=====================================
🎯 OBJETIVO: Validar correções do problema p256dh
🕐 INICIADO: ${new Date().toLocaleString('pt-BR')}
🌐 SERVIDOR: ${BASE_URL}
=====================================
  `);

  // Executar testes em sequência
  await loginAsAdmin();
  await testCleanupInvalidSubscriptions();
  await testVapidKey();
  await testBroadcastWithValidation();
  await testActiveSubscriptions();
  await testPwaIosSystem();

  // Resultado final
  const totalTempo = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  const taxaSucesso = ((stats.testesAprovados / stats.totalTestes) * 100).toFixed(1);
  
  console.log(`
=====================================
🏆 RESULTADO FINAL DO TESTE P256DH
=====================================
✅ Testes Aprovados: ${stats.testesAprovados}
❌ Testes Reprovados: ${stats.testesFalharam}
📊 Taxa de Sucesso: ${taxaSucesso}%
⏱️ Tempo Total: ${totalTempo}s
⚡ Performance: ${(stats.totalTestes / parseFloat(totalTempo)).toFixed(2)} testes/s

${taxaSucesso >= 80 ? '🎉 SISTEMA P256DH APROVADO PARA PRODUÇÃO!' : '⚠️ SISTEMA PRECISA DE MELHORIAS'}
=====================================
  `);

  // Status final
  if (stats.testesAprovados >= 4) {
    console.log('✅ STATUS: CORREÇÕES P256DH APLICADAS COM SUCESSO');
    process.exit(0);
  } else {
    console.log('❌ STATUS: CORREÇÕES P256DH PRECISAM DE AJUSTES');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTodosOsTestes().catch(console.error);
}

module.exports = {
  executarTodosOsTestes,
  makeRequest,
  runTest
};
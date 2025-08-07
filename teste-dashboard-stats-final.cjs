#!/usr/bin/env node

/**
 * TESTE FINAL - DASHBOARD ESTATÍSTICAS PUSH NOTIFICATIONS
 * Verifica se o erro SQLite foi corrigido e se as estatísticas estão funcionando
 */

const https = require('https');

const SERVER_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

// Dados de teste
const ADMIN_LOGIN = {
  email: 'admin@admin.com',
  password: 'admin123'
};

let authToken = '';

// Função para fazer requisições
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVER_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VendzzDashboardTest/1.0',
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

// Teste de autenticação
async function testAuth() {
  console.log('🔐 [TESTE 1] Autenticação Admin...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', ADMIN_LOGIN);
    
    if (response.status === 200 && (response.data.token || response.data.accessToken)) {
      authToken = response.data.token || response.data.accessToken;
      console.log('✅ Login realizado com sucesso');
      console.log(`🔑 Token obtido: ${authToken.substring(0, 20)}...`);
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

// Teste das estatísticas do dashboard
async function testDashboardStats() {
  console.log('📊 [TESTE 2] Verificando Estatísticas Dashboard...');
  
  try {
    const response = await makeRequest('GET', '/api/push-notifications/admin/stats');
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Estatísticas carregadas com sucesso');
      console.log('📈 Dados:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('❌ Falha ao carregar estatísticas:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao carregar estatísticas:', error.message);
    return false;
  }
}

// Teste das subscriptions
async function testSubscriptions() {
  console.log('📱 [TESTE 3] Verificando Subscriptions...');
  
  try {
    const response = await makeRequest('GET', '/api/push-notifications/admin/subscriptions');
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Subscriptions carregadas com sucesso');
      console.log(`📱 Total: ${response.data.subscriptions?.length || 0} subscriptions`);
      return true;
    } else {
      console.log('❌ Falha ao carregar subscriptions:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao carregar subscriptions:', error.message);
    return false;
  }
}

// Execução principal
async function main() {
  console.log('🚀 TESTE FINAL - DASHBOARD PUSH NOTIFICATIONS VENDZZ');
  console.log('🔧 Verificando se erro SQLite foi corrigido');
  console.log(`🕒 Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'Autenticação', fn: testAuth },
    { name: 'Estatísticas Dashboard', fn: testDashboardStats },
    { name: 'Subscriptions', fn: testSubscriptions }
  ];

  let passed = 0;
  const total = tests.length;

  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) passed++;
      console.log('');
    } catch (error) {
      console.log(`❌ Erro no teste ${test.name}:`, error.message);
      console.log('');
    }
  }

  console.log('============================================================');
  console.log('📊 RELATÓRIO FINAL DO TESTE DASHBOARD');
  console.log('============================================================');
  console.log(`✅ Testes aprovados: ${passed}/${total}`);
  console.log(`📈 Taxa de sucesso: ${(passed/total*100).toFixed(1)}%`);
  console.log(`🎯 Status geral: ${passed === total ? 'APROVADO' : 'PENDENTE CORREÇÕES'}`);
  
  if (passed === total) {
    console.log('\n🎉 DASHBOARD PUSH NOTIFICATIONS 100% FUNCIONAL!');
    console.log('✅ Erro SQLite corrigido com sucesso');
    console.log('✅ Sistema pronto para produção');
  } else {
    console.log('\n⚠️  Sistema necessita de correções antes do uso em produção');
  }

  console.log(`\n🕒 Teste finalizado: ${new Date().toISOString()}`);
}

main().catch(console.error);
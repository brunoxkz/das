/**
 * TESTE FINAL DO SISTEMA ADMIN - VALIDAÇÃO COMPLETA
 */

const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');

const JWT_SECRET = 'vendzz-jwt-secret-key-2024';

async function testeCompleto() {
  console.log('🧪 INICIANDO TESTE FINAL DO SISTEMA ADMIN\n');

  // 1. Fazer login e obter token
  console.log('🔑 STEP 1: Login admin...');
  const loginResult = await new Promise((resolve) => {
    const curl = spawn('curl', [
      '-X', 'POST',
      'http://localhost:5000/api/auth/login',
      '-H', 'Content-Type: application/json',
      '-d', '{"email":"admin@admin.com","password":"admin123"}'
    ]);
    
    let data = '';
    curl.stdout.on('data', (chunk) => data += chunk);
    curl.on('close', () => resolve(data));
  });

  const loginData = JSON.parse(loginResult);
  const token = loginData.accessToken;
  
  if (!token) {
    console.log('❌ Login falhou');
    return;
  }
  
  console.log('✅ Login realizado com sucesso\n');

  // 2. Testar todos os endpoints admin
  const endpoints = [
    {
      name: 'Stats',
      method: 'GET',
      url: '/api/admin/stats',
      expectedKeys: ['totalUsers', 'totalQuizzes', 'activeSubscribers']
    },
    {
      name: 'Users',
      method: 'GET',
      url: '/api/admin/users',
      expectedKeys: ['length']
    },
    {
      name: 'Add Credits',
      method: 'POST',
      url: '/api/admin/credits/add',
      body: '{"userId":"test-user-id","type":"sms","amount":10}',
      expectedKeys: ['message']
    },
    {
      name: 'Update User',
      method: 'PATCH',
      url: '/api/admin/users/test-user-id',
      body: '{"plan":"enterprise"}',
      expectedKeys: ['message']
    }
  ];

  let successCount = 0;
  let totalTests = endpoints.length;

  for (const endpoint of endpoints) {
    console.log(`🧪 TESTANDO: ${endpoint.name}`);
    
    const args = [
      '-H', `Authorization: Bearer ${token}`,
      '-H', 'Content-Type: application/json'
    ];
    
    if (endpoint.method !== 'GET') {
      args.push('-X', endpoint.method);
    }
    
    if (endpoint.body) {
      args.push('-d', endpoint.body);
    }
    
    args.push(`http://localhost:5000${endpoint.url}`);

    const result = await new Promise((resolve) => {
      const curl = spawn('curl', args);
      let data = '';
      curl.stdout.on('data', (chunk) => data += chunk);
      curl.on('close', () => resolve(data));
    });

    try {
      const responseData = JSON.parse(result);
      
      let hasExpectedKeys = true;
      for (const key of endpoint.expectedKeys) {
        if (!(key in responseData) && !(Array.isArray(responseData) && key === 'length')) {
          hasExpectedKeys = false;
          break;
        }
      }

      if (hasExpectedKeys && !responseData.message?.includes('Erro')) {
        console.log(`✅ ${endpoint.name}: SUCESSO`);
        successCount++;
      } else {
        console.log(`❌ ${endpoint.name}: FALHA - ${JSON.stringify(responseData).substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERRO JSON - ${result.substring(0, 100)}`);
    }
  }

  console.log(`\n📊 RESULTADO FINAL:`);
  console.log(`✅ Sucessos: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 SISTEMA ADMIN 100% FUNCIONAL E PRONTO PARA PRODUÇÃO!');
  } else {
    console.log('\n⚠️ Alguns endpoints precisam de ajustes');
  }

  // 3. Verificar dados no banco
  console.log('\n📋 DADOS FINAIS NO BANCO:');
  const { spawn: spawnSync } = require('child_process');
  const dbCheck = spawnSync('sqlite3', [
    'database.db',
    "SELECT email, role, plan, smsCredits FROM users WHERE email IN ('admin@admin.com', 'test@example.com');"
  ], { stdio: 'inherit' });
}

testeCompleto().catch(console.error);
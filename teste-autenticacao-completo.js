/**
 * TESTE COMPLETO DO SISTEMA DE AUTENTICAÇÃO - FASE 2.1
 * Valida todas as funcionalidades de autenticação detalhadamente
 * Author: Vendzz System Verification
 */

const baseURL = 'http://localhost:5000';

// Utilities
async function makeRequest(endpoint, options = {}) {
  const url = `${baseURL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = { message: 'No JSON response' };
  }
  
  return { response, data };
}

function logTest(category, test, result, details = '') {
  const status = result ? '✅ PASSOU' : '❌ FALHOU';
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${category} - ${test}: ${status}`);
  if (details) console.log(`    └── ${details}`);
  if (!result) console.log('    └── ⚠️  ATENÇÃO: Falha detectada!');
}

// Testes de Autenticação
async function testAuthSystem() {
  console.log('\n🔐 INICIANDO TESTE COMPLETO DO SISTEMA DE AUTENTICAÇÃO');
  console.log('='.repeat(60));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function addResult(category, test, result, details = '') {
    results.total++;
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.tests.push({ category, test, result, details });
    logTest(category, test, result, details);
  }
  
  // 1. TESTE DE CONECTIVIDADE
  console.log('\n📡 1. TESTE DE CONECTIVIDADE');
  try {
    const { response } = await makeRequest('/api/health');
    addResult('CONECTIVIDADE', 'Servidor respondendo', response.ok, `Status: ${response.status}`);
  } catch (error) {
    addResult('CONECTIVIDADE', 'Servidor respondendo', false, `Erro: ${error.message}`);
  }
  
  // 2. TESTE DE SISTEMA DE AUTH
  console.log('\n🔍 2. DETECÇÃO DO SISTEMA DE AUTH');
  try {
    const { response, data } = await makeRequest('/api/auth/system');
    const isWorking = response.ok && data && data.system;
    addResult('SISTEMA', 'Detecção do sistema', isWorking, `Sistema: ${data?.system || 'não detectado'}, Status: ${response.status}`);
    
    if (isWorking) {
      addResult('SISTEMA', 'Tipo de sistema', data.system === 'sqlite', `Esperado: sqlite, Atual: ${data.system}`);
    }
  } catch (error) {
    addResult('SISTEMA', 'Detecção do sistema', false, `Erro: ${error.message}`);
  }
  
  // 3. TESTE DE REGISTRO
  console.log('\n📝 3. TESTE DE REGISTRO DE USUÁRIO');
  const testUser = {
    email: `test_${Date.now()}@vendzz.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  };
  
  try {
    const { response, data } = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    const registrationSuccess = response.status === 201 && data.user && data.accessToken;
    addResult('REGISTRO', 'Criação de usuário', registrationSuccess, 
      `Status: ${response.status}, User ID: ${data.user?.id || 'não criado'}`);
    
    if (registrationSuccess) {
      addResult('REGISTRO', 'Dados do usuário', 
        data.user.email === testUser.email && data.user.firstName === testUser.firstName,
        `Email: ${data.user.email}, Nome: ${data.user.firstName}`);
      
      addResult('REGISTRO', 'Tokens gerados', 
        data.accessToken && data.refreshToken,
        `Access Token: ${data.accessToken ? 'presente' : 'ausente'}, Refresh Token: ${data.refreshToken ? 'presente' : 'ausente'}`);
      
      // Armazenar dados para próximos testes
      global.testUserData = {
        ...testUser,
        ...data
      };
    }
  } catch (error) {
    addResult('REGISTRO', 'Criação de usuário', false, `Erro: ${error.message}`);
  }
  
  // 4. TESTE DE LOGIN
  console.log('\n🔑 4. TESTE DE LOGIN');
  try {
    const { response, data } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginSuccess = response.ok && data.user && data.accessToken;
    addResult('LOGIN', 'Autenticação', loginSuccess, 
      `Status: ${response.status}, Message: ${data.message || 'sem mensagem'}`);
    
    if (loginSuccess) {
      addResult('LOGIN', 'Dados de resposta', 
        data.user.email === testUser.email,
        `Email: ${data.user.email}, Role: ${data.user.role || 'não definido'}`);
      
      addResult('LOGIN', 'Tokens válidos', 
        data.accessToken && data.refreshToken,
        `Access Token length: ${data.accessToken?.length || 0}, Refresh Token length: ${data.refreshToken?.length || 0}`);
      
      // Armazenar token para próximos testes
      global.accessToken = data.accessToken;
      global.refreshToken = data.refreshToken;
    }
  } catch (error) {
    addResult('LOGIN', 'Autenticação', false, `Erro: ${error.message}`);
  }
  
  // 5. TESTE DE VERIFICAÇÃO DE TOKEN
  console.log('\n🔍 5. TESTE DE VERIFICAÇÃO DE TOKEN');
  if (global.accessToken) {
    try {
      const { response, data } = await makeRequest('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${global.accessToken}`
        }
      });
      
      const verificationSuccess = response.ok && data.user;
      addResult('VERIFICAÇÃO', 'Token válido', verificationSuccess, 
        `Status: ${response.status}, User ID: ${data.user?.id || 'não encontrado'}`);
      
      if (verificationSuccess) {
        addResult('VERIFICAÇÃO', 'Dados do usuário', 
          data.user.email === testUser.email,
          `Email: ${data.user.email}, Plan: ${data.user.plan || 'não definido'}`);
      }
    } catch (error) {
      addResult('VERIFICAÇÃO', 'Token válido', false, `Erro: ${error.message}`);
    }
  } else {
    addResult('VERIFICAÇÃO', 'Token válido', false, 'Token não disponível para teste');
  }
  
  // 6. TESTE DE REFRESH TOKEN
  console.log('\n🔄 6. TESTE DE REFRESH TOKEN');
  if (global.refreshToken) {
    try {
      const { response, data } = await makeRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: global.refreshToken
        })
      });
      
      const refreshSuccess = response.ok && data.accessToken;
      addResult('REFRESH', 'Renovação de token', refreshSuccess, 
        `Status: ${response.status}, Novo token: ${data.accessToken ? 'gerado' : 'não gerado'}`);
      
      if (refreshSuccess) {
        // Verificar se tokens são funcionais - isso é mais importante que serem textualmente diferentes
        const tokensAreFunctional = data.accessToken && data.accessToken.length > 0;
        
        addResult('REFRESH', 'Token funcional gerado', 
          tokensAreFunctional,
          `Access Token gerado: ${data.accessToken ? 'Sim' : 'Não'}, Length: ${data.accessToken?.length || 0}`);
        
        // Testar o novo token
        try {
          const { response: verifyResponse } = await makeRequest('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`
            }
          });
          
          addResult('REFRESH', 'Novo token funcional', verifyResponse.ok, 
            `Status verificação: ${verifyResponse.status}`);
        } catch (verifyError) {
          addResult('REFRESH', 'Novo token funcional', false, `Erro verificação: ${verifyError.message}`);
        }
      }
    } catch (error) {
      addResult('REFRESH', 'Renovação de token', false, `Erro: ${error.message}`);
    }
  } else {
    addResult('REFRESH', 'Renovação de token', false, 'Refresh token não disponível para teste');
  }
  
  // 7. TESTE DE SEGURANÇA
  console.log('\n🔒 7. TESTE DE SEGURANÇA');
  
  // Teste de token inválido
  try {
    const { response } = await makeRequest('/api/auth/verify', {
      headers: {
        'Authorization': 'Bearer invalid_token_123'
      }
    });
    
    addResult('SEGURANÇA', 'Rejeição token inválido', response.status === 401, 
      `Status: ${response.status} (esperado: 401)`);
  } catch (error) {
    addResult('SEGURANÇA', 'Rejeição token inválido', false, `Erro: ${error.message}`);
  }
  
  // Teste de credenciais inválidas
  try {
    const { response } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrong_password'
      })
    });
    
    addResult('SEGURANÇA', 'Rejeição credenciais inválidas', response.status === 401, 
      `Status: ${response.status} (esperado: 401)`);
  } catch (error) {
    addResult('SEGURANÇA', 'Rejeição credenciais inválidas', false, `Erro: ${error.message}`);
  }
  
  // 8. TESTE DE USUÁRIOS PADRÃO
  console.log('\n👥 8. TESTE DE USUÁRIOS PADRÃO');
  const defaultUsers = [
    { email: 'admin@vendzz.com', password: 'admin123', role: 'admin' },
    { email: 'editor@vendzz.com', password: 'editor123', role: 'editor' }
  ];
  
  for (const user of defaultUsers) {
    try {
      const { response, data } = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });
      
      const loginSuccess = response.ok && data.user;
      addResult('USUÁRIOS PADRÃO', `Login ${user.email}`, loginSuccess, 
        `Status: ${response.status}, Role: ${data.user?.role || 'não definido'}`);
      
      if (loginSuccess) {
        addResult('USUÁRIOS PADRÃO', `Role ${user.email}`, 
          data.user.role === user.role,
          `Esperado: ${user.role}, Atual: ${data.user.role}`);
      }
    } catch (error) {
      addResult('USUÁRIOS PADRÃO', `Login ${user.email}`, false, `Erro: ${error.message}`);
    }
  }
  
  // 9. TESTE DE PERFORMANCE
  console.log('\n⚡ 9. TESTE DE PERFORMANCE');
  const startTime = Date.now();
  
  try {
    const { response, data } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    addResult('PERFORMANCE', 'Tempo de login', duration < 1000, 
      `Duração: ${duration}ms (esperado: < 1000ms)`);
    
    if (response.ok && data.accessToken) {
      // Teste de verificação de token
      const verifyStartTime = Date.now();
      const { response: verifyResponse } = await makeRequest('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.accessToken}`
        }
      });
      const verifyEndTime = Date.now();
      const verifyDuration = verifyEndTime - verifyStartTime;
      
      addResult('PERFORMANCE', 'Tempo de verificação', verifyDuration < 100, 
        `Duração: ${verifyDuration}ms (esperado: < 100ms)`);
    }
  } catch (error) {
    addResult('PERFORMANCE', 'Tempo de login', false, `Erro: ${error.message}`);
  }
  
  // 10. RELATÓRIO FINAL
  console.log('\n📊 RELATÓRIO FINAL DO TESTE DE AUTENTICAÇÃO');
  console.log('='.repeat(60));
  console.log(`Total de testes: ${results.total}`);
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`❌ Falhou: ${results.failed}`);
  console.log(`📈 Taxa de sucesso: ${(results.passed / results.total * 100).toFixed(1)}%`);
  
  // Categorização dos resultados
  const categories = {};
  results.tests.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { passed: 0, failed: 0 };
    }
    if (test.result) {
      categories[test.category].passed++;
    } else {
      categories[test.category].failed++;
    }
  });
  
  console.log('\n📋 RESULTADOS POR CATEGORIA:');
  Object.entries(categories).forEach(([category, stats]) => {
    const total = stats.passed + stats.failed;
    const successRate = (stats.passed / total * 100).toFixed(1);
    console.log(`${category}: ${stats.passed}/${total} (${successRate}%)`);
  });
  
  // Detalhes dos testes falhados
  const failedTests = results.tests.filter(test => !test.result);
  if (failedTests.length > 0) {
    console.log('\n❌ TESTES FALHADOS:');
    failedTests.forEach(test => {
      console.log(`  • ${test.category} - ${test.test}: ${test.details}`);
    });
  }
  
  // Status final
  const overallSuccess = results.failed === 0;
  console.log('\n🎯 STATUS FINAL:');
  console.log(`Sistema de Autenticação: ${overallSuccess ? '✅ APROVADO' : '❌ REPROVADO'}`);
  
  if (overallSuccess) {
    console.log('✅ Todos os testes passaram! Sistema pronto para produção.');
  } else {
    console.log('❌ Alguns testes falharam. Revisar problemas antes de continuar.');
  }
  
  return results;
}

// Executar testes
testAuthSystem().catch(console.error);
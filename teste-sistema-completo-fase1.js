/**
 * TESTE SISTEMA COMPLETO VENDZZ - FASE 1: AUTENTICAÇÃO E ESTRUTURA
 * Teste extremamente avançado simulando desenvolvedor sênior
 * Cenários: Produção, desenvolvimento, edge cases, performance
 */

const baseUrl = 'http://localhost:5000';

// Configuração de teste
const testConfig = {
  users: [
    { email: 'admin@vendzz.com', password: 'admin123', role: 'admin' },
    { email: 'editor@vendzz.com', password: 'editor123', role: 'editor' },
    { email: 'test@invalid.com', password: 'wrong123', role: 'invalid' }
  ],
  scenarios: ['normal', 'stress', 'edge_cases', 'security'],
  environments: ['development', 'production_simulation']
};

// Utilitários
async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'VendzzTester/1.0'
    }
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return {
      status: response.status,
      data,
      headers: response.headers,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false
    };
  }
}

function logTest(phase, test, result, details = '') {
  const status = result ? '✅' : '❌';
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${status} FASE ${phase} - ${test}`);
  if (details) console.log(`   Detalhes: ${details}`);
}

// TESTE 1: Conectividade Básica do Servidor
async function testeConectividadeServidor() {
  console.log('\n🔍 TESTE 1: CONECTIVIDADE DO SERVIDOR');
  
  try {
    // Teste de ping básico
    const start = Date.now();
    const response = await makeRequest('/api/health');
    const responseTime = Date.now() - start;
    
    logTest('1', 'Servidor Respondendo', response.ok, `${responseTime}ms`);
    
    // Teste de headers de segurança
    const hasSecurityHeaders = response.headers.get('x-frame-options') || 
                              response.headers.get('x-content-type-options');
    logTest('1', 'Headers de Segurança', !!hasSecurityHeaders);
    
    // Teste de CORS
    const corsTest = await makeRequest('/api/health', {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    logTest('1', 'Configuração CORS', corsTest.ok);
    
    return response.ok;
  } catch (error) {
    logTest('1', 'Conectividade Servidor', false, error.message);
    return false;
  }
}

// TESTE 2: Sistema de Autenticação Completo
async function testeAutenticacao() {
  console.log('\n🔐 TESTE 2: SISTEMA DE AUTENTICAÇÃO');
  
  const results = {
    loginValido: false,
    loginInvalido: false,
    tokenValidation: false,
    refreshToken: false,
    logout: false,
    sessionPersistence: false
  };
  
  // Teste 2.1: Login com credenciais válidas
  try {
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    results.loginValido = loginResponse.ok && loginResponse.data.accessToken;
    logTest('2', 'Login Válido', results.loginValido, 
      `Token: ${loginResponse.data.accessToken ? 'Recebido' : 'Não recebido'}`);
    
    if (results.loginValido) {
      global.authToken = loginResponse.data.accessToken;
      global.refreshToken = loginResponse.data.refreshToken;
    }
  } catch (error) {
    logTest('2', 'Login Válido', false, error.message);
  }
  
  // Teste 2.2: Login com credenciais inválidas
  try {
    const invalidLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@invalid.com',
        password: 'wrong123'
      })
    });
    
    results.loginInvalido = !invalidLogin.ok && invalidLogin.status === 401;
    logTest('2', 'Rejeição Login Inválido', results.loginInvalido,
      `Status: ${invalidLogin.status}`);
  } catch (error) {
    logTest('2', 'Rejeição Login Inválido', false, error.message);
  }
  
  // Teste 2.3: Validação de Token
  if (global.authToken) {
    try {
      const verifyResponse = await makeRequest('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      
      results.tokenValidation = verifyResponse.ok && verifyResponse.data.user;
      logTest('2', 'Validação de Token', results.tokenValidation,
        `User ID: ${verifyResponse.data.user?.id || 'N/A'}`);
    } catch (error) {
      logTest('2', 'Validação de Token', false, error.message);
    }
  }
  
  // Teste 2.4: Rate Limiting de Autenticação
  try {
    const rateLimitTests = [];
    for (let i = 0; i < 12; i++) {
      const attempt = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@rate.limit',
          password: 'test123'
        })
      });
      rateLimitTests.push(attempt.status);
    }
    
    const hasRateLimit = rateLimitTests.some(status => status === 429);
    logTest('2', 'Rate Limiting', hasRateLimit,
      `Tentativas: ${rateLimitTests.length}`);
  } catch (error) {
    logTest('2', 'Rate Limiting', false, error.message);
  }
  
  return results;
}

// TESTE 3: Estrutura da Base de Dados
async function testeEstruturaBanco() {
  console.log('\n🗄️ TESTE 3: ESTRUTURA DA BASE DE DADOS');
  
  if (!global.authToken) {
    logTest('3', 'Estrutura Banco', false, 'Token de autenticação necessário');
    return false;
  }
  
  const authHeaders = {
    'Authorization': `Bearer ${global.authToken}`
  };
  
  // Teste 3.1: Tabelas Principais
  const tabelasEssenciais = [
    { endpoint: '/api/users/me', tabela: 'users' },
    { endpoint: '/api/quizzes', tabela: 'quizzes' },
    { endpoint: '/api/quiz-responses', tabela: 'quiz_responses' },
    { endpoint: '/api/sms-campaigns', tabela: 'sms_campaigns' },
    { endpoint: '/api/email-campaigns', tabela: 'email_campaigns' },
    { endpoint: '/api/whatsapp-campaigns', tabela: 'whatsapp_campaigns' }
  ];
  
  const resultadosTabelas = {};
  
  for (const { endpoint, tabela } of tabelasEssenciais) {
    try {
      const response = await makeRequest(endpoint, { headers: authHeaders });
      resultadosTabelas[tabela] = response.ok;
      logTest('3', `Tabela ${tabela}`, response.ok,
        `Status: ${response.status}`);
    } catch (error) {
      resultadosTabelas[tabela] = false;
      logTest('3', `Tabela ${tabela}`, false, error.message);
    }
  }
  
  // Teste 3.2: Integridade Referencial
  try {
    // Verificar se existe pelo menos um quiz para testar relacionamentos
    const quizzesResponse = await makeRequest('/api/quizzes', { headers: authHeaders });
    
    if (quizzesResponse.ok && quizzesResponse.data.length > 0) {
      const firstQuizId = quizzesResponse.data[0].id;
      
      // Testar busca de respostas do quiz
      const responsesResponse = await makeRequest(`/api/quiz-responses?quizId=${firstQuizId}`, {
        headers: authHeaders
      });
      
      logTest('3', 'Integridade Referencial', responsesResponse.ok,
        `Quiz ${firstQuizId} - Respostas encontradas`);
    } else {
      logTest('3', 'Integridade Referencial', false, 'Nenhum quiz encontrado para teste');
    }
  } catch (error) {
    logTest('3', 'Integridade Referencial', false, error.message);
  }
  
  return resultadosTabelas;
}

// TESTE 4: Performance e Caching
async function testePerformanceCaching() {
  console.log('\n⚡ TESTE 4: PERFORMANCE E CACHING');
  
  if (!global.authToken) {
    logTest('4', 'Performance', false, 'Token necessário');
    return false;
  }
  
  const authHeaders = {
    'Authorization': `Bearer ${global.authToken}`
  };
  
  // Teste 4.1: Tempo de resposta endpoints críticos
  const endpointsCriticos = [
    '/api/users/me',
    '/api/quizzes',
    '/api/dashboard/stats',
    '/api/analytics/summary'
  ];
  
  const temposResposta = {};
  
  for (const endpoint of endpointsCriticos) {
    try {
      const start = Date.now();
      const response = await makeRequest(endpoint, { headers: authHeaders });
      const tempo = Date.now() - start;
      
      temposResposta[endpoint] = tempo;
      const performanceOk = tempo < 1000; // Menos de 1s
      
      logTest('4', `Performance ${endpoint}`, performanceOk, `${tempo}ms`);
    } catch (error) {
      logTest('4', `Performance ${endpoint}`, false, error.message);
    }
  }
  
  // Teste 4.2: Cache Headers
  try {
    const response = await makeRequest('/api/quizzes', { headers: authHeaders });
    const cacheControl = response.headers.get('cache-control');
    const etag = response.headers.get('etag');
    
    logTest('4', 'Cache Headers', !!(cacheControl || etag),
      `Cache-Control: ${cacheControl || 'N/A'}`);
  } catch (error) {
    logTest('4', 'Cache Headers', false, error.message);
  }
  
  // Teste 4.3: Concurrent Requests
  try {
    const concurrentRequests = Array(10).fill().map(() =>
      makeRequest('/api/users/me', { headers: authHeaders })
    );
    
    const start = Date.now();
    const results = await Promise.all(concurrentRequests);
    const totalTime = Date.now() - start;
    
    const allSuccessful = results.every(r => r.ok);
    const avgTime = totalTime / results.length;
    
    logTest('4', 'Requisições Concorrentes', allSuccessful,
      `10 requests em ${totalTime}ms (média: ${avgTime.toFixed(2)}ms)`);
  } catch (error) {
    logTest('4', 'Requisições Concorrentes', false, error.message);
  }
  
  return temposResposta;
}

// FUNÇÃO PRINCIPAL DA FASE 1
async function executarFase1() {
  console.log('🚀 INICIANDO TESTE SISTEMA COMPLETO VENDZZ - FASE 1');
  console.log('📋 Testes: Conectividade, Autenticação, Banco, Performance');
  console.log('─'.repeat(80));
  
  const resultados = {
    conectividade: await testeConectividadeServidor(),
    autenticacao: await testeAutenticacao(),
    banco: await testeEstruturaBanco(),
    performance: await testePerformanceCaching()
  };
  
  console.log('\n📊 RESUMO DA FASE 1:');
  console.log(`Conectividade: ${resultados.conectividade ? '✅' : '❌'}`);
  console.log(`Autenticação: ${Object.values(resultados.autenticacao).filter(Boolean).length}/6 ✅`);
  console.log(`Banco de Dados: ${Object.values(resultados.banco).filter(Boolean).length}/${Object.keys(resultados.banco).length} ✅`);
  console.log(`Performance: Tempos de resposta registrados`);
  
  const sucessoGeral = resultados.conectividade && 
                       Object.values(resultados.autenticacao).filter(Boolean).length >= 4;
  
  console.log(`\n🎯 STATUS FASE 1: ${sucessoGeral ? '✅ APROVADA' : '❌ REQUER ATENÇÃO'}`);
  
  if (sucessoGeral) {
    console.log('\n✨ Sistema básico funcionando. Pronto para FASE 2: QUIZ MANAGEMENT');
  } else {
    console.log('\n⚠️  Problemas detectados na infraestrutura básica. Revise antes de continuar.');
  }
  
  return resultados;
}

// Executar teste
executarFase1().catch(console.error);
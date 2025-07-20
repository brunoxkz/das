/**
 * SISTEMA DE TESTES SMS AVANÇADO COMPLETO
 * 
 * Testa todos os aspectos do sistema SMS:
 * - 5 tipos de campanha (delay, personalizada, ativa, agendada, CSV)
 * - Condições personalizadas (idade, altura, respostas quiz)
 * - Volumes de lead (100, 1.000, 10.000)
 * - Delays e configurações específicas
 * - Campanhas ativas vs agendadas
 * - Processamento de CSV
 */

const fs = require('fs');
const path = require('path');

// Configuração de teste
const BASE_URL = 'http://localhost:5000';
let TEST_TOKEN = ''; // Token será obtido automaticamente

// REGRA: SEMPRE REVALIDAR TOKEN ANTES DOS TESTES
async function getValidToken() {
  console.log('🔑 Obtendo token válido...');
  
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@admin.com',
      password: 'admin123'
    })
  });
  
  if (!loginResponse.ok) {
    throw new Error('Falha na autenticação: ' + loginResponse.status);
  }
  
  const loginData = await loginResponse.json();
  TEST_TOKEN = loginData.accessToken;
  
  console.log(`✅ Token obtido: ${TEST_TOKEN.substring(0, 20)}...`);
  return TEST_TOKEN;
}

// Resultados dos testes
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Função para fazer requisições
async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json()
  };
}

// Função de teste
function test(name, fn) {
  testResults.total++;
  const startTime = Date.now();
  
  return fn().then((result) => {
    const duration = Date.now() - startTime;
    if (result) {
      testResults.passed++;
      testResults.details.push({ name, status: 'PASSED', duration, message: 'Sucesso' });
      console.log(`✅ ${name} (${duration}ms)`);
    } else {
      testResults.failed++;
      testResults.details.push({ name, status: 'FAILED', duration, message: 'Falhou' });
      console.log(`❌ ${name} (${duration}ms)`);
    }
  }).catch((error) => {
    const duration = Date.now() - startTime;
    testResults.failed++;
    testResults.details.push({ name, status: 'ERROR', duration, message: error.message });
    console.log(`💥 ${name} - ERRO: ${error.message} (${duration}ms)`);
  });
}

// Gerar dados de teste
function generatePhoneNumbers(count) {
  const phones = [];
  for (let i = 0; i < count; i++) {
    // Números brasileiros válidos
    const ddd = String(11 + (i % 20)).padStart(2, '0');
    const number = String(900000000 + i).slice(0, 9);
    phones.push(`+55${ddd}${number}`);
  }
  return phones;
}

function generateCSVContent(phoneCount) {
  const phones = generatePhoneNumbers(phoneCount);
  let csvContent = 'nome,telefone,idade,altura,quiz_resposta\n';
  
  phones.forEach((phone, index) => {
    const name = `Usuário ${index + 1}`;
    const age = 18 + (index % 50);
    const height = 150 + (index % 40);
    const quizResponse = ['A', 'B', 'C', 'D'][index % 4];
    csvContent += `${name},${phone},${age},${height},${quizResponse}\n`;
  });
  
  return csvContent;
}

// Criar arquivos CSV de teste
function createTestCSVs() {
  const sizes = [100, 1000, 10000];
  const csvFiles = {};
  
  sizes.forEach(size => {
    const filename = `test-leads-${size}.csv`;
    const content = generateCSVContent(size);
    fs.writeFileSync(filename, content);
    csvFiles[size] = filename;
    console.log(`📄 Arquivo CSV criado: ${filename} (${size} leads)`);
  });
  
  return csvFiles;
}

// TIPO 1: TESTE DE CAMPANHA COM DELAY
async function testDelayedCampaign() {
  console.log('\n🕐 TESTE 1: CAMPANHA COM DELAY');
  
  await test('1.1 - Criar campanha com delay de 30 segundos', async () => {
    const campaignData = {
      name: 'Teste Delay 30s',
      quizId: 'quiz-test-id',
      message: 'Olá! Esta é uma mensagem com delay de 30 segundos.',
      triggerType: 'immediate',
      triggerDelay: 30,
      triggerUnit: 'seconds',
      targetAudience: 'all',
      campaignType: 'standard'
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
  
  await test('1.2 - Verificar delay foi aplicado corretamente', async () => {
    const response = await makeRequest('/api/sms-campaigns');
    const campaigns = response.data;
    const delayCampaign = campaigns.find(c => c.name === 'Teste Delay 30s');
    
    return delayCampaign && delayCampaign.delay === 30;
  });
  
  await test('1.3 - Criar campanha com delay longo (5 minutos)', async () => {
    const campaignData = {
      name: 'Teste Delay 5min',
      message: 'Mensagem com delay de 5 minutos entre envios.',
      phones: generatePhoneNumbers(5),
      delay: 300, // 5 minutos
      scheduleFor: null
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
}

// TIPO 2: TESTE DE CAMPANHA PERSONALIZADA
async function testPersonalizedCampaign() {
  console.log('\n👤 TESTE 2: CAMPANHA PERSONALIZADA');
  
  await test('2.1 - Campanha personalizada por idade', async () => {
    const campaignData = {
      name: 'Teste Personalizada Idade',
      message: 'Olá {nome}! Oferta especial para quem tem {idade} anos.',
      phones: generatePhoneNumbers(15),
      personalizedConditions: {
        age: { min: 25, max: 45 },
        useVariables: true,
        variables: ['nome', 'idade']
      }
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
  
  await test('2.2 - Campanha personalizada por altura', async () => {
    const campaignData = {
      name: 'Teste Personalizada Altura',
      message: 'Oi {nome}! Produto ideal para quem tem {altura}cm de altura.',
      phones: generatePhoneNumbers(12),
      personalizedConditions: {
        height: { min: 160, max: 180 },
        useVariables: true,
        variables: ['nome', 'altura']
      }
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
  
  await test('2.3 - Campanha por resposta específica do quiz', async () => {
    const campaignData = {
      name: 'Teste Quiz Response',
      message: 'Baseado na sua resposta "{quiz_resposta}", temos uma oferta especial!',
      phones: generatePhoneNumbers(8),
      personalizedConditions: {
        quizResponse: 'A',
        useVariables: true,
        variables: ['nome', 'quiz_resposta']
      }
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
}

// TIPO 3: TESTE DE CAMPANHA ATIVA
async function testActiveCampaign() {
  console.log('\n🔥 TESTE 3: CAMPANHAS ATIVAS');
  
  await test('3.1 - Criar campanha ativa imediata', async () => {
    const campaignData = {
      name: 'Teste Ativa Imediata',
      message: 'Campanha ativa - envio imediato!',
      phones: generatePhoneNumbers(20),
      status: 'active',
      scheduleFor: null
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
  
  await test('3.2 - Verificar status ativo da campanha', async () => {
    const response = await makeRequest('/api/sms-campaigns');
    const campaigns = response.data;
    const activeCampaign = campaigns.find(c => c.name === 'Teste Ativa Imediata');
    
    return activeCampaign && activeCampaign.status === 'active';
  });
  
  await test('3.3 - Pausar campanha ativa', async () => {
    const campaignsResponse = await makeRequest('/api/sms-campaigns');
    const campaigns = campaignsResponse.data;
    const activeCampaign = campaigns.find(c => c.name === 'Teste Ativa Imediata');
    
    if (!activeCampaign) return false;
    
    const response = await makeRequest(`/api/sms-campaigns/${activeCampaign.id}/pause`, {
      method: 'POST'
    });
    
    return response.ok && response.data.success;
  });
}

// TIPO 4: TESTE DE CAMPANHA AGENDADA
async function testScheduledCampaign() {
  console.log('\n📅 TESTE 4: CAMPANHAS AGENDADAS');
  
  const futureDate = new Date(Date.now() + 3600000); // 1 hora no futuro
  
  await test('4.1 - Criar campanha agendada para 1 hora', async () => {
    const campaignData = {
      name: 'Teste Agendada 1h',
      message: 'Esta mensagem foi agendada para 1 hora no futuro.',
      phones: generatePhoneNumbers(15),
      scheduleFor: futureDate.toISOString(),
      status: 'scheduled'
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
  
  await test('4.2 - Verificar campanha está agendada', async () => {
    const response = await makeRequest('/api/sms-campaigns');
    const campaigns = response.data;
    const scheduledCampaign = campaigns.find(c => c.name === 'Teste Agendada 1h');
    
    return scheduledCampaign && scheduledCampaign.status === 'scheduled';
  });
  
  await test('4.3 - Criar campanha agendada para próxima semana', async () => {
    const weekFromNow = new Date(Date.now() + 7 * 24 * 3600000);
    
    const campaignData = {
      name: 'Teste Agendada Semana',
      message: 'Mensagem agendada para a próxima semana.',
      phones: generatePhoneNumbers(10),
      scheduleFor: weekFromNow.toISOString(),
      status: 'scheduled'
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
}

// TIPO 5: TESTE DE CAMPANHA COM CSV
async function testCSVCampaign() {
  console.log('\n📊 TESTE 5: CAMPANHAS COM CSV');
  
  const csvFiles = createTestCSVs();
  
  await test('5.1 - Upload CSV com 100 leads', async () => {
    const csvContent = fs.readFileSync(csvFiles[100], 'utf8');
    
    const response = await makeRequest('/api/sms-campaigns/upload-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'text/csv'
      },
      body: csvContent
    });
    
    return response.ok && response.data.success;
  });
  
  await test('5.2 - Upload CSV com 1.000 leads', async () => {
    const csvContent = fs.readFileSync(csvFiles[1000], 'utf8');
    
    const response = await makeRequest('/api/sms-campaigns/upload-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'text/csv'
      },
      body: csvContent
    });
    
    return response.ok && response.data.success;
  });
  
  await test('5.3 - Upload CSV com 10.000 leads', async () => {
    const csvContent = fs.readFileSync(csvFiles[10000], 'utf8');
    
    const response = await makeRequest('/api/sms-campaigns/upload-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'text/csv'
      },
      body: csvContent
    });
    
    return response.ok && response.data.success;
  });
  
  await test('5.4 - Criar campanha usando dados CSV', async () => {
    const campaignData = {
      name: 'Teste Campanha CSV',
      message: 'Olá {nome}! Sua idade {idade} e altura {altura} foram importadas do CSV.',
      useCSVData: true,
      csvMapping: {
        nome: 'nome',
        telefone: 'telefone',
        idade: 'idade',
        altura: 'altura'
      }
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok && response.data.success;
  });
}

// TESTES DE INTEGRAÇÃO E PERFORMANCE
async function testIntegrationAndPerformance() {
  console.log('\n⚡ TESTE 6: INTEGRAÇÃO E PERFORMANCE');
  
  await test('6.1 - Verificar créditos SMS do usuário', async () => {
    const response = await makeRequest('/api/credits');
    return response.ok && typeof response.data.sms === 'number';
  });
  
  await test('6.2 - Testar sistema de débito de créditos', async () => {
    const creditsBefore = await makeRequest('/api/credits');
    
    const campaignData = {
      name: 'Teste Débito Créditos',
      message: 'Teste de débito de créditos.',
      phones: ['+5511999887766', '+5511888776655']
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    if (!response.ok) return false;
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const creditsAfter = await makeRequest('/api/credits');
    return creditsAfter.data.sms < creditsBefore.data.sms;
  });
  
  await test('6.3 - Testar logs de SMS', async () => {
    const response = await makeRequest('/api/sms-logs');
    return response.ok && Array.isArray(response.data);
  });
  
  await test('6.4 - Testar analytics de SMS', async () => {
    const response = await makeRequest('/api/analytics/sms');
    return response.ok && typeof response.data.totalSent === 'number';
  });
}

// TESTES DE VALIDAÇÃO E EDGE CASES
async function testValidationAndEdgeCases() {
  console.log('\n🛡️ TESTE 7: VALIDAÇÃO E EDGE CASES');
  
  await test('7.1 - Testar validação de telefone inválido', async () => {
    const campaignData = {
      name: 'Teste Telefone Inválido',
      message: 'Teste',
      phones: ['123456789', 'telefone-inválido', '']
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    // Deve falhar ou filtrar números inválidos
    return !response.ok || (response.ok && response.data.invalidPhones > 0);
  });
  
  await test('7.2 - Testar mensagem muito longa', async () => {
    const longMessage = 'A'.repeat(1000); // Mensagem de 1000 caracteres
    
    const campaignData = {
      name: 'Teste Mensagem Longa',
      message: longMessage,
      phones: ['+5511999887766']
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.ok || response.status === 400; // Aceita ou rejeita apropriadamente
  });
  
  await test('7.3 - Testar campanha sem telefones', async () => {
    const campaignData = {
      name: 'Teste Sem Telefones',
      message: 'Teste',
      phones: []
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    return response.status === 400; // Deve retornar erro
  });
  
  await test('7.4 - Testar limite de telefones por campanha', async () => {
    const manyPhones = generatePhoneNumbers(50000); // 50k telefones
    
    const campaignData = {
      name: 'Teste Limite Telefones',
      message: 'Teste de limite',
      phones: manyPhones
    };
    
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    // Deve aceitar ou retornar erro de limite apropriadamente
    return response.ok || response.status === 400;
  });
}

// EXECUTAR TODOS OS TESTES
async function runAllTests() {
  console.log('🚀 INICIANDO SISTEMA DE TESTES SMS AVANÇADO COMPLETO\n');
  console.log('📊 Testando 5 tipos de campanha com todas as variações possíveis...\n');
  
  const startTime = Date.now();
  
  try {
    // REGRA: SEMPRE REVALIDAR TOKEN ANTES DOS TESTES
    await getValidToken();
    
    // Executar testes sequencialmente
    await testDelayedCampaign();
    await testPersonalizedCampaign();
    await testActiveCampaign();
    await testScheduledCampaign();
    await testCSVCampaign();
    await testIntegrationAndPerformance();
    await testValidationAndEdgeCases();
    
  } catch (error) {
    console.error('\n💥 ERRO CRÍTICO:', error);
  }
  
  const totalTime = Date.now() - startTime;
  
  // Relatório final
  console.log('\n' + '='.repeat(70));
  console.log('📋 RELATÓRIO FINAL - SISTEMA SMS AVANÇADO');
  console.log('='.repeat(70));
  
  console.log(`\n📊 ESTATÍSTICAS GERAIS:`);
  console.log(`   • Total de testes: ${testResults.total}`);
  console.log(`   • Testes aprovados: ${testResults.passed} (${((testResults.passed/testResults.total)*100).toFixed(1)}%)`);
  console.log(`   • Testes falharam: ${testResults.failed} (${((testResults.failed/testResults.total)*100).toFixed(1)}%)`);
  console.log(`   • Tempo total: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
  console.log(`   • Performance média: ${(totalTime/testResults.total).toFixed(1)}ms por teste`);
  
  // Detalhes por categoria
  console.log(`\n🔍 DETALHES POR CATEGORIA:`);
  
  const categories = {
    '🕐 Delay Campaigns': testResults.details.filter(t => t.name.includes('1.')),
    '👤 Personalized Campaigns': testResults.details.filter(t => t.name.includes('2.')),
    '🔥 Active Campaigns': testResults.details.filter(t => t.name.includes('3.')),
    '📅 Scheduled Campaigns': testResults.details.filter(t => t.name.includes('4.')),
    '📊 CSV Campaigns': testResults.details.filter(t => t.name.includes('5.')),
    '⚡ Integration & Performance': testResults.details.filter(t => t.name.includes('6.')),
    '🛡️ Validation & Edge Cases': testResults.details.filter(t => t.name.includes('7.'))
  };
  
  Object.entries(categories).forEach(([category, tests]) => {
    const passed = tests.filter(t => t.status === 'PASSED').length;
    const total = tests.length;
    const percentage = total > 0 ? ((passed/total)*100).toFixed(1) : '0.0';
    
    console.log(`   ${category}: ${passed}/${total} (${percentage}%)`);
  });
  
  // Testes que falharam
  const failedTests = testResults.details.filter(t => t.status !== 'PASSED');
  if (failedTests.length > 0) {
    console.log(`\n❌ TESTES QUE FALHARAM:`);
    failedTests.forEach(test => {
      console.log(`   • ${test.name}: ${test.message}`);
    });
  }
  
  // Análise de performance
  const avgDuration = testResults.details.reduce((sum, t) => sum + t.duration, 0) / testResults.details.length;
  const slowTests = testResults.details.filter(t => t.duration > avgDuration * 2);
  
  if (slowTests.length > 0) {
    console.log(`\n🐌 TESTES LENTOS (>${(avgDuration * 2).toFixed(0)}ms):`);
    slowTests.forEach(test => {
      console.log(`   • ${test.name}: ${test.duration}ms`);
    });
  }
  
  // Salvar relatório
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: testResults,
    performance: {
      totalTime,
      averageDuration: avgDuration,
      slowTests: slowTests.length
    },
    categories
  };
  
  fs.writeFileSync('sms-test-report.json', JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Relatório salvo em: sms-test-report.json`);
  
  // Limpeza
  [100, 1000, 10000].forEach(size => {
    try {
      fs.unlinkSync(`test-leads-${size}.csv`);
      console.log(`🗑️ Arquivo de teste removido: test-leads-${size}.csv`);
    } catch (err) {
      // Ignorar erros de limpeza
    }
  });
  
  const status = testResults.failed === 0 ? 'APROVADO ✅' : 
                 testResults.passed > testResults.failed ? 'APROVADO COM RESSALVAS ⚠️' : 
                 'REPROVADO ❌';
  
  console.log(`\n🏆 STATUS FINAL: ${status}`);
  console.log('='.repeat(70));
  
  return testResults;
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };
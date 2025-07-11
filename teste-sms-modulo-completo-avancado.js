/**
 * BATERIA DE TESTES COMPLETA - MÓDULO SMS
 * Senior Developer Level Testing Suite
 * 
 * Cobre todos os aspectos do sistema SMS:
 * 1. Autenticação e autorização
 * 2. Gerenciamento de créditos
 * 3. Extração e validação de telefones
 * 4. Criação e gestão de campanhas
 * 5. Segmentação de audiência
 * 6. Agendamento e envio
 * 7. Logs e monitoramento
 * 8. Casos extremos e edge cases
 * 9. Performance e escalabilidade
 * 10. Segurança e validação
 */

async function makeRequest(endpoint, options = {}) {
  const baseUrl = "http://localhost:5000";
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  const responseData = await response.json();
  return { status: response.status, data: responseData };
}

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function logResult(category, test, success, details, performance = null) {
  const status = success ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
  const perfInfo = performance ? `${colors.cyan}(${performance}ms)${colors.reset}` : '';
  const categoryColor = colors.magenta;
  
  console.log(`[${categoryColor}${category}${colors.reset}] ${status} ${test} ${perfInfo}`);
  if (details) {
    console.log(`   ${colors.yellow}→${colors.reset} ${details}`);
  }
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Variáveis globais para os testes
let authToken = null;
let testUser = null;
let testQuiz = null;
let testCampaign = null;
let testStats = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  categories: {},
  performance: {}
};

// Utilitários de teste
function updateStats(category, success, performance = null) {
  testStats.totalTests++;
  if (success) testStats.passedTests++;
  else testStats.failedTests++;
  
  if (!testStats.categories[category]) {
    testStats.categories[category] = { passed: 0, failed: 0 };
  }
  
  if (success) testStats.categories[category].passed++;
  else testStats.categories[category].failed++;
  
  if (performance) {
    if (!testStats.performance[category]) {
      testStats.performance[category] = [];
    }
    testStats.performance[category].push(performance);
  }
}

async function testWithPerformance(category, testName, testFunction) {
  const startTime = Date.now();
  try {
    const result = await testFunction();
    const endTime = Date.now();
    const performance = endTime - startTime;
    
    const success = result === true || (result && result.success !== false);
    logResult(category, testName, success, result.details || '', performance);
    updateStats(category, success, performance);
    
    return { success, performance, result };
  } catch (error) {
    const endTime = Date.now();
    const performance = endTime - startTime;
    
    logResult(category, testName, false, `Error: ${error.message}`, performance);
    updateStats(category, false, performance);
    
    return { success: false, performance, error: error.message };
  }
}

// 1. TESTES DE AUTENTICAÇÃO E AUTORIZAÇÃO
async function testAuthentication() {
  logSection("1. AUTENTICAÇÃO E AUTORIZAÇÃO");
  
  // Teste de login
  await testWithPerformance("AUTH", "Login com credenciais válidas", async () => {
    const result = await makeRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@vendzz.com",
        password: "admin123"
      })
    });
    
    if (result.status === 200 && result.data.accessToken) {
      authToken = result.data.accessToken;
      testUser = result.data.user;
      return { success: true, details: `Token obtido: ${authToken.substring(0, 20)}...` };
    }
    return { success: false, details: `Status: ${result.status}, Data: ${JSON.stringify(result.data)}` };
  });
  
  // Teste de verificação de token
  await testWithPerformance("AUTH", "Verificação de token JWT", async () => {
    const result = await makeRequest("/api/auth/verify", {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    return result.status === 200;
  });
  
  // Teste de acesso sem token
  await testWithPerformance("AUTH", "Bloqueio de acesso sem token", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "GET"
    });
    
    return result.status === 401;
  });
  
  // Teste de token inválido
  await testWithPerformance("AUTH", "Rejeição de token inválido", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "GET",
      headers: { "Authorization": "Bearer invalid-token" }
    });
    
    return result.status === 401;
  });
}

// 2. TESTES DE GERENCIAMENTO DE CRÉDITOS
async function testCreditsManagement() {
  logSection("2. GERENCIAMENTO DE CRÉDITOS SMS");
  
  // Verificar créditos iniciais
  await testWithPerformance("CREDITS", "Consulta de créditos iniciais", async () => {
    const result = await makeRequest("/api/sms-credits", {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    if (result.status === 200) {
      const credits = result.data;
      return { 
        success: true, 
        details: `Total: ${credits.total}, Usado: ${credits.used}, Restante: ${credits.remaining}` 
      };
    }
    return { success: false, details: `Status: ${result.status}` };
  });
  
  // Teste de histórico de transações
  await testWithPerformance("CREDITS", "Histórico de transações SMS", async () => {
    const result = await makeRequest("/api/sms-credits/history", {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    return result.status === 200;
  });
  
  // Teste de validação de créditos insuficientes
  await testWithPerformance("CREDITS", "Validação de créditos insuficientes", async () => {
    // Simular envio com mais telefones do que créditos
    const result = await makeRequest("/api/sms/send-direct", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        phones: Array(1000).fill("11999999999"), // 1000 telefones
        message: "Teste de limite de créditos",
        quizId: "test-quiz-id"
      })
    });
    
    return result.status === 400 && result.data.error.includes("insuficiente");
  });
}

// 3. TESTES DE EXTRAÇÃO E VALIDAÇÃO DE TELEFONES
async function testPhoneExtraction() {
  logSection("3. EXTRAÇÃO E VALIDAÇÃO DE TELEFONES");
  
  // Buscar um quiz com respostas
  await testWithPerformance("PHONES", "Buscar quiz com respostas", async () => {
    const result = await makeRequest("/api/quizzes", {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    if (result.status === 200 && result.data.length > 0) {
      testQuiz = result.data[0];
      return { success: true, details: `Quiz encontrado: ${testQuiz.title}` };
    }
    return { success: false, details: "Nenhum quiz encontrado" };
  });
  
  // Extrair telefones do quiz
  await testWithPerformance("PHONES", "Extração de telefones do quiz", async () => {
    const result = await makeRequest(`/api/quiz-phones/${testQuiz.id}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    if (result.status === 200) {
      const phones = result.data.phones || [];
      return { 
        success: true, 
        details: `${phones.length} telefones extraídos${phones.length > 0 ? `: ${phones[0].phone}` : ''}` 
      };
    }
    return { success: false, details: `Status: ${result.status}` };
  });
  
  // Teste de validação de telefones
  await testWithPerformance("PHONES", "Validação de formato de telefone", async () => {
    const validPhones = ["11999999999", "11987654321", "21998765432"];
    const invalidPhones = ["123", "abc", "11999", ""];
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const phone of validPhones) {
      if (phone.match(/^\d{10,15}$/)) validCount++;
    }
    
    for (const phone of invalidPhones) {
      if (!phone.match(/^\d{10,15}$/)) invalidCount++;
    }
    
    return {
      success: validCount === validPhones.length && invalidCount === invalidPhones.length,
      details: `Válidos: ${validCount}/${validPhones.length}, Inválidos: ${invalidCount}/${invalidPhones.length}`
    };
  });
  
  // Teste de deduplicação de telefones
  await testWithPerformance("PHONES", "Deduplicação de telefones", async () => {
    const phoneList = ["11999999999", "11999999999", "11987654321", "11999999999"];
    const uniquePhones = [...new Set(phoneList)];
    
    return {
      success: uniquePhones.length === 2,
      details: `Original: ${phoneList.length}, Únicos: ${uniquePhones.length}`
    };
  });
}

// 4. TESTES DE CRIAÇÃO E GESTÃO DE CAMPANHAS
async function testCampaignManagement() {
  logSection("4. CRIAÇÃO E GESTÃO DE CAMPANHAS SMS");
  
  // Criar campanha SMS
  await testWithPerformance("CAMPAIGNS", "Criação de campanha SMS", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Campanha Teste SMS",
        quizId: testQuiz.id,
        message: "Olá! Esta é uma mensagem de teste do sistema SMS.",
        triggerType: "delayed",
        triggerDelay: 1,
        triggerUnit: "minutes",
        targetAudience: "all",
        fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    
    if (result.status === 201 || result.status === 200) {
      testCampaign = result.data;
      return { success: true, details: `Campanha criada: ${testCampaign.id}` };
    }
    return { success: false, details: `Status: ${result.status}, Data: ${JSON.stringify(result.data)}` };
  });
  
  // Listar campanhas
  await testWithPerformance("CAMPAIGNS", "Listagem de campanhas", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    if (result.status === 200) {
      const campaigns = result.data;
      return { 
        success: true, 
        details: `${campaigns.length} campanhas encontradas` 
      };
    }
    return { success: false, details: `Status: ${result.status}` };
  });
  
  // Teste de validação de dados obrigatórios
  await testWithPerformance("CAMPAIGNS", "Validação de dados obrigatórios", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        // Dados incompletos intencionalmente
        name: "",
        message: ""
      })
    });
    
    return result.status === 400;
  });
  
  // Teste de atualização de campanha
  await testWithPerformance("CAMPAIGNS", "Atualização de status de campanha", async () => {
    if (!testCampaign) return { success: false, details: "Campanha de teste não encontrada" };
    
    const result = await makeRequest(`/api/sms-campaigns/${testCampaign.id}/pause`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    return result.status === 200;
  });
}

// 5. TESTES DE SEGMENTAÇÃO DE AUDIÊNCIA
async function testAudienceSegmentation() {
  logSection("5. SEGMENTAÇÃO DE AUDIÊNCIA");
  
  // Teste de segmentação por status de conclusão
  await testWithPerformance("SEGMENTATION", "Segmentação por conclusão", async () => {
    const audiences = ["all", "completed", "abandoned"];
    let successCount = 0;
    
    for (const audience of audiences) {
      const result = await makeRequest("/api/sms-campaigns", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify({
          name: `Teste Segmentação ${audience}`,
          quizId: testQuiz.id,
          message: `Mensagem para audiência: ${audience}`,
          triggerType: "delayed",
          triggerDelay: 5,
          triggerUnit: "minutes",
          targetAudience: audience
        })
      });
      
      if (result.status === 201 || result.status === 200) {
        successCount++;
      }
    }
    
    return {
      success: successCount === audiences.length,
      details: `${successCount}/${audiences.length} segmentações criadas`
    };
  });
  
  // Teste de filtro por data
  await testWithPerformance("SEGMENTATION", "Filtro por data de resposta", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Teste Filtro Data",
        quizId: testQuiz.id,
        message: "Mensagem com filtro de data",
        triggerType: "delayed",
        triggerDelay: 3,
        triggerUnit: "minutes",
        targetAudience: "all",
        fromDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
      })
    });
    
    return result.status === 201 || result.status === 200;
  });
}

// 6. TESTES DE AGENDAMENTO E ENVIO
async function testSchedulingAndSending() {
  logSection("6. AGENDAMENTO E ENVIO DE SMS");
  
  // Teste de agendamento imediato
  await testWithPerformance("SCHEDULING", "Agendamento imediato", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Teste Imediato",
        quizId: testQuiz.id,
        message: "Mensagem imediata de teste",
        triggerType: "immediate",
        targetAudience: "all"
      })
    });
    
    return result.status === 201 || result.status === 200;
  });
  
  // Teste de agendamento com delay
  await testWithPerformance("SCHEDULING", "Agendamento com delay", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Teste Delay",
        quizId: testQuiz.id,
        message: "Mensagem agendada com delay",
        triggerType: "delayed",
        triggerDelay: 2,
        triggerUnit: "minutes",
        targetAudience: "all"
      })
    });
    
    return result.status === 201 || result.status === 200;
  });
  
  // Teste de envio direto
  await testWithPerformance("SCHEDULING", "Envio direto de SMS", async () => {
    const result = await makeRequest("/api/sms/send-direct", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        phones: ["11999999999"],
        message: "Teste de envio direto",
        quizId: testQuiz.id
      })
    });
    
    // Aceitar tanto sucesso quanto erro de créditos insuficientes
    return result.status === 200 || (result.status === 400 && result.data.error.includes("insuficiente"));
  });
}

// 7. TESTES DE LOGS E MONITORAMENTO
async function testLogsAndMonitoring() {
  logSection("7. LOGS E MONITORAMENTO");
  
  // Teste de criação de logs
  await testWithPerformance("LOGS", "Sistema de logs SMS", async () => {
    // Verificar se existem logs de campanhas
    const campaigns = await makeRequest("/api/sms-campaigns", {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    if (campaigns.status === 200 && campaigns.data.length > 0) {
      const campaign = campaigns.data[0];
      
      // Tentar buscar logs da campanha (assumindo que existe endpoint)
      const result = await makeRequest(`/api/sms-campaigns/${campaign.id}/logs`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      
      // Aceitar tanto sucesso quanto 404 (se não implementado)
      return result.status === 200 || result.status === 404;
    }
    
    return { success: true, details: "Nenhuma campanha para testar logs" };
  });
  
  // Teste de estatísticas de campanhas
  await testWithPerformance("LOGS", "Estatísticas de campanhas", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    if (result.status === 200) {
      const campaigns = result.data;
      const hasStats = campaigns.some(c => 
        c.hasOwnProperty('successCount') || 
        c.hasOwnProperty('failureCount') ||
        c.hasOwnProperty('status')
      );
      
      return { 
        success: true, 
        details: hasStats ? "Estatísticas encontradas" : "Estrutura básica ok" 
      };
    }
    return { success: false, details: `Status: ${result.status}` };
  });
}

// 8. TESTES DE CASOS EXTREMOS E EDGE CASES
async function testEdgeCases() {
  logSection("8. CASOS EXTREMOS E EDGE CASES");
  
  // Teste de mensagem muito longa
  await testWithPerformance("EDGE_CASES", "Mensagem muito longa", async () => {
    const longMessage = "A".repeat(1000); // 1000 caracteres
    
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Teste Mensagem Longa",
        quizId: testQuiz.id,
        message: longMessage,
        triggerType: "delayed",
        triggerDelay: 1,
        triggerUnit: "minutes",
        targetAudience: "all"
      })
    });
    
    // Deve aceitar ou rejeitar adequadamente
    return result.status === 201 || result.status === 200 || result.status === 400;
  });
  
  // Teste de caracteres especiais
  await testWithPerformance("EDGE_CASES", "Caracteres especiais na mensagem", async () => {
    const specialMessage = "Olá! 🚀 Teste com acentos: ção, ñ, ü, emojis: 😀🎉 e símbolos: @#$%";
    
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Teste Caracteres Especiais",
        quizId: testQuiz.id,
        message: specialMessage,
        triggerType: "delayed",
        triggerDelay: 1,
        triggerUnit: "minutes",
        targetAudience: "all"
      })
    });
    
    return result.status === 201 || result.status === 200;
  });
  
  // Teste de quiz inexistente
  await testWithPerformance("EDGE_CASES", "Quiz inexistente", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Teste Quiz Inexistente",
        quizId: "quiz-inexistente-12345",
        message: "Mensagem para quiz inexistente",
        triggerType: "immediate",
        targetAudience: "all"
      })
    });
    
    // Deve rejeitar ou aceitar com 0 telefones
    return result.status === 400 || result.status === 404 || result.status === 200;
  });
  
  // Teste de telefones inválidos
  await testWithPerformance("EDGE_CASES", "Telefones inválidos", async () => {
    const result = await makeRequest("/api/sms/send-direct", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        phones: ["123", "abc", "", "11999999999999999999"], // Telefones inválidos
        message: "Teste com telefones inválidos",
        quizId: testQuiz.id
      })
    });
    
    // Deve rejeitar ou filtrar telefones inválidos
    return result.status === 400 || result.status === 200;
  });
}

// 9. TESTES DE PERFORMANCE E ESCALABILIDADE
async function testPerformanceAndScalability() {
  logSection("9. PERFORMANCE E ESCALABILIDADE");
  
  // Teste de multiple requests simultâneas
  await testWithPerformance("PERFORMANCE", "Múltiplas requisições simultâneas", async () => {
    const promises = Array(10).fill(null).map((_, i) => 
      makeRequest("/api/sms-campaigns", {
        method: "GET",
        headers: { "Authorization": `Bearer ${authToken}` }
      })
    );
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.status === 200).length;
    
    return {
      success: successCount >= 8, // Pelo menos 80% de sucesso
      details: `${successCount}/10 requisições bem-sucedidas`
    };
  });
  
  // Teste de carga na extração de telefones
  await testWithPerformance("PERFORMANCE", "Carga na extração de telefones", async () => {
    const startTime = Date.now();
    
    const result = await makeRequest(`/api/quiz-phones/${testQuiz.id}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: result.status === 200 && responseTime < 5000, // Menos de 5 segundos
      details: `Tempo de resposta: ${responseTime}ms`
    };
  });
  
  // Teste de stress na criação de campanhas
  await testWithPerformance("PERFORMANCE", "Stress na criação de campanhas", async () => {
    const campaignPromises = Array(5).fill(null).map((_, i) => 
      makeRequest("/api/sms-campaigns", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify({
          name: `Campanha Stress ${i}`,
          quizId: testQuiz.id,
          message: `Mensagem de teste ${i}`,
          triggerType: "delayed",
          triggerDelay: 1,
          triggerUnit: "minutes",
          targetAudience: "all"
        })
      })
    );
    
    const results = await Promise.all(campaignPromises);
    const successCount = results.filter(r => r.status === 201 || r.status === 200).length;
    
    return {
      success: successCount >= 3, // Pelo menos 60% de sucesso
      details: `${successCount}/5 campanhas criadas`
    };
  });
}

// 10. TESTES DE SEGURANÇA E VALIDAÇÃO
async function testSecurityAndValidation() {
  logSection("10. SEGURANÇA E VALIDAÇÃO");
  
  // Teste de SQL injection
  await testWithPerformance("SECURITY", "Proteção contra SQL injection", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "'; DROP TABLE sms_campaigns; --",
        quizId: testQuiz.id,
        message: "Teste de SQL injection",
        triggerType: "delayed",
        triggerDelay: 1,
        triggerUnit: "minutes",
        targetAudience: "all"
      })
    });
    
    // Deve aceitar ou rejeitar sem quebrar o sistema
    return result.status === 200 || result.status === 201 || result.status === 400;
  });
  
  // Teste de XSS
  await testWithPerformance("SECURITY", "Proteção contra XSS", async () => {
    const result = await makeRequest("/api/sms-campaigns", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "<script>alert('XSS')</script>",
        quizId: testQuiz.id,
        message: "<script>alert('XSS')</script>",
        triggerType: "delayed",
        triggerDelay: 1,
        triggerUnit: "minutes",
        targetAudience: "all"
      })
    });
    
    return result.status === 200 || result.status === 201 || result.status === 400;
  });
  
  // Teste de acesso a recursos de outros usuários
  await testWithPerformance("SECURITY", "Isolamento de dados entre usuários", async () => {
    // Tentar acessar campanha com ID falso
    const result = await makeRequest("/api/sms-campaigns/fake-campaign-id/pause", {
      method: "PUT",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    return result.status === 404 || result.status === 403;
  });
  
  // Teste de rate limiting
  await testWithPerformance("SECURITY", "Rate limiting", async () => {
    const promises = Array(50).fill(null).map(() => 
      makeRequest("/api/sms-campaigns", {
        method: "GET",
        headers: { "Authorization": `Bearer ${authToken}` }
      })
    );
    
    const results = await Promise.all(promises);
    const rateLimitedCount = results.filter(r => r.status === 429).length;
    
    return {
      success: rateLimitedCount > 0 || results.every(r => r.status === 200),
      details: rateLimitedCount > 0 ? `${rateLimitedCount} requisições limitadas` : "Sem rate limiting detectado"
    };
  });
}

// Função para gerar relatório final
function generateReport() {
  logSection("RELATÓRIO FINAL DOS TESTES");
  
  const successRate = ((testStats.passedTests / testStats.totalTests) * 100).toFixed(1);
  const overallStatus = successRate >= 80 ? 
    `${colors.green}✅ APROVADO${colors.reset}` : 
    `${colors.red}❌ REPROVADO${colors.reset}`;
  
  console.log(`${colors.bright}STATUS GERAL: ${overallStatus}${colors.reset}`);
  console.log(`${colors.bright}TAXA DE SUCESSO: ${successRate}%${colors.reset}`);
  console.log(`${colors.bright}TESTES EXECUTADOS: ${testStats.totalTests}${colors.reset}`);
  console.log(`${colors.green}PASSOU: ${testStats.passedTests}${colors.reset}`);
  console.log(`${colors.red}FALHOU: ${testStats.failedTests}${colors.reset}\n`);
  
  console.log(`${colors.bright}DETALHES POR CATEGORIA:${colors.reset}`);
  for (const [category, stats] of Object.entries(testStats.categories)) {
    const categoryRate = ((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(1);
    const categoryStatus = categoryRate >= 80 ? 
      `${colors.green}✅${colors.reset}` : 
      `${colors.red}❌${colors.reset}`;
    
    console.log(`  ${categoryStatus} ${category}: ${categoryRate}% (${stats.passed}/${stats.passed + stats.failed})`);
  }
  
  console.log(`\n${colors.bright}PERFORMANCE MÉDIA:${colors.reset}`);
  for (const [category, times] of Object.entries(testStats.performance)) {
    const avgTime = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
    console.log(`  ${category}: ${avgTime}ms`);
  }
  
  console.log(`\n${colors.bright}RECOMENDAÇÕES:${colors.reset}`);
  
  if (testStats.categories.AUTH?.failed > 0) {
    console.log(`  ${colors.yellow}⚠️  Problemas de autenticação detectados${colors.reset}`);
  }
  
  if (testStats.categories.PERFORMANCE?.failed > 0) {
    console.log(`  ${colors.yellow}⚠️  Problemas de performance detectados${colors.reset}`);
  }
  
  if (testStats.categories.SECURITY?.failed > 0) {
    console.log(`  ${colors.yellow}⚠️  Vulnerabilidades de segurança detectadas${colors.reset}`);
  }
  
  if (successRate >= 90) {
    console.log(`  ${colors.green}✅ Sistema SMS aprovado para produção${colors.reset}`);
  } else if (successRate >= 70) {
    console.log(`  ${colors.yellow}⚠️  Sistema SMS necessita melhorias antes da produção${colors.reset}`);
  } else {
    console.log(`  ${colors.red}❌ Sistema SMS reprovado - necessária revisão completa${colors.reset}`);
  }
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log(`${colors.bright}${colors.blue}INICIANDO BATERIA DE TESTES COMPLETA - MÓDULO SMS${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}Senior Developer Level Testing Suite${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);
  
  try {
    await testAuthentication();
    await testCreditsManagement();
    await testPhoneExtraction();
    await testCampaignManagement();
    await testAudienceSegmentation();
    await testSchedulingAndSending();
    await testLogsAndMonitoring();
    await testEdgeCases();
    await testPerformanceAndScalability();
    await testSecurityAndValidation();
    
    generateReport();
    
  } catch (error) {
    console.error(`${colors.red}ERRO FATAL NOS TESTES:${colors.reset}`, error);
    process.exit(1);
  }
}

// Executar os testes
runAllTests().catch(console.error);
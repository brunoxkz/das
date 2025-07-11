/**
 * INVESTIGAÇÃO DOS 5 PROBLEMAS ESPECÍFICOS NOS TESTES SMS
 * Análise detalhada dos erros para implementar correções definitivas
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
  
  // Verificar tipo de conteúdo na resposta
  const contentType = response.headers.get('content-type');
  console.log(`📄 Content-Type da resposta: ${contentType}`);
  console.log(`📊 Status da resposta: ${response.status}`);
  
  // Se for HTML, retornar apenas uma parte para debug
  if (contentType && contentType.includes('text/html')) {
    const htmlText = await response.text();
    return { 
      status: response.status, 
      data: { 
        error: "HTML_RESPONSE", 
        preview: htmlText.substring(0, 200) + "..." 
      } 
    };
  }
  
  try {
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } catch (error) {
    const textData = await response.text();
    return { 
      status: response.status, 
      data: { 
        error: "INVALID_JSON", 
        text: textData.substring(0, 200) 
      } 
    };
  }
}

async function autenticar() {
  console.log("🔐 FAZENDO LOGIN...");
  
  const result = await makeRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@vendzz.com",
      password: "admin123"
    })
  });
  
  if (result.status === 200 && result.data.accessToken) {
    console.log("✅ LOGIN REALIZADO COM SUCESSO");
    return result.data.accessToken;
  }
  
  console.log("❌ ERRO NO LOGIN:", result);
  throw new Error("Falha na autenticação");
}

async function investigarProblema1_HistoricoTransacoes(token) {
  console.log("\n🔍 PROBLEMA 1: Histórico de Transações SMS");
  console.log("Expected: JSON response, Actual: HTML response");
  
  const result = await makeRequest("/api/sms-credits/history", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  console.log("📊 RESULTADO:", result);
  
  if (result.data.error === "HTML_RESPONSE") {
    console.log("❌ CONFIRMADO: Endpoint retorna HTML em vez de JSON");
    console.log("🔧 SOLUÇÃO: Verificar se o endpoint existe ou está sendo interceptado pelo Vite");
  } else {
    console.log("✅ ENDPOINT CORRIGIDO: Retorna JSON corretamente");
  }
}

async function investigarProblema2_CreditosInsuficientes(token) {
  console.log("\n🔍 PROBLEMA 2: Validação de Créditos Insuficientes");
  
  // Simular envio com 1000 telefones para forçar erro de créditos insuficientes
  const muitosTelefones = Array(1000).fill("11999999999");
  
  const result = await makeRequest("/api/sms/send-direct", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
      phones: muitosTelefones,
      message: "Teste de limite de créditos",
      quizId: "test-quiz-id"
    })
  });
  
  console.log("📊 RESULTADO:", result);
  
  if (result.status === 400 && result.data.error && result.data.error.includes("insuficiente")) {
    console.log("✅ VALIDAÇÃO CORRIGIDA: Detecta créditos insuficientes corretamente");
  } else {
    console.log("❌ PROBLEMA PERSISTE: Não detecta créditos insuficientes");
  }
}

async function investigarProblema3_EnvioDireto(token) {
  console.log("\n🔍 PROBLEMA 3: Envio Direto de SMS");
  
  const result = await makeRequest("/api/sms/send-direct", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
      phones: ["11999999999"],
      message: "Teste de envio direto",
      quizId: "test-quiz-id"
    })
  });
  
  console.log("📊 RESULTADO:", result);
  
  const isSuccess = result.status === 200;
  const isValidError = result.status === 400 && result.data.error && result.data.error.includes("insuficiente");
  
  if (isSuccess || isValidError) {
    console.log("✅ ENDPOINT CORRIGIDO: Funciona corretamente");
  } else {
    console.log("❌ PROBLEMA PERSISTE: Endpoint com erro");
  }
}

async function investigarProblema4_QuizInexistente(token) {
  console.log("\n🔍 PROBLEMA 4: Quiz Inexistente");
  
  const result = await makeRequest("/api/sms-campaigns", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
      name: "Teste Quiz Inexistente",
      quizId: "quiz-inexistente-12345",
      message: "Mensagem para quiz inexistente",
      triggerType: "immediate",
      targetAudience: "all"
    })
  });
  
  console.log("📊 RESULTADO:", result);
  
  if (result.status === 404 && result.data.error && result.data.error.includes("não encontrado")) {
    console.log("✅ VALIDAÇÃO CORRIGIDA: Detecta quiz inexistente corretamente");
  } else if (result.status === 400 || result.status === 403) {
    console.log("⚠️ COMPORTAMENTO ACEITÁVEL: Rejeita quiz inexistente com status diferente");
  } else {
    console.log("❌ PROBLEMA PERSISTE: Não detecta quiz inexistente adequadamente");
  }
}

async function investigarProblema5_TelefonesInvalidos(token) {
  console.log("\n🔍 PROBLEMA 5: Telefones Inválidos");
  
  const result = await makeRequest("/api/sms/send-direct", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
      phones: ["123", "abc", "", "11999999999999999999"], // Telefones inválidos
      message: "Teste com telefones inválidos",
      quizId: "test-quiz-id"
    })
  });
  
  console.log("📊 RESULTADO:", result);
  
  if (result.status === 400 && result.data.error && 
      (result.data.error.includes("válido") || result.data.error.includes("inválido"))) {
    console.log("✅ VALIDAÇÃO CORRIGIDA: Detecta telefones inválidos corretamente");
  } else {
    console.log("❌ PROBLEMA PERSISTE: Não detecta telefones inválidos adequadamente");
  }
}

async function executarInvestigacao() {
  try {
    console.log("🔍 INICIANDO INVESTIGAÇÃO DOS 5 PROBLEMAS SMS");
    console.log("========================================");
    
    const token = await autenticar();
    
    await investigarProblema1_HistoricoTransacoes(token);
    await investigarProblema2_CreditosInsuficientes(token);
    await investigarProblema3_EnvioDireto(token);
    await investigarProblema4_QuizInexistente(token);
    await investigarProblema5_TelefonesInvalidos(token);
    
    console.log("\n✅ INVESTIGAÇÃO CONCLUÍDA");
    console.log("Agora podemos implementar as correções específicas para cada problema.");
    
  } catch (error) {
    console.error("❌ ERRO NA INVESTIGAÇÃO:", error);
  }
}

executarInvestigacao().catch(console.error);
/**
 * TESTE BOTÕES EMAIL MARKETING - IDENTIFICAR E CORRIGIR PROBLEMAS
 * Foca em testar especificamente os botões de pausar e excluir
 */

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`http://localhost:5000${endpoint}`, options);
  const data = await response.json();
  return { response, data };
}

async function authenticate() {
  const { response, data } = await makeRequest("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vendzz.com",
      password: "admin123"
    })
  });
  
  if (response.ok) {
    console.log("✅ Autenticação realizada com sucesso");
    return data.token || data.accessToken;
  } else {
    console.error("❌ Falha na autenticação:", data);
    throw new Error("Authentication failed");
  }
}

async function testarBotoesEmailMarketing() {
  console.log("\n🧪 TESTE ESPECÍFICO - BOTÕES EMAIL MARKETING");
  console.log("=" + "=".repeat(60));

  const token = await authenticate();
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  // 1. Listar campanhas existentes
  console.log("\n📋 1. LISTANDO CAMPANHAS EXISTENTES...");
  const { response: listResponse, data: campaigns } = await makeRequest("/api/email-campaigns", {
    method: "GET",
    headers
  });
  
  if (listResponse.ok) {
    console.log(`✅ ${campaigns.length} campanhas encontradas`);
    campaigns.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign.name} - Status: ${campaign.status} - ID: ${campaign.id}`);
    });
  } else {
    console.log(`❌ Erro ao listar campanhas: ${campaigns.error}`);
  }

  // 2. Criar campanha de teste específica para brunotamaso@gmail.com
  console.log("\n📧 2. CRIANDO CAMPANHA DE TESTE PARA BRUNOTAMASO@GMAIL.COM...");
  const testCampaign = {
    name: "Teste Bruno Tamaso",
    subject: "Olá {nome}, sua campanha de teste está pronta!",
    content: "Olá {nome},\n\nEsta é uma campanha de teste personalizada enviada para {email}.\n\nDados capturados:\n- Nome: {nome}\n- Email: {email}\n- Telefone: {telefone}\n- Idade: {idade}\n- Altura: {altura}\n- Peso atual: {peso_atual}\n- Peso objetivo: {peso_objetivo}\n\nObrigado!\nEquipe Vendzz",
    quizId: "Qm4wxpfPgkMrwoMhDFNLZ", // Quiz que tem emails
    targetAudience: "all",
    triggerType: "delayed",
    triggerDelay: 5,
    triggerUnit: "minutes"
  };

  const { response: createResponse, data: createData } = await makeRequest("/api/email-campaigns", {
    method: "POST",
    headers,
    body: JSON.stringify(testCampaign)
  });
  
  if (createResponse.ok) {
    console.log("✅ Campanha criada com sucesso");
    console.log(`   ID: ${createData.campaignId}`);
    console.log(`   Emails programados: ${createData.scheduledEmails}`);
  } else {
    console.log(`❌ Erro ao criar campanha: ${createData.error}`);
    return;
  }

  const campaignId = createData.campaignId;

  // 3. Testar botão INICIAR
  console.log("\n▶️  3. TESTANDO BOTÃO INICIAR...");
  const { response: startResponse, data: startData } = await makeRequest(`/api/email-campaigns/${campaignId}/start`, {
    method: "POST",
    headers
  });
  
  if (startResponse.ok) {
    console.log("✅ Botão INICIAR funcionando corretamente");
    console.log(`   Status: ${startData.status}`);
    console.log(`   Mensagem: ${startData.message}`);
  } else {
    console.log(`❌ ERRO no botão INICIAR: ${startData.error}`);
  }

  // 4. Testar botão PAUSAR
  console.log("\n⏸️  4. TESTANDO BOTÃO PAUSAR...");
  const { response: pauseResponse, data: pauseData } = await makeRequest(`/api/email-campaigns/${campaignId}/pause`, {
    method: "POST",
    headers
  });
  
  if (pauseResponse.ok) {
    console.log("✅ Botão PAUSAR funcionando corretamente");
    console.log(`   Status: ${pauseData.status}`);
    console.log(`   Mensagem: ${pauseData.message}`);
  } else {
    console.log(`❌ ERRO no botão PAUSAR: ${pauseData.error}`);
    console.log(`   Status HTTP: ${pauseResponse.status}`);
  }

  // 5. Testar botão EXCLUIR
  console.log("\n🗑️  5. TESTANDO BOTÃO EXCLUIR...");
  const { response: deleteResponse, data: deleteData } = await makeRequest(`/api/email-campaigns/${campaignId}`, {
    method: "DELETE",
    headers
  });
  
  if (deleteResponse.ok) {
    console.log("✅ Botão EXCLUIR funcionando corretamente");
    console.log(`   Mensagem: ${deleteData.message}`);
  } else {
    console.log(`❌ ERRO no botão EXCLUIR: ${deleteData.error}`);
    console.log(`   Status HTTP: ${deleteResponse.status}`);
  }

  // 6. Verificar se campanha foi realmente excluída
  console.log("\n🔍 6. VERIFICANDO SE CAMPANHA FOI EXCLUÍDA...");
  const { response: verifyResponse, data: verifyData } = await makeRequest(`/api/email-campaigns/${campaignId}`, {
    method: "GET",
    headers
  });
  
  if (verifyResponse.status === 404) {
    console.log("✅ Campanha foi excluída com sucesso (404 esperado)");
  } else if (verifyResponse.ok) {
    console.log(`⚠️  Campanha ainda existe: ${verifyData.name}`);
  } else {
    console.log(`❓ Status inesperado: ${verifyResponse.status}`);
  }

  // 7. Verificar emails disponíveis para brunotamaso@gmail.com
  console.log("\n📧 7. VERIFICANDO EMAILS DISPONÍVEIS PARA BRUNO TAMASO...");
  const { response: emailsResponse, data: emailsData } = await makeRequest("/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses/emails", {
    method: "GET",
    headers
  });
  
  if (emailsResponse.ok) {
    console.log(`✅ ${emailsData.totalEmails} emails encontrados no quiz`);
    console.log(`   Total de respostas: ${emailsData.totalResponses}`);
    if (emailsData.emails.includes("brunotamaso@gmail.com")) {
      console.log("✅ Email brunotamaso@gmail.com ENCONTRADO na lista!");
    } else {
      console.log("❌ Email brunotamaso@gmail.com NÃO ENCONTRADO");
      console.log(`   Emails encontrados: ${emailsData.emails.slice(0, 5).join(', ')}`);
    }
  } else {
    console.log(`❌ Erro ao buscar emails: ${emailsData.error}`);
  }

  console.log("\n🏁 TESTE COMPLETO FINALIZADO!");
  console.log("=" + "=".repeat(60));
}

// Executar teste
testarBotoesEmailMarketing().catch(console.error);
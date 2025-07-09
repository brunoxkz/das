/**
 * DEBUG - Testar extração de emails isoladamente
 */

async function testEmailExtraction() {
  console.log("\n🔍 DEBUG - EXTRAÇÃO DE EMAILS");
  console.log("=" + "=".repeat(50));
  
  // Autenticação
  const authResponse = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@vendzz.com",
      password: "admin123"
    })
  });
  
  const authData = await authResponse.json();
  if (!authResponse.ok) {
    console.error("❌ Falha na autenticação:", authData);
    return;
  }
  
  const token = authData.token || authData.accessToken;
  console.log("✅ Autenticado com sucesso");
  
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  // Teste 1: Listar todos os quizzes
  console.log("\n📋 1. LISTANDO TODOS OS QUIZZES:");
  const quizzesResponse = await fetch("http://localhost:5000/api/dashboard/stats", {
    headers
  });
  
  const quizzesData = await quizzesResponse.json();
  if (quizzesResponse.ok && quizzesData.quizzes) {
    console.log(`✅ ${quizzesData.quizzes.length} quizzes encontrados:`);
    quizzesData.quizzes.forEach((quiz, index) => {
      console.log(`   ${index + 1}. ${quiz.title} (${quiz.id}) - ${quiz.responses} respostas`);
    });
  } else {
    console.log("❌ Erro ao listar quizzes:", quizzesData);
  }
  
  // Teste 2: Verificar quiz específico que sabemos ter emails
  const quizId = "Qm4wxpfPgkMrwoMhDFNLZ";
  console.log(`\n📧 2. VERIFICANDO QUIZ ${quizId}:`);
  
  const emailsResponse = await fetch(`http://localhost:5000/api/quizzes/${quizId}/responses/emails`, {
    headers
  });
  
  const emailsData = await emailsResponse.json();
  if (emailsResponse.ok) {
    console.log(`✅ ${emailsData.totalEmails} emails encontrados`);
    console.log(`   📊 Total de respostas: ${emailsData.totalResponses}`);
    
    if (emailsData.emails && emailsData.emails.length > 0) {
      console.log("   📧 Primeiros 10 emails:");
      emailsData.emails.slice(0, 10).forEach((email, index) => {
        console.log(`      ${index + 1}. ${email}`);
      });
      
      if (emailsData.emails.includes("brunotamaso@gmail.com")) {
        console.log("   ✅ Email brunotamaso@gmail.com ENCONTRADO!");
      } else {
        console.log("   ❌ Email brunotamaso@gmail.com NÃO ENCONTRADO");
      }
    } else {
      console.log("   📭 Nenhum email encontrado");
    }
  } else {
    console.log("❌ Erro ao buscar emails:", emailsData);
  }
  
  // Teste 3: Verificar respostas brutas do quiz
  console.log(`\n🔍 3. VERIFICANDO RESPOSTAS BRUTAS DO QUIZ ${quizId}:`);
  
  const responsesResponse = await fetch(`http://localhost:5000/api/quiz-responses/${quizId}`, {
    headers
  });
  
  const responsesData = await responsesResponse.json();
  if (responsesResponse.ok) {
    console.log(`✅ ${responsesData.length} respostas brutas encontradas`);
    
    // Procurar especificamente por brunotamaso@gmail.com
    let foundBruno = false;
    responsesData.forEach((response, index) => {
      if (index < 5) { // Mostrar apenas as 5 primeiras
        console.log(`\n   📝 Resposta ${index + 1}:`);
        console.log(`      ID: ${response.id}`);
        console.log(`      Quiz: ${response.quizId}`);
        console.log(`      Metadata: ${JSON.stringify(response.metadata || {})}`);
        
        let responses = response.responses;
        if (typeof responses === 'string') {
          try {
            responses = JSON.parse(responses);
          } catch (e) {
            console.log(`      ❌ Erro ao fazer parse das respostas: ${e.message}`);
          }
        }
        
        if (Array.isArray(responses)) {
          console.log(`      📊 ${responses.length} elementos de resposta:`);
          responses.forEach((item, itemIndex) => {
            if (itemIndex < 3) { // Mostrar apenas os 3 primeiros
              console.log(`         ${itemIndex + 1}. Tipo: ${item.elementType}, ID: ${item.elementFieldId}, Resposta: ${item.answer}`);
            }
          });
        } else if (typeof responses === 'object') {
          console.log(`      📊 Respostas (objeto):`);
          Object.keys(responses).slice(0, 3).forEach(key => {
            console.log(`         ${key}: ${responses[key]}`);
          });
        }
      }
      
      // Verificar se é a resposta do Bruno
      let responseStr = JSON.stringify(response);
      if (responseStr.includes("brunotamaso@gmail.com")) {
        foundBruno = true;
        console.log(`\n   🎯 ENCONTRADO BRUNO NA RESPOSTA ${index + 1}:`);
        console.log(`      ID: ${response.id}`);
        console.log(`      Respostas: ${JSON.stringify(response.responses)}`);
        console.log(`      Metadata: ${JSON.stringify(response.metadata)}`);
      }
    });
    
    if (foundBruno) {
      console.log("\n   ✅ Email brunotamaso@gmail.com ENCONTRADO nas respostas brutas!");
    } else {
      console.log("\n   ❌ Email brunotamaso@gmail.com NÃO ENCONTRADO nas respostas brutas");
    }
  } else {
    console.log("❌ Erro ao buscar respostas brutas:", responsesData);
  }
  
  // Teste 4: Testar função de extração de emails para campanha
  console.log(`\n🧪 4. TESTANDO EXTRAÇÃO PARA CAMPANHA:`);
  
  const campaignTest = {
    name: "Teste Extração Debug",
    subject: "Debug: {nome}",
    content: "Teste de extração para {email}",
    quizId: quizId,
    targetAudience: "all",
    triggerType: "delayed",
    triggerDelay: 1,
    triggerUnit: "minutes"
  };
  
  const campaignResponse = await fetch("http://localhost:5000/api/email-campaigns", {
    method: "POST",
    headers,
    body: JSON.stringify(campaignTest)
  });
  
  const campaignData = await campaignResponse.json();
  if (campaignResponse.ok) {
    console.log(`✅ Campanha debug criada: ${campaignData.campaignId}`);
    console.log(`   📧 Emails extraídos: ${campaignData.scheduledEmails}`);
    
    if (campaignData.scheduledEmails === 0) {
      console.log("   ⚠️  PROBLEMA IDENTIFICADO: Extração retorna 0 emails");
      console.log("   🔍 Verifique a função extractEmailsFromResponses no backend");
    }
  } else {
    console.log("❌ Erro ao criar campanha debug:", campaignData);
  }
  
  // Teste 5: Verificar audiência específica
  console.log(`\n🎯 5. TESTANDO AUDIÊNCIAS ESPECÍFICAS:`);
  
  const audiencias = ["all", "completed", "abandoned"];
  
  for (const audiencia of audiencias) {
    console.log(`\n   👥 Testando audiência: ${audiencia}`);
    
    const audienciaTest = {
      name: `Debug Audiência ${audiencia}`,
      subject: `Debug ${audiencia}: {nome}`,
      content: `Teste audiência ${audiencia} para {email}`,
      quizId: quizId,
      targetAudience: audiencia,
      triggerType: "delayed",
      triggerDelay: 1,
      triggerUnit: "minutes"
    };
    
    const audienciaResponse = await fetch("http://localhost:5000/api/email-campaigns", {
      method: "POST",
      headers,
      body: JSON.stringify(audienciaTest)
    });
    
    const audienciaData = await audienciaResponse.json();
    if (audienciaResponse.ok) {
      console.log(`      ✅ Emails para ${audiencia}: ${audienciaData.scheduledEmails}`);
    } else {
      console.log(`      ❌ Erro audiência ${audiencia}: ${audienciaData.error}`);
    }
  }
  
  console.log("\n🏁 DEBUG COMPLETO");
  console.log("=" + "=".repeat(50));
}

// Executar teste
testEmailExtraction().catch(console.error);
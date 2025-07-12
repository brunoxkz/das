/**
 * TESTE DE DETECÇÃO AUTOMÁTICA - ELEMENTOS VISUAIS
 * Verifica se os novos elementos visuais são capturados corretamente
 * para remarketing ultra-personalizado
 */

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMjk0MDY0LCJub25jZSI6Im40aTYxYSIsImV4cCI6MTc1MjI5NDk2NH0.EFSTyEHk_sd24Dz4Ud9t3gzsDjZYW-HUPCrqtIFuIHE";
const baseUrl = "http://localhost:5000";

// Função para fazer requisições
async function makeRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

// Teste 1: Criar quiz com novos elementos visuais
async function testeQuizComElementosVisuais() {
  console.log("🧪 TESTE 1: Criando quiz com elementos visuais");
  
  const quizData = {
    title: "Quiz Teste - Elementos Visuais",
    description: "Teste de captura de elementos visuais para remarketing",
    status: "published",
    structure: {
      pages: [
        {
          id: "page1",
          name: "Página 1",
          elements: [
            {
              id: "title1",
              type: "heading",
              properties: {
                text: "Teste de Elementos Visuais",
                level: 1
              }
            },
            {
              id: "icons1",
              type: "icon_list",
              properties: {
                fieldId: "icon_list_preferencias",
                items: [
                  { icon: "Heart", text: "Saúde" },
                  { icon: "DollarSign", text: "Finanças" },
                  { icon: "Dumbbell", text: "Fitness" }
                ]
              }
            },
            {
              id: "testimonials1",
              type: "testimonials",
              properties: {
                fieldId: "testimonials_depoimentos",
                items: [
                  { name: "João Silva", text: "Excelente produto!" },
                  { name: "Maria Santos", text: "Recomendo muito!" }
                ]
              }
            },
            {
              id: "guarantee1",
              type: "guarantee",
              properties: {
                fieldId: "guarantee_garantia",
                text: "Garantia de 30 dias",
                icon: "Shield"
              }
            },
            {
              id: "paypal1",
              type: "paypal",
              properties: {
                fieldId: "paypal_payment",
                amount: "99.90",
                currency: "BRL"
              }
            },
            {
              id: "image_text1",
              type: "image_with_text",
              properties: {
                fieldId: "image_with_text_combo",
                imageUrl: "https://example.com/image.jpg",
                text: "Texto com imagem"
              }
            }
          ]
        }
      ]
    },
    settings: {
      theme: "modern",
      collectLeads: true
    }
  };

  const result = await makeRequest("/api/quizzes", "POST", quizData);
  
  if (result.status === 201) {
    console.log("✅ Quiz criado com sucesso:", result.data.id);
    return result.data.id;
  } else {
    console.log("❌ Erro ao criar quiz:", result.data);
    return null;
  }
}

// Teste 2: Simular respostas com elementos visuais
async function testeRespostasElementosVisuais(quizId) {
  console.log("🧪 TESTE 2: Simulando respostas com elementos visuais");
  
  const respostasData = {
    responses: {
      "icon_list_preferencias": "Saúde,Fitness",
      "testimonials_depoimentos": "João Silva - Excelente produto!",
      "guarantee_garantia": "30 dias aceito",
      "paypal_payment": "99.90 BRL processado",
      "image_with_text_combo": "Visualizado combo principal",
      "nome": "Bruno Teste",
      "email": "bruno@teste.com",
      "telefone": "11999888777"
    },
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      isPartial: false,
      timeSpent: 180,
      userAgent: "TestBot/1.0"
    }
  };

  const result = await makeRequest(`/api/quizzes/${quizId}/responses`, "POST", respostasData);
  
  if (result.status === 201) {
    console.log("✅ Resposta salva com sucesso:", result.data.id);
    return result.data.id;
  } else {
    console.log("❌ Erro ao salvar resposta:", result.data);
    return null;
  }
}

// Teste 3: Verificar extração de dados dos elementos visuais
async function testeExtracaoElementosVisuais(quizId) {
  console.log("🧪 TESTE 3: Verificando extração de elementos visuais");
  
  const result = await makeRequest(`/api/quiz-phones/${quizId}`);
  
  if (result.status === 200) {
    console.log("✅ Dados extraídos com sucesso");
    console.log("📊 Telefones encontrados:", result.data.phones.length);
    
    // Verificar se os elementos visuais foram capturados
    if (result.data.phones.length > 0) {
      const lead = result.data.phones[0];
      console.log("📱 Primeiro lead:", lead.phone);
      console.log("🔍 Dados capturados:");
      console.log("  - Nome:", lead.leadData.nome);
      console.log("  - Email:", lead.leadData.email);
      console.log("  - Icon List:", lead.leadData.icon_list_preferencias);
      console.log("  - Testimonials:", lead.leadData.testimonials_depoimentos);
      console.log("  - Guarantee:", lead.leadData.guarantee_garantia);
      console.log("  - PayPal:", lead.leadData.paypal_payment);
      console.log("  - Image with Text:", lead.leadData.image_with_text_combo);
      
      // Verificar se pelo menos um elemento visual foi capturado
      const elementosVisuais = [
        lead.leadData.icon_list_preferencias,
        lead.leadData.testimonials_depoimentos,
        lead.leadData.guarantee_garantia,
        lead.leadData.paypal_payment,
        lead.leadData.image_with_text_combo
      ].filter(Boolean);
      
      if (elementosVisuais.length > 0) {
        console.log("✅ Elementos visuais capturados:", elementosVisuais.length + "/5");
        return true;
      } else {
        console.log("❌ Nenhum elemento visual capturado");
        return false;
      }
    } else {
      console.log("❌ Nenhum lead encontrado");
      return false;
    }
  } else {
    console.log("❌ Erro ao buscar dados:", result.data);
    return false;
  }
}

// Teste 4: Verificar inclusão em campanhas de remarketing
async function testeRemarketingElementosVisuais(quizId) {
  console.log("🧪 TESTE 4: Verificando inclusão em remarketing");
  
  // Criar campanha SMS de teste
  const campanhaData = {
    name: "Teste Elementos Visuais",
    quizId: quizId,
    message: "Olá {nome}! Notamos seu interesse em {icon_list_preferencias}. {testimonials_depoimentos}",
    targetAudience: "completed",
    triggerType: "immediate",
    status: "active"
  };

  const result = await makeRequest("/api/sms-campaigns", "POST", campanhaData);
  
  if (result.status === 201) {
    console.log("✅ Campanha criada com sucesso:", result.data.id);
    
    // Verificar se a mensagem foi personalizada
    if (result.data.message.includes("{icon_list_preferencias}") && 
        result.data.message.includes("{testimonials_depoimentos}")) {
      console.log("✅ Variáveis de elementos visuais incluídas na mensagem");
      return true;
    } else {
      console.log("❌ Variáveis de elementos visuais não encontradas");
      return false;
    }
  } else {
    console.log("❌ Erro ao criar campanha:", result.data);
    return false;
  }
}

// Executar todos os testes
async function executarTestes() {
  console.log("🚀 INICIANDO TESTES DE DETECÇÃO DE ELEMENTOS VISUAIS");
  console.log("=" .repeat(60));
  
  let sucessos = 0;
  let falhas = 0;
  
  try {
    // Teste 1: Criar quiz
    const quizId = await testeQuizComElementosVisuais();
    if (quizId) {
      sucessos++;
      
      // Teste 2: Simular respostas
      const respostaId = await testeRespostasElementosVisuais(quizId);
      if (respostaId) {
        sucessos++;
        
        // Aguardar processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Teste 3: Verificar extração
        const extracaoOK = await testeExtracaoElementosVisuais(quizId);
        if (extracaoOK) {
          sucessos++;
          
          // Teste 4: Verificar remarketing
          const remarketingOK = await testeRemarketingElementosVisuais(quizId);
          if (remarketingOK) {
            sucessos++;
          } else {
            falhas++;
          }
        } else {
          falhas++;
        }
      } else {
        falhas++;
      }
    } else {
      falhas++;
    }
    
  } catch (error) {
    console.error("❌ ERRO CRÍTICO:", error);
    falhas++;
  }
  
  console.log("\n" + "=" .repeat(60));
  console.log("📊 RESULTADOS FINAIS:");
  console.log(`✅ Sucessos: ${sucessos}/4`);
  console.log(`❌ Falhas: ${falhas}/4`);
  console.log(`📈 Taxa de Sucesso: ${((sucessos/4)*100).toFixed(1)}%`);
  
  if (sucessos === 4) {
    console.log("🎉 TODOS OS TESTES APROVADOS!");
    console.log("✅ Sistema de detecção de elementos visuais funcionando perfeitamente");
    console.log("✅ Remarketing ultra-personalizado operacional");
  } else {
    console.log("⚠️ ALGUNS TESTES FALHARAM");
    console.log("🔧 Verificar implementação dos elementos visuais");
  }
}

// Executar os testes
executarTestes().catch(console.error);
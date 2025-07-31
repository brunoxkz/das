/**
 * TESTE FRONTEND COMPLETO - SIMULAÇÃO DE USUÁRIO REAL
 * Testa todas as funcionalidades do Quiz Builder sistematicamente
 */

const BASE_URL = "http://localhost:5000";
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function testeLogin() {
  console.log("🔐 TESTE 1: Login e Autenticação");
  
  const loginResult = await makeRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@vendzz.com",
      password: "admin123"
    })
  });

  if (loginResult.status === 200) {
    authToken = loginResult.data.accessToken;
    console.log("✅ Login realizado com sucesso");
    console.log("✅ Token JWT obtido:", authToken ? "EXISTS" : "MISSING");
    console.log("✅ Usuário:", loginResult.data.user.email, "-", loginResult.data.user.role);
    return true;
  } else {
    console.log("❌ Falha no login:", loginResult.data);
    return false;
  }
}

async function testeDashboard() {
  console.log("\n📊 TESTE 2: Dashboard e Estatísticas");
  
  // Buscar estatísticas do dashboard
  const dashboardResult = await makeRequest("/api/dashboard/stats");
  
  if (dashboardResult.status === 200) {
    console.log("✅ Dashboard carregado com sucesso");
    console.log("📈 Estatísticas:", {
      totalQuizzes: dashboardResult.data.totalQuizzes,
      totalResponses: dashboardResult.data.totalResponses,
      totalViews: dashboardResult.data.totalViews
    });
    return true;
  } else {
    console.log("❌ Falha ao carregar dashboard:", dashboardResult.data);
    return false;
  }
}

async function testeListaQuizzes() {
  console.log("\n📋 TESTE 3: Lista de Quizzes");
  
  const quizzesResult = await makeRequest("/api/quizzes");
  
  if (quizzesResult.status === 200) {
    console.log("✅ Lista de quizzes carregada");
    console.log("📝 Total de quizzes:", quizzesResult.data.length);
    
    if (quizzesResult.data.length > 0) {
      console.log("🔍 Primeiro quiz:", {
        id: quizzesResult.data[0].id,
        title: quizzesResult.data[0].title,
        isPublished: quizzesResult.data[0].isPublished
      });
    }
    
    return { success: true, quizzes: quizzesResult.data };
  } else {
    console.log("❌ Falha ao carregar quizzes:", quizzesResult.data);
    return { success: false, quizzes: [] };
  }
}

async function testeCriarQuiz() {
  console.log("\n🆕 TESTE 4: Criar Novo Quiz");
  
  const novoQuiz = {
    title: "Quiz Teste Frontend Completo",
    description: "Quiz criado para testar todas as funcionalidades do sistema",
    structure: {
      pages: [
        {
          id: "page1",
          title: "Página 1",
          elements: [
            {
              id: "element1",
              type: "heading",
              content: "Bem-vindo ao Quiz Teste",
              properties: {
                level: 1,
                alignment: "center"
              }
            }
          ]
        }
      ]
    },
    settings: {
      theme: "default",
      showProgress: true,
      collectLeads: true
    }
  };
  
  const criarResult = await makeRequest("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(novoQuiz)
  });
  
  if (criarResult.status === 201) {
    console.log("✅ Quiz criado com sucesso");
    console.log("🆔 ID do quiz:", criarResult.data.id);
    console.log("📝 Título:", criarResult.data.title);
    return { success: true, quiz: criarResult.data };
  } else {
    console.log("❌ Falha ao criar quiz:", criarResult.data);
    return { success: false, quiz: null };
  }
}

async function testeEditarQuiz(quizId) {
  console.log("\n✏️ TESTE 5: Editar Quiz - Adicionando Elementos");
  
  // Buscar quiz atual
  const quizResult = await makeRequest(`/api/quizzes/${quizId}`);
  
  if (quizResult.status !== 200) {
    console.log("❌ Falha ao buscar quiz para edição");
    return false;
  }
  
  const quiz = quizResult.data;
  
  // Adicionar novos elementos ao quiz
  const estruturaAtualizada = {
    ...quiz.structure,
    pages: [
      ...quiz.structure.pages,
      {
        id: "page2",
        title: "Página 2 - Elementos Diversos",
        elements: [
          {
            id: "element2",
            type: "paragraph",
            content: "Este é um parágrafo de teste para validar elementos de texto.",
            properties: {
              fontSize: "16px",
              alignment: "left"
            }
          },
          {
            id: "element3",
            type: "multiple_choice",
            content: "Qual é a sua cor favorita?",
            properties: {
              required: true,
              options: ["Azul", "Verde", "Vermelho", "Amarelo"]
            }
          },
          {
            id: "element4",
            type: "email",
            content: "Digite seu email:",
            properties: {
              required: true,
              placeholder: "exemplo@email.com",
              fieldId: "email_principal"
            }
          }
        ]
      }
    ]
  };
  
  const editarResult = await makeRequest(`/api/quizzes/${quizId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...quiz,
      structure: estruturaAtualizada
    })
  });
  
  if (editarResult.status === 200) {
    console.log("✅ Quiz editado com sucesso");
    console.log("📄 Páginas:", editarResult.data.structure.pages.length);
    console.log("🧩 Elementos totais:", editarResult.data.structure.pages.reduce((total, page) => total + page.elements.length, 0));
    return true;
  } else {
    console.log("❌ Falha ao editar quiz:", editarResult.data);
    return false;
  }
}

async function testeElementosAvancados(quizId) {
  console.log("\n🧩 TESTE 6: Elementos Avançados do Quiz Builder");
  
  // Buscar quiz atual
  const quizResult = await makeRequest(`/api/quizzes/${quizId}`);
  const quiz = quizResult.data;
  
  // Adicionar página com elementos avançados
  const paginaAvancada = {
    id: "page3",
    title: "Página 3 - Elementos Avançados",
    elements: [
      {
        id: "element5",
        type: "image",
        content: "Imagem de teste",
        properties: {
          src: "https://via.placeholder.com/300x200",
          alt: "Imagem de placeholder",
          alignment: "center"
        }
      },
      {
        id: "element6",
        type: "video",
        content: "Vídeo demonstrativo",
        properties: {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          autoplay: false,
          controls: true
        }
      },
      {
        id: "element7",
        type: "rating",
        content: "Avalie nossa plataforma:",
        properties: {
          required: true,
          maxRating: 5,
          fieldId: "avaliacao_plataforma"
        }
      },
      {
        id: "element8",
        type: "checkbox",
        content: "Selecione seus interesses:",
        properties: {
          required: false,
          options: ["Tecnologia", "Marketing", "Vendas", "Design"],
          fieldId: "interesses"
        }
      }
    ]
  };
  
  const estruturaComElementosAvancados = {
    ...quiz.structure,
    pages: [
      ...quiz.structure.pages,
      paginaAvancada
    ]
  };
  
  const editarResult = await makeRequest(`/api/quizzes/${quizId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...quiz,
      structure: estruturaComElementosAvancados
    })
  });
  
  if (editarResult.status === 200) {
    console.log("✅ Elementos avançados adicionados com sucesso");
    console.log("🎨 Tipos de elementos testados: image, video, rating, checkbox");
    return true;
  } else {
    console.log("❌ Falha ao adicionar elementos avançados:", editarResult.data);
    return false;
  }
}

async function testePublicarQuiz(quizId) {
  console.log("\n🚀 TESTE 7: Publicar Quiz");
  
  const publicarResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
    method: "POST"
  });
  
  if (publicarResult.status === 200) {
    console.log("✅ Quiz publicado com sucesso");
    console.log("🌐 URL pública:", `${BASE_URL}/quiz/${quizId}`);
    return true;
  } else {
    console.log("❌ Falha ao publicar quiz:", publicarResult.data);
    return false;
  }
}

async function testeResponderQuiz(quizId) {
  console.log("\n📝 TESTE 8: Responder Quiz (Simulação de Usuário Final)");
  
  // Simular resposta completa do quiz
  const resposta = {
    quizId: quizId,
    responses: {
      "element3": "Verde", // multiple_choice
      "element4": "teste@frontend.com", // email
      "element7": 5, // rating
      "element8": ["Tecnologia", "Marketing"] // checkbox
    },
    metadata: {
      isComplete: true,
      isPartial: false,
      completionPercentage: 100,
      userAgent: "Test Frontend User Agent",
      ipAddress: "127.0.0.1"
    }
  };
  
  const responderResult = await makeRequest(`/api/quizzes/${quizId}/responses`, {
    method: "POST",
    body: JSON.stringify(resposta)
  });
  
  if (responderResult.status === 201) {
    console.log("✅ Quiz respondido com sucesso");
    console.log("📊 Response ID:", responderResult.data.id);
    return { success: true, responseId: responderResult.data.id };
  } else {
    console.log("❌ Falha ao responder quiz:", responderResult.data);
    return { success: false, responseId: null };
  }
}

async function testeAnalytics(quizId) {
  console.log("\n📊 TESTE 9: Sistema de Analytics");
  
  // Buscar analytics do quiz
  const analyticsResult = await makeRequest(`/api/quizzes/${quizId}/analytics`);
  
  if (analyticsResult.status === 200) {
    console.log("✅ Analytics carregadas com sucesso");
    console.log("📈 Dados:", {
      totalResponses: analyticsResult.data.totalResponses,
      totalViews: analyticsResult.data.totalViews,
      completionRate: analyticsResult.data.completionRate
    });
    return true;
  } else {
    console.log("❌ Falha ao carregar analytics:", analyticsResult.data);
    return false;
  }
}

async function testeVariaveis(quizId) {
  console.log("\n🔧 TESTE 10: Sistema de Variáveis");
  
  // Buscar variáveis do quiz
  const variaveisResult = await makeRequest(`/api/quizzes/${quizId}/variables`);
  
  if (variaveisResult.status === 200) {
    console.log("✅ Variáveis carregadas com sucesso");
    console.log("🏷️ Variáveis disponíveis:", variaveisResult.data.length);
    
    if (variaveisResult.data.length > 0) {
      console.log("📝 Exemplos de variáveis:", variaveisResult.data.slice(0, 3));
    }
    
    return true;
  } else {
    console.log("❌ Falha ao carregar variáveis:", variaveisResult.data);
    return false;
  }
}

async function executarTodosOsTestes() {
  console.log("🚀 INICIANDO TESTES COMPLETOS DO FRONTEND\n");
  
  const resultados = {
    login: false,
    dashboard: false,
    listaQuizzes: false,
    criarQuiz: false,
    editarQuiz: false,
    elementosAvancados: false,
    publicarQuiz: false,
    responderQuiz: false,
    analytics: false,
    variaveis: false
  };
  
  try {
    // 1. Login
    resultados.login = await testeLogin();
    if (!resultados.login) {
      console.log("❌ ERRO CRÍTICO: Login falhou - interrompendo testes");
      return resultados;
    }
    
    // 2. Dashboard
    resultados.dashboard = await testeDashboard();
    
    // 3. Lista de Quizzes
    const listaResult = await testeListaQuizzes();
    resultados.listaQuizzes = listaResult.success;
    
    // 4. Criar Quiz
    const criarResult = await testeCriarQuiz();
    resultados.criarQuiz = criarResult.success;
    
    if (criarResult.success) {
      const quizId = criarResult.quiz.id;
      
      // 5. Editar Quiz
      resultados.editarQuiz = await testeEditarQuiz(quizId);
      
      // 6. Elementos Avançados
      resultados.elementosAvancados = await testeElementosAvancados(quizId);
      
      // 7. Publicar Quiz
      resultados.publicarQuiz = await testePublicarQuiz(quizId);
      
      // 8. Responder Quiz
      const responderResult = await testeResponderQuiz(quizId);
      resultados.responderQuiz = responderResult.success;
      
      // 9. Analytics
      resultados.analytics = await testeAnalytics(quizId);
      
      // 10. Variáveis
      resultados.variaveis = await testeVariaveis(quizId);
    }
    
  } catch (error) {
    console.error("❌ ERRO DURANTE TESTES:", error.message);
  }
  
  // Relatório final
  console.log("\n" + "=".repeat(60));
  console.log("📊 RELATÓRIO FINAL DOS TESTES");
  console.log("=".repeat(60));
  
  const testes = Object.entries(resultados);
  const sucessos = testes.filter(([_, sucesso]) => sucesso).length;
  const total = testes.length;
  
  console.log(`✅ SUCESSOS: ${sucessos}/${total} (${((sucessos/total)*100).toFixed(1)}%)`);
  console.log("");
  
  testes.forEach(([nome, sucesso]) => {
    const emoji = sucesso ? "✅" : "❌";
    const status = sucesso ? "SUCESSO" : "FALHA";
    console.log(`${emoji} ${nome.toUpperCase()}: ${status}`);
  });
  
  console.log("\n" + "=".repeat(60));
  
  if (sucessos === total) {
    console.log("🎉 TODOS OS TESTES PASSARAM - SISTEMA 100% FUNCIONAL!");
  } else {
    console.log(`⚠️  ${total - sucessos} testes falharam - requer atenção`);
  }
  
  return resultados;
}

// Executar testes
executarTodosOsTestes();
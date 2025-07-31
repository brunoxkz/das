/**
 * TESTE CRÍTICO DO SISTEMA DE SALVAMENTO
 * Testa o salvamento e recuperação de dados do quiz builder
 */

const BASE_URL = "http://localhost:5000";

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

async function authenticate() {
  console.log("🔐 Fazendo login...");
  const loginResponse = await makeRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@vendzz.com",
      password: "admin123"
    })
  });

  console.log("✅ Login realizado com sucesso");
  return loginResponse.token || loginResponse.accessToken;
}

async function testarSalvamento() {
  try {
    console.log("🚀 INICIANDO TESTE DO SISTEMA DE SALVAMENTO");
    console.log("=" .repeat(60));

    // 1. Autenticar
    const token = await authenticate();
    
    // 2. Criar novo quiz
    console.log("\n📝 ETAPA 1: Criando novo quiz...");
    const quizData = {
      title: "Quiz Teste Salvamento",
      description: "Teste de persistência de dados",
      structure: {
        pages: [
          {
            id: "page-1",
            type: "question",
            title: "Página 1",
            elements: [
              {
                id: "element-1",
                type: "heading",
                content: "Bem-vindo ao Quiz",
                properties: {
                  size: "large",
                  alignment: "center"
                }
              },
              {
                id: "element-2",
                type: "multiple_choice",
                content: "Qual é sua idade?",
                fieldId: "idade",
                options: ["18-25", "26-35", "36-45", "46+"],
                properties: {
                  required: true
                }
              }
            ]
          }
        ],
        flowSystem: {
          enabled: false,
          connections: []
        }
      },
      theme: "green",
      settings: {
        showProgressBar: true,
        collectEmail: true,
        collectName: true
      }
    };

    const createdQuiz = await makeRequest("/api/quizzes", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(quizData)
    });

    console.log("✅ Quiz criado:", {
      id: createdQuiz.id,
      title: createdQuiz.title,
      pagesCount: createdQuiz.structure?.pages?.length || 0
    });

    // 3. Modificar o quiz adicionando mais elementos
    console.log("\n📝 ETAPA 2: Modificando quiz existente...");
    const updatedData = {
      ...quizData,
      title: "Quiz Teste Salvamento (Atualizado)",
      structure: {
        pages: [
          {
            id: "page-1",
            type: "question",
            title: "Página 1",
            elements: [
              {
                id: "element-1",
                type: "heading",
                content: "Bem-vindo ao Quiz Atualizado",
                properties: {
                  size: "large",
                  alignment: "center"
                }
              },
              {
                id: "element-2",
                type: "multiple_choice",
                content: "Qual é sua idade?",
                fieldId: "idade",
                options: ["18-25", "26-35", "36-45", "46+"],
                properties: {
                  required: true
                }
              },
              {
                id: "element-3",
                type: "text",
                content: "Digite seu nome:",
                fieldId: "nome_completo",
                properties: {
                  required: true,
                  placeholder: "Seu nome completo"
                }
              }
            ]
          },
          {
            id: "page-2",
            type: "question",
            title: "Página 2",
            elements: [
              {
                id: "element-4",
                type: "email",
                content: "Digite seu e-mail:",
                fieldId: "email_principal",
                properties: {
                  required: true,
                  placeholder: "exemplo@email.com"
                }
              }
            ]
          }
        ],
        flowSystem: {
          enabled: false,
          connections: []
        }
      }
    };

    const updatedQuiz = await makeRequest(`/api/quizzes/${createdQuiz.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedData)
    });

    console.log("✅ Quiz atualizado:", {
      id: updatedQuiz.id,
      title: updatedQuiz.title,
      pagesCount: updatedQuiz.structure?.pages?.length || 0,
      elementsCount: updatedQuiz.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0
    });

    // 4. Verificar se os dados persistiram
    console.log("\n📝 ETAPA 3: Verificando persistência dos dados...");
    const retrievedQuiz = await makeRequest(`/api/quizzes/${createdQuiz.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("📊 Quiz recuperado:", {
      id: retrievedQuiz.id,
      title: retrievedQuiz.title,
      pagesCount: retrievedQuiz.structure?.pages?.length || 0,
      elementsCount: retrievedQuiz.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0
    });

    // 5. Validação detalhada
    console.log("\n🔍 ETAPA 4: Validação detalhada dos dados...");
    
    const validations = [
      {
        test: "Título atualizado",
        expected: "Quiz Teste Salvamento (Atualizado)",
        actual: retrievedQuiz.title,
        passed: retrievedQuiz.title === "Quiz Teste Salvamento (Atualizado)"
      },
      {
        test: "Número de páginas",
        expected: 2,
        actual: retrievedQuiz.structure?.pages?.length || 0,
        passed: (retrievedQuiz.structure?.pages?.length || 0) === 2
      },
      {
        test: "Total de elementos",
        expected: 4,
        actual: retrievedQuiz.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0,
        passed: (retrievedQuiz.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0) === 4
      },
      {
        test: "Elemento de e-mail presente",
        expected: true,
        actual: retrievedQuiz.structure?.pages?.some(p => p.elements?.some(e => e.type === "email")) || false,
        passed: retrievedQuiz.structure?.pages?.some(p => p.elements?.some(e => e.type === "email")) || false
      }
    ];

    let allPassed = true;
    validations.forEach(validation => {
      const status = validation.passed ? "✅" : "❌";
      console.log(`${status} ${validation.test}: ${validation.actual} (esperado: ${validation.expected})`);
      if (!validation.passed) allPassed = false;
    });

    // 6. Resultado final
    console.log("\n" + "=" .repeat(60));
    if (allPassed) {
      console.log("🎉 TESTE DO SISTEMA DE SALVAMENTO: APROVADO!");
      console.log("✅ Todos os dados foram salvos e recuperados corretamente");
      console.log("✅ O sistema está funcionando perfeitamente");
    } else {
      console.log("❌ TESTE DO SISTEMA DE SALVAMENTO: FALHOU!");
      console.log("⚠️ Alguns dados não foram persistidos corretamente");
    }

    // 7. Limpeza (opcional)
    console.log("\n🧹 Limpando quiz de teste...");
    await makeRequest(`/api/quizzes/${createdQuiz.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Quiz de teste removido");

    return allPassed;

  } catch (error) {
    console.error("❌ ERRO NO TESTE:", error.message);
    return false;
  }
}

// Executar teste
testarSalvamento()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("❌ ERRO CRÍTICO:", error);
    process.exit(1);
  });
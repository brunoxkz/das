/**
 * TESTE RÁPIDO DE DIAGNÓSTICO
 * Identifica qual campo específico está causando erro no esquema
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

  const responseData = await response.text();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseData}`);
  }

  try {
    return JSON.parse(responseData);
  } catch {
    return responseData;
  }
}

async function testarCamposObrigatorios() {
  try {
    console.log("🔐 Login...");
    const loginResponse = await makeRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@vendzz.com",
        password: "admin123"
      })
    });

    const token = loginResponse.token || loginResponse.accessToken;
    
    // Testar apenas o campo title
    console.log("🧪 TESTE 1: Apenas title");
    try {
      const result = await makeRequest("/api/quizzes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: "Test Simple" })
      });
      console.log("✅ TESTE 1 passou:", result.id);
    } catch (error) {
      console.log("❌ TESTE 1 falhou:", error.message);
    }

    // Testar title + structure vazio
    console.log("🧪 TESTE 2: Title + structure como object");
    try {
      const result = await makeRequest("/api/quizzes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          title: "Test Object", 
          structure: {} 
        })
      });
      console.log("✅ TESTE 2 passou:", result.id);
    } catch (error) {
      console.log("❌ TESTE 2 falhou:", error.message);
    }

    // Testar title + structure como string
    console.log("🧪 TESTE 3: Title + structure como string");
    try {
      const result = await makeRequest("/api/quizzes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          title: "Test String", 
          structure: "{}" 
        })
      });
      console.log("✅ TESTE 3 passou:", result.id);
    } catch (error) {
      console.log("❌ TESTE 3 falhou:", error.message);
    }

  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
  }
}

testarCamposObrigatorios();
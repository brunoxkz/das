/**
 * TESTE ESPECÍFICO DE MIDDLEWARE
 * Verifica se o problema é na autenticação ou no parsing do body
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
  return { status: response.status, data: responseData };
}

async function testarMiddleware() {
  try {
    // Primeiro: Login
    console.log("🔐 TESTE LOGIN...");
    const loginResult = await makeRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@vendzz.com",
        password: "admin123"
      })
    });
    
    console.log("🔐 Login Status:", loginResult.status);
    console.log("🔐 Login Data:", loginResult.data.slice(0, 200) + "...");
    
    // Segundo: Testar POST sem autenticação
    console.log("\n🧪 TESTE: POST sem autenticação...");
    const noAuthResult = await makeRequest("/api/quizzes", {
      method: "POST",
      body: JSON.stringify({
        title: "Test No Auth",
        structure: {}
      })
    });
    
    console.log("🧪 No Auth Status:", noAuthResult.status);
    console.log("🧪 No Auth Data:", noAuthResult.data);
    
    // Terceiro: Testar POST com autenticação
    console.log("\n🧪 TESTE: POST com autenticação...");
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IktqY3ROQ09sTTVqY2FmZ0FfZHJWUSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMTEwNjc2LCJub25jZSI6IjYzMWxmaiIsImV4cCI6MTc1MjExMTU3Nn0.I-9YhdunJ_k6TKLD93FjGvFtHCihUs8V6HAG6_Fawfo";
    
    const withAuthResult = await makeRequest("/api/quizzes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Test With Auth",
        structure: {}
      })
    });
    
    console.log("🧪 With Auth Status:", withAuthResult.status);
    console.log("🧪 With Auth Data:", withAuthResult.data);
    
  } catch (error) {
    console.error("❌ ERRO:", error.message);
  }
}

testarMiddleware();
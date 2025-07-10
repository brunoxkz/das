/**
 * TESTE COM NODE-FETCH EXPLÍCITO
 * Verificar se o problema é com fetch nativo do Node.js
 */

const BASE_URL = "http://localhost:5000";

async function makeRequest(endpoint, options = {}) {
  console.log(`🔍 Fazendo requisição para: ${endpoint}`);
  console.log(`📤 Options:`, {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body || null
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const responseData = await response.text();
  console.log(`📥 Response Status: ${response.status}`);
  console.log(`📥 Response Headers:`, Object.fromEntries(response.headers.entries()));
  console.log(`📥 Response Body:`, responseData.slice(0, 200) + "...");

  return { status: response.status, data: responseData };
}

async function testarComNodeFetch() {
  try {
    console.log("🔐 Fazendo login com node-fetch...");
    const loginResult = await makeRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@vendzz.com",
        password: "admin123"
      })
    });

    if (loginResult.status !== 200) {
      console.log("❌ Login falhou");
      return;
    }

    const token = JSON.parse(loginResult.data).accessToken;
    console.log("✅ Login realizado com sucesso, token:", token ? "EXISTS" : "MISSING");

    console.log("\n🧪 TESTE: POST com node-fetch");
    const testData = {
      title: "Test Node-Fetch",
      structure: { pages: [] }
    };
    
    console.log("📤 Enviando dados:", JSON.stringify(testData));

    const postResult = await makeRequest("/api/quizzes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    if (postResult.status === 201) {
      console.log("✅ POST bem-sucedido!");
      const responseData = JSON.parse(postResult.data);
      console.log("🎉 Quiz criado:", responseData.id);
    } else {
      console.log("❌ POST falhou:", `HTTP ${postResult.status}:`, postResult.data);
    }

  } catch (error) {
    console.error("❌ ERRO:", error.message);
  }
  
  console.log("\n✅ Teste com node-fetch completo");
}

testarComNodeFetch();
/**
 * TESTE REAL DO BREVO - ENVIO DIRETO
 * Testa o envio real de email usando a API do Brevo com dados do Bruno
 */

async function makeRequest(endpoint, options = {}) {
  const url = `http://localhost:5000${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response;
}

async function authenticate() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  console.log('🔑 Token recebido:', data.token ? 'Sim' : 'Não');
  return data.token;
}

async function testeBrevoReal() {
  console.log('🚀 INICIANDO TESTE REAL DO BREVO');
  console.log('════════════════════════════════════════════════════════════');

  try {
    // 1. Autenticar
    const token = await authenticate();
    console.log('✅ Autenticado com sucesso');

    // 2. Enviar email real via Brevo
    const emailData = {
      to: 'brunotamaso@gmail.com',
      subject: 'TESTE REAL - Seus dados do Quiz Vendzz',
      htmlContent: `
        <h2>Olá Bruno Tamaso!</h2>
        <p>Este é um teste real do sistema de email marketing da Vendzz.</p>
        <p>Seus dados capturados no quiz:</p>
        <ul>
          <li><strong>Nome:</strong> Bruno Tamaso</li>
          <li><strong>Email:</strong> brunotamaso@gmail.com</li>
          <li><strong>Altura:</strong> 1.75m</li>
          <li><strong>Peso:</strong> 80kg</li>
          <li><strong>Idade:</strong> 35 anos</li>
        </ul>
        <p>Sistema funcionando perfeitamente!</p>
        <p>Equipe Vendzz</p>
      `
    };

    const response = await makeRequest('/api/send-brevo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    
    console.log('📧 RESULTADO DO ENVIO REAL:');
    console.log(`   Status: ${result.success ? 'SUCESSO' : 'FALHA'}`);
    console.log(`   Mensagem: ${result.message || 'N/A'}`);
    
    if (result.success) {
      console.log('✅ EMAIL ENVIADO COM SUCESSO PARA brunotamaso@gmail.com');
      console.log('📬 Verifique a caixa de entrada do Bruno');
    } else {
      console.log('❌ ERRO NO ENVIO:', result.error || 'Erro desconhecido');
    }

  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }

  console.log('════════════════════════════════════════════════════════════');
  console.log('🎯 TESTE CONCLUÍDO');
}

testeBrevoReal();
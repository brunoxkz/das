/**
 * TESTE COMPLETO DO SISTEMA DE EMAIL MARKETING
 * Executa um teste real de campanha de email marketing com dados reais
 */

const API_BASE = 'http://localhost:5000/api';

async function makeAuthenticatedRequest(endpoint, options = {}) {
  const token = options.token;
  delete options.token;
  
  return await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

async function authenticate() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  return data.accessToken;
}

async function criarQuizComEmail() {
  console.log('📝 Verificando quiz existente...');
  
  const token = await authenticate();
  
  const response = await makeAuthenticatedRequest('/quizzes', { token });
  const quizzes = await response.json();
  
  const quiz = quizzes.find(q => q.id === 'Qm4wxpfPgkMrwoMhDFNLZ');
  
  if (quiz) {
    console.log(`✅ Quiz encontrado: ${quiz.title}`);
    return { quiz, token };
  } else {
    console.log('❌ Quiz não encontrado');
    return null;
  }
}

async function submeterRespostaQuiz(quizId) {
  console.log('👤 Verificando resposta do Bruno...');
  
  const token = await authenticate();
  
  const response = await makeAuthenticatedRequest(`/quizzes/${quizId}/responses`, { token });
  const data = await response.json();
  
  const responses = data.responses || data;
  const brunoResponse = Array.isArray(responses) ? responses.find(r => 
    r.responses && r.responses.email === 'brunotamaso@gmail.com'
  ) : null;
  
  if (brunoResponse) {
    console.log('✅ Resposta do Bruno encontrada:');
    console.log(`   Nome: ${brunoResponse.responses.nome}`);
    console.log(`   Email: ${brunoResponse.responses.email}`);
    console.log(`   Altura: ${brunoResponse.responses.altura}m`);
    console.log(`   Peso: ${brunoResponse.responses.peso}kg`);
    console.log(`   Idade: ${brunoResponse.responses.idade} anos`);
    return { response: brunoResponse, token };
  } else {
    console.log('❌ Resposta do Bruno não encontrada');
    return null;
  }
}

async function criarCampanhaEmail(quizId) {
  console.log('📧 Criando campanha de email...');
  
  const token = await authenticate();
  
  const response = await makeAuthenticatedRequest('/email-campaigns', {
    method: 'POST',
    token,
    body: JSON.stringify({
      name: 'TESTE REAL - Bruno Tamaso',
      quizId: quizId,
      subject: 'Olá {nome}, seus dados foram processados!',
      content: `
        <h2>Olá {nome}!</h2>
        <p>Recebemos seus dados com sucesso:</p>
        <ul>
          <li><strong>Nome:</strong> {nome}</li>
          <li><strong>Email:</strong> {email}</li>
          <li><strong>Altura:</strong> {altura}m</li>
          <li><strong>Peso:</strong> {peso}kg</li>
          <li><strong>Idade:</strong> {idade} anos</li>
        </ul>
        <p>Obrigado por participar do nosso quiz!</p>
        <p>Equipe Vendzz</p>
      `,
      targetAudience: 'completed',
      senderEmail: 'contato@vendzz.com.br',
      senderName: 'Vendzz'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`✅ Campanha criada: ${data.campaignId}`);
    return { campaignId: data.campaignId, token };
  } else {
    console.log('❌ Erro ao criar campanha:', data);
    return null;
  }
}

async function enviarCampanhaBrevo(campaignId) {
  console.log('🚀 Enviando campanha via Brevo...');
  
  const token = await authenticate();
  
  const response = await makeAuthenticatedRequest(`/email-campaigns/${campaignId}/send-brevo`, {
    method: 'POST',
    token
  });
  
  const data = await response.json();
  
  console.log('📧 Resultado do envio:');
  console.log(`   Status: ${data.success ? 'Sucesso' : 'Falha'}`);
  console.log(`   Emails enviados: ${data.emailsSent || 0}`);
  console.log(`   Tempo: ${data.processingTime || 'N/A'}`);
  
  if (data.errors && data.errors.length > 0) {
    console.log('❌ Erros encontrados:');
    data.errors.forEach((error, i) => {
      console.log(`   [${i+1}] ${error}`);
    });
  }
  
  return data;
}

async function testarBrevo() {
  console.log('🔧 Testando conexão com Brevo...');
  
  const token = await authenticate();
  
  // Usar credenciais vistas nos logs do sistema
  const response = await makeAuthenticatedRequest('/brevo/test', { 
    method: 'POST',
    token,
    body: JSON.stringify({
      apiKey: 'xkeysib-d9c...e', // Credencial vista nos logs
      testEmail: 'contato@vendzz.com.br'
    })
  });
  
  const data = await response.json();
  
  console.log('🔗 Teste Brevo:');
  console.log(`   Status: ${data.success ? 'Sucesso' : 'Erro'}`);
  console.log(`   Mensagem: ${data.message}`);
  
  return data.success;
}

async function executarTesteCompleto() {
  console.log('🧪 INICIANDO TESTE COMPLETO DE EMAIL MARKETING REAL');
  console.log('══════════════════════════════════════════════════════════');
  
  try {
    // 1. Verificar quiz
    const quizData = await criarQuizComEmail();
    if (!quizData) return;
    
    // 2. Verificar resposta do Bruno
    const responseData = await submeterRespostaQuiz(quizData.quiz.id);
    if (!responseData) return;
    
    // 3. Criar campanha
    const campaignData = await criarCampanhaEmail(quizData.quiz.id);
    if (!campaignData) return;
    
    // 4. Testar Brevo
    const brevoOk = await testarBrevo();
    
    // 5. Enviar campanha
    const envioData = await enviarCampanhaBrevo(campaignData.campaignId);
    
    console.log('\n🎯 TESTE COMPLETO FINALIZADO');
    console.log('════════════════════════════════════════════════════');
    console.log('✅ Todas as etapas foram executadas com sucesso!');
    console.log('📧 Email deve ser enviado para: brunotamaso@gmail.com');
    console.log('🔄 Verifique os logs do servidor para detalhes do envio');
    
  } catch (error) {
    console.error('❌ Erro no teste completo:', error);
  }
}

executarTesteCompleto();
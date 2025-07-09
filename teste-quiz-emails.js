/**
 * TESTE - Verificar emails disponíveis por quiz
 */

const API_BASE = 'http://localhost:5000/api';
let token = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return response.json();
}

async function login() {
  const response = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  token = response.token || response.accessToken;
  console.log('✅ Login realizado com sucesso');
}

async function verificarEmailsPorQuiz() {
  console.log('\n📋 LISTANDO QUIZZES E EMAILS DISPONÍVEIS:');
  console.log('=====================================');
  
  const quizzes = await makeRequest('/quizzes');
  
  for (const quiz of quizzes) {
    console.log(`\n📝 Quiz: ${quiz.title}`);
    console.log(`   ID: ${quiz.id}`);
    
    try {
      const emailsData = await makeRequest(`/quizzes/${quiz.id}/responses/emails`);
      console.log(`   📧 Emails disponíveis: ${emailsData.totalEmails}`);
      
      if (emailsData.totalEmails > 0) {
        console.log(`   🔍 Primeiros emails: ${emailsData.emails.slice(0, 3).join(', ')}`);
      }
      
      // Verificar variáveis disponíveis
      const responses = await makeRequest(`/quiz-responses/${quiz.id}`);
      if (responses.length > 0) {
        const firstResponse = responses[0];
        const responseData = typeof firstResponse.responses === 'string' ? 
          JSON.parse(firstResponse.responses) : firstResponse.responses;
        
        console.log(`   🔤 Variáveis disponíveis: ${Object.keys(responseData).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erro ao verificar emails: ${error.message}`);
    }
  }
}

async function main() {
  try {
    await login();
    await verificarEmailsPorQuiz();
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
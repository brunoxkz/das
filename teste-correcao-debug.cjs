// Teste específico para verificar se a função getQuiz está funcionando

async function importFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function login() {
  const fetch = await importFetch();
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@admin.com',
      password: 'admin123'
    })
  });

  const data = await response.json();
  return data.accessToken;
}

async function testQuizDirectly() {
  console.log('🔍 TESTE DIRETO - Verificando Quiz');
  
  const fetch = await importFetch();
  const token = await login();
  const quizId = 'G6_IWD6lNpzIlnqb6EVnm';
  
  // Teste direto de acesso ao quiz via endpoint
  const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const quiz = await response.json();
  console.log('📋 Quiz encontrado:', quiz ? 'SIM' : 'NÃO');
  
  if (quiz && !quiz.error) {
    console.log('✅ Quiz ID:', quiz.id);
    console.log('✅ Quiz Title:', quiz.title);
    console.log('✅ Quiz Owner:', quiz.userId || quiz.user_id);
    return true;
  } else {
    console.log('❌ Quiz Error:', quiz.error || quiz.message);
    return false;
  }
}

// Executar teste
testQuizDirectly().then(result => {
  console.log('🎯 RESULTADO:', result ? 'QUIZ ACESSÍVEL' : 'QUIZ INACESSÍVEL');
}).catch(console.error);
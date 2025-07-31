// VERIFICAR QUIZZES EXISTENTES PARA TESTE QUANTUM

const http = require('http');

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      rejectUnauthorized: false
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function verificarQuizzes() {
  console.log('🔍 VERIFICANDO QUIZZES EXISTENTES PARA TESTE QUANTUM');
  console.log('=' .repeat(60));

  try {
    // 1. LOGIN
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResult.data.token || loginResult.data.accessToken;
    console.log(`✅ Login realizado com sucesso`);

    // 2. LISTAR QUIZZES
    const quizzesResult = await makeRequest('/api/quizzes', 'GET', null, token);
    
    console.log(`\n🔍 Status da resposta: ${quizzesResult.status}`);
    console.log(`📊 Dados recebidos:`, JSON.stringify(quizzesResult.data, null, 2).substring(0, 300) + '...');
    
    if (quizzesResult.status === 200 && (quizzesResult.data.quizzes || Array.isArray(quizzesResult.data))) {
      const quizzes = quizzesResult.data.quizzes || quizzesResult.data;
      console.log(`\n📋 QUIZZES ENCONTRADOS: ${quizzes.length}`);
      
      if (quizzes.length > 0) {
        console.log('\n🎯 PRIMEIROS 5 QUIZZES:');
        console.log('-' .repeat(60));
        
        for (let i = 0; i < Math.min(5, quizzes.length); i++) {
          const quiz = quizzes[i];
          console.log(`${i + 1}. ${quiz.title || 'Sem título'}`);
          console.log(`   ID: ${quiz.id}`);
          console.log(`   URL: https://localhost:5000/quiz/${quiz.id}`);
          console.log(`   Publicado: ${quiz.isPublished ? 'Sim' : 'Não'}`);
          
          // Verificar se tem respostas
          const responsesResult = await makeRequest(`/api/quizzes/${quiz.id}/leads`, 'GET', null, token);
          if (responsesResult.status === 200) {
            const leadsCount = responsesResult.data.leads ? responsesResult.data.leads.length : 0;
            console.log(`   Leads: ${leadsCount}`);
            
            if (leadsCount > 0) {
              console.log(`   ⭐ PODE SER USADO PARA TESTE QUANTUM!`);
            }
          }
          console.log('');
        }
        
        // Sugerir o melhor quiz para teste
        const publishedQuizzes = quizzes.filter(q => q.isPublished);
        if (publishedQuizzes.length > 0) {
          const suggestedQuiz = publishedQuizzes[0];
          console.log(`\n🎯 QUIZ SUGERIDO PARA TESTE QUANTUM:`);
          console.log(`   Título: ${suggestedQuiz.title || 'Sem título'}`);
          console.log(`   ID: ${suggestedQuiz.id}`);
          console.log(`   URL: https://localhost:5000/quiz/${suggestedQuiz.id}`);
          
          // Testar variables ultra neste quiz
          const variablesResult = await makeRequest(`/api/quizzes/${suggestedQuiz.id}/variables-ultra`, 'GET', null, token);
          if (variablesResult.status === 200) {
            console.log(`\n🔬 VARIABLES ULTRA DISPONÍVEIS:`);
            const variables = variablesResult.data.variables || [];
            variables.slice(0, 3).forEach(variable => {
              console.log(`   - ${variable.field}: ${variable.responseCount} respostas`);
              if (variable.values) {
                variable.values.slice(0, 2).forEach(value => {
                  console.log(`     • ${value.value}: ${value.count} leads`);
                });
              }
            });
          }
        }
        
        console.log(`\n✨ AGORA VOCÊ PODE TESTAR O SISTEMA QUANTUM COM QUIZZES EXISTENTES!`);
        console.log(`🚀 URLs para teste:`);
        console.log(`   - Remarketing Quantum: https://localhost:5000/remarketing-quantum`);
        console.log(`   - Ao Vivo Quantum: https://localhost:5000/ao-vivo-quantum`);
        console.log(`   - Sistema Ultra Demo: https://localhost:5000/sistema-ultra-demo`);
      } else {
        console.log('\n❌ Nenhum quiz encontrado.');
      }
      
    } else {
      console.log(`❌ Erro ao listar quizzes: Status ${quizzesResult.status}`);
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }
}

verificarQuizzes().catch(console.error);
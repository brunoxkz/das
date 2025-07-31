import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';

async function testVariables() {
  console.log('📧 TESTE SISTEMA DE VARIÁVEIS EMAIL - INÍCIO');
  
  try {
    // 1. Fazer login
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login realizado:', loginData.user.email);
    
    const token = loginData.token;
    
    // 2. Buscar quizzes
    const quizzesResponse = await fetch(`${baseUrl}/api/quizzes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!quizzesResponse.ok) {
      console.error('❌ Erro ao buscar quizzes:', await quizzesResponse.text());
      return;
    }
    
    const quizzes = await quizzesResponse.json();
    console.log(`📝 Quizzes encontrados: ${quizzes.length}`);
    
    // 3. Testar variáveis para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n📊 TESTANDO QUIZ: ${quiz.title} (ID: ${quiz.id})`);
      
      // Buscar variáveis disponíveis
      const variablesResponse = await fetch(`${baseUrl}/api/quizzes/${quiz.id}/variables`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (variablesResponse.ok) {
        const variableData = await variablesResponse.json();
        console.log(`✅ Variáveis encontradas: ${variableData.variables.length}`);
        console.log(`📋 Lista de variáveis: ${variableData.variables.join(', ')}`);
        console.log(`📊 Total de respostas: ${variableData.totalResponses}`);
      } else {
        console.log('❌ Erro ao buscar variáveis:', await variablesResponse.text());
      }
    }
    
    // 4. Teste específico com quiz que tem mais respostas
    const quizWithMostResponses = quizzes.reduce((max, quiz) => 
      (quiz.responses || 0) > (max.responses || 0) ? quiz : max
    );
    
    if (quizWithMostResponses && quizWithMostResponses.responses > 0) {
      console.log(`\n🎯 TESTE DETALHADO - Quiz com mais respostas: ${quizWithMostResponses.title}`);
      
      const detailedResponse = await fetch(`${baseUrl}/api/quizzes/${quizWithMostResponses.id}/variables`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (detailedResponse.ok) {
        const detailedData = await detailedResponse.json();
        console.log(`📊 Variáveis disponíveis para personalização:`);
        detailedData.variables.forEach(variable => {
          console.log(`  - {${variable}}`);
        });
        
        console.log(`\n💡 Exemplo de uso no email:`);
        console.log(`   Assunto: "Olá {nome}, sua resposta foi registrada!"`);
        console.log(`   Conteúdo: "Olá {nome}, obrigado por responder nosso quiz sobre {assunto}. Seu email {email} foi registrado."`);
      }
    }
    
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  }
}

testVariables();
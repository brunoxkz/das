/**
 * DEBUG - Encontrar email brunotamaso@gmail.com
 */

async function debugBrunoEmail() {
  console.log('🔍 DEBUG - PROCURANDO EMAIL BRUNOTAMASO@GMAIL.COM');
  
  try {
    // 1. Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token || loginData.accessToken;
    console.log('✅ Login realizado');
    
    // 2. Buscar respostas do quiz "novo 1 min" 
    const quizId = "Qm4wxpfPgkMrwoMhDFNLZ";
    const responsesResponse = await fetch(`http://localhost:5000/api/quiz-responses/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responses = await responsesResponse.json();
    console.log(`✅ Respostas obtidas: ${responses.length}`);
    
    // 3. Verificar cada resposta procurando por brunotamaso@gmail.com
    let found = false;
    responses.forEach((response, index) => {
      console.log(`\n--- RESPOSTA ${index + 1} ---`);
      console.log(`ID: ${response.id}`);
      console.log(`Data: ${response.submittedAt}`);
      
      // Verificar se o response.responses é string ou objeto
      let responseData;
      if (typeof response.responses === 'string') {
        try {
          responseData = JSON.parse(response.responses);
          console.log('📋 Responses parseado do JSON');
        } catch (e) {
          console.log('❌ Erro ao parsear JSON:', e.message);
          return;
        }
      } else {
        responseData = response.responses;
        console.log('📋 Responses já é objeto');
      }
      
      if (responseData && typeof responseData === 'object') {
        Object.keys(responseData).forEach(key => {
          const value = responseData[key];
          console.log(`  ${key}: ${value}`);
          
          // Verificar se é o email que procuramos
          if (value && typeof value === 'string' && value.includes('brunotamaso@gmail.com')) {
            console.log(`🎯 ENCONTRADO! Campo: ${key}, Valor: ${value}`);
            found = true;
          }
        });
      }
    });
    
    // 4. Testar endpoint de extração SEMPRE
    const emailsResponse = await fetch(`http://localhost:5000/api/quizzes/${quizId}/responses/emails`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const emailsData = await emailsResponse.json();
    console.log('\n📧 RESULTADO DO ENDPOINT DE EXTRAÇÃO:');
    console.log(JSON.stringify(emailsData, null, 2));
    
    if (!found) {
      console.log('❌ EMAIL brunotamaso@gmail.com NÃO ENCONTRADO');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

// Executar
debugBrunoEmail();
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Teste direto do endpoint
async function testEndpoint() {
  try {
    console.log('🔐 Fazendo login...');
    
    // 1. Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login response:', loginData);

    if (!loginResponse.ok) {
      console.error('❌ Login falhou');
      return;
    }

    const token = loginData.accessToken;
    console.log('🔑 Token:', token);

    // 2. Testar endpoint de quiz responses
    console.log('\n📋 Testando endpoint de quiz responses...');
    
    const quizId = 'ey15ofZ96pBzDIWv_k19T';
    const responsesResponse = await fetch(`${BASE_URL}/api/quiz-responses?quizId=${quizId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
    });

    console.log('📊 Response status:', responsesResponse.status);
    console.log('📊 Response headers:', responsesResponse.headers.get('content-type'));

    if (responsesResponse.ok) {
      const responseText = await responsesResponse.text();
      console.log('📊 Response text preview:', responseText.substring(0, 200));
      
      // Tentar parsear como JSON
      try {
        const responses = JSON.parse(responseText);
        console.log('✅ Quiz responses:', responses.length, 'encontradas');
        
        // Extrair emails
        const emails = [];
        responses.forEach(response => {
          if (response.responses && typeof response.responses === 'object') {
            Object.keys(response.responses).forEach(key => {
              if (key.includes('email') && response.responses[key]) {
                emails.push(response.responses[key]);
              }
            });
          }
        });

        console.log('📧 Emails encontrados:', emails.length);
        console.log('📧 Emails:', emails);
      } catch (jsonError) {
        console.error('❌ Erro ao parsear JSON:', jsonError.message);
      }
    } else {
      const errorText = await responsesResponse.text();
      console.error('❌ Erro na resposta:', errorText.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

testEndpoint();
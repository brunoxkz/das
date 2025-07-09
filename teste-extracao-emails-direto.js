/**
 * TESTE DIRETO - Extração de emails do endpoint específico
 */

import fetch from 'node-fetch';

async function testeExtracao() {
  console.log('🔧 TESTE DIRETO - EXTRAÇÃO DE EMAILS');
  
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
    
    // 2. Testar endpoint que funciona primeiro
    const responsesResponse = await fetch('http://localhost:5000/api/quiz-responses/Qm4wxpfPgkMrwoMhDFNLZ', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responses = await responsesResponse.json();
    console.log(`✅ Respostas obtidas: ${responses.length}`);
    
    // 3. Testar endpoint de extração
    const emailsResponse = await fetch('http://localhost:5000/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses/emails', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (emailsResponse.ok) {
      const emailsData = await emailsResponse.json();
      console.log('✅ Extração de emails funcionou!');
      console.log('📧 Dados:', emailsData);
    } else {
      const errorData = await emailsResponse.json();
      console.error('❌ Erro na extração:', errorData);
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

testeExtracao();
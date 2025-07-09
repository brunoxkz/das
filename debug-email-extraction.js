/**
 * DEBUG - Testar extração de emails isoladamente
 */

import axios from 'axios';

async function testEmailExtraction() {
  console.log('🔍 TESTANDO EXTRAÇÃO DE EMAILS - DEBUG');
  
  try {
    // 1. Fazer login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@vendzz.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Testar endpoint de extração de emails
    const emailResponse = await axios.get('http://localhost:5000/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses/emails', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Extração de emails funcionou!');
    console.log('📧 Resultado:', emailResponse.data);
    
  } catch (error) {
    console.error('❌ ERRO:', error.response?.data?.error || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('🔍 Stack:', error.stack);
  }
}

testEmailExtraction();
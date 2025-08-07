/**
 * DEBUG - Encontrar email brunotamaso@gmail.com
 */

const API_BASE = 'http://localhost:5000/api';

async function debugBrunoEmail() {
  console.log('🔍 DEBUG - BUSCANDO EMAIL DO BRUNO');
  console.log('=====================================');
  
  try {
    // Autenticar
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    // Buscar respostas
    const response = await fetch(`${API_BASE}/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    console.log('📊 Estrutura de dados:', JSON.stringify(data, null, 2));
    
    const responses = data.responses || data;
    if (!Array.isArray(responses)) {
      console.log('❌ Resposta não é array:', typeof responses);
      return;
    }
    
    console.log(`📊 Total de respostas: ${responses.length}`);
    
    // Procurar especificamente por Bruno
    const brunoResponse = responses.find(r => {
      if (r.responses && typeof r.responses === 'object') {
        const responses = r.responses;
        
        // Verificar se é array (formato novo)
        if (Array.isArray(responses)) {
          return responses.some(item => 
            item.answer === 'brunotamaso@gmail.com' ||
            item.answer === 'Bruno Tamaso'
          );
        }
        
        // Verificar se é objeto (formato antigo)
        return responses.email === 'brunotamaso@gmail.com' ||
               responses.nome === 'Bruno Tamaso' ||
               Object.values(responses).includes('brunotamaso@gmail.com');
      }
      return false;
    });
    
    if (brunoResponse) {
      console.log('✅ RESPOSTA DO BRUNO ENCONTRADA:');
      console.log('   ID:', brunoResponse.id);
      console.log('   Tipo responses:', typeof brunoResponse.responses);
      console.log('   É array:', Array.isArray(brunoResponse.responses));
      console.log('   Responses completo:', JSON.stringify(brunoResponse.responses, null, 2));
      
      // Testar extração manual
      console.log('\n🔍 TESTE MANUAL DE EXTRAÇÃO:');
      const responses = brunoResponse.responses;
      
      if (Array.isArray(responses)) {
        console.log('   Formato: Array');
        responses.forEach((item, index) => {
          console.log(`   [${index}] ${item.elementType}: "${item.answer}"`);
          if (item.elementType === 'email') {
            console.log(`   ✅ EMAIL ENCONTRADO: ${item.answer}`);
          }
        });
      } else if (typeof responses === 'object') {
        console.log('   Formato: Objeto');
        Object.keys(responses).forEach(key => {
          console.log(`   ${key}: "${responses[key]}"`);
          if (key === 'email' || (responses[key] && responses[key].includes('@'))) {
            console.log(`   ✅ EMAIL ENCONTRADO: ${responses[key]}`);
          }
        });
      }
    } else {
      console.log('❌ Resposta do Bruno não encontrada');
      
      // Mostrar primeiras 3 respostas para debug
      console.log('\n📋 PRIMEIRAS 3 RESPOSTAS:');
      responses.slice(0, 3).forEach((r, i) => {
        console.log(`[${i}] ID: ${r.id}`);
        console.log(`    Tipo: ${typeof r.responses}, Array: ${Array.isArray(r.responses)}`);
        console.log(`    Responses: ${JSON.stringify(r.responses, null, 2)}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

debugBrunoEmail();
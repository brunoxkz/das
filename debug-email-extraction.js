/**
 * DEBUG - Testar extração de emails isoladamente
 */

const API_BASE = 'http://localhost:5000/api';
let globalToken = null;

async function testeExtracao() {
  console.log('🔍 DEBUGANDO EXTRAÇÃO DE EMAILS');
  console.log('==================================');
  
  try {
    // 1. Autenticar
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    globalToken = loginData.token;
    console.log('✅ Autenticado com sucesso');
    
    // 2. Buscar respostas do quiz
    const response = await fetch(`${API_BASE}/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses`, {
      headers: { 'Authorization': `Bearer ${globalToken}` }
    });
    
    const data = await response.json();
    console.log(`📊 ${data.length} respostas encontradas`);
    
    // 3. Analisar estrutura das respostas
    if (data.length > 0) {
      console.log('\n🔍 ANALISANDO ESTRUTURA DAS RESPOSTAS:');
      
      // Procurar especificamente pela resposta do Bruno
      const brunoResponse = data.find(r => {
        if (r.responses && typeof r.responses === 'object') {
          const responses = r.responses;
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
        console.log('   Responses:', JSON.stringify(brunoResponse.responses, null, 2));
        console.log('   Metadata:', JSON.stringify(brunoResponse.metadata, null, 2));
        
        // Verificar especificamente o campo email
        const responses = brunoResponse.responses;
        if (responses.email) {
          console.log('   ✅ Campo email encontrado:', responses.email);
        } else {
          console.log('   ❌ Campo email não encontrado');
          console.log('   Campos disponíveis:', Object.keys(responses));
        }
      } else {
        console.log('❌ Resposta do Bruno não encontrada');
        console.log('   Procurando por emails em todas as respostas...');
        
        data.forEach((response, index) => {
          if (response.responses && typeof response.responses === 'object') {
            const responses = response.responses;
            const hasEmail = responses.email || Object.keys(responses).some(key => key.includes('email'));
            
            if (hasEmail) {
              console.log(`   [${index}] Email encontrado:`, responses.email || 'campo email não direto');
              console.log(`       Responses:`, JSON.stringify(responses, null, 2));
            }
          }
        });
      }
    }
    
    // 4. Testar endpoint de extração de emails
    console.log('\n📧 TESTANDO ENDPOINT DE EXTRAÇÃO:');
    const extractResponse = await fetch(`${API_BASE}/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses/emails`, {
      headers: { 'Authorization': `Bearer ${globalToken}` }
    });
    
    const extractData = await extractResponse.json();
    console.log('Status:', extractResponse.status);
    console.log('Data:', JSON.stringify(extractData, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testeExtracao();
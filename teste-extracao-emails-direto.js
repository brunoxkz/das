/**
 * TESTE DIRETO - Extração de emails do endpoint específico
 */

const API_BASE = 'http://localhost:5000/api';

async function testeExtracao() {
  console.log('📧 TESTE DIRETO - EXTRAÇÃO DE EMAILS');
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
    
    console.log('✅ Token obtido:', token ? 'Sim' : 'Não');
    
    // Testar extração de emails direto
    const response = await fetch(`${API_BASE}/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses/emails`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    console.log('📧 RESULTADO DA EXTRAÇÃO:');
    console.log('   Status:', response.status);
    console.log('   Total de emails:', data.totalEmails);
    console.log('   Total de respostas:', data.totalResponses);
    console.log('   Emails extraídos:', data.emails);
    
    if (data.emails && data.emails.length > 0) {
      console.log('\n✅ EMAILS ENCONTRADOS:');
      data.emails.forEach((email, index) => {
        console.log(`   [${index + 1}] ${email}`);
      });
      
      // Verificar se o email do Bruno está na lista
      const brunoemail = data.emails.find(e => e.includes('brunotamaso'));
      if (brunoemail) {
        console.log(`\n🎯 Email do Bruno encontrado: ${brunoemail}`);
      } else {
        console.log('\n❌ Email do Bruno não encontrado na lista');
      }
    } else {
      console.log('\n❌ Nenhum email foi extraído');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testeExtracao();
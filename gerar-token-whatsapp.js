// Gerar token de WhatsApp para extensão Chrome
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function gerarTokenWhatsApp() {
  try {
    console.log('🔐 Fazendo login no sistema...');
    
    // Fazer login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Erro no login');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    console.log('✅ Login realizado com sucesso!');
    console.log('📧 Usuário:', loginData.user.email);
    console.log('👤 Nome:', loginData.user.firstName, loginData.user.lastName);
    console.log('🎯 Plano:', loginData.user.plan);
    
    console.log('\n🔑 TOKEN DE WHATSAPP GERADO:');
    console.log('═'.repeat(80));
    console.log(token);
    console.log('═'.repeat(80));
    
    console.log('\n📱 COMO USAR O TOKEN:');
    console.log('1. Abra a extensão Chrome do WhatsApp');
    console.log('2. Cole o token no campo "Token de Autenticação"');
    console.log('3. Clique em "Salvar Token"');
    console.log('4. O token será validado automaticamente');
    
    console.log('\n⏰ VALIDADE DO TOKEN:');
    console.log('• Token válido por 15 minutos');
    console.log('• Renove sempre que necessário');
    console.log('• Use apenas para sua conta admin@vendzz.com');
    
    console.log('\n🔒 SEGURANÇA:');
    console.log('• Não compartilhe este token');
    console.log('• Token vinculado ao seu usuário');
    console.log('• Válido apenas para campanhas WhatsApp');
    
    // Verificar se o token funciona
    console.log('\n🧪 TESTANDO TOKEN...');
    const testResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ Token validado com sucesso!');
      console.log('✅ Sistema pronto para uso com WhatsApp');
    } else {
      console.log('❌ Erro na validação do token');
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error.message);
  }
}

// Executar
gerarTokenWhatsApp();
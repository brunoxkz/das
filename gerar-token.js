import fetch from 'node-fetch';

async function gerarToken() {
  try {
    console.log('🔑 GERANDO TOKEN PARA EXTENSÃO CHROME\n');
    
    const response = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (data.accessToken) {
      console.log('✅ TOKEN GERADO COM SUCESSO!\n');
      console.log('📋 COPIE E COLE ESTE TOKEN NA EXTENSÃO:\n');
      console.log('━'.repeat(80));
      console.log(data.accessToken);
      console.log('━'.repeat(80));
      console.log('\n📌 INSTRUÇÕES:');
      console.log('1. Abra a extensão Chrome no WhatsApp Web');
      console.log('2. Cole este token no campo "Token de Autenticação"');
      console.log('3. Clique em "Salvar Token"');
      console.log('4. A extensão ficará conectada e pronta para usar');
      console.log('\n⏰ Este token é válido por 1 hora');
      console.log('👤 Usuário: admin@vendzz.com');
      console.log('🎯 Acesso: Todos os quizzes e dados');
    } else {
      console.log('❌ Erro ao gerar token:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

gerarToken();
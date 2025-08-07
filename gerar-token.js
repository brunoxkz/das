// Gerar token JWT para teste da extensão
async function gerarToken() {
  try {
    const response = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      }),
    });

    const data = await response.json();
    
    if (data.accessToken) {
      console.log('🔑 TOKEN GERADO COM SUCESSO!');
      console.log('📋 Token:', data.accessToken);
      console.log('⏰ Válido por 15 minutos');
      console.log('🔗 URL:', 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev');
      
      console.log('\n🎯 INSTRUÇÕES RÁPIDAS:');
      console.log('1. Abra WhatsApp Web');
      console.log('2. Sidebar aparece automaticamente');
      console.log('3. Cole o token acima');
      console.log('4. Teste com telefone 11995133932');
      console.log('5. Clique "Iniciar Automação"');
      console.log('6. Verificar console para logs');
      
      return data.accessToken;
    } else {
      console.error('❌ Erro ao gerar token:', data);
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
  }
}

// Executar diretamente
gerarToken();
/**
 * GERAR TOKEN FRESCO PARA TESTES
 * Gera um novo token JWT válido para usar nos testes
 */

const BASE_URL = 'http://localhost:5000';

async function gerarTokenFresh() {
  try {
    console.log('🔑 Gerando token fresco...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const token = data.token || data.accessToken;
    
    if (!token) {
      throw new Error('Token não encontrado na resposta');
    }

    console.log('✅ Token gerado com sucesso!');
    console.log('🔍 Token:', token.substring(0, 20) + '...');
    console.log('📋 Token completo:');
    console.log(token);
    
    // Testar se o token funciona
    const testResponse = await fetch(`${BASE_URL}/api/quizzes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (testResponse.ok) {
      const quizzes = await testResponse.json();
      console.log(`✅ Token validado! Encontrados ${quizzes.length} quizzes`);
    } else {
      console.log('❌ Token inválido:', await testResponse.text());
    }

    return token;
    
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error.message);
    return null;
  }
}

// Executar
gerarTokenFresh().then(token => {
  if (token) {
    console.log('\n🎉 Token pronto para uso!');
    process.exit(0);
  } else {
    console.log('\n❌ Falha na geração do token');
    process.exit(1);
  }
});
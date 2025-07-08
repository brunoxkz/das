import fetch from 'node-fetch';

async function gerarToken() {
  try {
    console.log('🔑 GERANDO NOVO TOKEN DE ACESSO\n');
    
    const response = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/login', {
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
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ TOKEN GERADO COM SUCESSO!\n');
    console.log('📋 COPIE E COLE ESTE TOKEN NA EXTENSÃO:');
    console.log('─'.repeat(80));
    console.log(data.accessToken);
    console.log('─'.repeat(80));
    
    console.log('\n🌐 URL DO SERVIDOR:');
    console.log('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev');
    
    console.log('\n🔧 COMO USAR:');
    console.log('1. Clique no ícone da extensão no Chrome');
    console.log('2. Cole a URL do servidor');
    console.log('3. Cole o token acima');
    console.log('4. Clique "Salvar Token"');
    console.log('5. Deve aparecer "✅ Conectado"');
    
    console.log('\n⏰ VALIDADE: Este token é válido por 15 minutos');
    console.log('💡 DICA: Se expirar, execute este script novamente');
    
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error.message);
  }
}

gerarToken();
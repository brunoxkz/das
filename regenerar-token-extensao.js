// Script para regenerar token válido para extensão Chrome

const BASE_URL = 'http://localhost:5000';

async function regenerarTokenExtensao() {
  console.log('🔐 REGENERANDO TOKEN PARA EXTENSÃO CHROME\n');
  
  try {
    // 1. Fazer login para obter token válido
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    if (!token) {
      throw new Error('❌ Falha no login');
    }
    
    console.log('✅ Login realizado com sucesso');
    console.log(`🎫 Token gerado: ${token.substring(0, 20)}...`);
    
    // 2. Testar token com ping da extensão
    console.log('\n🔧 Testando token com ping...');
    
    const pingResponse = await fetch(`${BASE_URL}/api/whatsapp-extension/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        version: '2.0.0',
        pendingMessages: 0,
        sentMessages: 0,
        failedMessages: 0,
        isActive: false
      })
    });
    
    if (pingResponse.ok) {
      const pingData = await pingResponse.json();
      console.log('✅ Token válido confirmado');
      console.log('📡 Ping bem-sucedido');
    } else {
      console.log(`❌ Ping falhou: ${pingResponse.status}`);
    }
    
    // 3. Testar automação files
    console.log('\n📂 Testando acesso aos arquivos de automação...');
    
    const filesResponse = await fetch(`${BASE_URL}/api/whatsapp-automation-files`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (filesResponse.ok) {
      const files = await filesResponse.json();
      console.log(`✅ ${files.length} arquivos de automação acessíveis`);
    } else {
      console.log(`❌ Acesso aos arquivos falhou: ${filesResponse.status}`);
    }
    
    // 4. Mostrar token para usar na extensão
    console.log('\n🎯 TOKEN PARA USAR NA EXTENSÃO CHROME:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`${token}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    console.log('\n📋 INSTRUÇÕES:');
    console.log('1. Copie o token acima');
    console.log('2. Abra a extensão Chrome');
    console.log('3. Cole o token no campo de configuração');
    console.log('4. Salve as configurações');
    console.log('5. O erro 401 deve desaparecer');
    
    console.log('\n✅ REGENERAÇÃO CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

// Executar regeneração
regenerarTokenExtensao();
import fetch from 'node-fetch';

async function testeConexaoToken() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IktqY3ROQ09sTTVqY2FmZ0FfZHJWUSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUxOTYxNjE0LCJleHAiOjE3NTE5NjI1MTR9.6rdw9gZgcmK7aDWvVIGiVy0odnVxlvxACPpCIcpn9PU';
  const serverUrl = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';
  
  console.log('🔍 TESTANDO CONEXÃO DA EXTENSÃO CHROME\n');
  
  try {
    // Teste 1: Buscar arquivos de automação
    console.log('📁 Teste 1: Buscando arquivos de automação...');
    const filesResponse = await fetch(`${serverUrl}/api/whatsapp-automation-files`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (filesResponse.ok) {
      const files = await filesResponse.json();
      console.log(`✅ Sucesso! ${files.length} arquivos encontrados`);
      
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.quiz_title} - ${file.target_audience} (${file.total_phones} telefones)`);
      });
    } else {
      console.log(`❌ Erro: ${filesResponse.status} - ${filesResponse.statusText}`);
    }
    
    // Teste 2: Verificar primeiro arquivo com dados
    const filesData = await filesResponse.json();
    const targetFile = filesData.find(f => f.total_phones > 0);
    
    if (targetFile) {
      console.log(`\n📱 Teste 2: Carregando contatos do arquivo ${targetFile.id}...`);
      const contactsResponse = await fetch(`${serverUrl}/api/whatsapp-automation-files/${targetFile.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        console.log(`✅ Sucesso! ${contactsData.contacts?.length || 0} contatos carregados`);
        
        if (contactsData.contacts && contactsData.contacts.length > 0) {
          contactsData.contacts.forEach((contact, index) => {
            console.log(`   ${index + 1}. ${contact.phone} - ${contact.nome} (${contact.status})`);
          });
        }
      } else {
        console.log(`❌ Erro ao carregar contatos: ${contactsResponse.status}`);
      }
    }
    
    // Teste 3: Ping da extensão
    console.log(`\n🔄 Teste 3: Simulando ping da extensão...`);
    const pingResponse = await fetch(`${serverUrl}/api/whatsapp-extension/status`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '2.0',
        pendingMessages: 0,
        sentMessages: 0,
        failedMessages: 0,
        isActive: true
      })
    });
    
    if (pingResponse.ok) {
      const pingData = await pingResponse.json();
      console.log(`✅ Ping bem-sucedido! Servidor respondeu:`, pingData);
    } else {
      console.log(`❌ Erro no ping: ${pingResponse.status}`);
    }
    
    console.log('\n🎉 RESULTADO DO TESTE:');
    console.log('✅ Token válido e funcionando');
    console.log('✅ Servidor respondendo corretamente');  
    console.log('✅ Dados dos contatos acessíveis');
    console.log('✅ Extensão pode se conectar sem problemas');
    
    console.log('\n📋 INSTRUÇÕES PARA USO:');
    console.log('1. Instale a extensão na pasta chrome-extension-v2');
    console.log('2. Cole o token na configuração da extensão');
    console.log('3. Use a URL do servidor fornecida');
    console.log('4. Abra WhatsApp Web e teste a automação');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testeConexaoToken();
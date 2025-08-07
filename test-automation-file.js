import fetch from 'node-fetch';

async function testAutomationFile() {
  try {
    // Fazer login
    const loginResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado:', loginData.message);
    
    const token = loginData.accessToken;
    
    // Criar arquivo de automação
    const automationResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quizId: 'WHbMavhPn85aA0dRyrnw3',
        targetAudience: 'all',
        dateFilter: null
      })
    });

    const automationData = await automationResponse.json();
    console.log('✅ Arquivo de automação criado:');
    console.log('📄 ID:', automationData.fileId);
    console.log('🎯 Quiz:', automationData.quizTitle);
    console.log('📱 Telefones:', automationData.phoneCount);
    
    // Verificar se o arquivo foi salvo
    const fileResponse = await fetch(`https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-files/${automationData.fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const fileData = await fileResponse.json();
    console.log('✅ Arquivo verificado:');
    console.log('📋 Contatos encontrados:', fileData.contacts?.length || 0);
    
    if (fileData.contacts && fileData.contacts.length > 0) {
      console.log('👤 Primeiro contato:');
      console.log(JSON.stringify(fileData.contacts[0], null, 2));
      
      console.log('\n📋 Todos os contatos:');
      fileData.contacts.forEach((contact, index) => {
        console.log(`\n👤 Contato ${index + 1}:`);
        console.log(`📱 Telefone: ${contact.phone}`);
        console.log(`👨‍💼 Nome: ${contact.nome || 'N/A'}`);
        console.log(`📧 Email: ${contact.email || 'N/A'}`);
        console.log(`🎂 Idade: ${contact.idade || 'N/A'}`);
        console.log(`📏 Altura: ${contact.altura || 'N/A'}`);
        console.log(`⚖️ Peso: ${contact.peso || 'N/A'}`);
        console.log(`✅ Status: ${contact.completionStatus}`);
        console.log(`📊 Progresso: ${contact.completionPercentage}%`);
        console.log(`📅 Data: ${contact.submittedAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAutomationFile();
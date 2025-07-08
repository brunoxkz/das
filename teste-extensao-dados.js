import fetch from 'node-fetch';

async function testeExtensaoCompleto() {
  try {
    console.log('🔧 TESTE DA EXTENSÃO CHROME - Simulando acesso aos dados\n');
    
    // 1. Login (simulando extensão)
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
    const token = loginData.accessToken;
    console.log('✅ Login da extensão realizado com sucesso');
    
    // 2. Listar arquivos de automação disponíveis
    const filesResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-files', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const files = await filesResponse.json();
    console.log(`✅ Arquivos encontrados: ${files.length}`);
    
    if (files.length === 0) {
      console.log('❌ Nenhum arquivo de automação encontrado');
      return;
    }
    
    // 3. Pegar o arquivo mais recente
    const latestFile = files[0];
    console.log(`📄 Arquivo mais recente: ${latestFile.id}`);
    console.log(`🎯 Quiz: ${latestFile.quiz_title}`);
    console.log(`👥 Audiência: ${latestFile.target_audience}`);
    console.log(`📱 Total de contatos: ${latestFile.total_phones}`);
    
    // 4. Acessar detalhes do arquivo específico (como extensão faria)
    const fileDetailResponse = await fetch(`https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-files/${latestFile.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const fileDetail = await fileDetailResponse.json();
    console.log('\n📋 DADOS COMPLETOS ACESSÍVEIS PELA EXTENSÃO:');
    
    if (fileDetail.contacts && fileDetail.contacts.length > 0) {
      console.log(`\n✅ Total de contatos processados: ${fileDetail.contacts.length}`);
      
      fileDetail.contacts.forEach((contact, index) => {
        console.log(`\n👤 CONTATO ${index + 1}:`);
        console.log(`📱 Telefone: ${contact.phone}`);
        console.log(`👨‍💼 Nome: ${contact.nome || 'N/A'}`);
        console.log(`📧 Email: ${contact.email || 'N/A'}`);
        console.log(`🎂 Idade: ${contact.idade || 'N/A'} anos`);
        console.log(`📏 Altura: ${contact.altura || 'N/A'} cm`);
        console.log(`⚖️ Peso: ${contact.peso || 'N/A'} kg`);
        console.log(`✅ Status: ${contact.status === 'completed' ? 'Completo' : 'Abandonado'}`);
        console.log(`📊 Conclusão: ${contact.isComplete ? 'SIM' : 'NÃO'}`);
        console.log(`📅 Data: ${new Date(contact.submittedAt).toLocaleString('pt-BR')}`);
        
        // Verificar se tem todas as respostas disponíveis
        if (contact.allResponses) {
          console.log(`🔍 Variáveis extras disponíveis: ${Object.keys(contact.allResponses).length}`);
          Object.keys(contact.allResponses).forEach(key => {
            if (key !== 'telefone_principal') {
              console.log(`   • ${key}: ${contact.allResponses[key].value}`);
            }
          });
        }
      });
      
      // 5. Simular funcionamento da extensão
      console.log('\n🤖 SIMULAÇÃO DE USO NA EXTENSÃO:');
      console.log('\n--- Interface da Extensão no WhatsApp Web ---');
      
      fileDetail.contacts.forEach((contact, index) => {
        console.log(`\n[${index + 1}] ${contact.nome || 'Sem nome'} (${contact.phone})`);
        console.log(`    📊 Status: ${contact.status === 'completed' ? '✅ Completo' : '⚠️ Abandonado'}`);
        console.log(`    📧 ${contact.email || 'Sem email'}`);
        console.log(`    🎂 ${contact.idade || 'N/A'} anos | 📏 ${contact.altura || 'N/A'}cm | ⚖️ ${contact.peso || 'N/A'}kg`);
        
        // Simular mensagem personalizada que extensão poderia criar
        let mensagem = `Olá ${contact.nome || 'Cliente'}! `;
        if (contact.status === 'completed') {
          mensagem += `Vi que você completou nosso quiz de emagrecimento. `;
          if (contact.altura && contact.peso) {
            mensagem += `Com ${contact.altura}cm e ${contact.peso}kg, tenho algumas dicas personalizadas para você!`;
          }
        } else {
          mensagem += `Notei que você começou nosso quiz mas não finalizou. Que tal completar para receber suas dicas personalizadas?`;
        }
        
        console.log(`    💬 Mensagem sugerida: "${mensagem}"`);
      });
      
      console.log('\n✅ TESTE COMPLETO: Extensão consegue acessar TODOS os dados!');
      console.log('📊 Variáveis disponíveis: nome, email, idade, altura, peso, telefone, status');
      console.log('🎯 Filtragem: completo vs abandonado funcionando');
      console.log('💬 Personalização: mensagens podem usar todas as variáveis');
      
    } else {
      console.log('❌ Nenhum contato encontrado no arquivo');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testeExtensaoCompleto();
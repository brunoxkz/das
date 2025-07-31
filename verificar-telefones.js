import fetch from 'node-fetch';

async function verificarTelefones() {
  try {
    console.log('📞 VERIFICANDO TELEFONES DISPONÍVEIS PARA AUTOMAÇÃO\n');
    
    // Login
    const loginResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vendzz.com', password: 'admin123' })
    });

    const { accessToken } = await loginResponse.json();
    console.log('✅ Login realizado');
    
    // Buscar arquivos
    const filesResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-files', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const files = await filesResponse.json();
    console.log(`📁 ${files.length} arquivos encontrados\n`);
    
    // Verificar telefones em cada arquivo
    for (const file of files) {
      if (file.total_phones > 0) {
        console.log(`📂 ARQUIVO: ${file.quiz_title} - ${file.target_audience}`);
        console.log(`   📊 Total de telefones: ${file.total_phones}`);
        
        // Carregar contatos do arquivo
        const contactsResponse = await fetch(`https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-files/${file.id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const contactsData = await contactsResponse.json();
        
        if (contactsData.contacts && contactsData.contacts.length > 0) {
          contactsData.contacts.forEach((contact, index) => {
            // Validar formato do telefone
            const phone = contact.phone;
            const cleanPhone = phone.replace(/\D/g, '');
            
            let validation = '✅ VÁLIDO';
            let format = 'Padrão brasileiro';
            
            if (cleanPhone.length < 10 || cleanPhone.length > 15) {
              validation = '❌ INVÁLIDO (tamanho)';
            } else if (cleanPhone.length === 11 && cleanPhone.startsWith('11')) {
              format = 'Celular SP (11)';
            } else if (cleanPhone.length === 11 && cleanPhone.startsWith('21')) {
              format = 'Celular RJ (21)';
            } else if (cleanPhone.length === 10) {
              format = 'Fixo brasileiro';
            } else if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
              format = 'Com código país (+55)';
            }
            
            console.log(`   📱 ${index + 1}. ${phone} → ${cleanPhone} (${format}) ${validation}`);
            console.log(`      👤 ${contact.nome || 'Sem nome'} - ${contact.status || 'Sem status'}`);
            
            // Simular formatação que será usada na extensão
            let formattedPhone = cleanPhone;
            if (cleanPhone.length === 11 && (cleanPhone.startsWith('11') || cleanPhone.startsWith('21'))) {
              formattedPhone = `55${cleanPhone}`;
            }
            console.log(`      🔄 Formato final: +${formattedPhone}`);
            console.log('');
          });
        }
        console.log('─'.repeat(60));
      }
    }
    
    console.log('\n📋 RESUMO DA VALIDAÇÃO:');
    console.log('✅ Telefones brasileiros (11 dígitos): Serão formatados como +5511XXXXXXXXX');
    console.log('✅ Telefones com código país (13 dígitos): Mantidos como estão');
    console.log('✅ Outros formatos: Tentativa automática com +55');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. A extensão validará automaticamente cada telefone');
    console.log('2. Telefones inválidos serão pulados com log de erro');
    console.log('3. Telefones válidos tentarão abrir conversa no WhatsApp');
    console.log('4. Se a conversa abrir, a mensagem será enviada');
    
    console.log('\n⚠️ IMPORTANTE:');
    console.log('• A extensão tentará múltiplos formatos para cada telefone');
    console.log('• Logs detalhados aparecerão no console do navegador');
    console.log('• Teste primeiro com um telefone conhecido seu');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarTelefones();
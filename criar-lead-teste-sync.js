// Criar um lead de teste para testar a sincronização automática
import fetch from 'node-fetch';

async function criarLeadTeste() {
  try {
    // Login
    const loginResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    console.log('✅ Login realizado');
    
    // Criar uma nova resposta no quiz Qm4wxpfPgkMrwoMhDFNLZ
    const novoTelefone = `1199${Math.floor(Math.random() * 10000000)}`;
    const novoNome = `Lead Teste ${Date.now()}`;
    
    const responses = {
      nome: novoNome,
      telefone_principal: novoTelefone,
      email: `${novoTelefone}@teste.com`,
      idade: '28'
    };

    const metadata = {
      isComplete: true,
      completionPercentage: 100,
      isPartial: false
    };

    const submitResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        responses,
        metadata
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`Submit failed: ${submitResponse.status}`);
    }

    console.log(`✅ Lead criado: ${novoNome} - ${novoTelefone}`);
    
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Testar sincronização com timestamp de 10 segundos atrás
    const lastSync = new Date(Date.now() - 10000).toISOString();
    const userId = loginData.user.id; // Usar o ID real do usuário
    
    const syncResponse = await fetch(`https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync?lastSync=${lastSync}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!syncResponse.ok) {
      throw new Error(`Sync failed: ${syncResponse.status}`);
    }
    
    const syncData = await syncResponse.json();
    
    console.log('🔄 Resultado da sincronização:', {
      hasUpdates: syncData.hasUpdates,
      newLeads: syncData.newLeads?.length || 0,
      lastUpdate: syncData.lastUpdate
    });
    
    if (syncData.hasUpdates && syncData.newLeads?.length > 0) {
      const leadEncontrado = syncData.newLeads.find(lead => lead.phone === novoTelefone);
      
      if (leadEncontrado) {
        console.log('🎉 SUCESSO: Lead encontrado na sincronização!');
        console.log(`📱 Telefone: ${leadEncontrado.phone}`);
        console.log(`👤 Nome: ${leadEncontrado.nome}`);
        console.log(`✅ Status: ${leadEncontrado.isComplete ? 'Completo' : 'Abandonado'}`);
        
        console.log('\n🔧 A extensão Chrome receberá automaticamente:');
        console.log('- Novo lead detectado');
        console.log('- Adicionado à fila de automação se a automação estiver ativa');
        console.log('- Interface atualizada com novo contato');
        
      } else {
        console.log('❌ Lead não encontrado na sincronização');
      }
    } else {
      console.log('❌ Nenhum novo lead detectado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

criarLeadTeste();
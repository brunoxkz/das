import fetch from 'node-fetch';

async function testarSync() {
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
    const userId = loginData.user.id;
    
    console.log('Login sucesso:', { userId, token: token.substring(0, 30) + '...' });
    
    // Primeiro, vamos testar o endpoint normal de arquivo
    console.log('\n1. Testando endpoint normal de arquivo...');
    const normalResponse = await fetch(`https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status normal:', normalResponse.status);
    
    if (normalResponse.ok) {
      const normalData = await normalResponse.json();
      console.log('Dados recebidos - contacts:', normalData.contacts?.length || 0);
      console.log('lastUpdate:', normalData.lastUpdate);
      
      // Agora vamos testar o endpoint de sincronização
      console.log('\n2. Testando endpoint de sincronização...');
      const lastSync = new Date(Date.now() - 60000).toISOString();
      
      const syncResponse = await fetch(`https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/whatsapp-automation-file/${userId}/Qm4wxpfPgkMrwoMhDFNLZ/sync?lastSync=${lastSync}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status sync:', syncResponse.status);
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log('Dados sincronização:', syncData);
      } else {
        const errorData = await syncResponse.json();
        console.error('Erro sincronização:', errorData);
      }
    } else {
      console.error('Endpoint normal falhou:', normalResponse.status);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testarSync();
/**
 * TESTE CAMPANHA TIPO - Verificar se sistema aceita campaignType
 */

let token = null;

async function authenticate() {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  return data.token;
}

async function testeCampanhaTipo() {
  console.log('🧪 TESTE: Criação de campanha com tipo');
  
  try {
    // 0. Autenticar
    console.log('🔐 Autenticando...');
    token = await authenticate();
    console.log('✅ Token obtido');
    
    // 1. Buscar quizzes
    const quizzesResponse = await fetch('http://localhost:5000/api/quizzes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const quizzes = await quizzesResponse.json();
    console.log(`✅ Quizzes encontrados: ${quizzes.length}`);
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado');
      return;
    }
    
    // 2. Criar campanha de remarketing
    const campanhaRemarketing = {
      name: 'Teste Remarketing',
      subject: 'Oferta especial para você, {nome}!',
      content: 'Olá {nome}, não perca esta oportunidade exclusiva!',
      quizId: quizzes[0].id,
      campaignType: 'remarketing',
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: 10,
      triggerUnit: 'minutes',
      dateFilter: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 dias atrás
      variables: []
    };
    
    const remarketingResponse = await fetch('http://localhost:5000/api/email-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campanhaRemarketing)
    });
    
    if (remarketingResponse.ok) {
      const remarketingResult = await remarketingResponse.json();
      console.log('✅ Campanha de remarketing criada:', remarketingResult.id);
    } else {
      const error = await remarketingResponse.text();
      console.log('❌ Erro ao criar campanha de remarketing:', error);
    }
    
    // 3. Criar campanha ao vivo
    const campanhaLive = {
      name: 'Teste Campanha Ao Vivo',
      subject: 'Bem-vindo, {nome}!',
      content: 'Olá {nome}, obrigado por responder nosso quiz!',
      quizId: quizzes[0].id,
      campaignType: 'live',
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: 5,
      triggerUnit: 'minutes',
      dateFilter: null,
      variables: []
    };
    
    const liveResponse = await fetch('http://localhost:5000/api/email-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campanhaLive)
    });
    
    if (liveResponse.ok) {
      const liveResult = await liveResponse.json();
      console.log('✅ Campanha ao vivo criada:', liveResult.id);
    } else {
      const error = await liveResponse.text();
      console.log('❌ Erro ao criar campanha ao vivo:', error);
    }
    
    // 4. Listar todas as campanhas
    const campaignsResponse = await fetch('http://localhost:5000/api/email-campaigns', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (campaignsResponse.ok) {
      const campaigns = await campaignsResponse.json();
      console.log(`✅ Total de campanhas: ${campaigns.length}`);
      
      campaigns.forEach(campaign => {
        console.log(`  - ${campaign.name} (${campaign.campaignType || 'N/A'}) - Status: ${campaign.status}`);
      });
    } else {
      const error = await campaignsResponse.text();
      console.log('❌ Erro ao listar campanhas:', error);
    }
    
    console.log('\n🏁 TESTE CONCLUÍDO');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testeCampanhaTipo();
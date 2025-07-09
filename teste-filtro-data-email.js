import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';

async function testDateFilter() {
  console.log('📅 TESTE FILTRO DE DATA - CAMPANHAS EMAIL');
  
  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Erro no login:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login realizado:', loginData.user.email);
    
    const token = loginData.token;
    
    // 2. Testar diretamente o filtro de data no endpoint que processa campanhas
    console.log('\n🎯 TESTANDO FILTRO DE DATA NAS CAMPANHAS');
    
    // Criar uma campanha de teste com filtro de data
    const testCampaignPayload = {
      name: 'Teste Filtro Data',
      quizId: 'Qm4wxpfPgkMrwoMhDFNLZ', // Quiz que sabemos que tem respostas
      subject: 'Teste',
      content: 'Teste',
      targetAudience: 'all',
      dateFilter: '2025-01-08T00:00:00.000Z' // Data de ontem
    };
    
    console.log('📤 Criando campanha de teste...');
    const createCampaignResponse = await fetch(`${baseUrl}/api/email-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testCampaignPayload)
    });
    
    if (!createCampaignResponse.ok) {
      console.error('❌ Erro ao criar campanha:', await createCampaignResponse.text());
      return;
    }
    
    const campaignResult = await createCampaignResponse.json();
    console.log('✅ Campanha criada:', campaignResult.campaign.name);
    
    // 3. Testar com filtro de data muito restritivo (data futura)
    console.log('\n🔮 TESTANDO FILTRO COM DATA FUTURA');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    const futureCampaignPayload = {
      name: 'Teste Filtro Data Futura',
      quizId: 'Qm4wxpfPgkMrwoMhDFNLZ',
      subject: 'Teste',
      content: 'Teste',
      targetAudience: 'all',
      dateFilter: futureDate.toISOString()
    };
    
    const futureCampaignResponse = await fetch(`${baseUrl}/api/email-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(futureCampaignPayload)
    });
    
    if (!futureCampaignResponse.ok) {
      console.error('❌ Erro ao criar campanha futura:', await futureCampaignResponse.text());
      return;
    }
    
    const futureCampaignResult = await futureCampaignResponse.json();
    console.log('✅ Campanha futura criada:', futureCampaignResult.campaign.name);
    
    // 4. Testar sem filtro de data
    console.log('\n🌐 TESTANDO SEM FILTRO DE DATA');
    
    const noFilterCampaignPayload = {
      name: 'Teste Sem Filtro',
      quizId: 'Qm4wxpfPgkMrwoMhDFNLZ',
      subject: 'Teste',
      content: 'Teste',
      targetAudience: 'all'
    };
    
    const noFilterCampaignResponse = await fetch(`${baseUrl}/api/email-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noFilterCampaignPayload)
    });
    
    if (!noFilterCampaignResponse.ok) {
      console.error('❌ Erro ao criar campanha sem filtro:', await noFilterCampaignResponse.text());
      return;
    }
    
    const noFilterCampaignResult = await noFilterCampaignResponse.json();
    console.log('✅ Campanha sem filtro criada:', noFilterCampaignResult.campaign.name);
    
    // 5. Comparar os resultados
    console.log('\n📊 COMPARANDO RESULTADOS:');
    console.log(`  Campanha com filtro (ontem): ${campaignResult.stats?.totalEmails || 0} emails`);
    console.log(`  Campanha filtro futuro: ${futureCampaignResult.stats?.totalEmails || 0} emails`);
    console.log(`  Campanha sem filtro: ${noFilterCampaignResult.stats?.totalEmails || 0} emails`);
    
    // Verificar se o filtro está funcionando
    if (futureCampaignResult.stats?.totalEmails === 0) {
      console.log('✅ FILTRO DE DATA FUNCIONANDO - Filtro futuro retornou 0 emails (correto)');
    } else {
      console.log('❌ POSSÍVEL PROBLEMA - Filtro futuro deveria retornar 0 emails');
    }
    
    if (noFilterCampaignResult.stats?.totalEmails >= campaignResult.stats?.totalEmails) {
      console.log('✅ FILTRO DE DATA FUNCIONANDO - Campanha sem filtro tem mais ou igual emails que com filtro');
    } else {
      console.log('❌ POSSÍVEL PROBLEMA - Campanha sem filtro tem menos emails que com filtro');
    }
    
    console.log('\n✅ TESTE FILTRO DE DATA CONCLUÍDO');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  }
}

testDateFilter();
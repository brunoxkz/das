// Script para investigar o problema do quiz_id

const BASE_URL = 'http://localhost:5000';

async function investigarQuizId() {
  console.log('🔍 INVESTIGANDO PROBLEMA DO QUIZ_ID\n');
  
  try {
    // 1. Fazer login
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
    
    // 2. Buscar campanhas via API
    console.log('📊 Buscando campanhas via API...');
    const campaignsResponse = await fetch(`${BASE_URL}/api/whatsapp-campaigns`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const campaigns = await campaignsResponse.json();
    
    console.log(`\n📋 TOTAL DE CAMPANHAS: ${campaigns.length}`);
    
    campaigns.forEach((campaign, index) => {
      console.log(`\n${index + 1}. ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   quiz_id (raw): ${campaign.quiz_id}`);
      console.log(`   quizId (mapped): ${campaign.quizId}`);
      console.log(`   Tipo quiz_id: ${typeof campaign.quiz_id}`);
      console.log(`   Tipo quizId: ${typeof campaign.quizId}`);
      console.log(`   quiz_id undefined? ${campaign.quiz_id === undefined}`);
      console.log(`   quizId undefined? ${campaign.quizId === undefined}`);
    });
    
    // 3. Contar campanhas com problemas
    const campanhasComProblema = campaigns.filter(c => !c.quizId || c.quizId === 'undefined');
    const campanhasOK = campaigns.filter(c => c.quizId && c.quizId !== 'undefined');
    
    console.log(`\n📊 RESUMO:`);
    console.log(`   ✅ Campanhas OK: ${campanhasOK.length}`);
    console.log(`   ❌ Campanhas com problema: ${campanhasComProblema.length}`);
    
    if (campanhasComProblema.length > 0) {
      console.log(`\n❌ CAMPANHAS COM PROBLEMAS:`);
      campanhasComProblema.forEach(c => {
        console.log(`   - ${c.name} (ID: ${c.id})`);
      });
    }
    
    if (campanhasOK.length > 0) {
      console.log(`\n✅ CAMPANHAS FUNCIONAIS:`);
      campanhasOK.forEach(c => {
        console.log(`   - ${c.name} (ID: ${c.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

// Executar investigação
investigarQuizId();
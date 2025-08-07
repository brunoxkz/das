import fetch from 'node-fetch';

async function testPlanEndpoint() {
  const planId = 'z23NydfPqlN6tbfAp9SAa';
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🔍 Testando endpoint PÚBLICO do plano:', planId);
    
    const response = await fetch(`${baseUrl}/api/public/plans/${planId}`);
    const data = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 404) {
      console.log('❌ Plano não encontrado - vamos verificar se existe no banco');
      
      // Verificar se o plano existe diretamente
      const allPlansResponse = await fetch(`${baseUrl}/api/stripe/plans/test`);
      const allPlansData = await allPlansResponse.json();
      
      console.log('📋 Todos os planos:', JSON.stringify(allPlansData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testPlanEndpoint();
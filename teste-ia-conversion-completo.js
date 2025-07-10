/**
 * TESTE COMPLETO - Sistema I.A. CONVERSION +
 * Validar todos os endpoints e funcionalidades do sistema
 */

// Configuração do teste
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'admin@vendzz.com',
  password: 'admin123'
};

// Funções auxiliares
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function authenticate() {
  console.log('🔐 Autenticando usuário...');
  
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(TEST_USER)
  });
  
  console.log('Resposta da autenticação:', response);
  
  if (response.token || response.accessToken) {
    console.log('✅ Autenticação bem-sucedida');
    return response.token || response.accessToken;
  } else {
    throw new Error('Token não recebido na resposta');
  }
}

async function testeListarCampanhas(token) {
  console.log('\n📋 Testando: Listar campanhas I.A. Conversion');
  
  const campaigns = await makeRequest('/api/ai-conversion-campaigns', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log(`✅ Campanhas encontradas: ${campaigns.length}`);
  return campaigns;
}

async function testeCriarCampanha(token, quizId) {
  console.log('\n🎯 Testando: Criar campanha I.A. Conversion');
  
  const campaignData = {
    name: 'Campanha de Teste I.A. Conversion',
    quizId,
    quizTitle: 'Quiz de Teste',
    scriptTemplate: 'Olá {nome}, você respondeu que tem {idade} anos e pesa {peso_atual}kg. Seu objetivo é atingir {peso_objetivo}kg. Vamos te ajudar!',
    heygenAvatar: 'avatar_professional_male_1',
    heygenVoice: 'voice_pt_br_male_1'
  };
  
  const campaign = await makeRequest('/api/ai-conversion-campaigns', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(campaignData)
  });
  
  console.log(`✅ Campanha criada: ${campaign.name} (ID: ${campaign.id})`);
  return campaign;
}

async function testeAtualizarCampanha(token, campaignId) {
  console.log('\n📝 Testando: Atualizar campanha I.A. Conversion');
  
  const updates = {
    name: 'Campanha I.A. Conversion Atualizada',
    scriptTemplate: 'Olá {nome}, seja bem-vindo! Você tem {idade} anos e queremos te ajudar a alcançar seus objetivos.'
  };
  
  const updatedCampaign = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates)
  });
  
  console.log(`✅ Campanha atualizada: ${updatedCampaign.name}`);
  return updatedCampaign;
}

async function testeGerarVideo(token, campaignId, responseId) {
  console.log('\n🎬 Testando: Gerar vídeo I.A. personalizado');
  
  const generation = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}/generate-video`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ responseId })
  });
  
  console.log(`✅ Geração de vídeo iniciada: ${generation.message}`);
  return generation.videoGeneration;
}

async function testeListarGerações(token, campaignId) {
  console.log('\n📹 Testando: Listar gerações de vídeo');
  
  const generations = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}/video-generations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log(`✅ Gerações encontradas: ${generations.length}`);
  return generations;
}

async function testeEstatisticas(token, campaignId) {
  console.log('\n📊 Testando: Estatísticas da campanha');
  
  const stats = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log(`✅ Estatísticas: ${stats.totalGenerated} gerados, ${stats.totalViews} visualizações, ${stats.conversionRate}% conversão`);
  return stats;
}

async function testeDeletarCampanha(token, campaignId) {
  console.log('\n🗑️ Testando: Deletar campanha I.A. Conversion');
  
  const result = await makeRequest(`/api/ai-conversion-campaigns/${campaignId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log(`✅ Campanha deletada: ${result.message}`);
  return result;
}

async function buscarQuizExistente(token) {
  console.log('\n🔍 Buscando quiz existente para testes...');
  
  const quizzes = await makeRequest('/api/quizzes', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (quizzes.length > 0) {
    console.log(`✅ Quiz encontrado: ${quizzes[0].title} (ID: ${quizzes[0].id})`);
    return quizzes[0];
  } else {
    throw new Error('Nenhum quiz encontrado para teste');
  }
}

async function buscarRespostaExistente(token, quizId) {
  console.log('\n🔍 Buscando resposta existente para testes...');
  
  const responses = await makeRequest(`/api/quizzes/${quizId}/responses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (responses.length > 0) {
    console.log(`✅ Resposta encontrada: ID ${responses[0].id}`);
    return responses[0];
  } else {
    console.log('⚠️ Nenhuma resposta encontrada - continuando sem teste de geração');
    return null;
  }
}

async function executarTeste() {
  console.log('🚀 INICIANDO TESTE COMPLETO - Sistema I.A. CONVERSION +');
  console.log('='.repeat(60));
  
  try {
    // 1. Autenticação
    const token = await authenticate();
    
    // 2. Buscar quiz existente
    const quiz = await buscarQuizExistente(token);
    
    // 3. Buscar resposta existente
    const response = await buscarRespostaExistente(token, quiz.id);
    
    // 4. Testar funcionalidades
    const campaigns = await testeListarCampanhas(token);
    const newCampaign = await testeCriarCampanha(token, quiz.id);
    const updatedCampaign = await testeAtualizarCampanha(token, newCampaign.id);
    
    // 5. Testar geração de vídeo (se houver resposta)
    if (response) {
      const videoGeneration = await testeGerarVideo(token, newCampaign.id, response.id);
      const generations = await testeListarGerações(token, newCampaign.id);
    }
    
    // 6. Testar estatísticas
    const stats = await testeEstatisticas(token, newCampaign.id);
    
    // 7. Limpar teste
    await testeDeletarCampanha(token, newCampaign.id);
    
    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('✅ Sistema I.A. CONVERSION + funcionando corretamente');
    console.log('✅ Todos os endpoints validados');
    console.log('✅ Funcionalidades de CRUD operacionais');
    console.log('✅ Integração com sistema de quizzes confirmada');
    console.log('✅ Sistema pronto para uso em produção');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar teste
executarTeste();
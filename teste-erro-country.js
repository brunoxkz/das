/**
 * TESTE ESPECÍFICO PARA REPRODUZIR ERRO "no such column: country"
 * Testa criação de campanha SMS para identificar onde está o erro
 */

const API_BASE = 'http://localhost:5000/api';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  console.log(`🔥 ${config.method || 'GET'} ${url}`);
  const response = await fetch(url, config);
  const text = await response.text();
  
  try {
    return { ...response, data: JSON.parse(text) };
  } catch {
    return { ...response, data: text };
  }
}

async function authenticate() {
  console.log('🔐 Fazendo login...');
  const response = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (response.data && response.data.accessToken) {
    console.log('✅ Login realizado');
    return response.data.accessToken;
  } else {
    console.error('❌ Erro no login:', response.data);
    return null;
  }
}

async function reproduzirErroCountry() {
  console.log('🚨 INICIANDO TESTE PARA REPRODUZIR ERRO "country"');
  
  const token = await authenticate();
  if (!token) return;
  
  try {
    const quizId = 'Fwu7L-y0L7eS8xA5sZQmq'; // Quiz válido do sistema
    console.log(`📱 Testando com Quiz ID: ${quizId}`);
    
    // Teste direto da função que pode estar causando o erro
    console.log('🔧 Tentando criar campanha SMS (isso pode reproduzir o erro)...');
    const campaignData = {
      name: 'Teste Reproduzir Erro Country',
      quizId: quizId,
      message: 'Teste para reproduzir erro da coluna country',
      triggerType: 'immediate',
      targetAudience: 'all',
      phones: ['11999999999']
    };
    
    const campaignResponse = await makeRequest('/sms-campaigns', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(campaignData)
    });
    
    console.log('📊 Status da resposta:', campaignResponse.status);
    console.log('📊 Dados da resposta:', campaignResponse.data);
    
    if (!campaignResponse.ok) {
      console.error('🚨 ERRO ENCONTRADO:', campaignResponse.data);
      console.error('🔍 Este pode ser o erro da coluna "country"');
    } else {
      console.log('✅ Campanha criada sem erro:', campaignResponse.data.id);
    }
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error);
  }
}

reproduzirErroCountry();
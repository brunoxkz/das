/**
 * TESTE DE PERSONALIZAÇÃO SMS - Verificar se SMS está usando variáveis dinâmicas
 * Testa se {nome_completo} e {email_contato} estão sendo substituídos corretamente
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

async function authenticate() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  return response.token;
}

async function testarPersonalizacaoSMS() {
  console.log('🔍 INICIANDO TESTE DE PERSONALIZAÇÃO SMS');
  
  try {
    // Autenticar
    const token = await authenticate();
    console.log('✅ Autenticado com sucesso');
    
    // Buscar um quiz com respostas para teste
    const quizzes = await makeRequest('/api/quizzes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado');
      return;
    }
    
    const quiz = quizzes[0];
    console.log(`📋 Usando quiz: ${quiz.title} (ID: ${quiz.id})`);
    
    // Buscar telefones deste quiz
    const phones = await makeRequest(`/api/quizzes/${quiz.id}/phones`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (phones.length === 0) {
      console.log('❌ Nenhum telefone encontrado neste quiz');
      return;
    }
    
    console.log(`📱 Encontrados ${phones.length} telefones com dados:`);
    phones.forEach(phone => {
      console.log(`  - ${phone.telefone || phone.phone}: ${phone.name || 'Sem nome'}`);
    });
    
    // Criar campanha SMS com variáveis personalizadas
    const mensagemPersonalizada = `Olá {nome_completo}! Parabéns por participar do nosso quiz. Seu email {email_contato} foi registrado com sucesso. Obrigado pelo seu interesse!`;
    
    const campaignData = {
      name: 'TESTE PERSONALIZAÇÃO SMS',
      quizId: quiz.id,
      message: mensagemPersonalizada,
      targetAudience: 'completed',
      triggerType: 'immediate'
    };
    
    console.log(`📝 Criando campanha com mensagem personalizada:`);
    console.log(`   "${mensagemPersonalizada}"`);
    
    const campaign = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(campaignData)
    });
    
    console.log('✅ Campanha criada com sucesso:', campaign.id);
    
    // Aguardar um pouco para processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar logs da campanha para ver se as variáveis foram substituídas
    const logs = await makeRequest(`/api/sms-campaigns/${campaign.id}/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 ANÁLISE DOS LOGS (${logs.length} registros):`);
    
    logs.forEach(log => {
      console.log(`📱 ${log.phone}:`);
      console.log(`   Mensagem: "${log.message}"`);
      console.log(`   Status: ${log.status}`);
      
      // Verificar se variáveis foram substituídas
      if (log.message.includes('{nome_completo}') || log.message.includes('{email_contato}')) {
        console.log(`   ❌ ERRO: Variáveis NÃO foram substituídas!`);
      } else {
        console.log(`   ✅ SUCESSO: Variáveis foram substituídas corretamente!`);
      }
      console.log('');
    });
    
    // Excluir campanha de teste
    await makeRequest(`/api/sms-campaigns/${campaign.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('🗑️ Campanha de teste excluída');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste
testarPersonalizacaoSMS();
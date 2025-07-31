/**
 * TESTE DIRETO DO SISTEMA DE LOGS
 * Testa diretamente a criação e leitura de logs de email
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function login() {
  console.log('🔐 Fazendo login...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    }),
  });

  const data = await response.json();
  return data.accessToken;
}

async function testEmailSystemWithLogs(token) {
  console.log('📧 Testando sistema completo com logs...');
  
  const quizId = 'ey15ofZ96pBzDIWv_k19T'; // Quiz que tem emails
  
  // Criar campanha que deveria gerar logs
  const campaignData = {
    name: 'Teste Sistema de Logs',
    quizId: quizId,
    subject: 'Teste de logs - {nome}',
    content: `
      <h2>Olá {nome}!</h2>
      <p>Este é um teste do sistema de logs.</p>
      <p>Email: {email}</p>
      <p>Idade: {idade}</p>
    `,
    targetAudience: 'all',
    triggerType: 'immediate',
    triggerDelay: 0,
    triggerUnit: 'minutes'
  };

  console.log('\n📬 Criando campanha...');
  const campaignResponse = await fetch(`${BASE_URL}/api/email-campaigns`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(campaignData)
  });

  const campaignResult = await campaignResponse.json();
  console.log('✅ Campanha criada:', campaignResult.campaignId);
  
  if (!campaignResult.success) {
    console.error('❌ Erro ao criar campanha:', campaignResult.error);
    return;
  }

  // Aguardar processamento
  console.log('\n⏳ Aguardando processamento...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verificar logs imediatamente
  console.log('\n📋 Verificando logs...');
  const logsResponse = await fetch(`${BASE_URL}/api/email-campaigns/${campaignResult.campaignId}/logs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const logs = await logsResponse.json();
  console.log(`✅ ${logs.length} logs encontrados`);
  
  if (logs.length > 0) {
    console.log('\n📧 LOGS DETALHADOS:');
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.email} - Status: ${log.status}`);
      console.log(`   Assunto: ${log.personalizedSubject}`);
      console.log(`   Criado em: ${new Date(log.createdAt * 1000).toLocaleString()}`);
      if (log.errorMessage) {
        console.log(`   Erro: ${log.errorMessage}`);
      }
    });
  } else {
    console.log('❌ Nenhum log encontrado - sistema pode ter problema');
  }

  // Verificar estatísticas da campanha
  console.log('\n📊 Verificando estatísticas...');
  const campaignStatsResponse = await fetch(`${BASE_URL}/api/email-campaigns/${campaignResult.campaignId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const campaignStats = await campaignStatsResponse.json();
  console.log(`📧 Campanha: ${campaignStats.name}`);
  console.log(`📊 Status: ${campaignStats.status}`);
  console.log(`📊 Enviados: ${campaignStats.sent || 0}`);
  console.log(`📊 Entregues: ${campaignStats.delivered || 0}`);
  
  return {
    campaignId: campaignResult.campaignId,
    logsCount: logs.length,
    sentCount: campaignStats.sent || 0
  };
}

async function main() {
  try {
    const token = await login();
    const result = await testEmailSystemWithLogs(token);
    
    console.log('\n🎯 RESULTADO DO TESTE:');
    console.log(`📧 Campanha ID: ${result.campaignId}`);
    console.log(`📋 Logs criados: ${result.logsCount}`);
    console.log(`📊 Emails enviados: ${result.sentCount}`);
    
    if (result.logsCount > 0) {
      console.log('✅ Sistema de logs funcionando corretamente!');
    } else {
      console.log('❌ Sistema de logs NÃO está funcionando');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

main();
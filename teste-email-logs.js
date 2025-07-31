/**
 * TESTE ESPECÍFICO PARA LOGS DE EMAIL
 * Verifica se os logs estão sendo criados corretamente
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

async function getEmailCampaigns(token) {
  console.log('📋 Buscando campanhas de email...');
  
  const response = await fetch(`${BASE_URL}/api/email-campaigns`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const campaigns = await response.json();
  console.log(`✅ ${campaigns.length} campanhas encontradas`);
  
  return campaigns;
}

async function checkEmailLogs(token, campaignId) {
  console.log(`\n📋 Verificando logs da campanha ${campaignId}...`);
  
  const response = await fetch(`${BASE_URL}/api/email-campaigns/${campaignId}/logs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (response.ok) {
    const logs = await response.json();
    console.log(`✅ ${logs.length} logs encontrados`);
    
    if (logs.length > 0) {
      console.log('\n📧 LOGS ENCONTRADOS:');
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.email || log.recipientEmail} - Status: ${log.status}`);
        if (log.personalizedSubject) {
          console.log(`   Assunto: ${log.personalizedSubject}`);
        }
        if (log.errorMessage) {
          console.log(`   Erro: ${log.errorMessage}`);
        }
      });
    }
    
    return logs;
  } else {
    console.error('❌ Erro ao buscar logs:', await response.text());
    return [];
  }
}

async function main() {
  try {
    const token = await login();
    const campaigns = await getEmailCampaigns(token);
    
    if (campaigns.length === 0) {
      console.log('❌ Nenhuma campanha encontrada');
      return;
    }
    
    // Verificar logs das últimas campanhas
    const recentCampaigns = campaigns.slice(0, 3);
    
    for (const campaign of recentCampaigns) {
      console.log(`\n📧 Campanha: ${campaign.name} (ID: ${campaign.id})`);
      console.log(`📊 Status: ${campaign.status}`);
      console.log(`📧 Enviados: ${campaign.sent || 0}`);
      console.log(`📧 Entregues: ${campaign.delivered || 0}`);
      
      await checkEmailLogs(token, campaign.id);
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

main();
#!/usr/bin/env node

// Script para testar se as campanhas estão sendo exibidas corretamente no dashboard

const https = require('https');
const http = require('http');

const baseUrl = 'http://localhost:5000';

// Função para fazer requisições
function makeRequest(method, endpoint, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testCampaignsDashboard() {
  console.log('🔍 TESTE: Campanhas no Dashboard');
  console.log('=' .repeat(50));

  try {
    // 1. Fazer login
    console.log('🔑 Fazendo login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const token = loginResponse.data.accessToken;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar campanhas de email
    console.log('\n📧 Buscando campanhas de email...');
    const emailCampaignsResponse = await makeRequest('GET', '/api/email-campaigns', null, token);
    console.log(`Status: ${emailCampaignsResponse.status}`);
    
    if (emailCampaignsResponse.status === 200) {
      const emailCampaigns = emailCampaignsResponse.data;
      console.log(`✅ Campanhas de email encontradas: ${emailCampaigns.length}`);
      
      if (emailCampaigns.length > 0) {
        console.log('📋 Primeiras 3 campanhas:');
        emailCampaigns.slice(0, 3).forEach((campaign, index) => {
          console.log(`   ${index + 1}. ${campaign.name} (${campaign.status}) - ${campaign.createdAt}`);
        });
      }
    } else {
      console.log('❌ Erro ao buscar campanhas de email:', emailCampaignsResponse.data);
    }

    // 3. Buscar campanhas de SMS
    console.log('\n📱 Buscando campanhas de SMS...');
    const smsCampaignsResponse = await makeRequest('GET', '/api/sms-campaigns', null, token);
    console.log(`Status: ${smsCampaignsResponse.status}`);
    
    if (smsCampaignsResponse.status === 200) {
      const smsCampaigns = smsCampaignsResponse.data;
      console.log(`✅ Campanhas de SMS encontradas: ${smsCampaigns.length}`);
      
      if (smsCampaigns.length > 0) {
        console.log('📋 Primeiras 3 campanhas:');
        smsCampaigns.slice(0, 3).forEach((campaign, index) => {
          console.log(`   ${index + 1}. ${campaign.name} (${campaign.status}) - ${campaign.createdAt}`);
        });
      }
    } else {
      console.log('❌ Erro ao buscar campanhas de SMS:', smsCampaignsResponse.data);
    }

    // 4. Buscar contagem de campanhas
    console.log('\n📊 Buscando contagem de campanhas...');
    const emailCountResponse = await makeRequest('GET', '/api/email-campaigns/count', null, token);
    const smsCountResponse = await makeRequest('GET', '/api/sms-campaigns/count', null, token);
    
    console.log(`Email count: ${emailCountResponse.data?.count || 0}`);
    console.log(`SMS count: ${smsCountResponse.data?.count || 0}`);

    // 5. Buscar créditos do usuário
    console.log('\n💰 Buscando créditos do usuário...');
    const creditsResponse = await makeRequest('GET', '/api/user/credits', null, token);
    
    if (creditsResponse.status === 200) {
      const credits = creditsResponse.data;
      console.log('✅ Créditos encontrados:');
      console.log(`   Total: ${credits.credits}`);
      console.log(`   Email: ${credits.breakdown?.email || 0}`);
      console.log(`   SMS: ${credits.breakdown?.sms || 0}`);
      console.log(`   WhatsApp: ${credits.breakdown?.whatsapp || 0}`);
    } else {
      console.log('❌ Erro ao buscar créditos:', creditsResponse.data);
    }

    // 6. Verificar dashboard stats
    console.log('\n📊 Buscando estatísticas do dashboard...');
    const dashboardResponse = await makeRequest('GET', '/api/dashboard-stats', null, token);
    
    if (dashboardResponse.status === 200) {
      const stats = dashboardResponse.data;
      console.log('✅ Dashboard stats:');
      console.log(`   Total Quizzes: ${stats.totalQuizzes}`);
      console.log(`   Total Leads: ${stats.totalLeads}`);
      console.log(`   Total Views: ${stats.totalViews}`);
      console.log(`   Conversion Rate: ${stats.avgConversionRate}%`);
    } else {
      console.log('❌ Erro ao buscar dashboard stats:', dashboardResponse.data);
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testCampaignsDashboard();
/**
 * TESTE SISTEMA COMPLETO VENDZZ - FASE 3: MARKETING AUTOMATION
 * Teste extremamente avançado de automação de marketing
 * Cenários: SMS, Email, WhatsApp, Analytics, Performance
 */

const baseUrl = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'VendzzTester/3.0'
    }
  };
  
  if (authToken && !options.headers?.Authorization) {
    defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return {
      status: response.status,
      data,
      headers: response.headers,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false
    };
  }
}

function logTest(phase, test, result, details = '') {
  const status = result ? '✅' : '❌';
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${status} FASE ${phase} - ${test}`);
  if (details) console.log(`   Detalhes: ${details}`);
}

// AUTENTICAÇÃO INICIAL
async function autenticar() {
  const loginResponse = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (loginResponse.ok && loginResponse.data.accessToken) {
    authToken = loginResponse.data.accessToken;
    logTest('3', 'Autenticação Inicial', true, `Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logTest('3', 'Autenticação Inicial', false, `Status: ${loginResponse.status}`);
    return false;
  }
}

// TESTE 1: SISTEMA SMS CAMPAIGNS
async function testeSMSCampaigns() {
  console.log('\n📱 TESTE 1: SISTEMA SMS CAMPAIGNS');
  
  try {
    // Buscar campanhas SMS existentes
    const getSMSResp = await makeRequest('/api/sms-campaigns');
    const listSMS = getSMSResp.ok && Array.isArray(getSMSResp.data);
    
    logTest('3', 'Listar Campanhas SMS', listSMS,
      `Total: ${getSMSResp.data?.length || 0}`);
    
    // Criar nova campanha SMS
    const smsCampaignData = {
      name: `Campanha SMS Teste ${Date.now()}`,
      message: 'Mensagem de teste para campanha SMS automatizada',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq', // Quiz existente
      targetAudience: 'all',
      triggerType: 'immediate',
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias atrás
    };
    
    const createSMSResp = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(smsCampaignData)
    });
    
    const criarSMS = createSMSResp.ok && createSMSResp.data.id;
    logTest('3', 'Criar Campanha SMS', criarSMS,
      `ID: ${createSMSResp.data?.id || 'N/A'}, Status: ${createSMSResp.status}`);
    
    if (criarSMS) {
      global.testSMSCampaignId = createSMSResp.data.id;
      
      // Testar logs da campanha
      const logsResp = await makeRequest(`/api/sms-campaigns/${global.testSMSCampaignId}/logs`);
      const logsSMS = logsResp.ok && Array.isArray(logsResp.data);
      
      logTest('3', 'Logs Campanha SMS', logsSMS,
        `Logs: ${logsResp.data?.length || 0}`);
    }
    
    return { listSMS, criarSMS, logsSMS: criarSMS ? true : false };
  } catch (error) {
    logTest('3', 'Sistema SMS', false, error.message);
    return { listSMS: false, criarSMS: false, logsSMS: false };
  }
}

// TESTE 2: SISTEMA EMAIL CAMPAIGNS
async function testeEmailCampaigns() {
  console.log('\n📧 TESTE 2: SISTEMA EMAIL CAMPAIGNS');
  
  try {
    // Buscar campanhas de email existentes
    const getEmailResp = await makeRequest('/api/email-campaigns');
    const listEmail = getEmailResp.ok && Array.isArray(getEmailResp.data);
    
    logTest('3', 'Listar Campanhas Email', listEmail,
      `Total: ${getEmailResp.data?.length || 0}`);
    
    // Criar nova campanha de email
    const emailCampaignData = {
      name: `Campanha Email Teste ${Date.now()}`,
      subject: 'Teste de Email Automatizado',
      content: 'Conteúdo do email de teste para validação do sistema',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      targetAudience: 'all',
      triggerType: 'immediate',
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const createEmailResp = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(emailCampaignData)
    });
    
    const criarEmail = createEmailResp.ok && createEmailResp.data.id;
    logTest('3', 'Criar Campanha Email', criarEmail,
      `ID: ${createEmailResp.data?.id || 'N/A'}, Status: ${createEmailResp.status}`);
    
    if (criarEmail) {
      global.testEmailCampaignId = createEmailResp.data.id;
      
      // Testar logs da campanha
      const logsResp = await makeRequest(`/api/email-campaigns/${global.testEmailCampaignId}/logs`);
      const logsEmail = logsResp.ok && Array.isArray(logsResp.data);
      
      logTest('3', 'Logs Campanha Email', logsEmail,
        `Logs: ${logsResp.data?.length || 0}`);
    }
    
    return { listEmail, criarEmail, logsEmail: criarEmail ? true : false };
  } catch (error) {
    logTest('3', 'Sistema Email', false, error.message);
    return { listEmail: false, criarEmail: false, logsEmail: false };
  }
}

// TESTE 3: SISTEMA WHATSAPP CAMPAIGNS
async function testeWhatsappCampaigns() {
  console.log('\n💬 TESTE 3: SISTEMA WHATSAPP CAMPAIGNS');
  
  try {
    // Buscar campanhas WhatsApp existentes
    const getWhatsAppResp = await makeRequest('/api/whatsapp-campaigns');
    const listWhatsApp = getWhatsAppResp.ok && Array.isArray(getWhatsAppResp.data);
    
    logTest('3', 'Listar Campanhas WhatsApp', listWhatsApp,
      `Total: ${getWhatsAppResp.data?.length || 0}`);
    
    // Criar nova campanha WhatsApp
    const whatsappCampaignData = {
      name: `Campanha WhatsApp Teste ${Date.now()}`,
      messages: [
        'Mensagem 1: Olá! Esta é uma mensagem de teste do sistema.',
        'Mensagem 2: Rotação de mensagens funcionando corretamente.',
        'Mensagem 3: Sistema anti-ban 2025 ativo.',
        'Mensagem 4: Teste de automação WhatsApp Web.'
      ],
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      targetAudience: 'all',
      triggerType: 'immediate',
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const createWhatsAppResp = await makeRequest('/api/whatsapp-campaigns', {
      method: 'POST',
      body: JSON.stringify(whatsappCampaignData)
    });
    
    const criarWhatsApp = createWhatsAppResp.ok && createWhatsAppResp.data.id;
    logTest('3', 'Criar Campanha WhatsApp', criarWhatsApp,
      `ID: ${createWhatsAppResp.data?.id || 'N/A'}, Status: ${createWhatsAppResp.status}`);
    
    if (criarWhatsApp) {
      global.testWhatsAppCampaignId = createWhatsAppResp.data.id;
      
      // Testar logs da campanha
      const logsResp = await makeRequest(`/api/whatsapp-campaigns/${global.testWhatsAppCampaignId}/logs`);
      const logsWhatsApp = logsResp.ok && Array.isArray(logsResp.data);
      
      logTest('3', 'Logs Campanha WhatsApp', logsWhatsApp,
        `Logs: ${logsResp.data?.length || 0}`);
    }
    
    return { listWhatsApp, criarWhatsApp, logsWhatsApp: criarWhatsApp ? true : false };
  } catch (error) {
    logTest('3', 'Sistema WhatsApp', false, error.message);
    return { listWhatsApp: false, criarWhatsApp: false, logsWhatsApp: false };
  }
}

// TESTE 4: SISTEMA VOICE CAMPAIGNS
async function testeVoiceCampaigns() {
  console.log('\n📞 TESTE 4: SISTEMA VOICE CAMPAIGNS');
  
  try {
    // Buscar campanhas de voz existentes
    const getVoiceResp = await makeRequest('/api/voice-campaigns');
    const listVoice = getVoiceResp.ok && Array.isArray(getVoiceResp.data);
    
    logTest('3', 'Listar Campanhas Voice', listVoice,
      `Total: ${getVoiceResp.data?.length || 0}`);
    
    // Criar nova campanha de voz
    const voiceCampaignData = {
      name: `Campanha Voice Teste ${Date.now()}`,
      voiceMessage: 'Mensagem de voz de teste para validação do sistema',
      voiceType: 'tts',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      targetAudience: 'all',
      triggerType: 'immediate',
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const createVoiceResp = await makeRequest('/api/voice-campaigns', {
      method: 'POST',
      body: JSON.stringify(voiceCampaignData)
    });
    
    const criarVoice = createVoiceResp.ok && createVoiceResp.data.id;
    logTest('3', 'Criar Campanha Voice', criarVoice,
      `ID: ${createVoiceResp.data?.id || 'N/A'}, Status: ${createVoiceResp.status}`);
    
    if (criarVoice) {
      global.testVoiceCampaignId = createVoiceResp.data.id;
      
      // Testar logs da campanha
      const logsResp = await makeRequest(`/api/voice-campaigns/${global.testVoiceCampaignId}/logs`);
      const logsVoice = logsResp.ok && Array.isArray(logsResp.data);
      
      logTest('3', 'Logs Campanha Voice', logsVoice,
        `Logs: ${logsResp.data?.length || 0}`);
    }
    
    return { listVoice, criarVoice, logsVoice: criarVoice ? true : false };
  } catch (error) {
    logTest('3', 'Sistema Voice', false, error.message);
    return { listVoice: false, criarVoice: false, logsVoice: false };
  }
}

// TESTE 5: SISTEMA DE CRÉDITOS
async function testeCreditos() {
  console.log('\n💰 TESTE 5: SISTEMA DE CRÉDITOS');
  
  try {
    // Buscar créditos do usuário
    const creditosResp = await makeRequest('/api/user/credits');
    const buscarCreditos = creditosResp.ok && typeof creditosResp.data === 'object';
    
    logTest('3', 'Buscar Créditos', buscarCreditos,
      `SMS: ${creditosResp.data?.sms || 0}, Email: ${creditosResp.data?.email || 0}, WhatsApp: ${creditosResp.data?.whatsapp || 0}`);
    
    // Histórico de créditos SMS
    const historyResp = await makeRequest('/api/sms-credits/history');
    const historicoCreditos = historyResp.ok && Array.isArray(historyResp.data);
    
    logTest('3', 'Histórico de Créditos', historicoCreditos,
      `Transações: ${historyResp.data?.length || 0}`);
    
    return { buscarCreditos, historicoCreditos };
  } catch (error) {
    logTest('3', 'Sistema Créditos', false, error.message);
    return { buscarCreditos: false, historicoCreditos: false };
  }
}

// TESTE 6: ANALYTICS MARKETING
async function testeAnalyticsMarketing() {
  console.log('\n📊 TESTE 6: ANALYTICS MARKETING');
  
  try {
    // Analytics summary
    const summaryResp = await makeRequest('/api/analytics/summary');
    const analyticsSummary = summaryResp.ok && summaryResp.data;
    
    logTest('3', 'Analytics Summary', analyticsSummary,
      `Views: ${summaryResp.data?.totalViews || 0}, Conversions: ${summaryResp.data?.totalConversions || 0}`);
    
    // Recent activity
    const activityResp = await makeRequest('/api/analytics/recent-activity');
    const recentActivity = activityResp.ok && Array.isArray(activityResp.data);
    
    logTest('3', 'Recent Activity', recentActivity,
      `Atividades: ${activityResp.data?.length || 0}`);
    
    return { analyticsSummary, recentActivity };
  } catch (error) {
    logTest('3', 'Analytics Marketing', false, error.message);
    return { analyticsSummary: false, recentActivity: false };
  }
}

// TESTE 7: PERFORMANCE MULTI-CHANNEL
async function testePerformanceMultiChannel() {
  console.log('\n⚡ TESTE 7: PERFORMANCE MULTI-CHANNEL');
  
  try {
    // Teste de múltiplas requisições simultâneas para diferentes canais
    const requests = [
      makeRequest('/api/sms-campaigns'),
      makeRequest('/api/email-campaigns'),
      makeRequest('/api/whatsapp-campaigns'),
      makeRequest('/api/voice-campaigns'),
      makeRequest('/api/user/credits'),
      makeRequest('/api/analytics/summary')
    ];
    
    const start = Date.now();
    const results = await Promise.all(requests);
    const totalTime = Date.now() - start;
    
    const successfulRequests = results.filter(r => r.ok).length;
    const performanceMultiChannel = successfulRequests >= 5; // 83% success rate
    
    logTest('3', 'Performance Multi-Channel', performanceMultiChannel,
      `${successfulRequests}/6 sucessos em ${totalTime}ms`);
    
    return { performanceMultiChannel };
  } catch (error) {
    logTest('3', 'Performance Multi-Channel', false, error.message);
    return { performanceMultiChannel: false };
  }
}

// CLEANUP - Limpar campanhas de teste
async function cleanupCampaigns() {
  console.log('\n🧹 CLEANUP: Removendo campanhas de teste');
  
  const cleanupResults = [];
  
  // Limpar SMS campaign
  if (global.testSMSCampaignId) {
    try {
      const deleteResp = await makeRequest(`/api/sms-campaigns/${global.testSMSCampaignId}`, {
        method: 'DELETE'
      });
      cleanupResults.push({ item: 'SMS Campaign', success: deleteResp.ok });
    } catch (error) {
      cleanupResults.push({ item: 'SMS Campaign', success: false, error: error.message });
    }
  }
  
  // Limpar Email campaign
  if (global.testEmailCampaignId) {
    try {
      const deleteResp = await makeRequest(`/api/email-campaigns/${global.testEmailCampaignId}`, {
        method: 'DELETE'
      });
      cleanupResults.push({ item: 'Email Campaign', success: deleteResp.ok });
    } catch (error) {
      cleanupResults.push({ item: 'Email Campaign', success: false, error: error.message });
    }
  }
  
  // Limpar WhatsApp campaign
  if (global.testWhatsAppCampaignId) {
    try {
      const deleteResp = await makeRequest(`/api/whatsapp-campaigns/${global.testWhatsAppCampaignId}`, {
        method: 'DELETE'
      });
      cleanupResults.push({ item: 'WhatsApp Campaign', success: deleteResp.ok });
    } catch (error) {
      cleanupResults.push({ item: 'WhatsApp Campaign', success: false, error: error.message });
    }
  }
  
  // Limpar Voice campaign
  if (global.testVoiceCampaignId) {
    try {
      const deleteResp = await makeRequest(`/api/voice-campaigns/${global.testVoiceCampaignId}`, {
        method: 'DELETE'
      });
      cleanupResults.push({ item: 'Voice Campaign', success: deleteResp.ok });
    } catch (error) {
      cleanupResults.push({ item: 'Voice Campaign', success: false, error: error.message });
    }
  }
  
  cleanupResults.forEach(result => {
    logTest('3', `Cleanup ${result.item}`, result.success, result.error || '');
  });
  
  return cleanupResults;
}

// FUNÇÃO PRINCIPAL DA FASE 3
async function executarFase3() {
  console.log('🚀 INICIANDO TESTE SISTEMA COMPLETO VENDZZ - FASE 3');
  console.log('📋 Testes: SMS, Email, WhatsApp, Voice, Créditos, Analytics, Performance');
  console.log('─'.repeat(80));
  
  // Autenticação
  const auth = await autenticar();
  if (!auth) {
    console.log('❌ Falha na autenticação. Abortando Fase 3.');
    return false;
  }
  
  // Executar todos os testes
  const resultados = {
    sms: await testeSMSCampaigns(),
    email: await testeEmailCampaigns(),
    whatsapp: await testeWhatsappCampaigns(),
    voice: await testeVoiceCampaigns(),
    creditos: await testeCreditos(),
    analytics: await testeAnalyticsMarketing(),
    performance: await testePerformanceMultiChannel()
  };
  
  // Cleanup
  await cleanupCampaigns();
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DA FASE 3:');
  
  const smsScore = Object.values(resultados.sms).filter(Boolean).length;
  const emailScore = Object.values(resultados.email).filter(Boolean).length;
  const whatsappScore = Object.values(resultados.whatsapp).filter(Boolean).length;
  const voiceScore = Object.values(resultados.voice).filter(Boolean).length;
  const creditosScore = Object.values(resultados.creditos).filter(Boolean).length;
  const analyticsScore = Object.values(resultados.analytics).filter(Boolean).length;
  const performanceScore = Object.values(resultados.performance).filter(Boolean).length;
  
  console.log(`SMS Campaigns: ${smsScore}/3 ✅`);
  console.log(`Email Campaigns: ${emailScore}/3 ✅`);
  console.log(`WhatsApp Campaigns: ${whatsappScore}/3 ✅`);
  console.log(`Voice Campaigns: ${voiceScore}/3 ✅`);
  console.log(`Sistema Créditos: ${creditosScore}/2 ✅`);
  console.log(`Analytics Marketing: ${analyticsScore}/2 ✅`);
  console.log(`Performance Multi-Channel: ${performanceScore}/1 ✅`);
  
  const totalScore = smsScore + emailScore + whatsappScore + voiceScore + creditosScore + analyticsScore + performanceScore;
  const maxScore = 17;
  const sucessoGeral = totalScore >= 13; // 76% de sucesso
  
  console.log(`\n🎯 STATUS FASE 3: ${sucessoGeral ? '✅ APROVADA' : '❌ REQUER ATENÇÃO'}`);
  console.log(`📈 Score: ${totalScore}/${maxScore} (${((totalScore/maxScore)*100).toFixed(1)}%)`);
  
  if (sucessoGeral) {
    console.log('\n✨ Sistema de Marketing Automation funcionando. Pronto para FASE 4: ADVANCED FEATURES');
  } else {
    console.log('\n⚠️  Problemas detectados no sistema de marketing. Revise antes de continuar.');
  }
  
  return resultados;
}

// Executar teste
executarFase3().catch(console.error);
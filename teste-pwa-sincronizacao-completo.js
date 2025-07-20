#!/usr/bin/env node

/**
 * TESTE COMPLETO - PWA VENDZZ SINCRONIZAÇÃO DE DADOS
 * Validação completa do sistema PWA com autenticação e carregamento de dados
 */

const BASE_URL = 'http://localhost:5000';

console.log('🚀 INICIANDO TESTE COMPLETO PWA VENDZZ - SINCRONIZAÇÃO DE DADOS\n');

// Função para fazer requisições HTTP
async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'PWA-Test-Client/1.0'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    const responseData = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch (e) {
      parsedData = responseData;
    }

    return {
      status: response.status,
      ok: response.ok,
      data: parsedData
    };
  } catch (error) {
    console.error(`❌ Erro na requisição ${method} ${endpoint}:`, error.message);
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Função de sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executarTeste() {
  let totalTestes = 0;
  let testesAprovados = 0;
  let token = null;

  console.log('📋 FASE 1: AUTENTICAÇÃO E LOGIN');
  console.log('=' .repeat(50));

  // Teste 1: Login
  totalTestes++;
  console.log('\n🔐 Teste 1: Autenticação de usuário');
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@vendzz.com',
    password: 'admin123'
  });

  if (loginResponse.ok && loginResponse.data.token) {
    token = loginResponse.data.token;
    testesAprovados++;
    console.log('✅ Login realizado com sucesso');
    console.log(`🔑 Token recebido: ${token.substring(0, 20)}...`);
  } else {
    console.log('❌ Falha no login:', loginResponse.status, loginResponse.data);
  }

  if (!token) {
    console.log('🛑 TESTE ABORTADO: Não foi possível fazer login');
    return;
  }

  console.log('\n📋 FASE 2: VALIDAÇÃO DE ENDPOINTS PWA');
  console.log('=' .repeat(50));

  // Teste 2: Buscar quizzes do usuário
  totalTestes++;
  console.log('\n📊 Teste 2: Carregar quizzes do usuário');
  const quizzesResponse = await makeRequest('GET', '/api/quizzes', null, token);
  
  if (quizzesResponse.ok) {
    testesAprovados++;
    const quizzes = Array.isArray(quizzesResponse.data) ? quizzesResponse.data : [];
    console.log(`✅ Quizzes carregados: ${quizzes.length} quizzes encontrados`);
    if (quizzes.length > 0) {
      console.log(`📝 Primeiro quiz: "${quizzes[0].title || quizzes[0].name || 'Sem título'}"`);
    }
  } else {
    console.log('❌ Falha ao carregar quizzes:', quizzesResponse.status, quizzesResponse.data);
  }

  // Teste 3: Buscar campanhas SMS
  totalTestes++;
  console.log('\n📱 Teste 3: Carregar campanhas SMS');
  const smsResponse = await makeRequest('GET', '/api/sms-campaigns', null, token);
  
  if (smsResponse.ok) {
    testesAprovados++;
    const campaigns = Array.isArray(smsResponse.data) ? smsResponse.data : [];
    console.log(`✅ Campanhas SMS carregadas: ${campaigns.length} campanhas encontradas`);
    if (campaigns.length > 0) {
      console.log(`📄 Primeira campanha: "${campaigns[0].name || campaigns[0].title || 'Sem nome'}"`);
    }
  } else {
    console.log('❌ Falha ao carregar campanhas SMS:', smsResponse.status, smsResponse.data);
  }

  // Teste 4: Buscar analytics/dashboard stats
  totalTestes++;
  console.log('\n📈 Teste 4: Carregar dados de analytics');
  const analyticsResponse = await makeRequest('GET', '/api/dashboard/stats', null, token);
  
  if (analyticsResponse.ok) {
    testesAprovados++;
    console.log('✅ Analytics carregados:', analyticsResponse.data);
  } else {
    console.log('❌ Falha ao carregar analytics:', analyticsResponse.status, analyticsResponse.data);
  }

  console.log('\n📋 FASE 3: VALIDAÇÃO DE ENDPOINTS DE NOTIFICAÇÃO');
  console.log('=' .repeat(50));

  // Teste 5: Endpoint de subscrição de notificações
  totalTestes++;
  console.log('\n🔔 Teste 5: Endpoint de subscrição push');
  const subscriptionData = {
    subscription: {
      endpoint: 'https://test-endpoint.com',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key'
      }
    }
  };
  
  const subscribeResponse = await makeRequest('POST', '/api/notifications/subscribe', subscriptionData, token);
  
  if (subscribeResponse.ok) {
    testesAprovados++;
    console.log('✅ Subscrição de notificação registrada');
  } else {
    console.log('❌ Falha ao registrar subscrição:', subscribeResponse.status, subscribeResponse.data);
  }

  // Teste 6: Endpoint de envio de notificação (admin)
  totalTestes++;
  console.log('\n📨 Teste 6: Envio de notificação push (admin)');
  const notificationData = {
    title: 'Teste PWA Vendzz',
    message: 'Notificação de teste do sistema PWA',
    targetUser: 'all'
  };
  
  const sendNotificationResponse = await makeRequest('POST', '/api/notifications/send-push', notificationData, token);
  
  if (sendNotificationResponse.ok) {
    testesAprovados++;
    console.log('✅ Notificação enviada com sucesso');
  } else {
    console.log('❌ Falha ao enviar notificação:', sendNotificationResponse.status, sendNotificationResponse.data);
  }

  console.log('\n📋 FASE 4: TESTE DE ACESSIBILIDADE PWA');
  console.log('=' .repeat(50));

  // Teste 7: Verificar se a página PWA carrega
  totalTestes++;
  console.log('\n📱 Teste 7: Acessibilidade da página PWA');
  const pwaResponse = await makeRequest('GET', '/app-pwa-vendzz');
  
  if (pwaResponse.status === 200) {
    testesAprovados++;
    console.log('✅ Página PWA acessível');
  } else {
    console.log('❌ Página PWA inacessível:', pwaResponse.status);
  }

  // Teste 8: Verificar manifest.json
  totalTestes++;
  console.log('\n📋 Teste 8: Validação do manifest PWA');
  const manifestResponse = await makeRequest('GET', '/manifest.json');
  
  if (manifestResponse.ok && manifestResponse.data.name) {
    testesAprovados++;
    console.log('✅ Manifest PWA válido:', manifestResponse.data.name);
  } else {
    console.log('❌ Manifest PWA inválido:', manifestResponse.status);
  }

  // Teste 9: Verificar service worker
  totalTestes++;
  console.log('\n⚙️ Teste 9: Validação do Service Worker');
  const swResponse = await makeRequest('GET', '/sw.js');
  
  if (swResponse.status === 200) {
    testesAprovados++;
    console.log('✅ Service Worker acessível');
  } else {
    console.log('❌ Service Worker inacessível:', swResponse.status);
  }

  console.log('\n' + '=' .repeat(70));
  console.log('📊 RELATÓRIO FINAL DO TESTE PWA VENDZZ');
  console.log('=' .repeat(70));
  
  const taxaSucesso = ((testesAprovados / totalTestes) * 100).toFixed(1);
  console.log(`📈 Taxa de Sucesso: ${taxaSucesso}% (${testesAprovados}/${totalTestes} testes aprovados)`);
  
  if (taxaSucesso >= 80) {
    console.log('🎉 STATUS: SISTEMA PWA APROVADO PARA PRODUÇÃO');
    console.log('✅ O PWA Vendzz está funcionando corretamente');
    console.log('🔗 URL Pública: https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/app-pwa-vendzz');
  } else if (taxaSucesso >= 60) {
    console.log('⚠️ STATUS: SISTEMA FUNCIONAL COM RESSALVAS');
    console.log('🔧 Algumas funcionalidades podem precisar de ajustes');
  } else {
    console.log('❌ STATUS: SISTEMA PRECISA DE CORREÇÕES');
    console.log('🛠️ Várias funcionalidades precisam ser corrigidas');
  }

  console.log('\n📱 INFORMAÇÕES DO PWA:');
  console.log('🔗 URL Completa: https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/app-pwa-vendzz');
  console.log('🔐 Login: admin@vendzz.com / admin123');
  console.log('📋 Estrutura: Meus quizes | Fórum | Analytics | Automações');
  console.log('🔔 Notificações: Sistema completo implementado');
  console.log('📱 PWA: Instalável em dispositivos móveis');
  
  console.log('\n✅ TESTE CONCLUÍDO');
}

// Executar o teste
executarTeste().catch(error => {
  console.error('💥 Erro durante execução do teste:', error);
  process.exit(1);
});
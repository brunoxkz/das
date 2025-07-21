/**
 * TESTE UNIFICAÇÃO: Admin → PWA iOS Push Notifications
 * Validar se o sistema admin consegue enviar notificações para dispositivos PWA iOS
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

async function testarUnificacaoPushAdmin() {
  console.log('🚀 TESTE UNIFICAÇÃO: Admin → PWA iOS Push Notifications\n');
  
  let token = '';
  let testResults = {
    login: false,
    broadcastUnificado: false,
    verificarLogs: false,
    total: 0,
    aprovados: 0
  };

  try {
    // 1. LOGIN ADMIN
    console.log('1️⃣ FAZENDO LOGIN ADMIN...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: '123456'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      testResults.login = true;
      console.log('✅ Login admin realizado com sucesso');
    } else {
      console.log('❌ Erro no login admin');
      return testResults;
    }

    testResults.total++;
    if (testResults.login) testResults.aprovados++;

    // 2. TESTAR BROADCAST UNIFICADO
    console.log('\n2️⃣ TESTANDO BROADCAST UNIFICADO (SQLite + PWA iOS)...');
    const broadcastResponse = await fetch(`${BASE_URL}/api/push-notifications/admin/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'TESTE UNIFICAÇÃO',
        body: 'Notificação enviada para TODOS os dispositivos (SQLite + PWA iOS)',
        url: '/app-pwa-vendzz',
        icon: '/logo-vendzz-white.png',
        badge: '/logo-vendzz-white.png',
        requireInteraction: true,
        silent: false
      })
    });

    if (broadcastResponse.ok) {
      const broadcastData = await broadcastResponse.json();
      console.log('✅ Resposta do broadcast:', JSON.stringify(broadcastData, null, 2));
      
      // Verificar se incluiu breakdown dos sistemas
      if (broadcastData.breakdown) {
        console.log(`📊 SQLite devices: ${broadcastData.breakdown.sqlite}`);
        console.log(`📱 PWA devices: ${broadcastData.breakdown.pwa}`);
        console.log(`📡 Total enviados: ${broadcastData.sentTo}`);
        testResults.broadcastUnificado = true;
      }
    } else {
      console.log('❌ Erro no broadcast unificado');
      const errorData = await broadcastResponse.text();
      console.log('Erro:', errorData);
    }

    testResults.total++;
    if (testResults.broadcastUnificado) testResults.aprovados++;

    // 3. VERIFICAR LOGS DO SISTEMA
    console.log('\n3️⃣ VERIFICANDO LOGS DO SISTEMA...');
    const logsResponse = await fetch(`${BASE_URL}/api/push-notifications/admin/logs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (logsResponse.ok) {
      const logsData = await logsResponse.json();
      console.log(`✅ Logs encontrados: ${logsData.length} registros`);
      
      // Verificar se há logs recentes
      const logsRecentes = logsData.filter(log => 
        log.title.includes('TESTE UNIFICAÇÃO') || 
        log.status === 'sent'
      );
      
      if (logsRecentes.length > 0) {
        console.log(`📝 Logs recentes: ${logsRecentes.length}`);
        testResults.verificarLogs = true;
      }
    } else {
      console.log('❌ Erro ao buscar logs');
    }

    testResults.total++;
    if (testResults.verificarLogs) testResults.aprovados++;

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }

  // RESULTADO FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO FINAL: TESTE UNIFICAÇÃO PUSH ADMIN');
  console.log('='.repeat(60));
  
  const taxaSucesso = ((testResults.aprovados / testResults.total) * 100).toFixed(1);
  console.log(`🎯 Taxa de Sucesso: ${taxaSucesso}% (${testResults.aprovados}/${testResults.total})`);
  
  console.log('\n📋 TESTES INDIVIDUAIS:');
  console.log(`${testResults.login ? '✅' : '❌'} Login Admin: ${testResults.login ? 'APROVADO' : 'FALHADO'}`);
  console.log(`${testResults.broadcastUnificado ? '✅' : '❌'} Broadcast Unificado: ${testResults.broadcastUnificado ? 'APROVADO' : 'FALHADO'}`);
  console.log(`${testResults.verificarLogs ? '✅' : '❌'} Verificar Logs: ${testResults.verificarLogs ? 'APROVADO' : 'FALHADO'}`);

  console.log('\n🎬 STATUS INTEGRAÇÃO:');
  if (taxaSucesso >= 85) {
    console.log('🎉 INTEGRAÇÃO APROVADA PARA PRODUÇÃO');
    console.log('📱 Admin pode enviar notificações para TODOS os dispositivos');
    console.log('🔗 Sistemas SQLite + PWA iOS estão conectados');
  } else {
    console.log('⚠️ INTEGRAÇÃO PRECISA DE MELHORIAS');
    console.log('❌ Alguns sistemas não estão totalmente conectados');
  }
  
  return testResults;
}

// Executar teste
testarUnificacaoPushAdmin().catch(console.error);
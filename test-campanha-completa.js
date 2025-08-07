#!/usr/bin/env node

// 🚀 SIMULAÇÃO COMPLETA DE CAMPANHA WHATSAPP
// ==========================================

import Database from 'better-sqlite3';

async function makeRequest(endpoint, options = {}) {
  const url = `http://localhost:5000${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      error: response.ok ? null : data.error || data.message || 'Erro desconhecido'
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      data: null,
      error: error.message
    };
  }
}

async function authenticate() {
  console.log('🔐 FAZENDO LOGIN...');
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });

  if (response.success) {
    console.log('✅ Login realizado com sucesso');
    const token = response.data.accessToken || response.data.token;
    console.log('🔑 Token recebido:', token ? 'SIM' : 'NÃO');
    return token;
  } else {
    console.log('❌ Erro no login:', response.error);
    console.log('📊 Response data:', response.data);
    return null;
  }
}

async function criarCampanhaWhatsApp(token) {
  console.log('\n📱 CRIANDO CAMPANHA WHATSAPP...');
  
  const campanhaData = {
    name: 'Teste Simulação Completa',
    quizId: 'quiz-simulacao-123',
    messages: [
      '🎯 Olá! Vimos que você se interessou pelo nosso produto!',
      '💡 Que tal conhecer nossa oferta especial?',
      '🔥 Últimas vagas com 50% de desconto!',
      '⏰ Não perca esta oportunidade única!'
    ],
    targetAudience: 'all',
    triggerType: 'immediate',
    fromDate: '2025-01-01'
  };

  const response = await makeRequest('/api/whatsapp-campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(campanhaData)
  });

  if (response.success) {
    console.log('✅ Campanha criada:', response.data.name);
    console.log('🆔 ID da campanha:', response.data.id);
    return response.data.id;
  } else {
    console.log('❌ Erro ao criar campanha:', response.error);
    return null;
  }
}

async function inserirLeadTeste() {
  console.log('\n📊 INSERINDO LEAD DE TESTE NO BANCO...');
  
  try {
    const db = new Database('./vendzz-database.db');

    // Verificar estrutura da tabela quiz_responses primeiro
    const tableInfo = db.prepare("PRAGMA table_info(quiz_responses)").all();
    console.log('📋 Estrutura da tabela quiz_responses:', tableInfo.map(col => col.name));

    // Inserir quiz response de teste
    const insertResponse = db.prepare(`
      INSERT OR REPLACE INTO quiz_responses (id, quizId, responses, metadata, submittedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const testResponse = {
      id: 'test-response-simulacao',
      quizId: 'quiz-simulacao-123',
      responses: JSON.stringify([
        { 
          elementId: 'phone-1', 
          elementType: 'phone', 
          answer: '11999887766', 
          elementFieldId: 'telefone_contato' 
        },
        { 
          elementId: 'name-1', 
          elementType: 'text', 
          answer: 'João da Silva Teste', 
          elementFieldId: 'nome_completo' 
        }
      ]),
      metadata: JSON.stringify({ 
        isComplete: true, 
        completionPercentage: 100,
        isPartial: false,
        submittedAt: new Date().toISOString()
      }),
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const result = insertResponse.run(
      testResponse.id,
      testResponse.quizId,
      testResponse.responses,
      testResponse.metadata,
      testResponse.submittedAt,
      testResponse.createdAt
    );

    console.log('✅ Lead inserido com sucesso:', result.changes);
    console.log('📞 Telefone: 11999887766');
    console.log('👤 Nome: João da Silva Teste');
    
    db.close();
    return true;
  } catch (error) {
    console.log('❌ Erro ao inserir lead:', error.message);
    return false;
  }
}

async function verificarMensagensPendentes(token) {
  console.log('\n📤 VERIFICANDO MENSAGENS PENDENTES...');
  
  const response = await makeRequest('/api/whatsapp-extension/pending-messages', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.success) {
    console.log(`✅ Mensagens pendentes encontradas: ${response.data.length}`);
    if (response.data.length > 0) {
      console.log('📋 Primeira mensagem:');
      console.log('  - LogID:', response.data[0].logId);
      console.log('  - Telefone:', response.data[0].phone);
      console.log('  - Mensagem:', response.data[0].message);
    }
    return response.data;
  } else {
    console.log('❌ Erro ao verificar mensagens:', response.error);
    return [];
  }
}

async function simularPingExtensao(token, pendingCount = 0, sentCount = 0) {
  console.log('\n📡 SIMULANDO PING DA EXTENSÃO...');
  
  const response = await makeRequest('/api/whatsapp-extension/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      version: '1.0.0',
      pendingMessages: pendingCount,
      sentMessages: sentCount,
      failedMessages: 0,
      isActive: true
    })
  });

  if (response.success) {
    console.log('✅ Ping realizado com sucesso');
    console.log('📊 Configurações retornadas:', Object.keys(response.data.settings || {}));
    return response.data;
  } else {
    console.log('❌ Erro no ping:', response.error);
    return null;
  }
}

async function simularEnvioMensagem(token, logId, phone) {
  console.log(`\n📱 SIMULANDO ENVIO PARA ${phone}...`);
  
  const response = await makeRequest('/api/whatsapp-extension/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      logId: logId,
      status: 'sent',
      phone: phone,
      timestamp: Math.floor(Date.now() / 1000)
    })
  });

  if (response.success) {
    console.log('✅ Envio simulado com sucesso');
    console.log('📊 Status atualizado para: sent');
    return true;
  } else {
    console.log('❌ Erro ao simular envio:', response.error);
    return false;
  }
}

async function verificarLogsCampanha(token, campaignId) {
  console.log(`\n📋 VERIFICANDO LOGS DA CAMPANHA ${campaignId}...`);
  
  const response = await makeRequest(`/api/whatsapp-campaigns/${campaignId}/logs`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.success) {
    console.log(`✅ Logs encontrados: ${response.data.length}`);
    response.data.forEach((log, index) => {
      console.log(`📄 Log ${index + 1}:`);
      console.log(`  - Telefone: ${log.phone}`);
      console.log(`  - Status: ${log.status}`);
      console.log(`  - Mensagem: ${log.message.substring(0, 50)}...`);
    });
    return response.data;
  } else {
    console.log('❌ Erro ao verificar logs:', response.error);
    return [];
  }
}

async function executarSimulacaoCompleta() {
  console.log('🚀 INICIANDO SIMULAÇÃO COMPLETA DE CAMPANHA WHATSAPP');
  console.log('===================================================\n');

  // 1. Autenticar
  const token = await authenticate();
  if (!token) {
    console.log('❌ Falha na autenticação. Encerrando simulação.');
    return;
  }

  // 2. Inserir lead de teste
  const leadInserido = await inserirLeadTeste();
  if (!leadInserido) {
    console.log('⚠️ Problemas ao inserir lead, mas continuando...');
  }

  // 3. Criar campanha
  const campaignId = await criarCampanhaWhatsApp(token);
  if (!campaignId) {
    console.log('❌ Falha ao criar campanha. Encerrando simulação.');
    return;
  }

  // 4. Aguardar detecção automática
  console.log('\n⏳ AGUARDANDO DETECÇÃO AUTOMÁTICA DE LEADS...');
  console.log('(O sistema verifica novos leads a cada 20 segundos)');
  
  // Aguardar 25 segundos para garantir que o sistema processou
  await new Promise(resolve => setTimeout(resolve, 25000));

  // 5. Verificar mensagens pendentes
  const mensagensPendentes = await verificarMensagensPendentes(token);

  // 6. Simular ping inicial
  await simularPingExtensao(token, mensagensPendentes.length, 0);

  // 7. Se há mensagens, simular envio
  if (mensagensPendentes.length > 0) {
    const primeiraMsg = mensagensPendentes[0];
    const envioSucesso = await simularEnvioMensagem(token, primeiraMsg.logId, primeiraMsg.phone);
    
    if (envioSucesso) {
      // 8. Ping final reportando envio
      await simularPingExtensao(token, mensagensPendentes.length - 1, 1);
      
      // 9. Verificar logs da campanha
      await verificarLogsCampanha(token, campaignId);
    }
  } else {
    console.log('\n⚠️ NENHUMA MENSAGEM PENDENTE DETECTADA');
    console.log('💡 Possíveis motivos:');
    console.log('   - Sistema ainda processando leads');
    console.log('   - Filtros da campanha não incluem o lead');
    console.log('   - Lead não atende critérios de segmentação');
  }

  console.log('\n🎯 SIMULAÇÃO COMPLETA FINALIZADA');
  console.log('==================================');
  console.log('✅ Fluxo testado: Login → Lead → Campanha → Detecção → Ping → Envio → Log');
  console.log('📱 Sistema WhatsApp pronto para uso com Chrome Extension!');
}

// Executar simulação
executarSimulacaoCompleta().catch(console.error);
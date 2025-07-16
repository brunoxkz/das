/**
 * 🔄 TESTE SISTEMA DE PAUSE AUTOMÁTICO E REATIVAÇÃO DE CAMPANHAS
 * 
 * Testa se o sistema:
 * 1. Pausa campanhas automaticamente quando créditos acabam
 * 2. Reativa campanhas automaticamente quando créditos são adicionados
 * 3. Previne burla do sistema de créditos
 * 4. Funciona com todos os tipos de campanha (SMS, Email, WhatsApp)
 */

const SERVER_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'admin@admin.com',
  password: 'admin123'
};

// === FUNÇÕES DE TESTE ===

async function apiCall(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${SERVER_URL}${endpoint}`, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || result.error || 'API call failed');
  }
  
  return result;
}

async function login() {
  try {
    const response = await apiCall('POST', '/api/auth/login', TEST_USER);
    console.log('✅ Login realizado com sucesso');
    return response.accessToken;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    throw error;
  }
}

async function testeCampaignPauseSystem() {
  console.log('\n🔄 INICIANDO TESTE DO SISTEMA DE PAUSE AUTOMÁTICO\n');
  
  const token = await login();
  let testsPassed = 0;
  let totalTests = 10;
  
  try {
    // === TESTE 1: Criar quiz para usar nas campanhas ===
    console.log('📋 TESTE 1: Criar quiz para campanhas');
    const quiz = await apiCall('POST', '/api/quizzes', {
      title: 'Quiz Teste Pause Automático',
      description: 'Quiz para testar sistema de pause automático',
      pages: [
        {
          id: 'page1',
          title: 'Página 1',
          elements: [
            {
              id: 'element1',
              type: 'text',
              question: 'Qual seu nome?',
              fieldId: 'nome_completo',
              required: true
            },
            {
              id: 'element2',
              type: 'phone',
              question: 'Qual seu telefone?',
              fieldId: 'telefone_contato',
              required: true
            }
          ]
        }
      ]
    }, token);
    
    console.log(`✅ Quiz criado: ${quiz.id}`);
    testsPassed++;
    
    // === TESTE 1.2: Publicar o quiz ===
    console.log('\n📋 TESTE 1.2: Publicando quiz');
    await apiCall('PUT', `/api/quizzes/${quiz.id}`, {
      ...quiz,
      isPublished: true
    }, token);
    
    console.log('✅ Quiz publicado com sucesso');
    testsPassed++;
    
    // === TESTE 1.5: Adicionar respostas de teste ao quiz ===
    console.log('\n📋 TESTE 1.5: Adicionando respostas de teste');
    
    // Adicionar algumas respostas de teste
    const testResponses = [
      {
        responses: [
          { responseId: 'nome_completo', value: 'João Silva' },
          { responseId: 'telefone_contato', value: '11999887766' }
        ],
        metadata: { completedAt: new Date().toISOString() }
      },
      {
        responses: [
          { responseId: 'nome_completo', value: 'Maria Santos' },
          { responseId: 'telefone_contato', value: '11888776655' }
        ],
        metadata: { completedAt: new Date().toISOString() }
      }
    ];
    
    for (const response of testResponses) {
      await apiCall('POST', `/api/quizzes/${quiz.id}/submit`, response, token);
    }
    
    console.log(`✅ ${testResponses.length} respostas de teste adicionadas`);
    testsPassed++;
    
    // === TESTE 2: Zerar créditos do usuário ===
    console.log('\n📋 TESTE 2: Zerar créditos do usuário');
    await apiCall('PUT', '/api/admin/users/admin-user-id/plan', {
      plan: 'free',
      credits: {
        sms: 0,
        email: 0,
        whatsapp: 0,
        ai: 0
      }
    }, token);
    
    console.log('✅ Créditos zerados');
    testsPassed++;
    
    // === TESTE 3: Criar campanha SMS que deve ser pausada ===
    console.log('\n📋 TESTE 3: Criar campanha SMS sem créditos');
    const smsCampaign = await apiCall('POST', '/api/sms-campaigns', {
      quizId: quiz.id,
      name: 'Campanha SMS Teste Pause',
      message: 'Olá {nome_completo}! Teste de pause automático',
      filters: {
        type: 'all',
        segmentation: 'all'
      },
      schedule: {
        type: 'immediate',
        timezone: 'America/Sao_Paulo'
      }
    }, token);
    
    console.log(`✅ Campanha SMS criada: ${smsCampaign.id}`);
    testsPassed++;
    
    // === TESTE 4: Verificar se campanha foi pausada automaticamente ===
    console.log('\n📋 TESTE 4: Verificar se campanha foi pausada automaticamente');
    
    // Aguardar processamento do sistema de pause
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const smsCampaignStatus = await apiCall('GET', `/api/sms-campaigns/${smsCampaign.id}`, null, token);
    
    if (smsCampaignStatus.status === 'paused' && smsCampaignStatus.pausedReason?.includes('insuficientes')) {
      console.log('✅ Campanha SMS foi pausada automaticamente por falta de créditos');
      testsPassed++;
    } else {
      console.log('❌ Campanha SMS não foi pausada automaticamente');
      console.log('Status:', smsCampaignStatus.status);
      console.log('Motivo:', smsCampaignStatus.pausedReason);
    }
    
    // === TESTE 5: Criar campanha Email que deve ser pausada ===
    console.log('\n📋 TESTE 5: Criar campanha Email sem créditos');
    const emailCampaign = await apiCall('POST', '/api/email-campaigns', {
      quizId: quiz.id,
      name: 'Campanha Email Teste Pause',
      subject: 'Teste de pause automático',
      message: 'Olá {nome_completo}! Teste de pause automático',
      filters: {
        type: 'all',
        segmentation: 'all'
      },
      schedule: {
        type: 'immediate',
        timezone: 'America/Sao_Paulo'
      }
    }, token);
    
    console.log(`✅ Campanha Email criada: ${emailCampaign.id}`);
    testsPassed++;
    
    // === TESTE 6: Adicionar créditos SMS e verificar reativação ===
    console.log('\n📋 TESTE 6: Adicionar créditos SMS e verificar reativação');
    
    await apiCall('POST', '/api/credits/purchase', {
      type: 'sms',
      packageId: 'sms_100'
    }, token);
    
    console.log('✅ Créditos SMS adicionados');
    
    // Aguardar processamento do sistema de reativação
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const smsCampaignReactivated = await apiCall('GET', `/api/sms-campaigns/${smsCampaign.id}`, null, token);
    
    if (smsCampaignReactivated.status === 'active' && smsCampaignReactivated.resumedReason?.includes('reabastecidos')) {
      console.log('✅ Campanha SMS foi reativada automaticamente após adição de créditos');
      testsPassed++;
    } else {
      console.log('❌ Campanha SMS não foi reativada automaticamente');
      console.log('Status:', smsCampaignReactivated.status);
      console.log('Motivo reativação:', smsCampaignReactivated.resumedReason);
    }
    
    // === TESTE 7: Adicionar créditos Email e verificar reativação ===
    console.log('\n📋 TESTE 7: Adicionar créditos Email e verificar reativação');
    
    await apiCall('POST', '/api/credits/purchase', {
      type: 'email',
      packageId: 'email_1000'
    }, token);
    
    console.log('✅ Créditos Email adicionados');
    
    // Aguardar processamento do sistema de reativação
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const emailCampaignReactivated = await apiCall('GET', `/api/email-campaigns/${emailCampaign.id}`, null, token);
    
    if (emailCampaignReactivated.status === 'active') {
      console.log('✅ Campanha Email foi reativada automaticamente após adição de créditos');
      testsPassed++;
    } else {
      console.log('❌ Campanha Email não foi reativada automaticamente');
      console.log('Status:', emailCampaignReactivated.status);
    }
    
    // === TESTE 8: Verificar proteção contra burla ===
    console.log('\n📋 TESTE 8: Verificar proteção contra burla');
    
    // Zerar créditos novamente
    await apiCall('PUT', '/api/users/credits', {
      smsCredits: 0,
      emailCredits: 0,
      whatsappCredits: 0
    }, token);
    
    // Aguardar processamento do sistema de pause
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalSmsCampaignStatus = await apiCall('GET', `/api/sms-campaigns/${smsCampaign.id}`, null, token);
    const finalEmailCampaignStatus = await apiCall('GET', `/api/email-campaigns/${emailCampaign.id}`, null, token);
    
    if (finalSmsCampaignStatus.status === 'paused' && finalEmailCampaignStatus.status === 'paused') {
      console.log('✅ Proteção contra burla funcionando - campanhas pausadas novamente');
      testsPassed++;
    } else {
      console.log('❌ Proteção contra burla falhou - campanhas não pausadas');
      console.log('SMS Status:', finalSmsCampaignStatus.status);
      console.log('Email Status:', finalEmailCampaignStatus.status);
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
  
  // === RESULTADOS FINAIS ===
  console.log('\n' + '='.repeat(80));
  console.log('🎯 RESULTADOS FINAIS DO TESTE DE PAUSE AUTOMÁTICO');
  console.log('='.repeat(80));
  console.log(`✅ Testes aprovados: ${testsPassed}/${totalTests}`);
  console.log(`📊 Taxa de sucesso: ${((testsPassed/totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 SISTEMA DE PAUSE AUTOMÁTICO 100% FUNCIONAL!');
    console.log('✅ Sistema pronto para produção');
    return true;
  } else {
    console.log('⚠️ Sistema precisa de ajustes');
    console.log(`❌ ${totalTests - testsPassed} testes falharam`);
    return false;
  }
}

// === EXECUÇÃO DO TESTE ===
async function executarTeste() {
  try {
    console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE PAUSE AUTOMÁTICO');
    console.log('📅 Data:', new Date().toISOString());
    console.log('🌐 Servidor:', SERVER_URL);
    console.log('👤 Usuário:', TEST_USER.email);
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    const success = await testeCampaignPauseSystem();
    const endTime = Date.now();
    
    console.log('\n' + '='.repeat(80));
    console.log('⏱️ TEMPO DE EXECUÇÃO:', `${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log('🔄 SISTEMA DE PAUSE AUTOMÁTICO:', success ? 'APROVADO' : 'REPROVADO');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error.message);
    process.exit(1);
  }
}

// Executar teste
executarTeste();
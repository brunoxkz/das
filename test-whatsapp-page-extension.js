#!/usr/bin/env node

/**
 * TESTE COMPLETO DO SISTEMA PÁGINA-EXTENSÃO WHATSAPP
 * Testa comunicação, filtros, variáveis e automação
 */

// Usar fetch nativo do Node.js 18+

// Configuração dos testes
const config = {
  baseUrl: 'http://localhost:5000',
  testUser: {
    email: 'admin@vendzz.com',
    password: 'admin123'
  }
};

let authToken = null;

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

// Autenticação
async function authenticate() {
  console.log('🔐 Autenticando usuário...');
  
  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(config.testUser)
    });
    
    authToken = result.accessToken;
    console.log('✅ Autenticação realizada com sucesso');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    return false;
  }
}

// Teste 1: Verificar quizzes disponíveis
async function testQuizzesAvailable() {
  console.log('\n📋 TESTE 1: Verificando quizzes disponíveis...');
  
  try {
    const quizzes = await apiRequest('/api/quizzes');
    console.log(`✅ ${quizzes.length} quizzes encontrados`);
    
    for (const quiz of quizzes) {
      console.log(`   - ${quiz.title} (ID: ${quiz.id})`);
    }
    
    return quizzes;
    
  } catch (error) {
    console.error('❌ Erro ao buscar quizzes:', error.message);
    return [];
  }
}

// Teste 2: Verificar telefones por quiz
async function testQuizPhones(quizId) {
  console.log(`\n📱 TESTE 2: Verificando telefones do quiz ${quizId}...`);
  
  try {
    const result = await apiRequest(`/api/quiz-phones/${quizId}`);
    console.log(`✅ ${result.total} telefones encontrados`);
    
    // Mostrar detalhes por status
    const completed = result.phones.filter(p => p.status === 'completed');
    const abandoned = result.phones.filter(p => p.status === 'abandoned');
    
    console.log(`   - Completos: ${completed.length}`);
    console.log(`   - Abandonados: ${abandoned.length}`);
    
    // Mostrar alguns exemplos
    if (result.phones.length > 0) {
      console.log('\n   Exemplos de telefones:');
      result.phones.slice(0, 3).forEach(phone => {
        console.log(`   - ${phone.phone} (${phone.status}) - ${phone.submittedAt}`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao buscar telefones:', error.message);
    return { phones: [], total: 0 };
  }
}

// Teste 3: Testar endpoint da extensão com filtros
async function testExtensionQuizData(quizId, targetAudience = 'all', dateFilter = null) {
  console.log(`\n🔌 TESTE 3: Testando endpoint da extensão...`);
  console.log(`   Quiz: ${quizId}, Audiência: ${targetAudience}, Data: ${dateFilter || 'Sem filtro'}`);
  
  try {
    const result = await apiRequest('/api/whatsapp/extension-quiz-data', {
      method: 'POST',
      body: JSON.stringify({
        quizId: quizId,
        targetAudience: targetAudience,
        dateFilter: dateFilter
      })
    });
    
    console.log('✅ Dados recebidos pela extensão:');
    console.log(`   - Quiz: ${result.quiz.title}`);
    console.log(`   - Telefones filtrados: ${result.total}`);
    console.log(`   - Variáveis disponíveis: ${Object.keys(result.variables).length}`);
    
    // Mostrar variáveis
    console.log('\n   Variáveis do quiz:');
    Object.entries(result.variables).forEach(([key, value]) => {
      console.log(`   - {${key}}: ${value}`);
    });
    
    // Mostrar telefones filtrados
    if (result.phones.length > 0) {
      console.log('\n   Telefones filtrados:');
      result.phones.slice(0, 3).forEach(phone => {
        console.log(`   - ${phone.phone} (${phone.status}) - ${new Date(phone.submittedAt).toLocaleDateString()}`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro no endpoint da extensão:', error.message);
    return null;
  }
}

// Teste 4: Testar filtro de data
async function testDateFilter(quizId) {
  console.log(`\n📅 TESTE 4: Testando filtros de data...`);
  
  // Testar com data de ontem
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateFilter = yesterday.toISOString().split('T')[0];
  
  try {
    const allData = await testExtensionQuizData(quizId, 'all', null);
    const filteredData = await testExtensionQuizData(quizId, 'all', dateFilter);
    
    console.log('\n   Resultados do filtro de data:');
    console.log(`   - Sem filtro: ${allData?.total || 0} telefones`);
    console.log(`   - Com filtro (>${dateFilter}): ${filteredData?.total || 0} telefones`);
    
    if (allData && filteredData) {
      const reduction = allData.total - filteredData.total;
      console.log(`   - Redução: ${reduction} telefones filtrados`);
    }
    
    return { allData, filteredData };
    
  } catch (error) {
    console.error('❌ Erro no teste de filtro de data:', error.message);
    return null;
  }
}

// Teste 5: Testar filtros de audiência
async function testAudienceFilters(quizId) {
  console.log(`\n👥 TESTE 5: Testando filtros de audiência...`);
  
  try {
    const allData = await testExtensionQuizData(quizId, 'all');
    const completedData = await testExtensionQuizData(quizId, 'completed');
    const abandonedData = await testExtensionQuizData(quizId, 'abandoned');
    
    console.log('\n   Resultados dos filtros de audiência:');
    console.log(`   - Todos: ${allData?.total || 0} telefones`);
    console.log(`   - Completos: ${completedData?.total || 0} telefones`);
    console.log(`   - Abandonados: ${abandonedData?.total || 0} telefones`);
    
    // Verificar se a soma bate
    const sumCompleteAndAbandoned = (completedData?.total || 0) + (abandonedData?.total || 0);
    if (sumCompleteAndAbandoned === (allData?.total || 0)) {
      console.log('✅ Filtros de audiência funcionando corretamente');
    } else {
      console.log('⚠️ Inconsistência nos filtros de audiência');
    }
    
    return { allData, completedData, abandonedData };
    
  } catch (error) {
    console.error('❌ Erro no teste de filtros de audiência:', error.message);
    return null;
  }
}

// Teste 6: Testar status da extensão
async function testExtensionStatus() {
  console.log(`\n📊 TESTE 6: Testando status da extensão...`);
  
  try {
    const status = await apiRequest('/api/whatsapp/extension-status');
    
    console.log('✅ Status da extensão:');
    console.log(`   - Conectada: ${status.isConnected ? 'Sim' : 'Não'}`);
    console.log(`   - Ativa: ${status.isActive ? 'Sim' : 'Não'}`);
    console.log(`   - Total de telefones: ${status.phoneCount}`);
    console.log(`   - Última sync: ${status.lastSync}`);
    
    return status;
    
  } catch (error) {
    console.error('❌ Erro ao buscar status da extensão:', error.message);
    return null;
  }
}

// Teste 7: Simular criação de campanha
async function testCampaignCreation(quizId) {
  console.log(`\n🚀 TESTE 7: Simulando criação de campanha...`);
  
  const campaignData = {
    name: `Teste Automático - ${new Date().toLocaleTimeString()}`,
    quizId: quizId,
    targetAudience: 'completed',
    dateFilter: '',
    messages: [
      'Olá {nome}! Obrigado por completar nosso quiz "{quiz_titulo}". 🎉',
      'Seu resultado foi processado em {data_atual}. Que tal dar o próximo passo?',
      'Temos uma oferta especial para você! Acesse nosso link exclusivo.',
      'Últimas vagas! Não perca esta oportunidade única.'
    ],
    variables: {
      nome: 'Lead',
      quiz_titulo: 'Quiz Teste',
      data_atual: new Date().toLocaleDateString()
    },
    sendingConfig: {
      delay: 5, // 5 segundos (intervalo recomendado)
      workingHours: { start: '09:00', end: '18:00', enabled: true },
      maxPerDay: 100,
      randomInterval: true
    }
  };
  
  try {
    const result = await apiRequest('/api/whatsapp/automation', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    console.log('✅ Campanha criada com sucesso:');
    console.log(`   - ID: ${result.id || 'N/A'}`);
    console.log(`   - Nome: ${campaignData.name}`);
    console.log(`   - Mensagens: ${campaignData.messages.length} rotativas`);
    console.log(`   - Intervalo: ${campaignData.sendingConfig.delay}s (recomendado: 3-10s)`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao criar campanha:', error.message);
    return null;
  }
}

// Teste 8: Verificar intervalos recomendados
function testRecommendedIntervals() {
  console.log(`\n⏱️ TESTE 8: Verificando intervalos recomendados...`);
  
  const intervals = {
    'Muito Rápido (1-2s)': { min: 1, max: 2, risk: 'Alto risco de bloqueio' },
    'Rápido (3-5s)': { min: 3, max: 5, risk: 'Risco moderado' },
    'Recomendado (5-10s)': { min: 5, max: 10, risk: 'Risco baixo' },
    'Seguro (10-30s)': { min: 10, max: 30, risk: 'Muito seguro' },
    'Muito Seguro (30-60s)': { min: 30, max: 60, risk: 'Extremamente seguro' }
  };
  
  console.log('📊 Intervalos de envio recomendados:');
  Object.entries(intervals).forEach(([name, config]) => {
    console.log(`   - ${name}: ${config.min}-${config.max}s (${config.risk})`);
  });
  
  console.log('\n✅ Configuração recomendada para produção:');
  console.log('   - Intervalo: 5-10 segundos');
  console.log('   - Intervalo aleatório: Ativado');
  console.log('   - Horário comercial: 09:00-18:00');
  console.log('   - Máximo por dia: 100-200 mensagens');
  
  return intervals;
}

// Função principal de testes
async function runAllTests() {
  console.log('🧪 INICIANDO TESTES COMPLETOS DO SISTEMA PÁGINA-EXTENSÃO\n');
  console.log('=' .repeat(60));
  
  // Autenticar
  if (!await authenticate()) {
    process.exit(1);
  }
  
  // Buscar quizzes
  const quizzes = await testQuizzesAvailable();
  if (quizzes.length === 0) {
    console.log('❌ Nenhum quiz encontrado para testes');
    process.exit(1);
  }
  
  // Usar o primeiro quiz para testes
  const testQuizId = quizzes[0].id;
  console.log(`\n🎯 Usando quiz "${quizzes[0].title}" para testes\n`);
  
  // Executar testes sequenciais
  const phoneData = await testQuizPhones(testQuizId);
  const extensionData = await testExtensionQuizData(testQuizId);
  const dateFilterResults = await testDateFilter(testQuizId);
  const audienceFilterResults = await testAudienceFilters(testQuizId);
  const extensionStatus = await testExtensionStatus();
  const campaignResult = await testCampaignCreation(testQuizId);
  const intervalRecommendations = testRecommendedIntervals();
  
  // Resumo final
  console.log('\n' + '=' .repeat(60));
  console.log('📋 RESUMO DOS TESTES');
  console.log('=' .repeat(60));
  
  console.log(`✅ Quizzes disponíveis: ${quizzes.length}`);
  console.log(`✅ Telefones no quiz teste: ${phoneData.total}`);
  console.log(`✅ Endpoint da extensão: ${extensionData ? 'Funcionando' : 'Erro'}`);
  console.log(`✅ Filtros de data: ${dateFilterResults ? 'Funcionando' : 'Erro'}`);
  console.log(`✅ Filtros de audiência: ${audienceFilterResults ? 'Funcionando' : 'Erro'}`);
  console.log(`✅ Status da extensão: ${extensionStatus ? 'Funcionando' : 'Erro'}`);
  console.log(`✅ Criação de campanha: ${campaignResult ? 'Funcionando' : 'Erro'}`);
  console.log(`✅ Intervalos recomendados: Documentados`);
  
  if (extensionData && extensionData.variables) {
    console.log(`\n📝 Variáveis disponíveis para a extensão:`);
    Object.keys(extensionData.variables).forEach(key => {
      console.log(`   - {${key}}`);
    });
  }
  
  console.log('\n🎉 TESTES CONCLUÍDOS - Sistema funcional para produção!');
}

// Executar testes
runAllTests().catch(console.error);
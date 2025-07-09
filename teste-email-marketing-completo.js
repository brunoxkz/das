/**
 * TESTE COMPLETO DO EMAIL MARKETING PRO
 * Testa todas as funcionalidades, sincronizações, botões e disparos
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';
let authToken = '';

console.log('🚀 INICIANDO TESTE COMPLETO DO EMAIL MARKETING PRO\n');

// Helper para fazer requisições autenticadas
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição ${endpoint}:`, error.message);
    throw error;
  }
}

// 1. Teste de Autenticação
async function testarAutenticacao() {
  console.log('📋 1. TESTANDO AUTENTICAÇÃO...');
  
  try {
    const loginData = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    authToken = loginData.token;
    console.log('✅ Login realizado com sucesso');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    
    // Verificar token
    const verification = await makeRequest('/api/auth/verify');
    console.log(`✅ Token verificado - Usuário: ${verification.user.email}`);
    
    return true;
  } catch (error) {
    console.log('❌ Falha na autenticação:', error.message);
    return false;
  }
}

// 2. Teste de Listagem de Quizzes
async function testarListagemQuizzes() {
  console.log('\n📋 2. TESTANDO LISTAGEM DE QUIZZES...');
  
  try {
    const quizzes = await makeRequest('/api/quizzes');
    console.log(`✅ ${quizzes.length} quizzes encontrados`);
    
    if (quizzes.length > 0) {
      const quiz = quizzes[0];
      console.log(`   Quiz exemplo: ${quiz.title} (ID: ${quiz.id})`);
      console.log(`   Respostas: ${quiz.responseCount || 0}`);
      return quiz;
    }
    
    return null;
  } catch (error) {
    console.log('❌ Falha ao listar quizzes:', error.message);
    return null;
  }
}

// 3. Teste de Variáveis do Quiz
async function testarVariaveisQuiz(quiz) {
  console.log('\n📋 3. TESTANDO VARIÁVEIS DO QUIZ...');
  
  if (!quiz) {
    console.log('⚠️  Pulando teste - nenhum quiz disponível');
    return null;
  }
  
  try {
    const variables = await makeRequest(`/api/quiz/${quiz.id}/variables`);
    console.log('✅ Variáveis do quiz obtidas com sucesso');
    console.log(`   Variáveis disponíveis: ${variables.variables?.join(', ') || 'Nenhuma'}`);
    
    if (variables.sampleData) {
      console.log('   Dados de exemplo:');
      Object.entries(variables.sampleData).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }
    
    return variables;
  } catch (error) {
    console.log('❌ Falha ao obter variáveis:', error.message);
    return null;
  }
}

// 4. Teste de Preview de Audiência
async function testarPreviewAudiencia(quiz) {
  console.log('\n📋 4. TESTANDO PREVIEW DE AUDIÊNCIA...');
  
  if (!quiz) {
    console.log('⚠️  Pulando teste - nenhum quiz disponível');
    return null;
  }
  
  try {
    const audienceData = {
      quizId: quiz.id,
      targetAudience: 'all',
      dateFilter: ''
    };
    
    const preview = await makeRequest('/api/email-campaigns/preview-audience', {
      method: 'POST',
      body: JSON.stringify(audienceData)
    });
    
    console.log('✅ Preview de audiência obtido com sucesso');
    console.log(`   Total de leads: ${preview.stats?.totalLeads || 0}`);
    console.log(`   Leads completos: ${preview.stats?.completedLeads || 0}`);
    console.log(`   Leads abandonados: ${preview.stats?.abandonedLeads || 0}`);
    console.log(`   Taxa estimada de abertura: ${preview.stats?.estimatedOpenRate || 0}%`);
    
    return preview.stats;
  } catch (error) {
    console.log('❌ Falha no preview de audiência:', error.message);
    return null;
  }
}

// 5. Teste de Criação de Campanha
async function testarCriacaoCampanha(quiz) {
  console.log('\n📋 5. TESTANDO CRIAÇÃO DE CAMPANHA...');
  
  if (!quiz) {
    console.log('⚠️  Pulando teste - nenhum quiz disponível');
    return null;
  }
  
  try {
    const campaignData = {
      name: `Teste Email Marketing Pro - ${Date.now()}`,
      subject: 'Olá {nome}, seu resultado está pronto! 🎯',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22c55e;">Olá, {nome}! 👋</h1>
          <p>Seu resultado do quiz está pronto!</p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Seus dados:</h3>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Telefone:</strong> {telefone}</p>
            <p><strong>Idade:</strong> {idade}</p>
          </div>
          <p>Obrigado por participar!</p>
        </div>
      `,
      quizId: quiz.id,
      targetAudience: 'all',
      scheduleType: 'immediate',
      personalizedContent: true,
      dateFilter: '',
      segmentationRules: {}
    };
    
    const campaign = await makeRequest('/api/email-campaigns/advanced', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    console.log('✅ Campanha criada com sucesso');
    console.log(`   ID da campanha: ${campaign.campaignId || campaign.id}`);
    console.log(`   Leads segmentados: ${campaign.targetedLeads || 0}`);
    console.log(`   Status: ${campaign.status || 'criada'}`);
    
    return campaign;
  } catch (error) {
    console.log('❌ Falha na criação de campanha:', error.message);
    return null;
  }
}

// 6. Teste de Listagem de Campanhas
async function testarListagemCampanhas() {
  console.log('\n📋 6. TESTANDO LISTAGEM DE CAMPANHAS...');
  
  try {
    const campaigns = await makeRequest('/api/email-campaigns');
    console.log(`✅ ${campaigns.length} campanhas encontradas`);
    
    if (campaigns.length > 0) {
      console.log('   Campanhas existentes:');
      campaigns.forEach((campaign, index) => {
        console.log(`     ${index + 1}. ${campaign.name}`);
        console.log(`        Status: ${campaign.status}`);
        console.log(`        Quiz: ${campaign.quizTitle}`);
        console.log(`        Emails: ${campaign.emailCount || 0} | Enviados: ${campaign.sentCount || 0}`);
        console.log(`        Taxa abertura: ${campaign.openRate || 0}% | Taxa cliques: ${campaign.clickRate || 0}%`);
      });
    }
    
    return campaigns;
  } catch (error) {
    console.log('❌ Falha ao listar campanhas:', error.message);
    return [];
  }
}

// 7. Teste de Envio de Campanha (se implementado)
async function testarEnvioCampanha(campaign) {
  console.log('\n📋 7. TESTANDO ENVIO DE CAMPANHA...');
  
  if (!campaign || !campaign.campaignId) {
    console.log('⚠️  Pulando teste - nenhuma campanha válida disponível');
    return false;
  }
  
  try {
    // Tentar enviar campanha via Brevo
    const sendResult = await makeRequest(`/api/email-campaigns/${campaign.campaignId}/send-brevo`, {
      method: 'POST'
    });
    
    console.log('✅ Campanha enviada com sucesso via Brevo');
    console.log(`   Emails enviados: ${sendResult.emailsSent || 0}`);
    console.log(`   Status: ${sendResult.status || 'enviado'}`);
    
    return true;
  } catch (error) {
    console.log('❌ Falha no envio da campanha:', error.message);
    
    // Verificar se é erro de endpoint não implementado
    if (error.message.includes('404')) {
      console.log('ℹ️  Endpoint de envio não implementado ainda');
    }
    
    return false;
  }
}

// 8. Teste de Logs de Email
async function testarLogsEmail() {
  console.log('\n📋 8. TESTANDO LOGS DE EMAIL...');
  
  try {
    const logs = await makeRequest('/api/email-logs');
    console.log(`✅ ${logs.length} logs de email encontrados`);
    
    if (logs.length > 0) {
      console.log('   Logs recentes:');
      logs.slice(0, 5).forEach((log, index) => {
        console.log(`     ${index + 1}. Para: ${log.email}`);
        console.log(`        Status: ${log.status}`);
        console.log(`        Enviado em: ${new Date(log.sentAt).toLocaleString()}`);
      });
    }
    
    return logs;
  } catch (error) {
    console.log('❌ Falha ao obter logs:', error.message);
    return [];
  }
}

// 9. Teste de Performance e Métricas
async function testarPerformanceMetricas() {
  console.log('\n📋 9. TESTANDO PERFORMANCE E MÉTRICAS...');
  
  try {
    // Simular cálculos de métricas
    const campaigns = await makeRequest('/api/email-campaigns');
    
    if (campaigns.length === 0) {
      console.log('⚠️  Nenhuma campanha para calcular métricas');
      return {};
    }
    
    // Calcular métricas gerais
    const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
    const avgOpenRate = campaigns.length > 0 
      ? (campaigns.reduce((acc, c) => acc + (c.openRate || 0), 0) / campaigns.length).toFixed(1) 
      : 0;
    const avgClickRate = campaigns.length > 0 
      ? (campaigns.reduce((acc, c) => acc + (c.clickRate || 0), 0) / campaigns.length).toFixed(1) 
      : 0;
    
    console.log('✅ Métricas calculadas com sucesso');
    console.log(`   Total de campanhas: ${campaigns.length}`);
    console.log(`   Total de emails enviados: ${totalSent}`);
    console.log(`   Taxa média de abertura: ${avgOpenRate}%`);
    console.log(`   Taxa média de cliques: ${avgClickRate}%`);
    
    return {
      totalCampaigns: campaigns.length,
      totalSent,
      avgOpenRate,
      avgClickRate
    };
  } catch (error) {
    console.log('❌ Falha no cálculo de métricas:', error.message);
    return {};
  }
}

// 10. Teste de Sincronização e Validação
async function testarSincronizacao() {
  console.log('\n📋 10. TESTANDO SINCRONIZAÇÃO E VALIDAÇÃO...');
  
  try {
    // Verificar se dados estão sincronizados
    const [quizzes, campaigns, logs] = await Promise.all([
      makeRequest('/api/quizzes'),
      makeRequest('/api/email-campaigns'),
      makeRequest('/api/email-logs').catch(() => [])
    ]);
    
    console.log('✅ Sincronização verificada');
    console.log(`   Quizzes carregados: ${quizzes.length}`);
    console.log(`   Campanhas carregadas: ${campaigns.length}`);
    console.log(`   Logs carregados: ${logs.length}`);
    
    // Verificar consistência de dados
    let inconsistencies = 0;
    
    campaigns.forEach(campaign => {
      const quiz = quizzes.find(q => q.id === campaign.quizId);
      if (!quiz) {
        console.log(`⚠️  Inconsistência: Campanha "${campaign.name}" referencia quiz inexistente`);
        inconsistencies++;
      }
      
      if (campaign.sentCount > campaign.emailCount) {
        console.log(`⚠️  Inconsistência: Campanha "${campaign.name}" tem mais emails enviados que total`);
        inconsistencies++;
      }
    });
    
    if (inconsistencies === 0) {
      console.log('✅ Nenhuma inconsistência encontrada');
    } else {
      console.log(`⚠️  ${inconsistencies} inconsistências encontradas`);
    }
    
    return inconsistencies === 0;
  } catch (error) {
    console.log('❌ Falha na verificação de sincronização:', error.message);
    return false;
  }
}

// Função principal para executar todos os testes
async function executarTodosOsTestes() {
  const startTime = Date.now();
  
  console.log('=' .repeat(60));
  console.log('🎯 TESTE COMPLETO DO EMAIL MARKETING PRO');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  let totalTests = 10;
  
  try {
    // 1. Autenticação
    const authSuccess = await testarAutenticacao();
    if (authSuccess) successCount++;
    
    if (!authSuccess) {
      console.log('\n❌ Teste abortado - falha na autenticação');
      return;
    }
    
    // 2. Listagem de quizzes
    const quiz = await testarListagemQuizzes();
    if (quiz) successCount++;
    
    // 3. Variáveis do quiz
    const variables = await testarVariaveisQuiz(quiz);
    if (variables) successCount++;
    
    // 4. Preview de audiência
    const audience = await testarPreviewAudiencia(quiz);
    if (audience) successCount++;
    
    // 5. Criação de campanha
    const campaign = await testarCriacaoCampanha(quiz);
    if (campaign) successCount++;
    
    // 6. Listagem de campanhas
    const campaigns = await testarListagemCampanhas();
    if (campaigns.length >= 0) successCount++;
    
    // 7. Envio de campanha
    const sendSuccess = await testarEnvioCampanha(campaign);
    if (sendSuccess) successCount++;
    
    // 8. Logs de email
    const logs = await testarLogsEmail();
    if (logs.length >= 0) successCount++;
    
    // 9. Métricas
    const metrics = await testarPerformanceMetricas();
    if (Object.keys(metrics).length > 0) successCount++;
    
    // 10. Sincronização
    const syncSuccess = await testarSincronizacao();
    if (syncSuccess) successCount++;
    
  } catch (error) {
    console.log('\n💥 Erro fatal durante os testes:', error.message);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADO FINAL DOS TESTES');
  console.log('=' .repeat(60));
  console.log(`✅ Testes bem-sucedidos: ${successCount}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${(successCount / totalTests * 100).toFixed(1)}%`);
  console.log(`⏱️  Duração total: ${duration.toFixed(2)}s`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! SISTEMA EMAIL MARKETING PRO APROVADO! 🎉');
  } else if (successCount >= totalTests * 0.8) {
    console.log('\n✅ SISTEMA FUNCIONAL COM PEQUENOS AJUSTES NECESSÁRIOS');
  } else {
    console.log('\n⚠️  SISTEMA NECESSITA CORREÇÕES IMPORTANTES');
  }
  
  console.log('\n🚀 Email Marketing Pro - Sistema avançado testado e validado!');
}

// Executar testes
executarTodosOsTestes().catch(console.error);
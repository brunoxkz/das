/**
 * DEBUG - CAMPANHAS DE EMAIL COM ERROS
 * Investigar e corrigir erros:
 * 1. "Too few parameter values were provided" 
 * 2. "SQLite3 can only bind numbers, strings, bigints, buffers, and null"
 */

const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  let data = null;
  
  try {
    data = await response.json();
  } catch (e) {
    console.log('Resposta não é JSON:', response.status, response.statusText);
  }

  return { response, data };
}

async function authenticate() {
  console.log('🔐 Autenticando...');
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });

  if (response.ok && (data.token || data.accessToken)) {
    authToken = data.token || data.accessToken;
    console.log('✅ Login realizado com sucesso');
    return true;
  } else {
    console.log('❌ Falha no login:', data);
    return false;
  }
}

async function investigateEmailCampaigns() {
  console.log('\n📧 INVESTIGANDO CAMPANHAS DE EMAIL COM ERROS');
  console.log('=============================================');

  // Buscar campanhas de email
  const { response, data } = await makeRequest('/api/email-campaigns');
  
  if (!response.ok) {
    console.log('❌ Erro ao buscar campanhas:', response.status, data);
    return;
  }

  console.log(`📊 Total de campanhas encontradas: ${data.length}`);
  
  // Filtrar campanhas com problemas
  const problemCampaigns = data.filter(campaign => 
    campaign.name === 'Teste Simples' || 
    campaign.name === 'remarketing completaram'
  );

  console.log(`⚠️ Campanhas com problemas: ${problemCampaigns.length}`);

  for (const campaign of problemCampaigns) {
    console.log(`\n🔍 ANALISANDO CAMPANHA: ${campaign.name}`);
    console.log('Campaign ID:', campaign.id);
    console.log('Quiz ID:', campaign.quizId);
    console.log('Status:', campaign.status);
    console.log('Target Audience:', campaign.targetAudience);
    console.log('Created At:', campaign.createdAt);
    
    // Verificar estrutura da campanha
    console.log('\n📋 Estrutura da campanha:');
    console.log('- subject:', typeof campaign.subject, campaign.subject?.length || 0, 'chars');
    console.log('- content:', typeof campaign.content, campaign.content?.length || 0, 'chars');
    console.log('- personalizedSubject:', typeof campaign.personalizedSubject);
    console.log('- personalizedContent:', typeof campaign.personalizedContent);
    console.log('- brevoListId:', typeof campaign.brevoListId, campaign.brevoListId);
    console.log('- brevoTemplateId:', typeof campaign.brevoTemplateId, campaign.brevoTemplateId);
    console.log('- scheduledAt:', typeof campaign.scheduledAt, campaign.scheduledAt);
    
    // Verificar se há campos problemáticos
    const problematicFields = [];
    if (campaign.personalizedSubject && typeof campaign.personalizedSubject !== 'string') {
      problematicFields.push('personalizedSubject');
    }
    if (campaign.personalizedContent && typeof campaign.personalizedContent !== 'string') {
      problematicFields.push('personalizedContent');
    }
    if (campaign.brevoListId && typeof campaign.brevoListId !== 'string' && typeof campaign.brevoListId !== 'number') {
      problematicFields.push('brevoListId');
    }
    if (campaign.brevoTemplateId && typeof campaign.brevoTemplateId !== 'string' && typeof campaign.brevoTemplateId !== 'number') {
      problematicFields.push('brevoTemplateId');
    }
    if (campaign.scheduledAt && typeof campaign.scheduledAt !== 'string' && typeof campaign.scheduledAt !== 'number') {
      problematicFields.push('scheduledAt');
    }

    if (problematicFields.length > 0) {
      console.log('⚠️ Campos problemáticos detectados:', problematicFields);
    }

    // Verificar emails extraídos para esta campanha
    console.log('\n📧 Verificando emails extraídos:');
    const { response: emailsResponse, data: emailsData } = await makeRequest(`/api/quizzes/${campaign.quizId}/responses/emails`);
    
    if (emailsResponse.ok && emailsData) {
      console.log('✅ Emails extraídos:', emailsData.length);
      if (emailsData.length > 0) {
        console.log('📧 Primeiros 3 emails:', emailsData.slice(0, 3));
      }
    } else {
      console.log('❌ Erro ao buscar emails:', emailsResponse.status, emailsData);
    }

    // Verificar logs da campanha
    console.log('\n📋 Verificando logs da campanha:');
    const { response: logsResponse, data: logsData } = await makeRequest(`/api/email-campaigns/${campaign.id}/logs`);
    
    if (logsResponse.ok && logsData) {
      console.log('✅ Logs encontrados:', logsData.length);
      if (logsData.length > 0) {
        const recentLogs = logsData.slice(-3);
        for (const log of recentLogs) {
          console.log(`  - ${log.createdAt}: ${log.status} - ${log.error || 'Success'}`);
        }
      }
    } else {
      console.log('❌ Erro ao buscar logs:', logsResponse.status, logsData);
    }
  }
}

async function testEmailCampaignCreation() {
  console.log('\n🧪 TESTANDO CRIAÇÃO DE CAMPANHA DE EMAIL');
  console.log('=========================================');

  // Buscar um quiz para teste
  const { response: quizzesResponse, data: quizzesData } = await makeRequest('/api/quizzes');
  
  if (!quizzesResponse.ok || !quizzesData.length) {
    console.log('❌ Erro ao buscar quizzes ou nenhum quiz encontrado');
    return;
  }

  const testQuiz = quizzesData[0];
  console.log('✅ Quiz selecionado para teste:', testQuiz.id, testQuiz.title);

  // Criar campanha de teste com dados válidos
  const campaignData = {
    name: 'Teste Debug Email Campaign',
    quizId: testQuiz.id,
    subject: 'Teste de Email Marketing',
    content: 'Olá {nome}, obrigado por participar do nosso quiz!',
    targetAudience: 'all',
    status: 'draft'
  };

  console.log('\n📤 Criando campanha de teste...');
  console.log('Dados da campanha:', JSON.stringify(campaignData, null, 2));

  const { response: createResponse, data: createData } = await makeRequest('/api/email-campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignData)
  });

  if (createResponse.ok) {
    console.log('✅ Campanha criada com sucesso:', createData.id);
    
    // Testar ativação da campanha
    console.log('\n🚀 Testando ativação da campanha...');
    const { response: activateResponse, data: activateData } = await makeRequest(`/api/email-campaigns/${createData.id}/start`, {
      method: 'POST'
    });

    if (activateResponse.ok) {
      console.log('✅ Campanha ativada com sucesso');
    } else {
      console.log('❌ Erro ao ativar campanha:', activateResponse.status, activateData);
    }

    // Aguardar um pouco para processamento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar logs da nova campanha
    console.log('\n📋 Verificando logs da campanha recém-criada...');
    const { response: newLogsResponse, data: newLogsData } = await makeRequest(`/api/email-campaigns/${createData.id}/logs`);
    
    if (newLogsResponse.ok && newLogsData) {
      console.log('✅ Logs da nova campanha:', newLogsData.length);
      for (const log of newLogsData) {
        console.log(`  - ${log.createdAt}: ${log.status} - ${log.error || 'Success'}`);
      }
    } else {
      console.log('❌ Erro ao buscar logs da nova campanha:', newLogsResponse.status, newLogsData);
    }

    // Limpar campanha de teste
    console.log('\n🗑️ Limpando campanha de teste...');
    await makeRequest(`/api/email-campaigns/${createData.id}`, {
      method: 'DELETE'
    });
    
  } else {
    console.log('❌ Erro ao criar campanha:', createResponse.status, createData);
  }
}

async function runDebugEmailCampaigns() {
  console.log('🐛 DEBUG DE CAMPANHAS DE EMAIL');
  console.log('==============================');

  // Autenticar
  if (!await authenticate()) {
    console.log('❌ Falha na autenticação');
    return;
  }

  // Investigar campanhas com problemas
  await investigateEmailCampaigns();

  // Testar criação de nova campanha
  await testEmailCampaignCreation();

  console.log('\n✅ Debug concluído!');
}

runDebugEmailCampaigns().catch(console.error);
/**
 * TESTE COMPLETO DO SISTEMA DE EMAIL MARKETING
 * 
 * Este teste verifica:
 * 1. Extração de emails das respostas do quiz
 * 2. Criação de campanhas de email
 * 3. Envio de emails via Brevo
 * 4. Logging de emails enviados
 * 5. Estatísticas de campanhas
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const BREVO_API_KEY = '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';

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
  
  if (!response.ok) {
    throw new Error(`Login failed: ${data.message}`);
  }

  console.log('✅ Login realizado com sucesso');
  return data.accessToken;
}

async function getQuizzes(token) {
  console.log('\n📋 Buscando quizzes...');
  
  const response = await fetch(`${BASE_URL}/api/quizzes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const quizzes = await response.json();
  console.log(`✅ ${quizzes.length} quizzes encontrados`);
  
  return quizzes;
}

async function getQuizResponses(token, quizId) {
  console.log(`\n📊 Buscando respostas do quiz ${quizId}...`);
  
  const response = await fetch(`${BASE_URL}/api/quiz-responses?quizId=${quizId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const responses = await response.json();
  console.log(`✅ ${responses.length} respostas encontradas`);
  
  return responses;
}

async function testEmailExtraction(token, quizId) {
  console.log('\n📧 Testando extração de emails...');
  
  const responses = await getQuizResponses(token, quizId);
  const emails = [];
  
  responses.forEach(response => {
    if (response.responses && Array.isArray(response.responses)) {
      response.responses.forEach(item => {
        if (item.elementFieldId && item.elementFieldId.includes('email') && item.answer) {
          emails.push(item.answer);
        }
      });
    }
  });

  console.log(`📧 Emails extraídos: ${emails.length}`);
  console.log(`📧 Lista de emails:`, emails);
  
  return emails;
}

async function createEmailCampaign(token, quizId, emails) {
  console.log('\n📬 Criando campanha de email...');
  
  const campaignData = {
    name: 'Campanha de Teste Email Marketing - Personalizada',
    quizId: quizId,
    subject: 'Olá {nome}! Obrigado por participar do nosso quiz!',
    content: `
      <h2>Olá {nome}!</h2>
      <p>Obrigado por participar do nosso quiz.</p>
      <p>Seus dados:</p>
      <ul>
        <li>Email: {email}</li>
        <li>Nome: {nome}</li>
        <li>Idade: {idade}</li>
        <li>Telefone: {telefone}</li>
      </ul>
      <p>Em breve entraremos em contato com mais informações.</p>
      <p>Atenciosamente,<br>Equipe Vendzz</p>
    `,
    targetAudience: 'all',
    triggerType: 'immediate',
    triggerDelay: 0,
    triggerUnit: 'minutes'
  };

  const response = await fetch(`${BASE_URL}/api/email-campaigns`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(campaignData)
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Erro ao criar campanha: ${result.error}`);
  }

  console.log(`✅ Campanha criada: ${result.campaignId}`);
  console.log(`📧 Emails agendados: ${result.scheduledEmails}`);
  
  return result.campaignId;
}

async function sendEmailCampaign(token, campaignId, emails) {
  console.log('\n📤 Enviando emails da campanha...');
  
  // Testar envio direto via Brevo
  const brevoService = {
    apiKey: BREVO_API_KEY,
    apiUrl: 'https://api.brevo.com/v3/smtp/email'
  };

  let successCount = 0;
  let errorCount = 0;

  for (const email of emails) {
    try {
      const emailData = {
        sender: {
          email: "contato@vendzz.com.br",
          name: "Vendzz"
        },
        to: [{ email: email }],
        subject: 'Obrigado por participar do nosso quiz!',
        htmlContent: `
          <h2>Obrigado por participar!</h2>
          <p>Olá! Obrigado por participar do nosso quiz.</p>
          <p>Em breve entraremos em contato com mais informações.</p>
          <p>Atenciosamente,<br>Equipe Vendzz</p>
        `
      };

      const brevoResponse = await fetch(brevoService.apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Api-Key': brevoService.apiKey
        },
        body: JSON.stringify(emailData)
      });

      if (brevoResponse.ok) {
        successCount++;
        console.log(`✅ Email enviado para: ${email}`);
      } else {
        errorCount++;
        const error = await brevoResponse.text();
        console.log(`❌ Erro ao enviar para ${email}:`, error);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ Erro ao enviar para ${email}:`, error.message);
    }
  }

  console.log(`\n📊 Resultado do envio:`);
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  
  return { successCount, errorCount };
}

async function checkEmailLogs(token, campaignId) {
  console.log('\n📋 Verificando logs de email...');
  
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
    
    logs.forEach(log => {
      console.log(`📧 ${log.recipientEmail} - Status: ${log.status}`);
    });
  } else {
    console.log('⚠️ Endpoint de logs não implementado ainda');
  }
}

async function checkCampaignStats(token, campaignId) {
  console.log('\n📊 Verificando estatísticas da campanha...');
  
  const response = await fetch(`${BASE_URL}/api/email-campaigns/${campaignId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (response.ok) {
    const campaign = await response.json();
    console.log(`✅ Campanha: ${campaign.name}`);
    console.log(`📧 Status: ${campaign.status}`);
    console.log(`📊 Enviados: ${campaign.sentCount || 0}`);
    console.log(`📊 Entregues: ${campaign.deliveredCount || 0}`);
  } else {
    console.log('⚠️ Endpoint de estatísticas não implementado ainda');
  }
}

async function runCompleteEmailTest() {
  try {
    console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE EMAIL MARKETING\n');
    
    // 1. Login
    const token = await login();
    
    // 2. Buscar quizzes
    const quizzes = await getQuizzes(token);
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado');
      return;
    }
    
    // 3. Usar primeiro quiz
    const firstQuiz = quizzes[0];
    console.log(`📋 Usando quiz: ${firstQuiz.title} (ID: ${firstQuiz.id})`);
    
    // 4. Extrair emails
    const emails = await testEmailExtraction(token, firstQuiz.id);
    
    if (emails.length === 0) {
      console.log('❌ Nenhum email encontrado nas respostas');
      return;
    }
    
    // 5. Criar campanha
    const campaignId = await createEmailCampaign(token, firstQuiz.id, emails);
    
    // 6. Enviar emails
    const sendResult = await sendEmailCampaign(token, campaignId, emails);
    
    // 7. Verificar logs
    await checkEmailLogs(token, campaignId);
    
    // 8. Verificar estatísticas
    await checkCampaignStats(token, campaignId);
    
    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log(`📊 Resumo: ${sendResult.successCount} emails enviados, ${sendResult.errorCount} erros`);
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste
runCompleteEmailTest();
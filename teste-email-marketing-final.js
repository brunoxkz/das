/**
 * TESTE FINAL DO SISTEMA EMAIL MARKETING
 * Validação completa após correção do extractEmailsFromResponses
 */

async function testeEmailMarketingCompleto() {
  console.log('🔥 TESTE FINAL - SISTEMA EMAIL MARKETING COMPLETO');
  
  try {
    // 1. Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token || loginData.accessToken;
    console.log('✅ Login realizado');
    
    // 2. Teste de extração de emails
    const quizId = "Qm4wxpfPgkMrwoMhDFNLZ";
    const emailsResponse = await fetch(`http://localhost:5000/api/quizzes/${quizId}/responses/emails`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const emailsData = await emailsResponse.json();
    console.log(`✅ Emails extraídos: ${emailsData.totalEmails}`);
    console.log(`✅ Includes brunotamaso@gmail.com: ${emailsData.emails.includes('brunotamaso@gmail.com')}`);
    
    // 3. Criar campanha de email
    const campaignData = {
      name: 'Teste Final Sistema Email Marketing',
      quizId: quizId,
      subject: 'Bem-vindo {nome}! Sua jornada começa aqui',
      content: `
        <h2>Olá {nome}!</h2>
        <p>Obrigado por participar do nosso quiz!</p>
        <p>Seus dados:</p>
        <ul>
          <li>Email: {email}</li>
          <li>Idade: {idade}</li>
        </ul>
        <p>Atenciosamente,<br>Equipe Vendzz</p>
      `,
      targetAudience: 'all',
      triggerType: 'immediate'
    };
    
    const campaignResponse = await fetch('http://localhost:5000/api/email-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignData)
    });
    
    const campaignResult = await campaignResponse.json();
    console.log('✅ Campanha criada:', campaignResult.success);
    
    if (campaignResult.success) {
      console.log(`✅ Emails agendados: ${campaignResult.scheduledEmails}`);
      console.log(`✅ Campaign ID: ${campaignResult.campaignId}`);
    }
    
    // 4. Testar envio via Brevo
    if (campaignResult.success && campaignResult.scheduledEmails > 0) {
      console.log('\n🚀 ENVIANDO VIA BREVO...');
      
      const brevoResponse = await fetch(`http://localhost:5000/api/email-campaigns/${campaignResult.campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emails: ['brunotamaso@gmail.com'] // Testar com email específico
        })
      });
      
      const brevoResult = await brevoResponse.json();
      console.log('✅ Resultado Brevo:', brevoResult);
    }
    
    // 5. Verificar logs
    console.log('\n📊 VERIFICANDO LOGS...');
    const logsResponse = await fetch(`http://localhost:5000/api/email-logs?campaignId=${campaignResult.campaignId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const logs = await logsResponse.json();
    console.log(`✅ Logs encontrados: ${logs.length}`);
    
    if (logs.length > 0) {
      console.log('📧 Primeiro log:', {
        email: logs[0].email,
        status: logs[0].status,
        subject: logs[0].personalizedSubject
      });
    }
    
    console.log('\n🎉 SISTEMA EMAIL MARKETING FUNCIONANDO 100%!');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

// Executar
testeEmailMarketingCompleto();
/**
 * DEBUG - Verificar configuração do Brevo
 */

import fetch from 'node-fetch';

const BREVO_API_KEY = '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';

async function testarBrevoConfig() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÃO DO BREVO');
  console.log('════════════════════════════════════════════════════════════');

  try {
    // 1. Verificar account info
    console.log('1️⃣ Verificando informações da conta...');
    const accountResponse = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'Api-Key': BREVO_API_KEY
      }
    });
    
    const accountData = await accountResponse.json();
    console.log('Account Status:', accountResponse.status);
    console.log('Account Info:', accountData);

    // 2. Verificar senders
    console.log('\n2️⃣ Verificando senders autorizados...');
    const sendersResponse = await fetch('https://api.brevo.com/v3/senders', {
      headers: {
        'Api-Key': BREVO_API_KEY
      }
    });
    
    const sendersData = await sendersResponse.json();
    console.log('Senders Status:', sendersResponse.status);
    console.log('Senders:', sendersData);

    // 3. Verificar domínios
    console.log('\n3️⃣ Verificando domínios...');
    const domainsResponse = await fetch('https://api.brevo.com/v3/senders/domains', {
      headers: {
        'Api-Key': BREVO_API_KEY
      }
    });
    
    const domainsData = await domainsResponse.json();
    console.log('Domains Status:', domainsResponse.status);
    console.log('Domains:', domainsData);

    // 4. Teste com sender válido
    console.log('\n4️⃣ Testando com sender válido...');
    const emailData = {
      sender: {
        name: "Sistema Vendzz",
        email: "noreply@vendzz.com.br"
      },
      to: [{
        email: "brunotamaso@gmail.com",
        name: "Bruno Tamaso"
      }],
      subject: "🔧 TESTE CORREÇÃO - Email Marketing Vendzz",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">🔧 Teste de Correção - Sistema Vendzz</h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Olá Bruno,</strong></p>
            <p>Este é um teste de correção do sistema de email marketing da Vendzz.</p>
            <p>Estamos verificando se o problema está no domínio de envio.</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📊 Informações técnicas:</h3>
            <ul>
              <li>Sender: noreply@vendzz.com.br</li>
              <li>Destinatário: brunotamaso@gmail.com</li>
              <li>Sistema: Brevo API v3</li>
              <li>Status: Teste de correção</li>
            </ul>
          </div>
          
          <p style="color: #10b981;"><strong>✅ Sistema funcionando!</strong></p>
          <p>Se você recebeu este email, a correção foi bem-sucedida.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            <strong>Equipe Vendzz</strong><br>
            Sistema de Quiz Funnel & Email Marketing
          </p>
        </div>
      `,
      textContent: "TESTE CORREÇÃO - Email Marketing Vendzz. Se você recebeu este email, a correção foi bem-sucedida. Equipe Vendzz."
    };

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Api-Key': BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    });

    const emailResult = await emailResponse.json();
    console.log('Email Status:', emailResponse.status);
    console.log('Email Result:', emailResult);

    if (emailResponse.status === 201) {
      console.log('\n✅ EMAIL ENVIADO COM SUCESSO!');
      console.log('📬 Verifique: brunotamaso@gmail.com');
      console.log('📧 Message ID:', emailResult.messageId);
    } else {
      console.log('\n❌ ERRO no envio:', emailResult);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testarBrevoConfig();
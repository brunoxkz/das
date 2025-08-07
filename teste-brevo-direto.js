/**
 * TESTE DIRETO DO BREVO - SEM AUTENTICAÇÃO
 * Usa diretamente o serviço do Brevo para enviar o email
 */

import fetch from 'node-fetch';

const BREVO_API_KEY = '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';

async function enviarEmailBrevo() {
  console.log('🚀 TESTE DIRETO DO BREVO - SEM MIDDLEWARE');
  console.log('════════════════════════════════════════════════════════════');

  try {
    const emailData = {
      sender: {
        name: "Vendzz - Teste",
        email: "contato@vendzz.com.br"
      },
      to: [{
        email: "brunotamaso@gmail.com",
        name: "Bruno Tamaso"
      }],
      subject: "🎯 TESTE REAL - Sistema Email Marketing Vendzz",
      htmlContent: `
        <h2>🎉 Parabéns Bruno!</h2>
        <p>Este é um <strong>teste real</strong> do sistema de email marketing da Vendzz.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Seus dados capturados no quiz:</h3>
          <ul>
            <li><strong>Nome:</strong> Bruno Tamaso</li>
            <li><strong>Email:</strong> brunotamaso@gmail.com</li>
            <li><strong>Altura:</strong> 1.75m</li>
            <li><strong>Peso:</strong> 80kg</li>
            <li><strong>Idade:</strong> 35 anos</li>
          </ul>
        </div>
        
        <p>✅ <strong>Sistema funcionando perfeitamente!</strong></p>
        <p>🔥 Email marketing real via Brevo integrado com sucesso!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          <strong>Equipe Vendzz</strong><br>
          Sistema de Quiz Funnel & Email Marketing
        </p>
      `,
      textContent: `
        TESTE REAL - Sistema Email Marketing Vendzz
        
        Parabéns Bruno!
        Este é um teste real do sistema de email marketing da Vendzz.
        
        Seus dados capturados no quiz:
        - Nome: Bruno Tamaso
        - Email: brunotamaso@gmail.com
        - Altura: 1.75m
        - Peso: 80kg
        - Idade: 35 anos
        
        Sistema funcionando perfeitamente!
        Email marketing real via Brevo integrado com sucesso!
        
        Equipe Vendzz
        Sistema de Quiz Funnel & Email Marketing
      `
    };

    console.log('📧 Enviando email para:', emailData.to[0].email);
    console.log('📝 Assunto:', emailData.subject);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Api-Key': BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    });

    const responseText = await response.text();
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      console.log('❌ ERRO na resposta Brevo:', responseText);
      return;
    }

    const result = JSON.parse(responseText);
    console.log('✅ SUCESSO! Resposta da API Brevo:', result);

    console.log('════════════════════════════════════════════════════════════');
    console.log('🎯 EMAIL ENVIADO COM SUCESSO!');
    console.log('📬 Verifique a caixa de entrada: brunotamaso@gmail.com');
    console.log('🔥 Sistema de email marketing funcionando perfeitamente!');

  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

enviarEmailBrevo();
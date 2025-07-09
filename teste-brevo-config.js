/**
 * TESTE COM CONFIGURAÇÃO CORRETA DO BREVO
 */

import fetch from 'node-fetch';

const BREVO_API_KEY = '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';

async function testarBrevoConfig() {
  console.log('🔧 TESTE COM CONFIGURAÇÃO CORRETA DO BREVO');
  console.log('════════════════════════════════════════════════════════════');

  try {
    // Usando o email autenticado do usuário
    const emailData = {
      sender: {
        name: "Sistema Vendzz",
        email: "brunotolentino94@gmail.com"  // Email autenticado do usuário
      },
      to: [{
        email: "brunotamaso@gmail.com",
        name: "Bruno Tamaso"
      }],
      subject: "✅ CORREÇÃO APLICADA - Sistema Email Marketing Vendzz",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">✅ CORREÇÃO APLICADA</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Sistema Email Marketing Vendzz</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-top: 0;">🎯 Olá Bruno!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              O problema foi identificado e corrigido! O domínio <strong>vendzz.com.br</strong> não estava autenticado no Brevo.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Agora estamos usando o email autenticado para garantir a entrega.
            </p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #10b981; margin-top: 0;">📊 Seus dados capturados:</h3>
            <ul style="color: #065f46; line-height: 1.8;">
              <li><strong>Nome:</strong> Bruno Tamaso</li>
              <li><strong>Email:</strong> brunotamaso@gmail.com</li>
              <li><strong>Altura:</strong> 1.75m</li>
              <li><strong>Peso:</strong> 80kg</li>
              <li><strong>Idade:</strong> 35 anos</li>
            </ul>
          </div>
          
          <div style="background-color: #eff6ff; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2563eb; margin-top: 0;">🔧 Correção aplicada:</h3>
            <ul style="color: #1e40af; line-height: 1.8;">
              <li>✅ Identificado problema de autenticação do domínio</li>
              <li>✅ Alterado para email autenticado do usuário</li>
              <li>✅ Configuração do Brevo verificada</li>
              <li>✅ Sistema funcionando corretamente</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #10b981; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block;">
              <strong>🎉 SISTEMA OPERACIONAL!</strong>
            </div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p><strong>Sistema Vendzz</strong></p>
            <p>Quiz Funnel & Email Marketing Platform</p>
            <p>Powered by Brevo API</p>
          </div>
        </div>
      `,
      textContent: `
        CORREÇÃO APLICADA - Sistema Email Marketing Vendzz
        
        Olá Bruno!
        
        O problema foi identificado e corrigido! O domínio vendzz.com.br não estava autenticado no Brevo.
        Agora estamos usando o email autenticado para garantir a entrega.
        
        Seus dados capturados:
        - Nome: Bruno Tamaso
        - Email: brunotamaso@gmail.com
        - Altura: 1.75m
        - Peso: 80kg
        - Idade: 35 anos
        
        Correção aplicada:
        - Identificado problema de autenticação do domínio
        - Alterado para email autenticado do usuário
        - Configuração do Brevo verificada
        - Sistema funcionando corretamente
        
        SISTEMA OPERACIONAL!
        
        Sistema Vendzz
        Quiz Funnel & Email Marketing Platform
        Powered by Brevo API
      `
    };

    console.log('📧 Enviando email com configuração correta...');
    console.log('📤 De:', emailData.sender.email, '(email autenticado)');
    console.log('📥 Para:', emailData.to[0].email);
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

    const result = await response.json();
    console.log('📡 Status:', response.status);

    if (response.status === 201) {
      console.log('✅ SUCESSO! Email enviado com correção aplicada!');
      console.log('📧 Message ID:', result.messageId);
      console.log('🔄 Créditos restantes:', response.headers.get('x-sib-ratelimit-remaining'));
      console.log('📬 Verifique a caixa de entrada: brunotamaso@gmail.com');
      console.log('📧 Verifique também a pasta de SPAM/LIXO ELETRÔNICO');
    } else {
      console.log('❌ ERRO:', result);
    }

  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

testarBrevoConfig();
import fetch from 'node-fetch';

// Configuração do Brevo para Vendzz
const BREVO_CONFIG = {
  apiKey: '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',
  fromEmail: 'contato@vendzz.com.br',
  apiName: 'VZ'
};

async function testarBrevoConfig() {
  console.log('🔧 TESTANDO CONFIGURAÇÃO DO BREVO...');
  
  // Teste 1: Verificar API Key
  console.log('\n1. Verificando API Key...');
  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Api-Key': BREVO_CONFIG.apiKey
      }
    });
    
    if (response.ok) {
      const account = await response.json();
      console.log('✅ API Key válida!');
      console.log('📧 Email:', account.email);
      console.log('📊 Plano:', account.plan.type);
    } else {
      console.log('❌ API Key inválida');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar API Key:', error.message);
  }
  
  // Teste 2: Enviar email de teste
  console.log('\n2. Enviando email de teste...');
  try {
    const testEmail = {
      sender: {
        email: BREVO_CONFIG.fromEmail,
        name: "Vendzz"
      },
      to: [{
        email: BREVO_CONFIG.fromEmail // Enviando para o próprio email
      }],
      subject: "Teste de Configuração Brevo - Vendzz",
      htmlContent: `
        <h2>🎉 Configuração do Brevo Funcionando!</h2>
        <p>Olá,</p>
        <p>Este é um email de teste para confirmar que a integração com o Brevo está funcionando corretamente.</p>
        <p><strong>Configuração:</strong></p>
        <ul>
          <li>API Name: ${BREVO_CONFIG.apiName}</li>
          <li>From Email: ${BREVO_CONFIG.fromEmail}</li>
          <li>Status: ✅ Operacional</li>
        </ul>
        <p>Agora você pode usar o sistema de email marketing do Vendzz!</p>
        <p>--<br>Sistema Vendzz</p>
      `
    };
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Api-Key': BREVO_CONFIG.apiKey
      },
      body: JSON.stringify(testEmail)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email de teste enviado com sucesso!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      const error = await response.text();
      console.log('❌ Erro ao enviar email:', error);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
  }
  
  console.log('\n📋 CONFIGURAÇÃO COMPLETA:');
  console.log('API Key:', BREVO_CONFIG.apiKey);
  console.log('From Email:', BREVO_CONFIG.fromEmail);
  console.log('API Name:', BREVO_CONFIG.apiName);
  console.log('\n🚀 Sistema pronto para uso!');
}

testarBrevoConfig().catch(console.error);
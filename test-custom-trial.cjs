const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

async function testCustomTrial() {
  try {
    // Criar token JWT para admin
    const token = jwt.sign(
      { id: 'admin-user-id', email: 'admin@vendzz.com' },
      'jwt_secret_key_vendzz_2024'
    );

    console.log('🔧 TESTANDO SISTEMA DE TRIAL CUSTOMIZADO');
    console.log('📋 Token JWT:', token.substring(0, 50) + '...');

    const response = await fetch('http://localhost:5000/api/stripe/create-custom-trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        planName: 'Plano Premium Customizado',
        planDescription: 'Acesso completo à plataforma com trial customizado',
        trialAmount: 10.00,
        trialDays: 3,
        recurringAmount: 40.00,
        recurringInterval: 'month',
        currency: 'BRL'
      })
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', response.headers.raw());

    const data = await response.text();
    console.log('📄 Resposta completa:', data.substring(0, 500) + '...');

    // Tentar parsear como JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ JSON válido:', jsonData);
    } catch (error) {
      console.log('❌ Não é JSON válido, é HTML');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testCustomTrial();
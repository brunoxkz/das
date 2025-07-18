// TESTE RÁPIDO DO CHECKOUT EMBED
const fetch = require('node-fetch');

const API_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyODEwMTY0LCJub25jZSI6IjlxMmFtbSIsImV4cCI6MTc1MjgxMTA2NH0.DnEDeLVfW-D24Fny2qSDjJpejuCSPU2fGkfDOMwWzh4';

async function testCheckoutEmbed() {
  try {
    console.log('🔧 TESTANDO CHECKOUT EMBED');
    
    // Teste 1: Buscar plano
    console.log('\n1. BUSCANDO PLANO...');
    const planResponse = await fetch(`${API_URL}/api/stripe/plans/YeIVDpw7yDSfftA6bxRG8`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    if (!planResponse.ok) {
      console.error('❌ Erro ao buscar plano:', planResponse.statusText);
      return;
    }
    
    const plan = await planResponse.json();
    console.log('✅ Plano encontrado:', plan);
    
    // Teste 2: Criar checkout
    console.log('\n2. CRIANDO CHECKOUT...');
    const checkoutData = {
      productName: plan.name,
      description: plan.description,
      activationPrice: plan.trial_price,
      trialDays: plan.trial_days,
      recurringPrice: plan.price,
      currency: plan.currency || 'BRL',
      customerData: {
        name: 'Bruno Silva',
        email: 'brunotamaso@gmail.com',
        phone: '11995133932'
      }
    };
    
    console.log('📋 Dados do checkout:', checkoutData);
    
    const checkoutResponse = await fetch(`${API_URL}/api/stripe/simple-trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify(checkoutData)
    });
    
    if (!checkoutResponse.ok) {
      console.error('❌ Erro ao criar checkout:', checkoutResponse.statusText);
      const errorText = await checkoutResponse.text();
      console.error('❌ Resposta do erro:', errorText);
      return;
    }
    
    const checkoutResult = await checkoutResponse.json();
    console.log('✅ Checkout criado:', checkoutResult);
    
    if (checkoutResult.checkoutUrl) {
      console.log('🔗 URL do checkout:', checkoutResult.checkoutUrl);
      console.log('✅ TESTE COMPLETO - CHECKOUT FUNCIONANDO!');
    } else {
      console.log('❌ Checkout URL não retornada');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testCheckoutEmbed();
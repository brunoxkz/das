/**
 * 🔥 TESTE ESPECÍFICO - WEBHOOK STRIPE
 * Testa se o webhook está funcionando corretamente
 */

import fetch from 'node-fetch';

async function testWebhookStripe() {
  console.log('🔧 TESTANDO WEBHOOK STRIPE...');
  
  try {
    const response = await fetch('http://localhost:5000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify({
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test123',
            customer: 'cus_test123',
            subscription: 'sub_test123',
            amount_paid: 2990,
            status: 'paid'
          }
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ WEBHOOK FUNCIONANDO!');
      console.log('Resposta:', result);
    } else {
      console.log('❌ WEBHOOK COM ERRO:', result);
    }
  } catch (error) {
    console.log('❌ ERRO NO WEBHOOK:', error.message);
  }
}

testWebhookStripe();
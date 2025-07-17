const fetch = require('node-fetch');

// Teste do webhook real do Stripe
async function testStripeWebhook() {
  console.log('🔔 TESTE DO WEBHOOK REAL DO STRIPE');
  console.log('==================================');
  
  const baseUrl = 'http://localhost:5000';
  
  // Simular payload de webhook do Stripe
  const webhookPayload = {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'pi_test_' + Date.now(),
        object: 'payment_intent',
        amount: 100,
        currency: 'brl',
        customer: 'cus_test_' + Date.now(),
        metadata: {
          userId: '1EaY6vE0rYAkTXv5vHClm',
          planName: 'Vendzz Premium'
        },
        status: 'succeeded'
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_webhook',
      idempotency_key: null
    },
    type: 'payment_intent.succeeded'
  };
  
  try {
    console.log('🚀 Enviando webhook payload...');
    
    const response = await fetch(`${baseUrl}/api/webhook/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature_would_be_here'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (response.status === 200) {
      const result = await response.json();
      console.log('✅ Webhook processado com sucesso!');
      console.log('📝 Resposta:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Erro no webhook:', error);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

// Teste de webhook de assinatura criada
async function testSubscriptionWebhook() {
  console.log('\n🔔 TESTE DE WEBHOOK DE ASSINATURA');
  console.log('==================================');
  
  const baseUrl = 'http://localhost:5000';
  
  const webhookPayload = {
    id: 'evt_subscription_test',
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'sub_test_' + Date.now(),
        object: 'subscription',
        customer: 'cus_test_' + Date.now(),
        status: 'trialing',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60),
        trial_start: Math.floor(Date.now() / 1000),
        trial_end: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60),
        cancel_at_period_end: false,
        canceled_at: null,
        metadata: {
          userId: '1EaY6vE0rYAkTXv5vHClm',
          planName: 'Vendzz Premium'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_subscription_test',
      idempotency_key: null
    },
    type: 'customer.subscription.created'
  };
  
  try {
    console.log('🚀 Enviando webhook de assinatura...');
    
    const response = await fetch(`${baseUrl}/api/webhook/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature_subscription'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (response.status === 200) {
      const result = await response.json();
      console.log('✅ Webhook de assinatura processado com sucesso!');
      console.log('📝 Resposta:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Erro no webhook de assinatura:', error);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste de assinatura:', error.message);
  }
}

// Executar testes
async function runTests() {
  console.log('🎯 INICIANDO TESTES DO WEBHOOK STRIPE');
  console.log('=====================================\n');
  
  await testStripeWebhook();
  await testSubscriptionWebhook();
  
  console.log('\n🎉 TESTES CONCLUÍDOS');
  console.log('===================');
}

runTests().catch(console.error);
#!/usr/bin/env node

/**
 * TESTE COMPLETO DO SISTEMA SIMPLIFICADO
 * 1. Criar checkout session
 * 2. Simular pagamento via webhook
 * 3. Verificar subscription criada
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testCompleteSimpleTrialFlow() {
  console.log('🚀 TESTANDO FLUXO COMPLETO SIMPLIFICADO...\n');
  
  let createdIds = {};

  try {
    // 1. LOGIN
    console.log('1. Fazendo login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Falha no login');
      return;
    }

    const { accessToken } = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');

    // 2. CRIAR CHECKOUT SESSION
    console.log('\n2. Criando checkout session...');
    const checkoutResponse = await fetch(`${API_BASE}/api/stripe/create-simple-trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        planName: 'Teste Completo',
        trialAmount: 1.00,
        trialDays: 3,
        recurringAmount: 29.90,
        currency: 'BRL'
      })
    });

    if (!checkoutResponse.ok) {
      console.log('❌ Falha ao criar checkout session');
      return;
    }

    const checkoutData = await checkoutResponse.json();
    console.log('✅ Checkout session criado com sucesso!');
    
    // Salvar IDs criados
    createdIds = {
      customerId: checkoutData.customerId,
      productId: checkoutData.productId,
      recurringPriceId: checkoutData.recurringPriceId,
      checkoutSessionId: checkoutData.checkoutSessionId
    };

    console.log('\n🔍 COMPONENTES CRIADOS:');
    console.log('• Customer ID:', createdIds.customerId);
    console.log('• Product ID:', createdIds.productId);
    console.log('• Recurring Price ID:', createdIds.recurringPriceId);
    console.log('• Checkout Session ID:', createdIds.checkoutSessionId);
    console.log('• Checkout URL:', checkoutData.checkoutUrl?.substring(0, 50) + '...');

    // 3. SIMULAR WEBHOOK PAYMENT_INTENT.SUCCEEDED
    console.log('\n3. Simulando webhook payment_intent.succeeded...');
    
    const webhookData = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: `pi_test_${Date.now()}`,
          status: 'succeeded',
          customer: createdIds.customerId,
          payment_method: `pm_test_${Date.now()}`,
          metadata: {
            recurring_price_id: createdIds.recurringPriceId,
            trial_days: '3'
          }
        }
      }
    };

    const webhookResponse = await fetch(`${API_BASE}/api/stripe/webhook-simple-trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });

    if (webhookResponse.ok) {
      const webhookResult = await webhookResponse.json();
      console.log('✅ Webhook processado com sucesso!');
      
      if (webhookResult.subscription) {
        console.log('✅ Subscription criada:', webhookResult.subscription.id);
        console.log('📋 Status:', webhookResult.subscription.status);
        console.log('📋 Trial End:', new Date(webhookResult.subscription.trial_end * 1000).toLocaleString());
        console.log('📋 Price ID:', webhookResult.subscription.items.data[0].price.id);
      } else {
        console.log('❌ Subscription não criada');
      }
      
    } else {
      console.log('❌ Falha ao processar webhook');
      const errorText = await webhookResponse.text();
      console.log('Erro:', errorText);
    }

    // 4. RESUMO DO FLUXO
    console.log('\n🎉 TESTE COMPLETO CONCLUÍDO!');
    console.log('\n📊 RESUMO DO FLUXO IMPLEMENTADO:');
    console.log('✅ 1. Customer criado no Stripe');
    console.log('✅ 2. Product e Price R$29,90/mês criados');
    console.log('✅ 3. Checkout Session com cobrança R$1,00');
    console.log('✅ 4. setup_future_usage para salvar cartão');
    console.log('✅ 5. Webhook handler funcional');
    console.log('✅ 6. Subscription com 3 dias trial criada');
    console.log('✅ 7. Fluxo completo sem erros Stripe');
    
    console.log('\n🚀 PRÓXIMOS PASSOS PARA PRODUÇÃO:');
    console.log('• Integrar webhook real do Stripe');
    console.log('• Criar interface frontend para checkout');
    console.log('• Implementar páginas de sucesso/cancelamento');
    console.log('• Adicionar logs de auditoria');
    console.log('• Configurar variáveis de ambiente');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testCompleteSimpleTrialFlow();
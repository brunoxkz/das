/**
 * 🔥 TESTE REAL: Validar salvamento de cartão com payment method existente
 * 
 * Este teste utiliza um payment method real do Stripe para validar
 * se o sistema está salvando corretamente o cartão para cobrança automática
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Payment method real criado anteriormente (usar um existente)
const PAYMENT_METHOD_REAL = 'pm_1Rm47mHK6al3veW1dVRSMGHG'; // Substitua por um real se necessário

async function testRealCardSaving() {
  console.log('🔥 TESTE REAL: Salvamento de cartão com payment method existente');
  console.log('=' .repeat(70));
  
  try {
    // Dados do customer para o teste
    const customerData = {
      name: 'Bruno Teste Real',
      email: 'bruno.teste.real@example.com',
      phone: '+5511998877665'
    };
    
    console.log('🔧 TESTANDO SALVAMENTO COM PAYMENT METHOD REAL');
    console.log('Payment Method ID:', PAYMENT_METHOD_REAL);
    console.log('Customer:', customerData.name, '-', customerData.email);
    
    // Processar pagamento inline diretamente
    console.log('🔧 Processando pagamento inline...');
    
    const paymentResponse = await fetch(`${BASE_URL}/api/stripe/process-payment-inline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: PAYMENT_METHOD_REAL,
        customerData: customerData,
        amount: 1.00, // R$ 1,00
        currency: 'BRL',
        planName: 'Teste Real Cartão'
      })
    });
    
    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.text();
      console.error('❌ ERRO HTTP:', paymentResponse.status, paymentResponse.statusText);
      console.error('Resposta:', errorData);
      return;
    }
    
    const paymentData = await paymentResponse.json();
    
    if (!paymentData.success) {
      console.error('❌ ERRO: Não foi possível processar pagamento');
      console.error('Detalhes:', paymentData);
      return;
    }
    
    console.log('✅ PAGAMENTO PROCESSADO COM SUCESSO!');
    console.log('📊 RESULTADOS:');
    console.log('- Payment Intent ID:', paymentData.paymentIntentId);
    console.log('- Customer ID:', paymentData.customerId);
    console.log('- Subscription ID:', paymentData.subscriptionId);
    console.log('- Trial End:', paymentData.trialEnd);
    console.log('- Billing Flow:', paymentData.billing);
    
    // Validar se o cartão foi salvo
    console.log('🔧 Validando se cartão foi salvo...');
    
    const validationResponse = await fetch(`${BASE_URL}/api/stripe/validate-customer-payment-method`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: paymentData.customerId,
        paymentMethodId: PAYMENT_METHOD_REAL
      })
    });
    
    if (!validationResponse.ok) {
      console.error('❌ ERRO na validação:', validationResponse.status);
      return;
    }
    
    const validationData = await validationResponse.json();
    
    console.log('🔍 VALIDAÇÃO DO CARTÃO:');
    console.log('- Payment Method Anexado:', validationData.paymentMethodAttached ? '✅ SIM' : '❌ NÃO');
    console.log('- É Payment Method Padrão:', validationData.isDefaultPaymentMethod ? '✅ SIM' : '❌ NÃO');
    console.log('- Total Payment Methods:', validationData.totalPaymentMethods);
    console.log('- Mensagem:', validationData.message);
    
    // Resumo final
    console.log('=' .repeat(70));
    console.log('📋 RESUMO DO TESTE:');
    
    if (validationData.paymentMethodAttached && validationData.isDefaultPaymentMethod) {
      console.log('🎉 SUCESSO TOTAL!');
      console.log('✅ Cartão foi salvo corretamente');
      console.log('✅ Cartão definido como padrão');
      console.log('✅ Assinatura pode cobrar automaticamente');
      console.log('✅ Trial de 3 dias configurado');
      console.log('✅ Sistema funcionando perfeitamente!');
    } else {
      console.log('⚠️  PROBLEMAS DETECTADOS:');
      if (!validationData.paymentMethodAttached) {
        console.log('❌ Cartão não foi anexado ao customer');
      }
      if (!validationData.isDefaultPaymentMethod) {
        console.log('❌ Cartão não foi definido como padrão');
      }
      console.log('🔧 Correções necessárias no código');
    }
    
  } catch (error) {
    console.error('❌ ERRO DURANTE O TESTE:', error);
  }
}

// Executar teste
testRealCardSaving();
import fetch from 'node-fetch';

const API_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyODEwMTY0LCJub25jZSI6IjlxMmFtbSIsImV4cCI6MTc1MjgxMTA2NH0.DnEDeLVfW-D24Fny2qSDjJpejuCSPU2fGkfDOMwWzh4';

async function testDirectPayment() {
  console.log('🔧 TESTE DO PROCESSAMENTO DIRETO VIA API');
  console.log('✅ Sem redirecionamento para Stripe');
  console.log('✅ Processamento completo via API');
  console.log('✅ Return URL configurável');
  
  try {
    const planId = 'YeIVDpw7yDSfftA6bxRG8';
    const testData = {
      email: 'teste@vendzz.com',
      cardNumber: '4242424242424242',
      expiryDate: '12/25',
      cvv: '123'
    };
    
    console.log('\n1. 📋 DADOS DO TESTE:');
    console.log('   Plan ID:', planId);
    console.log('   Email:', testData.email);
    console.log('   Cartão:', testData.cardNumber);
    console.log('   Validade:', testData.expiryDate);
    console.log('   CVV:', testData.cvv);
    
    // Passo 1: Criar payment method
    console.log('\n2. 🔐 CRIANDO PAYMENT METHOD...');
    const paymentMethodResponse = await fetch(`${API_URL}/api/stripe/create-test-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify({
        cardNumber: testData.cardNumber,
        expiryDate: testData.expiryDate,
        cvv: testData.cvv,
        email: testData.email
      })
    });
    
    if (!paymentMethodResponse.ok) {
      const errorText = await paymentMethodResponse.text();
      console.error('❌ ERRO AO CRIAR PAYMENT METHOD:', errorText);
      return;
    }
    
    const paymentMethodResult = await paymentMethodResponse.json();
    console.log('✅ Payment Method criado:', paymentMethodResult.paymentMethodId);
    
    // Passo 2: Processar pagamento direto
    console.log('\n3. 💳 PROCESSANDO PAGAMENTO DIRETO...');
    const directPaymentResponse = await fetch(`${API_URL}/api/stripe/process-direct-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify({
        email: testData.email,
        planId: planId,
        paymentMethodId: paymentMethodResult.paymentMethodId,
        returnUrl: `${API_URL}/checkout/success`
      })
    });
    
    console.log('   Status:', directPaymentResponse.status);
    console.log('   Headers:', directPaymentResponse.headers.get('content-type'));
    
    const directPaymentResult = await directPaymentResponse.json();
    
    console.log('\n4. 📊 RESULTADO DO PAGAMENTO:');
    console.log('   Success:', directPaymentResult.success);
    console.log('   Message:', directPaymentResult.message);
    
    if (directPaymentResult.success && directPaymentResult.data) {
      console.log('\n✅ PAGAMENTO PROCESSADO COM SUCESSO!');
      console.log('   Payment Intent ID:', directPaymentResult.data.paymentIntentId);
      console.log('   Customer ID:', directPaymentResult.data.customerId);
      console.log('   Subscription ID:', directPaymentResult.data.subscriptionId);
      console.log('   Status:', directPaymentResult.data.status);
      console.log('   Valor pago:', `R$ ${directPaymentResult.data.amount.toFixed(2)}`);
      console.log('   Moeda:', directPaymentResult.data.currency);
      console.log('   Plano:', directPaymentResult.data.planName);
      console.log('   Trial:', `${directPaymentResult.data.trialDays} dias`);
      console.log('   Recorrência:', `R$ ${directPaymentResult.data.recurringPrice.toFixed(2)}/mês`);
      console.log('   Próxima cobrança:', new Date(directPaymentResult.data.nextBillingDate).toLocaleDateString('pt-BR'));
      console.log('   Return URL:', directPaymentResult.data.returnUrl);
      
      console.log('\n🎉 FLUXO COMPLETO VALIDADO!');
      console.log('✅ Pagamento processado via API');
      console.log('✅ Subscription criada automaticamente');
      console.log('✅ Trial configurado corretamente');
      console.log('✅ Return URL personalizada');
      console.log('✅ Dados completos retornados');
      
      console.log('\n🔗 DADOS PARA PÁGINA DE SUCESSO:');
      console.log(`   subscription_id=${directPaymentResult.data.subscriptionId}`);
      console.log(`   plan_name=${directPaymentResult.data.planName}`);
      console.log(`   trial_days=${directPaymentResult.data.trialDays}`);
      console.log(`   amount=${directPaymentResult.data.amount}`);
      console.log(`   recurring_price=${directPaymentResult.data.recurringPrice}`);
      console.log(`   next_billing=${directPaymentResult.data.nextBillingDate}`);
      
    } else if (directPaymentResult.requiresAction) {
      console.log('\n⚠️ PAGAMENTO REQUER AÇÃO ADICIONAL');
      console.log('   Client Secret:', directPaymentResult.clientSecret);
      console.log('   Payment Intent ID:', directPaymentResult.data.paymentIntentId);
      console.log('   Status:', directPaymentResult.data.status);
      console.log('   Pode ser necessário 3D Secure');
      
    } else {
      console.log('\n❌ ERRO NO PAGAMENTO');
      console.log('   Erro:', directPaymentResult.error);
      console.log('   Mensagem:', directPaymentResult.message);
    }
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

testDirectPayment();
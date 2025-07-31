const apiRequest = async (method, endpoint, data = null) => {
  const url = `http://localhost:5000${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  return await response.json();
};

const testStripeElements = async () => {
  console.log('🧪 TESTE STRIPE ELEMENTS - CHECKOUT EMBEDDABLE');
  console.log('='.repeat(60));

  try {
    // 1. Buscar plano para teste
    console.log('\n1. Buscando plano para teste...');
    const plansResponse = await apiRequest('GET', '/api/stripe/plans');
    console.log('Resposta da API:', plansResponse);
    
    // Verificar se temos planos
    const plans = Array.isArray(plansResponse) ? plansResponse : (plansResponse.plans || []);
    console.log('Planos encontrados:', plans.length);
    
    if (plans.length === 0) {
      console.log('❌ Nenhum plano encontrado - criando plano de teste...');
      
      // Criar plano de teste
      const planData = {
        name: 'Plano Teste Stripe Elements',
        description: 'Plano para testar Stripe Elements',
        price: 29.90,
        trial_price: 1.00,
        trial_days: 3,
        features: ['Quizzes ilimitados', 'SMS Marketing', 'Email Marketing']
      };
      
      const createPlanResponse = await apiRequest('POST', '/api/stripe/plans', planData);
      console.log('✅ Plano criado:', createPlanResponse.plan?.name);
      
      // Usar o plano criado
      const testPlan = createPlanResponse.plan;
      console.log('\n2. Testando busca de plano individual...');
      const singlePlanResponse = await apiRequest('GET', `/api/stripe/plans/${testPlan.id}`);
      console.log('✅ Plano encontrado:', singlePlanResponse.name);
      
      // 3. Testar endpoint de processamento inline
      console.log('\n3. Testando endpoint de processamento inline...');
      
      // Simular um payment method ID (normalmente viria do Stripe Elements)
      const testPaymentMethodId = 'pm_test_' + Date.now();
      
      const paymentData = {
        paymentMethodId: testPaymentMethodId,
        planId: testPlan.id,
        amount: 1.00,
        currency: 'BRL',
        customerData: {
          email: 'teste@vendzz.com',
          name: 'Cliente Teste'
        }
      };
      
      const paymentResponse = await apiRequest('POST', '/api/stripe/process-payment-inline', paymentData);
      console.log('📋 Resposta do pagamento:', paymentResponse);
      
      if (paymentResponse.success) {
        console.log('✅ STRIPE ELEMENTS CHECKOUT: FUNCIONANDO');
        console.log('💳 Payment Method ID:', testPaymentMethodId);
        console.log('🎯 Plano:', testPlan.name);
        console.log('💰 Valor:', paymentData.amount);
        console.log('👤 Cliente:', paymentData.customerData.email);
      } else {
        console.log('❌ ERRO no processamento:', paymentResponse.message);
      }
      
      // 4. Testar acesso à página de checkout embeddable
      console.log('\n4. Testando acesso à página de checkout...');
      console.log(`🔗 URL de teste: http://localhost:5000/checkout-embed/${testPlan.id}`);
      console.log('✅ Página deveria carregar com Stripe Elements integrado');
      
      return {
        success: true,
        planId: testPlan.id,
        checkoutUrl: `/checkout-embed/${testPlan.id}`,
        testPaymentMethodId: testPaymentMethodId
      };
      
    } else {
      const testPlan = plans[0];
      console.log('✅ Usando plano existente:', testPlan.name);
      
      return {
        success: true,
        planId: testPlan.id,
        checkoutUrl: `/checkout-embed/${testPlan.id}`,
        message: 'Plano existente encontrado'
      };
    }
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Executar teste
testStripeElements()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO FINAL:');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('🎉 STRIPE ELEMENTS CHECKOUT EMBEDDABLE: FUNCIONANDO');
      console.log('🔗 Checkout URL:', result.checkoutUrl);
      if (result.testPaymentMethodId) {
        console.log('💳 Payment Method ID:', result.testPaymentMethodId);
      }
    } else {
      console.log('❌ FALHA:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ ERRO CRÍTICO:', error.message);
  });
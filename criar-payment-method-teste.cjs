const stripe = require('stripe')('sk_test_51RjvV9HK6al3veW1FPD5bTV1on2NQLlm9ud45AJDggFHdsGA9UAo5jfbSRvWF83W3uTp5cpZYa8tJBvm4ttefrk800mUs47pFA');

async function criarPaymentMethodTeste() {
  try {
    console.log('🔑 Criando payment method de teste...');
    
    // Criar payment method de teste
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2025,
        cvc: '123',
      },
      billing_details: {
        name: 'João Silva Teste',
        email: 'joao.teste@vendzz.com',
      },
    });

    console.log('✅ Payment method criado:', paymentMethod.id);
    
    // Testar o fluxo completo
    const response = await fetch('http://localhost:5000/api/stripe/create-trial-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        customerName: 'João Silva Teste',
        customerEmail: 'joao.teste@vendzz.com',
        trialDays: 3,
        activationFee: 1.00,
        monthlyPrice: 29.90,
      }),
    });

    const result = await response.json();
    
    console.log('📊 Resultado:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('🎉 SUCESSO! Fluxo trial funcionando perfeitamente');
    } else {
      console.log('❌ ERRO:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

// Executar
criarPaymentMethodTeste();
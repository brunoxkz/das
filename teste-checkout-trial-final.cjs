// Teste do sistema completo de checkout trial final
const fetch = globalThis.fetch || require('node-fetch');

// Configurações do teste
const BASE_URL = 'http://localhost:5000';
const TEST_PAYMENT_METHOD = 'pm_card_visa'; // Payment method de teste do Stripe

async function testeCheckoutTrialFinal() {
  console.log('🎯 INICIANDO TESTE CHECKOUT TRIAL FINAL');
  console.log('=======================================');
  
  try {
    // Dados de teste
    const testData = {
      paymentMethodId: TEST_PAYMENT_METHOD,
      customerName: 'João Silva Teste',
      customerEmail: 'joao.teste@vendzz.com',
      trialDays: 3,
      activationFee: 1.00,
      monthlyPrice: 29.90,
    };
    
    console.log('📋 Dados do teste:', JSON.stringify(testData, null, 2));
    
    // Fazer requisição ao endpoint
    const response = await fetch(`${BASE_URL}/api/stripe/create-trial-flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('🔍 Status da resposta:', response.status);
    
    const result = await response.json();
    console.log('📊 Resultado completo:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ TESTE APROVADO!');
      console.log('🎉 Fluxo completo de trial criado com sucesso');
      
      // Verificar dados essenciais
      const { data } = result;
      console.log('🔍 Verificando dados essenciais:');
      console.log(`  - Customer ID: ${data.customer?.id}`);
      console.log(`  - Subscription ID: ${data.subscription?.id}`);
      console.log(`  - Status: ${data.subscription?.status}`);
      console.log(`  - Trial End: ${data.trialEndDate}`);
      console.log(`  - Next Billing: ${data.nextBillingDate}`);
      
    } else {
      console.log('❌ TESTE FALHOU');
      console.log('💥 Erro:', result.message || result.error);
      console.log('🔍 Response status:', response.status);
    }
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO no teste:', error);
    console.error('🔍 Stack trace:', error.stack);
  }
  
  console.log('=======================================');
  console.log('🏁 TESTE CHECKOUT TRIAL FINAL CONCLUÍDO');
}

// Executar teste
testeCheckoutTrialFinal();
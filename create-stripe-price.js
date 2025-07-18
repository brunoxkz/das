/**
 * SCRIPT PARA CRIAR PRICE ID NO STRIPE
 * Cria produto e price para assinatura R$1.00 + R$29.90/mês
 */

import Stripe from 'stripe';

const stripe = new Stripe('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', {
  apiVersion: '2024-09-30.acacia'
});

async function createStripePrice() {
  try {
    console.log('🔧 Criando produto Vendzz no Stripe...');
    
    // Criar produto
    const product = await stripe.products.create({
      name: 'Vendzz Premium',
      description: 'Plano Premium da Vendzz - Quiz Funnel Platform',
      metadata: {
        plan: 'premium',
        initial_charge: '1.00',
        monthly_charge: '29.90',
        trial_days: '7'
      }
    });

    console.log('✅ Produto criado:', product.id);

    // Criar price para cobrança mensal R$29.90
    const price = await stripe.prices.create({
      unit_amount: 2990, // R$29.90 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month',
        trial_period_days: 7
      },
      product: product.id,
      metadata: {
        description: 'Plano Premium Mensal',
        initial_charge: '1.00'
      }
    });

    console.log('✅ Price criado:', price.id);
    console.log('📋 Configuração completa:');
    console.log('PRODUCT_ID:', product.id);
    console.log('PRICE_ID:', price.id);
    console.log('VALOR MENSAL: R$ 29,90');
    console.log('TRIAL: 7 dias');
    console.log('MOEDA: BRL');
    
    return { product, price };
  } catch (error) {
    console.error('❌ Erro ao criar produto/price:', error);
    throw error;
  }
}

createStripePrice().then(result => {
  console.log('\n🎉 PRICE ID CRIADO COM SUCESSO!');
  console.log('Use este PRICE_ID na rota /assinatura-paga:', result.price.id);
}).catch(console.error);
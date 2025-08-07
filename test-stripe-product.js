/**
 * 🚀 SCRIPT DE CRIAÇÃO DE PRODUTO DE TESTE PARA STRIPE
 * Cria produto de assinatura com trial de 3 dias por R$1,00 + R$29,90/mês
 */

import Stripe from 'stripe';
import fetch from 'node-fetch';

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

async function createTestProduct() {
  try {
    console.log('🏗️ Criando produto de teste no Stripe...');
    
    // 1. Criar produto no Stripe
    const product = await stripe.products.create({
      name: 'Vendzz Pro - Assinatura Trial',
      description: 'Acesso completo à plataforma Vendzz com sistema de trial de 3 dias por R$ 1,00 depois R$ 29,90/mês',
      type: 'service',
      metadata: {
        platform: 'vendzz',
        category: 'software',
        trial_period: '3',
        trial_price: '1.00',
        recurring_price: '29.90'
      }
    });

    console.log('✅ Produto criado:', product.id);

    // 2. Criar preço recorrente (R$ 29,90/mês)
    const price = await stripe.prices.create({
      unit_amount: 2990, // R$ 29,90 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month',
        trial_period_days: 3,
      },
      product: product.id,
      metadata: {
        trial_price: '1.00',
        description: 'Plano Vendzz Pro - R$ 1,00 por 3 dias, depois R$ 29,90/mês'
      }
    });

    console.log('✅ Preço criado:', price.id);

    // 3. Criar preço para trial (R$ 1,00)
    const trialPrice = await stripe.prices.create({
      unit_amount: 100, // R$ 1,00 em centavos
      currency: 'brl',
      product: product.id,
      metadata: {
        type: 'trial',
        description: 'Taxa de ativação do trial - R$ 1,00'
      }
    });

    console.log('✅ Preço do trial criado:', trialPrice.id);

    // 4. Atualizar produto no banco de dados local
    const response = await fetch('http://localhost:5000/api/checkout-products/vendzz-pro-trial-001', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stripeProductId: product.id,
        stripePriceId: price.id,
        paymentLink: `https://checkout.stripe.com/pay/${price.id}`,
      })
    });

    if (response.ok) {
      console.log('✅ Produto atualizado no banco de dados');
    } else {
      console.log('⚠️ Erro ao atualizar produto no banco:', await response.text());
    }

    // 5. Criar link de pagamento
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        product_id: 'vendzz-pro-trial-001',
        trial_period: '3',
        trial_price: '1.00'
      }
    });

    console.log('✅ Link de pagamento criado:', paymentLink.url);

    // 6. Resumo final
    console.log('\n🎉 PRODUTO CRIADO COM SUCESSO!');
    console.log('=====================================');
    console.log(`📦 Produto ID: ${product.id}`);
    console.log(`💰 Preço ID: ${price.id}`);
    console.log(`🔗 Link de pagamento: ${paymentLink.url}`);
    console.log(`💡 Trial: 3 dias por R$ 1,00`);
    console.log(`🔄 Recorrência: R$ 29,90/mês`);
    console.log('=====================================');

    return {
      product,
      price,
      trialPrice,
      paymentLink
    };

  } catch (error) {
    console.error('❌ Erro ao criar produto:', error.message);
    throw error;
  }
}

// Executar script
createTestProduct()
  .then(() => {
    console.log('✅ Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  });
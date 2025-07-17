import Stripe from 'stripe';
import Database from 'better-sqlite3';

const stripe = new Stripe('sk_test_51RjvV9HK6al3veW1FPD5bTV1on2NQLlm9ud45AJDggFHdsGA9UAo5jfbSRvWF83W3uTp5cpZYa8tJBvm4ttefrk800mUs47pFA', {
  apiVersion: '2024-09-30.acacia',
});

const sqlite = new Database('./database.sqlite');

async function createStripeProductsAndPrices() {
  try {
    console.log('🔄 Criando produtos e preços no Stripe...');
    
    // Buscar todos os planos
    const plans = sqlite.prepare('SELECT * FROM stripe_plans WHERE active = 1').all();
    
    for (const plan of plans) {
      try {
        console.log(`\n🔄 Processando plano: ${plan.name}`);
        
        // Criar produto no Stripe
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description || `Plano ${plan.name}`,
          metadata: {
            planId: plan.id,
            gateway: 'stripe'
          }
        });
        
        console.log(`✅ Produto criado: ${product.id}`);
        
        // Criar preço no Stripe
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.price * 100), // Converter para centavos
          currency: plan.currency || 'brl',
          recurring: {
            interval: plan.interval || 'month',
            trial_period_days: plan.trial_period_days || 7
          },
          metadata: {
            planId: plan.id,
            gateway: 'stripe'
          }
        });
        
        console.log(`✅ Preço criado: ${price.id}`);
        
        // Atualizar plano no banco com os IDs do Stripe
        sqlite.prepare(`
          UPDATE stripe_plans 
          SET stripe_product_id = ?, stripe_price_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(product.id, price.id, plan.id);
        
        console.log(`✅ Plano ${plan.name} atualizado no banco`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar plano ${plan.name}:`, error.message);
      }
    }
    
    console.log('\n✅ Todos os produtos e preços foram criados no Stripe!');
    
    // Mostrar planos atualizados
    const updatedPlans = sqlite.prepare('SELECT * FROM stripe_plans WHERE active = 1').all();
    console.log('\n📋 Planos atualizados:');
    updatedPlans.forEach(plan => {
      console.log(`- ${plan.name}: ${plan.stripe_price_id} (${plan.currency} ${plan.price})`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    sqlite.close();
  }
}

createStripeProductsAndPrices();
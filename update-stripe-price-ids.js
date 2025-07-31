import Database from 'better-sqlite3';

const sqlite = new Database('./database.sqlite');

try {
  // Atualizar planos com os novos price_ids do Stripe
  const updates = [
    { id: 1, price_id: 'price_1Rlxu0HK6al3veW1vLl5qzCp', product_id: 'prod_ShMddMTtPNh5pk' },
    { id: 2, price_id: 'price_1Rlxu0HK6al3veW1ZVmv8qbz', product_id: 'prod_ShMddqeyVfdy3g' },
    { id: 3, price_id: 'price_1Rlxu1HK6al3veW1uyW2Tqjj', product_id: 'prod_ShMdY9xQTKvfw7' }
  ];

  for (const update of updates) {
    sqlite.prepare(`
      UPDATE stripe_plans 
      SET stripe_price_id = ?, stripe_product_id = ?
      WHERE id = ?
    `).run(update.price_id, update.product_id, update.id);
    
    console.log(`✅ Plano ${update.id} atualizado com price_id: ${update.price_id}`);
  }
  
  // Verificar resultado
  const plans = sqlite.prepare('SELECT * FROM stripe_plans WHERE active = 1').all();
  console.log('\n📋 Planos atualizados:');
  plans.forEach(plan => {
    console.log(`- ID: ${plan.id} | ${plan.name} | Stripe Price: ${plan.stripe_price_id}`);
  });
  
} catch (error) {
  console.error('❌ Erro:', error);
} finally {
  sqlite.close();
}
const Database = require('better-sqlite3');

const db = new Database('database.sqlite');

console.log('🚀 Criando planos Stripe...');

try {
  // Limpar planos existentes
  db.prepare('DELETE FROM stripe_plans').run();
  
  // Criar novos planos
  const insertPlan = db.prepare(`
    INSERT INTO stripe_plans 
    (name, description, price, currency, interval, trial_period_days, activation_fee, features, stripe_price_id, stripe_product_id, active, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  
  // Plano Básico
  insertPlan.run(
    'Plano Básico',
    'Acesso completo à plataforma com todas as funcionalidades essenciais',
    29.90,
    'BRL',
    'month',
    3,
    1.00,
    JSON.stringify(['quizzes_ilimitados', 'sms_marketing', 'email_marketing', 'whatsapp_automation', 'analytics_basico']),
    'price_basic_2025',
    'prod_basic_2025',
    1,
    now,
    'admin-user-id'
  );

  // Plano Premium
  insertPlan.run(
    'Plano Premium',
    'Todas as funcionalidades do Básico + recursos avançados + suporte prioritário',
    69.90,
    'BRL',
    'month',
    7,
    1.00,
    JSON.stringify(['quizzes_ilimitados', 'sms_marketing', 'email_marketing', 'whatsapp_automation', 'analytics_avancado', 'ab_testing', 'integracao_premium']),
    'price_premium_2025',
    'prod_premium_2025',
    1,
    now,
    'admin-user-id'
  );

  // Plano Anual
  insertPlan.run(
    'Plano Anual',
    'Economia de 20% pagando anualmente - todas as funcionalidades incluídas',
    297.00,
    'BRL',
    'year',
    14,
    1.00,
    JSON.stringify(['quizzes_ilimitados', 'sms_marketing', 'email_marketing', 'whatsapp_automation', 'analytics_avancado', 'ab_testing', 'integracao_premium', 'suporte_prioritario', 'white_label']),
    'price_annual_2025',
    'prod_annual_2025',
    1,
    now,
    'admin-user-id'
  );

  console.log('✅ Planos criados com sucesso!');
  
  // Verificar planos criados
  const plans = db.prepare('SELECT id, name, price, trial_period_days, activation_fee FROM stripe_plans').all();
  console.log('\n📊 Planos disponíveis:');
  plans.forEach(plan => {
    console.log(`   - ${plan.name}: R$ ${plan.activation_fee} por ${plan.trial_period_days} dias → R$ ${plan.price}`);
  });
  
} catch (error) {
  console.error('❌ Erro:', error);
} finally {
  db.close();
}
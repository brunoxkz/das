const Database = require('better-sqlite3');

// Conectar ao banco de dados
const db = new Database('database.sqlite');

console.log('🚀 Criando tabelas do sistema Stripe...');

try {
  // Criar tabela de planos Stripe
  db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      interval TEXT DEFAULT 'month',
      trial_days INTEGER DEFAULT 3,
      trial_price REAL DEFAULT 1.00,
      gateway TEXT DEFAULT 'stripe',
      active INTEGER DEFAULT 1,
      stripe_price_id TEXT,
      stripe_product_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela de embeds de checkout
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_embeds (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      embed_code TEXT NOT NULL,
      width TEXT DEFAULT '100%',
      height TEXT DEFAULT '600px',
      button_text TEXT DEFAULT 'Iniciar Teste Grátis',
      button_color TEXT DEFAULT '#007bff',
      background_color TEXT DEFAULT '#f8f9fa',
      views INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES stripe_plans(id)
    );
  `);

  // Criar tabela de transações/pagamentos
  db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      plan_id TEXT,
      stripe_session_id TEXT,
      stripe_payment_intent_id TEXT,
      stripe_customer_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      status TEXT DEFAULT 'pending',
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES stripe_plans(id)
    );
  `);

  // Inserir planos padrão
  const insertPlan = db.prepare(`
    INSERT OR REPLACE INTO stripe_plans 
    (id, name, description, price, currency, interval, trial_period_days, activation_fee, features, stripe_price_id, stripe_product_id, active, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  
  // Plano Básico
  insertPlan.run(
    'plan_basic_2025',
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
    'plan_premium_2025',
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
    'plan_annual_2025',
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

  console.log('✅ Tabelas criadas com sucesso!');
  console.log('✅ Planos padrão inseridos:');
  console.log('   - Plano Básico: R$ 1,00 por 3 dias → R$ 29,90/mês');
  console.log('   - Plano Premium: R$ 1,00 por 7 dias → R$ 69,90/mês');
  console.log('   - Plano Anual: R$ 1,00 por 14 dias → R$ 297,00/ano');
  
  // Verificar se os planos foram criados
  const plans = db.prepare('SELECT * FROM stripe_plans').all();
  console.log(`\n📊 Total de planos criados: ${plans.length}`);
  
} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error);
} finally {
  db.close();
}
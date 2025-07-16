const Database = require('better-sqlite3');
const path = require('path');

// Conectar com o banco de dados
const db = new Database(path.join(__dirname, 'vendzz-database.db'));

console.log('🔧 Corrigindo tabelas de planos e transações...');

try {
  // Remover tabelas existentes para recriar com schema correto
  db.exec('DROP TABLE IF EXISTS subscription_plans');
  db.exec('DROP TABLE IF EXISTS subscription_transactions');
  db.exec('DROP TABLE IF EXISTS credit_transactions');
  
  console.log('✅ Tabelas antigas removidas');

  // Criar tabela subscription_plans com schema correto
  db.exec(`
    CREATE TABLE subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      billingInterval TEXT NOT NULL,
      features TEXT NOT NULL,
      limits TEXT NOT NULL,
      stripePriceId TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);
  console.log('✅ Tabela subscription_plans criada com schema correto');

  // Criar tabela subscription_transactions com schema correto
  db.exec(`
    CREATE TABLE subscription_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planId TEXT NOT NULL,
      stripePaymentIntentId TEXT,
      stripeSubscriptionId TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      status TEXT NOT NULL,
      paymentMethod TEXT DEFAULT 'stripe',
      metadata TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);
  console.log('✅ Tabela subscription_transactions criada com schema correto');

  // Criar tabela credit_transactions com schema correto
  db.exec(`
    CREATE TABLE credit_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      operation TEXT NOT NULL,
      reason TEXT NOT NULL,
      metadata TEXT,
      createdAt INTEGER NOT NULL
    )
  `);
  console.log('✅ Tabela credit_transactions criada com schema correto');

  // Inserir planos padrão
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['basic_quiz', 'basic_analytics']),
      limits: JSON.stringify({
        quizzes: 1,
        responses: 100,
        sms: 10,
        email: 50,
        whatsapp: 0,
        ai: 0
      }),
      stripePriceId: null,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'basic-monthly',
      name: 'Básico Mensal',
      price: 29.90,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['quiz_publishing', 'email_campaigns', 'basic_analytics']),
      limits: JSON.stringify({
        quizzes: 5,
        responses: 1000,
        sms: 100,
        email: 500,
        whatsapp: 50,
        ai: 10
      }),
      stripePriceId: null,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'premium-monthly',
      name: 'Premium Mensal',
      price: 69.90,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['quiz_publishing', 'email_campaigns', 'whatsapp_campaigns', 'advanced_analytics', 'ai_videos']),
      limits: JSON.stringify({
        quizzes: 20,
        responses: 5000,
        sms: 500,
        email: 2000,
        whatsapp: 200,
        ai: 50
      }),
      stripePriceId: null,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'enterprise-monthly',
      name: 'Enterprise Mensal',
      price: 149.90,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['all']),
      limits: JSON.stringify({
        quizzes: -1,
        responses: -1,
        sms: -1,
        email: -1,
        whatsapp: -1,
        ai: -1
      }),
      stripePriceId: null,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];

  const insertPlan = db.prepare(`
    INSERT INTO subscription_plans 
    (id, name, price, currency, billingInterval, features, limits, stripePriceId, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const plan of plans) {
    insertPlan.run(
      plan.id,
      plan.name,
      plan.price,
      plan.currency,
      plan.billingInterval,
      plan.features,
      plan.limits,
      plan.stripePriceId,
      plan.isActive,
      plan.createdAt,
      plan.updatedAt
    );
  }

  console.log('✅ Planos padrão inseridos');

  // Verificar se os planos foram inseridos corretamente
  const planCount = db.prepare('SELECT COUNT(*) as count FROM subscription_plans').get();
  console.log(`✅ ${planCount.count} planos inseridos na tabela`);

  console.log('🎯 Tabelas de planos e transações corrigidas com sucesso!');

} catch (error) {
  console.error('❌ Erro ao corrigir tabelas:', error);
} finally {
  db.close();
}
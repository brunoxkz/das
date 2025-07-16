const Database = require('better-sqlite3');
const path = require('path');

// Conectar com o banco de dados
const db = new Database(path.join(__dirname, 'vendzz-database.db'));

console.log('🔧 Criando tabelas de planos e transações...');

try {
  // Criar tabela subscription_plans
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      billingInterval TEXT NOT NULL,
      features TEXT,
      maxQuizzes INTEGER NOT NULL DEFAULT -1,
      maxResponses INTEGER NOT NULL DEFAULT -1,
      maxSMS INTEGER NOT NULL DEFAULT -1,
      maxEmail INTEGER NOT NULL DEFAULT -1,
      maxWhatsApp INTEGER NOT NULL DEFAULT -1,
      maxAI INTEGER NOT NULL DEFAULT -1,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);
  console.log('✅ Tabela subscription_plans criada');

  // Criar tabela subscription_transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscription_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planId TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      status TEXT NOT NULL,
      paymentMethod TEXT,
      paymentId TEXT,
      stripePaymentIntentId TEXT,
      startDate INTEGER,
      endDate INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);
  console.log('✅ Tabela subscription_transactions criada');

  // Criar tabela credit_transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      operation TEXT NOT NULL,
      reason TEXT,
      createdAt INTEGER NOT NULL
    )
  `);
  console.log('✅ Tabela credit_transactions criada');

  // Inserir planos padrão
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      description: 'Plano gratuito básico',
      price: 0,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['basic_quiz', 'basic_analytics']),
      maxQuizzes: 1,
      maxResponses: 100,
      maxSMS: 10,
      maxEmail: 50,
      maxWhatsApp: 0,
      maxAI: 0,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'basic-monthly',
      name: 'Básico Mensal',
      description: 'Plano básico mensal',
      price: 29.90,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['quiz_publishing', 'email_campaigns', 'basic_analytics']),
      maxQuizzes: 5,
      maxResponses: 1000,
      maxSMS: 100,
      maxEmail: 500,
      maxWhatsApp: 50,
      maxAI: 10,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'premium-monthly',
      name: 'Premium Mensal',
      description: 'Plano premium mensal',
      price: 69.90,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['quiz_publishing', 'email_campaigns', 'whatsapp_campaigns', 'advanced_analytics', 'ai_videos']),
      maxQuizzes: 20,
      maxResponses: 5000,
      maxSMS: 500,
      maxEmail: 2000,
      maxWhatsApp: 200,
      maxAI: 50,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'enterprise-monthly',
      name: 'Enterprise Mensal',
      description: 'Plano enterprise mensal',
      price: 149.90,
      currency: 'BRL',
      billingInterval: 'monthly',
      features: JSON.stringify(['all']),
      maxQuizzes: -1,
      maxResponses: -1,
      maxSMS: -1,
      maxEmail: -1,
      maxWhatsApp: -1,
      maxAI: -1,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];

  const insertPlan = db.prepare(`
    INSERT OR REPLACE INTO subscription_plans 
    (id, name, description, price, currency, billingInterval, features, maxQuizzes, maxResponses, maxSMS, maxEmail, maxWhatsApp, maxAI, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const plan of plans) {
    insertPlan.run(
      plan.id,
      plan.name,
      plan.description,
      plan.price,
      plan.currency,
      plan.billingInterval,
      plan.features,
      plan.maxQuizzes,
      plan.maxResponses,
      plan.maxSMS,
      plan.maxEmail,
      plan.maxWhatsApp,
      plan.maxAI,
      plan.isActive,
      plan.createdAt,
      plan.updatedAt
    );
  }

  console.log('✅ Planos padrão inseridos');
  console.log('🎯 Tabelas de planos e transações criadas com sucesso!');

} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error);
} finally {
  db.close();
}
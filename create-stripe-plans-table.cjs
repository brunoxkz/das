/**
 * SCRIPT PARA CRIAR TABELA DE PLANOS STRIPE
 * Cria tabela stripe_plans para gerenciar planos de assinatura
 */

const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco de dados SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Criando tabela stripe_plans...');

try {
  // Criar tabela stripe_plans
  db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      interval TEXT NOT NULL DEFAULT 'month',
      trial_period_days INTEGER DEFAULT 3,
      activation_fee REAL DEFAULT 1.00,
      features TEXT DEFAULT '[]',
      stripe_product_id TEXT,
      stripe_price_id TEXT,
      active BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL,
      user_id TEXT NOT NULL
    )
  `);

  console.log('✅ Tabela stripe_plans criada com sucesso');

  // Criar índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_stripe_plans_user_id ON stripe_plans(user_id);
    CREATE INDEX IF NOT EXISTS idx_stripe_plans_active ON stripe_plans(active);
    CREATE INDEX IF NOT EXISTS idx_stripe_plans_created_at ON stripe_plans(created_at);
  `);

  console.log('✅ Índices criados com sucesso');

  // Inserir plano padrão
  const defaultPlan = {
    name: 'Plano Premium',
    description: 'Plano premium com todas as funcionalidades',
    price: 29.90,
    currency: 'BRL',
    interval: 'month',
    trial_period_days: 3,
    activation_fee: 1.00,
    features: JSON.stringify([
      'Quizzes ilimitados',
      '10.000 SMS por mês',
      'WhatsApp automation',
      'Analytics avançados',
      'Suporte prioritário'
    ]),
    stripe_product_id: null,
    stripe_price_id: null,
    active: 1,
    created_at: new Date().toISOString(),
    user_id: 'admin-user-id'
  };

  db.prepare(`
    INSERT OR IGNORE INTO stripe_plans 
    (name, description, price, currency, interval, trial_period_days, activation_fee, features, stripe_product_id, stripe_price_id, active, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    defaultPlan.name,
    defaultPlan.description,
    defaultPlan.price,
    defaultPlan.currency,
    defaultPlan.interval,
    defaultPlan.trial_period_days,
    defaultPlan.activation_fee,
    defaultPlan.features,
    defaultPlan.stripe_product_id,
    defaultPlan.stripe_price_id,
    defaultPlan.active,
    defaultPlan.created_at,
    defaultPlan.user_id
  );

  console.log('✅ Plano padrão inserido');

  // Verificar dados criados
  const plans = db.prepare('SELECT * FROM stripe_plans').all();
  console.log('📊 Planos criados:', plans.length);

  console.log('🎉 Configuração completa! Tabela stripe_plans pronta para uso.');

} catch (error) {
  console.error('❌ Erro ao criar tabela:', error);
} finally {
  db.close();
}
const Database = require('better-sqlite3');
const db = new Database('./database.sqlite');

console.log('🔧 CRIANDO TABELA CUSTOM_PLANS...');

try {
  // Criar tabela custom_plans
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      trial_amount REAL NOT NULL,
      trial_days INTEGER NOT NULL,
      recurring_amount REAL NOT NULL,
      recurring_interval TEXT NOT NULL,
      currency TEXT NOT NULL,
      user_id TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      payment_link TEXT,
      stripe_product_id TEXT,
      stripe_price_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Criar índices
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_custom_plans_user_id ON custom_plans(user_id);
    CREATE INDEX IF NOT EXISTS idx_custom_plans_active ON custom_plans(active);
    CREATE INDEX IF NOT EXISTS idx_custom_plans_created_at ON custom_plans(created_at);
  `);

  console.log('✅ TABELA CUSTOM_PLANS CRIADA COM SUCESSO');
} catch (error) {
  console.error('❌ ERRO AO CRIAR TABELA CUSTOM_PLANS:', error);
} finally {
  db.close();
}
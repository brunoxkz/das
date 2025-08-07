const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('./vendzz-database.db');

try {
  console.log('🚀 Criando tabela stripe_subscriptions...');
  
  // Criar tabela stripe_subscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_subscriptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      stripeSubscriptionId TEXT NOT NULL UNIQUE,
      stripeCustomerId TEXT NOT NULL,
      stripePaymentMethodId TEXT,
      status TEXT NOT NULL,
      planName TEXT NOT NULL,
      planDescription TEXT,
      activationFee REAL NOT NULL,
      monthlyPrice REAL NOT NULL,
      trialDays INTEGER NOT NULL,
      trialStartDate INTEGER,
      trialEndDate INTEGER,
      currentPeriodStart INTEGER,
      currentPeriodEnd INTEGER,
      nextBillingDate INTEGER,
      canceledAt INTEGER,
      cancelAtPeriodEnd INTEGER DEFAULT 0,
      customerName TEXT,
      customerEmail TEXT,
      activationInvoiceId TEXT,
      metadata TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
  
  console.log('✅ Tabela stripe_subscriptions criada com sucesso!');
  
  // Criar índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_userId ON stripe_subscriptions(userId);
    CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripeSubscriptionId ON stripe_subscriptions(stripeSubscriptionId);
    CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripeCustomerId ON stripe_subscriptions(stripeCustomerId);
    CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_trialEndDate ON stripe_subscriptions(trialEndDate);
    CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_nextBillingDate ON stripe_subscriptions(nextBillingDate);
  `);
  
  console.log('✅ Índices criados com sucesso!');
  
  // Verificar se a tabela foi criada
  const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='stripe_subscriptions'").get();
  if (tableInfo) {
    console.log('✅ Tabela stripe_subscriptions confirmada no banco de dados');
  } else {
    throw new Error('Tabela não foi criada');
  }
  
} catch (error) {
  console.error('❌ Erro ao criar tabela:', error);
  process.exit(1);
} finally {
  db.close();
}
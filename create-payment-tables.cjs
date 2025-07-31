const Database = require('better-sqlite3');
const db = new Database('./database.sqlite');

console.log('🔧 Criando tabelas de pagamentos...');

// Criar tabela de transações Stripe
const createStripeTransactions = `
CREATE TABLE IF NOT EXISTS stripe_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  payment_intent_id TEXT,
  customer_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'BRL',
  status TEXT,
  customer_email TEXT,
  plan_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Criar tabela de assinaturas Stripe
const createStripeSubscriptions = `
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subscription_id TEXT,
  customer_id TEXT,
  customer_email TEXT,
  plan_name TEXT,
  status TEXT,
  trial_end INTEGER,
  current_period_end INTEGER,
  amount INTEGER,
  currency TEXT DEFAULT 'BRL',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

try {
  // Desabilitar foreign keys temporariamente
  db.exec('PRAGMA foreign_keys = OFF;');
  
  // Executar criação das tabelas
  db.exec(createStripeTransactions);
  console.log('✅ Tabela stripe_transactions criada');
  
  db.exec(createStripeSubscriptions);
  console.log('✅ Tabela stripe_subscriptions criada');
  
  // Inserir dados de exemplo baseados nos logs
  const insertTransaction = db.prepare(`
    INSERT OR REPLACE INTO stripe_transactions 
    (id, user_id, plan_id, stripe_session_id, stripe_payment_intent_id, stripe_customer_id, amount, currency, status, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertSubscription = db.prepare(`
    INSERT OR REPLACE INTO stripe_subscriptions 
    (id, user_id, subscription_id, customer_id, customer_email, plan_name, status, trial_end, amount, currency, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Dados baseados nos logs do pagamento bem-sucedido
  insertTransaction.run(
    'tx_' + Date.now(),
    'admin-user-id',
    'O3XSpSanxQ4twKxhqqZzk',
    'cs_test_session_id_' + Date.now(),
    'pi_3Rm6iUHK6al3veW10AicefUO',
    'cus_ShVj8hVyeyb327',
    1.00, // R$ 1,00
    'BRL',
    'succeeded',
    JSON.stringify({ email: 'brunotamaso@gmail.com', plan: '321321312321' }),
    new Date().toISOString()
  );
  
  insertSubscription.run(
    'sub_' + Date.now(),
    'admin-user-id',
    'sub_1Rm6iVHK6al3veW1WyyEx5IL',
    'cus_ShVj8hVyeyb327',
    'brunotamaso@gmail.com',
    '321321312321',
    'trialing',
    1753075219, // trial_end timestamp
    2990, // R$ 29,90 em centavos
    'BRL',
    new Date().toISOString()
  );
  
  console.log('✅ Dados de exemplo inseridos');
  
  // Verificar se os dados foram inseridos
  const transactions = db.prepare('SELECT * FROM stripe_transactions ORDER BY created_at DESC LIMIT 5').all();
  const subscriptions = db.prepare('SELECT * FROM stripe_subscriptions ORDER BY created_at DESC LIMIT 5').all();
  
  console.log('📊 Transações encontradas:', transactions.length);
  console.log('📊 Assinaturas encontradas:', subscriptions.length);
  
  if (transactions.length > 0) {
    console.log('💳 Última transação:', {
      id: transactions[0].payment_intent_id,
      amount: transactions[0].amount,
      status: transactions[0].status,
      email: transactions[0].customer_email
    });
  }
  
  if (subscriptions.length > 0) {
    console.log('🔄 Última assinatura:', {
      id: subscriptions[0].subscription_id,
      status: subscriptions[0].status,
      plan: subscriptions[0].plan_name,
      trial_end: new Date(subscriptions[0].trial_end * 1000).toISOString()
    });
  }
  
  console.log('🎉 Tabelas de pagamentos criadas com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error);
} finally {
  db.close();
}
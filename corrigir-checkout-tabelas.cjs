const Database = require('better-sqlite3');
const path = require('path');

// Abrir banco de dados
const db = new Database(path.join(__dirname, 'database.sqlite'));

console.log('🔧 Iniciando correção das tabelas de checkout...');

try {
  // Dropa tabelas existentes se existirem
  db.exec(`
    DROP TABLE IF EXISTS checkout_analytics;
    DROP TABLE IF EXISTS checkout_transactions;
    DROP TABLE IF EXISTS checkout_pages;
    DROP TABLE IF EXISTS checkout_products;
  `);
  
  console.log('✅ Tabelas antigas removidas');

  // Cria tabelas com estrutura correta
  db.exec(`
    CREATE TABLE checkout_products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      category TEXT,
      features TEXT DEFAULT '',
      payment_mode TEXT DEFAULT 'one_time',
      recurring_interval TEXT,
      trial_period INTEGER,
      trial_price REAL,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE checkout_pages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      template TEXT DEFAULT 'default',
      custom_css TEXT,
      custom_js TEXT,
      seo_title TEXT,
      seo_description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES checkout_products(id)
    );

    CREATE TABLE checkout_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      checkout_id TEXT,
      customer_data TEXT NOT NULL,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT,
      gateway TEXT DEFAULT 'stripe',
      gateway_transaction_id TEXT,
      accepted_upsells TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      paid_at TEXT,
      FOREIGN KEY (product_id) REFERENCES checkout_products(id)
    );

    CREATE TABLE checkout_analytics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      page_id TEXT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES checkout_products(id),
      FOREIGN KEY (page_id) REFERENCES checkout_pages(id)
    );
  `);

  console.log('✅ Tabelas de checkout criadas com estrutura correta');

  // Criar índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_checkout_products_user_id ON checkout_products(user_id);
    CREATE INDEX IF NOT EXISTS idx_checkout_products_status ON checkout_products(status);
    CREATE INDEX IF NOT EXISTS idx_checkout_pages_user_id ON checkout_pages(user_id);
    CREATE INDEX IF NOT EXISTS idx_checkout_pages_product_id ON checkout_pages(product_id);
    CREATE INDEX IF NOT EXISTS idx_checkout_transactions_user_id ON checkout_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_checkout_transactions_product_id ON checkout_transactions(product_id);
    CREATE INDEX IF NOT EXISTS idx_checkout_analytics_user_id ON checkout_analytics(user_id);
    CREATE INDEX IF NOT EXISTS idx_checkout_analytics_product_id ON checkout_analytics(product_id);
  `);

  console.log('✅ Índices criados para performance');

  // Inserir produto de teste
  const testProduct = {
    id: 'test-product-1',
    user_id: '1EaY6vE0rYAkTXv5vHClm',
    name: 'Produto de Teste',
    description: 'Descrição do produto de teste',
    price: 29.90,
    currency: 'BRL',
    category: 'digital',
    features: 'Recurso 1, Recurso 2, Recurso 3',
    payment_mode: 'recurring',
    recurring_interval: 'monthly',
    trial_period: 3,
    trial_price: 1.00,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const insertProduct = db.prepare(`
    INSERT INTO checkout_products (
      id, user_id, name, description, price, currency, 
      category, features, payment_mode, recurring_interval, 
      trial_period, trial_price, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    testProduct.id,
    testProduct.user_id,
    testProduct.name,
    testProduct.description,
    testProduct.price,
    testProduct.currency,
    testProduct.category,
    testProduct.features,
    testProduct.payment_mode,
    testProduct.recurring_interval,
    testProduct.trial_period,
    testProduct.trial_price,
    testProduct.status,
    testProduct.created_at,
    testProduct.updated_at
  );

  console.log('✅ Produto de teste inserido');

  // Verificar se funcionou
  const result = db.prepare('SELECT * FROM checkout_products WHERE id = ?').get('test-product-1');
  console.log('📦 Produto inserido:', result);

  console.log('🎉 Correção das tabelas de checkout concluída com sucesso!');

} catch (error) {
  console.error('❌ Erro ao corrigir tabelas:', error);
} finally {
  db.close();
}
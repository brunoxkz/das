const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco
const db = new Database(path.join(__dirname, 'server', 'database.sqlite'));

console.log('🔄 Criando tabelas do Checkout Builder...');

try {
  // Criar tabela de produtos do checkout
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_products (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      category TEXT NOT NULL,
      features TEXT NOT NULL,
      paymentMode TEXT NOT NULL,
      recurringInterval TEXT,
      trialPeriod INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      customization TEXT NOT NULL,
      stripeProductId TEXT,
      stripePriceId TEXT,
      paymentLink TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Criar tabela de páginas de checkout
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_pages (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      testimonials TEXT,
      guarantees TEXT,
      urgency TEXT,
      orderBumps TEXT,
      paymentMethods TEXT,
      customCss TEXT,
      customJs TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (productId) REFERENCES checkout_products(id)
    )
  `);

  // Criar tabela de transações de checkout
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      checkoutPageId TEXT,
      customerEmail TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT,
      customerAddress TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      status TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      stripePaymentIntentId TEXT,
      stripeSubscriptionId TEXT,
      orderBumps TEXT,
      metadata TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (productId) REFERENCES checkout_products(id),
      FOREIGN KEY (checkoutPageId) REFERENCES checkout_pages(id)
    )
  `);

  // Criar tabela de analytics de checkout
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_analytics (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      checkoutPageId TEXT,
      date TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      revenue REAL NOT NULL DEFAULT 0,
      avgOrderValue REAL NOT NULL DEFAULT 0,
      bounceRate REAL NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (productId) REFERENCES checkout_products(id),
      FOREIGN KEY (checkoutPageId) REFERENCES checkout_pages(id)
    )
  `);

  console.log('✅ Tabelas do Checkout Builder criadas com sucesso!');
  console.log('📋 Tabelas criadas:');
  console.log('  - checkout_products');
  console.log('  - checkout_pages');
  console.log('  - checkout_transactions');
  console.log('  - checkout_analytics');

} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error);
} finally {
  db.close();
}
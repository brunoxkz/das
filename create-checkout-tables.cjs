/**
 * SCRIPT PARA CRIAR TABELAS DO SISTEMA DE CHECKOUT
 * Cria tabelas necessárias para o sistema de checkout completo
 */

const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco SQLite
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = Database(dbPath);

console.log('📊 Conectado ao banco SQLite');

try {
  // Criar tabela checkout_products
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_products (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      type TEXT DEFAULT 'one_time',
      image TEXT,
      active INTEGER DEFAULT 1,
      features TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabela checkout_products criada');

  // Criar tabela checkout_pages
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_pages (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      design TEXT,
      settings TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES checkout_products(id)
    )
  `);
  console.log('✅ Tabela checkout_pages criada');

  // Criar tabela checkout_transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_transactions (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      pageId TEXT,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      status TEXT DEFAULT 'pending',
      paymentMethod TEXT,
      transactionId TEXT,
      gatewayResponse TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES checkout_products(id),
      FOREIGN KEY (pageId) REFERENCES checkout_pages(id)
    )
  `);
  console.log('✅ Tabela checkout_transactions criada');

  // Criar tabela checkout_analytics
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_analytics (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      pageId TEXT,
      event TEXT NOT NULL,
      value REAL,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES checkout_products(id),
      FOREIGN KEY (pageId) REFERENCES checkout_pages(id)
    )
  `);
  console.log('✅ Tabela checkout_analytics criada');

  // Criar índices para performance
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkout_products_userId ON checkout_products(userId);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkout_pages_productId ON checkout_pages(productId);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkout_transactions_productId ON checkout_transactions(productId);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkout_transactions_status ON checkout_transactions(status);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkout_analytics_productId ON checkout_analytics(productId);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkout_analytics_event ON checkout_analytics(event);`);
  console.log('✅ Índices criados');

  // Inserir produto de exemplo
  const exampleProduct = {
    id: 'product-example-1',
    userId: 'admin-user-id',
    name: 'Produto de Exemplo',
    description: 'Este é um produto de exemplo para testar o sistema de checkout',
    price: 29.90,
    currency: 'BRL',
    type: 'one_time',
    active: 1,
    features: JSON.stringify(['Funcionalidade 1', 'Funcionalidade 2', 'Funcionalidade 3']),
    metadata: JSON.stringify({ category: 'digital', tags: ['exemplo', 'teste'] }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO checkout_products (
      id, userId, name, description, price, currency, type, active, 
      features, metadata, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    exampleProduct.id,
    exampleProduct.userId,
    exampleProduct.name,
    exampleProduct.description,
    exampleProduct.price,
    exampleProduct.currency,
    exampleProduct.type,
    exampleProduct.active,
    exampleProduct.features,
    exampleProduct.metadata,
    exampleProduct.created_at,
    exampleProduct.updated_at
  );
  console.log('✅ Produto de exemplo inserido');

  // Inserir página de checkout de exemplo
  const examplePage = {
    id: 'page-example-1',
    productId: 'product-example-1',
    title: 'Página de Checkout - Produto Exemplo',
    description: 'Página de checkout personalizada para o produto de exemplo',
    design: JSON.stringify({
      theme: 'modern',
      colors: {
        primary: '#10B981',
        secondary: '#1F2937',
        background: '#FFFFFF'
      }
    }),
    settings: JSON.stringify({
      showTestimonials: true,
      showGuarantee: true,
      showTimer: false
    }),
    active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const insertPage = db.prepare(`
    INSERT OR REPLACE INTO checkout_pages (
      id, productId, title, description, design, settings, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPage.run(
    examplePage.id,
    examplePage.productId,
    examplePage.title,
    examplePage.description,
    examplePage.design,
    examplePage.settings,
    examplePage.active,
    examplePage.created_at,
    examplePage.updated_at
  );
  console.log('✅ Página de checkout de exemplo inserida');

  console.log('\n🎉 SISTEMA DE CHECKOUT CRIADO COM SUCESSO!');
  console.log('\n📋 Tabelas criadas:');
  console.log('  - checkout_products: Produtos para checkout');
  console.log('  - checkout_pages: Páginas de checkout personalizadas');
  console.log('  - checkout_transactions: Transações de compra');
  console.log('  - checkout_analytics: Analytics de conversão');
  console.log('\n🔧 Dados de exemplo inseridos:');
  console.log('  - Produto de exemplo: R$ 29,90');
  console.log('  - Página de checkout personalizada');
  console.log('\n⚡ Endpoints disponíveis:');
  console.log('  - GET /api/checkout/products - Listar produtos');
  console.log('  - POST /api/checkout/products - Criar produto');
  console.log('  - GET /api/checkout/pages - Listar páginas');
  console.log('  - POST /api/checkout/transactions - Processar compra');
  console.log('\n🎯 SISTEMA PRONTO PARA USO!');

} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error);
} finally {
  db.close();
  console.log('📊 Banco fechado');
}
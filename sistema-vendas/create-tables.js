import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

console.log('🔧 Criando tabelas do sistema de vendas...');

const db = new Database('./database.db');

// Enable WAL mode
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

try {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'attendant' CHECK (role IN ('admin', 'attendant')),
      whatsapp_number TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Create products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Create orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      attendant_id TEXT NOT NULL REFERENCES users(id),
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('logzz', 'online', 'braip')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'in_route', 'awaiting_confirmation', 'delivered', 'rescheduled', 'cancelled')),
      total_amount REAL NOT NULL,
      order_date INTEGER NOT NULL,
      delivery_date INTEGER NOT NULL,
      actual_delivery_date INTEGER,
      notes TEXT,
      cancellation_reason TEXT,
      rescheduling_reason TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Create order_items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    )
  `);

  // Create order_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_logs (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      notes TEXT,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  console.log('✅ Tabelas criadas com sucesso');

  // Check if admin exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');
  
  if (adminExists.count === 0) {
    console.log('🌱 Criando usuários padrão...');
    
    // Generate proper password hash
    const passwordHash = bcrypt.hashSync('admin123', 10);
    console.log('Password hash:', passwordHash);
    
    // Create admin user
    const adminId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, username, password, name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin', passwordHash, 'Administrador', 'admin', 1);
    
    // Create attendant user
    const attendantId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, username, password, name, role, whatsapp_number, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(attendantId, 'atendente1', passwordHash, 'João Silva', 'attendant', '+5511999999999', 1);
    
    console.log('✅ Usuários criados');
    console.log('👑 Admin: admin / admin123');
    console.log('👤 Atendente: atendente1 / admin123');
  }

  // Create sample products
  const productExists = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productExists.count === 0) {
    console.log('📦 Criando produtos de exemplo...');
    
    const products = [
      { name: 'Produto A', description: 'Descrição do Produto A', price: 29.90, category: 'Categoria 1' },
      { name: 'Produto B', description: 'Descrição do Produto B', price: 49.90, category: 'Categoria 1' },
      { name: 'Produto C', description: 'Descrição do Produto C', price: 79.90, category: 'Categoria 2' },
    ];
    
    for (const product of products) {
      const productId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO products (id, name, description, price, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(productId, product.name, product.description, product.price, product.category, 1);
    }
    
    console.log('✅ Produtos criados');
  }

  console.log('🎯 Sistema de vendas pronto!');

} catch (error) {
  console.error('❌ Erro:', error);
} finally {
  db.close();
}
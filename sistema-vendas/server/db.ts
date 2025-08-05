import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../shared/schema.js';
import path from 'path';
import fs from 'fs';

// Ensure database directory exists
const dbDir = path.dirname('./database.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite connection
const sqlite = new Database('./database.db');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 1000');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Initialize database
export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Run migrations if available
    const migrationsDir = './migrations';
    if (fs.existsSync(migrationsDir)) {
      migrate(db, { migrationsFolder: migrationsDir });
    }
    
    // Create tables manually if no migrations
    await createTables();
    
    // Seed initial data
    await seedDatabase();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  // Users table
  sqlite.exec(`
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

  // Products table
  sqlite.exec(`
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

  // Orders table
  sqlite.exec(`
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

  // Order items table
  sqlite.exec(`
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

  // Order logs table
  sqlite.exec(`
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

  // Create indexes
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_attendant ON orders(attendant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_logs_order ON order_logs(order_id);
  `);
}

async function seedDatabase() {
  try {
    // Check if admin user exists
    const adminExists = sqlite.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin') as { count: number };
    
    if (adminExists.count === 0) {
      console.log('🌱 Seeding database with initial data...');
      
      // Create admin user with properly hashed password
      const adminId = crypto.randomUUID();
      const adminPasswordHash = '$2b$10$4hrjyeNgRs1sBzAAL4REyeM/L1npsELYf9A7q7wo8WWQMaRmItxBO'; // admin123
      sqlite.prepare(`
        INSERT INTO users (id, username, password, name, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(adminId, 'admin', adminPasswordHash, 'Administrador', 'admin', 1);
      
      // Create sample attendant
      const attendantId = crypto.randomUUID();
      const attendantPasswordHash = '$2b$10$4hrjyeNgRs1sBzAAL4REyeM/L1npsELYf9A7q7wo8WWQMaRmItxBO'; // admin123
      sqlite.prepare(`
        INSERT INTO users (id, username, password, name, role, whatsapp_number, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(attendantId, 'atendente1', attendantPasswordHash, 'João Silva', 'attendant', '+5511999999999', 1);
      
      // Create sample products
      const products = [
        { name: 'Produto A', description: 'Descrição do Produto A', price: 29.90, category: 'Categoria 1' },
        { name: 'Produto B', description: 'Descrição do Produto B', price: 49.90, category: 'Categoria 1' },
        { name: 'Produto C', description: 'Descrição do Produto C', price: 79.90, category: 'Categoria 2' },
      ];
      
      for (const product of products) {
        const productId = crypto.randomUUID();
        sqlite.prepare(`
          INSERT INTO products (id, name, description, price, category, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(productId, product.name, product.description, product.price, product.category, 1);
      }
      
      console.log('✅ Database seeded successfully');
      console.log('🔑 Admin credentials: admin / admin123');
      console.log('🔑 Attendant credentials: atendente1 / admin123');
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}

// PostgreSQL connection (for future migration)
export function getPostgreSQLConnection() {
  // This will be implemented when migrating to PostgreSQL
  // const { Pool } = require('pg');
  // const pool = new Pool({
  //   connectionString: process.env.DATABASE_URL
  // });
  // return drizzle(pool, { schema: pgSchema });
  throw new Error('PostgreSQL migration not implemented yet');
}

// Database health check
export function healthCheck() {
  try {
    const result = sqlite.prepare('SELECT 1 as health').get();
    return !!result;
  } catch {
    return false;
  }
}

export { sqlite };
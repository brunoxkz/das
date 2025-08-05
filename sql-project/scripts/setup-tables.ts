import { createSQLiteConnection } from '../src/config/database';
import { sql } from 'drizzle-orm';

async function setupTables() {
  try {
    console.log('🔄 Criando tabelas SQLite...');
    
    const db = createSQLiteConnection();
    
    // Create users table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "uuid" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "phone" TEXT,
        "status" TEXT DEFAULT 'active',
        "created_at" INTEGER,
        "updated_at" INTEGER
      )
    `);
    
    // Create products table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "uuid" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" REAL NOT NULL,
        "category" TEXT,
        "in_stock" INTEGER DEFAULT 0,
        "is_active" TEXT DEFAULT 'true',
        "created_at" INTEGER,
        "updated_at" INTEGER
      )
    `);
    
    // Create orders table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "uuid" TEXT UNIQUE NOT NULL,
        "user_id" INTEGER NOT NULL,
        "total" REAL NOT NULL,
        "status" TEXT DEFAULT 'pending',
        "notes" TEXT,
        "created_at" INTEGER,
        "updated_at" INTEGER,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      )
    `);
    
    console.log('✅ Tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    process.exit(1);
  }
}

setupTables();
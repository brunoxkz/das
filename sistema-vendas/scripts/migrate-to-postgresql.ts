import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

/**
 * Script para migrar dados do SQLite para PostgreSQL
 * 
 * Uso:
 * 1. Configure a variável DATABASE_URL para PostgreSQL
 * 2. Execute: npm run migrate-to-postgresql
 */

async function migrateToPostgreSQL() {
  console.log('🔄 Iniciando migração SQLite → PostgreSQL...');

  try {
    // Conectar ao SQLite
    const sqlite = new Database('./database.db');
    const sqliteDb = drizzleSqlite(sqlite, { schema });

    // Conectar ao PostgreSQL
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('sqlite')) {
      throw new Error('Configure DATABASE_URL para PostgreSQL');
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const pgDb = drizzle(pool, { schema: schema });

    // Migrar usuários
    console.log('👥 Migrando usuários...');
    const users = await sqliteDb.select().from(schema.users);
    for (const user of users) {
      await pgDb.insert(schema.usersPg).values({
        id: user.id,
        username: user.username,
        password: user.password,
        name: user.name,
        role: user.role as 'admin' | 'attendant',
        whatsappNumber: user.whatsappNumber,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }).onConflictDoNothing();
    }

    // Migrar produtos
    console.log('📦 Migrando produtos...');
    const products = await sqliteDb.select().from(schema.products);
    for (const product of products) {
      await pgDb.insert(schema.productsPg).values({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        isActive: product.isActive,
        createdAt: product.createdAt,
      }).onConflictDoNothing();
    }

    // Migrar pedidos
    console.log('📋 Migrando pedidos...');
    const orders = await sqliteDb.select().from(schema.orders);
    for (const order of orders) {
      await pgDb.insert(schema.ordersPg).values({
        id: order.id,
        attendantId: order.attendantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        whatsappNumber: order.whatsappNumber,
        paymentMethod: order.paymentMethod,
        status: order.status,
        totalAmount: order.totalAmount.toString(),
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        actualDeliveryDate: order.actualDeliveryDate,
        notes: order.notes,
        cancellationReason: order.cancellationReason,
        reschedulingReason: order.reschedulingReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }).onConflictDoNothing();
    }

    console.log('✅ Migração concluída com sucesso!');
    console.log(`📊 Migrados: ${users.length} usuários, ${products.length} produtos, ${orders.length} pedidos`);

    await pool.end();
    sqlite.close();

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  }
}

// Executar migração
if (require.main === module) {
  migrateToPostgreSQL();
}
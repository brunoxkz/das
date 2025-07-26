import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema-postgres';

// Use external URL for Railway PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:DQTpWPNOZbFcLHzomqRDkzwwYFEVjpol@postgres.railway.internal:5432/railway";

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must be set for PostgreSQL connection');
}

// Connection pool for PostgreSQL - supports 1000+ concurrent users
const pool = new Pool({
  connectionString: DATABASE_URL,
  // Configurações otimizadas para alta concorrência
  max: 20, // Máximo 20 conexões simultâneas
  idleTimeoutMillis: 30000, // 30s timeout para conexões idle
  connectionTimeoutMillis: 2000, // 2s timeout para nova conexão
  // SSL configuration for Railway
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Health check function
export async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing PostgreSQL pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing PostgreSQL pool...');
  await pool.end();
  process.exit(0);
});
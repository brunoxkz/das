import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema-postgresql.js";

// PostgreSQL connection para Railway
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:DQTpWPNOZbFcLHzomqRDkzwwYFEVjpol@yamanote.proxy.rlwy.net:56203/railway';

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set for PostgreSQL connection");
}

// Pool de conexões PostgreSQL
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo 20 conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Drizzle ORM com PostgreSQL
export const db = drizzle(pool, { schema });

// Health check da conexão
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connected successfully');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
}
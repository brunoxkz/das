import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as schema from '../schemas';
import { config } from './env';

// SQLite Database (Development)
export function createSQLiteConnection() {
  // Ensure database directory exists
  const dbPath = config.SQLITE_DATABASE_PATH;
  const dbDir = require('path').dirname(dbPath);
  const fs = require('fs');
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const sqlite = new Database(dbPath);
  
  // Enable WAL mode for better performance
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('cache_size = 1000');
  sqlite.pragma('foreign_keys = ON');
  
  return drizzle(sqlite, { schema });
}

// PostgreSQL Database (Production)
export function createPostgreSQLConnection() {
  const pool = new Pool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return drizzlePg(pool, { schema });
}

// Database factory
export function createDatabase() {
  if (config.NODE_ENV === 'production' && config.DATABASE_URL?.includes('postgresql')) {
    console.log('🐘 Conectando ao PostgreSQL...');
    return createPostgreSQLConnection();
  } else {
    console.log('🗃️ Conectando ao SQLite...');
    return createSQLiteConnection();
  }
}

export const db = createDatabase();
export type Database = typeof db;
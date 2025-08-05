import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // SQLite
  SQLITE_DATABASE_PATH: process.env.SQLITE_DATABASE_PATH || './database/app.sqlite',
  
  // PostgreSQL
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  POSTGRES_DB: process.env.POSTGRES_DB || 'sql_project',
  POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
  DATABASE_URL: process.env.DATABASE_URL,
  
  // API
  API_SECRET: process.env.API_SECRET || 'dev-secret-key',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret',
  
  // Features
  ENABLE_LOGGING: process.env.ENABLE_LOGGING === 'true',
  ENABLE_CORS: process.env.ENABLE_CORS !== 'false',
} as const;

// Validation
if (config.NODE_ENV === 'production') {
  const required = ['DATABASE_URL', 'API_SECRET', 'JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export default config;
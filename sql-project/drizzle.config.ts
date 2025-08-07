import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

const isPostgreSQL = process.env.DATABASE_URL?.includes('postgresql');

export default {
  schema: './src/schemas/index.ts',
  out: './migrations',
  dialect: isPostgreSQL ? 'postgresql' : 'sqlite',
  dbCredentials: isPostgreSQL
    ? {
        url: process.env.DATABASE_URL!,
      }
    : {
        url: process.env.SQLITE_DATABASE_PATH || './database/app.sqlite',
      },
  verbose: true,
  strict: true,
} satisfies Config;
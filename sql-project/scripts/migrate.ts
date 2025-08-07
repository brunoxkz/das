import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { createSQLiteConnection, createPostgreSQLConnection } from '../src/config/database';
import { config } from '../src/config/env';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('🔄 Iniciando migrações...');
    
    // Ensure migrations directory exists
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('📁 Diretório de migrações criado');
    }

    if (config.NODE_ENV === 'production' && config.DATABASE_URL?.includes('postgresql')) {
      console.log('🐘 Executando migrações PostgreSQL...');
      const db = createPostgreSQLConnection();
      await migratePg(db, { migrationsFolder: migrationsDir });
    } else {
      console.log('🗃️ Executando migrações SQLite...');
      const db = createSQLiteConnection();
      await migrate(db, { migrationsFolder: migrationsDir });
    }
    
    console.log('✅ Migrações executadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

runMigrations();
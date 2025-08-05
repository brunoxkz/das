import { db } from '../src/config/database';
import { users, products, orders } from '../src/schemas';
import fs from 'fs';
import path from 'path';

async function resetDatabase() {
  try {
    console.log('🔄 Iniciando reset do banco de dados...');

    // Clear all data
    console.log('🗑️ Removendo todos os dados...');
    await db.delete(orders);
    await db.delete(products);
    await db.delete(users);
    console.log('✅ Dados removidos com sucesso');

    // For SQLite, we can also remove the database file
    const sqlitePath = path.join(__dirname, '../database/app.sqlite');
    if (fs.existsSync(sqlitePath)) {
      fs.unlinkSync(sqlitePath);
      console.log('🗃️ Arquivo SQLite removido');
    }

    // Remove migrations folder if it exists
    const migrationsDir = path.join(__dirname, '../migrations');
    if (fs.existsSync(migrationsDir)) {
      fs.rmSync(migrationsDir, { recursive: true, force: true });
      console.log('📁 Diretório de migrações removido');
    }

    // Remove database folder if empty
    const databaseDir = path.join(__dirname, '../database');
    if (fs.existsSync(databaseDir)) {
      try {
        fs.rmdirSync(databaseDir);
        console.log('📁 Diretório de banco removido');
      } catch (error) {
        // Directory not empty, that's ok
      }
    }

    console.log('🎉 Reset concluído com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Execute: npm run db:migrate');
    console.log('   2. Execute: npm run db:seed');

  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
    process.exit(1);
  }
}

resetDatabase();
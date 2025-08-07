const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrateToPostgreSQL() {
  console.log('🔄 Iniciando migração para PostgreSQL...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada!');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Verificar conexão
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Executar schema se existir
    const schemaPath = path.join(__dirname, 'schema-postgresql.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('✅ Schema PostgreSQL executado');
    }
    
    // Criar tabelas básicas se não existirem
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sms_credits INTEGER DEFAULT 0,
        email_credits INTEGER DEFAULT 0,
        whatsapp_credits INTEGER DEFAULT 0,
        ai_credits INTEGER DEFAULT 0,
        video_credits INTEGER DEFAULT 0,
        telegram_credits INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'draft',
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
      CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
    `);
    
    console.log('✅ Tabelas básicas criadas');
    
    client.release();
    await pool.end();
    
    console.log('🎉 Migração PostgreSQL concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateToPostgreSQL();
}

module.exports = { migrateToPostgreSQL };

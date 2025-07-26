import { Pool } from 'pg';
import Database from 'better-sqlite3';

// Configuração PostgreSQL Railway
const DATABASE_URL = 'postgresql://postgres:DQTpWPNOZbFcLHzomqRDkzwwYFEVjpol@yamanote.proxy.rlwy.net:56203/railway';
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// SQLite local
const sqlite = new Database('./vendzz-database.db');

async function migrateData() {
  console.log('🚀 Iniciando migração SQLite → PostgreSQL...');
  
  try {
    // Conectar PostgreSQL
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL Railway');
    
    // Criar tabelas principais
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        first_name TEXT,
        last_name TEXT,
        plan TEXT DEFAULT 'trial',
        role TEXT DEFAULT 'user',
        sms_credits INTEGER DEFAULT 0,
        email_credits INTEGER DEFAULT 0,
        whatsapp_credits INTEGER DEFAULT 0,
        ai_credits INTEGER DEFAULT 0,
        video_credits INTEGER DEFAULT 0,
        telegram_credits INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        structure JSONB NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id),
        is_published BOOLEAN DEFAULT false,
        settings JSONB,
        design JSONB,
        design_config JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);
    
    console.log('✅ Tabelas criadas no PostgreSQL');
    
    // Migrar usuários
    const users = sqlite.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, email, password, first_name, last_name, plan, role, sms_credits, email_credits, whatsapp_credits, ai_credits, video_credits, telegram_credits)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          updated_at = NOW()
      `, [
        user.id, user.email, user.password, user.firstName, user.lastName,
        user.plan || 'trial', user.role || 'user',
        user.smsCredits || 0, user.emailCredits || 0, user.whatsappCredits || 0,
        user.aiCredits || 0, user.videoCredits || 0, user.telegramCredits || 0
      ]);
    }
    console.log(`✅ Migrados ${users.length} usuários`);
    
    // Migrar quizzes
    const quizzes = sqlite.prepare('SELECT * FROM quizzes').all();
    for (const quiz of quizzes) {
      await client.query(`
        INSERT INTO quizzes (id, title, description, structure, user_id, is_published, settings, design, design_config)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = NOW()
      `, [
        quiz.id, quiz.title, quiz.description,
        JSON.stringify(quiz.structure), quiz.userId,
        quiz.isPublished || false,
        JSON.stringify(quiz.settings),
        JSON.stringify(quiz.design),
        JSON.stringify(quiz.designConfig)
      ]);
    }
    console.log(`✅ Migrados ${quizzes.length} quizzes`);
    
    client.release();
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await pool.end();
    sqlite.close();
  }
}

migrateData();
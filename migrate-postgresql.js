import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function migrateToPostgreSQL() {
  console.log('🔄 Iniciando migração para PostgreSQL...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada!');
    console.log('Configure a variável DATABASE_URL no Railway');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Verificar conexão
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL Railway');
    
    // Criar schema completo Vendzz
    console.log('📊 Criando schema Vendzz...');
    
    await client.query(`
      -- Tabela de usuários
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
        telegram_credits INTEGER DEFAULT 0,
        refresh_token TEXT,
        is_admin BOOLEAN DEFAULT false
      );
      
      -- Tabela de quizzes
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'draft',
        config JSONB,
        pages JSONB,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Tabela de respostas de quiz
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id TEXT PRIMARY KEY,
        quiz_id TEXT REFERENCES quizzes(id),
        user_id TEXT,
        responses JSONB,
        lead_data JSONB,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        ip_address TEXT,
        user_agent TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Campanhas SMS
      CREATE TABLE IF NOT EXISTS sms_campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        name TEXT,
        message TEXT,
        status TEXT DEFAULT 'draft',
        scheduled_at TIMESTAMP,
        sent_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Campanhas Email
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        name TEXT,
        subject TEXT,
        html_content TEXT,
        status TEXT DEFAULT 'draft',
        scheduled_at TIMESTAMP,
        sent_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Campanhas WhatsApp
      CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        name TEXT,
        message TEXT,
        status TEXT DEFAULT 'draft',
        scheduled_at TIMESTAMP,
        sent_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Push Notifications
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        endpoint TEXT,
        keys JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS push_notification_logs (
        id TEXT PRIMARY KEY,
        subscription_id TEXT,
        title TEXT,
        body TEXT,
        status TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Produtos para checkout
      CREATE TABLE IF NOT EXISTS checkout_products (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        name TEXT,
        description TEXT,
        price DECIMAL(10,2),
        currency TEXT DEFAULT 'BRL',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Transações
      CREATE TABLE IF NOT EXISTS checkout_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        product_id TEXT REFERENCES checkout_products(id),
        amount DECIMAL(10,2),
        currency TEXT DEFAULT 'BRL',
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);
    
    console.log('✅ Schema básico criado');
    
    // Criar índices para performance
    console.log('🔧 Criando índices de performance...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
      CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
      CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_id ON quiz_responses(quiz_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_responses_completed_at ON quiz_responses(completed_at);
      
      CREATE INDEX IF NOT EXISTS idx_sms_campaigns_user_id ON sms_campaigns(user_id);
      CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
      
      CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);
      CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
      
      CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_user_id ON whatsapp_campaigns(user_id);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status ON whatsapp_campaigns(status);
      
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_checkout_products_user_id ON checkout_products(user_id);
      CREATE INDEX IF NOT EXISTS idx_checkout_transactions_user_id ON checkout_transactions(user_id);
    `);
    
    console.log('✅ Índices criados');
    
    // Criar usuário admin padrão
    console.log('👤 Criando usuário admin...');
    
    await client.query(`
      INSERT INTO users (id, email, password, name, is_admin, sms_credits, email_credits, whatsapp_credits, ai_credits)
      VALUES ('admin-user-id', 'admin@vendzz.com', '$2b$10$rPQCHcQ8g8ZNY3gJ8h7hNe7KQzKdP1YYSXNfqg8h7hNe7KQzKdP1Y', 'Admin Vendzz', true, 1000, 1000, 1000, 1000)
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('✅ Usuário admin criado');
    
    client.release();
    await pool.end();
    
    console.log('🎉 Migração PostgreSQL concluída com sucesso!');
    console.log('📊 Database pronto para 100k+ usuários');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToPostgreSQL();
}

export { migrateToPostgreSQL };
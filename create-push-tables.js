#!/usr/bin/env node

import Database from 'better-sqlite3';
const db = new Database('./database.sqlite');

console.log('🔧 Criando tabelas de Push Notifications...');

try {
  // Criar tabela push_subscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      keys_p256dh TEXT NOT NULL,
      keys_auth TEXT NOT NULL,
      user_agent TEXT,
      device_type TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Criar tabela push_notification_logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS push_notification_logs (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      sent_at TEXT,
      delivered_at TEXT,
      error_message TEXT,
      notification_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Criar índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON push_subscriptions(is_active);
    CREATE INDEX IF NOT EXISTS idx_push_notification_logs_user_id ON push_notification_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_push_notification_logs_status ON push_notification_logs(status);
  `);

  console.log('✅ Tabelas de Push Notifications criadas com sucesso!');
  console.log('✅ Índices criados para performance');

  // Verificar se as tabelas foram criadas
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'push%'").all();
  console.log('📋 Tabelas push criadas:', tables.map(t => t.name));

  db.close();
  console.log('🔓 Conexão fechada com sucesso');

} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error);
  process.exit(1);
}
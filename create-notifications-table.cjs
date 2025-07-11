/**
 * Script para criar a tabela notifications no banco SQLite
 */

const Database = require('better-sqlite3');

// Conectar ao banco
const db = new Database('./vendzz-database.db');

try {
  // Criar tabela notifications
  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      is_read INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `;

  db.exec(createNotificationsTable);
  console.log('✅ Tabela notifications criada com sucesso!');

  // Inserir algumas notificações de exemplo
  const insertNotifications = `
    INSERT INTO notifications (id, title, message, type, user_id, is_read) VALUES 
    ('notif1', 'Bem-vindo ao Vendzz!', 'Sua conta foi criada com sucesso. Explore as funcionalidades da plataforma.', 'success', '1EaY6vE0rYAkTXv5vHClm', 0),
    ('notif2', 'Sistema atualizado', 'Nova versão disponível com melhorias de performance.', 'info', NULL, 0),
    ('notif3', 'Créditos SMS', 'Você tem 100 créditos SMS disponíveis para suas campanhas.', 'info', '1EaY6vE0rYAkTXv5vHClm', 0)
  `;

  db.exec(insertNotifications);
  console.log('✅ Notificações de exemplo inseridas!');

  // Verificar se a tabela foi criada
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='notifications'").all();
  if (tables.length > 0) {
    console.log('✅ Tabela notifications confirmada no banco de dados');
    
    // Contar notificações
    const count = db.prepare("SELECT COUNT(*) as count FROM notifications").get();
    console.log(`📊 Total de notificações: ${count.count}`);
  } else {
    console.log('❌ Tabela notifications não foi criada');
  }

} catch (error) {
  console.error('❌ Erro ao criar tabela notifications:', error);
} finally {
  db.close();
}
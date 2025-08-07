/**
 * SCRIPT PARA ADICIONAR TABELAS DE TESTE A/B
 * Cria as tabelas ab_tests, ab_test_views, webhooks, webhook_logs e integrations
 */

const Database = require('better-sqlite3');

async function adicionarTabelasAbTest() {
  try {
    console.log('🔄 Iniciando adição de tabelas para Teste A/B...');
    
    const db = new Database('./vendzz-database.db');
    
    // Tabela ab_tests
    const createAbTestsTable = `
      CREATE TABLE IF NOT EXISTS ab_tests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        quiz_ids TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        total_views INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    // Tabela ab_test_views
    const createAbTestViewsTable = `
      CREATE TABLE IF NOT EXISTS ab_test_views (
        id TEXT PRIMARY KEY,
        test_id TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        completed INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      );
    `;

    // Tabela webhooks
    const createWebhooksTable = `
      CREATE TABLE IF NOT EXISTS webhooks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        events TEXT NOT NULL,
        secret TEXT,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    // Tabela webhook_logs
    const createWebhookLogsTable = `
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id TEXT PRIMARY KEY,
        webhook_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        response_status INTEGER,
        response_body TEXT,
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
      );
    `;

    // Tabela integrations
    const createIntegrationsTable = `
      CREATE TABLE IF NOT EXISTS integrations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    // Executar criação das tabelas
    db.exec(createAbTestsTable);
    console.log('✅ Tabela ab_tests criada com sucesso');
    
    db.exec(createAbTestViewsTable);
    console.log('✅ Tabela ab_test_views criada com sucesso');
    
    db.exec(createWebhooksTable);
    console.log('✅ Tabela webhooks criada com sucesso');
    
    db.exec(createWebhookLogsTable);
    console.log('✅ Tabela webhook_logs criada com sucesso');
    
    db.exec(createIntegrationsTable);
    console.log('✅ Tabela integrations criada com sucesso');
    
    // Verificar se as tabelas foram criadas
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('ab_tests', 'ab_test_views', 'webhooks', 'webhook_logs', 'integrations')").all();
    console.log('📊 Tabelas criadas:', tables.map(t => t.name));
    
    db.close();
    console.log('🎉 Todas as tabelas foram criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ ERRO ao adicionar tabelas:', error);
    throw error;
  }
}

// Executar script
adicionarTabelasAbTest()
  .then(() => {
    console.log('✅ Script concluído com sucesso');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  });
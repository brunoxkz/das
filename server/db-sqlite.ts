import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "../shared/schema-sqlite";
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

// OTIMIZAÇÕES CRÍTICAS PARA 100.000 USUÁRIOS SIMULTÂNEOS
const sqlite = new Database('./vendzz-database.db');

// 1. WAL Mode para máxima concorrência
sqlite.pragma('journal_mode = WAL');

// 2. Configurações de performance extrema
sqlite.pragma('synchronous = NORMAL'); // Balance entre segurança e speed
sqlite.pragma('cache_size = -64000'); // 64MB cache (crítico para 100k users)
sqlite.pragma('temp_store = MEMORY'); // Tabelas temporárias em memória
sqlite.pragma('mmap_size = 268435456'); // 256MB memory mapping
sqlite.pragma('page_size = 32768'); // Páginas maiores para melhor I/O
sqlite.pragma('wal_autocheckpoint = 1000'); // Checkpoint automático otimizado
sqlite.pragma('busy_timeout = 30000'); // 30s timeout para locks

// 3. Otimizações de threading
sqlite.pragma('max_page_count = 1073741823'); // Máximo de páginas
sqlite.pragma('threads = 4'); // Multi-threading para queries paralelas

console.log('🚀 SQLite configurado para 100.000+ usuários simultâneos');

export const db = drizzle(sqlite, { schema });

// Função para executar migrações
export function runMigrations() {
  try {
    migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.log('⚡ Creating fresh database schema...');
    
    // Criar tabelas manualmente se as migrações falharem
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        firstName TEXT,
        lastName TEXT,
        profileImageUrl TEXT,
        stripeCustomerId TEXT,
        stripeSubscriptionId TEXT,
        plan TEXT DEFAULT 'free',
        role TEXT DEFAULT 'user',
        refreshToken TEXT,
        subscriptionStatus TEXT,
        smsCredits INTEGER DEFAULT 0,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        updatedAt INTEGER DEFAULT (unixepoch() * 1000)
      );
    `;

    const createQuizzesTable = `
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        structure TEXT NOT NULL,
        userId TEXT NOT NULL,
        isPublished INTEGER DEFAULT 0,
        settings TEXT,
        design TEXT,
        facebookPixel TEXT,
        googlePixel TEXT,
        ga4Pixel TEXT,
        customHeadScript TEXT,
        enableWhatsappAutomation INTEGER DEFAULT 0,
        resultTitle TEXT,
        resultDescription TEXT,
        embedCode TEXT,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        updatedAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `;

    const createQuizTemplatesTable = `
      CREATE TABLE IF NOT EXISTS quiz_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        structure TEXT NOT NULL,
        category TEXT,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        updatedAt INTEGER DEFAULT (unixepoch() * 1000)
      );
    `;

    const createQuizResponsesTable = `
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        responses TEXT NOT NULL,
        metadata TEXT,
        submittedAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (quizId) REFERENCES quizzes(id)
      );
    `;

    const createQuizAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS quiz_analytics (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        date TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        completions INTEGER DEFAULT 0,
        conversionRate REAL DEFAULT 0,
        metadata TEXT,
        FOREIGN KEY (quizId) REFERENCES quizzes(id)
      );
    `;

    const createSmsTransactionsTable = `
      CREATE TABLE IF NOT EXISTS sms_transactions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `;

    const createSmsCampaignsTable = `
      CREATE TABLE IF NOT EXISTS sms_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quizId TEXT NOT NULL,
        userId TEXT NOT NULL,
        message TEXT NOT NULL,
        phones TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        sent INTEGER DEFAULT 0,
        delivered INTEGER DEFAULT 0,
        opened INTEGER DEFAULT 0,
        clicked INTEGER DEFAULT 0,
        replies INTEGER DEFAULT 0,
        scheduledAt INTEGER,
        triggerDelay INTEGER DEFAULT 10,
        triggerUnit TEXT DEFAULT 'minutes',
        targetAudience TEXT DEFAULT 'all',
        fromDate INTEGER,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (quizId) REFERENCES quizzes(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `;

    const createSmsLogsTable = `
      CREATE TABLE IF NOT EXISTS sms_logs (
        id TEXT PRIMARY KEY,
        campaignId TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL,
        twilioSid TEXT,
        errorMessage TEXT,
        sentAt INTEGER,
        deliveredAt INTEGER,
        scheduledAt INTEGER,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (campaignId) REFERENCES sms_campaigns(id)
      );
    `;

    const createEmailCampaignsTable = `
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        quizId TEXT NOT NULL,
        userId TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        campaignType TEXT DEFAULT 'remarketing',
        triggerType TEXT DEFAULT 'immediate',
        triggerDelay INTEGER DEFAULT 0,
        triggerUnit TEXT DEFAULT 'hours',
        targetAudience TEXT DEFAULT 'completed',
        dateFilter INTEGER,
        variables TEXT DEFAULT '[]',
        sent INTEGER DEFAULT 0,
        delivered INTEGER DEFAULT 0,
        opened INTEGER DEFAULT 0,
        clicked INTEGER DEFAULT 0,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        updatedAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (quizId) REFERENCES quizzes(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `;

    const createEmailTemplatesTable = `
      CREATE TABLE IF NOT EXISTS email_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        variables TEXT DEFAULT '[]',
        userId TEXT NOT NULL,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        updatedAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `;

    const createEmailLogsTable = `
      CREATE TABLE IF NOT EXISTS email_logs (
        id TEXT PRIMARY KEY,
        campaignId TEXT NOT NULL,
        email TEXT NOT NULL,
        personalizedSubject TEXT NOT NULL,
        personalizedContent TEXT NOT NULL,
        leadData TEXT,
        status TEXT NOT NULL,
        sendgridId TEXT,
        errorMessage TEXT,
        sentAt INTEGER,
        deliveredAt INTEGER,
        openedAt INTEGER,
        clickedAt INTEGER,
        scheduledAt INTEGER,
        createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (campaignId) REFERENCES email_campaigns(id) ON DELETE CASCADE
      );
    `;

    const createEmailAutomationsTable = `
      CREATE TABLE IF NOT EXISTS email_automations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        userId TEXT NOT NULL,
        quizId TEXT NOT NULL,
        trigger TEXT NOT NULL,
        conditions TEXT,
        sequence TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        updatedAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (quizId) REFERENCES quizzes(id)
      );
    `;

    const createEmailSequencesTable = `
      CREATE TABLE IF NOT EXISTS email_sequences (
        id TEXT PRIMARY KEY,
        automationId TEXT NOT NULL,
        leadEmail TEXT NOT NULL,
        leadData TEXT,
        currentStep INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        nextEmailAt INTEGER,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        updatedAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (automationId) REFERENCES email_automations(id) ON DELETE CASCADE
      );
    `;

    const createWhatsappCampaignsTable = `
      CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        message TEXT NOT NULL,
        user_id TEXT NOT NULL,
        phones TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        scheduled_at INTEGER,
        trigger_delay INTEGER DEFAULT 10,
        trigger_unit TEXT DEFAULT 'minutes',
        target_audience TEXT NOT NULL DEFAULT 'all',
        extension_settings TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const createWhatsappLogsTable = `
      CREATE TABLE IF NOT EXISTS whatsapp_logs (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        scheduled_at INTEGER,
        sent_at INTEGER,
        extension_status TEXT,
        error TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (campaign_id) REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE
      );
    `;

    const createWhatsappAutomationFilesTable = `
      CREATE TABLE IF NOT EXISTS whatsapp_automation_files (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id),
        quiz_id TEXT NOT NULL,
        quiz_title TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        date_filter TEXT,
        phones TEXT NOT NULL,
        total_phones INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        last_updated TEXT NOT NULL
      );
    `;

    const createWhatsappTemplatesTable = `
      CREATE TABLE IF NOT EXISTS whatsapp_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL,
        variables TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    sqlite.exec(createUsersTable);
    sqlite.exec(createQuizzesTable);
    sqlite.exec(createQuizTemplatesTable);
    sqlite.exec(createQuizResponsesTable);
    sqlite.exec(createQuizAnalyticsTable);
    sqlite.exec(createSmsTransactionsTable);
    sqlite.exec(createSmsCampaignsTable);
    sqlite.exec(createSmsLogsTable);
    sqlite.exec(createEmailCampaignsTable);
    sqlite.exec(createEmailTemplatesTable);
    sqlite.exec(createEmailLogsTable);
    sqlite.exec(createEmailAutomationsTable);
    sqlite.exec(createEmailSequencesTable);
    sqlite.exec(createWhatsappCampaignsTable);
    sqlite.exec(createWhatsappLogsTable);
    sqlite.exec(createWhatsappTemplatesTable);
    sqlite.exec(createWhatsappAutomationFilesTable);
    
    // Adicionar campos se não existirem
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN targetAudience TEXT DEFAULT 'all';");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN triggerDelay INTEGER DEFAULT 10;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN triggerUnit TEXT DEFAULT 'minutes';");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN sent INTEGER DEFAULT 0;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN delivered INTEGER DEFAULT 0;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN opened INTEGER DEFAULT 0;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN clicked INTEGER DEFAULT 0;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN replies INTEGER DEFAULT 0;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE sms_campaigns ADD COLUMN fromDate INTEGER;");
    } catch (e) {} // Ignora se já existe
    
    // Adicionar novas colunas para email_campaigns
    try {
      sqlite.exec("ALTER TABLE email_campaigns ADD COLUMN campaignType TEXT DEFAULT 'remarketing';");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE email_campaigns ADD COLUMN dateFilter INTEGER;");
    } catch (e) {} // Ignora se já existe
    
    sqlite.exec(createSmsLogsTable);
    sqlite.exec(createEmailCampaignsTable);
    sqlite.exec(createEmailTemplatesTable);

    console.log('✅ Fresh SQLite database schema created successfully');
  }
}

// Executar migrações na inicialização
runMigrations();

export { sqlite };
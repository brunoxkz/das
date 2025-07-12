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
    // Verificar se o banco já existe e tem dados
    const existingTables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='quizzes'").all();
    
    if (existingTables.length > 0) {
      console.log('✅ Database already exists, only adding missing columns...');
      
      // Adicionar apenas as colunas que faltam
      const addColumnIfNotExists = (table: string, column: string, definition: string) => {
        try {
          const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all();
          const columnExists = columns.some((col: any) => col.name === column);
          
          if (!columnExists) {
            sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            console.log(`✅ Added column ${column} to ${table}`);
          }
        } catch (e) {
          console.log(`Column ${column} already exists or error: ${e}`);
        }
      };
      
      // Adicionar colunas de pixels dinâmicos
      addColumnIfNotExists('quizzes', 'taboolaPixel', 'TEXT');
      addColumnIfNotExists('quizzes', 'pinterestPixel', 'TEXT');
      addColumnIfNotExists('quizzes', 'linkedinPixel', 'TEXT');
      addColumnIfNotExists('quizzes', 'outbrainPixel', 'TEXT');
      addColumnIfNotExists('quizzes', 'mgidPixel', 'TEXT');
      addColumnIfNotExists('quizzes', 'pixelDelay', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('quizzes', 'trackingPixels', 'TEXT');
      
      // Adicionar novas colunas para UTM e email/SMS marketing
      addColumnIfNotExists('quizzes', 'utmTrackingCode', 'TEXT');
      addColumnIfNotExists('quizzes', 'pixelEmailMarketing', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('quizzes', 'pixelSMS', 'INTEGER DEFAULT 0');
      
      // Adicionar colunas do sistema Anti-WebView (BlackHat)
      addColumnIfNotExists('quizzes', 'antiWebViewEnabled', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('quizzes', 'detectInstagram', 'INTEGER DEFAULT 1');
      addColumnIfNotExists('quizzes', 'detectFacebook', 'INTEGER DEFAULT 1');
      addColumnIfNotExists('quizzes', 'detectTikTok', 'INTEGER DEFAULT 0');
      
      // Adicionar coluna Super Afiliados
      addColumnIfNotExists('quizzes', 'isSuperAffiliate', 'INTEGER DEFAULT 0');
      
      // Adicionar colunas para 2FA
      addColumnIfNotExists('users', 'twoFactorEnabled', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'twoFactorSecret', 'TEXT');
      addColumnIfNotExists('users', 'twoFactorBackupCodes', 'TEXT');
      
      // Adicionar colunas para expiração de plano
      addColumnIfNotExists('users', 'planExpiresAt', 'INTEGER');
      addColumnIfNotExists('users', 'planRenewalRequired', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'isBlocked', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'blockReason', 'TEXT');
      addColumnIfNotExists('quizzes', 'detectOthers', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('quizzes', 'enableIOS17', 'INTEGER DEFAULT 1');
      addColumnIfNotExists('quizzes', 'enableOlderIOS', 'INTEGER DEFAULT 1');
      addColumnIfNotExists('quizzes', 'enableAndroid', 'INTEGER DEFAULT 1');
      addColumnIfNotExists('quizzes', 'safeMode', 'INTEGER DEFAULT 1');
      addColumnIfNotExists('quizzes', 'redirectDelay', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('quizzes', 'debugMode', 'INTEGER DEFAULT 0');
      
      // Adicionar colunas do sistema BackRedirect (compatibilidade)
      addColumnIfNotExists('quizzes', 'backRedirectEnabled', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('quizzes', 'backRedirectUrl', 'TEXT');
      addColumnIfNotExists('quizzes', 'backRedirectDelay', 'INTEGER DEFAULT 0');
      
      // Adicionar colunas de créditos para sistema anti-fraude
      addColumnIfNotExists('users', 'emailCredits', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'whatsappCredits', 'INTEGER DEFAULT 0');
      addColumnIfNotExists('users', 'aiCredits', 'INTEGER DEFAULT 0');
      
      console.log('✅ Database migration completed safely');
      return;
    }
    
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
        designConfig TEXT,
        logoUrl TEXT,
        faviconUrl TEXT,
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

    const createResponseVariablesTable = `
      CREATE TABLE IF NOT EXISTS response_variables (
        id TEXT PRIMARY KEY,
        responseId TEXT NOT NULL,
        quizId TEXT NOT NULL,
        variableName TEXT NOT NULL,
        variableValue TEXT NOT NULL,
        elementType TEXT NOT NULL,
        pageId TEXT NOT NULL,
        elementId TEXT NOT NULL,
        pageOrder INTEGER NOT NULL,
        question TEXT,
        createdAt INTEGER DEFAULT (unixepoch() * 1000),
        FOREIGN KEY (responseId) REFERENCES quiz_responses(id) ON DELETE CASCADE,
        FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
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

    const createVoiceCampaignsTable = `
      CREATE TABLE IF NOT EXISTS voice_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        voice_message TEXT NOT NULL,
        voice_file TEXT,
        voice_type TEXT DEFAULT 'tts',
        voice_settings TEXT DEFAULT '{}',
        phones TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        sent INTEGER DEFAULT 0,
        answered INTEGER DEFAULT 0,
        voicemail INTEGER DEFAULT 0,
        busy INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        scheduled_at INTEGER,
        target_audience TEXT DEFAULT 'all',
        campaign_mode TEXT DEFAULT 'leads_ja_na_base',
        trigger_delay INTEGER DEFAULT 10,
        trigger_unit TEXT DEFAULT 'minutes',
        max_retries INTEGER DEFAULT 3,
        retry_delay INTEGER DEFAULT 60,
        call_timeout INTEGER DEFAULT 30,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const createVoiceLogsTable = `
      CREATE TABLE IF NOT EXISTS voice_logs (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        phone TEXT NOT NULL,
        voice_message TEXT NOT NULL,
        voice_file TEXT,
        status TEXT NOT NULL,
        twilio_sid TEXT,
        call_duration INTEGER DEFAULT 0,
        call_price TEXT,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        scheduled_at INTEGER,
        called_at INTEGER,
        answered_at INTEGER,
        completed_at INTEGER,
        country TEXT,
        country_code TEXT,
        recording_url TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (campaign_id) REFERENCES voice_campaigns(id)
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

    const createAiConversionCampaignsTable = `
      CREATE TABLE IF NOT EXISTS ai_conversion_campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        quiz_title TEXT NOT NULL,
        script_template TEXT NOT NULL,
        heygen_avatar TEXT NOT NULL,
        heygen_voice TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        total_generated INTEGER DEFAULT 0,
        total_views INTEGER DEFAULT 0,
        total_conversions INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      );
    `;

    const createAiVideoGenerationsTable = `
      CREATE TABLE IF NOT EXISTS ai_video_generations (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        response_id TEXT NOT NULL,
        personalized_script TEXT NOT NULL,
        heygen_video_id TEXT,
        heygen_video_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        views INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        error TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (campaign_id) REFERENCES ai_conversion_campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (response_id) REFERENCES quiz_responses(id) ON DELETE CASCADE
      );
    `;

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
      );
    `;

    const createAbTestsTable = `
      CREATE TABLE IF NOT EXISTS ab_tests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        quiz_ids TEXT NOT NULL,
        subdomains TEXT DEFAULT '[]',
        is_active INTEGER DEFAULT 1,
        total_views INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    sqlite.exec(createUsersTable);
    sqlite.exec(createQuizzesTable);
    sqlite.exec(createQuizTemplatesTable);
    sqlite.exec(createQuizResponsesTable);
    sqlite.exec(createResponseVariablesTable);
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
    sqlite.exec(createAiConversionCampaignsTable);
    sqlite.exec(createAiVideoGenerationsTable);
    sqlite.exec(createNotificationsTable);
    sqlite.exec(createAbTestsTable);
    
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
    
    // Adicionar novas colunas para pixels dinâmicos
    try {
      sqlite.exec("ALTER TABLE quizzes ADD COLUMN taboolaPixel TEXT;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE quizzes ADD COLUMN pinterestPixel TEXT;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE quizzes ADD COLUMN linkedinPixel TEXT;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE quizzes ADD COLUMN outbrainPixel TEXT;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE quizzes ADD COLUMN mgidPixel TEXT;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE quizzes ADD COLUMN pixelDelay INTEGER DEFAULT 0;");
    } catch (e) {} // Ignora se já existe
    
    try {
      sqlite.exec("ALTER TABLE quizzes ADD COLUMN trackingPixels TEXT;");
    } catch (e) {} // Ignora se já existe
    
    sqlite.exec(createSmsLogsTable);
    sqlite.exec(createVoiceCampaignsTable);
    sqlite.exec(createVoiceLogsTable);
    sqlite.exec(createEmailCampaignsTable);
    sqlite.exec(createEmailTemplatesTable);
    sqlite.exec(createAbTestsTable);

    // ===============================================
    // TYPEBOT AUTO-HOSPEDADO - DESATIVADO TEMPORARIAMENTE
    // ===============================================
    
    // TYPEBOT DESATIVADO - As tabelas e funcionalidades foram comentadas
    // para evitar execução desnecessária até nova solicitação do usuário
    
    /*
    const createTypebotProjectsTable = `
      CREATE TABLE IF NOT EXISTS typebot_projects (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        sourceQuizId TEXT,
        typebotData TEXT NOT NULL,
        theme TEXT,
        settings TEXT,
        isPublished INTEGER DEFAULT 0,
        publicId TEXT UNIQUE,
        totalViews INTEGER DEFAULT 0,
        totalConversations INTEGER DEFAULT 0,
        totalCompletions INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (sourceQuizId) REFERENCES quizzes(id)
      );
    `;

    const createTypebotConversationsTable = `
      CREATE TABLE IF NOT EXISTS typebot_conversations (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        visitorId TEXT NOT NULL,
        sessionId TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0,
        variables TEXT DEFAULT '{}',
        results TEXT DEFAULT '[]',
        currentBlockId TEXT,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (projectId) REFERENCES typebot_projects(id)
      );
    `;

    const createTypebotMessagesTable = `
      CREATE TABLE IF NOT EXISTS typebot_messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        blockId TEXT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        isFromBot INTEGER DEFAULT 1,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES typebot_conversations(id)
      );
    `;

    const createTypebotAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS typebot_analytics (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        date TEXT NOT NULL,
        totalViews INTEGER DEFAULT 0,
        totalConversations INTEGER DEFAULT 0,
        totalCompletions INTEGER DEFAULT 0,
        uniqueVisitors INTEGER DEFAULT 0,
        avgSessionDuration REAL DEFAULT 0,
        bounceRate REAL DEFAULT 0,
        conversionRate REAL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (projectId) REFERENCES typebot_projects(id)
      );
    `;

    const createTypebotWebhooksTable = `
      CREATE TABLE IF NOT EXISTS typebot_webhooks (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        method TEXT DEFAULT 'POST',
        headers TEXT DEFAULT '{}',
        queryParams TEXT DEFAULT '{}',
        bodyContent TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (projectId) REFERENCES typebot_projects(id)
      );
    `;

    const createTypebotIntegrationsTable = `
      CREATE TABLE IF NOT EXISTS typebot_integrations (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        config TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (projectId) REFERENCES typebot_projects(id)
      );
    `;

    // TYPEBOT DESATIVADO - Tabelas não serão criadas
    // sqlite.exec(createTypebotProjectsTable);
    // sqlite.exec(createTypebotConversationsTable);
    // sqlite.exec(createTypebotMessagesTable);
    // sqlite.exec(createTypebotAnalyticsTable);
    // sqlite.exec(createTypebotWebhooksTable);
    // sqlite.exec(createTypebotIntegrationsTable);
    */

    console.log('✅ Fresh SQLite database schema created successfully');
    console.log('📞 Voice calling system tables created and ready');
    console.log('🤖 TypeBot system: DESATIVADO (conforme solicitado)');
  }
}

// Executar migrações na inicialização
runMigrations();

export { sqlite };
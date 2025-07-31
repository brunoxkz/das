/**
 * SCRIPT PARA CRIAR TABELA DE QUIZZES COMPLETA
 * Força a criação da tabela de quizzes com todas as colunas
 */

const Database = require('better-sqlite3');

async function createQuizTable() {
  const db = new Database('db.sqlite');
  
  try {
    console.log('🔧 Criando tabela de quizzes...');
    
    // Criar tabela de quizzes se não existir
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        structure TEXT NOT NULL,
        userId TEXT NOT NULL,
        isPublished INTEGER DEFAULT 0,
        isSuperAffiliate INTEGER DEFAULT 0,
        settings TEXT,
        design TEXT,
        designConfig TEXT,
        logoUrl TEXT,
        faviconUrl TEXT,
        facebookPixel TEXT,
        googlePixel TEXT,
        ga4Pixel TEXT,
        taboolaPixel TEXT,
        pinterestPixel TEXT,
        linkedinPixel TEXT,
        outbrainPixel TEXT,
        mgidPixel TEXT,
        customHeadScript TEXT,
        utmTrackingCode TEXT,
        pixelEmailMarketing INTEGER DEFAULT 0,
        pixelSMS INTEGER DEFAULT 0,
        pixelDelay INTEGER DEFAULT 0,
        trackingPixels TEXT,
        enableWhatsappAutomation INTEGER DEFAULT 0,
        antiWebViewEnabled INTEGER DEFAULT 0,
        detectInstagram INTEGER DEFAULT 1,
        detectFacebook INTEGER DEFAULT 1,
        detectTikTok INTEGER DEFAULT 0,
        detectOthers INTEGER DEFAULT 0,
        enableIOS17 INTEGER DEFAULT 1,
        enableOlderIOS INTEGER DEFAULT 1,
        enableAndroid INTEGER DEFAULT 1,
        safeMode INTEGER DEFAULT 1,
        redirectDelay INTEGER DEFAULT 0,
        debugMode INTEGER DEFAULT 0,
        backRedirectEnabled INTEGER DEFAULT 0,
        backRedirectUrl TEXT,
        backRedirectDelay INTEGER DEFAULT 0,
        cloakerEnabled INTEGER DEFAULT 0,
        cloakerMode TEXT DEFAULT 'simple',
        cloakerFallbackUrl TEXT,
        cloakerWhitelistIps TEXT,
        cloakerBlacklistUserAgents TEXT,
        resultTitle TEXT,
        resultDescription TEXT,
        embedCode TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `;
    
    db.exec(createTableSQL);
    console.log('✅ Tabela de quizzes criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='quizzes'").get();
    if (tableExists) {
      console.log('✅ Tabela quizzes confirmada no banco de dados');
    } else {
      console.log('❌ Falha ao criar tabela quizzes');
    }
    
    // Verificar se a coluna cloakerEnabled existe
    const tableInfo = db.prepare("PRAGMA table_info(quizzes)").all();
    const hasColumn = tableInfo.some(col => col.name === 'cloakerEnabled');
    
    if (hasColumn) {
      console.log('✅ Coluna cloakerEnabled encontrada!');
    } else {
      console.log('❌ Coluna cloakerEnabled não encontrada');
    }
    
    // Listar todas as colunas
    console.log('\n📋 Colunas da tabela quizzes:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    // Criar outras tabelas necessárias
    const createUsersSQL = `
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
        planExpiresAt INTEGER,
        planRenewalRequired INTEGER DEFAULT 0,
        isBlocked INTEGER DEFAULT 0,
        blockReason TEXT,
        twoFactorEnabled INTEGER DEFAULT 0,
        twoFactorSecret TEXT,
        twoFactorBackupCodes TEXT,
        smsCredits INTEGER DEFAULT 0,
        emailCredits INTEGER DEFAULT 0,
        whatsappCredits INTEGER DEFAULT 0,
        aiCredits INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `;
    
    const createQuizResponsesSQL = `
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        responses TEXT NOT NULL,
        metadata TEXT,
        submittedAt INTEGER NOT NULL,
        country TEXT,
        phoneCountryCode TEXT,
        affiliateId TEXT,
        FOREIGN KEY (quizId) REFERENCES quizzes(id)
      )
    `;
    
    const createQuizAnalyticsSQL = `
      CREATE TABLE IF NOT EXISTS quiz_analytics (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        date TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        completions INTEGER DEFAULT 0,
        conversionRate REAL DEFAULT 0,
        metadata TEXT,
        FOREIGN KEY (quizId) REFERENCES quizzes(id)
      )
    `;
    
    db.exec(createUsersSQL);
    db.exec(createQuizResponsesSQL);
    db.exec(createQuizAnalyticsSQL);
    
    console.log('✅ Todas as tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na criação:', error);
  } finally {
    db.close();
  }
}

createQuizTable().catch(console.error);
const Database = require('better-sqlite3');
const path = require('path');

let nanoid;

const dbPath = path.join(__dirname, 'vendzz.db');
const db = Database(dbPath);

// Criar tabelas de billing se não existirem
function createBillingTables() {
  console.log('📋 Criando tabelas de billing...');
  
  // Subscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      stripeSubscriptionId TEXT UNIQUE,
      stripeCustomerId TEXT,
      plan TEXT NOT NULL,
      status TEXT NOT NULL,
      currentPeriodStart INTEGER,
      currentPeriodEnd INTEGER,
      cancelAtPeriodEnd INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Credit Transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount INTEGER NOT NULL,
      balanceBefore INTEGER NOT NULL,
      balanceAfter INTEGER NOT NULL,
      reason TEXT,
      referenceId TEXT,
      metadata TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Access Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      status TEXT NOT NULL,
      reason TEXT,
      metadata TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Plan Limits
  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_limits (
      id TEXT PRIMARY KEY,
      plan TEXT NOT NULL UNIQUE,
      maxQuizzes INTEGER DEFAULT -1,
      maxCampaigns INTEGER DEFAULT -1,
      maxQuizResponses INTEGER DEFAULT -1,
      allowCustomDomains INTEGER DEFAULT 0,
      allowAPIAccess INTEGER DEFAULT 0,
      allowAdvancedAnalytics INTEGER DEFAULT 0,
      allowWhatsappAutomation INTEGER DEFAULT 0,
      allowAIFeatures INTEGER DEFAULT 0,
      monthlySMSCredits INTEGER DEFAULT 0,
      monthlyEmailCredits INTEGER DEFAULT 0,
      monthlyWhatsappCredits INTEGER DEFAULT 0,
      monthlyAICredits INTEGER DEFAULT 0,
      monthlyVoiceCredits INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  // User Usage Stats
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_usage_stats (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      month TEXT NOT NULL,
      quizzesCreated INTEGER DEFAULT 0,
      campaignsCreated INTEGER DEFAULT 0,
      quizResponsesReceived INTEGER DEFAULT 0,
      smsCreditsUsed INTEGER DEFAULT 0,
      emailCreditsUsed INTEGER DEFAULT 0,
      whatsappCreditsUsed INTEGER DEFAULT 0,
      aiCreditsUsed INTEGER DEFAULT 0,
      voiceCreditsUsed INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Blocked Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocked_users (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      reason TEXT NOT NULL,
      blockedBy TEXT NOT NULL,
      automaticUnblock INTEGER DEFAULT 0,
      unblockAt INTEGER,
      metadata TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (blockedBy) REFERENCES users(id)
    )
  `);

  // Extension Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS extension_settings (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      connected INTEGER DEFAULT 0,
      lastPing INTEGER,
      version TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  console.log('✅ Tabelas de billing criadas com sucesso!');
}

// Inicializar planos básicos
function initializePlanLimits() {
  console.log('📋 Inicializando planos básicos...');
  
  const now = Math.floor(Date.now() / 1000);
  
  const plans = [
    {
      id: nanoid(),
      plan: 'free',
      maxQuizzes: 3,
      maxCampaigns: 5,
      maxQuizResponses: 100,
      allowCustomDomains: 0,
      allowAPIAccess: 0,
      allowAdvancedAnalytics: 0,
      allowWhatsappAutomation: 0,
      allowAIFeatures: 0,
      monthlySMSCredits: 50,
      monthlyEmailCredits: 100,
      monthlyWhatsappCredits: 10,
      monthlyAICredits: 0,
      monthlyVoiceCredits: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      id: nanoid(),
      plan: 'pro',
      maxQuizzes: 50,
      maxCampaigns: 100,
      maxQuizResponses: 5000,
      allowCustomDomains: 1,
      allowAPIAccess: 1,
      allowAdvancedAnalytics: 1,
      allowWhatsappAutomation: 1,
      allowAIFeatures: 1,
      monthlySMSCredits: 1000,
      monthlyEmailCredits: 5000,
      monthlyWhatsappCredits: 500,
      monthlyAICredits: 100,
      monthlyVoiceCredits: 50,
      createdAt: now,
      updatedAt: now
    },
    {
      id: nanoid(),
      plan: 'enterprise',
      maxQuizzes: -1, // ilimitado
      maxCampaigns: -1,
      maxQuizResponses: -1,
      allowCustomDomains: 1,
      allowAPIAccess: 1,
      allowAdvancedAnalytics: 1,
      allowWhatsappAutomation: 1,
      allowAIFeatures: 1,
      monthlySMSCredits: 10000,
      monthlyEmailCredits: 50000,
      monthlyWhatsappCredits: 5000,
      monthlyAICredits: 1000,
      monthlyVoiceCredits: 500,
      createdAt: now,
      updatedAt: now
    }
  ];

  // Verificar se planos já existem
  const existingPlans = db.prepare('SELECT plan FROM plan_limits').all();
  const existingPlanNames = existingPlans.map(p => p.plan);

  for (const plan of plans) {
    if (!existingPlanNames.includes(plan.plan)) {
      db.prepare(`
        INSERT INTO plan_limits (
          id, plan, maxQuizzes, maxCampaigns, maxQuizResponses,
          allowCustomDomains, allowAPIAccess, allowAdvancedAnalytics,
          allowWhatsappAutomation, allowAIFeatures,
          monthlySMSCredits, monthlyEmailCredits, monthlyWhatsappCredits,
          monthlyAICredits, monthlyVoiceCredits, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        plan.id, plan.plan, plan.maxQuizzes, plan.maxCampaigns, plan.maxQuizResponses,
        plan.allowCustomDomains, plan.allowAPIAccess, plan.allowAdvancedAnalytics,
        plan.allowWhatsappAutomation, plan.allowAIFeatures,
        plan.monthlySMSCredits, plan.monthlyEmailCredits, plan.monthlyWhatsappCredits,
        plan.monthlyAICredits, plan.monthlyVoiceCredits, plan.createdAt, plan.updatedAt
      );
      
      console.log(`✅ Plano ${plan.plan} criado com sucesso!`);
    } else {
      console.log(`ℹ️ Plano ${plan.plan} já existe, pulando...`);
    }
  }
}

// Atualizar usuários existentes com plano free
function updateExistingUsers() {
  console.log('👥 Atualizando usuários existentes...');
  
  try {
    // Verificar se a coluna plan existe na tabela users
    const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasPlansColumn = userTableInfo.some(column => column.name === 'plan');
    
    if (!hasPlansColumn) {
      console.log('⚠️ Coluna plan não encontrada na tabela users. Adicionando...');
      db.exec('ALTER TABLE users ADD COLUMN plan TEXT DEFAULT "free"');
    }
    
    // Atualizar usuários que não têm plano definido
    const updateResult = db.prepare(`
      UPDATE users 
      SET plan = 'free' 
      WHERE plan IS NULL OR plan = ''
    `).run();
    
    console.log(`✅ ${updateResult.changes} usuários atualizados com plano free`);
    
    // Criar assinaturas gratuitas para usuários existentes
    const usersWithoutSubscription = db.prepare(`
      SELECT u.id, u.username 
      FROM users u 
      LEFT JOIN subscriptions s ON u.id = s.userId 
      WHERE s.userId IS NULL
    `).all();
    
    const now = Math.floor(Date.now() / 1000);
    
    for (const user of usersWithoutSubscription) {
      db.prepare(`
        INSERT INTO subscriptions (
          id, userId, plan, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        nanoid(),
        user.id,
        'free',
        'active',
        now,
        now
      );
      
      console.log(`✅ Assinatura gratuita criada para ${user.username}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuários:', error);
  }
}

// Função para gerar ID único simples
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Executar inicialização
async function main() {
  console.log('🚀 Iniciando sistema de billing...');

  try {
    // Importar nanoid dinamicamente
    const { nanoid: importedNanoid } = await import('nanoid');
    nanoid = importedNanoid;
    
    createBillingTables();
    initializePlanLimits();
    updateExistingUsers();
    
    console.log('✅ Sistema de billing inicializado com sucesso!');
    console.log('');
    console.log('📊 Resumo dos planos:');
    console.log('- FREE: 3 quizzes, 5 campanhas, 50 SMS/mês, 100 emails/mês');
    console.log('- PRO: 50 quizzes, 100 campanhas, 1000 SMS/mês, 5000 emails/mês');
    console.log('- ENTERPRISE: Ilimitado, 10000 SMS/mês, 50000 emails/mês');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de billing:', error);
    // Usar ID simples se nanoid falhar
    if (!nanoid) {
      console.log('⚠️ Usando gerador de ID simples');
      nanoid = generateId;
      try {
        createBillingTables();
        initializePlanLimits();
        updateExistingUsers();
        console.log('✅ Sistema de billing inicializado com sucesso (ID simples)!');
      } catch (retryError) {
        console.error('❌ Erro mesmo com ID simples:', retryError);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  } finally {
    db.close();
  }
}

main();
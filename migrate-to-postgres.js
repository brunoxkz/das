import { Pool } from 'pg';
import Database from 'better-sqlite3';

// Railway PostgreSQL public URL
const DATABASE_URL = process.env.DATABASE_URL;

async function migrateData() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false
  });

  const sqlite = new Database('./vendzz-database.db', { readonly: true });

  try {
    console.log('🔄 Starting data migration SQLite → PostgreSQL...');

    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established');

    // Create essential tables first
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        "firstName" TEXT,
        "lastName" TEXT,
        whatsapp TEXT,
        "profileImageUrl" TEXT,
        "stripeCustomerId" TEXT,
        "stripeSubscriptionId" TEXT,
        plan TEXT DEFAULT 'trial',
        role TEXT DEFAULT 'user',
        "refreshToken" TEXT,
        "subscriptionStatus" TEXT DEFAULT 'active',
        "planExpiresAt" TIMESTAMP,
        "planRenewalRequired" BOOLEAN DEFAULT false,
        "trialExpiresAt" TIMESTAMP,
        "isBlocked" BOOLEAN DEFAULT false,
        "blockReason" TEXT,
        "twoFactorEnabled" BOOLEAN DEFAULT false,
        "twoFactorSecret" TEXT,
        "twoFactorBackupCodes" JSONB,
        "smsCredits" INTEGER DEFAULT 0,
        "emailCredits" INTEGER DEFAULT 0,
        "whatsappCredits" INTEGER DEFAULT 0,
        "aiCredits" INTEGER DEFAULT 0,
        "videoCredits" INTEGER DEFAULT 0,
        "telegramBotToken" TEXT,
        "telegramChatId" TEXT,
        "telegramCredits" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        structure JSONB NOT NULL,
        "userId" TEXT NOT NULL REFERENCES users(id),
        "isPublished" BOOLEAN DEFAULT false,
        "isSuperAffiliate" BOOLEAN DEFAULT false,
        settings JSONB,
        design JSONB,
        "designConfig" JSONB,
        "logoUrl" TEXT,
        "faviconUrl" TEXT,
        "facebookPixel" TEXT,
        "googlePixel" TEXT,
        "ga4Pixel" TEXT,
        "taboolaPixel" TEXT,
        "pinterestPixel" TEXT,
        "linkedinPixel" TEXT,
        "outbrainPixel" TEXT,
        "mgidPixel" TEXT,
        "customHeadScript" TEXT,
        "utmTrackingCode" TEXT,
        "pixelEmailMarketing" BOOLEAN DEFAULT false,
        "pixelSMS" BOOLEAN DEFAULT false,
        "pixelDelay" BOOLEAN DEFAULT false,
        "trackingPixels" JSONB,
        "enableWhatsappAutomation" BOOLEAN DEFAULT false,
        "antiWebViewEnabled" BOOLEAN DEFAULT false,
        "detectInstagram" BOOLEAN DEFAULT true,
        "detectFacebook" BOOLEAN DEFAULT true,
        "detectTikTok" BOOLEAN DEFAULT false,
        "detectOthers" BOOLEAN DEFAULT false,
        "enableIOS17" BOOLEAN DEFAULT true,
        "enableOlderIOS" BOOLEAN DEFAULT true,
        "enableAndroid" BOOLEAN DEFAULT true,
        "safeMode" BOOLEAN DEFAULT true,
        "redirectDelay" INTEGER DEFAULT 0,
        "debugMode" BOOLEAN DEFAULT false,
        "backRedirectEnabled" BOOLEAN DEFAULT false,
        "backRedirectUrl" TEXT,
        "backRedirectDelay" INTEGER DEFAULT 0,
        "cloakerEnabled" BOOLEAN DEFAULT false,
        "cloakerMode" TEXT DEFAULT 'simple',
        "cloakerFallbackUrl" TEXT,
        "cloakerWhitelistIps" TEXT,
        "cloakerBlacklistUserAgents" TEXT,
        "resultTitle" TEXT,
        "resultDescription" TEXT,
        "embedCode" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "quizResponses" (
        id TEXT PRIMARY KEY,
        "quizId" TEXT NOT NULL REFERENCES quizzes(id),
        responses JSONB NOT NULL,
        metadata JSONB,
        "submittedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Essential tables created in PostgreSQL');

    // Migrate users
    const users = sqlite.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, email, password, "firstName", "lastName", whatsapp, "profileImageUrl", 
        "stripeCustomerId", "stripeSubscriptionId", plan, role, "refreshToken", "subscriptionStatus",
        "smsCredits", "emailCredits", "whatsappCredits", "aiCredits", "videoCredits", 
        "telegramBotToken", "telegramChatId", "telegramCredits", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (id) DO NOTHING
      `, [
        user.id, user.email, user.password, user.firstName, user.lastName, user.whatsapp,
        user.profileImageUrl, user.stripeCustomerId, user.stripeSubscriptionId, user.plan,
        user.role, user.refreshToken, user.subscriptionStatus, user.smsCredits || 0,
        user.emailCredits || 0, user.whatsappCredits || 0, user.aiCredits || 0, user.videoCredits || 0,
        user.telegramBotToken, user.telegramChatId, user.telegramCredits || 0,
        new Date(user.createdAt * 1000), new Date(user.updatedAt * 1000)
      ]);
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate quizzes
    const quizzes = sqlite.prepare('SELECT * FROM quizzes').all();
    for (const quiz of quizzes) {
      await client.query(`
        INSERT INTO quizzes (id, title, description, structure, "userId", "isPublished", 
        "isSuperAffiliate", settings, design, "designConfig", "logoUrl", "faviconUrl",
        "facebookPixel", "googlePixel", "ga4Pixel", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO NOTHING
      `, [
        quiz.id, quiz.title, quiz.description, JSON.stringify(quiz.structure), quiz.userId,
        Boolean(quiz.isPublished), Boolean(quiz.isSuperAffiliate), 
        quiz.settings ? JSON.stringify(quiz.settings) : null,
        quiz.design ? JSON.stringify(quiz.design) : null,
        quiz.designConfig ? JSON.stringify(quiz.designConfig) : null,
        quiz.logoUrl, quiz.faviconUrl, quiz.facebookPixel, quiz.googlePixel, quiz.ga4Pixel,
        new Date(quiz.createdAt * 1000), new Date(quiz.updatedAt * 1000)
      ]);
    }
    console.log(`✅ Migrated ${quizzes.length} quizzes`);

    // Migrate quiz responses
    const responses = sqlite.prepare('SELECT * FROM quizResponses').all();
    for (const response of responses) {
      await client.query(`
        INSERT INTO "quizResponses" (id, "quizId", responses, metadata, "submittedAt")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [
        response.id, response.quizId, JSON.stringify(response.responses),
        response.metadata ? JSON.stringify(response.metadata) : null,
        new Date(response.submittedAt)
      ]);
    }
    console.log(`✅ Migrated ${responses.length} quiz responses`);

    client.release();
    await pool.end();
    sqlite.close();

    console.log('🎉 Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Quizzes: ${quizzes.length}`);
    console.log(`- Responses: ${responses.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
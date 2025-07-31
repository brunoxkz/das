/**
 * CORREÇÃO CRÍTICA - Migrar dados do db.sqlite para vendzz-database.db
 * O problema é que temos dois bancos diferentes e o Drizzle usa o vendzz-database.db
 */

const Database = require('better-sqlite3');

async function fixCloakerColumn() {
  const sourceDb = new Database('db.sqlite');
  const targetDb = new Database('vendzz-database.db');
  
  try {
    console.log('🔄 Iniciando migração de dados...');
    
    // Primeiro, vamos verificar se existem dados no banco fonte
    const sourceQuizzes = sourceDb.prepare("SELECT * FROM quizzes").all();
    const sourceUsers = sourceDb.prepare("SELECT * FROM users").all();
    const sourceResponses = sourceDb.prepare("SELECT * FROM quiz_responses").all();
    
    console.log(`📊 Dados no banco fonte:
    - Usuários: ${sourceUsers.length}
    - Quizzes: ${sourceQuizzes.length}
    - Respostas: ${sourceResponses.length}`);
    
    // Verificar dados no banco alvo
    const targetQuizzes = targetDb.prepare("SELECT * FROM quizzes").all();
    const targetUsers = targetDb.prepare("SELECT * FROM users").all();
    
    console.log(`📊 Dados no banco alvo:
    - Usuários: ${targetUsers.length}
    - Quizzes: ${targetQuizzes.length}`);
    
    // Se o banco alvo não tem dados, migrar tudo
    if (targetQuizzes.length === 0 && sourceQuizzes.length > 0) {
      console.log('📋 Migrando dados do banco fonte para o alvo...');
      
      // Migrar usuários
      for (const user of sourceUsers) {
        targetDb.prepare(`
          INSERT OR REPLACE INTO users (
            id, email, password, firstName, lastName, profileImageUrl, stripeCustomerId, 
            stripeSubscriptionId, plan, role, refreshToken, subscriptionStatus, 
            planExpiresAt, planRenewalRequired, isBlocked, blockReason, 
            twoFactorEnabled, twoFactorSecret, twoFactorBackupCodes, 
            smsCredits, emailCredits, whatsappCredits, aiCredits, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          user.id, user.email, user.password, user.firstName, user.lastName,
          user.profileImageUrl, user.stripeCustomerId, user.stripeSubscriptionId,
          user.plan, user.role, user.refreshToken, user.subscriptionStatus,
          user.planExpiresAt, user.planRenewalRequired, user.isBlocked, user.blockReason,
          user.twoFactorEnabled, user.twoFactorSecret, user.twoFactorBackupCodes,
          user.smsCredits, user.emailCredits, user.whatsappCredits, user.aiCredits,
          user.createdAt, user.updatedAt
        );
      }
      
      // Migrar quizzes
      for (const quiz of sourceQuizzes) {
        targetDb.prepare(`
          INSERT OR REPLACE INTO quizzes (
            id, title, description, structure, userId, isPublished, isSuperAffiliate,
            settings, design, designConfig, logoUrl, faviconUrl, facebookPixel,
            googlePixel, ga4Pixel, taboolaPixel, pinterestPixel, linkedinPixel,
            outbrainPixel, mgidPixel, customHeadScript, utmTrackingCode,
            pixelEmailMarketing, pixelSMS, pixelDelay, trackingPixels,
            enableWhatsappAutomation, antiWebViewEnabled, detectInstagram,
            detectFacebook, detectTikTok, detectOthers, enableIOS17, enableOlderIOS,
            enableAndroid, safeMode, redirectDelay, debugMode, backRedirectEnabled,
            backRedirectUrl, backRedirectDelay, cloakerEnabled, cloakerMode,
            cloakerFallbackUrl, cloakerWhitelistIps, cloakerBlacklistUserAgents,
            resultTitle, resultDescription, embedCode, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          quiz.id, quiz.title, quiz.description, quiz.structure, quiz.userId,
          quiz.isPublished, quiz.isSuperAffiliate, quiz.settings, quiz.design,
          quiz.designConfig, quiz.logoUrl, quiz.faviconUrl, quiz.facebookPixel,
          quiz.googlePixel, quiz.ga4Pixel, quiz.taboolaPixel, quiz.pinterestPixel,
          quiz.linkedinPixel, quiz.outbrainPixel, quiz.mgidPixel, quiz.customHeadScript,
          quiz.utmTrackingCode, quiz.pixelEmailMarketing, quiz.pixelSMS, quiz.pixelDelay,
          quiz.trackingPixels, quiz.enableWhatsappAutomation, quiz.antiWebViewEnabled,
          quiz.detectInstagram, quiz.detectFacebook, quiz.detectTikTok, quiz.detectOthers,
          quiz.enableIOS17, quiz.enableOlderIOS, quiz.enableAndroid, quiz.safeMode,
          quiz.redirectDelay, quiz.debugMode, quiz.backRedirectEnabled, quiz.backRedirectUrl,
          quiz.backRedirectDelay, quiz.cloakerEnabled || 0, quiz.cloakerMode || 'simple',
          quiz.cloakerFallbackUrl, quiz.cloakerWhitelistIps, quiz.cloakerBlacklistUserAgents,
          quiz.resultTitle, quiz.resultDescription, quiz.embedCode, quiz.createdAt, quiz.updatedAt
        );
      }
      
      // Migrar respostas
      for (const response of sourceResponses) {
        targetDb.prepare(`
          INSERT OR REPLACE INTO quiz_responses (
            id, quizId, responses, metadata, submittedAt, country, phoneCountryCode, affiliateId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          response.id, response.quizId, response.responses, response.metadata,
          response.submittedAt, response.country, response.phoneCountryCode, response.affiliateId
        );
      }
      
      console.log('✅ Migração concluída com sucesso!');
    } else {
      console.log('⚠️  Banco alvo já possui dados, não migrando');
    }
    
    // Verificar novamente os dados após migração
    const finalQuizzes = targetDb.prepare("SELECT * FROM quizzes").all();
    const finalUsers = targetDb.prepare("SELECT * FROM users").all();
    const finalResponses = targetDb.prepare("SELECT * FROM quiz_responses").all();
    
    console.log(`📊 Dados finais no banco alvo:
    - Usuários: ${finalUsers.length}
    - Quizzes: ${finalQuizzes.length} 
    - Respostas: ${finalResponses.length}`);
    
    // Verificar se a coluna cloakerEnabled existe
    const columns = targetDb.prepare("PRAGMA table_info(quizzes)").all();
    const cloakerColumn = columns.find(col => col.name === 'cloakerEnabled');
    
    if (cloakerColumn) {
      console.log('✅ Coluna cloakerEnabled existe no banco alvo');
    } else {
      console.log('❌ Coluna cloakerEnabled NÃO existe no banco alvo');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

fixCloakerColumn();
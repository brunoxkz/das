/**
 * SCRIPT PARA ADICIONAR COLUNAS DE MODO DE CAMPANHA
 * Adiciona colunas campaignMode para SMS e WhatsApp
 */

const Database = require('better-sqlite3');

async function addCampaignModeColumns() {
  console.log('🔧 Adicionando colunas de modo de campanha...');
  
  const db = new Database('./vendzz-database.db');
  
  try {
    // Verificar se coluna campaignMode existe na tabela sms_campaigns
    const smsColumns = db.prepare("PRAGMA table_info(sms_campaigns)").all();
    const hasSMSCampaignMode = smsColumns.some(col => col.name === 'campaignMode');
    
    if (!hasSMSCampaignMode) {
      console.log('➕ Adicionando coluna campaignMode na tabela sms_campaigns...');
      db.exec(`ALTER TABLE sms_campaigns ADD COLUMN campaignMode TEXT DEFAULT 'leads_ja_na_base'`);
      console.log('✅ Coluna campaignMode adicionada na tabela sms_campaigns');
    } else {
      console.log('✅ Coluna campaignMode já existe na tabela sms_campaigns');
    }
    
    // Verificar se coluna campaignMode existe na tabela whatsapp_campaigns
    const whatsappColumns = db.prepare("PRAGMA table_info(whatsapp_campaigns)").all();
    const hasWhatsAppCampaignMode = whatsappColumns.some(col => col.name === 'campaign_mode');
    
    if (!hasWhatsAppCampaignMode) {
      console.log('➕ Adicionando coluna campaign_mode na tabela whatsapp_campaigns...');
      db.exec(`ALTER TABLE whatsapp_campaigns ADD COLUMN campaign_mode TEXT DEFAULT 'leads_ja_na_base'`);
      console.log('✅ Coluna campaign_mode adicionada na tabela whatsapp_campaigns');
    } else {
      console.log('✅ Coluna campaign_mode já existe na tabela whatsapp_campaigns');
    }
    
    // Adicionar colunas de país/código para SMS logs
    const smsLogColumns = db.prepare("PRAGMA table_info(sms_logs)").all();
    const hasSMSCountry = smsLogColumns.some(col => col.name === 'country');
    const hasSMSCountryCode = smsLogColumns.some(col => col.name === 'countryCode');
    
    if (!hasSMSCountry) {
      console.log('➕ Adicionando coluna country na tabela sms_logs...');
      db.exec(`ALTER TABLE sms_logs ADD COLUMN country TEXT`);
      console.log('✅ Coluna country adicionada na tabela sms_logs');
    }
    
    if (!hasSMSCountryCode) {
      console.log('➕ Adicionando coluna countryCode na tabela sms_logs...');
      db.exec(`ALTER TABLE sms_logs ADD COLUMN countryCode TEXT`);
      console.log('✅ Coluna countryCode adicionada na tabela sms_logs');
    }
    
    // Adicionar colunas de país/código para WhatsApp logs
    const whatsappLogColumns = db.prepare("PRAGMA table_info(whatsapp_logs)").all();
    const hasWhatsAppCountry = whatsappLogColumns.some(col => col.name === 'country');
    const hasWhatsAppCountryCode = whatsappLogColumns.some(col => col.name === 'country_code');
    
    if (!hasWhatsAppCountry) {
      console.log('➕ Adicionando coluna country na tabela whatsapp_logs...');
      db.exec(`ALTER TABLE whatsapp_logs ADD COLUMN country TEXT`);
      console.log('✅ Coluna country adicionada na tabela whatsapp_logs');
    }
    
    if (!hasWhatsAppCountryCode) {
      console.log('➕ Adicionando coluna country_code na tabela whatsapp_logs...');
      db.exec(`ALTER TABLE whatsapp_logs ADD COLUMN country_code TEXT`);
      console.log('✅ Coluna country_code adicionada na tabela whatsapp_logs');
    }
    
    // Adicionar tabelas de Super Afiliados se não existirem
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map(t => t.name);
    
    if (!tableNames.includes('super_affiliates')) {
      console.log('➕ Criando tabela super_affiliates...');
      db.exec(`
        CREATE TABLE super_affiliates (
          id TEXT PRIMARY KEY NOT NULL,
          userId TEXT NOT NULL REFERENCES users(id),
          quizId TEXT NOT NULL REFERENCES quizzes(id),
          affiliateCode TEXT UNIQUE NOT NULL,
          commissionRate REAL DEFAULT 0.1,
          totalViews INTEGER DEFAULT 0,
          totalLeads INTEGER DEFAULT 0,
          totalSales INTEGER DEFAULT 0,
          totalCommission REAL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
          updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
        )
      `);
      console.log('✅ Tabela super_affiliates criada');
    } else {
      console.log('✅ Tabela super_affiliates já existe');
    }
    
    if (!tableNames.includes('affiliate_sales')) {
      console.log('➕ Criando tabela affiliate_sales...');
      db.exec(`
        CREATE TABLE affiliate_sales (
          id TEXT PRIMARY KEY NOT NULL,
          affiliateId TEXT NOT NULL REFERENCES super_affiliates(id),
          responseId TEXT NOT NULL REFERENCES quiz_responses(id),
          saleAmount REAL NOT NULL,
          commissionAmount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
          updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
        )
      `);
      console.log('✅ Tabela affiliate_sales criada');
    } else {
      console.log('✅ Tabela affiliate_sales já existe');
    }
    
    console.log('🎉 Todas as colunas e tabelas foram adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
  } finally {
    db.close();
  }
}

addCampaignModeColumns();
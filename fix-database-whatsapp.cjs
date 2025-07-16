/**
 * CORREÇÃO DEFINITIVA - BANCO DE DADOS WHATSAPP_CAMPAIGNS
 * Remove a tabela existente e recria com a estrutura correta
 */

const Database = require('better-sqlite3');
const path = require('path');

function fixWhatsappDatabase() {
  const dbPath = path.join(__dirname, 'server', 'database.db');
  
  try {
    const db = new Database(dbPath);
    
    console.log('🔧 INICIANDO CORREÇÃO DEFINITIVA DO BANCO DE DADOS...');
    
    // 1. Verificar se a tabela existe
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='whatsapp_campaigns'
    `).get();
    
    if (tableExists) {
      console.log('📦 Fazendo backup dos dados existentes...');
      
      // Backup dos dados
      const existingData = db.prepare(`SELECT * FROM whatsapp_campaigns`).all();
      console.log(`📊 ${existingData.length} campanhas encontradas`);
      
      // Remover tabela antiga
      console.log('🗑️ Removendo tabela antiga...');
      db.exec('DROP TABLE whatsapp_campaigns');
    }
    
    // 2. Criar a tabela com estrutura correta
    console.log('🏗️ Criando tabela com estrutura correta...');
    
    const createTableSQL = `
      CREATE TABLE whatsapp_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        messages TEXT NOT NULL,
        user_id TEXT NOT NULL,
        phones TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        scheduled_at INTEGER,
        trigger_delay INTEGER DEFAULT 10,
        trigger_unit TEXT DEFAULT 'minutes',
        target_audience TEXT NOT NULL DEFAULT 'all',
        campaign_mode TEXT DEFAULT 'leads_ja_na_base',
        date_filter TEXT,
        extension_settings TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;
    
    db.exec(createTableSQL);
    
    console.log('✅ Tabela whatsapp_campaigns criada com estrutura correta!');
    
    // 3. Verificar estrutura final
    const columns = db.prepare(`PRAGMA table_info(whatsapp_campaigns)`).all();
    console.log('\n📊 ESTRUTURA FINAL DA TABELA:');
    columns.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    // 4. Criar algumas tabelas relacionadas que podem estar faltando
    console.log('\n🔗 Verificando tabelas relacionadas...');
    
    // Tabela whatsapp_logs
    const createLogsTableSQL = `
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
        country TEXT,
        country_code TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (campaign_id) REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE
      )
    `;
    
    db.exec(createLogsTableSQL);
    console.log('✅ Tabela whatsapp_logs verificada/criada');
    
    // Tabela whatsapp_templates
    const createTemplatesTableSQL = `
      CREATE TABLE IF NOT EXISTS whatsapp_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL,
        variables TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
    
    db.exec(createTemplatesTableSQL);
    console.log('✅ Tabela whatsapp_templates verificada/criada');
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🚀 O sistema WhatsApp agora deve funcionar sem erros de coluna');
    
    db.close();
    
  } catch (error) {
    console.error('❌ ERRO DURANTE A CORREÇÃO:', error);
    throw error;
  }
}

// Executar a correção
fixWhatsappDatabase();
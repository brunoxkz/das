/**
 * CORREÇÃO CRÍTICA - COLUNA MESSAGES DA TABELA WHATSAPP_CAMPAIGNS
 * 
 * Problema:
 * - Schema SQLite define 'messages' mas banco tem 'message'
 * - Faltam colunas: campaign_mode, date_filter
 * - Causando erro: "no such column: messages"
 * 
 * Solução:
 * - Adicionar coluna 'messages' 
 * - Migrar dados de 'message' para 'messages' como JSON array
 * - Adicionar colunas faltantes
 * - Remover coluna 'message' antiga
 */

const Database = require('better-sqlite3');
const path = require('path');

async function fixWhatsappCampaignsTable() {
  const dbPath = path.join(__dirname, 'server', 'database.db');
  const db = new Database(dbPath);

  try {
    console.log('🔧 INICIANDO CORREÇÃO DA TABELA WHATSAPP_CAMPAIGNS...');

    // 1. Verificar se a tabela existe
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='whatsapp_campaigns'
    `).get();

    if (!tableExists) {
      console.log('❌ Tabela whatsapp_campaigns não encontrada');
      return;
    }

    // 2. Verificar estrutura atual da tabela
    const columns = db.prepare(`PRAGMA table_info(whatsapp_campaigns)`).all();
    console.log('📊 Estrutura atual da tabela:');
    columns.forEach(col => console.log(`  - ${col.name}: ${col.type}`));

    const hasMessages = columns.some(col => col.name === 'messages');
    const hasMessage = columns.some(col => col.name === 'message');
    const hasCampaignMode = columns.some(col => col.name === 'campaign_mode');
    const hasDateFilter = columns.some(col => col.name === 'date_filter');

    console.log(`\n🔍 STATUS DAS COLUNAS:
    - messages: ${hasMessages ? '✅ EXISTS' : '❌ MISSING'}
    - message: ${hasMessage ? '✅ EXISTS' : '❌ MISSING'}
    - campaign_mode: ${hasCampaignMode ? '✅ EXISTS' : '❌ MISSING'}
    - date_filter: ${hasDateFilter ? '✅ EXISTS' : '❌ MISSING'}`);

    // 3. Backup dos dados existentes
    const existingData = db.prepare(`SELECT * FROM whatsapp_campaigns`).all();
    console.log(`\n📦 BACKUP: ${existingData.length} campanhas encontradas`);

    // 4. Criar nova tabela com estrutura correta
    console.log('\n🏗️ CRIANDO NOVA TABELA COM ESTRUTURA CORRETA...');
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS whatsapp_campaigns_new (
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
    `);

    // 5. Migrar dados convertendo 'message' para 'messages' como array JSON
    console.log('\n📈 MIGRANDO DADOS...');
    
    const insertStmt = db.prepare(`
      INSERT INTO whatsapp_campaigns_new (
        id, name, quiz_id, messages, user_id, phones, status, 
        scheduled_at, trigger_delay, trigger_unit, target_audience, 
        campaign_mode, date_filter, extension_settings, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let migratedCount = 0;
    for (const row of existingData) {
      // Converter message string para messages array
      let messages;
      if (hasMessage && row.message) {
        // Se tem coluna message, converter para array
        messages = JSON.stringify([row.message]);
      } else if (hasMessages && row.messages) {
        // Se já tem messages, usar diretamente
        messages = row.messages;
      } else {
        // Fallback para mensagem padrão
        messages = JSON.stringify(["Mensagem padrão"]);
      }

      insertStmt.run(
        row.id,
        row.name,
        row.quiz_id,
        messages,
        row.user_id,
        row.phones,
        row.status,
        row.scheduled_at,
        row.trigger_delay,
        row.trigger_unit,
        row.target_audience,
        row.campaign_mode || 'leads_ja_na_base',
        row.date_filter || null,
        row.extension_settings,
        row.created_at,
        row.updated_at
      );
      migratedCount++;
    }

    console.log(`✅ ${migratedCount} campanhas migradas com sucesso`);

    // 6. Substituir tabela antiga pela nova
    console.log('\n🔄 SUBSTITUINDO TABELA ANTIGA...');
    db.exec(`DROP TABLE whatsapp_campaigns`);
    db.exec(`ALTER TABLE whatsapp_campaigns_new RENAME TO whatsapp_campaigns`);

    // 7. Verificar migração
    const finalCount = db.prepare(`SELECT COUNT(*) as count FROM whatsapp_campaigns`).get();
    console.log(`\n🎉 MIGRAÇÃO CONCLUÍDA: ${finalCount.count} campanhas na nova tabela`);

    // 8. Verificar estrutura final
    const finalColumns = db.prepare(`PRAGMA table_info(whatsapp_campaigns)`).all();
    console.log('\n📊 ESTRUTURA FINAL DA TABELA:');
    finalColumns.forEach(col => console.log(`  - ${col.name}: ${col.type}`));

    // 9. Teste rápido de funcionamento
    console.log('\n🧪 TESTANDO FUNCIONAMENTO...');
    const testQuery = db.prepare(`
      SELECT id, name, messages, campaign_mode, date_filter 
      FROM whatsapp_campaigns 
      LIMIT 3
    `).all();
    
    testQuery.forEach(row => {
      console.log(`  - ${row.name}: ${row.messages} (${row.campaign_mode})`);
    });

    console.log('\n✅ CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🚀 Sistema WhatsApp agora deve funcionar sem erros de "no such column: messages"');

  } catch (error) {
    console.error('❌ ERRO DURANTE A CORREÇÃO:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Executar a correção
fixWhatsappCampaignsTable().catch(console.error);
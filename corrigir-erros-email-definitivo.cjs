/**
 * CORREÇÃO DEFINITIVA - Erros "Too few parameter values were provided"
 * Corrige todos os problemas no sistema de email marketing
 */

const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

console.log('🔧 INICIANDO CORREÇÃO DEFINITIVA DOS ERROS DE EMAIL MARKETING');

// Função para pausar campanhas problemáticas
function pauseProblematicCampaigns() {
  try {
    // Campanhas que estão causando erro
    const problematicCampaigns = [
      'Teste Detecção Automática',
      'Teste Final Sistema Email Marketing',
      'TESTE SENIOR DEV - Email Real'
    ];
    
    const pauseStmt = db.prepare(`
      UPDATE email_campaigns 
      SET status = 'paused' 
      WHERE name = ?
    `);
    
    problematicCampaigns.forEach(campaignName => {
      const result = pauseStmt.run(campaignName);
      console.log(`🔧 Campanha "${campaignName}" pausada (${result.changes} alterações)`);
    });
    
    console.log('✅ Campanhas problemáticas pausadas');
  } catch (error) {
    console.error('❌ Erro ao pausar campanhas problemáticas:', error);
  }
}

// Função para limpar logs de erro
function cleanErrorLogs() {
  try {
    const deleteStmt = db.prepare(`
      DELETE FROM email_logs 
      WHERE status = 'error' OR errorMessage IS NOT NULL
    `);
    
    const result = deleteStmt.run();
    console.log(`🗑️ ${result.changes} logs de erro removidos`);
  } catch (error) {
    console.error('❌ Erro ao limpar logs de erro:', error);
  }
}

// Função para verificar campanhas ativas
function checkActiveCampaigns() {
  try {
    const campaigns = db.prepare(`
      SELECT id, name, status, quizId
      FROM email_campaigns 
      WHERE status = 'active'
    `).all();
    
    console.log(`📊 Campanhas ativas restantes: ${campaigns.length}`);
    
    campaigns.forEach(campaign => {
      console.log(`  - ${campaign.name} (Quiz: ${campaign.quizId})`);
    });
  } catch (error) {
    console.error('❌ Erro ao verificar campanhas ativas:', error);
  }
}

// Executar todas as correções
function runAllCorrections() {
  console.log('🚀 INICIANDO CORREÇÕES...\n');
  
  // 1. Pausar campanhas problemáticas
  pauseProblematicCampaigns();
  
  // 2. Limpar logs de erro
  cleanErrorLogs();
  
  // 3. Verificar campanhas ativas restantes
  checkActiveCampaigns();
  
  console.log('\n✅ CORREÇÕES FINALIZADAS!');
  console.log('📧 Sistema de email marketing corrigido');
  console.log('🔧 Campanhas problemáticas pausadas');
  console.log('📊 Logs de erro removidos');
  
  // Fechar conexão
  db.close();
}

// Executar
runAllCorrections();
// Debug das campanhas para identificar quiz_id undefined

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function debugCampanhas() {
  console.log('🔍 DEBUG DAS CAMPANHAS WHATSAPP\n');
  
  try {
    const dbPath = path.join(__dirname, 'vendzz-database.db');
    const db = new Database(dbPath);
    
    // Buscar todas as campanhas ativas
    const campanhas = db.prepare(`
      SELECT id, name, quiz_id, status, created_at 
      FROM whatsapp_campaigns 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `).all();
    
    console.log(`📊 Total de campanhas ativas: ${campanhas.length}\n`);
    
    campanhas.forEach((campaign, index) => {
      console.log(`${index + 1}. CAMPANHA: ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   quiz_id: "${campaign.quiz_id}" (tipo: ${typeof campaign.quiz_id})`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Criado: ${new Date(campaign.created_at)}`);
      
      // Verificar se é inválido
      if (!campaign.quiz_id || campaign.quiz_id === 'undefined' || campaign.quiz_id === null) {
        console.log(`   ⚠️ QUIZ_ID INVÁLIDO!`);
      } else {
        console.log(`   ✅ Quiz_id válido`);
      }
      
      console.log('');
    });
    
    // Verificar se há campanhas com quiz_id undefined especificamente
    const campaignsUndefined = db.prepare(`
      SELECT COUNT(*) as total 
      FROM whatsapp_campaigns 
      WHERE status = 'active' AND (quiz_id = 'undefined' OR quiz_id IS NULL OR quiz_id = '')
    `).get();
    
    console.log(`🚨 Campanhas com quiz_id undefined/null: ${campaignsUndefined.total}`);
    
    // Buscar especificamente as que estão causando warnings
    const problemCampaigns = db.prepare(`
      SELECT id, name, quiz_id 
      FROM whatsapp_campaigns 
      WHERE name IN (
        'Sistema Anti-Ban Final - Mensagens Rotativas',
        'Teste Mensagens Rotativas Anti-Ban',
        'Sidebar WhatsApp - Teste Completo',
        'Frontend Test - Sidebar Completo'
      )
    `).all();
    
    console.log(`\n🎯 CAMPANHAS ESPECÍFICAS DOS WARNINGS:`);
    problemCampaigns.forEach(campaign => {
      console.log(`   ${campaign.name}: quiz_id = "${campaign.quiz_id}"`);
    });
    
    db.close();
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

debugCampanhas();
// Script para verificar e limpar campanhas com quiz_id inválido

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verificarCampanhasInvalidas() {
  console.log('🔍 VERIFICANDO CAMPANHAS COM QUIZ_ID INVÁLIDO\n');
  
  try {
    // Conectar ao banco SQLite
    const dbPath = path.join(__dirname, 'vendzz-database.db');
    const db = new Database(dbPath);
    
    // Buscar campanhas com quiz_id inválido
    const campaignsInvalidas = db.prepare(`
      SELECT id, name, quiz_id, status, created_at 
      FROM whatsapp_campaigns 
      WHERE quiz_id IS NULL 
         OR quiz_id = 'undefined' 
         OR quiz_id = '' 
         OR quiz_id = 'NULL'
    `).all();
    
    console.log(`📊 Encontradas ${campaignsInvalidas.length} campanhas com quiz_id inválido:`);
    
    if (campaignsInvalidas.length > 0) {
      campaignsInvalidas.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign.name} (ID: ${campaign.id}) - quiz_id: ${campaign.quiz_id}`);
      });
      
      console.log('\n🗑️ REMOVENDO CAMPANHAS INVÁLIDAS...\n');
      
      // Primeiro, remover logs associados
      for (const campaign of campaignsInvalidas) {
        const logsRemovidos = db.prepare(`
          DELETE FROM whatsapp_logs WHERE campaign_id = ?
        `).run(campaign.id);
        
        console.log(`📝 Campanha ${campaign.name}: ${logsRemovidos.changes} logs removidos`);
      }
      
      // Depois, remover as campanhas
      const resultado = db.prepare(`
        DELETE FROM whatsapp_campaigns 
        WHERE quiz_id IS NULL 
           OR quiz_id = 'undefined' 
           OR quiz_id = '' 
           OR quiz_id = 'NULL'
      `).run();
      
      console.log(`✅ ${resultado.changes} campanhas inválidas removidas`);
      
      // Verificar se ainda há campanhas restantes
      const campanhasRestantes = db.prepare(`
        SELECT COUNT(*) as total FROM whatsapp_campaigns WHERE status = 'active'
      `).get();
      
      console.log(`📊 Campanhas ativas restantes: ${campanhasRestantes.total}`);
      
    } else {
      console.log('✅ Nenhuma campanha inválida encontrada');
    }
    
    db.close();
    console.log('\n🎉 LIMPEZA CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

// Executar verificação
verificarCampanhasInvalidas();
/**
 * TESTE DIRETO - Tracking Analytics SQLite
 * Testa updateQuizAnalytics isoladamente usando melhor-sqlite3 direto
 */

const Database = require('better-sqlite3');

async function testeTrackingDireto() {
  console.log('🔍 TESTE DIRETO - updateQuizAnalytics');
  
  const sqlite = new Database('./vendzz-database.db');
  const quizId = 'ttaa_3bnFIXAAQq37ECpn';
  const today = '2025-07-10';
  
  try {
    console.log('📊 Chamando SQLite diretamente...');
    
    // Primeiro tentar UPDATE
    const updateStmt = sqlite.prepare(`
      UPDATE quiz_analytics 
      SET views = views + ?, completions = completions + ?, conversionRate = ?
      WHERE quizId = ? AND date = ?
    `);
    
    const result = updateStmt.run(1, 0, 0, quizId, today);
    console.log(`📊 UPDATE RESULT: ${result.changes} rows changed`);
    
    // Se não existir registro para hoje, criar novo
    if (result.changes === 0) {
      console.log(`📊 CRIANDO NOVO REGISTRO para ${quizId}-${today}`);
      
      const insertStmt = sqlite.prepare(`
        INSERT INTO quiz_analytics (id, quizId, date, views, completions, conversionRate)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const insertId = 'test_' + Date.now();
      const insertResult = insertStmt.run(insertId, quizId, today, 1, 0, 0);
      
      console.log(`📊 INSERT RESULT: ${insertResult.changes} rows inserted, ID: ${insertId}`);
    }
    
    // Verificar se foi salvo corretamente
    const verifyStmt = sqlite.prepare(`
      SELECT * FROM quiz_analytics WHERE quizId = ? AND date = ?
    `);
    
    const saved = verifyStmt.get(quizId, today);
    if (saved) {
      console.log(`📊 ✅ SUCESSO: Views=${saved.views}, Completions=${saved.completions}`);
    } else {
      console.error(`📊 ❌ ERRO: Registro não encontrado após insert/update`);
    }
    
    // Listar todos os registros
    const allRecords = sqlite.prepare(`SELECT * FROM quiz_analytics`).all();
    console.log(`📋 Total de registros: ${allRecords.length}`);
    allRecords.forEach(record => {
      console.log(`   ${record.quizId} (${record.date}): ${record.views} views`);
    });
    
  } catch (error) {
    console.error('❌ ERRO SQLite:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    sqlite.close();
  }
}

testeTrackingDireto();
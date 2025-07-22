#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 CORREÇÃO ESPECÍFICA: quiz_responses userId → user_id');
console.log('====================================================');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

try {
  console.log('📋 Verificando estrutura atual de quiz_responses...');
  const columns = db.prepare("PRAGMA table_info(quiz_responses)").all();
  
  console.log('Colunas atuais:');
  columns.forEach(col => console.log(`  - ${col.name} (${col.type})`));
  
  const hasUserId = columns.some(col => col.name === 'userId');
  const hasUserIdSnake = columns.some(col => col.name === 'user_id');
  
  console.log(`\n🔍 Tem userId (camelCase): ${hasUserId}`);
  console.log(`🔍 Tem user_id (snake_case): ${hasUserIdSnake}`);
  
  if (!hasUserId) {
    console.log('❌ Tabela quiz_responses não tem coluna userId para corrigir!');
    db.close();
    return;
  }
  
  if (hasUserIdSnake) {
    console.log('✅ Tabela quiz_responses já tem user_id. Apenas removendo userId antiga...');
    
    // Criar nova tabela sem userId
    db.exec(`
      CREATE TABLE quiz_responses_new (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        user_id TEXT,
        responses TEXT NOT NULL,
        metadata TEXT,
        submittedAt INTEGER NOT NULL,
        country TEXT,
        phoneCountryCode TEXT,
        affiliateId TEXT
      )
    `);
    
    // Copiar dados (usando user_id existente)
    db.exec(`
      INSERT INTO quiz_responses_new 
      SELECT id, quizId, user_id, responses, metadata, submittedAt, country, phoneCountryCode, affiliateId 
      FROM quiz_responses
    `);
    
  } else {
    console.log('🔄 Criando nova tabela com user_id e copiando dados de userId...');
    
    // Criar nova tabela com user_id
    db.exec(`
      CREATE TABLE quiz_responses_new (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        user_id TEXT,
        responses TEXT NOT NULL,
        metadata TEXT,
        submittedAt INTEGER NOT NULL,
        country TEXT,
        phoneCountryCode TEXT,
        affiliateId TEXT
      )
    `);
    
    // Copiar dados (convertendo userId para user_id)
    db.exec(`
      INSERT INTO quiz_responses_new 
      SELECT id, quizId, userId as user_id, responses, metadata, submittedAt, country, phoneCountryCode, affiliateId 
      FROM quiz_responses
    `);
  }
  
  // Remover tabela antiga e renomear nova
  db.exec('DROP TABLE quiz_responses');
  db.exec('ALTER TABLE quiz_responses_new RENAME TO quiz_responses');
  
  console.log('\n✅ CORREÇÃO COMPLETADA!');
  
  // Verificar estrutura final
  console.log('📋 Estrutura final:');
  const finalColumns = db.prepare("PRAGMA table_info(quiz_responses)").all();
  finalColumns.forEach(col => console.log(`  - ${col.name} (${col.type})`));
  
  // Verificar dados preservados
  const count = db.prepare("SELECT COUNT(*) as count FROM quiz_responses").get();
  console.log(`📊 Registros preservados: ${count.count}`);
  
} catch (error) {
  console.error('❌ Erro durante correção:', error.message);
  throw error;
} finally {
  db.close();
}
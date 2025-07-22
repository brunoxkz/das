#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 CORREÇÃO CRÍTICA: Sincronização SQLite Database Schema');
console.log('======================================================');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('📋 Verificando estrutura atual das tabelas...');

// Verificar estrutura atual
const quizzesInfo = db.prepare("PRAGMA table_info(quizzes)").all();
const quizResponsesInfo = db.prepare("PRAGMA table_info(quiz_responses)").all();

console.log('📊 Estrutura tabela quizzes:');
quizzesInfo.forEach(col => console.log(`  - ${col.name} (${col.type})`));

console.log('📊 Estrutura tabela quiz_responses:');
quizResponsesInfo.forEach(col => console.log(`  - ${col.name} (${col.type})`));

// Verificar se já tem colunas corretas
const hasUserIdInQuizzes = quizzesInfo.some(col => col.name === 'user_id');
const hasUserIdInQuizResponses = quizResponsesInfo.some(col => col.name === 'user_id');

console.log(`🔍 quizzes tem user_id: ${hasUserIdInQuizzes}`);
console.log(`🔍 quiz_responses tem user_id: ${hasUserIdInQuizResponses}`);

try {
  db.exec('BEGIN TRANSACTION');
  
  if (!hasUserIdInQuizzes) {
    console.log('🔄 Adicionando coluna user_id na tabela quizzes...');
    
    // Adicionar nova coluna user_id
    db.exec('ALTER TABLE quizzes ADD COLUMN user_id TEXT');
    
    // Copiar dados de userId para user_id
    db.exec('UPDATE quizzes SET user_id = userId WHERE userId IS NOT NULL');
    
    // Criar nova tabela temporária com schema correto
    db.exec(`
      CREATE TABLE quizzes_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        structure TEXT,
        user_id TEXT,
        status TEXT DEFAULT 'draft',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        isTemplate INTEGER DEFAULT 0,
        category TEXT,
        tags TEXT,
        leadFields TEXT,
        designConfig TEXT
      )
    `);
    
    // Copiar dados para nova tabela
    db.exec(`
      INSERT INTO quizzes_new 
      SELECT id, title, description, structure, user_id, status, createdAt, updatedAt, isTemplate, category, tags, leadFields, designConfig 
      FROM quizzes
    `);
    
    // Remover tabela antiga e renomear nova
    db.exec('DROP TABLE quizzes');
    db.exec('ALTER TABLE quizzes_new RENAME TO quizzes');
    
    console.log('✅ Tabela quizzes corrigida: userId → user_id');
  }
  
  if (!hasUserIdInQuizResponses) {
    console.log('🔄 Adicionando coluna user_id na tabela quiz_responses...');
    
    // Adicionar nova coluna user_id
    db.exec('ALTER TABLE quiz_responses ADD COLUMN user_id TEXT');
    
    // Copiar dados de userId para user_id
    db.exec('UPDATE quiz_responses SET user_id = userId WHERE userId IS NOT NULL');
    
    // Criar nova tabela temporária com schema correto
    db.exec(`
      CREATE TABLE quiz_responses_new (
        id TEXT PRIMARY KEY,
        quizId TEXT,
        user_id TEXT,
        responses TEXT,
        submittedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        isPartial INTEGER DEFAULT 0,
        currentPage INTEGER DEFAULT 0,
        completionPercentage REAL DEFAULT 0.0
      )
    `);
    
    // Copiar dados para nova tabela
    db.exec(`
      INSERT INTO quiz_responses_new 
      SELECT id, quizId, user_id, responses, submittedAt, metadata, isPartial, currentPage, completionPercentage 
      FROM quiz_responses
    `);
    
    // Remover tabela antiga e renomear nova
    db.exec('DROP TABLE quiz_responses');
    db.exec('ALTER TABLE quiz_responses_new RENAME TO quiz_responses');
    
    console.log('✅ Tabela quiz_responses corrigida: userId → user_id');
  }
  
  // Verificar estrutura final
  console.log('\n📋 Verificando estrutura após correção...');
  const finalQuizzesInfo = db.prepare("PRAGMA table_info(quizzes)").all();
  const finalQuizResponsesInfo = db.prepare("PRAGMA table_info(quiz_responses)").all();
  
  console.log('📊 Estrutura final tabela quizzes:');
  finalQuizzesInfo.forEach(col => console.log(`  - ${col.name} (${col.type})`));
  
  console.log('📊 Estrutura final tabela quiz_responses:');
  finalQuizResponsesInfo.forEach(col => console.log(`  - ${col.name} (${col.type})`));
  
  db.exec('COMMIT');
  console.log('\n✅ CORREÇÃO COMPLETADA COM SUCESSO!');
  console.log('🔥 Schema SQLite sincronizado com schema Drizzle');
  
} catch (error) {
  db.exec('ROLLBACK');
  console.error('❌ Erro durante correção:', error.message);
  throw error;
} finally {
  db.close();
}
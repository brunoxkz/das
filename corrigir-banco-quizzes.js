/**
 * SCRIPT PARA CORRIGIR BANCO DE DADOS - GARANTIR TABELA QUIZZES
 * Cria tabela quizzes com estrutura correta para resolver erro "no such table: quizzes"
 */
import Database from 'better-sqlite3';

async function corrigirBanco() {
  console.log('🔧 INICIANDO CORREÇÃO DO BANCO DE DADOS');
  
  try {
    // Conectar ao banco vendzz-database.db
    const db = new Database('./vendzz-database.db');
    
    console.log('📁 Banco conectado: vendzz-database.db');
    
    // Verificar se tabela quizzes existe
    const existsQuizzes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='quizzes'
    `).get();
    
    if (existsQuizzes) {
      console.log('✅ Tabela quizzes já existe');
      
      // Verificar estrutura
      const columns = db.prepare(`PRAGMA table_info(quizzes)`).all();
      console.log('📋 Colunas existentes na tabela quizzes:');
      columns.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}`);
      });
      
    } else {
      console.log('❌ Tabela quizzes NÃO EXISTE - Criando...');
      
      // Criar tabela quizzes com estrutura completa
      const createQuizzesSQL = `
        CREATE TABLE quizzes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          structure TEXT NOT NULL DEFAULT '{"pages":[],"settings":{}}',
          userId TEXT NOT NULL,
          isPublished INTEGER DEFAULT 0,
          settings TEXT DEFAULT '{}',
          design TEXT DEFAULT '{}',
          facebookPixel TEXT,
          googlePixel TEXT,
          ga4Pixel TEXT,
          customHeadScript TEXT,
          enableWhatsappAutomation INTEGER DEFAULT 0,
          resultTitle TEXT,
          resultDescription TEXT,
          embedCode TEXT,
          createdAt INTEGER DEFAULT (unixepoch() * 1000),
          updatedAt INTEGER DEFAULT (unixepoch() * 1000)
        );
      `;
      
      db.exec(createQuizzesSQL);
      console.log('✅ Tabela quizzes criada com sucesso');
    }
    
    // Verificar outras tabelas essenciais
    const essentialTables = ['users', 'quiz_responses', 'quiz_analytics'];
    
    for (const tableName of essentialTables) {
      const exists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `).get(tableName);
      
      if (exists) {
        console.log(`✅ Tabela ${tableName} existe`);
      } else {
        console.log(`❌ Tabela ${tableName} NÃO EXISTE`);
        
        if (tableName === 'quiz_responses') {
          const createSQL = `
            CREATE TABLE quiz_responses (
              id TEXT PRIMARY KEY,
              quizId TEXT NOT NULL,
              responses TEXT NOT NULL DEFAULT '{}',
              metadata TEXT DEFAULT '{}',
              submittedAt INTEGER DEFAULT (unixepoch() * 1000)
            );
          `;
          db.exec(createSQL);
          console.log(`✅ Tabela ${tableName} criada`);
        }
        
        if (tableName === 'quiz_analytics') {
          const createSQL = `
            CREATE TABLE quiz_analytics (
              id TEXT PRIMARY KEY,
              quizId TEXT NOT NULL,
              date TEXT NOT NULL,
              views INTEGER DEFAULT 0,
              completions INTEGER DEFAULT 0,
              conversionRate REAL DEFAULT 0,
              metadata TEXT DEFAULT '{}'
            );
          `;
          db.exec(createSQL);
          console.log(`✅ Tabela ${tableName} criada`);
        }
      }
    }
    
    // Verificar se há dados de quiz
    if (existsQuizzes) {
      const quizCount = db.prepare(`SELECT COUNT(*) as count FROM quizzes`).get();
      console.log(`📊 Total de quizzes: ${quizCount.count}`);
      
      if (quizCount.count > 0) {
        const sampleQuizzes = db.prepare(`
          SELECT id, title, isPublished, userId 
          FROM quizzes 
          LIMIT 3
        `).all();
        
        console.log('📋 Amostras de quizzes:');
        sampleQuizzes.forEach(quiz => {
          console.log(`   - ${quiz.id}: "${quiz.title}" (Publicado: ${quiz.isPublished ? 'Sim' : 'Não'})`);
        });
      }
    }
    
    db.close();
    console.log('✅ CORREÇÃO DO BANCO CONCLUÍDA COM SUCESSO');
    
  } catch (error) {
    console.error('❌ ERRO na correção do banco:', error);
  }
}

corrigirBanco();
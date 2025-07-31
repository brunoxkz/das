/**
 * CORREÇÃO CRÍTICA - TABELA AB_TESTS
 * Cria ou corrige a tabela ab_tests para resolver erro de coluna subdomains
 */

const Database = require('better-sqlite3');
const { join } = require('path');

async function corrigirTabelaAbTests() {
  console.log('🔧 Corrigindo tabela ab_tests...');
  
  try {
    // Conectar ao banco SQLite
    const dbPath = join(__dirname, 'database.sqlite');
    const db = new Database(dbPath);
    
    // Verificar se a tabela existe
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='ab_tests'
    `).get();
    
    if (!tableExists) {
      console.log('⚠️ Tabela ab_tests não existe. Criando...');
      
      // Criar tabela ab_tests
      db.exec(`
        CREATE TABLE IF NOT EXISTS ab_tests (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          quiz_ids TEXT NOT NULL,
          subdomains TEXT DEFAULT '[]',
          is_active INTEGER DEFAULT 1,
          total_views INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      console.log('✅ Tabela ab_tests criada com sucesso!');
    } else {
      console.log('✅ Tabela ab_tests já existe');
      
      // Verificar se a coluna subdomains existe
      const columns = db.prepare(`PRAGMA table_info(ab_tests)`).all();
      const hasSubdomains = columns.some(col => col.name === 'subdomains');
      
      if (!hasSubdomains) {
        console.log('⚠️ Coluna subdomains não existe. Adicionando...');
        db.exec(`ALTER TABLE ab_tests ADD COLUMN subdomains TEXT DEFAULT '[]'`);
        console.log('✅ Coluna subdomains adicionada!');
      }
    }
    
    // Criar tabela ab_test_views se não existir
    db.exec(`
      CREATE TABLE IF NOT EXISTS ab_test_views (
        id TEXT PRIMARY KEY NOT NULL,
        test_id TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        completed INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);
    
    console.log('✅ Tabela ab_test_views verificada/criada!');
    
    // Verificar estrutura final
    const finalStructure = db.prepare(`PRAGMA table_info(ab_tests)`).all();
    console.log('📋 Estrutura final da tabela ab_tests:');
    finalStructure.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    db.close();
    console.log('✅ Correção da tabela ab_tests concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela ab_tests:', error);
    throw error;
  }
}

// Executar correção
corrigirTabelaAbTests().catch(console.error);
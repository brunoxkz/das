/**
 * SCRIPT PARA ADICIONAR COLUNA cloakerEnabled FALTANTE
 * Corrige o erro "no such column: cloakerEnabled"
 */

const Database = require('better-sqlite3');
const path = require('path');

async function fixCloakerColumn() {
  const db = new Database(path.join(__dirname, 'db.sqlite'));
  
  try {
    console.log('🔧 Verificando estrutura da tabela quizzes...');
    
    // Verificar se a coluna já existe
    const tableInfo = db.prepare("PRAGMA table_info(quizzes)").all();
    const hasColumn = tableInfo.some(col => col.name === 'cloakerEnabled');
    
    if (hasColumn) {
      console.log('✅ Coluna cloakerEnabled já existe');
      return;
    }
    
    console.log('⚠️  Coluna cloakerEnabled não encontrada, adicionando...');
    
    // Adicionar as colunas do sistema Cloaker
    const columns = [
      'cloakerEnabled INTEGER DEFAULT 0',
      'cloakerMode TEXT DEFAULT "simple"',
      'cloakerFallbackUrl TEXT',
      'cloakerWhitelistIps TEXT',
      'cloakerBlacklistUserAgents TEXT'
    ];
    
    for (const column of columns) {
      try {
        db.prepare(`ALTER TABLE quizzes ADD COLUMN ${column}`).run();
        console.log(`✅ Adicionada coluna: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`⚠️  Coluna ${column.split(' ')[0]} já existe`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('🎉 Correção concluída com sucesso!');
    
    // Verificar quantos quizzes existem
    const quizCount = db.prepare('SELECT COUNT(*) as count FROM quizzes').get();
    console.log(`📊 Total de quizzes no banco: ${quizCount.count}`);
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    db.close();
  }
}

fixCloakerColumn().catch(console.error);
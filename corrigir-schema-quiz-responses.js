/**
 * 🔧 CORREÇÃO CRÍTICA - SCHEMA DA TABELA QUIZ_RESPONSES
 * Adicionar colunas faltantes que causam o erro "table quiz_responses has no column named country"
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Abrir banco de dados
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new Database(dbPath);

function corrigirSchemaQuizResponses() {
  console.log('🔧 CORREÇÃO CRÍTICA - SCHEMA QUIZ_RESPONSES');
  console.log('============================================');

  try {
    // Verificar estrutura atual da tabela
    const tableInfo = db.prepare("PRAGMA table_info(quiz_responses)").all();
    console.log('📋 Estrutura atual da tabela:');
    tableInfo.forEach(column => {
      console.log(`   - ${column.name}: ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.dflt_value ? ` DEFAULT ${column.dflt_value}` : ''}`);
    });

    // Verificar se as colunas já existem
    const existingColumns = tableInfo.map(col => col.name);
    const requiredColumns = ['country', 'phoneCountryCode', 'affiliateId'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log('✅ Todas as colunas já existem!');
      return;
    }

    console.log(`\n📝 Colunas faltantes encontradas: ${missingColumns.join(', ')}`);

    // Adicionar colunas faltantes
    const alterStatements = [];
    
    if (missingColumns.includes('country')) {
      alterStatements.push('ALTER TABLE quiz_responses ADD COLUMN country TEXT');
    }
    
    if (missingColumns.includes('phoneCountryCode')) {
      alterStatements.push('ALTER TABLE quiz_responses ADD COLUMN phoneCountryCode TEXT');
    }
    
    if (missingColumns.includes('affiliateId')) {
      alterStatements.push('ALTER TABLE quiz_responses ADD COLUMN affiliateId TEXT');
    }

    // Executar alterações
    db.transaction(() => {
      alterStatements.forEach(statement => {
        console.log(`🔧 Executando: ${statement}`);
        db.exec(statement);
      });
    })();

    console.log('✅ Schema corrigido com sucesso!');

    // Verificar estrutura após correção
    const updatedTableInfo = db.prepare("PRAGMA table_info(quiz_responses)").all();
    console.log('\n📋 Estrutura após correção:');
    updatedTableInfo.forEach(column => {
      console.log(`   - ${column.name}: ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.dflt_value ? ` DEFAULT ${column.dflt_value}` : ''}`);
    });

  } catch (error) {
    console.error('❌ Erro ao corrigir schema:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Executar correção
corrigirSchemaQuizResponses();
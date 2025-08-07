const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco SQLite
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new Database(dbPath);

console.log('🔄 Aplicando migração para adicionar coluna whatsapp...');

try {
  // Verificar se a coluna já existe
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasWhatsappColumn = tableInfo.some(column => column.name === 'whatsapp');
  
  if (!hasWhatsappColumn) {
    // Adicionar coluna whatsapp
    db.exec("ALTER TABLE users ADD COLUMN whatsapp TEXT");
    console.log('✅ Coluna whatsapp adicionada com sucesso');
  } else {
    console.log('✅ Coluna whatsapp já existe');
  }
  
  // Verificar se a migração foi bem-sucedida
  const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
  const whatsappColumn = updatedTableInfo.find(column => column.name === 'whatsapp');
  
  if (whatsappColumn) {
    console.log('✅ Migração concluída com sucesso');
    console.log(`📊 Coluna whatsapp: ${whatsappColumn.name} (${whatsappColumn.type})`);
  } else {
    console.log('❌ Erro: Coluna whatsapp não foi encontrada após migração');
  }
  
} catch (error) {
  console.error('❌ Erro durante migração:', error);
  process.exit(1);
} finally {
  db.close();
}
import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

console.log('🔍 Verificando tabela checkout_products...');

// Verificar se a tabela existe
const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='checkout_products'").get();
console.log('📊 Tabela exists:', tableExists);

if (tableExists) {
  // Contar registros
  const count = db.prepare("SELECT COUNT(*) as count FROM checkout_products").get();
  console.log('📊 Total de registros:', count.count);
  
  // Buscar todos os registros
  const all = db.prepare("SELECT * FROM checkout_products ORDER BY created_at DESC").all();
  console.log('📦 Todos os registros:', all);
  
  // Verificar esquema da tabela
  const schema = db.prepare("PRAGMA table_info(checkout_products)").all();
  console.log('📋 Esquema da tabela:', schema);
} else {
  console.log('❌ Tabela não existe');
}

db.close();
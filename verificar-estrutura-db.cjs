#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🔍 VERIFICANDO ESTRUTURA ATUAL COMPLETA DO BANCO');
console.log('===============================================');

// Verificar todas as_tabelas
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

console.log('📋 Tabelas encontradas:');
tables.forEach(table => console.log(`  - ${table.name}`));

console.log('\n📊 Estrutura detalhada:');

tables.forEach(table => {
  console.log(`\n🏷️  TABELA: ${table.name}`);
  const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
  });
});

db.close();
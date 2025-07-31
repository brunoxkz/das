const Database = require('better-sqlite3');

// Conectar ao banco de dados correto
const db = new Database('./vendzz-database.db');

try {
  console.log('🔧 Adicionando colunas do Telegram...');
  
  // Verificar se as colunas já existem
  const checkColumns = db.prepare("PRAGMA table_info(users)").all();
  const existingColumns = checkColumns.map(col => col.name);
  
  console.log('📊 Colunas existentes na tabela users:', existingColumns);
  
  // Adicionar colunas do Telegram se não existirem
  if (!existingColumns.includes('telegramBotToken')) {
    db.exec('ALTER TABLE users ADD COLUMN telegramBotToken TEXT');
    console.log('✅ Coluna telegramBotToken adicionada');
  } else {
    console.log('⚠️ Coluna telegramBotToken já existe');
  }
  
  if (!existingColumns.includes('telegramChatId')) {
    db.exec('ALTER TABLE users ADD COLUMN telegramChatId TEXT');
    console.log('✅ Coluna telegramChatId adicionada');
  } else {
    console.log('⚠️ Coluna telegramChatId já existe');
  }
  
  if (!existingColumns.includes('telegramUsername')) {
    db.exec('ALTER TABLE users ADD COLUMN telegramUsername TEXT');
    console.log('✅ Coluna telegramUsername adicionada');
  } else {
    console.log('⚠️ Coluna telegramUsername já existe');
  }
  
  if (!existingColumns.includes('telegramCredits')) {
    db.exec('ALTER TABLE users ADD COLUMN telegramCredits INTEGER DEFAULT 0');
    console.log('✅ Coluna telegramCredits adicionada');
  } else {
    console.log('⚠️ Coluna telegramCredits já existe');
  }
  
  console.log('🎉 TELEGRAM COLUMNS ADICIONADAS COM SUCESSO!');
  
  // Verificar novamente as colunas
  const updatedColumns = db.prepare("PRAGMA table_info(users)").all();
  console.log('📊 Colunas atualizadas:', updatedColumns.map(col => col.name));
  
} catch (error) {
  console.error('❌ Erro ao adicionar colunas do Telegram:', error);
} finally {
  db.close();
}
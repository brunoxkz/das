const Database = require('better-sqlite3');
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, 'server', 'database.sqlite');

try {
  // Abrir conexão com o banco de dados
  const db = new Database(dbPath, { verbose: console.log });

  console.log('🔄 Adicionando colunas do Telegram ao banco de dados...');

  // Adicionar colunas para o sistema Telegram
  try {
    db.exec(`ALTER TABLE users ADD COLUMN telegramBotToken TEXT;`);
    console.log('✅ Coluna telegramBotToken adicionada');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Coluna telegramBotToken já existe');
    } else {
      console.error('❌ Erro ao adicionar telegramBotToken:', error.message);
    }
  }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN telegramChatId TEXT;`);
    console.log('✅ Coluna telegramChatId adicionada');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Coluna telegramChatId já existe');
    } else {
      console.error('❌ Erro ao adicionar telegramChatId:', error.message);
    }
  }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN telegramCredits INTEGER DEFAULT 0;`);
    console.log('✅ Coluna telegramCredits adicionada');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Coluna telegramCredits já existe');
    } else {
      console.error('❌ Erro ao adicionar telegramCredits:', error.message);
    }
  }

  // Verificar se as colunas foram adicionadas
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const telegramColumns = tableInfo.filter(col => col.name.includes('telegram'));
  
  console.log('\n📊 Colunas do Telegram encontradas:');
  telegramColumns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });

  console.log('\n🎉 Migração do Telegram concluída com sucesso!');
  db.close();

} catch (error) {
  console.error('❌ Erro na migração do Telegram:', error);
  process.exit(1);
}
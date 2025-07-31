const Database = require('better-sqlite3');
const path = require('path');

// Conectar com o banco de dados
const db = new Database(path.join(__dirname, 'vendzz-database.db'));

console.log('🔧 Corrigindo schema do banco de dados...');

// Verificar se a coluna trialExpiresAt existe
try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('Colunas da tabela users:', tableInfo.map(col => col.name));
  
  const hasTrialExpiresAt = tableInfo.some(col => col.name === 'trialExpiresAt');
  
  if (!hasTrialExpiresAt) {
    console.log('❌ Coluna trialExpiresAt não encontrada. Adicionando...');
    
    // Adicionar coluna trialExpiresAt
    db.prepare("ALTER TABLE users ADD COLUMN trialExpiresAt INTEGER").run();
    console.log('✅ Coluna trialExpiresAt adicionada');
  } else {
    console.log('✅ Coluna trialExpiresAt já existe');
  }
  
  // Verificar outras colunas do sistema de planos
  const planColumns = ['planExpiresAt', 'planRenewalRequired', 'subscriptionStatus'];
  
  for (const columnName of planColumns) {
    const hasColumn = tableInfo.some(col => col.name === columnName);
    
    if (!hasColumn) {
      console.log(`❌ Coluna ${columnName} não encontrada. Adicionando...`);
      
      if (columnName === 'planExpiresAt') {
        db.prepare(`ALTER TABLE users ADD COLUMN ${columnName} INTEGER`).run();
      } else if (columnName === 'planRenewalRequired') {
        db.prepare(`ALTER TABLE users ADD COLUMN ${columnName} INTEGER DEFAULT 0`).run();
      } else if (columnName === 'subscriptionStatus') {
        db.prepare(`ALTER TABLE users ADD COLUMN ${columnName} TEXT DEFAULT 'active'`).run();
      }
      
      console.log(`✅ Coluna ${columnName} adicionada`);
    } else {
      console.log(`✅ Coluna ${columnName} já existe`);
    }
  }
  
  // Criar usuário admin padrão se não existir
  const adminUser = db.prepare("SELECT * FROM users WHERE email = ?").get('admin@admin.com');
  
  if (!adminUser) {
    console.log('👤 Criando usuário admin padrão...');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO users (id, email, password, firstName, lastName, plan, role, subscriptionStatus, smsCredits, emailCredits, whatsappCredits, aiCredits, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin-user-id',
      'admin@admin.com',
      hashedPassword,
      'Admin',
      'User',
      'enterprise',
      'admin',
      'active',
      10000,
      10000,
      10000,
      1000,
      Date.now(),
      Date.now()
    );
    
    console.log('✅ Usuário admin criado com sucesso');
  } else {
    console.log('✅ Usuário admin já existe');
  }
  
  console.log('🎯 Schema do banco de dados corrigido com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao corrigir schema:', error);
} finally {
  db.close();
}
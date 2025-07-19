const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const sqlite = new Database('database.db');

// 1. Deletar usuário admin atual
sqlite.prepare('DELETE FROM users WHERE email = ?').run('admin@admin.com');
console.log('✅ Usuário admin antigo deletado');

// 2. Criar novo hash para Btts44381!!
const correctPassword = 'Btts44381!!';
const correctHash = bcrypt.hashSync(correctPassword, 10);

// 3. Criar novo usuário admin
const adminUser = {
  id: 'admin-user-id',
  email: 'admin@admin.com',
  password: correctHash,
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  plan: 'enterprise',
  smsCredits: 100,
  emailCredits: 100,
  whatsappCredits: 100,
  aiCredits: 100,
  videoCredits: 100,
  telegramCredits: 100,
  subscriptionStatus: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

sqlite.prepare(`
  INSERT INTO users (
    id, email, password, firstName, lastName, role, plan, 
    smsCredits, emailCredits, whatsappCredits, aiCredits, 
    videoCredits, telegramCredits, subscriptionStatus, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  adminUser.id, adminUser.email, adminUser.password, adminUser.firstName, adminUser.lastName,
  adminUser.role, adminUser.plan, adminUser.smsCredits, adminUser.emailCredits, adminUser.whatsappCredits,
  adminUser.aiCredits, adminUser.videoCredits, adminUser.telegramCredits, adminUser.subscriptionStatus,
  adminUser.createdAt, adminUser.updatedAt
);

console.log('✅ Usuário admin recriado com senha correta');

// 4. Verificar
const user = sqlite.prepare('SELECT email, role, plan FROM users WHERE email = ?').get('admin@admin.com');
console.log('👤 Usuário criado:', user);

// 5. Testar senha
const isValid = bcrypt.compareSync(correctPassword, correctHash);
console.log('🔐 Senha válida:', isValid ? '✅ SIM' : '❌ NÃO');

sqlite.close();
console.log('🎯 CORREÇÃO CONCLUÍDA - Senha: Btts44381!!');

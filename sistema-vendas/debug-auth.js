import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

console.log('🔍 Debugando autenticação completa...');

const db = new Database('./database.db');

// Check what's in the database
console.log('\n📊 Usuários no banco:');
const users = db.prepare('SELECT * FROM users').all();
users.forEach(user => {
  console.log(`👤 ${user.username} | Role: ${user.role} | Active: ${user.is_active}`);
  console.log(`   Password Hash: ${user.password}`);
});

// Test password verification for admin user
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (adminUser) {
  console.log('\n🔐 Testando autenticação do admin:');
  console.log('User found:', !!adminUser);
  console.log('User active:', adminUser.is_active);
  console.log('Password from DB:', adminUser.password);
  
  // Test multiple password variations
  const testPasswords = ['admin123', 'Admin123', 'ADMIN123'];
  
  for (const testPass of testPasswords) {
    try {
      const result = bcrypt.compareSync(testPass, adminUser.password);
      console.log(`Password "${testPass}": ${result ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`Password "${testPass}": Error -`, error.message);
    }
  }
  
  // Check the hash algorithm
  console.log('\nHash info:');
  console.log('Hash length:', adminUser.password.length);
  console.log('Hash starts with $2b$:', adminUser.password.startsWith('$2b$'));
  
} else {
  console.log('❌ Admin user not found');
}

db.close();
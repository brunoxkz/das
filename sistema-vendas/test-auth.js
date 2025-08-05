import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

console.log('🔧 Testando autenticação...');

const db = new Database('./database.db');

// Test fresh password creation and verification
const testPassword = 'admin123';
console.log('Testando senha:', testPassword);

// Create fresh hash synchronously
const freshHash = bcrypt.hashSync(testPassword, 10);
console.log('Hash criado:', freshHash);

// Test verification immediately
const verificationResult = bcrypt.compareSync(testPassword, freshHash);
console.log('Verificação imediata:', verificationResult);

if (verificationResult) {
  console.log('✅ Hash funciona! Atualizando banco...');
  
  // Update both users
  const adminResult = db.prepare('UPDATE users SET password = ? WHERE username = ?').run(freshHash, 'admin');
  const attendantResult = db.prepare('UPDATE users SET password = ? WHERE username = ?').run(freshHash, 'atendente1');
  
  console.log('Admin atualizado:', adminResult);
  console.log('Atendente atualizado:', attendantResult);
  
  // Verify in database
  const adminUser = db.prepare('SELECT username, password FROM users WHERE username = ?').get('admin');
  console.log('Admin no banco:', adminUser);
  
  // Test verification with database password
  const dbVerification = bcrypt.compareSync(testPassword, adminUser.password);
  console.log('Verificação com senha do banco:', dbVerification);
  
} else {
  console.log('❌ Problema com o hash');
}

db.close();
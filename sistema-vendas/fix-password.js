import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

console.log('🔧 Corrigindo senha do admin...');

const db = new Database('./database.db');

// Generate a fresh hash
const newHash = bcrypt.hashSync('admin123', 10);
console.log('Novo hash gerado:', newHash);

// Test the hash
const isValid = bcrypt.compareSync('admin123', newHash);
console.log('Teste do hash:', isValid);

if (isValid) {
  // Update admin password
  const result = db.prepare('UPDATE users SET password = ? WHERE username = ?').run(newHash, 'admin');
  console.log('Resultado da atualização:', result);
  
  // Update attendant password too
  db.prepare('UPDATE users SET password = ? WHERE username = ?').run(newHash, 'atendente1');
  
  console.log('✅ Senhas atualizadas com sucesso!');
} else {
  console.log('❌ Erro na geração do hash');
}

db.close();
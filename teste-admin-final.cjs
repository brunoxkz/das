const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const sqlite = new Database('database.db');

// 1. Verificar usuário atual
console.log('1️⃣ VERIFICANDO USUÁRIO ADMIN:');
const user = sqlite.prepare('SELECT * FROM users WHERE email = ?').get('admin@admin.com');
console.log('Email:', user.email);
console.log('Role:', user.role);
console.log('Hash atual:', user.password);

// 2. Criar novo hash para Btts44381!!
console.log('\n2️⃣ GERANDO NOVO HASH:');
const newPassword = 'Btts44381!!';
const newHash = bcrypt.hashSync(newPassword, 10);
console.log('Nova senha:', newPassword);
console.log('Novo hash:', newHash);

// 3. Atualizar no banco
console.log('\n3️⃣ ATUALIZANDO NO BANCO:');
const updateStmt = sqlite.prepare('UPDATE users SET password = ? WHERE email = ?');
const result = updateStmt.run(newHash, 'admin@admin.com');
console.log('Linhas afetadas:', result.changes);

// 4. Verificar se foi atualizado
console.log('\n4️⃣ VERIFICANDO ATUALIZAÇÃO:');
const updatedUser = sqlite.prepare('SELECT email, password FROM users WHERE email = ?').get('admin@admin.com');
console.log('Hash no banco:', updatedUser.password);
console.log('Validação:', bcrypt.compareSync(newPassword, updatedUser.password) ? '✅ VÁLIDA' : '❌ INVÁLIDA');

sqlite.close();
console.log('\n🎯 SENHA ATUALIZADA COM SUCESSO!');

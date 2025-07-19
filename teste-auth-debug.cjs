/**
 * TESTE DE DEBUG DO SISTEMA DE AUTH ADMIN
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'vendzz-jwt-secret-key-2024';

// Simular token que seria criado no login
const user = {
  id: 'admin-user-id',
  email: 'admin@admin.com',
  role: 'admin',
  plan: 'enterprise'
};

const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    plan: user.plan,
    iat: Math.floor(Date.now() / 1000)
  },
  JWT_SECRET,
  { expiresIn: "15m" }
);

console.log('🔑 Token gerado para admin:', token);

// Decodificar para verificar
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token decodificado:', decoded);
} catch (error) {
  console.log('❌ Erro ao decodificar token:', error.message);
}

// Testar com o token
const { spawn } = require('child_process');

const curl = spawn('curl', [
  '-H', `Authorization: Bearer ${token}`,
  '-H', 'Content-Type: application/json',
  'http://localhost:5000/api/admin/users'
], {
  stdio: 'inherit'
});

curl.on('close', (code) => {
  console.log(`\n🧪 Teste finalizado com código: ${code}`);
});
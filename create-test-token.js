import jwt from 'jsonwebtoken';

// Usar exatamente a mesma chave do sistema
const JWT_SECRET = 'vendzz-jwt-secret-key-2024';

// Criar payload de usuário admin de teste
const userPayload = {
  id: 'admin-user-id',
  email: 'admin@vendzz.com',
  role: 'admin',
  plan: 'premium',
  iat: Math.floor(Date.now() / 1000),
  isPWA: false,
  nonce: Math.random().toString(36).substring(7)
};

// Gerar token JWT válido
const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

console.log('🔑 TOKEN JWT GERADO:');
console.log(token);
console.log('\n📋 PAYLOAD:');
console.log(JSON.stringify(userPayload, null, 2));
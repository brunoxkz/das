/**
 * GERADOR DE TOKEN PARA EXTENSÃO CHROME
 * Resolve problema de autenticação
 */

import jwt from 'jsonwebtoken';

// Mesmo secret usado no servidor
const JWT_SECRET = process.env.JWT_SECRET || 'vendzz-jwt-secret-key-2024-super-secure';

// ID do usuário admin atual
const userId = 'LCOAa6gjuGGkhIlUnluhE';
const userEmail = 'admin@vendzz.com';

// Gerar token válido para extensão
const extensionToken = jwt.sign({
  id: userId,
  email: userEmail,
  purpose: 'chrome_extension',
  type: 'extension'
}, JWT_SECRET, {
  expiresIn: '30d'
});

console.log('🎫 TOKEN PARA EXTENSÃO CHROME:');
console.log('');
console.log('📋 COPIE ESTE TOKEN:');
console.log('');
console.log(extensionToken);
console.log('');
console.log('✅ VÁLIDO POR: 30 dias');
console.log('👤 USUÁRIO: admin@vendzz.com');
console.log('🔗 URL: https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev');
console.log('');
console.log('🔧 COMO USAR:');
console.log('1. Copie o token acima');
console.log('2. Instale a extensão Chrome');
console.log('3. Cole no campo "Token de Autenticação"');
console.log('4. Clique "Salvar Configuração"');
console.log('5. Status deve mostrar "Conectada"');
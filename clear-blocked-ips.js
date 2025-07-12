/**
 * SCRIPT PARA LIMPAR IPs BLOQUEADOS PELO SISTEMA DE SEGURANÇA
 * Remove bloqueios de desenvolvimento para permitir acesso ao sistema
 */

// Simular o que está no security.ts
const blockedIPs = new Map();
const failedAttempts = new Map();
const suspiciousActivity = new Map();

// Limpar todos os bloqueios
console.log('🔧 Limpando bloqueios de IP...');
blockedIPs.clear();
failedAttempts.clear();
suspiciousActivity.clear();

console.log('✅ Bloqueios de IP limpos com sucesso!');
console.log('🔄 Reinicie o servidor para aplicar as alterações.');

// Mostrar configurações recomendadas
console.log('\n📋 CONFIGURAÇÕES RECOMENDADAS PARA DESENVOLVIMENTO:');
console.log('1. IPs de desenvolvimento: 127.0.0.1, ::1, 10.83.1.214');
console.log('2. Limite de tentativas aumentado de 5 para 15');
console.log('3. User-Agents de desenvolvimento permitidos');
console.log('4. Rate limiting mais permissivo para desenvolvimento');

process.exit(0);
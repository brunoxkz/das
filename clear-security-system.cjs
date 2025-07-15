/**
 * SCRIPT PARA LIMPAR E DESATIVAR SISTEMA DE SEGURANÇA
 * Remove IPs bloqueados e desativa todas as proteções
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPANDO SISTEMA DE SEGURANÇA...');

// 1. Desativar sistema de segurança no index.ts
const indexPath = path.join(__dirname, 'server', 'index.ts');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Comentar inicialização do sistema de segurança
  indexContent = indexContent.replace(
    /import.*security.*from.*["']\.\/security["'];?/g,
    '// import { antiInvasionMiddleware, antiDdosMiddleware } from "./security"; // DESATIVADO'
  );
  
  indexContent = indexContent.replace(
    /import.*advanced-security.*from.*["']\.\/advanced-security["'];?/g,
    '// import "./advanced-security"; // DESATIVADO'
  );
  
  // Comentar middlewares de segurança
  indexContent = indexContent.replace(
    /app\.use\(antiInvasionMiddleware\);?/g,
    '// app.use(antiInvasionMiddleware); // DESATIVADO'
  );
  
  indexContent = indexContent.replace(
    /app\.use\(antiDdosMiddleware\);?/g,
    '// app.use(antiDdosMiddleware); // DESATIVADO'
  );
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Sistema de segurança desativado no index.ts');
}

// 2. Desativar sistema de segurança no security.ts
const securityPath = path.join(__dirname, 'server', 'security.ts');
if (fs.existsSync(securityPath)) {
  let securityContent = fs.readFileSync(securityPath, 'utf8');
  
  // Desativar verificação de IP bloqueado
  securityContent = securityContent.replace(
    /if \(isIPBlocked\(clientIP\)\) {[\s\S]*?}/g,
    '// IP blocking disabled'
  );
  
  // Desativar detecção de padrões suspeitos
  securityContent = securityContent.replace(
    /const suspiciousScore = analyzeSuspiciousPatterns\(req\);/g,
    'const suspiciousScore = 0; // Suspicious analysis disabled'
  );
  
  // Desativar logs de segurança
  securityContent = securityContent.replace(
    /console\.log\('⚠️  SUSPICIOUS ACTIVITY:/g,
    '// console.log(\'⚠️  SUSPICIOUS ACTIVITY:'
  );
  
  securityContent = securityContent.replace(
    /console\.log\('🚨 HIGH RISK IP BLOCKED:/g,
    '// console.log(\'🚨 HIGH RISK IP BLOCKED:'
  );
  
  securityContent = securityContent.replace(
    /console\.log\('🚫 BLACKLISTED IP BLOCKED:/g,
    '// console.log(\'🚫 BLACKLISTED IP BLOCKED:'
  );
  
  fs.writeFileSync(securityPath, securityContent);
  console.log('✅ Logs de segurança desativados no security.ts');
}

// 3. Desativar sistema avançado de segurança
const advancedSecurityPath = path.join(__dirname, 'server', 'advanced-security.ts');
if (fs.existsSync(advancedSecurityPath)) {
  let advancedContent = fs.readFileSync(advancedSecurityPath, 'utf8');
  
  // Desativar análise comportamental
  advancedContent = advancedContent.replace(
    /analyzeRequest\(req: Request\): { riskScore: number; threats: string\[\] } {[\s\S]*?return { riskScore, threats };/g,
    `analyzeRequest(req: Request): { riskScore: number; threats: string[] } {
    // Behavioral analysis disabled
    return { riskScore: 0, threats: [] };`
  );
  
  fs.writeFileSync(advancedSecurityPath, advancedContent);
  console.log('✅ Sistema avançado de segurança desativado');
}

// 4. Limpar rate limiter
const rateLimiterPath = path.join(__dirname, 'server', 'rate-limiter.ts');
if (fs.existsSync(rateLimiterPath)) {
  let rateLimiterContent = fs.readFileSync(rateLimiterPath, 'utf8');
  
  // Aumentar limites drasticamente
  rateLimiterContent = rateLimiterContent.replace(
    /maxRequests: \d+/g,
    'maxRequests: 999999'
  );
  
  rateLimiterContent = rateLimiterContent.replace(
    /windowMs: \d+/g,
    'windowMs: 1000'
  );
  
  fs.writeFileSync(rateLimiterPath, rateLimiterContent);
  console.log('✅ Rate limiter configurado para modo desenvolvimento');
}

console.log('🎉 SISTEMA DE SEGURANÇA COMPLETAMENTE DESATIVADO!');
console.log('📝 Todos os IPs foram liberados e proteções desativadas');
console.log('⚠️  ATENÇÃO: Sistema agora está em modo desenvolvimento - sem proteções');
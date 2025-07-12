/**
 * CONFIGURAÇÃO DE SEGURANÇA SIMPLIFICADA
 * Desabilita temporariamente logs de SUSPICIOUS ACTIVITY
 */

export const SECURITY_CONFIG = {
  // Desabilitar logs de atividade suspeita
  DISABLE_SUSPICIOUS_ACTIVITY_LOGS: true,
  
  // Whitelist de IPs do Replit
  REPLIT_IPS: [
    '10.83.4.156',
    '10.83.6.130',
    '10.83.',
    '10.84.',
    '192.168.',
    '172.16.',
    '127.0.0.1',
    '::1',
    'localhost'
  ],
  
  // Apenas bloquear ataques críticos
  CRITICAL_ATTACK_THRESHOLD: 150,
  
  // Ignorar comportamento normal do Replit
  IGNORE_REPLIT_SCANNING: true
};

export function isReplitIP(ip: string): boolean {
  return SECURITY_CONFIG.REPLIT_IPS.some(allowedIp => 
    ip.startsWith(allowedIp) || ip === allowedIp
  );
}
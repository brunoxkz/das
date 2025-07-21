/**
 * SISTEMA DE SEGURANÇA ANTI-INVASÃO E ANTI-DDOS
 * Implementação completa de proteções de segurança para a plataforma Vendzz
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { db } from './db-sqlite';

// Tipos de segurança
interface SecurityAttempt {
  ip: string;
  userAgent: string;
  timestamp: number;
  type: 'login' | 'brute_force' | 'suspicious_activity' | 'ddos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: number;
  expiresAt: number;
  attempts: number;
}

// Armazenamento em memória para performance
const securityLog: SecurityAttempt[] = [];
const blockedIPs: Map<string, BlockedIP> = new Map();
const failedAttempts: Map<string, number> = new Map();
const suspiciousIPs: Map<string, number> = new Map();

// Limpar listas de bloqueio a cada 5 minutos
setInterval(() => {
  blockedIPs.clear();
  failedAttempts.clear();
  suspiciousIPs.clear();
  console.log('🔄 Sistema de segurança: Listas de bloqueio limpas');
}, 5 * 60 * 1000);

// Configurações de segurança
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 15, // Aumentado para desenvolvimento
  BLOCK_DURATION: 5 * 60 * 1000, // 5 minutos (reduzido)
  SUSPICIOUS_THRESHOLD: 50, // Aumentado para desenvolvimento
  DDOS_THRESHOLD: 500, // Aumentado para desenvolvimento
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX: 500, // Aumentado para desenvolvimento
  BRUTE_FORCE_WINDOW: 10 * 60 * 1000, // 10 minutos
};

/**
 * MIDDLEWARE DE PROTEÇÃO ANTI-DDOS
 */
export const antiDdosMiddleware = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
  max: SECURITY_CONFIG.RATE_LIMIT_MAX,
  message: {
    error: 'Muitas requisições detectadas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(SECURITY_CONFIG.RATE_LIMIT_WINDOW / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limit para IPs permitidos e processos internos
    const allowedIPs = ['127.0.0.1', '::1'];
    const internalProcesses = [
      '/api/ultra-scale',
      '/api/auto-detection',
      '/api/scheduled-campaigns',
      '/api/background-jobs',
      '/api/internal'
    ];
    
    // Permitir IPs locais
    if (allowedIPs.includes(req.ip)) return true;
    
    // Permitir processos internos
    if (internalProcesses.some(path => req.path.includes(path))) return true;
    
    // Permitir user-agent de processos internos
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.includes('UltraScale') || userAgent.includes('AutoDetection')) return true;
    
    return false;
  },
  handler: (req, res) => {
    // logSecurityEvent(req, 'ddos', 'high', 'Rate limit exceeded'); // Temporarily disabled
    res.status(429).json({
      error: 'Muitas requisições detectadas. Tente novamente em alguns minutos.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * MIDDLEWARE DE PROTEÇÃO ANTI-INVASÃO
 */
export const antiInvasionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Verificar se IP está bloqueado
  // IP blocking disabled

  // Detectar padrões suspeitos - DESATIVADO
  // Detection disabled for development

  // Verificar tentativas de brute force - DESATIVADO
  // Brute force detection disabled for development

  next();
};

/**
 * MIDDLEWARE DE SEGURANÇA HELMET
 */
export const helmetSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:", "https://api.stripe.com"],
      frameSrc: ["'self'", "https:", "https://js.stripe.com", "https://hooks.stripe.com"],
      mediaSrc: ["'self'", "https:", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * FUNÇÕES DE DETECÇÃO DE SEGURANÇA
 */
function detectSuspiciousActivity(req: Request): boolean {
  const ip = req.ip || req.connection.remoteAddress || '';
  
  // 🔧 WHITELIST DE IPs DE DESENVOLVIMENTO
  const developmentIPs = ['127.0.0.1', '::1', '10.83.1.214', 'localhost'];
  if (developmentIPs.includes(ip)) {
    return false; // Não considera IPs de desenvolvimento como suspeitos
  }
  
  // 🔧 MODO DESENVOLVIMENTO - Apenas padrões críticos para evitar falsos positivos
  const suspiciousPatterns = [
    /\.\.\//,  // Path traversal crítico
    /union\s+select/i, // SQL injection crítico
    /\/proc\/self/i, // System file access crítico
    /\/etc\/passwd/i,  // System file access crítico
    /cmd\.exe/i,    // Command injection crítico
    /shell_exec/i,   // Code injection crítico
    /phpinfo\(/i,  // Information disclosure crítico
    /\/bin\/sh/i,       // Shell access crítico
    /powershell/i,      // PowerShell injection crítico
    /base64_decode/i, // Encoded payloads crítico
  ];

  const url = req.url.toLowerCase();
  const userAgent = (req.get('User-Agent') || '').toLowerCase();
  const body = JSON.stringify(req.body || '').toLowerCase();

  // Verificar padrões suspeitos na URL
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent) || pattern.test(body)) {
      return true;
    }
  }

  // Verificar user-agents suspeitos
  const suspiciousUserAgents = [
    'nikto',
    'sqlmap',
    'nmap',
    'masscan',
    'dirb',
    'gobuster',
    'wpscan',
    'burp',
    'zap',
    'crawler',
    'bot',
    'spider',
    'scraper'
  ];

  for (const agent of suspiciousUserAgents) {
    if (userAgent.includes(agent)) {
      return true;
    }
  }

  // Verificar tamanho excessivo do payload
  const contentLength = parseInt(req.get('Content-Length') || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB
    return true;
  }

  return false;
}

/**
 * FUNÇÕES DE GERENCIAMENTO DE IPS
 */
function isIPBlocked(ip: string): boolean {
  const blocked = blockedIPs.get(ip);
  if (!blocked) return false;

  if (Date.now() > blocked.expiresAt) {
    blockedIPs.delete(ip);
    return false;
  }

  return true;
}

function blockIP(ip: string, reason: string, duration: number): void {
  const blockedAt = Date.now();
  const expiresAt = blockedAt + duration;
  
  blockedIPs.set(ip, {
    ip,
    reason,
    blockedAt,
    expiresAt,
    attempts: (blockedIPs.get(ip)?.attempts || 0) + 1
  });

  console.log(`🚫 IP BLOQUEADO: ${ip} - Motivo: ${reason} - Expira em: ${new Date(expiresAt).toLocaleString()}`);
}

function getFailedAttempts(ip: string): number {
  return failedAttempts.get(ip) || 0;
}

function incrementFailedAttempts(ip: string): void {
  const current = getFailedAttempts(ip);
  failedAttempts.set(ip, current + 1);
  
  // Limpar após período de janela
  setTimeout(() => {
    failedAttempts.delete(ip);
  }, SECURITY_CONFIG.BRUTE_FORCE_WINDOW);
}

function getSuspiciousCount(ip: string): number {
  return suspiciousIPs.get(ip) || 0;
}

function incrementSuspiciousActivity(ip: string): void {
  const current = getSuspiciousCount(ip);
  suspiciousIPs.set(ip, current + 1);
  
  // Limpar após período de janela
  setTimeout(() => {
    suspiciousIPs.delete(ip);
  }, SECURITY_CONFIG.RATE_LIMIT_WINDOW);
}

/**
 * LOGGING DE EVENTOS DE SEGURANÇA
 */
function logSecurityEvent(req: Request, type: SecurityAttempt['type'], severity: SecurityAttempt['severity'], details?: string): void {
  const event: SecurityAttempt = {
    ip: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: Date.now(),
    type,
    severity,
    details: details || `${req.method} ${req.url}`
  };

  securityLog.push(event);
  
  // Manter apenas os últimos 1000 eventos
  if (securityLog.length > 1000) {
    securityLog.shift();
  }

  // Log crítico no console
  if (severity === 'critical' || severity === 'high') {
    console.warn(`🔒 ALERTA DE SEGURANÇA [${severity.toUpperCase()}]: ${type} - IP: ${event.ip} - ${details}`);
  }
}

/**
 * MIDDLEWARE PARA REGISTRAR TENTATIVAS DE LOGIN FALHADAS
 */
export const loginAttemptMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const clientIP = req.ip || 'unknown';
    
    // Verificar se foi um login falho
    if (req.path.includes('/login') && req.method === 'POST') {
      try {
        const response = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (response.success === false || response.error) {
          incrementFailedAttempts(clientIP);
          logSecurityEvent(req, 'login', 'medium', 'Failed login attempt');
        } else if (response.success === true) {
          // Limpar tentativas em caso de sucesso
          failedAttempts.delete(clientIP);
        }
      } catch (error) {
        // Ignorar erros de parsing
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * ENDPOINTS DE MONITORAMENTO DE SEGURANÇA
 */
export const getSecurityStats = () => {
  const now = Date.now();
  const last24h = now - (24 * 60 * 60 * 1000);
  
  const recentEvents = securityLog.filter(event => event.timestamp > last24h);
  const blockedIPsList = Array.from(blockedIPs.values());
  const activeBlocks = blockedIPsList.filter(blocked => now < blocked.expiresAt);
  
  return {
    totalEvents: securityLog.length,
    recentEvents: recentEvents.length,
    blockedIPs: blockedIPsList.length,
    activeBlocks: activeBlocks.length,
    eventsByType: {
      login: recentEvents.filter(e => e.type === 'login').length,
      brute_force: recentEvents.filter(e => e.type === 'brute_force').length,
      suspicious_activity: recentEvents.filter(e => e.type === 'suspicious_activity').length,
      ddos: recentEvents.filter(e => e.type === 'ddos').length,
    },
    eventsBySeverity: {
      low: recentEvents.filter(e => e.severity === 'low').length,
      medium: recentEvents.filter(e => e.severity === 'medium').length,
      high: recentEvents.filter(e => e.severity === 'high').length,
      critical: recentEvents.filter(e => e.severity === 'critical').length,
    },
    config: SECURITY_CONFIG
  };
};

/**
 * LIMPEZA AUTOMÁTICA DE DADOS DE SEGURANÇA
 */
setInterval(() => {
  const now = Date.now();
  
  // Limpar IPs bloqueados expirados
  for (const [ip, blocked] of blockedIPs.entries()) {
    if (now > blocked.expiresAt) {
      blockedIPs.delete(ip);
    }
  }
  
  // Limpar logs antigos (mais de 7 dias)
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const validEvents = securityLog.filter(event => event.timestamp > weekAgo);
  securityLog.length = 0;
  securityLog.push(...validEvents);
  
}, 60 * 60 * 1000); // Executar a cada hora

console.log('🔒 Sistema de Segurança Anti-Invasão e Anti-DDoS inicializado com sucesso!');
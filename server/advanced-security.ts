/**
 * SISTEMA DE SEGURANÇA AVANÇADO - CAMADAS ADICIONAIS
 * Implementa proteções extras contra ataques sofisticados
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// 🔒 CONFIGURAÇÕES AVANÇADAS DE SEGURANÇA
const ADVANCED_SECURITY_CONFIG = {
  // Rate limiting mais granular
  BURST_PROTECTION: {
    windowMs: 1000, // 1 segundo
    maxRequests: 10, // Máximo 10 requests por segundo
    skipSuccessfulRequests: true
  },
  
  // Proteção contra ataques de timing
  TIMING_ATTACK_PROTECTION: {
    minResponseTime: 100, // mínimo 100ms
    maxResponseTime: 2000, // máximo 2s
    jitterRange: 50 // variação aleatória
  },
  
  // Honeypot endpoints para detectar scanners
  HONEYPOT_ENDPOINTS: [
    '/wp-admin', '/admin.php', '/phpmyadmin', '/login.php',
    '/wp-login.php', '/administrator', '/admin/login',
    '/.env', '/config.php', '/database.php', '/backup.sql'
  ],
  
  // Fingerprinting de ataques
  ATTACK_SIGNATURES: [
    { pattern: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*){3,}/i, severity: 'critical', type: 'sql_injection' },
    { pattern: /<script[^>]*>|javascript:|vbscript:|onload=|onerror=/i, severity: 'high', type: 'xss' },
    { pattern: /\.\.[\/\\]|\.\.%2f|\.\.%5c/i, severity: 'high', type: 'path_traversal' },
    { pattern: /cmd\.exe|powershell|\/bin\/sh|\/usr\/bin|system\(|exec\(|eval\(/i, severity: 'critical', type: 'command_injection' },
    { pattern: /base64_decode|gzinflate|str_rot13|eval|assert|create_function/i, severity: 'high', type: 'code_injection' },
    { pattern: /UNION.*SELECT.*FROM.*information_schema/i, severity: 'critical', type: 'sql_injection_advanced' }
  ]
};

// 🛡️ CACHE DE SEGURANÇA AVANÇADO
const securityCache = {
  suspiciousIPs: new Map<string, { count: number, firstSeen: number, lastSeen: number }>(),
  blacklistedIPs: new Set<string>(),
  attackPatterns: new Map<string, { pattern: RegExp, count: number, lastSeen: number }>(),
  honeypotHits: new Map<string, number>(),
  timingAttacks: new Map<string, number[]>()
};

// 🔍 ANÁLISE COMPORTAMENTAL AVANÇADA
export class BehavioralAnalyzer {
  private static instance: BehavioralAnalyzer;
  private userBehavior = new Map<string, {
    requestTimes: number[],
    endpoints: string[],
    userAgents: string[],
    patterns: string[],
    riskScore: number
  }>();

  static getInstance(): BehavioralAnalyzer {
    if (!this.instance) {
      this.instance = new BehavioralAnalyzer();
    }
    return this.instance;
  }

  analyzeRequest(req: Request): { riskScore: number; threats: string[] } {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    const endpoint = req.originalUrl || req.url;
    
    // BYPASS CRÍTICO: Permitir localhost sempre
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return { riskScore: 0, threats: [] };
    }
    const now = Date.now();

    // Inicializar dados do usuário se não existir
    if (!this.userBehavior.has(ip)) {
      this.userBehavior.set(ip, {
        requestTimes: [],
        endpoints: [],
        userAgents: [],
        patterns: [],
        riskScore: 0
      });
    }

    const userData = this.userBehavior.get(ip)!;
    const threats: string[] = [];
    let riskScore = 0;

    // 1. Análise de frequência de requests
    userData.requestTimes.push(now);
    userData.requestTimes = userData.requestTimes.filter(time => now - time < 60000); // Últimos 60 segundos

    if (userData.requestTimes.length > 100) {
      riskScore += 50;
      threats.push('Excessive request frequency');
    }

    // 2. Análise de padrões de endpoints
    userData.endpoints.push(endpoint);
    userData.endpoints = userData.endpoints.slice(-50); // Manter últimos 50 endpoints

    const uniqueEndpoints = new Set(userData.endpoints);
    if (uniqueEndpoints.size > 20) {
      riskScore += 30;
      threats.push('Scanning behavior detected');
    }

    // 3. Análise de User-Agent
    if (!userData.userAgents.includes(userAgent)) {
      userData.userAgents.push(userAgent);
      userData.userAgents = userData.userAgents.slice(-5); // Manter últimos 5 user agents
    }

    if (userData.userAgents.length > 3) {
      riskScore += 25;
      threats.push('Multiple user agents detected');
    }

    // 4. Detecção de padrões de ataque
    for (const signature of ADVANCED_SECURITY_CONFIG.ATTACK_SIGNATURES) {
      if (signature.pattern.test(endpoint) || signature.pattern.test(JSON.stringify(req.body))) {
        riskScore += signature.severity === 'critical' ? 100 : 50;
        threats.push(`Attack pattern detected: ${signature.type}`);
      }
    }

    // 5. Análise de timing
    if (userData.requestTimes.length > 10) {
      const intervals = userData.requestTimes.slice(-10).map((time, i, arr) => 
        i > 0 ? time - arr[i-1] : 0
      ).filter(interval => interval > 0);

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval < 100) { // Menos de 100ms entre requests
        riskScore += 40;
        threats.push('Automated tool detected');
      }
    }

    userData.riskScore = riskScore;
    return { riskScore, threats };
  }

  isHighRisk(ip: string): boolean {
    const userData = this.userBehavior.get(ip);
    return userData ? userData.riskScore > 75 : false;
  }
}

// 🍯 SISTEMA DE HONEYPOT
export const honeypotMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const endpoint = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Verificar se é um endpoint honeypot
  const isHoneypot = ADVANCED_SECURITY_CONFIG.HONEYPOT_ENDPOINTS.some(hp => 
    endpoint.toLowerCase().includes(hp.toLowerCase())
  );

  if (isHoneypot) {
    // Incrementar contador de honeypot
    const currentCount = securityCache.honeypotHits.get(ip) || 0;
    securityCache.honeypotHits.set(ip, currentCount + 1);

    // Adicionar IP à blacklist após 3 tentativas
    if (currentCount >= 2) {
      securityCache.blacklistedIPs.add(ip);
      console.log(`🚨 IP ${ip} BLACKLISTED - Honeypot triggered ${currentCount + 1} times`);
    }

    console.log(`🍯 HONEYPOT HIT: ${ip} tentou acessar ${endpoint}`);
    
    // Simular resposta real mas com delay
    setTimeout(() => {
      res.status(404).json({ error: 'Not found' });
    }, Math.random() * 2000 + 1000);
    return;
  }

  next();
};

// 🛡️ PROTEÇÃO CONTRA ATAQUES DE TIMING
export const timingAttackProtection = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Interceptar resposta para adicionar timing protection
  const originalSend = res.send;
  res.send = function(data) {
    const processingTime = Date.now() - startTime;
    const minTime = ADVANCED_SECURITY_CONFIG.TIMING_ATTACK_PROTECTION.minResponseTime;
    const jitter = Math.random() * ADVANCED_SECURITY_CONFIG.TIMING_ATTACK_PROTECTION.jitterRange;
    
    const delayNeeded = Math.max(0, minTime - processingTime + jitter);
    
    if (delayNeeded > 0) {
      setTimeout(() => {
        originalSend.call(this, data);
      }, delayNeeded);
    } else {
      originalSend.call(this, data);
    }
  };

  next();
};

// 🔒 ANÁLISE DE ASSINATURA DE ATAQUES
export const attackSignatureAnalyzer = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const fullRequest = `${req.method} ${req.originalUrl} ${JSON.stringify(req.body)} ${req.get('User-Agent')}`;
  
  // BYPASS CRÍTICO: Permitir localhost sempre
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return next();
  }
  
  const analyzer = BehavioralAnalyzer.getInstance();
  const analysis = analyzer.analyzeRequest(req);

  // Se risco alto, bloquear
  if (analysis.riskScore > 100) {
    securityCache.blacklistedIPs.add(ip);
    console.log(`🚨 HIGH RISK IP BLOCKED: ${ip} - Score: ${analysis.riskScore} - Threats: ${analysis.threats.join(', ')}`);
    return res.status(403).json({
      error: 'Acesso negado por atividade suspeita',
      code: 'HIGH_RISK_DETECTED'
    });
  }

  // Log atividade suspeita
  if (analysis.riskScore > 50) {
    console.log(`⚠️  SUSPICIOUS ACTIVITY: ${ip} - Score: ${analysis.riskScore} - Threats: ${analysis.threats.join(', ')}`);
  }

  next();
};

// 🔐 VERIFICAÇÃO DE INTEGRIDADE DE ARQUIVOS
export const fileIntegrityChecker = {
  criticalFiles: [
    'server/index.ts',
    'server/auth-hybrid.ts',
    'server/security.ts',
    'server/advanced-security.ts',
    'server/db-sqlite.ts'
  ],
  
  checksums: new Map<string, string>(),

  calculateChecksum(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      console.error(`❌ Erro ao calcular checksum de ${filePath}:`, error);
      return '';
    }
  },

  initializeChecksums(): void {
    console.log('🔐 Inicializando verificação de integridade...');
    for (const file of this.criticalFiles) {
      const checksum = this.calculateChecksum(file);
      if (checksum) {
        this.checksums.set(file, checksum);
        console.log(`✅ ${file}: ${checksum.substring(0, 8)}...`);
      }
    }
  },

  verifyIntegrity(): boolean {
    let allIntact = true;
    
    for (const file of this.criticalFiles) {
      const currentChecksum = this.calculateChecksum(file);
      const originalChecksum = this.checksums.get(file);
      
      if (originalChecksum && currentChecksum !== originalChecksum) {
        console.log(`🚨 ARQUIVO MODIFICADO DETECTADO: ${file}`);
        console.log(`Original: ${originalChecksum.substring(0, 8)}...`);
        console.log(`Atual: ${currentChecksum.substring(0, 8)}...`);
        allIntact = false;
      }
    }
    
    return allIntact;
  }
};

// 🛡️ MIDDLEWARE DE VERIFICAÇÃO DE BLACKLIST
export const blacklistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // BYPASS CRÍTICO: Permitir localhost sempre
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return next();
  }
  
  if (securityCache.blacklistedIPs.has(ip)) {
    console.log(`🚫 BLACKLISTED IP BLOCKED: ${ip}`);
    return res.status(403).json({
      error: 'Acesso permanentemente negado',
      code: 'IP_BLACKLISTED'
    });
  }
  
  next();
};

// 📊 RELATÓRIO DE SEGURANÇA AVANÇADO
export const getAdvancedSecurityReport = () => {
  const analyzer = BehavioralAnalyzer.getInstance();
  
  return {
    timestamp: new Date().toISOString(),
    blacklistedIPs: Array.from(securityCache.blacklistedIPs),
    honeypotHits: Object.fromEntries(securityCache.honeypotHits),
    highRiskIPs: Array.from(securityCache.suspiciousIPs.entries())
      .filter(([_, data]) => data.count > 10)
      .map(([ip, data]) => ({ ip, ...data })),
    attackPatterns: Array.from(securityCache.attackPatterns.entries())
      .map(([pattern, data]) => ({ pattern, ...data })),
    fileIntegrityStatus: fileIntegrityChecker.verifyIntegrity(),
    securityLevel: 'MAXIMUM',
    activeProtections: [
      'Rate Limiting',
      'Behavioral Analysis',
      'Honeypot System', 
      'Timing Attack Protection',
      'Attack Signature Detection',
      'File Integrity Monitoring',
      'IP Blacklisting'
    ]
  };
};

// 🔧 INICIALIZAÇÃO DO SISTEMA AVANÇADO
export const initAdvancedSecurity = () => {
  console.log('🔒 Inicializando Sistema de Segurança Avançado...');
  
  // Inicializar verificação de integridade
  fileIntegrityChecker.initializeChecksums();
  
  // Verificar integridade a cada 5 minutos
  setInterval(() => {
    if (!fileIntegrityChecker.verifyIntegrity()) {
      console.log('🚨 ALERTA: Possível comprometimento detectado!');
    }
  }, 5 * 60 * 1000);
  
  // Limpeza de cache a cada hora
  setInterval(() => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Limpar dados antigos
    for (const [ip, data] of securityCache.suspiciousIPs.entries()) {
      if (data.lastSeen < oneHourAgo) {
        securityCache.suspiciousIPs.delete(ip);
      }
    }
    
    console.log('🧹 Cache de segurança limpo');
  }, 60 * 60 * 1000);
  
  console.log('✅ Sistema de Segurança Avançado ativado!');
};

export default {
  honeypotMiddleware,
  timingAttackProtection,
  attackSignatureAnalyzer,
  blacklistMiddleware,
  getAdvancedSecurityReport,
  initAdvancedSecurity,
  BehavioralAnalyzer
};
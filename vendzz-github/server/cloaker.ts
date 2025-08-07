
import type { Request, Response, NextFunction } from 'express';
import { cache } from './cache';

export interface CloakerConfig {
  isEnabled: boolean;
  requiredUTMParams: string[];
  blockAdLibrary: boolean;
  blockDirectAccess: boolean;
  blockPage: 'maintenance' | 'unavailable' | 'custom';
  customBlockMessage?: string;
  whitelistedIPs?: string[];
  maxAttemptsPerIP: number;
  blockDuration: number; // em minutos
}

export interface CloakerDetection {
  isBlocked: boolean;
  reason: string;
  clientIP: string;
  userAgent: string;
  referrer: string;
  utmParams: Record<string, string>;
  timestamp: Date;
}

class CloakerService {
  private blockedIPs = new Map<string, { count: number; blockedUntil: Date }>();
  private detectionLog: CloakerDetection[] = [];

  // Detectar se é acesso via Ad Library
  private isAdLibraryAccess(req: Request): boolean {
    const referrer = req.get('Referer') || '';
    const userAgent = req.get('User-Agent') || '';

    const adLibraryIndicators = [
      // Referrers da Ad Library
      referrer.includes('facebook.com/ads/library'),
      referrer.includes('facebook.com/ads/manager'),
      referrer.includes('ads.facebook.com'),
      
      // User agents suspeitos
      userAgent.includes('facebookexternalhit'),
      userAgent.includes('FacebookBot'),
      userAgent.includes('facebookcatalog'),
      
      // Padrões específicos da moderação
      userAgent.includes('FacebookAdReviewBot'),
      userAgent.includes('facebook-moderation'),
    ];

    return adLibraryIndicators.some(indicator => indicator);
  }

  // Verificar UTM parameters
  private hasValidUTM(req: Request, requiredParams: string[]): boolean {
    const query = req.query;
    
    return requiredParams.every(param => {
      const value = query[param];
      return value && typeof value === 'string' && value.trim() !== '';
    });
  }

  // Detectar acesso suspeito
  private isSuspiciousAccess(req: Request): boolean {
    const userAgent = req.get('User-Agent') || '';
    const referrer = req.get('Referer') || '';

    const suspiciousPatterns = [
      // Bots de moderação
      /facebook.*bot/i,
      /meta.*crawler/i,
      /instagram.*bot/i,
      
      // Ferramentas de análise
      /adspy/i,
      /bigspy/i,
      /dropship.*spy/i,
      /facebook.*spy/i,
      
      // Padrões de automação
      /selenium/i,
      /puppeteer/i,
      /playwright/i,
      /webdriver/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Verificar IP bloqueado
  private isIPBlocked(ip: string): boolean {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) return false;

    if (new Date() > blocked.blockedUntil) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  // Incrementar tentativas de IP
  private incrementIPAttempts(ip: string, maxAttempts: number, blockDuration: number) {
    const current = this.blockedIPs.get(ip) || { count: 0, blockedUntil: new Date() };
    current.count++;

    if (current.count >= maxAttempts) {
      current.blockedUntil = new Date(Date.now() + blockDuration * 60 * 1000);
    }

    this.blockedIPs.set(ip, current);
  }

  // Análise principal de detecção
  public analyzeRequest(req: Request, config: CloakerConfig): CloakerDetection {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    const referrer = req.get('Referer') || '';
    
    // Extrair UTM parameters
    const utmParams: Record<string, string> = {};
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('utm_')) {
        utmParams[key] = String(req.query[key] || '');
      }
    });

    const detection: CloakerDetection = {
      isBlocked: false,
      reason: '',
      clientIP,
      userAgent,
      referrer,
      utmParams,
      timestamp: new Date()
    };

    // Se cloaker desabilitado, permitir tudo
    if (!config.isEnabled) {
      return detection;
    }

    // Verificar whitelist de IPs
    if (config.whitelistedIPs?.includes(clientIP)) {
      return detection;
    }

    // Verificar IP bloqueado
    if (this.isIPBlocked(clientIP)) {
      detection.isBlocked = true;
      detection.reason = 'IP temporariamente bloqueado por múltiplas tentativas suspeitas';
      return detection;
    }

    // Detectar Ad Library
    if (config.blockAdLibrary && this.isAdLibraryAccess(req)) {
      detection.isBlocked = true;
      detection.reason = 'Acesso detectado via Facebook Ad Library';
      this.incrementIPAttempts(clientIP, config.maxAttemptsPerIP, config.blockDuration);
      this.logDetection(detection);
      return detection;
    }

    // Verificar UTM obrigatório
    if (!this.hasValidUTM(req, config.requiredUTMParams)) {
      detection.isBlocked = true;
      detection.reason = `Parâmetros UTM obrigatórios ausentes: ${config.requiredUTMParams.join(', ')}`;
      this.incrementIPAttempts(clientIP, config.maxAttemptsPerIP, config.blockDuration);
      this.logDetection(detection);
      return detection;
    }

    // Detectar acesso direto suspeito
    if (config.blockDirectAccess && !referrer && Object.keys(utmParams).length === 0) {
      detection.isBlocked = true;
      detection.reason = 'Acesso direto sem referrer ou UTM parameters';
      this.incrementIPAttempts(clientIP, config.maxAttemptsPerIP, config.blockDuration);
      this.logDetection(detection);
      return detection;
    }

    // Detectar bots suspeitos
    if (this.isSuspiciousAccess(req)) {
      detection.isBlocked = true;
      detection.reason = 'User-Agent suspeito detectado (possível bot de moderação)';
      this.incrementIPAttempts(clientIP, config.maxAttemptsPerIP, config.blockDuration);
      this.logDetection(detection);
      return detection;
    }

    return detection;
  }

  // Middleware de cloaker
  public middleware(config: CloakerConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const detection = this.analyzeRequest(req, config);

      if (detection.isBlocked) {
        console.log(`🚫 CLOAKER BLOCK: ${detection.reason} - IP: ${detection.clientIP}`);
        
        // Retornar página de bloqueio
        return this.renderBlockPage(res, config, detection);
      }

      next();
    };
  }

  // Renderizar página de bloqueio
  private renderBlockPage(res: Response, config: CloakerConfig, detection: CloakerDetection) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    let content = '';
    
    switch (config.blockPage) {
      case 'maintenance':
        content = this.getMaintenancePage();
        break;
      case 'unavailable':
        content = this.getUnavailablePage();
        break;
      case 'custom':
        content = this.getCustomPage(config.customBlockMessage || 'Acesso não autorizado');
        break;
      default:
        content = this.getMaintenancePage();
    }

    res.status(503).send(content);
  }

  // Página de manutenção
  private getMaintenancePage(): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site em Manutenção</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #666; margin-bottom: 20px; }
        p { color: #888; line-height: 1.6; }
        .icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>Site em Manutenção</h1>
        <p>Estamos realizando melhorias em nosso sistema.</p>
        <p>Por favor, tente novamente em alguns minutos.</p>
        <p><small>Obrigado pela compreensão.</small></p>
    </div>
</body>
</html>`;
  }

  // Página indisponível
  private getUnavailablePage(): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página Indisponível</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #666; margin-bottom: 20px; }
        p { color: #888; line-height: 1.6; }
        .icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">⚠️</div>
        <h1>Página Indisponível</h1>
        <p>Esta página está temporariamente indisponível.</p>
        <p>Tente acessar novamente mais tarde.</p>
    </div>
</body>
</html>`;
  }

  // Página customizada
  private getCustomPage(message: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso Restrito</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #666; margin-bottom: 20px; }
        p { color: #888; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Acesso Restrito</h1>
        <p>${message}</p>
    </div>
</body>
</html>`;
  }

  // Log de detecções
  private logDetection(detection: CloakerDetection) {
    this.detectionLog.push(detection);
    
    // Manter apenas as últimas 1000 detecções
    if (this.detectionLog.length > 1000) {
      this.detectionLog = this.detectionLog.slice(-1000);
    }
  }

  // Obter estatísticas
  public getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recent = this.detectionLog.filter(d => d.timestamp > last24h);
    
    const stats = {
      totalBlocks: this.detectionLog.length,
      blocksLast24h: recent.length,
      blockedIPs: this.blockedIPs.size,
      topReasons: this.getTopBlockReasons(recent),
      topUserAgents: this.getTopUserAgents(recent),
      blocksByHour: this.getBlocksByHour(recent)
    };

    return stats;
  }

  private getTopBlockReasons(detections: CloakerDetection[]) {
    const reasons = new Map<string, number>();
    detections.forEach(d => {
      reasons.set(d.reason, (reasons.get(d.reason) || 0) + 1);
    });
    
    return Array.from(reasons.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));
  }

  private getTopUserAgents(detections: CloakerDetection[]) {
    const agents = new Map<string, number>();
    detections.forEach(d => {
      const shortAgent = d.userAgent.substring(0, 50);
      agents.set(shortAgent, (agents.get(shortAgent) || 0) + 1);
    });
    
    return Array.from(agents.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([agent, count]) => ({ agent, count }));
  }

  private getBlocksByHour(detections: CloakerDetection[]) {
    const hours = new Array(24).fill(0);
    detections.forEach(d => {
      const hour = d.timestamp.getHours();
      hours[hour]++;
    });
    return hours;
  }

  // Limpar logs antigos
  public cleanup() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias
    this.detectionLog = this.detectionLog.filter(d => d.timestamp > cutoff);
    
    // Limpar IPs expirados
    for (const [ip, data] of this.blockedIPs.entries()) {
      if (new Date() > data.blockedUntil) {
        this.blockedIPs.delete(ip);
      }
    }
  }
}

export const cloakerService = new CloakerService();

// Cleanup automático a cada hora
setInterval(() => {
  cloakerService.cleanup();
}, 60 * 60 * 1000);

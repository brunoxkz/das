/**
 * MONITOR DE RATE LIMITING EM TEMPO REAL
 * 
 * Sistema para acompanhar consumo de rate limiting, detectar padrões
 * de uso e alertar sobre possíveis necessidades de ajuste de limites.
 */

import { Request } from 'express';

// Interface para estatísticas de rate limiting
interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  blockRate: number;
  lastBlockedAt?: Date;
  topBlockedIPs: Array<{ ip: string; count: number; lastBlocked: Date }>;
  topBlockedPaths: Array<{ path: string; count: number; category: string }>;
  categoryStats: {
    [category: string]: {
      requests: number;
      blocked: number;
      rate: number;
    };
  };
  timeSeriesData: Array<{
    timestamp: Date;
    requests: number;
    blocked: number;
    category: string;
  }>;
}

// Armazenamento em memória para estatísticas
class RateLimitingMonitor {
  private stats: RateLimitStats;
  private requestLog: Array<{
    timestamp: Date;
    ip: string;
    path: string;
    category: string;
    blocked: boolean;
    userAgent: string;
    limit: number;
    current: number;
  }> = [];

  private blockedIPs: Map<string, {
    count: number;
    firstBlocked: Date;
    lastBlocked: Date;
    reasons: string[];
  }> = new Map();

  private categoryLimits: Map<string, number> = new Map([
    ['assets', 10000],
    ['automatic', 2000], 
    ['quiz-complex', 1000],
    ['authenticated', 300],
    ['push-notifications', 1000],
    ['default', 100]
  ]);

  constructor() {
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      allowedRequests: 0,
      blockRate: 0,
      topBlockedIPs: [],
      topBlockedPaths: [],
      categoryStats: {},
      timeSeriesData: []
    };
    
    // Limpar dados antigos a cada hora
    setInterval(() => this.cleanOldData(), 60 * 60 * 1000);
  }

  // Registrar tentativa de requisição
  logRequest(req: Request, category: string, blocked: boolean, limit: number, current: number) {
    const now = new Date();
    const ip = this.getClientIP(req);
    
    // Log da requisição
    const logEntry = {
      timestamp: now,
      ip: ip,
      path: req.path,
      category: category,
      blocked: blocked,
      userAgent: req.get('User-Agent') || 'unknown',
      limit: limit,
      current: current
    };
    
    this.requestLog.push(logEntry);
    
    // Manter apenas últimas 10.000 requisições
    if (this.requestLog.length > 10000) {
      this.requestLog = this.requestLog.slice(-5000);
    }
    
    // Atualizar estatísticas
    this.updateStats(logEntry);
    
    // Se foi bloqueado, registrar IP
    if (blocked) {
      this.trackBlockedIP(ip, req.path, category);
    }
  }

  private updateStats(logEntry: any) {
    this.stats.totalRequests++;
    
    if (logEntry.blocked) {
      this.stats.blockedRequests++;
      this.stats.lastBlockedAt = logEntry.timestamp;
    } else {
      this.stats.allowedRequests++;
    }
    
    this.stats.blockRate = (this.stats.blockedRequests / this.stats.totalRequests) * 100;
    
    // Estatísticas por categoria
    if (!this.stats.categoryStats[logEntry.category]) {
      this.stats.categoryStats[logEntry.category] = {
        requests: 0,
        blocked: 0,
        rate: 0
      };
    }
    
    const catStats = this.stats.categoryStats[logEntry.category];
    catStats.requests++;
    if (logEntry.blocked) catStats.blocked++;
    catStats.rate = (catStats.blocked / catStats.requests) * 100;
    
    // Dados de série temporal (últimos 60 pontos, 1 por minuto)
    const minute = Math.floor(logEntry.timestamp.getTime() / 60000) * 60000;
    const existingPoint = this.stats.timeSeriesData.find(
      point => point.timestamp.getTime() === minute && point.category === logEntry.category
    );
    
    if (existingPoint) {
      existingPoint.requests++;
      if (logEntry.blocked) existingPoint.blocked++;
    } else {
      this.stats.timeSeriesData.push({
        timestamp: new Date(minute),
        requests: 1,
        blocked: logEntry.blocked ? 1 : 0,
        category: logEntry.category
      });
    }
    
    // Manter apenas últimos 60 minutos
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.stats.timeSeriesData = this.stats.timeSeriesData.filter(
      point => point.timestamp.getTime() > oneHourAgo
    );
    
    // Atualizar top listas
    this.updateTopLists();
  }

  private trackBlockedIP(ip: string, path: string, category: string) {
    const now = new Date();
    
    if (this.blockedIPs.has(ip)) {
      const existing = this.blockedIPs.get(ip)!;
      existing.count++;
      existing.lastBlocked = now;
      existing.reasons.push(`${path} (${category})`);
      
      // Manter apenas últimas 10 razões
      if (existing.reasons.length > 10) {
        existing.reasons = existing.reasons.slice(-5);
      }
    } else {
      this.blockedIPs.set(ip, {
        count: 1,
        firstBlocked: now,
        lastBlocked: now,
        reasons: [`${path} (${category})`]
      });
    }
  }

  private updateTopLists() {
    // Top IPs bloqueados
    const ipCounts = new Map<string, number>();
    const ipLastBlocked = new Map<string, Date>();
    
    this.requestLog
      .filter(entry => entry.blocked)
      .forEach(entry => {
        ipCounts.set(entry.ip, (ipCounts.get(entry.ip) || 0) + 1);
        ipLastBlocked.set(entry.ip, entry.timestamp);
      });
    
    this.stats.topBlockedIPs = Array.from(ipCounts.entries())
      .map(([ip, count]) => ({
        ip,
        count,
        lastBlocked: ipLastBlocked.get(ip)!
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Top paths bloqueados
    const pathCounts = new Map<string, { count: number; category: string }>();
    
    this.requestLog
      .filter(entry => entry.blocked)
      .forEach(entry => {
        if (pathCounts.has(entry.path)) {
          pathCounts.get(entry.path)!.count++;
        } else {
          pathCounts.set(entry.path, { count: 1, category: entry.category });
        }
      });
    
    this.stats.topBlockedPaths = Array.from(pathCounts.entries())
      .map(([path, data]) => ({
        path,
        count: data.count,
        category: data.category
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private cleanOldData() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Limpar log de requisições antigas
    this.requestLog = this.requestLog.filter(
      entry => entry.timestamp.getTime() > oneHourAgo
    );
    
    // Limpar IPs bloqueados antigos
    const ipsToDelete: string[] = [];
    this.blockedIPs.forEach((data, ip) => {
      if (data.lastBlocked.getTime() < oneHourAgo) {
        ipsToDelete.push(ip);
      }
    });
    ipsToDelete.forEach(ip => this.blockedIPs.delete(ip));
    
    // Recalcular estatísticas após limpeza
    this.recalculateStats();
  }

  private recalculateStats() {
    // Reset stats
    this.stats.totalRequests = this.requestLog.length;
    this.stats.blockedRequests = this.requestLog.filter(entry => entry.blocked).length;
    this.stats.allowedRequests = this.stats.totalRequests - this.stats.blockedRequests;
    this.stats.blockRate = this.stats.totalRequests > 0 ? 
      (this.stats.blockedRequests / this.stats.totalRequests) * 100 : 0;
    
    // Reset category stats
    this.stats.categoryStats = {};
    
    // Recalcular tudo
    this.requestLog.forEach(entry => {
      if (!this.stats.categoryStats[entry.category]) {
        this.stats.categoryStats[entry.category] = {
          requests: 0,
          blocked: 0,
          rate: 0
        };
      }
      
      const catStats = this.stats.categoryStats[entry.category];
      catStats.requests++;
      if (entry.blocked) catStats.blocked++;
      catStats.rate = (catStats.blocked / catStats.requests) * 100;
    });
    
    this.updateTopLists();
  }

  private getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  // Métodos públicos para acessar dados
  getStats(): RateLimitStats {
    return { ...this.stats };
  }

  getRecentRequests(limit: number = 100) {
    return this.requestLog
      .slice(-limit)
      .reverse(); // Mais recentes primeiro
  }

  getBlockedIPDetails(ip: string) {
    return this.blockedIPs.get(ip) || null;
  }

  getAllBlockedIPs() {
    const result: Array<{ip: string; count: number; firstBlocked: Date; lastBlocked: Date; reasons: string[]}> = [];
    this.blockedIPs.forEach((data, ip) => {
      result.push({
        ip,
        ...data
      });
    });
    return result;
  }

  // Análise de tendências
  getTrendAnalysis() {
    const recentRequests = this.requestLog.slice(-1000); // Últimas 1000 requisições
    const categoryCounts = new Map<string, number>();
    
    recentRequests.forEach(req => {
      categoryCounts.set(req.category, (categoryCounts.get(req.category) || 0) + 1);
    });
    
    const totalRecent = recentRequests.length;
    const trends = Array.from(categoryCounts.entries()).map(([category, count]) => {
      const percentage = (count / totalRecent) * 100;
      const limit = this.categoryLimits.get(category) || 100;
      const utilizationRate = (count / limit) * 100;
      
      return {
        category,
        requestCount: count,
        percentage: percentage,
        currentLimit: limit,
        utilizationRate: utilizationRate,
        needsIncrease: utilizationRate > 80, // Alerta se usar mais de 80% do limite
        recommendedLimit: utilizationRate > 80 ? Math.ceil(limit * 1.5) : limit
      };
    });
    
    return trends.sort((a, b) => b.utilizationRate - a.utilizationRate);
  }

  // Alertas e recomendações
  getAlerts() {
    const alerts = [];
    const trends = this.getTrendAnalysis();
    
    // Alerta para categorias com alta utilização
    trends.forEach(trend => {
      if (trend.needsIncrease) {
        alerts.push({
          type: 'HIGH_UTILIZATION',
          category: trend.category,
          message: `Categoria ${trend.category} está usando ${trend.utilizationRate.toFixed(1)}% do limite`,
          recommendation: `Aumentar limite de ${trend.currentLimit} para ${trend.recommendedLimit}`,
          severity: trend.utilizationRate > 95 ? 'CRITICAL' : 'WARNING'
        });
      }
    });
    
    // Alerta para muitos bloqueios
    if (this.stats.blockRate > 10) {
      alerts.push({
        type: 'HIGH_BLOCK_RATE',
        message: `Taxa de bloqueio alta: ${this.stats.blockRate.toFixed(1)}%`,
        recommendation: 'Revisar limites ou investigar possível ataque',
        severity: this.stats.blockRate > 25 ? 'CRITICAL' : 'WARNING'
      });
    }
    
    // Alerta para IPs suspeitos
    this.stats.topBlockedIPs.forEach(blockedIP => {
      if (blockedIP.count > 100) {
        alerts.push({
          type: 'SUSPICIOUS_IP',
          ip: blockedIP.ip,
          message: `IP ${blockedIP.ip} foi bloqueado ${blockedIP.count} vezes`,
          recommendation: 'Considerar banimento temporário ou investigação',
          severity: blockedIP.count > 500 ? 'CRITICAL' : 'WARNING'
        });
      }
    });
    
    return alerts;
  }
}

// Instância singleton
export const rateLimitMonitor = new RateLimitingMonitor();

// Middleware para log automático
export function logRateLimitAttempt(req: Request, category: string, blocked: boolean, limit: number, current: number) {
  rateLimitMonitor.logRequest(req, category, blocked, limit, current);
}
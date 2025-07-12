import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

// Sistema de rate limiting otimizado para 100k+ usuários simultâneos
export class HighPerformanceRateLimiter {
  private clients: Map<string, ClientRecord>;
  private options: RateLimitOptions;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: RateLimitOptions) {
    this.options = {
      statusCode: 429,
      message: 'Muitas requisições detectadas. Tente novamente em alguns minutos.',
      ...options
    };
    
    this.clients = new Map();
    
    // OTIMIZAÇÃO: Limpeza mais frequente para 1000+ users (30s ao invés de 60s)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  private getClientKey(req: Request): string {
    // Identificar processos internos com key especial
    const userAgent = req.get('User-Agent') || '';
    const internalProcesses = [
      '/api/ultra-scale',
      '/api/auto-detection', 
      '/api/scheduled-campaigns',
      '/api/background-jobs'
    ];
    
    // Processos internos usam key especial para não serem limitados
    if (internalProcesses.some(path => req.path.includes(path))) {
      return `internal-${req.path}`;
    }
    
    if (userAgent.includes('UltraScale') || userAgent.includes('AutoDetection')) {
      return `internal-${userAgent}`;
    }
    
    // Prioriza user ID se autenticado, senão usa IP
    return req.user?.id || req.ip || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    const MAX_CLIENTS = 50000; // LIMITE aumentado para 100k+ usuários
    
    this.clients.forEach((record, key) => {
      if (record.resetTime <= now) {
        toDelete.push(key);
      }
    });
    
    // CRÍTICO: Se Map cresceu muito, remove entradas antigas mesmo que não expiradas
    if (this.clients.size > MAX_CLIENTS) {
      const excess = this.clients.size - MAX_CLIENTS;
      const allKeys = Array.from(this.clients.keys());
      const oldestKeys = allKeys.slice(0, excess); // Remove os mais antigos
      oldestKeys.forEach(key => {
        if (!toDelete.includes(key)) {
          toDelete.push(key);
        }
      });
      console.log(`⚠️ [RateLimit] Força limpeza: ${excess} clientes em excesso removidos`);
    }
    
    toDelete.forEach(key => this.clients.delete(key));
    
    // Log de limpeza para monitoramento
    if (toDelete.length > 0) {
      console.log(`[RateLimit] Cleaned ${toDelete.length} expired records. Active: ${this.clients.size}`);
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientKey = this.getClientKey(req);
      const now = Date.now();
      
      let client = this.clients.get(clientKey);
      
      if (!client || client.resetTime <= now) {
        // Nova janela de tempo
        client = {
          count: 1,
          resetTime: now + this.options.windowMs
        };
      } else {
        // Incrementa contador
        client.count++;
      }
      
      this.clients.set(clientKey, client);
      
      // Headers informativos
      res.setHeader('X-RateLimit-Limit', this.options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.options.maxRequests - client.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(client.resetTime / 1000));
      
      // Não limitar processos internos
      if (clientKey.startsWith('internal-')) {
        // Processos internos têm limite muito alto (100x mais)
        if (client.count > (this.options.maxRequests * 100)) {
          console.log(`⚠️ [RateLimit] Processo interno ${clientKey} com ${client.count} requests`);
          return res.status(this.options.statusCode!).json({
            error: this.options.message,
            retryAfter: Math.ceil((client.resetTime - now) / 1000)
          });
        }
      } else if (client.count > this.options.maxRequests) {
        return res.status(this.options.statusCode!).json({
          error: this.options.message,
          retryAfter: Math.ceil((client.resetTime - now) / 1000)
        });
      }
      
      next();
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clients.clear();
  }

  getStats(): { totalClients: number; memoryUsage: number } {
    return {
      totalClients: this.clients.size,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }
}

// Rate limiters otimizados para 100.000+ usuários simultâneos
export const createRateLimiters = () => {
  return {
    // API geral - 5000 req/min por usuário (5x mais)
    general: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 5000,
      message: 'Limite de requisições da API excedido'
    }),

    // Login/Auth - 50 req/min por IP (5x mais para múltiplos usuários/proxy)
    auth: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto  
      maxRequests: 50,
      message: 'Muitas tentativas de login. Tente novamente em 1 minuto.'
    }),

    // Upload de arquivos - 100 req/min por usuário (5x mais)
    upload: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 100,
      message: 'Limite de uploads excedido'
    }),

    // Dashboard - 500 req/min por usuário (5x mais - cache inteligente)
    dashboard: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 500,
      message: 'Muitas consultas ao dashboard'
    }),

    // Quiz creation - 200 req/min por usuário (4x mais para edição intensiva)
    quizCreation: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 200,
      message: 'Limite de criação/edição de quizzes excedido'
    })
  };
};

// Singleton para rate limiters
export const rateLimiters = createRateLimiters();
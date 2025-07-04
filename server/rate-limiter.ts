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
      message: 'Muitas requisições. Tente novamente em alguns segundos.',
      ...options
    };
    
    this.clients = new Map();
    
    // Limpeza automática a cada minuto para liberar memória
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private getClientKey(req: Request): string {
    // Prioriza user ID se autenticado, senão usa IP
    return req.user?.id || req.ip || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.clients.forEach((record, key) => {
      if (record.resetTime <= now) {
        toDelete.push(key);
      }
    });
    
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
      
      if (client.count > this.options.maxRequests) {
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

// Rate limiters específicos para diferentes endpoints
export const createRateLimiters = () => {
  return {
    // API geral - 1000 req/min por usuário
    general: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 1000,
      message: 'Limite de requisições da API excedido'
    }),

    // Login/Auth - 10 req/min por IP
    auth: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto  
      maxRequests: 10,
      message: 'Muitas tentativas de login. Tente novamente em 1 minuto.'
    }),

    // Upload de arquivos - 20 req/min por usuário
    upload: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 20,
      message: 'Limite de uploads excedido'
    }),

    // Dashboard - 100 req/min por usuário (cache ajuda)
    dashboard: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 100,
      message: 'Muitas consultas ao dashboard'
    }),

    // Quiz creation - 50 req/min por usuário
    quizCreation: new HighPerformanceRateLimiter({
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 50,
      message: 'Limite de criação/edição de quizzes excedido'
    })
  };
};

// Singleton para rate limiters
export const rateLimiters = createRateLimiters();
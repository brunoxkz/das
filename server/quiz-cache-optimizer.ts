/**
 * OTIMIZADOR DE CACHE ESPECÍFICO PARA QUIZ PAGES
 * 
 * Sistema ultra-rápido focado em eliminar travamentos
 * Suporte para milhões de acessos simultâneos
 */

import { cache } from './cache';
import { storage } from './storage-sqlite';

interface QuizCacheConfig {
  publicTTL: number;
  responseTTL: number;
  analyticsLTL: number;
  maxEntries: number;
  compressionThreshold: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  avgResponseTime: number;
  hitRate: number;
  memoryUsage: number;
}

class QuizCacheOptimizer {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    hitRate: 0,
    memoryUsage: 0
  };

  private config: QuizCacheConfig = {
    publicTTL: 300,        // 5 minutos para quiz público
    responseTTL: 60,       // 1 minuto para respostas
    analyticsLTL: 180,     // 3 minutos para analytics
    maxEntries: 5000,      // 5K entradas máximas
    compressionThreshold: 2048 // 2KB threshold para compressão
  };

  /**
   * CACHE OTIMIZADO PARA QUIZ PÚBLICO
   */
  async cachePublicQuiz(quizId: string, quiz: any): Promise<void> {
    const cacheKey = `quiz-public-${quizId}`;
    
    try {
      // Adicionar metadados de cache
      const cacheData = {
        ...quiz,
        _cached: true,
        _cachedAt: Date.now(),
        _version: quiz.updatedAt || Date.now()
      };

      cache.set(cacheKey, cacheData, this.config.publicTTL);
      
      console.log(`📦 Quiz ${quizId} cached (TTL: ${this.config.publicTTL}s)`);
    } catch (error) {
      console.error('❌ Erro ao cache quiz:', error);
    }
  }

  /**
   * RECUPERAR QUIZ CACHE ULTRA-RÁPIDO
   */
  async getPublicQuiz(quizId: string): Promise<any | null> {
    const startTime = Date.now();
    const cacheKey = `quiz-public-${quizId}`;
    
    try {
      const cached = cache.get(cacheKey);
      const responseTime = Date.now() - startTime;
      
      if (cached) {
        this.updateStats('hit', responseTime);
        console.log(`⚡ Quiz ${quizId} cache HIT (${responseTime}ms)`);
        return cached;
      }
      
      this.updateStats('miss', responseTime);
      console.log(`❌ Quiz ${quizId} cache MISS`);
      return null;
    } catch (error) {
      console.error('❌ Erro no cache quiz:', error);
      return null;
    }
  }

  /**
   * INVALIDAÇÃO INTELIGENTE DE CACHE
   */
  async invalidateQuiz(quizId: string, reason = 'update'): Promise<void> {
    const keys = [
      `quiz-public-${quizId}`,
      `quiz-analytics-${quizId}`,
      `quiz-responses-${quizId}`,
      `quiz-leads-${quizId}`
    ];

    keys.forEach(key => cache.del(key));
    
    console.log(`🗑️ Quiz ${quizId} cache invalidated (reason: ${reason})`);
  }

  /**
   * PRE-WARMING DE CACHE PARA QUIZZES POPULARES
   */
  async prewarmPopularQuizzes(): Promise<void> {
    try {
      console.log('🔥 Pre-warming cache para quizzes populares...');
      
      // Buscar quizzes mais acessados
      const popularQuizzes = await this.getPopularQuizzes();
      
      for (const quiz of popularQuizzes) {
        if (!cache.get(`quiz-public-${quiz.id}`)) {
          await this.cachePublicQuiz(quiz.id, quiz);
        }
      }
      
      console.log(`✅ Pre-warmed ${popularQuizzes.length} quizzes`);
    } catch (error) {
      console.error('❌ Erro no pre-warming:', error);
    }
  }

  /**
   * BUSCAR QUIZZES POPULARES
   */
  private async getPopularQuizzes(): Promise<any[]> {
    try {
      // Implementar lógica para identificar quizzes populares
      // Por enquanto, retornar os 10 mais recentes publicados
      const allQuizzes = await storage.getAllQuizzes();
      return allQuizzes
        .filter(quiz => quiz.isPublished)
        .slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar quizzes populares:', error);
      return [];
    }
  }

  /**
   * LIMPEZA AUTOMÁTICA DE CACHE
   */
  async cleanupCache(): Promise<void> {
    try {
      const stats = cache.getStats();
      let cleaned = 0;
      
      // Usar método correto para obter chaves do NodeCache
      const keys = cache.cache ? cache.cache.keys() : [];
      
      // Limpar entradas expiradas manualmente
      keys.forEach(key => {
        if (key.startsWith('quiz-') && Math.random() < 0.1) {
          // 10% chance de verificar se deve limpar
          const data = cache.get(key);
          if (!data) {
            cache.del(key);
            cleaned++;
          }
        }
      });

      if (cleaned > 0) {
        console.log(`🧹 Cache cleanup: ${cleaned} entradas removidas`);
      }
    } catch (error) {
      console.error('❌ Erro na limpeza de cache:', error);
    }
  }

  /**
   * ATUALIZAR ESTATÍSTICAS
   */
  private updateStats(type: 'hit' | 'miss', responseTime: number): void {
    this.stats.totalRequests++;
    
    if (type === 'hit') {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    
    // Calcular média móvel do tempo de resposta
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime + responseTime) / 2;
    
    // Calcular hit rate
    this.stats.hitRate = 
      (this.stats.hits / this.stats.totalRequests) * 100;
  }

  /**
   * OBTER ESTATÍSTICAS DE PERFORMANCE
   */
  getStats(): CacheStats & { config: QuizCacheConfig } {
    const memUsage = process.memoryUsage();
    this.stats.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    return {
      ...this.stats,
      config: this.config
    };
  }

  /**
   * MIDDLEWARE EXPRESS PARA CACHE AUTOMÁTICO
   */
  createCacheMiddleware() {
    return async (req: any, res: any, next: any) => {
      const quizId = req.params.id;
      
      if (!quizId) {
        return next();
      }

      // Tentar cache primeiro
      const cached = await this.getPublicQuiz(quizId);
      
      if (cached) {
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-TTL': this.config.publicTTL.toString(),
          'ETag': `"quiz-${quizId}-${cached._version}"`,
          'Last-Modified': new Date(cached._cachedAt).toUTCString()
        });
        
        return res.json(cached);
      }

      // Cache miss - adicionar hook para cache na resposta
      const originalJson = res.json;
      res.json = (data: any) => {
        // Cache automaticamente após resposta
        this.cachePublicQuiz(quizId, data).catch(console.error);
        
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-TTL': this.config.publicTTL.toString()
        });
        
        return originalJson.call(res, data);
      };

      next();
    };
  }

  /**
   * INICIALIZAR SISTEMA DE CACHE
   */
  async initialize(): Promise<void> {
    console.log('🚀 Inicializando QuizCacheOptimizer...');
    
    // Pre-warming inicial
    await this.prewarmPopularQuizzes();
    
    // Limpeza periódica
    setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // A cada 5 minutos
    
    // Stats periódicas
    setInterval(() => {
      const stats = this.getStats();
      if (stats.totalRequests > 0) {
        console.log(`📊 Cache Stats: ${stats.hits}H/${stats.misses}M (${stats.hitRate.toFixed(1)}% hit rate) | Avg: ${stats.avgResponseTime.toFixed(1)}ms | Mem: ${stats.memoryUsage}MB`);
      }
    }, 60 * 1000); // A cada minuto
    
    console.log('✅ QuizCacheOptimizer inicializado');
  }
}

export const quizCacheOptimizer = new QuizCacheOptimizer();
/**
 * SISTEMA DE OTIMIZAÇÃO ULTRA-RÁPIDA PARA QUIZ PAGES
 * 
 * Focado em carregamento instantâneo e zero travamentos
 * Suporte para milhões de acessos simultâneos
 */

import NodeCache from 'node-cache';
import { gzipSync, deflateSync } from 'zlib';

interface QuizCacheItem {
  data: any;
  compressed: Buffer;
  etag: string;
  lastModified: number;
  size: number;
}

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  compressionRatio: number;
  requestsPerSecond: number;
  errorRate: number;
}

export class QuizPerformanceOptimizer {
  private static instance: QuizPerformanceOptimizer;
  
  // Cache multi-layer ultra-rápido
  private quizCache: NodeCache;
  private responseCache: NodeCache;
  private compressionCache: Map<string, Buffer> = new Map();
  
  // Métricas de performance
  private metrics: PerformanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    compressionRatio: 0,
    requestsPerSecond: 0,
    errorRate: 0
  };
  
  // Configurações otimizadas
  private readonly QUIZ_CACHE_TTL = 300; // 5 minutos
  private readonly RESPONSE_CACHE_TTL = 10; // 10 segundos
  private readonly MAX_CACHE_SIZE = 10000; // 10K entradas
  private readonly COMPRESSION_THRESHOLD = 1024; // 1KB

  static getInstance(): QuizPerformanceOptimizer {
    if (!QuizPerformanceOptimizer.instance) {
      QuizPerformanceOptimizer.instance = new QuizPerformanceOptimizer();
    }
    return QuizPerformanceOptimizer.instance;
  }

  constructor() {
    // Cache de quizzes (longa duração)
    this.quizCache = new NodeCache({
      stdTTL: this.QUIZ_CACHE_TTL,
      maxKeys: this.MAX_CACHE_SIZE,
      useClones: false, // Performance crítica
      deleteOnExpire: true,
      checkperiod: 60, // Check a cada minuto
    });

    // Cache de respostas (curta duração, alta frequência)
    this.responseCache = new NodeCache({
      stdTTL: this.RESPONSE_CACHE_TTL,
      maxKeys: this.MAX_CACHE_SIZE * 2,
      useClones: false,
      deleteOnExpire: true,
      checkperiod: 10, // Check a cada 10 segundos
    });

    this.initializeOptimizations();
    this.startMetricsCollection();
  }

  /**
   * CACHE ULTRA-RÁPIDO DE QUIZ COM COMPRESSÃO
   */
  async getQuizOptimized(quizId: string): Promise<QuizCacheItem | null> {
    const startTime = Date.now();
    
    try {
      // Tentar cache primeiro (sub-millisecond)
      const cached = this.quizCache.get<QuizCacheItem>(quizId);
      if (cached) {
        this.metrics.cacheHits++;
        this.updateResponseTime(Date.now() - startTime);
        return cached;
      }

      this.metrics.cacheMisses++;
      return null;
    } catch (error) {
      console.error('❌ Erro no cache otimizado:', error);
      this.metrics.errorRate++;
      return null;
    }
  }

  /**
   * ARMAZENAR QUIZ COM COMPRESSÃO INTELIGENTE
   */
  async setQuizOptimized(quizId: string, quizData: any): Promise<void> {
    try {
      const jsonData = JSON.stringify(quizData);
      const originalSize = Buffer.byteLength(jsonData, 'utf8');
      
      let compressed: Buffer;
      let compressionRatio = 1;

      // Comprimir apenas se valer a pena
      if (originalSize > this.COMPRESSION_THRESHOLD) {
        compressed = gzipSync(jsonData);
        compressionRatio = originalSize / compressed.length;
      } else {
        compressed = Buffer.from(jsonData, 'utf8');
      }

      const cacheItem: QuizCacheItem = {
        data: quizData,
        compressed,
        etag: this.generateETag(jsonData),
        lastModified: Date.now(),
        size: originalSize
      };

      // Armazenar no cache
      this.quizCache.set(quizId, cacheItem);
      
      // Estatísticas
      this.metrics.compressionRatio = 
        (this.metrics.compressionRatio + compressionRatio) / 2;
      
    } catch (error) {
      console.error('❌ Erro ao cache quiz:', error);
      this.metrics.errorRate++;
    }
  }

  /**
   * MIDDLEWARE ULTRA-RÁPIDO PARA QUIZ PAGES
   */
  createQuizMiddleware() {
    return async (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const quizId = req.params.id;
      
      try {
        // Headers de performance
        res.set({
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Powered-By': 'Vendzz-Turbo'
        });

        // Verificar cache otimizado
        const cached = await this.getQuizOptimized(quizId);
        
        if (cached) {
          // ETag verification
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch === cached.etag) {
            res.status(304).end();
            return;
          }

          // Resposta ultra-rápida do cache
          res.set({
            'ETag': cached.etag,
            'Last-Modified': new Date(cached.lastModified).toUTCString(),
            'Content-Encoding': 'gzip',
            'Content-Length': cached.compressed.length.toString(),
            'X-Cache': 'HIT',
            'X-Response-Time': `${Date.now() - startTime}ms`
          });

          res.type('application/json').send(cached.compressed);
          this.updateRequestMetrics();
          return;
        }

        // Cache miss - continuar para buscar no banco
        res.set('X-Cache', 'MISS');
        req.cacheStartTime = startTime;
        next();

      } catch (error) {
        console.error('❌ Erro no middleware quiz:', error);
        this.metrics.errorRate++;
        next(error);
      }
    };
  }

  /**
   * OTIMIZAÇÃO DE RESPOSTA DE QUIZ SUBMISSION
   */
  async optimizeQuizSubmission(req: any, res: any, next: any) {
    const startTime = Date.now();
    
    try {
      // Rate limiting inteligente
      const ip = req.ip || req.connection.remoteAddress;
      const submissionKey = `submission:${ip}:${req.params.id}`;
      
      // Verificar se submissão muito recente (possível spam)
      const recentSubmission = this.responseCache.get(submissionKey);
      if (recentSubmission) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          retryAfter: 10 
        });
      }

      // Marcar submissão para rate limiting
      this.responseCache.set(submissionKey, Date.now(), 10);

      // Validação ultra-rápida
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      // Headers de resposta otimizada
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`
      });

      next();

    } catch (error) {
      console.error('❌ Erro na otimização de submissão:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GERAÇÃO DE ETAG OTIMIZADA
   */
  private generateETag(content: string): string {
    const crypto = require('crypto');
    return `"${crypto.createHash('sha1').update(content).digest('hex').substring(0, 16)}"`;
  }

  /**
   * INICIALIZAR OTIMIZAÇÕES DO SISTEMA
   */
  private initializeOptimizations(): void {
    // Event listeners para limpeza automática
    this.quizCache.on('expired', (key, value) => {
      console.log(`🗑️ Cache expirado: ${key}`);
    });

    this.quizCache.on('set', (key, value) => {
      // Auto-cleanup se cache muito grande
      const stats = this.quizCache.getStats();
      if (stats.keys > this.MAX_CACHE_SIZE * 0.9) {
        this.cleanupOldEntries();
      }
    });

    console.log('⚡ QuizPerformanceOptimizer inicializado');
  }

  /**
   * LIMPEZA INTELIGENTE DE CACHE
   */
  private cleanupOldEntries(): void {
    const keys = this.quizCache.keys();
    const toDelete = Math.floor(keys.length * 0.1); // Deletar 10% mais antigos
    
    keys.slice(0, toDelete).forEach(key => {
      this.quizCache.del(key);
    });

    console.log(`🧹 Limpeza cache: ${toDelete} entradas removidas`);
  }

  /**
   * COLETA DE MÉTRICAS EM TEMPO REAL
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      const quizStats = this.quizCache.getStats();
      const responseStats = this.responseCache.getStats();
      
      console.log(`📊 Performance Metrics:
        Quiz Cache: ${quizStats.hits}H/${quizStats.misses}M (${((quizStats.hits / (quizStats.hits + quizStats.misses)) * 100).toFixed(1)}% hit rate)
        Response Cache: ${responseStats.keys} entradas ativas
        Avg Response: ${this.metrics.avgResponseTime.toFixed(1)}ms
        Compression: ${this.metrics.compressionRatio.toFixed(2)}x
        RPS: ${this.metrics.requestsPerSecond.toFixed(1)}
        Errors: ${this.metrics.errorRate}`);
      
      // Reset counters
      this.resetMetrics();
      
    }, 60000); // A cada minuto
  }

  /**
   * ATUALIZAR MÉTRICAS DE RESPOSTA
   */
  private updateResponseTime(responseTime: number): void {
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime + responseTime) / 2;
  }

  /**
   * ATUALIZAR MÉTRICAS DE REQUEST
   */
  private updateRequestMetrics(): void {
    this.metrics.requestsPerSecond++;
  }

  /**
   * RESET PERIÓDICO DE MÉTRICAS
   */
  private resetMetrics(): void {
    this.metrics.requestsPerSecond = 0;
    this.metrics.errorRate = 0;
  }

  /**
   * OBTER ESTATÍSTICAS DETALHADAS
   */
  getDetailedStats() {
    return {
      ...this.metrics,
      quizCache: this.quizCache.getStats(),
      responseCache: this.responseCache.getStats(),
      compressionCache: this.compressionCache.size,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * LIMPAR TODOS OS CACHES
   */
  clearAllCaches(): void {
    this.quizCache.flushAll();
    this.responseCache.flushAll();
    this.compressionCache.clear();
    console.log('🧹 Todos os caches limpos');
  }
}

export const performanceOptimizer = QuizPerformanceOptimizer.getInstance();
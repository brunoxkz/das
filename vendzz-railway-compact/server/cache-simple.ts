/**
 * CACHE SIMPLIFICADO - Solução temporária para resolver ECACHEFULL
 * Cache em memória simples com TTL manual
 */

interface CacheItem {
  value: any;
  expiry: number;
}

export class HighPerformanceCache {
  private cache: Map<string, CacheItem>;
  private stats: {
    hits: number;
    misses: number;
    totalRequests: number;
  };

  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
    
    // Limpeza automática a cada 30 segundos
    setInterval(() => this.cleanup(), 30000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
    
    // Limitar a 10 chaves para economia extrema de memória
    if (this.cache.size > 10) {
      const keys = Array.from(this.cache.keys());
      const keysToDelete = keys.slice(0, this.cache.size - 10);
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  get<T>(key: string): T | undefined {
    this.stats.totalRequests++;
    
    const item = this.cache.get(key);
    if (item && Date.now() <= item.expiry) {
      this.stats.hits++;
      return item.value;
    }
    
    if (item) {
      this.cache.delete(key);
    }
    
    this.stats.misses++;
    return undefined;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    const expiry = Date.now() + (ttl ? ttl * 1000 : 30000);
    this.cache.set(key, { value, expiry });
    return true;
  }

  del(key: string): number {
    return this.cache.delete(key) ? 1 : 0;
  }

  flush(): void {
    this.cache.clear();
    if (global.gc) {
      global.gc();
    }
  }

  getStats() {
    const memoryUsage = process.memoryUsage();
    
    return {
      keys: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests: this.stats.totalRequests,
      hitRate: this.stats.totalRequests > 0 ? 
        (this.stats.hits / this.stats.totalRequests) * 100 : 0,
      memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    };
  }

  getDashboardStats(userId: string) {
    return this.get<any>(`dashboard:${userId}`);
  }

  setDashboardStats(userId: string, data: any) {
    return this.set(`dashboard:${userId}`, data, 5);
  }

  forceClearCache() {
    this.cache.clear();
  }

  optimizeMemory() {
    this.cleanup();
    if (global.gc) {
      global.gc();
    }
  }

  getQuizzes(userId: string) {
    return this.get<any[]>(`quizzes:${userId}`);
  }

  setQuizzes(userId: string, quizzes: any[]) {
    return this.set(`quizzes:${userId}`, quizzes, 5);
  }

  getResponses(quizId: string) {
    return this.get<any[]>(`responses:${quizId}`);
  }

  setResponses(quizId: string, responses: any[]) {
    return this.set(`responses:${quizId}`, responses, 5);
  }

  getUser(userId: string) {
    return this.get<any>(`user:${userId}`);
  }

  setUser(userId: string, user: any) {
    return this.set(`user:${userId}`, user, 10);
  }

  invalidateUserCaches(userId: string) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(userId) || 
          key.includes('quizzes') || 
          key.includes('dashboard') || 
          key.includes('analytics') ||
          key.includes('responses') ||
          key.includes('stats')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.flush();
    
    console.log('🔄 CACHE INVALIDATION - Invalidated:', {
      total: keysToDelete.length,
      flushed: true
    });
  }

  invalidateQuizCaches(quizId: string) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(quizId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    console.log('🔄 QUIZ CACHE INVALIDATION - Invalidated:', keysToDelete.length, 'keys');
  }
}

export const cache = new HighPerformanceCache();
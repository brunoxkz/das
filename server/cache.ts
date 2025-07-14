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
    
    // Limpeza automática a cada 5 segundos
    setInterval(() => this.cleanup(), 5000);
  }

  private cleanup() {
    // Limpar tudo para economia extrema de memória
    this.cache.clear();
    
    // Forçar garbage collection
    if (global.gc) {
      global.gc();
    }
  }

  get<T>(key: string): T | undefined {
    this.stats.totalRequests++;
    
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return undefined;
    }
    
    // Cache DESABILITADO completamente para economia de memória
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    this.stats.hits++;
    return item.value;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    const expiry = Date.now() + (ttl || 60000); // 1 minuto padrão
    this.cache.set(key, { value, expiry });
    
    // Cache DESABILITADO completamente para economia de memória - limpar após 5 segundos
    setTimeout(() => {
      this.cache.delete(key);
    }, 5000);
    
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
    return this.set(`quizzes:${userId}`, quizzes, 5); // TTL muito baixo
  }

  getResponses(quizId: string) {
    return this.get<any[]>(`responses:${quizId}`);
  }

  setResponses(quizId: string, responses: any[]) {
    return this.set(`responses:${quizId}`, responses, 5); // TTL muito baixo
  }

  getUser(userId: string) {
    return this.get<any>(`user:${userId}`);
  }

  setUser(userId: string, user: any) {
    return this.set(`user:${userId}`, user, 30); // TTL muito baixo
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
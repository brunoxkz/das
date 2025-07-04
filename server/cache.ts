import NodeCache from 'node-cache';

// Cache otimizado para alta performance (100k+ usuários)
export class HighPerformanceCache {
  private cache: NodeCache;
  private stats: {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
  };

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutos padrão
      checkperiod: 60, // Verifica expiração a cada 60 segundos
      useClones: false, // Não clona objetos para melhor performance
      maxKeys: 10000, // Máximo de 10k chaves em cache
    });

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };

    // Log de estatísticas a cada 5 minutos
    setInterval(() => {
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : '0';
      console.log(`[Cache] Hit Rate: ${hitRate}%, Keys: ${this.cache.keys().length}, Memory: ${process.memoryUsage().heapUsed / 1024 / 1024}MB`);
    }, 5 * 60 * 1000);
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return undefined;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    this.stats.sets++;
    return this.cache.set(key, value, ttl || 0);
  }

  del(key: string): number {
    this.stats.deletes++;
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  getStats() {
    return {
      ...this.stats,
      keys: this.cache.keys().length,
      memory: process.memoryUsage().heapUsed
    };
  }

  // Cache específico para dashboard (cache mais longo)
  getDashboardStats(userId: string) {
    return this.get<any>(`dashboard:${userId}`);
  }

  setDashboardStats(userId: string, data: any) {
    return this.set(`dashboard:${userId}`, data, 60); // 1 minuto
  }

  // Cache específico para quizzes (cache médio)
  getQuizzes(userId: string) {
    return this.get<any[]>(`quizzes:${userId}`);
  }

  setQuizzes(userId: string, quizzes: any[]) {
    return this.set(`quizzes:${userId}`, quizzes, 30); // 30 segundos
  }

  // Cache específico para respostas (cache curto)
  getResponses(quizId: string) {
    return this.get<any[]>(`responses:${quizId}`);
  }

  setResponses(quizId: string, responses: any[]) {
    return this.set(`responses:${quizId}`, responses, 15); // 15 segundos
  }

  // Cache específico para usuário (cache longo)
  getUser(userId: string) {
    return this.get<any>(`user:${userId}`);
  }

  setUser(userId: string, user: any) {
    return this.set(`user:${userId}`, user, 300); // 5 minutos
  }

  // Invalida caches relacionados
  invalidateUserCaches(userId: string) {
    this.del(`user:${userId}`);
    this.del(`quizzes:${userId}`);
    this.del(`dashboard:${userId}`);
  }

  invalidateQuizCaches(quizId: string, userId: string) {
    this.del(`responses:${quizId}`);
    this.del(`quizzes:${userId}`);
    this.del(`dashboard:${userId}`);
  }
}

// Cache global singleton
export const cache = new HighPerformanceCache();
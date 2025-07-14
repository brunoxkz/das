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
      checkperiod: 30, // OTIMIZAÇÃO: Verifica expiração a cada 30s (mais frequente para 1000+ users)
      useClones: false, // Não clona objetos para melhor performance
      maxKeys: 5000, // OTIMIZAÇÃO: Reduzido para 5k chaves (controle de memória)
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

  // Método para limpeza forçada de cache
  forceClearCache() {
    console.log("🧹 CACHE - Limpeza forçada iniciada");
    this.cache.keys().forEach(key => {
      this.cache.del(key);
    });
    console.log("✅ CACHE - Limpeza forçada concluída");
  }

  // Método para optimizar uso de memória
  optimizeMemory() {
    const keys = this.cache.keys();
    const totalKeys = keys.length;
    
    // Limitar a 100 chaves máximo para uso ultra-eficiente de memória
    if (totalKeys > 100) {
      const keysToDelete = keys.slice(0, totalKeys - 100);
      keysToDelete.forEach(key => this.cache.del(key));
      console.log(`🧹 CACHE - Removidas ${keysToDelete.length} chaves antigas`);
    }
    
    // Forçar limpeza completa se ainda há muitas chaves
    if (this.cache.keys().length > 200) {
      this.forceClearCache();
    }
    
    // Garbage collection forçado
    if (global.gc) {
      global.gc();
      console.log('🧹 CACHE - Garbage collection executado');
    }
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

  // Invalida caches relacionados - CORREÇÃO CRÍTICA
  invalidateUserCaches(userId: string) {
    console.log("🔄 CACHE INVALIDATION - Invalidating user caches for:", userId);
    const deletedUser = this.del(`user:${userId}`);
    const deletedQuizzes = this.del(`quizzes:${userId}`);
    const deletedDashboard = this.del(`dashboard:${userId}`);
    
    // Invalidar também caches relacionados
    this.del(`analytics:${userId}`);
    this.del(`responses:${userId}`);
    
    // Força limpeza de cache se necessário
    this.optimizeMemory();
    
    console.log("🔄 CACHE INVALIDATION - Deleted:", { user: deletedUser, quizzes: deletedQuizzes, dashboard: deletedDashboard });
    
    // Verificar se invalidação foi bem-sucedida
    const userStillCached = this.get(`user:${userId}`);
    const quizzesStillCached = this.get(`quizzes:${userId}`);
    const dashboardStillCached = this.get(`dashboard:${userId}`);
    
    if (userStillCached || quizzesStillCached || dashboardStillCached) {
      console.log("⚠️ CACHE INVALIDATION - Some caches still exist, forcing cleanup");
      this.forceClearCache();
    }
  }

  invalidateQuizCaches(quizId: string, userId: string) {
    console.log("🔄 CACHE INVALIDATION - Invalidating quiz caches for:", quizId, "user:", userId);
    const deletedResponses = this.del(`responses:${quizId}`);
    const deletedQuizzes = this.del(`quizzes:${userId}`);
    const deletedDashboard = this.del(`dashboard:${userId}`);
    
    // Invalidar também caches específicos do quiz
    this.del(`quiz:${quizId}`);
    this.del(`analytics:${quizId}`);
    this.del(`variables:${quizId}`);
    
    // Força limpeza de cache se necessário
    this.optimizeMemory();
    
    console.log("🔄 CACHE INVALIDATION - Deleted:", { responses: deletedResponses, quizzes: deletedQuizzes, dashboard: deletedDashboard });
    
    // Verificar se invalidação foi bem-sucedida
    const responsesStillCached = this.get(`responses:${quizId}`);
    const quizzesStillCached = this.get(`quizzes:${userId}`);
    const dashboardStillCached = this.get(`dashboard:${userId}`);
    
    if (responsesStillCached || quizzesStillCached || dashboardStillCached) {
      console.log("⚠️ CACHE INVALIDATION - Some caches still exist, forcing cleanup");
      this.forceClearCache();
    }
  }
}

// Cache global singleton
export const cache = new HighPerformanceCache();
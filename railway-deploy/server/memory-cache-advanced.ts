/**
 * ADVANCED MEMORY CACHE - LRU COM TTL INTELIGENTE
 * Cache em memória otimizado sem dependências externas
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  evictions: number;
}

export class AdvancedMemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSize = 1000, defaultTTL = 300000) { // 5 min default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize,
      hitRate: 0,
      evictions: 0
    };

    // Cleanup automático a cada 60 segundos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * GET COM TTL VERIFICATION
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    const now = Date.now();
    
    // Verificar se expirou
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Atualizar estatísticas de acesso
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;
    this.updateStats();

    return item.value;
  }

  /**
   * SET COM TTL CUSTOMIZÁVEL
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const itemTTL = ttl || this.defaultTTL;

    // Se chegou no limite, fazer LRU eviction
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      value,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 1,
      lastAccessed: now
    };

    this.cache.set(key, item);
    this.updateStats();
  }

  /**
   * SET COM TTL INTELIGENTE BASEADO NO TAMANHO
   */
  setIntelligent(key: string, value: T, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    const size = this.estimateSize(value);
    let ttl = this.defaultTTL;

    // TTL baseado no tamanho e prioridade
    if (size < 1000) { // Pequeno
      ttl = priority === 'high' ? 600000 : 300000; // 10min : 5min
    } else if (size < 10000) { // Médio
      ttl = priority === 'high' ? 300000 : 180000; // 5min : 3min
    } else { // Grande
      ttl = priority === 'high' ? 180000 : 60000;  // 3min : 1min
    }

    this.set(key, value, ttl);
  }

  /**
   * GET OR SET (CACHE PATTERN)
   */
  async getOrSet<R = T>(
    key: string, 
    factory: () => Promise<R> | R, 
    ttl?: number
  ): Promise<R> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached as R;
    }

    const value = await factory();
    this.set(key, value as any, ttl);
    return value;
  }

  /**
   * BULK SET PARA PERFORMANCE
   */
  setBulk(items: Array<{ key: string; value: T; ttl?: number }>): void {
    for (const item of items) {
      this.set(item.key, item.value, item.ttl);
    }
  }

  /**
   * DELETE SINGLE
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  /**
   * DELETE BY PATTERN (REGEX)
   */
  deletePattern(pattern: RegExp): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    if (deleted > 0) {
      this.updateStats();
    }
    return deleted;
  }

  /**
   * CLEAR ALL
   */
  clear(): void {
    this.cache.clear();
    this.updateStats();
  }

  /**
   * LRU EVICTION - Remove o menos recentemente usado
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * CLEANUP AUTOMÁTICO - Remove itens expirados
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: ${cleaned} itens removidos`);
      this.updateStats();
    }
  }

  /**
   * ATUALIZAR ESTATÍSTICAS
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * ESTIMAR TAMANHO DO OBJETO
   */
  private estimateSize(obj: any): number {
    const str = JSON.stringify(obj);
    return str.length;
  }

  /**
   * GET ESTATÍSTICAS
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * GET CACHE INFO DETALHADO
   */
  getDetailedInfo(): any {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      size: this.estimateSize(item.value),
      age: Date.now() - item.timestamp,
      ttl: item.ttl,
      accessCount: item.accessCount,
      timeToExpire: item.ttl - (Date.now() - item.timestamp)
    }));

    return {
      stats: this.getStats(),
      items: items.sort((a, b) => b.accessCount - a.accessCount).slice(0, 10), // Top 10
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * ESTIMAR USO DE MEMÓRIA
   */
  private getMemoryUsage(): any {
    let totalSize = 0;
    let maxItemSize = 0;
    let minItemSize = Infinity;

    for (const [key, item] of this.cache.entries()) {
      const size = this.estimateSize(item);
      totalSize += size;
      maxItemSize = Math.max(maxItemSize, size);
      minItemSize = Math.min(minItemSize, size);
    }

    return {
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      avgItemSizeBytes: Math.round(totalSize / this.cache.size),
      maxItemSizeBytes: maxItemSize,
      minItemSizeBytes: minItemSize === Infinity ? 0 : minItemSize
    };
  }

  /**
   * WARM CACHE COM DADOS PRECOMPUTADOS
   */
  warm(data: Array<{ key: string; value: T; ttl?: number }>): void {
    console.log(`🔥 Warming cache with ${data.length} items...`);
    this.setBulk(data);
    console.log(`✅ Cache warmed: ${this.cache.size} items loaded`);
  }

  /**
   * EXPORT CACHE PARA BACKUP
   */
  export(): any {
    const exported = [];
    for (const [key, item] of this.cache.entries()) {
      exported.push({
        key,
        value: item.value,
        ttl: item.ttl,
        accessCount: item.accessCount
      });
    }
    return exported;
  }

  /**
   * IMPORT CACHE DE BACKUP
   */
  import(data: any[]): void {
    for (const item of data) {
      this.set(item.key, item.value, item.ttl);
    }
  }

  /**
   * DESTRUCTOR
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Cache global singleton
export const globalCache = new AdvancedMemoryCache(2000, 300000); // 2K items, 5min TTL

// Cache específico para quizzes
export const quizCache = new AdvancedMemoryCache(500, 600000); // 500 items, 10min TTL

// Cache para analytics
export const analyticsCache = new AdvancedMemoryCache(1000, 180000); // 1K items, 3min TTL

// Cache para usuários
export const userCache = new AdvancedMemoryCache(1000, 900000); // 1K items, 15min TTL

console.log('🧠 Advanced Memory Cache System inicializado');
console.log('📊 Caches disponíveis: global, quiz, analytics, user');
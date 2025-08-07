import React from "react";

// Otimizações de performance para suportar 100k+ usuários simultâneos no frontend

// Debounce otimizado para evitar calls excessivas
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle para limitar execuções por período
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading para componentes pesados
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return React.lazy(() => 
    importFunc().catch(err => {
      console.error('Erro ao carregar componente:', err);
      // Fallback para componente de erro
      return { default: () => React.createElement('div', null, 'Erro ao carregar') as any };
    })
  );
}

// Memoização otimizada para objetos complexos
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return React.useCallback(callback, deps);
}

// Hook otimizado para detectar intersecção (infinite scroll, lazy loading)
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
}

// Gerenciador de performance para métricas
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    // Monitorar Web Vitals
    this.observePerformance();
  }

  private observePerformance() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Manter apenas as últimas 100 métricas
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics() {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });
    
    return result;
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Singleton para monitoramento global
export const performanceMonitor = new PerformanceMonitor();

// Hook para performance de componentes React
export function useComponentPerformance(componentName: string) {
  const startTime = React.useRef<number>();
  
  React.useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        performanceMonitor.recordMetric(`Component.${componentName}`, duration);
      }
    };
  }, [componentName]);
}

// Otimizador de imagens para reduzir carregamento
export function optimizeImageSrc(src: string, width?: number, height?: number) {
  if (!src) return '';
  
  // Se a imagem já estiver otimizada, retornar como está
  if (src.includes('?')) return src;
  
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', '85'); // Qualidade 85%
  params.set('f', 'webp'); // Formato WebP quando possível
  
  return `${src}?${params.toString()}`;
}

// Cache local para reduzir requisições
export class LocalCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private maxSize = 100; // Máximo 100 itens no cache

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000) { // 5 min padrão
    if (this.cache.size >= this.maxSize) {
      // Remove o item mais antigo
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const localCache = new LocalCache();
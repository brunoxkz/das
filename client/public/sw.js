/**
 * SERVICE WORKER PWA - CACHE INTELIGENTE PARA PERFORMANCE EXTREMA
 * Implementa estratégias de cache para carregamento instantâneo
 */

const CACHE_NAME = 'vendzz-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Assets críticos para cache inicial
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Estratégias de cache por tipo de conteúdo
const CACHE_STRATEGIES = {
  // Cache-first para assets estáticos
  STATIC: {
    pattern: /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/,
    strategy: 'cache-first',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
  },
  
  // Network-first para APIs
  API: {
    pattern: /^https?:.*\/api\//,
    strategy: 'network-first',
    maxAge: 5 * 60 * 1000, // 5 minutos
    networkTimeout: 3000 // 3 segundos timeout
  },
  
  // Stale-while-revalidate para quizzes públicos
  QUIZ: {
    pattern: /^https?:.*\/api\/quiz\/[^\/]+$/,
    strategy: 'stale-while-revalidate',
    maxAge: 10 * 60 * 1000 // 10 minutos
  }
};

// Stats de cache
let cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  totalRequests: 0,
  startTime: Date.now()
};

/**
 * INSTALAÇÃO DO SERVICE WORKER
 */
self.addEventListener('install', event => {
  console.log('🚀 SW: Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 SW: Cache aberto, adicionando assets críticos...');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('✅ SW: Assets críticos em cache');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ SW: Erro na instalação:', error);
      })
  );
});

/**
 * ATIVAÇÃO DO SERVICE WORKER
 */
self.addEventListener('activate', event => {
  console.log('🔄 SW: Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // Remover caches antigos
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('🗑️ SW: Removendo cache antigo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('✅ SW: Service Worker ativado');
        return self.clients.claim();
      })
  );
});

/**
 * INTERCEPTAÇÃO DE REQUESTS
 */
self.addEventListener('fetch', event => {
  // Apenas interceptar GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  cacheStats.totalRequests++;
  
  const url = event.request.url;
  const strategy = getStrategy(url);
  
  event.respondWith(
    handleRequest(event.request, strategy)
      .catch(error => {
        console.error('❌ SW: Erro no fetch:', error);
        cacheStats.errors++;
        
        // Fallback para offline.html em caso de erro
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        throw error;
      })
  );
});

/**
 * DETERMINAR ESTRATÉGIA DE CACHE
 */
function getStrategy(url) {
  if (CACHE_STRATEGIES.STATIC.pattern.test(url)) {
    return CACHE_STRATEGIES.STATIC;
  }
  
  if (CACHE_STRATEGIES.QUIZ.pattern.test(url)) {
    return CACHE_STRATEGIES.QUIZ;
  }
  
  if (CACHE_STRATEGIES.API.pattern.test(url)) {
    return CACHE_STRATEGIES.API;
  }
  
  // Default: network-first
  return {
    strategy: 'network-first',
    maxAge: 5 * 60 * 1000,
    networkTimeout: 5000
  };
}

/**
 * HANDLE REQUEST COM ESTRATÉGIA ESPECÍFICA
 */
async function handleRequest(request, strategy) {
  switch (strategy.strategy) {
    case 'cache-first':
      return cacheFirst(request, strategy);
    
    case 'network-first':
      return networkFirst(request, strategy);
    
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request, strategy);
    
    default:
      return networkFirst(request, strategy);
  }
}

/**
 * CACHE-FIRST STRATEGY
 */
async function cacheFirst(request, strategy) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached && !isExpired(cached, strategy.maxAge)) {
    cacheStats.hits++;
    return cached;
  }
  
  cacheStats.misses++;
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Retornar cache expirado se disponível
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * NETWORK-FIRST STRATEGY
 */
async function networkFirst(request, strategy) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), strategy.networkTimeout || 5000);
    
    const response = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      cache.put(request, response.clone());
      cacheStats.hits++;
    }
    
    return response;
  } catch (error) {
    cacheStats.misses++;
    
    // Fallback para cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

/**
 * STALE-WHILE-REVALIDATE STRATEGY
 */
async function staleWhileRevalidate(request, strategy) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  // Buscar nova versão em background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.warn('SW: Falha na revalidação:', error);
    });
  
  // Retornar cache imediatamente se disponível
  if (cached && !isExpired(cached, strategy.maxAge)) {
    cacheStats.hits++;
    // Não aguardar a revalidação
    fetchPromise;
    return cached;
  }
  
  cacheStats.misses++;
  
  // Se não há cache, aguardar network
  return fetchPromise;
}

/**
 * VERIFICAR SE CACHE EXPIROU
 */
function isExpired(response, maxAge) {
  if (!maxAge) return false;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const date = new Date(dateHeader);
  return (Date.now() - date.getTime()) > maxAge;
}

/**
 * MESSAGE HANDLER
 */
self.addEventListener('message', event => {
  const { type } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'GET_CACHE_STATS':
      const stats = {
        ...cacheStats,
        hitRate: cacheStats.totalRequests > 0 
          ? ((cacheStats.hits / cacheStats.totalRequests) * 100).toFixed(1) + '%'
          : '0%',
        uptime: Math.floor((Date.now() - cacheStats.startTime) / 1000) + 's'
      };
      
      event.ports[0]?.postMessage(stats);
      break;
    
    case 'CLEAR_CACHE':
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(name => caches.delete(name))
          );
        })
        .then(() => {
          cacheStats = {
            hits: 0,
            misses: 0,
            errors: 0,
            totalRequests: 0,
            startTime: Date.now()
          };
          
          event.ports[0]?.postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
      break;
  }
});

/**
 * BACKGROUND SYNC
 */
self.addEventListener('sync', event => {
  if (event.tag === 'quiz-submit') {
    event.waitUntil(syncQuizSubmissions());
  }
});

/**
 * SYNC QUIZ SUBMISSIONS OFFLINE
 */
async function syncQuizSubmissions() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  // Buscar submissions pendentes
  const pendingSubmissions = keys.filter(request => 
    request.url.includes('/api/quiz/') && 
    request.method === 'POST'
  );
  
  for (const request of pendingSubmissions) {
    try {
      await fetch(request);
      await cache.delete(request);
      console.log('✅ SW: Submission sincronizada:', request.url);
    } catch (error) {
      console.warn('⚠️ SW: Falha na sincronização:', error);
    }
  }
}

console.log('🚀 Service Worker carregado - Cache inteligente ativo');
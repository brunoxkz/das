/**
 * SERVICE WORKER PWA ULTRA-OTIMIZADO
 * Cache inteligente + funcionalidade offline + background sync
 */

const CACHE_NAME = 'vendzz-cache-v1';
const STATIC_CACHE = 'vendzz-static-v1';
const DYNAMIC_CACHE = 'vendzz-dynamic-v1';
const QUIZ_CACHE = 'vendzz-quiz-v1';

// Arquivos estáticos para cache (reduzido para evitar bloqueios)
const STATIC_FILES = [
  '/offline.html'
];

// URLs da API que devem ser cached
const API_CACHE_PATTERNS = [
  '/api/quizzes/',
  '/api/quiz/',
  '/api/dashboard'
];

// Cache strategies
const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

/**
 * INSTALL EVENT - Setup inicial do cache
 */
self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache arquivos estáticos
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_FILES.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      }),
      
      // Cache offline page
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.add('/offline.html');
      })
    ]).then(() => {
      console.log('✅ Service Worker cache configurado');
      self.skipWaiting();
    })
  );
});

/**
 * ACTIVATE EVENT - Limpeza de caches antigos
 */
self.addEventListener('activate', event => {
  console.log('⚡ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== QUIZ_CACHE) {
              console.log('🧹 Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker ativado e controlando todas as abas');
    })
  );
});

/**
 * FETCH EVENT - Interceptação de requests com cache inteligente
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignore requests não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignore requests para outros domínios e Replit internos
  if (url.origin !== location.origin || url.hostname.includes('replit.dev')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * HANDLER PRINCIPAL DE REQUESTS
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. Quiz público - Cache first com TTL
    if (url.pathname.startsWith('/quiz/')) {
      return await cacheFirstWithTTL(request, QUIZ_CACHE, 300); // 5 min TTL
    }
    
    // 2. API calls - Network first com fallback
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstWithCache(request, DYNAMIC_CACHE);
    }
    
    // 3. Assets estáticos - Cache first
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // 4. Páginas HTML - Stale while revalidate
    if (request.headers.get('Accept')?.includes('text/html')) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // 5. Default - Network first
    return await networkFirstWithCache(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('❌ Erro no Service Worker:', error);
    return await getOfflineFallback(request);
  }
}

/**
 * STRATEGY: Cache First com TTL
 */
async function cacheFirstWithTTL(request, cacheName, ttlSeconds) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get('sw-cached-time');
    const now = Date.now();
    
    // Check TTL
    if (cachedTime && (now - parseInt(cachedTime)) < (ttlSeconds * 1000)) {
      // Cache válido
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }
  }
  
  // Cache miss ou expirado - buscar da rede
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const responseToCache = response.clone();
      
      // Adicionar timestamp
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    return response;
  } catch (error) {
    // Fallback para cache mesmo expirado
    return cachedResponse || await getOfflineFallback(request);
  }
}

/**
 * STRATEGY: Network First com Cache
 */
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return await getOfflineFallback(request);
  }
}

/**
 * STRATEGY: Cache First
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return await getOfflineFallback(request);
  }
}

/**
 * STRATEGY: Stale While Revalidate
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Buscar da rede em background
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Senão, aguardar rede
  return await fetchPromise || await getOfflineFallback(request);
}

/**
 * UPDATE CACHE EM BACKGROUND
 */
function updateCacheInBackground(request, cache) {
  fetch(request).then(response => {
    if (response.status === 200) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-time', Date.now().toString());
      
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
  }).catch(() => {
    // Silently fail background updates
  });
}

/**
 * VERIFICAR SE É ASSET ESTÁTICO
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

/**
 * FALLBACK OFFLINE
 */
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Para páginas HTML, mostrar página offline
  if (request.headers.get('Accept')?.includes('text/html')) {
    const cache = await caches.open(DYNAMIC_CACHE);
    return await cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
  
  // Para APIs, retornar erro estruturado
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({
      error: 'Sem conexão com a internet',
      offline: true,
      timestamp: Date.now()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Default offline response
  return new Response('Conteúdo não disponível offline', { status: 503 });
}

/**
 * BACKGROUND SYNC PARA SUBMISSIONS
 */
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'quiz-submission') {
    event.waitUntil(syncQuizSubmissions());
  }
  
  if (event.tag === 'analytics-track') {
    event.waitUntil(syncAnalyticsEvents());
  }
});

/**
 * SYNC QUIZ SUBMISSIONS
 */
async function syncQuizSubmissions() {
  try {
    console.log('📤 Sincronizando submissions offline...');
    
    // Get pending submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/quizzes/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await removePendingSubmission(submission.id);
          console.log('✅ Submission sincronizada:', submission.id);
        }
      } catch (error) {
        console.warn('⚠️ Falha ao sincronizar submission:', submission.id);
      }
    }
  } catch (error) {
    console.error('❌ Erro no sync de submissions:', error);
  }
}

/**
 * SYNC ANALYTICS EVENTS
 */
async function syncAnalyticsEvents() {
  try {
    console.log('📊 Sincronizando eventos de analytics...');
    
    // Similar logic for analytics events
    const pendingEvents = await getPendingAnalyticsEvents();
    
    for (const event of pendingEvents) {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.data)
        });
        
        await removePendingAnalyticsEvent(event.id);
      } catch (error) {
        console.warn('⚠️ Falha ao sincronizar analytics:', event.id);
      }
    }
  } catch (error) {
    console.error('❌ Erro no sync de analytics:', error);
  }
}

/**
 * HELPER FUNCTIONS PARA INDEXEDDB
 */
async function getPendingSubmissions() {
  // Implementar IndexedDB operations
  return [];
}

async function removePendingSubmission(id) {
  // Implementar IndexedDB remove
}

async function getPendingAnalyticsEvents() {
  // Implementar IndexedDB operations
  return [];
}

async function removePendingAnalyticsEvent(id) {
  // Implementar IndexedDB remove
}

/**
 * MESSAGE HANDLER
 */
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

/**
 * GET CACHE STATISTICS
 */
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return {
    caches: stats,
    totalCaches: cacheNames.length,
    timestamp: Date.now()
  };
}

/**
 * CLEAR ALL CACHES
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🧹 Todos os caches limpos');
}

console.log('🚀 Service Worker carregado - PWA Ultra-Otimizado ativo');
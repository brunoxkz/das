/**
 * VENDZZ PWA SERVICE WORKER
 * Otimizado para 100.000 usuários simultâneos
 * Web Push Nativo + Cache Estratégico
 */

const CACHE_NAME = 'vendzz-pwa-v1.2.0';
const STATIC_CACHE = 'vendzz-static-v1.2.0';
const DYNAMIC_CACHE = 'vendzz-dynamic-v1.2.0';

// Cache estratégico - apenas recursos essenciais
const ESSENTIAL_URLS = [
  '/pwa-dashboard',
  '/api/auth/user',
  '/api/dashboard/stats',
  '/',
  '/offline.html'
];

// Recursos estáticos para cache agressivo
const STATIC_RESOURCES = [
  '/',
  '/pwa-dashboard',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// URLs que sempre devem vir do network (dados em tempo real)
const NETWORK_FIRST = [
  '/api/notifications',
  '/api/leads',
  '/api/campaigns/active',
  '/api/dashboard/realtime'
];

// INSTALAÇÃO DO SERVICE WORKER
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(STATIC_RESOURCES)),
      
      // Cache dinâmico (vazio inicialmente)
      caches.open(DYNAMIC_CACHE),
      
      // Skip waiting para ativar imediatamente
      self.skipWaiting()
    ])
  );
});

// ATIVAÇÃO DO SERVICE WORKER
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpeza de caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName.startsWith('vendzz-')
            )
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      
      // Tomar controle imediato
      self.clients.claim()
    ])
  );
});

// ESTRATÉGIA DE FETCH HÍBRIDA
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests de outros domínios
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estratégia baseada no tipo de recurso
  if (NETWORK_FIRST.some(pattern => url.pathname.includes(pattern))) {
    // Network First - Dados em tempo real
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.startsWith('/api/')) {
    // Cache First para APIs não críticas
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Stale While Revalidate para recursos estáticos
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// NETWORK FIRST STRATEGY (dados em tempo real)
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    // Cache apenas respostas OK
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log(`📡 Network failed for ${request.url}, trying cache...`);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para offline
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    return new Response('{"error": "offline", "cached": false}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// CACHE FIRST STRATEGY (dados menos críticos)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Revalidate in background
    fetch(request)
      .then(response => {
        if (response.ok) {
          const cache = caches.open(DYNAMIC_CACHE);
          cache.then(c => c.put(request, response.clone()));
        }
      })
      .catch(() => {});
    
    return cachedResponse;
  }
  
  // Se não tem cache, busca na network
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    return new Response('{"error": "offline", "cached": false}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// STALE WHILE REVALIDATE (recursos estáticos)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// WEB PUSH NOTIFICATIONS
self.addEventListener('push', event => {
  console.log('🔔 Push notification recebida:', event);
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  
  const options = {
    title: data.title || 'Vendzz',
    body: data.body || 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    image: data.image,
    data: {
      url: data.url || '/pwa-dashboard',
      campaignId: data.campaignId,
      leadId: data.leadId,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes',
        icon: '/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ],
    requireInteraction: data.priority === 'high',
    silent: false,
    vibrate: [200, 100, 200],
    tag: data.tag || 'vendzz-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', event => {
  console.log('🖱️ Clique na notificação:', event);
  
  event.notification.close();
  
  const { action, data } = event;
  let urlToOpen = data?.url || '/pwa-dashboard';
  
  if (action === 'view') {
    if (data?.campaignId) {
      urlToOpen += `?campaign=${data.campaignId}`;
    }
    if (data?.leadId) {
      urlToOpen += `${urlToOpen.includes('?') ? '&' : '?'}lead=${data.leadId}`;
    }
  } else if (action === 'dismiss') {
    return; // Apenas fechar a notificação
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Se já tem uma janela aberta, usar ela
        const existingClient = clientList.find(client => 
          client.url.includes('/pwa-dashboard') && 'focus' in client
        );
        
        if (existingClient) {
          existingClient.navigate(urlToOpen);
          return existingClient.focus();
        }
        
        // Senão, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// SINCRONIZAÇÃO EM BACKGROUND
self.addEventListener('sync', event => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'sync-campaigns') {
    event.waitUntil(syncCampaigns());
  } else if (event.tag === 'sync-leads') {
    event.waitUntil(syncLeads());
  }
});

// SINCRONIZAR CAMPANHAS EM BACKGROUND
async function syncCampaigns() {
  try {
    const response = await fetch('/api/campaigns/sync');
    if (response.ok) {
      console.log('✅ Campanhas sincronizadas com sucesso');
      
      // Notificar clientes sobre atualização
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'CAMPAIGNS_SYNCED',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar campanhas:', error);
  }
}

// SINCRONIZAR LEADS EM BACKGROUND
async function syncLeads() {
  try {
    const response = await fetch('/api/leads/sync');
    if (response.ok) {
      console.log('✅ Leads sincronizados com sucesso');
      
      // Notificar clientes
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'LEADS_SYNCED',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar leads:', error);
  }
}

// LIMPEZA DE CACHE PERIÓDICA (evita crescimento excessivo)
setInterval(() => {
  caches.open(DYNAMIC_CACHE).then(cache => {
    cache.keys().then(requests => {
      if (requests.length > 100) { // Limit 100 items
        // Remove os 20 mais antigos
        requests.slice(0, 20).forEach(request => {
          cache.delete(request);
        });
      }
    });
  });
}, 30 * 60 * 1000); // A cada 30 minutos

// MENSAGENS DO CLIENTE
self.addEventListener('message', event => {
  console.log('💬 Mensagem recebida:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      timestamp: Date.now()
    });
  } else if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    });
  }
});

console.log('🚀 Vendzz Service Worker carregado - Pronto para 100k usuários!');
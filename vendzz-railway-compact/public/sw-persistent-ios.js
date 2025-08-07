// iOS PWA Portal Service Worker - Som Portal Nativo
// Version: 1.0-portal
// Compatível com iOS 13+ para som Portal

console.log('🍎 SW iOS Portal carregado - Som Portal nativo');

const CACHE_NAME = 'vendzz-ios-pwa-portal-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// Install Event - Cache recursos essenciais
self.addEventListener('install', event => {
  console.log('🔧 SW iOS Portal installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache iOS Portal opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ SW iOS Portal installed with cache');
        return self.skipWaiting(); // Ativar imediatamente
      })
  );
});

// Activate Event - Limpar caches antigos
self.addEventListener('activate', event => {
  console.log('🚀 SW iOS Portal activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ SW iOS Portal take control');
      return self.clients.claim(); // Controlar todas as páginas
    })
  );
});

// Push Event - Notificações com som Portal
self.addEventListener('push', event => {
  console.log('🔔 Push recebido no iOS Portal SW');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'Vendzz',
        message: event.data.text() || 'Nova notificação',
        sound: 'portal'
      };
    }
  }

  const title = notificationData.title || 'Vendzz';
  const options = {
    body: notificationData.message || notificationData.body || 'Você tem uma nova notificação!',
    icon: '/icon-192x192.png',
    badge: '/favicon.ico',
    sound: notificationData.sound || 'portal', // Som Portal do iOS
    tag: `vendzz-${Date.now()}`,
    data: {
      ...notificationData.data,
      soundType: notificationData.sound || 'portal',
      timestamp: Date.now(),
      platform: 'ios-pwa'
    },
    // Configurações específicas iOS PWA
    requireInteraction: true, // Fica na tela até interação
    silent: false, // Som habilitado
    vibrate: [200, 100, 200], // Vibração iOS
    persistent: true, // Persistir após reboot
    // iOS-specific sound mapping
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/favicon.ico'
      }
    ]
  };

  console.log('🔊 Mostrando notificação iOS Portal:', {
    title,
    sound: options.sound,
    body: options.body
  });

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', event => {
  console.log('👆 Notificação clicada:', event.notification.data);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }

  // Abrir ou focar na aplicação
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Tentar focar em uma janela existente
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Abrir nova janela se nenhuma for encontrada
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Fetch Event - Cache com fallback para network
self.addEventListener('fetch', event => {
  // Apenas para requests GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retornar resposta
        if (response) {
          return response;
        }

        // Cache miss - buscar na rede
        return fetch(event.request).then(response => {
          // Verificar se recebemos uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone da resposta para cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Message Event - Comunicação com o app
self.addEventListener('message', event => {
  console.log('📨 Mensagem recebida no SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '1.0-portal',
      platform: 'ios-pwa',
      soundSupport: ['portal', 'default', 'alert', 'chime', 'ding', 'bell']
    });
  }
});

// Error Event
self.addEventListener('error', event => {
  console.error('❌ SW iOS Portal error:', event.error);
});

// Unhandled Rejection
self.addEventListener('unhandledrejection', event => {
  console.error('❌ SW iOS Portal unhandled rejection:', event.reason);
});

console.log('✅ SW iOS Portal setup completo - Som Portal pronto');
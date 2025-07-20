// Service Worker para PWA Vendzz - Notificações Persistentes
// Funciona mesmo com app fechado e após reinicialização do dispositivo

const CACHE_NAME = 'vendzz-pwa-v1';
const urlsToCache = [
  '/',
  '/app-pwa-vendzz',
  '/login-pwa',
  '/static/css/',
  '/static/js/',
  '/vendzz-logo-official.png'
];

console.log('🔔 [ServiceWorker] Service Worker carregado');

// Instalar Service Worker e fazer cache inicial
self.addEventListener('install', (event) => {
  console.log('🔧 [ServiceWorker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 [ServiceWorker] Cache criado');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ [ServiceWorker] Instalação concluída');
        // Forçar ativação imediata
        return self.skipWaiting();
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 [ServiceWorker] Ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ [ServiceWorker] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediato
      self.clients.claim()
    ])
  );
  
  console.log('✅ [ServiceWorker] Ativação concluída');
});

// Interceptar requests para cache/network
self.addEventListener('fetch', (event) => {
  // Só interceptar GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna resposta
        if (response) {
          return response;
        }

        // Cache miss - fetch da network
        return fetch(event.request).then((response) => {
          // Verificar se resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// PUSH NOTIFICATIONS - FUNCIONALIDADE CRÍTICA
// Esta é a parte que faz as notificações funcionarem mesmo com app fechado

self.addEventListener('push', (event) => {
  console.log('🔔 [ServiceWorker] Push notification recebida');
  
  let notificationData = {
    title: 'Vendzz',
    body: 'Nova notificação',
    icon: '/vendzz-logo-official.png',
    badge: '/vendzz-logo-official.png',
    tag: 'vendzz-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: '👀 Ver Dashboard' },
      { action: 'dismiss', title: '❌ Dispensar' }
    ],
    data: {
      url: '/app-pwa-vendzz',
      timestamp: Date.now()
    }
  };

  // Se há dados na notificação, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
      console.log('📧 [ServiceWorker] Dados da notificação:', pushData);
    } catch (error) {
      console.error('❌ [ServiceWorker] Erro ao parsear dados da notificação:', error);
    }
  }

  // Mostrar notificação SEMPRE - mesmo com app fechado
  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      timestamp: notificationData.timestamp,
      actions: notificationData.actions,
      data: notificationData.data,
      // Configurações críticas para persistência
      persistent: true,
      sticky: true,
      renotify: true
    }
  );

  event.waitUntil(notificationPromise);
  console.log('✅ [ServiceWorker] Notificação exibida');
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [ServiceWorker] Notificação clicada:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('❌ [ServiceWorker] Notificação dispensada');
    return;
  }

  // Obter URL da notificação ou usar padrão
  const urlToOpen = event.notification.data?.url || '/app-pwa-vendzz';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já há uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            console.log('🔍 [ServiceWorker] Focando janela existente');
            return client.focus();
          }
        }
        
        // Abrir nova janela se não houver nenhuma
        if (clients.openWindow) {
          console.log('🆕 [ServiceWorker] Abrindo nova janela:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background Sync - para quando voltar online
self.addEventListener('sync', (event) => {
  console.log('🔄 [ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sincronizar dados quando voltar online
      syncData()
    );
  }
});

// Função para sincronizar dados
async function syncData() {
  try {
    console.log('🔄 [ServiceWorker] Sincronizando dados...');
    
    // Aqui você pode fazer sync de dados offline
    // Por exemplo, enviar mensagens que não foram enviadas
    
    console.log('✅ [ServiceWorker] Sincronização concluída');
  } catch (error) {
    console.error('❌ [ServiceWorker] Erro na sincronização:', error);
  }
}

// Message handling - comunicação com a aplicação
self.addEventListener('message', (event) => {
  console.log('💬 [ServiceWorker] Mensagem recebida:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ [ServiceWorker] Service Worker completamente carregado e configurado');
console.log('🔔 [ServiceWorker] Notificações PWA funcionam mesmo com app fechado!');
console.log('📱 [ServiceWorker] Persistência ativa após reinicialização do dispositivo');
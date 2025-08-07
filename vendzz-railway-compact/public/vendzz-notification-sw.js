// VENDZZ PWA SERVICE WORKER - NOTIFICAÇÕES PUSH PERSISTENTES
// Sistema completo para funcionar com app fechado e tela de bloqueio

const CACHE_NAME = 'vendzz-pwa-v1.2';
const VENDZZ_API_BASE = self.location.origin;

// Cache de recursos críticos para funcionamento offline
const CRITICAL_RESOURCES = [
  '/',
  '/pwa-push-notifications',
  '/admin-push-notifications',
  '/vendzz-logo-official.png'
];

console.log('🚀 [SW] Vendzz Service Worker carregado - Versão Background Push');

// Instalar Service Worker e cachear recursos críticos
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker para notificações persistentes...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 [SW] Cacheando recursos críticos');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('✅ [SW] Service Worker instalado com cache offline');
        return self.skipWaiting(); // Ativar imediatamente
      })
      .catch(error => {
        console.error('❌ [SW] Erro ao instalar:', error);
      })
  );
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Ativando Service Worker para funcionamento em background');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ [SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('🎯 [SW] Service Worker ativo e controlando todas as abas');
    })
  );
});

// INTERCEPTAR REQUESTS PARA FUNCIONAMENTO OFFLINE
self.addEventListener('fetch', (event) => {
  // Apenas interceptar requests GET para recursos estáticos
  if (event.request.method === 'GET' && 
      (event.request.url.includes('/vendzz-logo') || 
       event.request.url.endsWith('/') ||
       event.request.url.includes('/pwa-push'))) {
    
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Retornar do cache se encontrado, senão fazer fetch
          return response || fetch(event.request);
        })
        .catch(() => {
          // Fallback se offline
          if (event.request.url.endsWith('/')) {
            return new Response('Vendzz PWA - Offline Mode', {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        })
    );
  }
});

// ESCUTAR PUSH EVENTS - FUNCIONA MESMO COM APP FECHADO
self.addEventListener('push', (event) => {
  console.log('📱 [SW] Push notification recebida (background):', event);
  
  let notificationData = {
    title: 'Vendzz',
    body: 'Nova notificação',
    icon: '/vendzz-logo-official.png',
    badge: '/vendzz-logo-official.png'
  };
  
  // Processar dados do push
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'Vendzz',
        body: data.body || 'Nova notificação do Vendzz',
        icon: data.icon || '/vendzz-logo-official.png',
        badge: '/vendzz-logo-official.png',
        image: data.image,
        url: data.url || '/pwa-push-notifications',
        tag: data.tag || 'vendzz-' + Date.now(),
        timestamp: Date.now()
      };
      console.log('📋 [SW] Dados do push processados:', notificationData);
    } catch (error) {
      console.error('❌ [SW] Erro ao processar dados do push:', error);
      // Usar dados padrão se parsing falhar
      notificationData.body = event.data.text() || 'Nova notificação do Vendzz';
    }
  }
  
  // Configurações avançadas para tela de bloqueio
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    tag: notificationData.tag,
    
    // CONFIGURAÇÕES CRÍTICAS PARA TELA DE BLOQUEIO
    requireInteraction: true,  // Manter visível até interação
    persistent: true,          // Persistir mesmo com app fechado
    silent: false,             // Som de notificação
    vibrate: [200, 100, 200],  // Vibração no mobile
    
    // Dados para clique
    data: {
      url: notificationData.url,
      timestamp: notificationData.timestamp,
      vendzz: true
    },
    
    // Configurações visuais para mobile
    dir: 'ltr',
    lang: 'pt-BR',
    
    // Ações disponíveis na notificação
    actions: [
      {
        action: 'open',
        title: '📱 Abrir Vendzz',
        icon: '/vendzz-logo-official.png'
      },
      {
        action: 'dismiss',
        title: '✖️ Dispensar',
        icon: '/vendzz-logo-official.png'
      }
    ]
  };
  
  console.log('🔔 [SW] Exibindo notificação na tela de bloqueio...');
  
  // Exibir notificação - FUNCIONA MESMO COM APP FECHADO
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
      .then(() => {
        console.log('✅ [SW] Notificação exibida com sucesso na tela de bloqueio');
        
        // Log da notificação no servidor (opcional)
        return fetch(`${VENDZZ_API_BASE}/api/push-notifications/log-delivery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: notificationData.title,
            timestamp: Date.now(),
            delivered: true
          })
        }).catch(error => {
          console.warn('⚠️ [SW] Não foi possível logar entrega (não crítico):', error);
        });
      })
      .catch(error => {
        console.error('❌ [SW] Erro ao exibir notificação:', error);
      })
  );
});

// CLIQUE NA NOTIFICAÇÃO - ABRIR/FOCAR APP
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [SW] Clique na notificação:', event.action, event.notification.data);
  
  // Fechar notificação
  event.notification.close();
  
  // Processar ação
  if (event.action === 'dismiss') {
    console.log('❌ [SW] Notificação dispensada pelo usuário');
    return;
  }
  
  // URL para abrir (padrão ou da notificação)
  const urlToOpen = event.notification.data?.url || '/pwa-push-notifications';
  
  console.log('🔗 [SW] Abrindo URL:', urlToOpen);
  
  // Abrir/focar janela do app
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(clientList => {
      console.log('🔍 [SW] Procurando janelas abertas:', clientList.length);
      
      // Procurar janela já aberta do Vendzz
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          console.log('🎯 [SW] Focando janela existente:', client.url);
          return client.focus().then(() => {
            // Navegar para URL específica se necessário
            if (client.navigate && urlToOpen !== '/') {
              return client.navigate(urlToOpen);
            }
          });
        }
      }
      
      // Se não há janela aberta, abrir nova
      if (self.clients.openWindow) {
        console.log('🆕 [SW] Abrindo nova janela:', urlToOpen);
        return self.clients.openWindow(urlToOpen);
      }
    }).catch(error => {
      console.error('❌ [SW] Erro ao abrir janela:', error);
    })
  );
});

// FECHAR NOTIFICAÇÃO
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 [SW] Notificação fechada:', event.notification.tag);
  
  // Log opcional de fechamento
  fetch(`${VENDZZ_API_BASE}/api/push-notifications/log-close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag: event.notification.tag,
      timestamp: Date.now()
    })
  }).catch(() => {}); // Ignorar erro
});

// SINCRONIZAÇÃO EM BACKGROUND (Para quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Background sync:', event.tag);
  
  if (event.tag === 'vendzz-sync') {
    event.waitUntil(
      fetch(`${VENDZZ_API_BASE}/api/push-notifications/sync`)
        .then(response => response.json())
        .then(data => {
          console.log('📥 [SW] Sincronização completa:', data);
        })
        .catch(error => {
          console.error('❌ [SW] Erro na sincronização:', error);
        })
    );
  }
});

// MESSAGE HANDLER - Comunicação com a página
self.addEventListener('message', (event) => {
  console.log('💬 [SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    // Teste de notificação local
    self.registration.showNotification('🧪 Teste Vendzz', {
      body: 'Notificação de teste do Service Worker',
      icon: '/vendzz-logo-official.png',
      tag: 'test-' + Date.now(),
      requireInteraction: true
    });
  }
});

console.log('🎯 [SW] Vendzz Service Worker completamente carregado e pronto para background push');
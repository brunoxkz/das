// Service Worker para notificações push PWA
console.log('🔧 Service Worker carregado');

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('📱 Push notification recebida:', event);

  if (!event.data) {
    console.log('❌ Push sem dados');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('❌ Erro ao parsear dados do push:', error);
    data = {
      title: 'Vendzz Notification',
      body: event.data.text() || 'Nova notificação'
    };
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo-vendzz-white.png',
    badge: '/logo-vendzz-white.png',
    tag: data.tag || 'vendzz-notification',
    data: {
      url: data.url || '/',
    },
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/logo-vendzz-white.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notificação clicada:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Tentar focar em uma aba existente
      for (let client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Abrir nova aba se não encontrar existente
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

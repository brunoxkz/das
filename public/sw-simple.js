// Service Worker Simples para Push Notifications iOS
// Focado especificamente em PWA iOS e tela de bloqueio

const CACHE_NAME = 'vendzz-push-v1';

self.addEventListener('install', (event) => {
  console.log('SW: Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Handler principal para push notifications
self.addEventListener('push', (event) => {
  console.log('SW: Push recebido', event.data?.text());
  
  let notificationData = {
    title: 'Vendzz',
    body: 'Nova notificação',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'vendzz-notification'
  };

  // Parse dos dados se disponível
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'Vendzz',
        body: data.body || 'Nova notificação',
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        tag: data.tag || 'vendzz-notification',
        requireInteraction: true, // Importante para iOS
        silent: false,
        vibrate: [200, 100, 200] // Para dispositivos que suportam
      };
    } catch (e) {
      console.log('SW: Erro ao parsear dados push:', e);
    }
  }

  // Mostrar notificação
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      vibrate: notificationData.vibrate,
      // Configurações específicas para iOS
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/favicon.ico'
        }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Handler para clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notificação clicada', event.notification.tag);
  
  event.notification.close();

  // Abrir ou focar na janela do app
  event.waitUntil(
    self.clients.matchAll().then((clientList) => {
      // Se já tem uma janela aberta, focar nela
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      // Senão, abrir nova janela
      return self.clients.openWindow('/');
    })
  );
});

// Handler para fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('SW: Notificação fechada', event.notification.tag);
});
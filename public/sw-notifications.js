// SERVICE WORKER SIMPLIFICADO PARA PUSH NOTIFICATIONS SEM CONFLITOS
// Versão otimizada que não intercepta requisições do Vite

const CACHE_NAME = 'vendzz-notifications-v1';

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Instalando Service Worker para Push Notifications');
  self.skipWaiting(); // Ativa imediatamente
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Service Worker ativado para Push Notifications');
  event.waitUntil(self.clients.claim()); // Assume controle imediatamente
});

// PUSH NOTIFICATIONS - Funcionalidade principal
self.addEventListener('push', (event) => {
  console.log('📱 SW: Push notification recebida');
  
  let notificationData = {
    title: 'Vendzz - Nova Notificação',
    body: 'Você tem uma nova atualização!',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'vendzz-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir Vendzz',
        icon: '/favicon.png'
      }
    ]
  };

  // Parse dos dados se existirem
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        data: {
          ...notificationData.data,
          url: pushData.url || '/',
          quizId: pushData.quizId,
          userId: pushData.userId
        }
      };
      console.log('📊 SW: Dados da notificação:', pushData);
    } catch (error) {
      console.log('⚠️ SW: Erro ao parsear dados da push:', error);
    }
  }

  // Mostrar notificação
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: notificationData.actions
    })
  );
});

// Click na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 SW: Notificação clicada:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Procurar por uma janela já aberta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('🔄 SW: Focando janela existente');
          return client.focus();
        }
      }
      
      // Abrir nova janela se necessário
      if (self.clients.openWindow) {
        console.log('🆕 SW: Abrindo nova janela');
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Close da notificação
self.addEventListener('notificationclose', (event) => {
  console.log('❌ SW: Notificação fechada');
});

// NÃO INTERCEPTAR FETCH - Para evitar conflitos com Vite HMR
// Deixamos o Vite gerenciar todas as requisições

console.log('🚀 SW: Service Worker de Push Notifications carregado com sucesso');
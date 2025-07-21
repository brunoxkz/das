// VENDZZ SERVICE WORKER - SIMPLIFICADO
// Baseado no sistema robusto do GitHub: https://github.com/umpordez/browser-notification

self.addEventListener('install', (event) => {
  console.log('🔧 Vendzz Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Vendzz Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// HANDLER PRINCIPAL PARA NOTIFICAÇÕES PUSH - SIMPLIFICADO
self.addEventListener("push", async (event) => {
  console.log('📨 Push notification recebida no Vendzz');
  
  try {
    // Parse dos dados da notificação
    const { title, body, icon, url, badge, tag, data } = await event.data.json();
    
    console.log('📊 Dados da notificação:', { title, body });
    
    // Exibir notificação
    self.registration.showNotification(
      title || 'Vendzz',
      { 
        body: body || 'Nova notificação',
        icon: icon || '/vendzz-logo-official.png',
        badge: badge || '/vendzz-logo-official.png',
        tag: tag || 'vendzz-notification',
        data: {
          url: url || '/app-pwa-vendzz',
          timestamp: Date.now()
        },
        vibrate: [200, 100, 200],
        requireInteraction: true
      }
    );
    
    console.log('✅ Notificação Vendzz exibida');
    
  } catch (error) {
    console.error('❌ Erro ao processar push notification:', error);
    
    // Fallback básico
    self.registration.showNotification('Vendzz', {
      body: 'Nova notificação do sistema',
      icon: '/vendzz-logo-official.png'
    });
  }
});

// HANDLER PARA CLIQUES EM NOTIFICAÇÕES
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificação Vendzz clicada');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/app-pwa-vendzz';
  
  // Abrir ou focar na aba do Vendzz
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focar aba existente se encontrada
      for (const client of clientList) {
        if (client.url.includes('vendzz') && 'focus' in client) {
          console.log('🔄 Focando aba existente do Vendzz');
          return client.focus();
        }
      }
      
      // Abrir nova aba
      if (clients.openWindow) {
        console.log('🆕 Abrindo nova aba Vendzz:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('🚀 Vendzz Service Worker carregado completamente');
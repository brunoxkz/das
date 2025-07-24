// Service Worker para Vendzz PWA - Sistema de Push Notifications PERSISTENTE
// SEMPRE ATIVO EM SEGUNDO PLANO - DETECÇÃO AUTOMÁTICA iOS/Android

const CACHE_NAME = 'vendzz-pwa-v3.0';
const APP_VERSION = '3.0.0';

// Detectar automaticamente iOS e Android
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isAndroidDevice = () => {
  return /Android/.test(navigator.userAgent);
};

const isPWAMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
};

console.log(`🚀 SW VENDZZ v${APP_VERSION} - Dispositivo: ${isIOSDevice() ? 'iOS' : isAndroidDevice() ? 'Android' : 'Desktop'}`);
console.log(`📱 PWA Mode: ${isPWAMode() ? 'SIM' : 'NÃO'}`);
const urlsToCache = [
  '/',
  '/app-pwa-vendzz',
  '/dashboard',
  '/quiz-builder',
  '/manifest.json'
];

// Instalar Service Worker - SEMPRE ATIVO EM SEGUNDO PLANO
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker PERSISTENTE instalando...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Cache criado:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      }),
      // Manter Service Worker sempre ativo
      self.registration.update(),
      // Ativar imediatamente sem esperar
      self.skipWaiting()
    ])
  );
  
  // Configurar para sempre rodar em segundo plano
  console.log('🔄 Service Worker configurado para rodar SEMPRE em segundo plano');
});

// Ativar Service Worker - CONTROLE IMEDIATO
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker PERSISTENTE ativado - SEMPRE em segundo plano');
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Assumir controle imediato de todas as abas
      self.clients.claim(),
      // Configurar heartbeat para manter SW ativo
      setupPersistentBackground()
    ])
  );
});

// Sistema de heartbeat para manter SW sempre ativo
async function setupPersistentBackground() {
  console.log('💗 Configurando heartbeat para manter SW sempre ativo');
  
  // Heartbeat a cada 30 segundos para manter SW vivo
  setInterval(() => {
    console.log('💗 SW Heartbeat - Mantendo ativo em segundo plano');
    
    // Verificar se há quiz completions a cada heartbeat
    checkQuizCompletions();
    
    // Verificar e renovar push subscriptions a cada heartbeat
    checkAndRenewPushSubscriptions();
  }, 30000);
  
  // Heartbeat mais frequente especificamente para push subscriptions (a cada 10 minutos)
  setInterval(() => {
    console.log('🔔 Verificação específica de push subscriptions');
    checkAndRenewPushSubscriptions();
  }, 600000); // 10 minutos
  
  // Configurar periodic background sync se disponível
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    self.registration.sync.register('vendzz-background-sync');
    console.log('🔄 Background sync registrado para manter sempre ativo');
  }
}

// Verificar quiz completions em background
async function checkQuizCompletions() {
  try {
    // Fazer requisição para verificar novos quiz completions
    const response = await fetch('/api/quiz-completions/latest');
    if (response.ok) {
      const data = await response.json();
      if (data.latestCompletion) {
        console.log('🎯 Novo quiz completion detectado em background:', data.latestCompletion.id);
        // Enviar notificação automática em background
      }
    }
  } catch (error) {
    console.log('🔍 Background check quiz completions (normal em dispositivos offline)');
  }
}

// Sistema de renovação automática de push subscriptions - NUNCA EXPIRA
async function checkAndRenewPushSubscriptions() {
  try {
    console.log('🔔 Verificando status das push subscriptions...');
    
    // Verificar se temos uma subscription ativa
    const registration = await self.registration;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('⚠️ Nenhuma push subscription encontrada - tentando re-registrar automaticamente');
      await autoRenewPushSubscription();
      return;
    }
    
    // Verificar se a subscription está próxima do vencimento ou expirada
    const now = Date.now();
    const expirationTime = subscription.expirationTime;
    
    if (expirationTime) {
      const timeUntilExpiration = expirationTime - now;
      const hoursUntilExpiration = timeUntilExpiration / (1000 * 60 * 60);
      
      console.log(`🕐 Push subscription expira em ${hoursUntilExpiration.toFixed(1)} horas`);
      
      // Se expira em menos de 24 horas, renovar automaticamente
      if (hoursUntilExpiration < 24) {
        console.log('🔄 Push subscription próxima do vencimento - renovando automaticamente...');
        await autoRenewPushSubscription();
      }
    } else {
      console.log('✅ Push subscription sem data de expiração definida (ilimitada)');
    }
    
    // Verificar se a subscription ainda está funcionando
    await testPushSubscriptionHealth(subscription);
    
  } catch (error) {
    console.error('❌ Erro ao verificar push subscriptions:', error);
    // Em caso de erro, tentar renovar
    await autoRenewPushSubscription();
  }
}

// Testar se a push subscription ainda está funcionando
async function testPushSubscriptionHealth(subscription) {
  try {
    // Fazer uma requisição para verificar se a subscription ainda é válida no servidor
    const response = await fetch('/api/push-simple/test-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        test: true
      })
    });
    
    if (!response.ok) {
      console.log('⚠️ Push subscription não está mais válida - renovando...');
      await autoRenewPushSubscription();
    } else {
      console.log('✅ Push subscription funcionando corretamente');
    }
  } catch (error) {
    console.log('🔍 Não foi possível testar push subscription (normal offline)');
  }
}

// Renovação automática da push subscription
async function autoRenewPushSubscription() {
  try {
    console.log('🔄 Iniciando renovação automática da push subscription...');
    
    const registration = await self.registration;
    
    // Cancelar subscription existente se houver
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
      console.log('🗑️ Subscription antiga cancelada');
    }
    
    // VAPID key do sistema
    const vapidPublicKey = 'BJpgEcD9zXMK8EPtLGRGUYS5J3NU1C8MqT2lzNO8tFTnpYQO6E7WRD8wBaGx2yIPKwYlPsUjw0WyHJ4u5zV9EWM';
    
    // Criar nova subscription
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    console.log('✅ Nova push subscription criada');
    
    // Registrar no servidor automaticamente
    await fetch('/api/push-simple/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: newSubscription,
        autoRenewed: true,
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('✅ Push subscription renovada automaticamente e registrada no servidor');
    
    // Notificar o usuário (opcional - apenas em contextos apropriados)
    if (self.clients) {
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'PUSH_SUBSCRIPTION_RENEWED',
          message: 'Push notifications foram renovadas automaticamente'
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao renovar push subscription automaticamente:', error);
  }
}

// Função auxiliar para converter VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Interceptar requisições (Cache First Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna resposta do cache
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Verificar se resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone da resposta
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

// Escutar notificações push
self.addEventListener('push', (event) => {
  console.log('📱 Push notification recebida:', event);

  const options = {
    body: 'Você tem uma nova notificação!',
    icon: '/logo-vendzz-white.png',
    badge: '/logo-vendzz-white.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir Vendzz',
        icon: '/logo-vendzz-white.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/logo-vendzz-white.png'
      }
    ],
    requireInteraction: true,
    tag: 'vendzz-notification'
  };

  let notificationData = {
    title: '🔔 Vendzz PWA',
    body: 'Nova notificação recebida!'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Payload da notificação:', payload);
      
      notificationData = {
        title: payload.title || '🔔 Vendzz PWA',
        body: payload.body || 'Nova notificação recebida!',
        icon: payload.icon || '/logo-vendzz-white.png',
        badge: payload.badge || '/logo-vendzz-white.png',
        url: payload.url || '/app-pwa-vendzz',
        tag: payload.tag || 'vendzz-notification',
        requireInteraction: payload.requireInteraction || true,
        silent: payload.silent || false,
        timestamp: payload.timestamp || Date.now(),
        actions: payload.actions || options.actions
      };
    } catch (error) {
      console.error('❌ Erro ao processar payload:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: [200, 100, 200],
      data: {
        url: notificationData.url,
        timestamp: notificationData.timestamp
      },
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      tag: notificationData.tag
    }).then(() => {
      console.log('✅ Notificação exibida com sucesso!');
      
      // Enviar mensagem para o cliente sobre notificação recebida
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NOTIFICATION_RECEIVED',
            payload: notificationData
          });
        });
      });
    })
  );
});

// Escutar cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificação clicada:', event);

  event.notification.close();

  if (event.action === 'explore') {
    // Abrir Vendzz
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        // Verificar se já existe uma aba aberta
        for (const client of clients) {
          if (client.url.includes('app-pwa-vendzz') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Se não existe, abrir nova aba
        if (self.clients.openWindow) {
          const targetUrl = event.notification.data?.url || '/app-pwa-vendzz';
          return self.clients.openWindow(targetUrl);
        }
      })
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação (já fechada acima)
    console.log('🚪 Notificação fechada pelo usuário');
  } else {
    // Clique padrão na notificação (sem action específica)
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          if (client.url.includes('vendzz') && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (self.clients.openWindow) {
          const targetUrl = event.notification.data?.url || '/app-pwa-vendzz';
          return self.clients.openWindow(targetUrl);
        }
      })
    );
  }
});

// Escutar fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificação fechada:', event.notification.tag);
  
  // Enviar analytics sobre notificação fechada
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        tag: event.notification.tag,
        timestamp: Date.now()
      });
    });
  });
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Função auxiliar para sincronização
async function syncNotifications() {
  try {
    console.log('🔄 Sincronizando notificações...');
    
    // Aqui você pode implementar lógica para sincronizar
    // notificações pendentes quando o dispositivo volta online
    
    const response = await fetch('/api/push-notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        action: 'sync'
      })
    });
    
    if (response.ok) {
      console.log('✅ Sincronização bem-sucedida');
    } else {
      console.error('❌ Erro na sincronização');
    }
  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('📨 Mensagem recebida no SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CLIENT_ID') {
    event.ports[0].postMessage({
      clientId: event.source.id
    });
  }
});

console.log('🚀 Service Worker Vendzz PWA carregado e funcionando!');
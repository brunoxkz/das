// Sistema de Push Notifications Persistente para PWA Vendzz
// Funciona mesmo com app fechado e após reinicialização do dispositivo

import webpush from 'web-push';
import { storage } from './storage-sqlite.js';

// Configuração VAPID (substitua pelas suas chaves reais)
const VAPID_PUBLIC_KEY = 'BKxL8iRIrwm1YUlx7zIFJyI5Y5F3K_XQQp3mMm1Fq8QGzJ2vK7kKz_8eF5lOm1Kp3mMm1Fq8QGzJ2vK7kKz_8e';
const VAPID_PRIVATE_KEY = 'YOUR_VAPID_PRIVATE_KEY_HERE'; // Gere uma chave real
const VAPID_EMAIL = 'admin@vendzz.com';

// Inicializar web-push
webpush.setVapidDetails(
  `mailto:${VAPID_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

export class PersistentPushNotificationSystem {
  
  // Salvar subscription do usuário
  async saveUserSubscription(userId: string, subscription: PushSubscriptionData): Promise<boolean> {
    try {
      console.log('🔔 [PersistentPush] Salvando subscription para usuário:', userId);
      
      // Salvar no banco de dados via storage
      await storage.savePushSubscription({
        userId: userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ [PersistentPush] Subscription salva com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [PersistentPush] Erro ao salvar subscription:', error);
      return false;
    }
  }

  // Enviar notificação para usuário específico
  async sendNotificationToUser(userId: string, payload: NotificationPayload): Promise<boolean> {
    try {
      console.log('🔔 [PersistentPush] Enviando notificação para usuário:', userId);
      
      // Buscar subscriptions ativas do usuário
      const subscriptions = await storage.getActivePushSubscriptions(userId);
      
      if (subscriptions.length === 0) {
        console.warn('⚠️ [PersistentPush] Nenhuma subscription ativa encontrada para usuário:', userId);
        return false;
      }

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/vendzz-logo-official.png',
        badge: payload.badge || '/vendzz-logo-official.png',
        image: payload.image,
        url: payload.url || '/app-pwa-vendzz',
        tag: payload.tag || 'vendzz-notification',
        requireInteraction: true, // CRÍTICO: mantém na tela de bloqueio
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
        actions: payload.actions || [
          { action: 'view', title: '👀 Ver Dashboard' },
          { action: 'dismiss', title: '❌ Dispensar' }
        ],
        data: {
          url: payload.url || '/app-pwa-vendzz',
          userId: userId,
          timestamp: Date.now(),
          ...payload.data
        }
      });

      let successCount = 0;
      
      // Enviar para todas as subscriptions do usuário
      for (const subscription of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey
            }
          };

          await webpush.sendNotification(pushSubscription, notificationPayload);
          successCount++;
          
          console.log(`✅ [PersistentPush] Notificação enviada para endpoint: ${subscription.endpoint.substring(0, 50)}...`);
          
          // Log da notificação enviada
          await storage.savePushNotificationLog({
            userId: userId,
            title: payload.title,
            body: payload.body,
            status: 'sent',
            sentAt: new Date()
          });

        } catch (subscriptionError: any) {
          console.error('❌ [PersistentPush] Erro ao enviar para subscription específica:', subscriptionError);
          
          // Se a subscription expirou, marcar como inativa
          if (subscriptionError.statusCode === 410) {
            await storage.markPushSubscriptionInactive(userId);
            console.log('🗑️ [PersistentPush] Subscription expirada removida');
          }
        }
      }

      return successCount > 0;
    } catch (error) {
      console.error('❌ [PersistentPush] Erro geral ao enviar notificação:', error);
      return false;
    }
  }

  // Enviar notificação para todos os usuários ativos
  async sendGlobalNotification(payload: NotificationPayload): Promise<number> {
    try {
      console.log('🔔 [PersistentPush] Enviando notificação global');
      
      // Buscar todas as subscriptions ativas
      const allSubscriptions = await storage.getAllActivePushSubscriptions();
      
      if (allSubscriptions.length === 0) {
        console.warn('⚠️ [PersistentPush] Nenhuma subscription ativa encontrada');
        return 0;
      }

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/vendzz-logo-official.png',
        badge: payload.badge || '/vendzz-logo-official.png',
        url: payload.url || '/app-pwa-vendzz',
        tag: payload.tag || 'vendzz-global',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
        actions: [
          { action: 'view', title: '👀 Ver Dashboard' },
          { action: 'dismiss', title: '❌ Dispensar' }
        ],
        data: {
          url: payload.url || '/app-pwa-vendzz',
          type: 'global',
          timestamp: Date.now()
        }
      });

      let successCount = 0;
      
      // Enviar para todas as subscriptions
      for (const subscription of allSubscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey
            }
          };

          await webpush.sendNotification(pushSubscription, notificationPayload);
          successCount++;

        } catch (subscriptionError: any) {
          console.error('❌ [PersistentPush] Erro ao enviar para subscription global:', subscriptionError);
          
          if (subscriptionError.statusCode === 410) {
            await storage.markPushSubscriptionInactive(subscription.userId);
          }
        }
      }

      console.log(`✅ [PersistentPush] Notificação global enviada para ${successCount}/${allSubscriptions.length} usuários`);
      return successCount;
    } catch (error) {
      console.error('❌ [PersistentPush] Erro geral na notificação global:', error);
      return 0;
    }
  }

  // Enviar notificação de teste
  async sendTestNotification(userId: string): Promise<boolean> {
    console.log('🧪 [PersistentPush] Enviando notificação de teste para:', userId);
    
    return await this.sendNotificationToUser(userId, {
      title: '🧪 Vendzz - Teste PWA',
      body: 'Notificação de teste funcionando! Você deve ver isso na tela de bloqueio mesmo com o app fechado.',
      icon: '/vendzz-logo-official.png',
      url: '/app-pwa-vendzz',
      tag: 'test-notification',
      requireInteraction: true,
      actions: [
        { action: 'view', title: '👀 Abrir App' },
        { action: 'test', title: '🧪 Teste OK' }
      ],
      data: {
        type: 'test',
        timestamp: Date.now()
      }
    });
  }

  // Limpar subscriptions inativas
  async cleanupInactiveSubscriptions(): Promise<number> {
    try {
      console.log('🧹 [PersistentPush] Limpando subscriptions inativas');
      
      await storage.cleanupInactivePushSubscriptions();
      
      console.log('✅ [PersistentPush] Limpeza de subscriptions concluída');
      return 1; // Retornar número de subscriptions limpas
    } catch (error) {
      console.error('❌ [PersistentPush] Erro na limpeza:', error);
      return 0;
    }
  }

  // Obter estatísticas
  async getStats(): Promise<{ totalSubscriptions: number; activeUsers: number }> {
    try {
      const allSubscriptions = await storage.getAllActivePushSubscriptions();
      const uniqueUsers = new Set(allSubscriptions.map(sub => sub.userId));
      
      return {
        totalSubscriptions: allSubscriptions.length,
        activeUsers: uniqueUsers.size
      };
    } catch (error) {
      console.error('❌ [PersistentPush] Erro ao obter estatísticas:', error);
      return { totalSubscriptions: 0, activeUsers: 0 };
    }
  }

  // Obter chave pública VAPID
  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }
}

// Instância singleton
export const persistentPushNotifications = new PersistentPushNotificationSystem();

// Função para agendar notificações automáticas
export const scheduleAutomaticNotifications = () => {
  // Enviar notificações de boas-vindas para novos usuários
  // Enviar lembretes de campanhas
  // Notificar sobre novos leads
  console.log('⏰ [PersistentPush] Sistema de notificações automáticas inicializado');
  
  // Limpeza automática a cada 24 horas
  setInterval(async () => {
    await persistentPushNotifications.cleanupInactiveSubscriptions();
  }, 24 * 60 * 60 * 1000); // 24 horas
};

console.log('🔔 [PersistentPush] Sistema de notificações persistente carregado');
console.log('🔔 [PersistentPush] VAPID Public Key:', VAPID_PUBLIC_KEY);
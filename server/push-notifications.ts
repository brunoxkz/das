/**
 * VENDZZ PUSH NOTIFICATION SYSTEM
 * Sistema completo de notificações PWA que funcionam mesmo com app fechado
 */

import webpush from 'web-push';
import { storage } from './storage-sqlite';
import { nanoid } from 'nanoid';

export interface NotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
  tag?: string;
  priority?: 'low' | 'normal' | 'high';
  campaignId?: string;
  leadId?: string;
}

export class PushNotificationSystem {
  private static vapidKeys = {
    publicKey: 'BD9rGJpT_TjBs2r6-n3papXI9-jF_cUrvLNINWFGh5lOCzrt4XdKb0UU_Lf2vb9aowjLasXKv7Sk368muvNAVJo',
    privateKey: 'tIbwRMUu2f-xyF50rHzme-CAmQwf-AxmvpYtkKaq2xY'
  };

  static initialize() {
    try {
      webpush.setVapidDetails(
        'mailto:admin@vendzz.com',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );
      console.log('✅ VAPID keys configuradas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao configurar VAPID keys:', error);
    }
  }

  static getVapidPublicKey(): string {
    return this.vapidKeys.publicKey;
  }

  /**
   * Salva subscription do usuário no banco de dados
   */
  static async saveUserSubscription(userId: string, subscription: any): Promise<boolean> {
    try {
      console.log(`💾 Salvando subscription para usuário ${userId}`);
      
      // Primeiro, desativar subscriptions antigas do usuário
      await storage.markPushSubscriptionInactive(userId);
      
      // Salvar nova subscription
      const subscriptionData = {
        id: nanoid(),
        userId: userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storage.savePushSubscription(subscriptionData);
      console.log(`✅ Subscription salva com sucesso para ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar subscription:', error);
      return false;
    }
  }

  /**
   * Envia notificação para um usuário específico
   */
  static async sendNotificationToUser(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      const subscriptions = await storage.getActivePushSubscriptions(userId);
      
      if (!subscriptions || subscriptions.length === 0) {
        console.log(`⚠️ Usuário ${userId} não tem subscriptions ativas`);
        return false;
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/vendzz-logo-official.png',
        badge: '/vendzz-logo-official.png',
        url: notification.url || '/app-pwa-vendzz',
        tag: notification.tag || 'vendzz-notification',
        data: {
          url: notification.url || '/app-pwa-vendzz',
          campaignId: notification.campaignId,
          leadId: notification.leadId,
          timestamp: Date.now(),
          source: 'vendzz-pwa'
        },
        actions: [
          {
            action: 'view',
            title: '🚀 Abrir App',
            icon: '/vendzz-logo-official.png'
          },
          {
            action: 'dashboard',
            title: '📊 Dashboard',
            icon: '/vendzz-logo-official.png'
          }
        ]
      });

      const options = {
        TTL: 60 * 60 * 24, // 24 horas
        urgency: notification.priority || 'normal'
      };

      let successCount = 0;
      let errorCount = 0;

      for (const subscription of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey
            }
          };

          await webpush.sendNotification(pushSubscription, payload, options);
          successCount++;
          console.log(`✅ Notificação enviada com sucesso para ${userId}`);
        } catch (error: any) {
          errorCount++;
          console.error(`❌ Erro ao enviar notificação para ${userId}:`, error);
          
          // Se for erro 410 (subscription inválida), marcar como inativa
          if (error.statusCode === 410) {
            await storage.markPushSubscriptionInactive(userId);
            console.log(`🗑️ Subscription inválida removida para ${userId}`);
          }
        }
      }

      // Salvar log da notificação
      await this.saveNotificationLog(userId, notification, successCount > 0 ? 'sent' : 'failed');

      return successCount > 0;
    } catch (error) {
      console.error('❌ Erro geral ao enviar notificação:', error);
      await this.saveNotificationLog(userId, notification, 'failed', error.message);
      return false;
    }
  }

  /**
   * Envia notificação para todos os usuários com subscriptions ativas
   */
  static async sendNotificationToAllUsers(notification: NotificationData): Promise<number> {
    try {
      const allSubscriptions = await storage.getAllActivePushSubscriptions();
      
      if (!allSubscriptions || allSubscriptions.length === 0) {
        console.log('⚠️ Nenhuma subscription ativa encontrada');
        return 0;
      }

      console.log(`📢 Enviando broadcast para ${allSubscriptions.length} subscriptions`);

      let sentCount = 0;
      const uniqueUsers = [...new Set(allSubscriptions.map(s => s.userId))];

      for (const userId of uniqueUsers) {
        const success = await this.sendNotificationToUser(userId, notification);
        if (success) {
          sentCount++;
        }
        
        // Pequeno delay para evitar spam
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Broadcast enviado para ${sentCount}/${uniqueUsers.length} usuários`);
      return sentCount;
    } catch (error) {
      console.error('❌ Erro ao enviar broadcast:', error);
      return 0;
    }
  }

  /**
   * Limpa subscriptions inativas do banco
   */
  static async cleanupInactiveSubscriptions(): Promise<number> {
    try {
      return await storage.cleanupInactivePushSubscriptions();
    } catch (error) {
      console.error('❌ Erro ao limpar subscriptions:', error);
      return 0;
    }
  }

  /**
   * Salva log da notificação enviada
   */
  private static async saveNotificationLog(
    userId: string, 
    notification: NotificationData, 
    status: 'sent' | 'delivered' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      const logData = {
        id: nanoid(),
        userId: userId,
        title: notification.title,
        body: notification.body,
        url: notification.url,
        campaignId: notification.campaignId,
        leadId: notification.leadId,
        status: status,
        errorMessage: errorMessage,
        sentAt: new Date()
      };

      await storage.savePushNotificationLog(logData);
    } catch (error) {
      console.error('❌ Erro ao salvar log de notificação:', error);
    }
  }

  /**
   * Envia notificação quando um novo lead completa um quiz
   */
  static async notifyQuizCompletion(
    quizOwnerId: string, 
    quizName: string, 
    leadData: any,
    quizId: string,
    responseId: string
  ): Promise<boolean> {
    try {
      const fieldsCount = Object.keys(leadData).length;
      const leadName = leadData.nome || leadData.name || 'Lead anônimo';
      const leadEmail = leadData.email || '';
      
      return await this.sendNotificationToUser(quizOwnerId, {
        title: '🎯 Novo Lead Capturado!',
        body: `${leadName} completou "${quizName}" - ${fieldsCount} campos preenchidos`,
        url: `/app-pwa-vendzz?tab=analytics&quiz=${quizId}`,
        tag: 'quiz-completion',
        priority: 'high',
        leadId: responseId,
        campaignId: quizId
      });
    } catch (error) {
      console.error('❌ Erro ao notificar conclusão de quiz:', error);
      return false;
    }
  }

  /**
   * Envia broadcast para todos os usuários (método principal usado pela API)
   */
  static async sendBroadcastNotification(notification: NotificationData): Promise<{
    sentCount: number;
    failedCount: number;
    totalSubscriptions: number;
  }> {
    try {
      const allSubscriptions = await storage.getAllActivePushSubscriptions();
      const totalSubscriptions = allSubscriptions?.length || 0;
      
      if (totalSubscriptions === 0) {
        console.log('⚠️ Nenhuma subscription ativa encontrada para broadcast');
        return {
          sentCount: 0,
          failedCount: 0,
          totalSubscriptions: 0
        };
      }

      console.log(`📢 Iniciando broadcast para ${totalSubscriptions} subscriptions`);

      const uniqueUsers = [...new Set(allSubscriptions.map(s => s.userId))];
      let sentCount = 0;
      let failedCount = 0;

      for (const userId of uniqueUsers) {
        const success = await this.sendNotificationToUser(userId, notification);
        if (success) {
          sentCount++;
        } else {
          failedCount++;
        }
        
        // Pequeno delay para evitar spam
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log(`✅ Broadcast completo: ${sentCount} enviados, ${failedCount} falharam de ${uniqueUsers.length} usuários`);
      
      return {
        sentCount,
        failedCount,
        totalSubscriptions: uniqueUsers.length
      };
    } catch (error) {
      console.error('❌ Erro ao enviar broadcast:', error);
      return {
        sentCount: 0,
        failedCount: 1,
        totalSubscriptions: 0
      };
    }
  }

  /**
   * Envia notificação quando uma campanha é finalizada
   */
  static async notifyCampaignComplete(
    userId: string,
    campaignName: string,
    campaignType: 'sms' | 'email' | 'whatsapp',
    stats: { sent: number; delivered: number; failed: number }
  ): Promise<boolean> {
    try {
      const successRate = stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;
      
      return await this.sendNotificationToUser(userId, {
        title: '✅ Campanha Finalizada',
        body: `${campaignName} (${campaignType.toUpperCase()}) - ${stats.sent} enviados, ${successRate}% sucesso`,
        url: `/app-pwa-vendzz?tab=automacoes`,
        tag: 'campaign-complete',
        priority: 'normal'
      });
    } catch (error) {
      console.error('❌ Erro ao notificar campanha finalizada:', error);
      return false;
    }
  }

  /**
   * Envia notificação de créditos baixos
   */
  static async notifyLowCredits(
    userId: string,
    creditType: 'sms' | 'email' | 'whatsapp',
    remainingCredits: number
  ): Promise<boolean> {
    try {
      return await this.sendNotificationToUser(userId, {
        title: '⚠️ Créditos Baixos',
        body: `Restam apenas ${remainingCredits} créditos de ${creditType.toUpperCase()}. Recarregue agora!`,
        url: `/app-pwa-vendzz?tab=creditos`,
        tag: 'low-credits',
        priority: 'normal'
      });
    } catch (error) {
      console.error('❌ Erro ao notificar créditos baixos:', error);
      return false;
    }
  }
}

// Inicializar VAPID keys quando o módulo for carregado
PushNotificationSystem.initialize();
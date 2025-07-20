import webpush from 'web-push';
import { db } from './db-sqlite';

// Interface para subscription
interface PushSubscription {
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
  campaignId?: string;
  leadId?: string;
  priority?: 'normal' | 'high';
  tag?: string;
}

// Configuração Web Push (VAPID keys geradas pelo web-push)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 
  'BD9rGJpT_TjBs2r6-n3papXI9-jF_cUrvLNINWFGh5lOCzrt4XdKb0UU_Lf2vb9aowjLasXKv7Sk368muvNAVJo';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 
  'tIbwRMUu2f-xyF50rHzme-CAmQwf-AxmvpYtkKaq2xY';

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'admin@vendzz.com';

// Inicialização Web Push
function initWebPush() {
  webpush.setVapidDetails(
    `mailto:${CONTACT_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// Storage para subscriptions (em produção usar banco de dados)
const subscriptions = new Map<string, PushSubscription>();

class WebPushService {
  constructor() {
    initWebPush();
  }

  // Obter chave pública VAPID
  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  // Adicionar subscription
  async addSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      // Em produção: salvar no banco de dados
      // Por enquanto usar Map para demonstração
      subscriptions.set(userId, subscription);

      console.log('✅ Subscription adicionada para usuário:', userId);
    } catch (error) {
      console.error('❌ Erro ao adicionar subscription:', error);
      throw error;
    }
  }

  // Remover subscription
  async removeSubscription(userId: string): Promise<void> {
    try {
      subscriptions.delete(userId);
      console.log('🗑️ Subscription removida para usuário:', userId);
    } catch (error) {
      console.error('❌ Erro ao remover subscription:', error);
      throw error;
    }
  }

  // Enviar notificação para usuário específico
  async sendNotificationToUser(userId: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const subscription = subscriptions.get(userId);
      
      if (!subscription) {
        console.log(`⚠️ Nenhuma subscription encontrada para usuário: ${userId}`);
        return false;
      }

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/icon-72x72.png',
        image: payload.image,
        url: payload.url || '/pwa-dashboard',
        campaignId: payload.campaignId,
        leadId: payload.leadId,
        priority: payload.priority || 'normal',
        tag: payload.tag || 'vendzz-notification',
        timestamp: Date.now()
      });

      await webpush.sendNotification(subscription, notificationPayload);
      
      console.log('🔔 Notificação enviada com sucesso para:', userId);
      return true;

    } catch (error: any) {
      console.error('❌ Erro ao enviar notificação:', error);
      
      // Se subscription expirou, remover
      if (error.statusCode === 410) {
        await this.removeSubscription(userId);
        console.log('🗑️ Subscription expirada removida para:', userId);
      }
      
      return false;
    }
  }

  // Enviar notificação para múltiplos usuários
  async sendBulkNotifications(userIds: string[], payload: NotificationPayload): Promise<{
    success: number;
    failed: number;
  }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendNotificationToUser(userId, payload))
    );

    const success = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - success;

    console.log(`📊 Notificações enviadas: ${success} sucesso, ${failed} falhas`);

    return { success, failed };
  }

  // Notificações específicas para eventos do Vendzz
  async notifyNewLead(userId: string, leadData: any): Promise<boolean> {
    return await this.sendNotificationToUser(userId, {
      title: '🎯 Novo Lead Capturado!',
      body: `${leadData.name || 'Usuário anônimo'} respondeu seu quiz "${leadData.quizName}"`,
      icon: '/icon-192x192.png',
      url: `/pwa-dashboard?lead=${leadData.id}`,
      leadId: leadData.id,
      priority: 'high',
      tag: 'new-lead'
    });
  }

  async notifyCampaignCompleted(userId: string, campaignData: any): Promise<boolean> {
    return await this.sendNotificationToUser(userId, {
      title: '✅ Campanha Finalizada',
      body: `Sua campanha "${campaignData.name}" foi enviada para ${campaignData.sent} contatos`,
      icon: '/icon-192x192.png',
      url: `/pwa-dashboard?campaign=${campaignData.id}`,
      campaignId: campaignData.id,
      priority: 'normal',
      tag: 'campaign-completed'
    });
  }

  async notifyGoalReached(userId: string, goalData: any): Promise<boolean> {
    return await this.sendNotificationToUser(userId, {
      title: '🎉 Meta Alcançada!',
      body: `Parabéns! Você atingiu ${goalData.count} ${goalData.type} hoje!`,
      icon: '/icon-192x192.png',
      url: '/pwa-dashboard?tab=analytics',
      priority: 'high',
      tag: 'goal-reached'
    });
  }

  async notifyCampaignError(userId: string, campaignData: any): Promise<boolean> {
    return await this.sendNotificationToUser(userId, {
      title: '⚠️ Problema na Campanha',
      body: `Sua campanha "${campaignData.name}" precisa de atenção. Clique para ver detalhes.`,
      icon: '/icon-192x192.png',
      url: `/pwa-dashboard?campaign=${campaignData.id}&error=true`,
      campaignId: campaignData.id,
      priority: 'high',
      tag: 'campaign-error'
    });
  }

  // Obter estatísticas de subscriptions
  getStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
  } {
    return {
      totalSubscriptions: subscriptions.size,
      activeSubscriptions: subscriptions.size // Em produção: filtrar por ativas
    };
  }

  // Teste de notificação
  async sendTestNotification(userId: string): Promise<boolean> {
    return await this.sendNotificationToUser(userId, {
      title: '🧪 Teste de Notificação',
      body: 'Se você está vendo isso, as notificações estão funcionando perfeitamente!',
      icon: '/icon-192x192.png',
      url: '/pwa-dashboard',
      priority: 'normal',
      tag: 'test-notification'
    });
  }
}

// Singleton instance
export const webPushService = new WebPushService();

// Tipos para uso em outros arquivos
export type { PushSubscription, NotificationPayload };
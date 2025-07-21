/**
 * VENDZZ PUSH NOTIFICATION SYSTEM - SIMPLIFIED
 * Baseado no sistema robusto do GitHub: https://github.com/umpordez/browser-notification
 */

import webpush from 'web-push';
import path from 'path';
import fs from 'fs';

interface NotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
  tag?: string;
  priority?: 'low' | 'normal' | 'high';
}

interface BroadcastResult {
  sentCount: number;
  failedCount: number;
  totalSubscriptions: number;
}

interface SubscriptionData {
  id: string;
  userId: string;
  pushSubscription: any;
  isActive: boolean;
  createdAt: Date;
}

export class SimplePushNotificationSystem {
  private static vapidKeys = {
    subject: 'mailto:admin@vendzz.com',
    publicKey: 'BD9rGJpT_TjBs2r6-n3papXI9-jF_cUrvLNINWFGh5lOCzrt4XdKb0UU_Lf2vb9aowjLasXKv7Sk368muvNAVJo',
    privateKey: 'tIbwRMUu2f-xyF50rHzme-CAmQwf-AxmvpYtkKaq2xY'
  };

  private static subscriptionsFilePath = path.resolve(process.cwd(), 'vendzz-push-subscriptions.json');
  private static subscriptionsById: { [key: string]: SubscriptionData } = {};

  static async initialize() {
    try {
      webpush.setVapidDetails(
        this.vapidKeys.subject,
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );

      // Carregar subscriptions do arquivo
      await this.loadSubscriptions();
      
      console.log('✅ VAPID configurado para Web Push Real');
    } catch (error) {
      console.error('❌ Erro ao configurar VAPID keys:', error);
    }
  }

  private static async loadSubscriptions() {
    try {
      if (fs.existsSync(this.subscriptionsFilePath)) {
        const contents = await fs.promises.readFile(this.subscriptionsFilePath, 'utf8');
        this.subscriptionsById = JSON.parse(contents);
        console.log(`📱 ${Object.keys(this.subscriptionsById).length} subscriptions ativas carregadas`);
      } else {
        this.subscriptionsById = {};
      }
    } catch (error) {
      console.log('⚠️ Criando novo arquivo de subscriptions');
      this.subscriptionsById = {};
    }
  }

  private static async saveSubscriptions() {
    try {
      await fs.promises.writeFile(
        this.subscriptionsFilePath, 
        JSON.stringify(this.subscriptionsById, null, 2)
      );
    } catch (error) {
      console.error('❌ Erro ao salvar subscriptions:', error);
    }
  }

  static getVapidPublicKey(): string {
    return this.vapidKeys.publicKey;
  }

  /**
   * Registra subscription de um usuário
   */
  static async saveUserSubscription(userId: string, subscription: any): Promise<boolean> {
    try {
      console.log(`💾 Salvando subscription para usuário ${userId}`);
      
      // Criar ID único baseado no userId e timestamp
      const subscriptionId = `${userId}-${Date.now()}`;
      
      // Remover subscriptions antigas do mesmo usuário para evitar duplicatas
      Object.keys(this.subscriptionsById).forEach(key => {
        if (this.subscriptionsById[key].userId === userId) {
          delete this.subscriptionsById[key];
        }
      });
      
      // Adicionar nova subscription
      this.subscriptionsById[subscriptionId] = {
        id: subscriptionId,
        userId: userId,
        pushSubscription: subscription,
        isActive: true,
        createdAt: new Date()
      };

      await this.saveSubscriptions();
      console.log(`✅ Subscription registrada com sucesso para ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar subscription:', error);
      return false;
    }
  }

  /**
   * Envia notificação para todos os usuários ativos
   */
  static async sendBroadcastNotification(notification: NotificationData): Promise<BroadcastResult> {
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/vendzz-logo-official.png',
      badge: '/vendzz-logo-official.png',
      url: notification.url || '/app-pwa-vendzz',
      tag: notification.tag || 'vendzz-broadcast',
      data: {
        url: notification.url || '/app-pwa-vendzz',
        timestamp: Date.now()
      }
    });

    const subscriptions = Object.values(this.subscriptionsById);
    console.log(`📢 Iniciando broadcast para ${subscriptions.length} subscriptions`);

    let sentCount = 0;
    let failedCount = 0;

    for (const subscription of subscriptions) {
      try {
        console.log(`📤 Enviando para usuário ${subscription.userId}`);
        
        await webpush.sendNotification(subscription.pushSubscription, payload);
        sentCount++;
        console.log(`✅ Notificação enviada com sucesso para ${subscription.userId}`);
      } catch (error: any) {
        failedCount++;
        console.error(`❌ Erro ao enviar para ${subscription.userId}:`, error.message);
        
        // Se erro 410 (subscription inválida), remover
        if (error.statusCode === 410) {
          delete this.subscriptionsById[subscription.id];
          console.log(`🗑️ Subscription inválida removida: ${subscription.userId}`);
        }
      }
    }

    // Salvar mudanças (remoções de subscriptions inválidas)
    await this.saveSubscriptions();

    console.log(`✅ Broadcast completo: ${sentCount} enviados, ${failedCount} falharam de ${subscriptions.length} usuários`);

    return {
      sentCount,
      failedCount,
      totalSubscriptions: subscriptions.length
    };
  }

  /**
   * Envia notificação para um usuário específico
   */
  static async sendNotificationToUser(userId: string, notification: NotificationData): Promise<boolean> {
    const userSubscriptions = Object.values(this.subscriptionsById)
      .filter(sub => sub.userId === userId && sub.isActive);

    if (userSubscriptions.length === 0) {
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
        timestamp: Date.now()
      }
    });

    let success = false;
    for (const subscription of userSubscriptions) {
      try {
        await webpush.sendNotification(subscription.pushSubscription, payload);
        console.log(`✅ Notificação enviada para ${userId}`);
        success = true;
      } catch (error: any) {
        console.error(`❌ Erro ao enviar para ${userId}:`, error.message);
        
        // Se erro 410, remover subscription inválida
        if (error.statusCode === 410) {
          delete this.subscriptionsById[subscription.id];
        }
      }
    }

    if (Object.keys(this.subscriptionsById).length !== userSubscriptions.length) {
      await this.saveSubscriptions();
    }

    return success;
  }

  /**
   * Obtém estatísticas das subscriptions
   */
  static getStats() {
    const subscriptions = Object.values(this.subscriptionsById);
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    
    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      uniqueUsers: new Set(subscriptions.map(sub => sub.userId)).size
    };
  }

  /**
   * Remove subscriptions inativas (cleanup)
   */
  static async cleanupInactiveSubscriptions(): Promise<number> {
    const before = Object.keys(this.subscriptionsById).length;
    
    Object.keys(this.subscriptionsById).forEach(key => {
      const subscription = this.subscriptionsById[key];
      if (!subscription.isActive) {
        delete this.subscriptionsById[key];
      }
    });

    await this.saveSubscriptions();
    const removed = before - Object.keys(this.subscriptionsById).length;
    
    if (removed > 0) {
      console.log(`🧹 ${removed} subscriptions inativas removidas`);
    }
    
    return removed;
  }
}
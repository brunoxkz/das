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
      
      // Limpeza automática de subscriptions inválidas
      const removedCount = await this.cleanInvalidSubscriptions();
      if (removedCount > 0) {
        console.log(`🧹 [SimplePWA] ${removedCount} subscriptions inválidas foram removidas na inicialização`);
      }
      
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
   * Validar dados p256dh da subscription
   */
  static validateP256dh(p256dh: string): boolean {
    try {
      // p256dh deve ser uma string base64url de exatamente 65 bytes
      const buffer = Buffer.from(p256dh, 'base64url');
      return buffer.length === 65;
    } catch {
      return false;
    }
  }

  /**
   * Sanitizar e validar subscription
   */
  static sanitizeSubscription(subscription: any): any | null {
    try {
      if (!subscription || !subscription.keys) {
        console.log('❌ [SimplePWA] Subscription inválida - sem keys');
        return null;
      }

      const { p256dh, auth } = subscription.keys;
      
      // Validar p256dh
      if (!this.validateP256dh(p256dh)) {
        console.log(`❌ [SimplePWA] p256dh inválido: ${p256dh?.length || 0} bytes`);
        return null;
      }

      // Validar auth
      if (!auth || typeof auth !== 'string') {
        console.log('❌ [SimplePWA] auth inválido');
        return null;
      }

      // Retornar subscription sanitizada
      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dh,
          auth: auth
        }
      };
    } catch (error) {
      console.error('❌ [SimplePWA] Erro ao sanitizar subscription:', error);
      return null;
    }
  }

  /**
   * Registra subscription de um usuário COM VALIDAÇÃO
   */
  static async saveUserSubscription(userId: string, subscription: any): Promise<boolean> {
    try {
      console.log(`💾 [SimplePWA] Validando subscription para usuário ${userId}`);
      
      // Sanitizar e validar subscription
      const sanitizedSubscription = this.sanitizeSubscription(subscription);
      if (!sanitizedSubscription) {
        console.log(`❌ [SimplePWA] Subscription rejeitada para ${userId} - dados inválidos`);
        return false;
      }
      
      // Criar ID único baseado no userId e timestamp
      const subscriptionId = `${userId}-${Date.now()}`;
      
      // Remover subscriptions antigas do mesmo usuário para evitar duplicatas
      Object.keys(this.subscriptionsById).forEach(key => {
        if (this.subscriptionsById[key].userId === userId) {
          delete this.subscriptionsById[key];
        }
      });
      
      // Adicionar nova subscription VALIDADA
      this.subscriptionsById[subscriptionId] = {
        id: subscriptionId,
        userId: userId,
        pushSubscription: sanitizedSubscription,
        isActive: true,
        createdAt: new Date()
      };

      await this.saveSubscriptions();
      console.log(`✅ [SimplePWA] Subscription VALIDADA e registrada para ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ [SimplePWA] Erro ao salvar subscription:', error);
      return false;
    }
  }

  /**
   * Limpeza de subscriptions inválidas
   */
  static async cleanInvalidSubscriptions(): Promise<number> {
    let removedCount = 0;
    const subscriptionsToRemove: string[] = [];
    
    for (const [id, subscription] of Object.entries(this.subscriptionsById)) {
      // Verificar se a subscription tem dados p256dh válidos
      if (!subscription.pushSubscription?.keys?.p256dh || 
          !this.validateP256dh(subscription.pushSubscription.keys.p256dh)) {
        console.log(`🗑️ [SimplePWA] Marcando subscription inválida para remoção: ${subscription.userId}`);
        subscriptionsToRemove.push(id);
      }
    }
    
    // Remover subscriptions inválidas
    subscriptionsToRemove.forEach(id => {
      delete this.subscriptionsById[id];
      removedCount++;
    });
    
    if (removedCount > 0) {
      await this.saveSubscriptions();
      console.log(`✅ [SimplePWA] ${removedCount} subscriptions inválidas removidas`);
    }
    
    return removedCount;
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
        console.log(`📤 [SimplePWA] Enviando para usuário ${subscription.userId}`);
        
        // VALIDAÇÃO CRÍTICA P256DH ANTES DO ENVIO
        if (!subscription.pushSubscription?.keys?.p256dh || 
            !this.validateP256dh(subscription.pushSubscription.keys.p256dh)) {
          console.log(`❌ [SimplePWA] Subscription com p256dh inválido para ${subscription.userId} - removendo...`);
          delete this.subscriptionsById[subscription.id];
          failedCount++;
          continue;
        }
        
        await webpush.sendNotification(subscription.pushSubscription, payload);
        sentCount++;
        console.log(`✅ [SimplePWA] Notificação enviada com sucesso para ${subscription.userId}`);
      } catch (error: any) {
        failedCount++;
        console.error(`❌ [SimplePWA] Erro ao enviar para ${subscription.userId}:`, error.message);
        
        // Se erro relacionado ao p256dh ou erro 410, remover subscription
        if (error.statusCode === 410 || error.message?.includes('p256dh') || error.message?.includes('65 bytes')) {
          console.log(`🗑️ [SimplePWA] Removendo subscription inválida para ${subscription.userId}: ${error.message}`);
          delete this.subscriptionsById[subscription.id];
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
      console.log(`⚠️ [SimplePWA] Usuário ${userId} não tem subscriptions ativas`);
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
        // VALIDAÇÃO CRÍTICA P256DH ANTES DO ENVIO
        if (!subscription.pushSubscription?.keys?.p256dh || 
            !this.validateP256dh(subscription.pushSubscription.keys.p256dh)) {
          console.log(`❌ [SimplePWA] Subscription com p256dh inválido para ${userId} - removendo...`);
          delete this.subscriptionsById[subscription.id];
          continue;
        }
        
        await webpush.sendNotification(subscription.pushSubscription, payload);
        console.log(`✅ [SimplePWA] Notificação enviada para ${userId}`);
        success = true;
      } catch (error: any) {
        console.error(`❌ [SimplePWA] Erro ao enviar para ${userId}:`, error.message);
        
        // Se erro relacionado ao p256dh ou erro 410, remover subscription
        if (error.statusCode === 410 || error.message?.includes('p256dh') || error.message?.includes('65 bytes')) {
          console.log(`🗑️ [SimplePWA] Removendo subscription inválida para ${userId}: ${error.message}`);
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
   * Buscar todas as subscriptions ativas (para integração com sistema admin)
   */
  static async getAllActiveSubscriptions(): Promise<Array<{ userId: string; subscription: any }>> {
    const activeSubscriptions = Object.values(this.subscriptionsById)
      .filter(sub => sub.isActive)
      .map(sub => ({
        userId: sub.userId,
        subscription: sub.pushSubscription
      }));
    
    console.log(`📊 [SimplePWA] Retornando ${activeSubscriptions.length} subscriptions ativas`);
    return activeSubscriptions;
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
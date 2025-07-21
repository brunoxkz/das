// SERVIÇO DE PUSH NOTIFICATIONS REAIS PARA iOS
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

// Configurar VAPID keys para notificações reais (usando as mesmas do sistema funcionando)
const VAPID_PUBLIC_KEY = 'BLLtVHCNNluirLHUe66GFgqFQ4xm1JCNyXidGYGY1fLbSYZvoaQp1o9zv1Yi6b031z1yyBR1lOrIVxMZkCIim8c';
const VAPID_PRIVATE_KEY = 'C1Z7fZETdfqS7rzXD5tCd0tOEyjf0XMvoWrTNrsgkzU';

webpush.setVapidDetails(
  'mailto:admin@vendzz.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export class RealPushNotificationService {
  private static subscriptionsFile = 'push-subscriptions.json';

  // Ler subscriptions ativas
  private static getSubscriptions(): any[] {
    try {
      const data = fs.readFileSync(this.subscriptionsFile, 'utf8');
      return JSON.parse(data) || [];
    } catch (error) {
      console.log('⚠️ Arquivo de subscriptions não encontrado, criando...');
      return [];
    }
  }

  // Enviar notificação REAL para dispositivos iOS registrados
  static async sendRealPushNotification(
    title: string,
    body: string,
    options: any = {}
  ): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    results: any[];
  }> {
    const subscriptions = this.getSubscriptions();
    console.log(`📱 ENVIANDO PUSH REAL para ${subscriptions.length} dispositivos`);

    if (subscriptions.length === 0) {
      console.log('⚠️ Nenhuma subscription encontrada - apenas simulação será usada');
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        results: []
      };
    }

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/favicon.png',
      url: options.url || '/dashboard',
      timestamp: Date.now(),
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200],
      tag: 'vendzz-real-notification',
      data: {
        url: options.url || '/dashboard',
        notificationType: options.notificationType || 'admin'
      }
    });

    for (const subscription of subscriptions) {
      try {
        console.log(`📤 Enviando para: ${subscription.endpoint?.substring(0, 50)}...`);
        
        // Enviar notificação real usando web-push
        await webpush.sendNotification(subscription, payload);
        
        sentCount++;
        results.push({
          endpoint: subscription.endpoint?.substring(0, 50),
          status: 'sent',
          userId: subscription.userId || 'unknown'
        });
        
        console.log(`✅ PUSH REAL ENVIADO para ${subscription.userId || 'usuário desconhecido'}`);
        
      } catch (error: any) {
        failedCount++;
        results.push({
          endpoint: subscription.endpoint?.substring(0, 50),
          status: 'failed',
          error: error?.message || 'Unknown error',
          userId: subscription.userId || 'unknown'
        });
        
        console.error(`❌ Falha ao enviar push real:`, error?.message || error);
      }
    }

    console.log(`📊 RESULTADO PUSH REAL: ${sentCount} enviados, ${failedCount} falharam`);

    return {
      success: sentCount > 0,
      sentCount,
      failedCount,
      results
    };
  }

  // Enviar notificação específica de quiz completion
  static async sendQuizCompletionNotification(
    adminEmail: string = 'admin@vendzz.com',
    quizData: any = {}
  ): Promise<any> {
    const title = '🎯 Quiz Completo - Vendzz';
    const body = `Novo quiz completado! Usuário: ${quizData.userName || 'Maria Silva'}. Veja os resultados agora.`;
    
    console.log('🎯 ENVIANDO NOTIFICAÇÃO REAL DE QUIZ COMPLETION');
    
    const realResult = await this.sendRealPushNotification(title, body, {
      icon: '/icon-192x192.png',
      badge: '/favicon.png',
      url: '/dashboard',
      notificationType: 'quiz_completion'
    });

    return {
      type: 'quiz_completion',
      title,
      body,
      adminEmail,
      realPushResult: realResult,
      timestamp: new Date().toISOString()
    };
  }

  // Status das subscriptions
  static getSubscriptionsStatus(): any {
    const subscriptions = this.getSubscriptions();
    
    return {
      totalSubscriptions: subscriptions.length,
      hasRealDevices: subscriptions.length > 0,
      devices: subscriptions.map(sub => ({
        userId: sub.userId || 'unknown',
        deviceType: sub.deviceType || 'unknown',
        endpoint: sub.endpoint?.substring(0, 50) + '...',
        createdAt: sub.createdAt
      }))
    };
  }
}
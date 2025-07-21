// Sistema Push Notifications REAL para iOS PWA
import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';
import webpush from 'web-push';

// Arquivo para armazenar subscriptions
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'push-subscriptions.json');

// VAPID Keys com máxima compatibilidade FCM + Apple
const VAPID_KEYS = {
  publicKey: 'BLLtVHCNNluirLHUe66GFgqFQ4xm1JCNyXidGYGY1fLbSYZvoaQp1o9zv1Yi6b031z1yyBR1lOrIVxMZkCIim8c',
  privateKey: 'C1Z7fZETdfqS7rzXD5tCd0tOEyjf0XMvoWrTNrsgkzU'
};

// Configurar web-push com VAPID keys
webpush.setVapidDetails(
  'mailto:admin@vendzz.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  createdAt: string;
}

class SimplePushService {
  
  // Carregar subscriptions do arquivo
  async loadSubscriptions(): Promise<PushSubscription[]> {
    try {
      const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // Salvar subscriptions no arquivo
  async saveSubscriptions(subscriptions: PushSubscription[]): Promise<void> {
    await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
  }

  // Adicionar nova subscription com debug completo para iOS
  async addSubscription(subscription: any, userId?: string): Promise<boolean> {
    try {
      console.log('🔧 RECEBENDO SUBSCRIPTION iOS:', {
        endpoint: subscription.endpoint?.substring(0, 50) + '...',
        keys: subscription.keys ? Object.keys(subscription.keys) : 'sem keys',
        userId: userId || 'anonymous',
        fullSubscription: JSON.stringify(subscription, null, 2)
      });

      const subscriptions = await this.loadSubscriptions();
      
      // Verificar se já existe
      const exists = subscriptions.find(sub => sub.endpoint === subscription.endpoint);
      if (exists) {
        console.log('📱 Subscription já existe para endpoint:', subscription.endpoint?.substring(0, 30) + '...');
        return true;
      }

      // Validar dados obrigatórios
      if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
        console.error('❌ SUBSCRIPTION INVÁLIDA - dados faltando:', {
          hasEndpoint: !!subscription.endpoint,
          hasKeys: !!subscription.keys,
          hasP256dh: !!(subscription.keys && subscription.keys.p256dh),
          hasAuth: !!(subscription.keys && subscription.keys.auth),
          receivedData: subscription
        });
        return false;
      }

      // Adicionar nova
      const newSub: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId: userId,
        createdAt: new Date().toISOString()
      };

      subscriptions.push(newSub);
      await this.saveSubscriptions(subscriptions);
      
      console.log('✅ SUBSCRIPTION SALVA COM SUCESSO! 🎉');
      console.log('📱 Endpoint:', subscription.endpoint.substring(0, 50) + '...');
      console.log('🔑 Keys p256dh:', subscription.keys.p256dh.substring(0, 20) + '...');
      console.log('🔑 Keys auth:', subscription.keys.auth.substring(0, 20) + '...');
      console.log('📊 Total subscriptions ativas:', subscriptions.length);
      
      return true;
    } catch (error) {
      console.error('❌ ERRO CRÍTICO ao salvar subscription:', error);
      return false;
    }
  }

  // Enviar push REAL para todas as subscriptions
  async sendToAll(title: string, body: string, url?: string): Promise<{ success: number, failed: number }> {
    const subscriptions = await this.loadSubscriptions();
    let success = 0;
    let failed = 0;

    console.log(`📨 Enviando push REAL para ${subscriptions.length} subscriptions...`);

    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      url: url || '/',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/favicon.ico'
        }
      ]
    });

    for (const subscription of subscriptions) {
      try {
        console.log('📤 [REAL] Enviando para:', subscription.endpoint.substring(0, 50) + '...');
        console.log('📤 [REAL] Título:', title);
        console.log('📤 [REAL] Corpo:', body);
        
        // Envio REAL usando web-push
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          payload
        );
        
        success++;
        console.log('✅ Push enviado com sucesso!');
      } catch (error) {
        console.error('❌ Falha no envio real:', error instanceof Error ? error.message : error);
        failed++;
      }
    }

    console.log(`✅ Envio completo - Sucesso: ${success}, Falhas: ${failed}`);
    console.log(`📱 ${success} notificações REAIS foram enviadas para dispositivos`);
    return { success, failed };
  }

  // Obter estatísticas
  async getStats(): Promise<{ total: number, recent: number }> {
    const subscriptions = await this.loadSubscriptions();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = subscriptions.filter(sub => new Date(sub.createdAt) > oneDayAgo).length;
    
    return {
      total: subscriptions.length,
      recent: recent
    };
  }
}

// Instância única do serviço
const pushService = new SimplePushService();

// Endpoints para as rotas

export const getVapidPublicKey = async (req: Request, res: Response) => {
  console.log('🔧 Endpoint /push/vapid chamado');
  res.json({ publicKey: VAPID_KEYS.publicKey });
};

export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    console.log('🔧 Endpoint /push/subscribe chamado');
    console.log('📨 Body recebido:', JSON.stringify(req.body, null, 2));
    
    const { subscription } = req.body;
    const userId = (req as any).user?.id || 'ios-pwa-user';

    if (!subscription || !subscription.endpoint) {
      console.error('❌ Subscription inválida:', { subscription });
      return res.status(400).json({ error: 'Subscription inválida' });
    }

    const success = await pushService.addSubscription(subscription, userId);
    
    if (success) {
      console.log('✅ Subscription registrada com sucesso no servidor!');
      res.json({ success: true, message: 'Subscription salva com sucesso' });
    } else {
      console.error('❌ Falha ao registrar subscription no servidor');
      res.status(500).json({ error: 'Erro ao salvar subscription' });
    }
  } catch (error) {
    console.error('❌ Erro crítico no endpoint subscribe:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const sendPushToAll = async (req: Request, res: Response) => {
  try {
    const { title, body, message, url } = req.body;
    
    // Aceitar tanto 'body' quanto 'message'
    const messageText = body || message;

    if (!title || !messageText) {
      return res.status(400).json({ error: 'Title e message são obrigatórios' });
    }

    const result = await pushService.sendToAll(title, messageText, url);
    
    res.json({
      success: true,
      message: `Push enviado para ${result.success + result.failed} subscriptions`,
      stats: result
    });
  } catch (error) {
    console.error('❌ Erro no envio de push:', error);
    res.status(500).json({ error: 'Erro ao enviar push' });
  }
};

export const getPushStats = async (req: Request, res: Response) => {
  try {
    const stats = await pushService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao obter stats:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};

// 🎯 FUNÇÃO ESPECÍFICA PARA QUIZ COMPLETION NOTIFICATIONS
export const sendPushToSpecificUser = async (userId: string, payload: any): Promise<boolean> => {
  try {
    console.log(`🎯 Enviando push notification para usuário específico: ${userId}`);
    
    const subscriptions = await pushService.loadSubscriptions();
    
    // Filtrar subscriptions do usuário específico
    const userSubscriptions = subscriptions.filter(sub => sub.userId === userId);
    
    if (userSubscriptions.length === 0) {
      console.log(`📱 Nenhuma subscription encontrada para usuário: ${userId}`);
      return false;
    }
    
    console.log(`📱 Encontradas ${userSubscriptions.length} subscriptions para ${userId}`);
    
    let successCount = 0;
    
    for (const subscription of userSubscriptions) {
      try {
        console.log(`📤 Enviando para subscription: ${subscription.endpoint.substring(0, 30)}...`);
        
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        successCount++;
        
        console.log(`✅ Push enviado com sucesso para ${userId}`);
      } catch (error) {
        console.error(`❌ Erro ao enviar push para subscription específica:`, error);
        // Continuar tentando outras subscriptions
      }
    }
    
    return successCount > 0;
  } catch (error) {
    console.error(`❌ Erro crítico ao enviar push para usuário ${userId}:`, error);
    return false;
  }
};

export { pushService };
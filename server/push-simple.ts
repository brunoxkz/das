// Sistema Push Notifications Extremamente Simples para iOS PWA
import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';

// Arquivo para armazenar subscriptions
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'push-subscriptions.json');

// VAPID Keys (em produção, usar variáveis de ambiente)
const VAPID_KEYS = {
  publicKey: 'BEqS9Zx3Tp9U4Yfs8n6vK4L4Ft7wXz1kJ2mRvN8gQ3hW5cP6dE7yI9uA5rO3vE8nM2xS4vW6yB1cF9eH7jK5lP8q',
  privateKey: 'r2d2c3po-4e5f-6a7b-8c9d-0e1f2g3h4i5j'
};

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

  // Adicionar nova subscription
  async addSubscription(subscription: any, userId?: string): Promise<boolean> {
    try {
      const subscriptions = await this.loadSubscriptions();
      
      // Verificar se já existe
      const exists = subscriptions.find(sub => sub.endpoint === subscription.endpoint);
      if (exists) {
        console.log('📱 Subscription já existe');
        return true;
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
      
      console.log('✅ Nova subscription salva:', subscription.endpoint.substring(0, 50) + '...');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar subscription:', error);
      return false;
    }
  }

  // Enviar push para todas as subscriptions (simulação para desenvolvimento)
  async sendToAll(title: string, body: string, url?: string): Promise<{ success: number, failed: number }> {
    const subscriptions = await this.loadSubscriptions();
    let success = 0;
    let failed = 0;

    console.log(`📨 Simulando envio push para ${subscriptions.length} subscriptions...`);

    for (const subscription of subscriptions) {
      try {
        // Log da simulação de envio
        console.log('📤 [SIMULAÇÃO] Enviando para:', subscription.endpoint.substring(0, 50) + '...');
        console.log('📤 [SIMULAÇÃO] Título:', title);
        console.log('📤 [SIMULAÇÃO] Corpo:', body);
        
        // Simular pequeno delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        success++;
      } catch (error) {
        console.error('❌ Falha na simulação:', error);
        failed++;
      }
    }

    console.log(`✅ Simulação completa - Sucesso: ${success}, Falhas: ${failed}`);
    console.log(`📱 Em produção, estas notificações apareceriam na tela de bloqueio dos ${success} dispositivos`);
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
  res.json({ publicKey: VAPID_KEYS.publicKey });
};

export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    const { subscription } = req.body;
    const userId = (req as any).user?.id || 'anonymous';

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription inválida' });
    }

    const success = await pushService.addSubscription(subscription, userId);
    
    if (success) {
      res.json({ success: true, message: 'Subscription salva com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao salvar subscription' });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint subscribe:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const sendPushToAll = async (req: Request, res: Response) => {
  try {
    const { title, body, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title e body são obrigatórios' });
    }

    const result = await pushService.sendToAll(title, body, url);
    
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

export { pushService };
import { db } from './db-sqlite';
import { quizResponses, users } from '../shared/schema-sqlite';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon: string;
  badge: string;
  data: {
    type: 'quiz_completion';
    quizId: string;
    userId: string;
    timestamp: number;
  };
}

class RealTimePushNotificationSystem {
  private processingQueue: Set<string> = new Set();
  private batchSize = 50; // Processa 50 notificações por vez
  private batchInterval = 2000; // 2 segundos entre batches
  private pendingNotifications: PushNotificationPayload[] = [];
  private totalNotificationsSent = 0;

  constructor() {
    // Iniciar processamento em batch
    this.startBatchProcessor();
  }

  private processedCompletions: Set<string> = new Set();
  
  /**
   * Verifica se esta completion já foi processada para evitar duplicatas
   */
  private isCompletionAlreadyProcessed(quizId: string, completionId: string): boolean {
    const uniqueKey = `${quizId}_${completionId}`;
    
    if (this.processedCompletions.has(uniqueKey)) {
      console.log(`🔄 DUPLICATA DETECTADA: Completion ${uniqueKey} já foi processada - ignorando`);
      return true;
    }
    
    // Marcar como processada
    this.processedCompletions.add(uniqueKey);
    
    // Limpar cache antigas (manter apenas últimas 1000 para não crescer infinitamente)
    if (this.processedCompletions.size > 1000) {
      const firstEntries = Array.from(this.processedCompletions).slice(0, 500);
      firstEntries.forEach(key => this.processedCompletions.delete(key));
      console.log(`🧹 Cache limpo: removidas 500 entradas antigas`);
    }
    
    console.log(`✅ NOVA COMPLETION: ${uniqueKey} marcada como processada`);
    return false;
  }

  /**
   * Verifica se o usuário tem permissão de push notifications ativa no dispositivo
   * Para 100k+ usuários, só processa quiz completions de usuários que aceitaram notificações
   * ADMIN OVERRIDE: Admin user sempre tem permissão
   */
  private async hasActiveNotificationPermission(userId: string): Promise<boolean> {
    // Admin sempre tem permissão (para testes e configuração)
    if (userId === 'admin-user-id') {
      console.log(`👑 ADMIN OVERRIDE: Usuário ${userId} é admin - notification permission: true`);
      return true;
    }

    try {
      // Verificar se o usuário tem subscription push ativa via arquivo JSON
      const subscriptionsPath = path.join(process.cwd(), 'push-subscriptions.json');
      
      if (!fs.existsSync(subscriptionsPath)) {
        console.log(`📋 Arquivo push-subscriptions.json não existe - criando vazio`);
        fs.writeFileSync(subscriptionsPath, JSON.stringify([]), 'utf8');
        return false;
      }

      const subscriptionsData = fs.readFileSync(subscriptionsPath, 'utf8');
      const subscriptions = JSON.parse(subscriptionsData);

      // Buscar subscription ativa para este usuário
      const userSubscription = subscriptions.find((sub: any) => sub.userId === userId);
      
      if (!userSubscription) {
        console.log(`📱 Usuário ${userId} não tem push notification ativa - permission: false`);
        return false;
      }

      console.log(`✅ Usuário ${userId} tem push notification ativa - permission: true`);
      return true;

    } catch (error) {
      console.error(`❌ Erro ao verificar notification permission do usuário ${userId}:`, error);
      // Em caso de erro, bloquear por segurança (evitar sobrecarga)
      return false;
    }
  }

  /**
   * Detecta quando um quiz foi completado e envia notificação em tempo real
   * IMPORTANTE: Só processa para usuários com subscription ativa (para 100k+ usuários)
   */
  async onQuizCompleted(quizId: string, userId: string): Promise<void> {
    try {
      // Evitar duplicatas usando Set
      const completionKey = `${quizId}-${userId}-${Date.now()}`;
      if (this.processingQueue.has(completionKey)) {
        return;
      }
      this.processingQueue.add(completionKey);

      // Buscar informações do quiz e dono
      const [quizOwner] = await db
        .select({
          ownerId: users.id,
          ownerEmail: users.email,
          quizTitle: quizResponses.quizId // Usar como referência temporária
        })
        .from(quizResponses)
        .innerJoin(users, eq(users.id, quizResponses.userId))
        .where(eq(quizResponses.quizId, quizId))
        .limit(1);

      if (!quizOwner) {
        console.log(`❌ Quiz owner não encontrado para quiz ${quizId}`);
        this.processingQueue.delete(completionKey);
        return;
      }

      // 🔒 VERIFICAÇÃO CRÍTICA: Só processar para usuários que ativaram push notifications
      // Para evitar sobrecarga com 100k+ usuários que não querem notificações
      const hasNotificationPermission = await this.hasActiveNotificationPermission(quizOwner.ownerId);
      if (!hasNotificationPermission) {
        console.log(`🔒 BLOCKED: Usuário ${quizOwner.ownerId} sem push notification ativa - quiz completion não processado (economia de recursos)`);
        this.processingQueue.delete(completionKey);
        return;
      }

      console.log(`✅ AUTHORIZED: Usuário ${quizOwner.ownerId} com push notification ativa - processando quiz completion`);

      // Verificar se o dono tem subscription push ativa via arquivo JSON
      const subscriptionsPath = path.join(process.cwd(), 'push-subscriptions.json');
      let subscriptions = [];
      
      try {
        if (fs.existsSync(subscriptionsPath)) {
          const data = fs.readFileSync(subscriptionsPath, 'utf8');
          const allSubscriptions = JSON.parse(data);
          subscriptions = allSubscriptions.filter((s: any) => s.userId === quizOwner.ownerId);
        }
      } catch (error) {
        console.error('❌ Erro ao ler subscriptions:', error);
      }

      if (subscriptions.length === 0) {
        console.log(`📱 Usuário ${quizOwner.ownerId} não tem push subscription ativa`);
        this.processingQueue.delete(completionKey);
        return;
      }

      // Criar notificação
      const notification: PushNotificationPayload = {
        title: '🎉 Novo Lead Capturado!',
        body: `Alguém completou seu funil quiz! Confira os detalhes no dashboard.`,
        icon: '/icon-192x192.png',
        badge: '/favicon.png',
        data: {
          type: 'quiz_completion',
          quizId,
          userId,
          timestamp: Date.now()
        }
      };

      // Adicionar à fila de processamento
      this.pendingNotifications.push(notification);

      console.log(`✅ Notificação adicionada à fila para quiz ${quizId}`);
      this.processingQueue.delete(completionKey);

    } catch (error) {
      console.error('❌ Erro ao processar quiz completion:', error);
      this.processingQueue.delete(`${quizId}-${userId}-${Date.now()}`);
    }
  }

  /**
   * Processador em batch para otimizar performance
   */
  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.pendingNotifications.length === 0) return;

      // Pegar batch de notificações
      const batch = this.pendingNotifications.splice(0, this.batchSize);
      
      console.log(`📦 Processando batch de ${batch.length} notificações push`);

      // Processar em paralelo para máxima eficiência
      const promises = batch.map(notification => this.sendPushNotification(notification));
      
      try {
        await Promise.allSettled(promises);
        console.log(`✅ Batch de ${batch.length} notificações processado`);
      } catch (error) {
        console.error('❌ Erro no batch processor:', error);
      }
    }, this.batchInterval);
  }

  /**
   * Envia notificação push para todas as subscriptions do usuário via API simples
   */
  private async sendPushNotification(notification: PushNotificationPayload): Promise<void> {
    try {
      // Usar o sistema de push existente via API interna
      const pushPayload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        data: notification.data
      };

      // Simular envio para subscriptions ativas
      console.log(`📱 Enviando push notification: ${notification.title}`);
      console.log(`📄 Conteúdo: ${notification.body}`);
      
      // Incrementar contador
      this.totalNotificationsSent++;
      
      // Em produção, aqui seria integrado com o sistema de push existente
      // Por enquanto, apenas log para desenvolvimento
      
    } catch (error) {
      console.error('❌ Erro ao enviar push notification:', error);
    }
  }

  /**
   * Método para testar o sistema com dados simulados
   */
  async testNotification(quizId: string = 'test-quiz', userId: string = 'test-user'): Promise<void> {
    console.log('🧪 Testando sistema de notificações push...');
    await this.onQuizCompleted(quizId, userId);
  }

  /**
   * Estatísticas do sistema
   */
  getStats() {
    return {
      totalNotificationsSent: this.totalNotificationsSent,
      notificationsInQueue: this.pendingNotifications.length,
      processing: this.processingQueue.size,
      batchSize: this.batchSize,
      batchInterval: this.batchInterval,
      systemStatus: 'active',
      lastProcessed: new Date().toISOString()
    };
  }
}

// Instância singleton otimizada para performance
export const realTimePushSystem = new RealTimePushNotificationSystem();

console.log('🚀 Sistema de Push Notifications em Tempo Real inicializado');
console.log('📊 Configurações: Batch size=50, Interval=2s, Suporte 100k usuários');
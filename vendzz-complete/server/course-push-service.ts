import webpush from 'web-push';
import { db } from './db-sqlite';
import { coursePushSubscriptions, scheduledCourseNotifications, courseNotificationTemplates, enrollments } from '@shared/schema-sqlite';
import { eq, and, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// VAPID keys (reutilizando as existentes do sistema global - CORRETAS)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BLLtVHCNNluirLHUe66GFgqFQ4xm1JCNyXidGYGY1fLbSYZvoaQp1o9zv1Yi6b031z1yyBR1lOrIVxMZkCIim8c',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'C1Z7fZETdfqS7rzXD5tCd0tOEyjf0XMvoWrTNrsgkzU'
};

webpush.setVapidDetails(
  'mailto:admin@vendzz.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export class CoursePushService {
  // Inscrever usuário para notificações do curso
  async subscribeToCourse(courseId: string, userId: string, subscription: any) {
    try {
      // Verificar se já existe inscrição ativa
      const existingSubscription = await db
        .select()
        .from(coursePushSubscriptions)
        .where(
          and(
            eq(coursePushSubscriptions.courseId, courseId),
            eq(coursePushSubscriptions.userId, userId),
            eq(coursePushSubscriptions.isActive, true)
          )
        )
        .limit(1);

      if (existingSubscription.length > 0) {
        // Atualizar subscription existente
        await db
          .update(coursePushSubscriptions)
          .set({
            subscription: JSON.stringify(subscription),
            createdAt: new Date(),
          })
          .where(eq(coursePushSubscriptions.id, existingSubscription[0].id));
        
        return existingSubscription[0].id;
      } else {
        // Criar nova inscrição
        const subscriptionId = nanoid();
        await db.insert(coursePushSubscriptions).values({
          id: subscriptionId,
          courseId,
          userId,
          subscription: JSON.stringify(subscription),
          isActive: true,
          createdAt: new Date(),
        });
        
        return subscriptionId;
      }
    } catch (error) {
      console.error('Erro ao inscrever para push do curso:', error);
      throw error;
    }
  }

  // Cancelar inscrição de notificações do curso
  async unsubscribeFromCourse(courseId: string, userId: string) {
    try {
      await db
        .update(coursePushSubscriptions)
        .set({ isActive: false })
        .where(
          and(
            eq(coursePushSubscriptions.courseId, courseId),
            eq(coursePushSubscriptions.userId, userId)
          )
        );
      
      return true;
    } catch (error) {
      console.error('Erro ao cancelar inscrição push do curso:', error);
      throw error;
    }
  }

  // Enviar notificação para curso específico
  async sendToCourse(courseId: string, notification: {
    title: string;
    message: string;
    icon?: string;
    url?: string;
    targetAudience?: 'all' | 'specific_users' | 'progress_based';
    targetUserIds?: string[];
    progressFilter?: any;
  }) {
    try {
      // Buscar todas as inscrições ativas do curso
      let targetSubscriptions = await db
        .select()
        .from(coursePushSubscriptions)
        .where(
          and(
            eq(coursePushSubscriptions.courseId, courseId),
            eq(coursePushSubscriptions.isActive, true)
          )
        );

      // Filtrar por audiência específica
      if (notification.targetAudience === 'specific_users' && notification.targetUserIds?.length) {
        targetSubscriptions = targetSubscriptions.filter(sub => 
          notification.targetUserIds!.includes(sub.userId)
        );
      }

      if (notification.targetAudience === 'progress_based' && notification.progressFilter) {
        // Buscar usuários com base no progresso
        const enrollmentsWithProgress = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.courseId, courseId));
        
        // Aplicar filtros de progresso (ex: progress >= 50%)
        const filteredUserIds = enrollmentsWithProgress
          .filter(enrollment => {
            const progress = enrollment.progress || 0;
            if (notification.progressFilter.minProgress && progress < notification.progressFilter.minProgress) return false;
            if (notification.progressFilter.maxProgress && progress > notification.progressFilter.maxProgress) return false;
            return true;
          })
          .map(enrollment => enrollment.userId);

        targetSubscriptions = targetSubscriptions.filter(sub => 
          filteredUserIds.includes(sub.userId)
        );
      }

      let sentCount = 0;
      let failedCount = 0;

      // Enviar notificações
      for (const subscription of targetSubscriptions) {
        try {
          const pushSubscription = JSON.parse(subscription.subscription);
          
          const payload = JSON.stringify({
            title: notification.title,
            body: notification.message,
            icon: notification.icon || '/logo-vendzz-white.png',
            badge: '/logo-vendzz-white.png',
            url: notification.url || `/curso/${courseId}`,
            tag: `course-${courseId}`,
            data: {
              courseId,
              url: notification.url || `/curso/${courseId}`,
              timestamp: Date.now()
            }
          });

          await webpush.sendNotification(pushSubscription, payload);
          sentCount++;

          // Atualizar timestamp da última notificação
          await db
            .update(coursePushSubscriptions)
            .set({ lastNotificationAt: new Date() })
            .where(eq(coursePushSubscriptions.id, subscription.id));

        } catch (error) {
          console.error(`Erro ao enviar push para ${subscription.userId}:`, error);
          failedCount++;
        }
      }

      return {
        sentCount,
        failedCount,
        totalSubscriptions: targetSubscriptions.length
      };

    } catch (error) {
      console.error('Erro ao enviar notificação do curso:', error);
      throw error;
    }
  }

  // Agendar notificação para o futuro
  async scheduleNotification(
    courseId: string,
    creatorId: string,
    notification: {
      title: string;
      message: string;
      icon?: string;
      url?: string;
      targetAudience?: 'all' | 'specific_users' | 'progress_based';
      targetUserIds?: string[];
      progressFilter?: any;
      scheduledFor: Date;
    }
  ) {
    try {
      const scheduleId = nanoid();
      
      await db.insert(scheduledCourseNotifications).values({
        id: scheduleId,
        courseId,
        creatorId,
        title: notification.title,
        message: notification.message,
        icon: notification.icon,
        url: notification.url,
        targetAudience: notification.targetAudience || 'all',
        targetUserIds: notification.targetUserIds ? JSON.stringify(notification.targetUserIds) : null,
        progressFilter: notification.progressFilter ? JSON.stringify(notification.progressFilter) : null,
        scheduledFor: notification.scheduledFor,
        status: 'scheduled',
        createdAt: new Date(),
      });

      return scheduleId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      throw error;
    }
  }

  // Processar notificações agendadas (chamado por cron job)
  async processScheduledNotifications() {
    try {
      const now = new Date();
      
      const pendingNotifications = await db
        .select()
        .from(scheduledCourseNotifications)
        .where(
          and(
            eq(scheduledCourseNotifications.status, 'scheduled'),
            // scheduledFor <= now
          )
        );

      for (const notification of pendingNotifications) {
        try {
          const result = await this.sendToCourse(notification.courseId, {
            title: notification.title,
            message: notification.message,
            icon: notification.icon || undefined,
            url: notification.url || undefined,
            targetAudience: notification.targetAudience as any,
            targetUserIds: notification.targetUserIds ? JSON.parse(notification.targetUserIds) : undefined,
            progressFilter: notification.progressFilter ? JSON.parse(notification.progressFilter) : undefined,
          });

          // Atualizar status para enviado
          await db
            .update(scheduledCourseNotifications)
            .set({
              status: 'sent',
              sentAt: new Date(),
              sentCount: result.sentCount,
              failedCount: result.failedCount,
            })
            .where(eq(scheduledCourseNotifications.id, notification.id));

        } catch (error) {
          console.error(`Erro ao processar notificação agendada ${notification.id}:`, error);
          
          // Marcar como falha
          await db
            .update(scheduledCourseNotifications)
            .set({ status: 'failed' })
            .where(eq(scheduledCourseNotifications.id, notification.id));
        }
      }

    } catch (error) {
      console.error('Erro ao processar notificações agendadas:', error);
    }
  }

  // Criar template de notificação
  async createTemplate(courseId: string, template: {
    name: string;
    title: string;
    message: string;
    icon?: string;
    url?: string;
    type: 'welcome' | 'reminder' | 'new_lesson' | 'completion' | 'custom';
    triggerCondition?: any;
  }) {
    try {
      const templateId = nanoid();
      
      await db.insert(courseNotificationTemplates).values({
        id: templateId,
        courseId,
        name: template.name,
        title: template.title,
        message: template.message,
        icon: template.icon,
        url: template.url,
        type: template.type,
        isActive: true,
        triggerCondition: template.triggerCondition ? JSON.stringify(template.triggerCondition) : null,
        createdAt: new Date(),
      });

      return templateId;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  // Disparo automático baseado em eventos
  async triggerAutoNotification(courseId: string, event: string, data: any) {
    try {
      // Buscar templates ativos para o tipo de evento
      const templates = await db
        .select()
        .from(courseNotificationTemplates)
        .where(
          and(
            eq(courseNotificationTemplates.courseId, courseId),
            eq(courseNotificationTemplates.type, event as any),
            eq(courseNotificationTemplates.isActive, true)
          )
        );

      for (const template of templates) {
        // Verificar condições de disparo se existirem
        if (template.triggerCondition) {
          const condition = JSON.parse(template.triggerCondition);
          // Implementar lógica de condições baseada em data
          // Ex: se progress >= 100% para tipo 'completion'
        }

        // Personalizar mensagem com variáveis
        let personalizedTitle = template.title;
        let personalizedMessage = template.message;
        
        // Substituir variáveis como {userName}, {courseName}, etc.
        if (data.userName) {
          personalizedTitle = personalizedTitle.replace('{userName}', data.userName);
          personalizedMessage = personalizedMessage.replace('{userName}', data.userName);
        }
        
        if (data.courseName) {
          personalizedTitle = personalizedTitle.replace('{courseName}', data.courseName);
          personalizedMessage = personalizedMessage.replace('{courseName}', data.courseName);
        }

        // Enviar notificação
        await this.sendToCourse(courseId, {
          title: personalizedTitle,
          message: personalizedMessage,
          icon: template.icon || undefined,
          url: template.url || undefined,
          targetAudience: 'specific_users',
          targetUserIds: [data.userId],
        });
      }

    } catch (error) {
      console.error('Erro ao disparar notificação automática:', error);
    }
  }

  // Estatísticas das notificações do curso
  async getCourseStats(courseId: string) {
    try {
      const subscriptions = await db
        .select()
        .from(coursePushSubscriptions)
        .where(
          and(
            eq(coursePushSubscriptions.courseId, courseId),
            eq(coursePushSubscriptions.isActive, true)
          )
        );

      const scheduledNotifications = await db
        .select()
        .from(scheduledCourseNotifications)
        .where(eq(scheduledCourseNotifications.courseId, courseId));

      const sentNotifications = scheduledNotifications.filter(n => n.status === 'sent');
      const pendingNotifications = scheduledNotifications.filter(n => n.status === 'scheduled');

      const totalSent = sentNotifications.reduce((acc, n) => acc + (n.sentCount || 0), 0);
      const totalFailed = sentNotifications.reduce((acc, n) => acc + (n.failedCount || 0), 0);

      return {
        totalSubscribers: subscriptions.length,
        totalNotificationsSent: sentNotifications.length,
        totalMessagesSent: totalSent,
        totalMessagesFailed: totalFailed,
        pendingNotifications: pendingNotifications.length,
        successRate: totalSent > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export const coursePushService = new CoursePushService();
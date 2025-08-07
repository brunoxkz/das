import type { Request, Response } from "express";

// Simulador de notificações administrativas específicas para admin@vendzz.com
export class AdminNotificationSimulator {
  private static notifications: Array<{
    id: string;
    email: string;
    title: string;
    body: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'clicked';
    deviceType: string;
  }> = [];

  // Simular envio de notificação iOS para admin@vendzz.com
  static async sendAdminNotification(
    email: string,
    title: string,
    body: string,
    options: any = {}
  ): Promise<{ success: boolean; notificationId: string; message: string }> {
    
    const notificationId = `admin-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Criar registro da notificação
    const notification = {
      id: notificationId,
      email: email,
      title: title,
      body: body,
      timestamp: new Date().toISOString(),
      status: 'sent' as const,
      deviceType: 'iOS PWA',
      ...options
    };

    // Salvar na lista de notificações
    this.notifications.push(notification);

    // Log detalhado no console
    console.log('📱 NOTIFICAÇÃO iOS ADMIN ENVIADA:');
    console.log(`   🎯 Para: ${email}`);
    console.log(`   📋 Título: ${title}`);
    console.log(`   📝 Corpo: ${body}`);
    console.log(`   🆔 ID: ${notificationId}`);
    console.log(`   ⏰ Timestamp: ${notification.timestamp}`);
    console.log(`   📱 Dispositivo: ${notification.deviceType}`);
    
    // Simular entrega após 1 segundo
    setTimeout(() => {
      notification.status = 'delivered';
      console.log(`   ✅ Notificação ${notificationId} ENTREGUE na tela de bloqueio do iOS`);
    }, 1000);

    return {
      success: true,
      notificationId: notificationId,
      message: `Notificação iOS enviada com sucesso para ${email}`
    };
  }

  // Obter histórico de notificações para um admin
  static getAdminNotifications(email: string): any[] {
    return this.notifications
      .filter(notif => notif.email === email)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Obter todas as notificações administrativas
  static getAllNotifications(): any[] {
    return this.notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Estatísticas de notificações
  static getStats(): {
    total: number;
    sent: number;
    delivered: number;
    clicked: number;
    recentNotifications: any[];
  } {
    const stats = {
      total: this.notifications.length,
      sent: this.notifications.filter(n => n.status === 'sent').length,
      delivered: this.notifications.filter(n => n.status === 'delivered').length,
      clicked: this.notifications.filter(n => n.status === 'clicked').length,
      recentNotifications: this.notifications.slice(0, 5)
    };

    return stats;
  }
}

// Endpoint para enviar notificação específica para admin
export async function sendAdminNotification(req: Request, res: Response) {
  try {
    const { email, title, body, options } = req.body;

    // Validar que é um admin
    if (!email.includes('admin') && !email.includes('vendzz.com')) {
      return res.status(403).json({
        success: false,
        message: 'Endpoint apenas para administradores'
      });
    }

    const result = await AdminNotificationSimulator.sendAdminNotification(
      email,
      title,
      body,
      options
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao enviar notificação admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Endpoint para buscar notificações de um admin
export async function getAdminNotifications(req: Request, res: Response) {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const notifications = AdminNotificationSimulator.getAdminNotifications(email);

    res.json({
      success: true,
      data: {
        email: email,
        notifications: notifications,
        count: notifications.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar notificações admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Endpoint para estatísticas de notificações administrativas
export async function getAdminNotificationStats(req: Request, res: Response) {
  try {
    const stats = AdminNotificationSimulator.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar stats de notificações admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
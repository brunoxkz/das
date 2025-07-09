import { MailService } from '@sendgrid/mail';
import { storage } from './storage-sqlite';

class EmailService {
  private mailService: MailService;
  private isConfigured = false;

  constructor() {
    this.mailService = new MailService();
    this.configure();
  }

  private configure() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      this.mailService.setApiKey(apiKey);
      this.isConfigured = true;
      console.log('📧 SendGrid configurado com sucesso');
    } else {
      console.warn('⚠️  SENDGRID_API_KEY não configurado - emails não serão enviados');
    }
  }

  async sendEmail(params: {
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
    campaignId?: string;
    leadData?: any;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'SendGrid não configurado' };
    }

    try {
      const emailData = {
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text,
        html: params.html,
      };

      // Enviar email via SendGrid
      const response = await this.mailService.send(emailData);
      const messageId = response[0].headers['x-message-id'];

      // Registrar log de envio
      if (params.campaignId) {
        await storage.createEmailLog({
          campaignId: params.campaignId,
          email: params.to,
          personalizedSubject: params.subject,
          personalizedContent: params.html || params.text || '',
          leadData: params.leadData,
          status: 'sent',
          sendgridId: messageId,
          sentAt: Math.floor(Date.now() / 1000)
        });
      }

      return { success: true, messageId };
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      // Registrar log de erro
      if (params.campaignId) {
        await storage.createEmailLog({
          campaignId: params.campaignId,
          email: params.to,
          personalizedSubject: params.subject,
          personalizedContent: params.html || params.text || '',
          leadData: params.leadData,
          status: 'failed',
          errorMessage: error.message || 'Erro desconhecido'
        });
      }

      return { success: false, error: error.message || 'Erro ao enviar email' };
    }
  }

  async sendBulkEmails(emails: Array<{
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
    campaignId?: string;
    leadData?: any;
  }>): Promise<{ sent: number; failed: number; errors: string[] }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(email);
      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${email.to}: ${result.error}`);
      }
      
      // Delay entre emails para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed, errors };
  }

  async processScheduledEmails(): Promise<void> {
    try {
      const scheduledEmails = await storage.getScheduledEmails();
      
      for (const emailLog of scheduledEmails) {
        // Buscar dados da campanha
        const campaign = await storage.getEmailCampaign(emailLog.campaignId);
        if (!campaign) continue;

        // Enviar email
        const result = await this.sendEmail({
          to: emailLog.email,
          from: campaign.fromEmail,
          subject: emailLog.personalizedSubject,
          html: emailLog.personalizedContent,
          campaignId: emailLog.campaignId,
          leadData: emailLog.leadData
        });

        // Atualizar status do log
        if (result.success) {
          await storage.updateEmailLogStatus(emailLog.id, 'sent', { 
            sendgridId: result.messageId 
          });
        } else {
          await storage.updateEmailLogStatus(emailLog.id, 'failed', { 
            errorMessage: result.error 
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar emails agendados:', error);
    }
  }

  async createEmailCampaignFromQuiz(params: {
    userId: string;
    campaignName: string;
    quizId: string;
    emailTemplate: string;
    subject: string;
    fromEmail: string;
    targetAudience: 'all' | 'completed' | 'abandoned';
    triggerType: 'immediate' | 'delayed';
    triggerDelay?: number;
    triggerUnit?: 'minutes' | 'hours' | 'days';
  }): Promise<{ success: boolean; campaignId?: string; scheduledEmails?: number; error?: string }> {
    try {
      // Criar campanha
      const campaign = await storage.createEmailCampaign({
        name: params.campaignName,
        quizId: params.quizId,
        subject: params.subject,
        content: params.emailTemplate,
        fromEmail: params.fromEmail,
        targetAudience: params.targetAudience,
        triggerType: params.triggerType,
        triggerDelay: params.triggerDelay || 0,
        triggerUnit: params.triggerUnit || 'minutes',
        userId: params.userId,
        status: 'active'
      });

      // Buscar respostas do quiz
      const quizResponses = await storage.getQuizResponsesForEmail(params.quizId, params.targetAudience);
      const emails = storage.extractEmailsFromResponses(quizResponses);

      let scheduledEmails = 0;
      const now = Math.floor(Date.now() / 1000);
      
      // Criar logs para cada email
      for (const response of quizResponses) {
        const emailAddress = this.extractEmailFromResponse(response);
        if (!emailAddress) continue;

        const leadData = this.extractLeadDataFromResponse(response);
        
        // Personalizar conteúdo
        const personalizedSubject = storage.personalizeEmailContent(params.subject, leadData);
        const personalizedContent = storage.personalizeEmailContent(params.emailTemplate, leadData);

        // Calcular tempo de agendamento
        let scheduledAt = now;
        if (params.triggerType === 'delayed' && params.triggerDelay) {
          const delayInSeconds = this.convertDelayToSeconds(params.triggerDelay, params.triggerUnit || 'minutes');
          scheduledAt = now + delayInSeconds;
        }

        // Criar log de email
        await storage.createEmailLog({
          campaignId: campaign.id,
          email: emailAddress,
          personalizedSubject,
          personalizedContent,
          leadData,
          status: params.triggerType === 'immediate' ? 'scheduled' : 'scheduled',
          scheduledAt
        });

        scheduledEmails++;
      }

      return { success: true, campaignId: campaign.id, scheduledEmails };
    } catch (error: any) {
      console.error('Erro ao criar campanha de email:', error);
      return { success: false, error: error.message };
    }
  }

  private extractEmailFromResponse(response: any): string | null {
    try {
      const responses = typeof response.responses === 'string' ? 
        JSON.parse(response.responses) : response.responses;
      
      // Procurar por campos de email
      for (const [key, value] of Object.entries(responses)) {
        if (key.includes('email') && typeof value === 'string') {
          return value;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private extractLeadDataFromResponse(response: any): any {
    try {
      const responses = typeof response.responses === 'string' ? 
        JSON.parse(response.responses) : response.responses;
      
      return {
        nome: responses.nome || responses.name || 'Usuário',
        email: this.extractEmailFromResponse(response) || '',
        telefone: responses.telefone || responses.phone || '',
        idade: responses.idade || responses.age || '',
        altura: responses.altura || responses.height || '',
        peso_atual: responses.peso_atual || responses.current_weight || '',
        peso_objetivo: responses.peso_objetivo || responses.target_weight || '',
        data_nascimento: responses.data_nascimento || responses.birth_date || '',
        submittedAt: response.submittedAt || new Date().toISOString()
      };
    } catch (error) {
      return {};
    }
  }

  private convertDelayToSeconds(delay: number, unit: string): number {
    switch (unit) {
      case 'minutes': return delay * 60;
      case 'hours': return delay * 60 * 60;
      case 'days': return delay * 24 * 60 * 60;
      default: return delay * 60; // default to minutes
    }
  }
}

export const emailService = new EmailService();
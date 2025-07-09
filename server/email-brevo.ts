import fetch from 'node-fetch';
import { storage } from './storage-sqlite';

interface BrevoEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: { name: string; email: string };
}

export class BrevoEmailService {
  private apiKey: string;
  private apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(params: BrevoEmailParams): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Api-Key': this.apiKey
        },
        body: JSON.stringify({
          sender: params.sender || {
            email: "brunotolentino94@gmail.com",
            name: "Sistema Vendzz"
          },
          to: [{
            email: params.to
          }],
          subject: params.subject,
          htmlContent: params.htmlContent,
          textContent: params.textContent || this.stripHtml(params.htmlContent)
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Brevo API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  async verifyApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Api-Key': this.apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying Brevo API key:', error);
      return false;
    }
  }

  async createEmailCampaignFromQuiz(options: {
    userId: string;
    campaignName: string;
    quizId: string;
    emailTemplate: string;
    subject: string;
    targetAudience: string;
    triggerType: string;
    triggerDelay?: number;
    triggerUnit?: string;
  }): Promise<{
    success: boolean;
    campaignId?: string;
    scheduledEmails?: number;
    error?: string;
  }> {
    try {
      // Criar campanha no banco
      const campaign = await storage.createEmailCampaign({
        userId: options.userId,
        name: options.campaignName,
        quizId: options.quizId,
        subject: options.subject,
        content: options.emailTemplate,
        status: 'active',
        targetAudience: options.targetAudience,
        triggerType: options.triggerType,
        triggerDelay: options.triggerDelay,
        triggerUnit: options.triggerUnit
      });

      // Buscar respostas do quiz
      const responses = await storage.getQuizResponsesForEmail(options.quizId, options.targetAudience);
      const emails = storage.extractEmailsFromResponses(responses);

      return {
        success: true,
        campaignId: campaign.id,
        scheduledEmails: emails.length
      };
    } catch (error) {
      console.error('Error creating email campaign:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Criar instância do serviço
const BREVO_API_KEY = process.env.BREVO_API_KEY || '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';
const brevoService = new BrevoEmailService(BREVO_API_KEY);

// Função de conveniência para uso nas rotas
export const sendEmail = async (params: BrevoEmailParams): Promise<boolean> => {
  return await brevoService.sendEmail(params);
};

export const emailService = brevoService;
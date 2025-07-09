import { BrevoEmailService } from './email-brevo';
import { SQLiteStorage } from './storage-sqlite';
import { nanoid } from 'nanoid';

interface EmailCampaignOptions {
  userId: string;
  campaignName: string;
  quizId: string;
  emailTemplate: string;
  subject: string;
  targetAudience: 'all' | 'completed' | 'abandoned';
  triggerType: 'immediate' | 'delayed';
  triggerDelay?: number;
  triggerUnit?: 'minutes' | 'hours' | 'days';
}

interface EmailCampaignResult {
  success: boolean;
  campaignId?: string;
  scheduledEmails?: number;
  error?: string;
}

export class EmailService {
  private storage: SQLiteStorage;
  private brevoService: BrevoEmailService;

  constructor(storage: SQLiteStorage, brevoApiKey: string) {
    this.storage = storage;
    this.brevoService = new BrevoEmailService(brevoApiKey);
  }

  async createEmailCampaignFromQuiz(options: EmailCampaignOptions): Promise<EmailCampaignResult> {
    try {
      console.log('📧 CRIANDO CAMPANHA DE EMAIL...', options);

      // 1. Buscar respostas do quiz
      const responses = await this.storage.getQuizResponsesForEmail(options.quizId, options.targetAudience);
      console.log(`📧 RESPOSTAS ENCONTRADAS: ${responses.length}`);

      // 2. Extrair emails das respostas
      const emails = this.extractEmailsFromResponses(responses);
      console.log(`📧 EMAILS EXTRAÍDOS: ${emails.length}`, emails);

      // 3. Criar campanha no banco
      const campaignId = nanoid();
      const now = Math.floor(Date.now() / 1000); // Timestamp em segundos para SQLite
      const campaignData = {
        id: campaignId,
        userId: options.userId,
        name: options.campaignName,
        quizId: options.quizId,
        subject: options.subject,
        content: options.emailTemplate,
        targetAudience: options.targetAudience,
        triggerType: options.triggerType,
        triggerDelay: options.triggerDelay || 0,
        triggerUnit: options.triggerUnit || 'minutes',
        status: 'active',
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        createdAt: now,
        updatedAt: now
      };

      await this.storage.createEmailCampaign(campaignData);
      console.log(`📧 CAMPANHA CRIADA: ${campaignId}`);

      // 4. Enviar emails imediatamente (se for immediate)
      if (options.triggerType === 'immediate') {
        await this.sendEmailsForCampaign(campaignId, emails, responses, options);
      }

      return {
        success: true,
        campaignId,
        scheduledEmails: emails.length
      };

    } catch (error) {
      console.error('❌ ERRO AO CRIAR CAMPANHA DE EMAIL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendEmailsForCampaign(
    campaignId: string, 
    emails: string[], 
    responses: any[], 
    options: EmailCampaignOptions
  ): Promise<void> {
    console.log(`📤 ENVIANDO EMAILS DA CAMPANHA ${campaignId}...`);

    let successCount = 0;
    let errorCount = 0;

    for (const email of emails) {
      try {
        // Encontrar dados do lead para personalização
        const leadData = this.findLeadDataForEmail(email, responses);
        
        // Personalizar conteúdo
        const personalizedSubject = this.personalizeContent(options.subject, leadData);
        const personalizedContent = this.personalizeContent(options.emailTemplate, leadData);

        // Enviar email via Brevo
        const success = await this.brevoService.sendEmail({
          to: email,
          subject: personalizedSubject,
          htmlContent: personalizedContent
        });

        // Criar log do email
        await this.storage.createEmailLog({
          campaignId,
          email,
          personalizedSubject,
          personalizedContent,
          leadData,
          status: success ? 'sent' : 'failed',
          error: success ? null : 'Falha no envio via Brevo',
          sentAt: success ? new Date() : null
        });

        if (success) {
          successCount++;
          console.log(`✅ EMAIL ENVIADO: ${email}`);
        } else {
          errorCount++;
          console.log(`❌ ERRO AO ENVIAR: ${email}`);
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ ERRO NO EMAIL ${email}:`, error);
        
        // Criar log do erro
        await this.storage.createEmailLog({
          campaignId,
          email,
          personalizedSubject: options.subject,
          personalizedContent: options.emailTemplate,
          leadData: {},
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          sentAt: null
        });
      }
    }

    // Atualizar estatísticas da campanha
    await this.storage.updateEmailCampaignStats(campaignId, {
      sent: successCount,
      delivered: successCount, // Simplificado - delivered = sent por enquanto
      opened: 0,
      clicked: 0
    });

    console.log(`📊 CAMPANHA ${campaignId} FINALIZADA: ${successCount} enviados, ${errorCount} erros`);
  }

  private extractEmailsFromResponses(responses: any[]): string[] {
    const emails: string[] = [];
    
    responses.forEach(response => {
      if (response.responses && Array.isArray(response.responses)) {
        response.responses.forEach((item: any) => {
          if (item.elementFieldId && item.elementFieldId.includes('email') && item.answer) {
            const email = item.answer;
            if (email && typeof email === 'string' && email.includes('@')) {
              emails.push(email);
            }
          }
        });
      }
    });
    
    // Remover duplicatas
    return Array.from(new Set(emails));
  }

  private findLeadDataForEmail(email: string, responses: any[]): any {
    const leadData: any = { email };
    
    // Procurar resposta que contém este email
    const matchingResponse = responses.find(response => {
      if (response.responses && Array.isArray(response.responses)) {
        return response.responses.some((item: any) => 
          item.elementFieldId && item.elementFieldId.includes('email') && item.answer === email
        );
      }
      return false;
    });

    if (matchingResponse && matchingResponse.responses) {
      // Extrair todos os dados do lead
      matchingResponse.responses.forEach((item: any) => {
        if (item.elementFieldId && item.answer) {
          const fieldId = item.elementFieldId.replace(/_/g, '');
          
          // Mapear campos conhecidos
          if (fieldId.includes('nome')) leadData.nome = item.answer;
          if (fieldId.includes('idade')) leadData.idade = item.answer;
          if (fieldId.includes('telefone')) leadData.telefone = item.answer;
          if (fieldId.includes('altura')) leadData.altura = item.answer;
          if (fieldId.includes('peso')) leadData.peso = item.answer;
        }
      });
    }

    return leadData;
  }

  private personalizeContent(content: string, leadData: any): string {
    let personalizedContent = content;
    
    // Substituir variáveis conhecidas
    if (leadData.nome) {
      personalizedContent = personalizedContent.replace(/\{nome\}/g, leadData.nome);
      personalizedContent = personalizedContent.replace(/\{NOME\}/g, leadData.nome);
    }
    
    if (leadData.email) {
      personalizedContent = personalizedContent.replace(/\{email\}/g, leadData.email);
      personalizedContent = personalizedContent.replace(/\{EMAIL\}/g, leadData.email);
    }
    
    if (leadData.idade) {
      personalizedContent = personalizedContent.replace(/\{idade\}/g, leadData.idade);
      personalizedContent = personalizedContent.replace(/\{IDADE\}/g, leadData.idade);
    }
    
    if (leadData.telefone) {
      personalizedContent = personalizedContent.replace(/\{telefone\}/g, leadData.telefone);
      personalizedContent = personalizedContent.replace(/\{TELEFONE\}/g, leadData.telefone);
    }
    
    if (leadData.altura) {
      personalizedContent = personalizedContent.replace(/\{altura\}/g, leadData.altura);
      personalizedContent = personalizedContent.replace(/\{ALTURA\}/g, leadData.altura);
    }
    
    if (leadData.peso) {
      personalizedContent = personalizedContent.replace(/\{peso\}/g, leadData.peso);
      personalizedContent = personalizedContent.replace(/\{PESO\}/g, leadData.peso);
    }

    return personalizedContent;
  }
}

// Instância padrão do serviço
const BREVO_API_KEY = process.env.BREVO_API_KEY || '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';
const storage = new SQLiteStorage();
export const emailService = new EmailService(storage, BREVO_API_KEY);
/**
 * 🔥 WHATSAPP BUSINESS API - SISTEMA COMPLETO
 * Implementação da API oficial do WhatsApp Business para envio de mensagens
 * Meta WhatsApp Cloud API + WhatsApp Business API
 */

import fetch from 'node-fetch';

interface WhatsAppBusinessConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  version: string;
  webhookVerifyToken: string;
  webhookUrl: string;
}

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'media';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
  media?: {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    caption?: string;
  };
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
    message_status: string;
  }>;
}

interface MessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  error?: {
    code: number;
    title: string;
    message: string;
  };
}

export class WhatsAppBusinessAPI {
  private config: WhatsAppBusinessConfig;
  private baseUrl: string;

  constructor(config: WhatsAppBusinessConfig) {
    this.config = config;
    this.baseUrl = `https://graph.facebook.com/v${config.version}`;
  }

  /**
   * Enviar mensagem de texto
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResponse> {
    const messageData: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'text',
      text: {
        body: message,
        preview_url: true
      }
    };

    return this.sendMessage(messageData);
  }

  /**
   * Enviar mensagem com template
   */
  async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'pt_BR', components?: any[]): Promise<WhatsAppResponse> {
    const messageData: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components || []
      }
    };

    return this.sendMessage(messageData);
  }

  /**
   * Enviar mídia (imagem, vídeo, áudio, documento)
   */
  async sendMediaMessage(to: string, mediaType: 'image' | 'video' | 'audio' | 'document', mediaUrl: string, caption?: string): Promise<WhatsAppResponse> {
    const messageData: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'media',
      media: {
        type: mediaType,
        url: mediaUrl,
        caption: caption
      }
    };

    return this.sendMessage(messageData);
  }

  /**
   * Método base para enviar mensagens
   */
  private async sendMessage(messageData: WhatsAppMessage): Promise<WhatsAppResponse> {
    const url = `${this.baseUrl}/${this.config.phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        ...messageData
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json() as Promise<WhatsAppResponse>;
  }

  /**
   * Verificar status de mensagem
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    const url = `${this.baseUrl}/${messageId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get message status: ${response.statusText}`);
    }

    return response.json() as Promise<MessageStatus>;
  }

  /**
   * Obter número de telefone formatado
   */
  private formatPhoneNumber(phone: string): string {
    // Remove caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adiciona código do país se não estiver presente
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      cleaned = '55' + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = '5511' + cleaned;
    }

    return cleaned;
  }

  /**
   * Verificar se o número é válido no WhatsApp
   */
  async validatePhoneNumber(phone: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const url = `${this.baseUrl}/${this.config.phoneNumberId}/messages`;
      
      // Enviar uma mensagem de teste (template de validação)
      const testMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao validar número:', error);
      return false;
    }
  }

  /**
   * Obter templates disponíveis
   */
  async getMessageTemplates(): Promise<any[]> {
    const url = `${this.baseUrl}/${this.config.businessAccountId}/message_templates`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get templates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Criar template personalizado
   */
  async createMessageTemplate(name: string, category: string, language: string, components: any[]): Promise<any> {
    const url = `${this.baseUrl}/${this.config.businessAccountId}/message_templates`;
    
    const templateData = {
      name,
      category,
      language,
      components
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create template: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Webhook para receber atualizações de status
   */
  processWebhook(body: any): MessageStatus[] {
    const statuses: MessageStatus[] = [];
    
    if (body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value.statuses) {
              for (const status of change.value.statuses) {
                statuses.push({
                  id: status.id,
                  status: status.status,
                  timestamp: status.timestamp,
                  error: status.errors ? status.errors[0] : undefined
                });
              }
            }
          }
        }
      }
    }

    return statuses;
  }

  /**
   * Verificar token do webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Obter informações da conta
   */
  async getBusinessInfo(): Promise<any> {
    const url = `${this.baseUrl}/${this.config.businessAccountId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get business info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obter informações do número de telefone
   */
  async getPhoneNumberInfo(): Promise<any> {
    const url = `${this.baseUrl}/${this.config.phoneNumberId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get phone number info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Testar conexão com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getPhoneNumberInfo();
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }
}

export default WhatsAppBusinessAPI;
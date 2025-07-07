import { Twilio } from 'twilio';

interface SmsParams {
  to: string;
  body: string;
  from?: string;
}

interface BulkSmsParams {
  recipients: string[];
  body: string;
  from?: string;
}

interface SmsResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  to: string;
}

// Initialize Twilio client
let twilioClient: Twilio | null = null;

function getTwilioClient(): Twilio | null {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured');
      return null;
    }
    
    try {
      twilioClient = new Twilio(accountSid, authToken);
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
      return null;
    }
  }
  
  return twilioClient;
}

export async function sendSms(params: SmsParams): Promise<SmsResult> {
  const client = getTwilioClient();
  if (!client) {
    return {
      success: false,
      error: 'Twilio client not configured',
      to: params.to
    };
  }

  const fromNumber = params.from || process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    return {
      success: false,
      error: 'Twilio phone number not configured',
      to: params.to
    };
  }

  try {
    const message = await client.messages.create({
      body: params.body,
      from: fromNumber,
      to: params.to
    });

    return {
      success: true,
      messageSid: message.sid,
      to: params.to
    };
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
      to: params.to
    };
  }
}

export async function sendBulkSms(params: BulkSmsParams): Promise<SmsResult[]> {
  const client = getTwilioClient();
  if (!client) {
    return params.recipients.map(to => ({
      success: false,
      error: 'Twilio client not configured',
      to
    }));
  }

  const fromNumber = params.from || process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    return params.recipients.map(to => ({
      success: false,
      error: 'Twilio phone number not configured',
      to
    }));
  }

  const results: SmsResult[] = [];
  
  // Send messages in parallel with some rate limiting
  const chunks = chunkArray(params.recipients, 10); // Process 10 at a time
  
  for (const chunk of chunks) {
    const promises = chunk.map(async (to) => {
      try {
        const message = await client.messages.create({
          body: params.body,
          from: fromNumber,
          to: to
        });

        return {
          success: true,
          messageSid: message.sid,
          to
        };
      } catch (error: any) {
        console.error(`Failed to send SMS to ${to}:`, error);
        return {
          success: false,
          error: error.message || 'Failed to send SMS',
          to
        };
      }
    });

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
    
    // Small delay between chunks to respect rate limits
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export function isTwilioConfigured(): boolean {
  return !!(process.env.TWILIO_ACCOUNT_SID && 
           process.env.TWILIO_AUTH_TOKEN && 
           process.env.TWILIO_PHONE_NUMBER);
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic international phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  // Clean and format phone number for Twilio
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    // For Brazilian numbers, add +55 if it's 11 digits
    if (cleaned.length === 11 && cleaned.startsWith('5')) {
      cleaned = '+55' + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = '+55' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
}

// Helper function to chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Template variable replacement
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

// Default SMS templates
export const defaultSmsTemplates = {
  welcome: {
    name: 'Boas-vindas',
    content: 'Olá {{nome}}! Obrigado por participar do nosso quiz. Sua resposta foi registrada com sucesso!',
    category: 'welcome',
    variables: ['nome']
  },
  follow_up: {
    name: 'Follow-up',
    content: 'Oi {{nome}}! Vimos que você se interessou por {{produto}}. Que tal conversar sobre como podemos te ajudar?',
    category: 'follow_up',
    variables: ['nome', 'produto']
  },
  promotion: {
    name: 'Promoção',
    content: '🔥 OFERTA ESPECIAL para você {{nome}}! {{desconto}}% de desconto válido até {{data_limite}}. Não perca!',
    category: 'promotion',
    variables: ['nome', 'desconto', 'data_limite']
  },
  reminder: {
    name: 'Lembrete',
    content: 'Oi {{nome}}! Você ainda tem interesse em {{produto}}? Nossa oferta especial termina em breve!',
    category: 'reminder',
    variables: ['nome', 'produto']
  }
};
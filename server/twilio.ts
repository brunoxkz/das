import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACaa795b9b75f0821fc406b3396f797563';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'c0151d44e86da2319fbbe8f33b7426bd';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+12344373337';

console.log('🔧 Twilio configurado:', {
  accountSid: accountSid.substring(0, 10) + '...',
  authToken: authToken.substring(0, 10) + '...',
  twilioPhoneNumber
});

export const twilioClient = twilio(accountSid, authToken);

export interface SmsMessage {
  to: string;
  message: string;
}

export async function sendSms(to: string, message: string): Promise<boolean> {
  try {
    const formattedNumber = formatPhoneNumber(to);
    console.log(`📱 Enviando SMS: ${to} -> ${formattedNumber}`);

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber
    });

    console.log(`✅ SMS enviado com sucesso! SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar SMS:', error);
    return false;
  }
}

export async function sendBulkSms(messages: SmsMessage[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const { to, message } of messages) {
    const sent = await sendSms(to, message);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { success, failed };
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  console.log(`🔄 Formatando número: "${phone}" -> "${cleaned}"`);
  
  // Se já tem + no início, retorna como está
  if (phone.startsWith('+')) {
    console.log(`📱 Número já formatado: ${phone}`);
    return phone;
  }
  
  // Estados Unidos (+1) - 11 dígitos começando com 1
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número EUA: ${formatted}`);
    return formatted;
  }
  
  // Argentina (+54) - números começando com 54
  if (cleaned.startsWith('54') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Argentina: ${formatted}`);
    return formatted;
  }
  
  // México (+52) - números começando com 52
  if (cleaned.startsWith('52') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número México: ${formatted}`);
    return formatted;
  }
  
  // Portugal (+351) - números começando com 351
  if (cleaned.startsWith('351') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Portugal: ${formatted}`);
    return formatted;
  }
  
  // Espanha (+34) - números começando com 34
  if (cleaned.startsWith('34') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Espanha: ${formatted}`);
    return formatted;
  }
  
  // França (+33) - números começando com 33
  if (cleaned.startsWith('33') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número França: ${formatted}`);
    return formatted;
  }
  
  // Itália (+39) - números começando com 39
  if (cleaned.startsWith('39') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Itália: ${formatted}`);
    return formatted;
  }
  
  // Reino Unido (+44) - números começando com 44
  if (cleaned.startsWith('44') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Reino Unido: ${formatted}`);
    return formatted;
  }
  
  // Alemanha (+49) - números começando com 49
  if (cleaned.startsWith('49') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Alemanha: ${formatted}`);
    return formatted;
  }
  
  // Já tem código do país Brasil (+5511995133932)
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número com código do país Brasil: ${formatted}`);
    return formatted;
  }
  
  // Número brasileiro com 11 dígitos (ex: 11995133932)
  if (cleaned.length === 11 && (cleaned.startsWith('1') || cleaned.startsWith('2') || cleaned.startsWith('8') || cleaned.startsWith('9'))) {
    const formatted = `+55${cleaned}`;
    console.log(`📱 Número brasileiro 11 dígitos: ${formatted}`);
    return formatted;
  }
  
  // Número brasileiro com 10 dígitos (ex: 1195133932) - adiciona 9
  if (cleaned.length === 10 && (cleaned.startsWith('1') || cleaned.startsWith('2') || cleaned.startsWith('8'))) {
    const formatted = `+55${cleaned.substring(0, 2)}9${cleaned.substring(2)}`;
    console.log(`📱 Número brasileiro 10 dígitos (adicionando 9): ${formatted}`);
    return formatted;
  }
  
  // Caso padrão: assume Brasil se não tiver código
  const formatted = `+55${cleaned}`;
  console.log(`📱 Caso padrão (assumindo Brasil): ${formatted}`);
  return formatted;
}

// Função com interface compatível para o sistema de campanhas
export default {
  async sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const success = await sendSms(phoneNumber, message);
      return { success };
    } catch (error) {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }
};
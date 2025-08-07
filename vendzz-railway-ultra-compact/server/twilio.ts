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

  // China (+86) - números começando com 86
  if (cleaned.startsWith('86') && cleaned.length >= 13) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número China: ${formatted}`);
    return formatted;
  }

  // Japão (+81) - números começando com 81
  if (cleaned.startsWith('81') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Japão: ${formatted}`);
    return formatted;
  }

  // Índia (+91) - números começando com 91
  if (cleaned.startsWith('91') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Índia: ${formatted}`);
    return formatted;
  }

  // Rússia (+7) - números começando com 7
  if (cleaned.startsWith('7') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Rússia: ${formatted}`);
    return formatted;
  }

  // Austrália (+61) - números começando com 61
  if (cleaned.startsWith('61') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Austrália: ${formatted}`);
    return formatted;
  }

  // Coreia do Sul (+82) - números começando com 82
  if (cleaned.startsWith('82') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Coreia do Sul: ${formatted}`);
    return formatted;
  }

  // Singapura (+65) - números começando com 65
  if (cleaned.startsWith('65') && cleaned.length >= 10) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Singapura: ${formatted}`);
    return formatted;
  }

  // Tailândia (+66) - números começando com 66
  if (cleaned.startsWith('66') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Tailândia: ${formatted}`);
    return formatted;
  }

  // Vietnã (+84) - números começando com 84
  if (cleaned.startsWith('84') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Vietnã: ${formatted}`);
    return formatted;
  }

  // Malásia (+60) - números começando com 60
  if (cleaned.startsWith('60') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Malásia: ${formatted}`);
    return formatted;
  }

  // Filipinas (+63) - números começando com 63
  if (cleaned.startsWith('63') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Filipinas: ${formatted}`);
    return formatted;
  }

  // Indonésia (+62) - números começando com 62
  if (cleaned.startsWith('62') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Indonésia: ${formatted}`);
    return formatted;
  }

  // Turquia (+90) - números começando com 90
  if (cleaned.startsWith('90') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Turquia: ${formatted}`);
    return formatted;
  }

  // Irã (+98) - números começando com 98
  if (cleaned.startsWith('98') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Irã: ${formatted}`);
    return formatted;
  }

  // África do Sul (+27) - números começando com 27
  if (cleaned.startsWith('27') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número África do Sul: ${formatted}`);
    return formatted;
  }

  // Egito (+20) - números começando com 20
  if (cleaned.startsWith('20') && cleaned.length >= 11) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Egito: ${formatted}`);
    return formatted;
  }

  // Nigéria (+234) - números começando com 234
  if (cleaned.startsWith('234') && cleaned.length >= 13) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Nigéria: ${formatted}`);
    return formatted;
  }

  // Quênia (+254) - números começando com 254
  if (cleaned.startsWith('254') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Quênia: ${formatted}`);
    return formatted;
  }

  // Marrocos (+212) - números começando com 212
  if (cleaned.startsWith('212') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Marrocos: ${formatted}`);
    return formatted;
  }

  // Israel (+972) - números começando com 972
  if (cleaned.startsWith('972') && cleaned.length >= 12) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número Israel: ${formatted}`);
    return formatted;
  }
  
  // Já tem código do país Brasil (+5511995133932)
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const formatted = `+${cleaned}`;
    console.log(`📱 Número com código do país Brasil: ${formatted}`);
    return formatted;
  }
  
  // Número brasileiro com 11 dígitos (ex: 11995133932)
  // Verificar se é realmente brasileiro usando DDDs válidos
  if (cleaned.length === 11) {
    const ddd = cleaned.substring(0, 2);
    const validDDDs = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
    
    if (validDDDs.includes(ddd)) {
      const formatted = `+55${cleaned}`;
      console.log(`📱 Número brasileiro 11 dígitos - DDD válido ${ddd}: ${formatted}`);
      return formatted;
    } else {
      console.log(`📱 Número 11 dígitos com DDD inválido: ${ddd}, passando para detecção internacional`);
    }
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
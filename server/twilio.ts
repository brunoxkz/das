import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Twilio credentials missing:', {
    accountSid: !!accountSid,
    authToken: !!authToken,
    twilioPhoneNumber: !!twilioPhoneNumber
  });
}

export const twilioClient = twilio(accountSid, authToken);

export interface SmsMessage {
  to: string;
  message: string;
}

export async function sendSms(to: string, message: string): Promise<boolean> {
  try {
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('SMS sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
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
  
  // If it doesn't start with country code, assume Brazil (+55)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Already has Brazil country code without +55
    return `+55${cleaned}`;
  } else if (cleaned.length === 10 || cleaned.length === 11) {
    // Brazilian number without country code
    return `+55${cleaned}`;
  } else if (cleaned.startsWith('55') && cleaned.length === 13) {
    // Already has Brazil country code
    return `+${cleaned}`;
  }
  
  // Return as is if it already looks formatted
  return phone.startsWith('+') ? phone : `+${cleaned}`;
}